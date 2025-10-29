import { NextRequest, NextResponse } from 'next/server';

// Add error handling for imports
let getAllParticipants, updateParticipant, fetchProfileData, deleteParticipant;

try {
  const leaderboardDB = await import('../../../lib/leaderboardDB');
  getAllParticipants = leaderboardDB.getAllParticipants;
  updateParticipant = leaderboardDB.updateParticipant;
  deleteParticipant = leaderboardDB.deleteParticipant; // Add delete function
  
  const profileParser = await import('../../../lib/profileParser');
  fetchProfileData = profileParser.fetchProfileData;
} catch (error) {
  console.error('Failed to import required modules:', error);
}

// Simple in-memory status tracking
let updateStatus = {
  isRunning: false,
  lastUpdate: null,
  totalParticipants: 0,
  completed: 0,
  errors: 0,
  startTime: null,
  duplicatesRemoved: 0 // Track removed duplicates
};

// Keep POST for backwards compatibility
export async function GET(request) {
  try {
    // Check if required functions are available
    if (!getAllParticipants || !updateParticipant || !fetchProfileData) {
      throw new Error('Required database or profile functions are not available');
    }

    // Check if update is already running
    if (updateStatus.isRunning) {
      return NextResponse.json({
        success: true,
        message: 'Update service is already running',
        timestamp: new Date().toISOString(),
        status: 'already-running',
        progress: {
          total: updateStatus.totalParticipants,
          completed: updateStatus.completed,
          errors: updateStatus.errors,
          startTime: updateStatus.startTime
        }
      }); 
    }

    // Run background update process
    Promise.resolve().then(() => {
      runBackgroundUpdate().catch(error => {
        console.error('❌ Background update failed:', error);
        updateStatus.isRunning = false;
      });
    });

    // Immediately return response to avoid timeout
    return NextResponse.json({
      success: true,
      message: 'Background update service started',
      timestamp: new Date().toISOString(),
      status: 'starting'
    });

  } catch (error) {
    console.error('Error starting update service:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to start update service',
      message: error.message 
    }, { status: 500 });
  }
}

/**
 * Find and remove duplicate participants with exact same names, keeping the one with highest points and badges
 */
async function removeDuplicateParticipants() {
  console.log('🔍 Checking for duplicate participants...');
  
  if (!getAllParticipants || !deleteParticipant) {
    console.log('⚠️ Required functions not available for duplicate removal');
    return;
  }
  
  try {
    const participants = await getAllParticipants();
    const nameGroups = new Map();
    const unknownUsers = [];
    
    // Group participants by exact name and handle Unknown Users separately
    for (const participant of participants) {
      const name = participant.name.trim();
      
      // Handle "Unknown User" separately
      if (name.toLowerCase() === 'unknown user') {
        unknownUsers.push(participant);
        continue;
      }
      
      if (!nameGroups.has(name)) {
        nameGroups.set(name, []);
      }
      nameGroups.get(name).push(participant);
    }
    
    // Handle Unknown Users - group by badges and points
    if (unknownUsers.length > 1) {
      console.log(`🔍 Found ${unknownUsers.length} Unknown Users, checking for identical stats...`);
      
      const unknownGroups = new Map();
      for (const user of unknownUsers) {
        const key = `${user.badgesEarned || 0}-${user.points || 0}`;
        if (!unknownGroups.has(key)) {
          unknownGroups.set(key, []);
        }
        unknownGroups.get(key).push(user);
      }
      
      // Remove duplicates with same badges and points, keep one
      for (const [key, group] of unknownGroups) {
        if (group.length > 1) {
          console.log(`\n👥 Processing Unknown User duplicates with same stats (${group.length} participants):`);
          group.forEach(p => console.log(`   - ${p.name} (Points: ${p.points || 0}, Badges: ${p.badgesEarned || 0})`));
          
          // Keep the first one, remove the rest
          const toRemove = group.slice(1);
          for (const participant of toRemove) {
            try {
              await deleteParticipant(participant.id);
              updateStatus.duplicatesRemoved++;
              console.log(`🗑️ Removed duplicate Unknown User: (ID: ${participant.id}, Points: ${participant.points || 0}, Badges: ${participant.badgesEarned || 0})`);
            } catch (error) {
              console.error(`❌ Failed to remove Unknown User:`, error.message);
            }
          }
        }
      }
    }
    
    // Find groups with duplicates for named participants
    const duplicateGroups = Array.from(nameGroups.values()).filter(group => group.length > 1);
    
    if (duplicateGroups.length === 0) {
      console.log('✅ No duplicate named participants found');
    } else {
      console.log(`🔍 Found ${duplicateGroups.length} groups of duplicate named participants`);
      
      // Process each group of duplicates
      for (const group of duplicateGroups) {
        console.log(`\n👥 Processing duplicate group (${group.length} participants):`);
        group.forEach(p => console.log(`   - ${p.name} (Points: ${p.points || 0}, Badges: ${p.badgesEarned || 0})`));
        
        // Find the participant with highest points and badges
        let bestParticipant = group[0];
        for (const participant of group) {
          const currentScore = (participant.points || 0) + (participant.badgesEarned || 0) * 10;
          const bestScore = (bestParticipant.points || 0) + (bestParticipant.badgesEarned || 0) * 10;
          
          if (currentScore > bestScore) {
            bestParticipant = participant;
          }
        }
        
        console.log(`🏆 Keeping: ${bestParticipant.name} (Points: ${bestParticipant.points || 0}, Badges: ${bestParticipant.badgesEarned || 0})`);
        
        // Remove the duplicates
        const toRemove = group.filter(p => p.id !== bestParticipant.id);
        for (const participant of toRemove) {
          try {
            await deleteParticipant(participant.id);
            updateStatus.duplicatesRemoved++;
            console.log(`🗑️ Removed: ${participant.name} (ID: ${participant.id})`);
          } catch (error) {
            console.error(`❌ Failed to remove ${participant.name}:`, error.message);
          }
        }
      }
    }
    
    console.log(`✅ Duplicate removal complete. Removed ${updateStatus.duplicatesRemoved} duplicates`);
    
  } catch (error) {
    console.error('❌ Error during duplicate removal:', error);
  }
}

