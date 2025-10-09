import { getAllParticipants, updateParticipant } from '../../lib/leaderboardDB';
import { fetchProfileData } from '../../lib/profileParser';
import { updateStatus } from './update-status';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if update is already running
    if (updateStatus.isRunning) {
      return res.status(200).json({
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

    // Immediately return response to avoid timeout
    res.status(200).json({
      success: true,
      message: 'Background update service started',
      timestamp: new Date().toISOString(),
      status: 'starting'
    });

    // Run background update process (don't await)
    setImmediate(() => {
      runBackgroundUpdate().catch(error => {
        console.error('❌ Background update failed:', error);
        updateStatus.isRunning = false;
      });
    });

  } catch (error) {
    console.error('Error starting update service:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to start update service',
      message: error.message 
    });
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

    // Fetch fresh profile data
    const freshProfileData = await fetchProfileData(participant.profileUrl);
    
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
    throw new Error(`Failed to update ${participant.name}: ${error.message}`);
  }
}
