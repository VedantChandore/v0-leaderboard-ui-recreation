import { NextRequest, NextResponse } from 'next/server';
import { getAllParticipants, updateParticipant } from '../../../lib/leaderboardDB';
import { fetchProfileData } from '../../../lib/profileParser';

// Simple in-memory status tracking
let updateStatus = {
  isRunning: false,
  lastUpdate: null,
  totalParticipants: 0,
  completed: 0,
  errors: 0,
  startTime: null
};

export async function POST(request) {
  try {
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

    // Run background update process (don't await)
    setImmediate(() => {
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

export async function GET(request) {
  // Return current status for GET requests
  try {
    const participants = await getAllParticipants();
    
    return NextResponse.json({
      success: true,
      status: updateStatus,
      participantCount: participants.length,
      lastUpdated: participants.length > 0 ? participants[0].updatedAt : null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting update status:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get status',
      message: error.message 
    }, { status: 500 });
  }
}

/**
 * Background service that updates all participants in parallel
 */
async function runBackgroundUpdate() {
  console.log('🚀 Starting background update service...');
  const startTime = Date.now();

  // Update status
  updateStatus.isRunning = true;
  updateStatus.startTime = new Date().toISOString();
  updateStatus.completed = 0;
  updateStatus.errors = 0;

  try {
    // Get all participants from database
    console.log('📊 Fetching all participants from database...');
    const participants = await getAllParticipants();
    console.log(`👥 Found ${participants.length} participants to update`);

    updateStatus.totalParticipants = participants.length;

    if (participants.length === 0) {
      console.log('📭 No participants found, update complete');
      updateStatus.isRunning = false;
      return;
    }

    // Create parallel update promises with concurrency control
    const BATCH_SIZE = 5; // Process 5 participants at a time to avoid overwhelming the API
    const batches = [];
    
    for (let i = 0; i < participants.length; i += BATCH_SIZE) {
      batches.push(participants.slice(i, i + BATCH_SIZE));
    }

    console.log(`⚡ Processing ${batches.length} batches of ${BATCH_SIZE} participants each...`);

    // Process batches sequentially, but participants within each batch in parallel
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`🔄 Processing batch ${batchIndex + 1}/${batches.length}...`);

      const batchPromises = batch.map((participant, index) =>
        updateParticipantData(participant, (batchIndex * BATCH_SIZE) + index + 1)
          .then(result => {
            updateStatus.completed++;
            return result;
          })
          .catch(error => {
            updateStatus.errors++;
            throw error;
          })
      );

      // Wait for current batch to complete before starting next
      await Promise.allSettled(batchPromises);
      
      // Small delay between batches to be respectful to the API
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    updateStatus.lastUpdate = new Date().toISOString();
    updateStatus.isRunning = false;

    console.log('✅ Background update completed!');
    console.log(`📈 Results: ${updateStatus.completed}/${participants.length} successful, ${updateStatus.errors} errors`);
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

    // Add retry logic for failed requests
    let freshProfileData;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        // Fetch fresh profile data with timeout
        const fetchPromise = fetchProfileData(participant.profileUrl);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 30000)
        );
        
        freshProfileData = await Promise.race([fetchPromise, timeoutPromise]);
        break; // Success, exit retry loop
        
      } catch (error) {
        retryCount++;
        console.log(`⚠️ [${index}] Attempt ${retryCount}/${maxRetries} failed for ${participant.name}: ${error.message}`);
        
        if (retryCount >= maxRetries) {
          throw error; // Final attempt failed
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
    
    // Check if data has changed
    const hasChanges = (
      freshProfileData.badgesEarned !== participant.badgesEarned ||
      freshProfileData.labsCompleted !== participant.labsCompleted ||
      freshProfileData.tier !== participant.tier ||
      freshProfileData.league !== participant.league
    );

    if (!hasChanges) {
      console.log(`✅ [${index}] ${participant.name} - No changes detected`);
      return { status: 'no-changes', participant: participant.name };
    }

    // Prepare update data
    const updateData = {
      badgesEarned: freshProfileData.badgesEarned,
      labsCompleted: freshProfileData.labsCompleted,
      tier: freshProfileData.tier,
      league: freshProfileData.league,
      rankingScore: freshProfileData.rankingScore,
      memberSince: freshProfileData.memberSince,
      avatar: freshProfileData.avatar
    };

    // Update participant in database
    await updateParticipant(participant.id, updateData);

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log(`✅ [${index}] ${participant.name} updated successfully in ${duration}s`);
    console.log(`   📊 Badges: ${participant.badgesEarned} → ${freshProfileData.badgesEarned}`);
    console.log(`   🧪 Labs: ${participant.labsCompleted} → ${freshProfileData.labsCompleted}`);
    console.log(`   🏆 Tier: ${participant.tier} → ${freshProfileData.tier}`);

    return {
      status: 'updated',
      participant: participant.name,
      changes: {
        badges: { old: participant.badgesEarned, new: freshProfileData.badgesEarned },
        labs: { old: participant.labsCompleted, new: freshProfileData.labsCompleted },
        tier: { old: participant.tier, new: freshProfileData.tier }
      },
      duration
    };

  } catch (error) {
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.error(`❌ [${index}] Failed to update ${participant.name} after ${duration}s:`, error.message);
    
    // Don't throw the error, just return failure status to continue with other participants
    return {
      status: 'failed',
      participant: participant.name,
      error: error.message,
      duration
    };
  }
}