/**
 * Background service that updates all participants in parallel
 */
async function runBackgroundUpdate() {
  console.log('🚀 Starting background update service...');
  
  // Check if required functions are available
  if (!getAllParticipants || !updateParticipant) {
    throw new Error('Database functions are not available');
  }
  
  const startTime = Date.now();

  // Update status
  updateStatus.isRunning = true;
  updateStatus.startTime = new Date().toISOString();
  updateStatus.completed = 0;
  updateStatus.errors = 0;
  updateStatus.duplicatesRemoved = 0;

  try {
    // First, remove duplicates
    await removeDuplicateParticipants();
    
    // Get all participants from database (after duplicate removal)
    console.log('📊 Fetching all participants from database...');
    const participants = await getAllParticipants();
    console.log(`👥 Found ${participants.length} participants to update`);

    // updateStatus.totalParticipants = participants.length;

    // if (participants.length === 0) {
    //   console.log('📭 No participants found, update complete');
    //   updateStatus.isRunning = false;
    //   return;
    // }

    // // Reduce batch size for Vercel's serverless environment
    // const BATCH_SIZE = 3; // Smaller batch size for better reliability on Vercel
    // const batches = [];
    
    // for (let i = 0; i < participants.length; i += BATCH_SIZE) {
    //   batches.push(participants.slice(i, i + BATCH_SIZE));
    // }

    // console.log(`⚡ Processing ${batches.length} batches of ${BATCH_SIZE} participants each...`);

    // // Process batches sequentially, but participants within each batch in parallel
    // for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    //   const batch = batches[batchIndex];
    //   console.log(`🔄 Processing batch ${batchIndex + 1}/${batches.length}...`);

    //   const batchPromises = batch.map((participant, index) =>
    //     updateParticipantData(participant, (batchIndex * BATCH_SIZE) + index + 1)
    //       .then(result => {
    //         updateStatus.completed++;
    //         return result;
    //       })
    //       .catch(error => {
    //         updateStatus.errors++;
    //         return { status: 'failed', participant: participant.name, error: error.message };
    //       })
    //   );

    //   // Wait for current batch to complete before starting next
    //   await Promise.allSettled(batchPromises);
      
    //   // Small delay between batches to be respectful to the API and Vercel limits
    //   if (batchIndex < batches.length - 1) {
    //     await new Promise(resolve => setTimeout(resolve, 2000)); // Increased delay for Vercel
    //   }
    // }

    // const endTime = Date.now();
    // const duration = (endTime - startTime) / 1000;

    // updateStatus.lastUpdate = new Date().toISOString();
    // updateStatus.isRunning = false;

    console.log('✅ Background update completed!');
    console.log(`📈 Results: ${updateStatus.completed}/${participants.length} successful, ${updateStatus.errors} errors`);
    console.log(`🗑️ Duplicates removed: ${updateStatus.duplicatesRemoved}`);
    console.log(`⏱️ Total time: ${duration}s`);

  } catch (error) {
    console.error('💥 Critical error in background update:', error);
    updateStatus.isRunning = false;
    updateStatus.errors++;
  }
}

/**
 * Update a single participant's data
 */
async function updateParticipantData(participant, index) {
  const startTime = Date.now();
  
  try {
    console.log(`🔄 [${index}] Updating ${participant.name}...`);

    if (!participant.profileUrl) {
      throw new Error('No profile URL found');
    }

    if (!fetchProfileData) {
      throw new Error('Profile fetch function is not available');
    }

    // Add retry logic for failed requests with shorter timeout for Vercel
    let freshProfileData;
    let retryCount = 0;
    const maxRetries = 2; // Reduced retries for Vercel
    
    while (retryCount < maxRetries) {
      try {
        // Fetch fresh profile data with shorter timeout for Vercel
        const fetchPromise = fetchProfileData(participant.profileUrl);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 15000) // Shorter timeout
        );
        
        freshProfileData = await Promise.race([fetchPromise, timeoutPromise]);
        break; // Success, exit retry loop
        
      } catch (error) {
        retryCount++;
        console.log(`⚠️ [${index}] Attempt ${retryCount}/${maxRetries} failed for ${participant.name}: ${error.message}`);
        
        if (retryCount >= maxRetries) {
          throw error; // Final attempt failed
        }
        
        // Wait before retry (shorter backoff for Vercel)
        await new Promise(resolve => setTimeout(resolve, 500 * retryCount));
      }
    }
    
    // Check if data has changed (include points check)
    const hasChanges = (
      freshProfileData.badgesEarned !== participant.badgesEarned ||
      freshProfileData.labsCompleted !== participant.labsCompleted ||
      freshProfileData.points !== participant.points ||
      freshProfileData.tier !== participant.tier ||
      freshProfileData.league !== participant.league
    );

    if (!hasChanges) {
      console.log(`✅ [${index}] ${participant.name} - No changes detected`);
      return { status: 'no-changes', participant: participant.name };
    }

    // Prepare update data (include points)
    const updateData = {
      badgesEarned: freshProfileData.badgesEarned,
      labsCompleted: freshProfileData.labsCompleted,
      points: freshProfileData.points, // Add points to update
      tier: freshProfileData.tier,
      league: freshProfileData.league,
      rankingScore: freshProfileData.rankingScore,
      memberSince: freshProfileData.memberSince,
      avatar: freshProfileData.avatar
    };

    // Update participant in database
    if (!updateParticipant) {
      throw new Error('Update participant function is not available');
    }
    
    await updateParticipant(participant.id, updateData);

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log(`✅ [${index}] ${participant.name} updated successfully in ${duration}s`);
    console.log(`   📊 Badges: ${participant.badgesEarned} → ${freshProfileData.badgesEarned}`);
    console.log(`   💰 Points: ${participant.points} → ${freshProfileData.points}`);
    console.log(`   🧪 Labs: ${participant.labsCompleted} → ${freshProfileData.labsCompleted}`);
    console.log(`   🏆 Tier: ${participant.tier} → ${freshProfileData.tier}`);

    return {
      status: 'updated',
      participant: participant.name,
      changes: {
        badges: { old: participant.badgesEarned, new: freshProfileData.badgesEarned },
        points: { old: participant.points, new: freshProfileData.points },
        labs: { old: participant.labsCompleted, new: freshProfileData.labsCompleted },
        tier: { old: participant.tier, new: freshProfileData.tier }
      },
      duration
    };

  } catch (error) {
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.error(`❌ [${index}] Failed to update ${participant.name} after ${duration}s:`, error.message);
    
    // Return failure status to continue with other participants
    return {
      status: 'failed',
      participant: participant.name,
      error: error.message,
      duration
    };
  }
}

// Update runtime config for better Vercel compatibility
export const runtime = 'nodejs';
export const maxDuration = 60; // Reduce to 1 minute to avoid timeouts
