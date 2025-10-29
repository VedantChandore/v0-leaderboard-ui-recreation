/**
 * Leaderboard Database Service - Firebase Firestore operations
 */

import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  where,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { leaderboardDB as db } from './firebaseDB.js';

const COLLECTION_NAME = 'test_collection_participants';
// const COLLECTION_NAME = 'test_leaderboard_participants';

/**
 * Add a new participant to the leaderboard
 * @param {object} participantData - Participant data from profile parser
 * @returns {Promise<string>} - Document ID of created participant
 */
export async function addParticipant(participantData) {
  try {
    // Validate required fields
    if (!participantData.name || !participantData.profileUrl) {
      throw new Error('Missing required participant data');
    }

    // Ensure numeric values are properly stored
    const cleanedData = {
      ...participantData,
      badgesEarned: parseInt(participantData.badgesEarned) || 0,
      labsCompleted: parseInt(participantData.labsCompleted) || 0,
      points: parseInt(participantData.points) || 0, // ADD POINTS
      rankingScore: parseInt(participantData.rankingScore) || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    console.log('💾 Storing participant data:', cleanedData);

    const docRef = await addDoc(collection(db, COLLECTION_NAME), cleanedData);
    
    console.log('✅ Participant added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding participant:', error);
    if (error.code === 'permission-denied') {
      throw new Error('Database access denied. Please check Firestore rules.');
    }
    if (error.code === 'unavailable') {
      throw new Error('Database temporarily unavailable. Please try again.');
    }
    throw error;
  }
}

/**
 * Get all participants from the leaderboard
 * @returns {Promise<Array>} - Array of participant objects with IDs
 */
export async function getAllParticipants() {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('badgesEarned', 'desc'),
      orderBy('labsCompleted', 'desc'),
      orderBy('name', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const participants = [];
    
    querySnapshot.forEach((doc) => {
      participants.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return participants;
  } catch (error) {
    console.error('Error getting participants:', error);
    throw error;
  }
}

/**
 * Extract profile ID from Google Cloud Skills Boost URL
 * @param {string} profileUrl - The profile URL
 * @returns {string|null} - The profile ID or null if invalid
 */
function extractProfileId(profileUrl) {
  try {
    const regex = /\/public_profiles\/([a-zA-Z0-9-]+)/;
    const match = profileUrl.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting profile ID:', error);
    return null;
  }
}

/**
 * Check if a participant already exists by profile ID (handles both URL formats)
 * @param {string} profileUrl - Google Cloud Skills Boost profile URL
 * @returns {Promise<object|null>} - Participant data if exists, null otherwise
 */
export async function getExistingParticipant(profileUrl) {
  try {
    const profileId = extractProfileId(profileUrl);
    if (!profileId) {
      console.warn('Could not extract profile ID from URL:', profileUrl);
      return null;
    }

    // Get all participants and check for profile ID matches
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const existingProfileId = extractProfileId(data.profileUrl || '');
      
      if (existingProfileId === profileId) {
        console.log('🔍 Found existing participant with same profile ID:', {
          existingUrl: data.profileUrl,
          newUrl: profileUrl,
          profileId: profileId
        });
        return {
          id: doc.id,
          ...data
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error checking participant existence:', error);
    throw error;
  }
}

/**
 * Check if a participant already exists by profile ID (handles both URL formats)
 * @param {string} profileUrl - Google Cloud Skills Boost profile URL
 * @returns {Promise<boolean>} - True if participant exists
 */
export async function participantExists(profileUrl) {
  try {
    const participant = await getExistingParticipant(profileUrl);
    return participant !== null;
  } catch (error) {
    console.error('Error checking participant existence:', error);
    throw error;
  }
}

/**
 * Clean up duplicate participants (same profile ID, different URLs)
 * @returns {Promise<number>} - Number of duplicates removed
 */
export async function cleanupDuplicateParticipants() {
  try {
    console.log('🧹 Starting duplicate cleanup...');
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const participants = [];
    
    // Collect all participants with their profile IDs
    querySnapshot.forEach(doc => {
      const data = doc.data();
      const profileId = extractProfileId(data.profileUrl || '');
      if (profileId) {
        participants.push({
          id: doc.id,
          profileId,
          data,
          createdAt: data.createdAt?.toDate() || new Date(0)
        });
      }
    });
    
    // Group by profile ID
    const groupedByProfileId = {};
    participants.forEach(participant => {
      if (!groupedByProfileId[participant.profileId]) {
        groupedByProfileId[participant.profileId] = [];
      }
      groupedByProfileId[participant.profileId].push(participant);
    });
    
    let duplicatesRemoved = 0;
    
    // For each profile ID with multiple entries, keep the most recent one
    for (const [profileId, duplicates] of Object.entries(groupedByProfileId)) {
      if (duplicates.length > 1) {
        console.log(`🔍 Found ${duplicates.length} duplicates for profile ID: ${profileId}`);
        
        // Sort by creation date (most recent first)
        duplicates.sort((a, b) => b.createdAt - a.createdAt);
        
        // Keep the first (most recent), delete the rest
        const toKeep = duplicates[0];
        const toDelete = duplicates.slice(1);
        
        console.log(`✅ Keeping most recent entry: ${toKeep.data.name} (${toKeep.data.profileUrl})`);
        
        for (const duplicate of toDelete) {
          console.log(`🗑️ Removing duplicate: ${duplicate.data.name} (${duplicate.data.profileUrl})`);
          await deleteDoc(doc(db, COLLECTION_NAME, duplicate.id));
          duplicatesRemoved++;
        }
      }
    }
    
    console.log(`✅ Cleanup complete. Removed ${duplicatesRemoved} duplicate entries.`);
    return duplicatesRemoved;
  } catch (error) {
    console.error('Error cleaning up duplicates:', error);
    throw error;
  }
}

/**
 * Update participant data (for profile updates)
 * @param {string} participantId - Document ID
 * @param {object} updateData - Data to update
 * @returns {Promise<void>}
 */
export async function updateParticipant(participantId, updateData) {
  try {
    const participantRef = doc(db, COLLECTION_NAME, participantId);
    await updateDoc(participantRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    
    console.log('Participant updated:', participantId);
  } catch (error) {
    console.error('Error updating participant:', error);
    throw error;
  }
}

/**
 * Update existing participant with new progress data
 * @param {object} existingParticipant - Current participant data with ID
 * @param {object} newProgressData - New progress data from profile parser
 * @returns {Promise<object>} - Updated participant data with progress info
 */
export async function updateParticipantProgress(existingParticipant, newProgressData) {
  try {
    console.log('📈 Updating participant progress:', {
      id: existingParticipant.id,
      name: existingParticipant.name,
      oldBadges: existingParticipant.badgesEarned,
      newBadges: newProgressData.badgesEarned,
      oldPoints: existingParticipant.points,
      newPoints: newProgressData.points
    });

    // Validate inputs
    if (!existingParticipant.id) {
      throw new Error('Missing participant ID');
    }
    if (!newProgressData) {
      throw new Error('Missing new progress data');
    }

    // Calculate progress differences
    const oldBadges = parseInt(existingParticipant.badgesEarned) || 0;
    const newBadges = parseInt(newProgressData.badgesEarned) || 0;
    const oldPoints = parseInt(existingParticipant.points) || 0;
    const newPoints = parseInt(newProgressData.points) || 0;
    const oldLabs = parseInt(existingParticipant.labsCompleted) || 0;
    const newLabs = parseInt(newProgressData.labsCompleted) || 0;

    const progressInfo = {
      badgeProgress: newBadges - oldBadges,
      pointProgress: newPoints - oldPoints,
      labProgress: newLabs - oldLabs,
      hasProgress: (newBadges > oldBadges) || (newPoints > oldPoints) || (newLabs > oldLabs)
    };

    // Prepare update data with cleaned numeric values
    const updateData = {
      ...newProgressData,
      badgesEarned: newBadges,
      labsCompleted: newLabs,
      points: newPoints,
      rankingScore: newBadges * 1000 + newPoints * 10 + newLabs,
      lastProgressUpdate: serverTimestamp()
    };

    // Only add progress history if there's actual progress
    if (progressInfo.hasProgress) {
      const currentHistory = existingParticipant.progressHistory || [];
      updateData.progressHistory = [
        ...currentHistory,
        {
          date: new Date().toISOString(), // Use regular date instead of serverTimestamp
          badgeProgress: progressInfo.badgeProgress,
          pointProgress: progressInfo.pointProgress,
          labProgress: progressInfo.labProgress,
          totalBadges: newBadges,
          totalPoints: newPoints,
          totalLabs: newLabs
        }
      ].slice(-30); // Keep last 30 updates
    }

    // Update the participant in Firestore
    await updateParticipant(existingParticipant.id, updateData);
    
    console.log('✅ Participant progress updated successfully');
    
    return {
      ...existingParticipant,
      ...updateData,
      progressInfo
    };
  } catch (error) {
    console.error('Error updating participant progress:', error);
    throw error;
  }
}

/**
 * Delete a participant from the leaderboard
 * @param {string} participantId - Document ID
 * @returns {Promise<void>}
 */
export async function deleteParticipant(participantId) {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, participantId));
    console.log('Participant deleted:', participantId);
  } catch (error) {
    console.error('Error deleting participant:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time leaderboard updates
 * @param {function} callback - Function to call when data changes
 * @returns {function} - Unsubscribe function
 */
/**
 * Real-time leaderboard subscription with automatic ranking
 */
export function subscribeToLeaderboard(callback) {
  console.log('🔥 Setting up real-time leaderboard subscription...');
  
  try {
    const leaderboardRef = collection(db, COLLECTION_NAME);
    
    return onSnapshot(
      leaderboardRef,
      (snapshot) => {
        console.log('📊 Real-time update received!');
        console.log('📈 Documents in collection:', snapshot.size);
        
        const participants = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          console.log('👤 Participant data:', {
            id: doc.id,
            name: data.name,
            badges: data.badgesEarned,
            labs: data.labsCompleted,
            tier: data.tier
          });
          
          participants.push({
            id: doc.id,
            ...data,
            // Ensure required fields have defaults
            badgesEarned: data.badgesEarned || 0,
            labsCompleted: data.labsCompleted || 0,
            name: data.name || 'Unknown',
            tier: data.tier || 'Newcomer'
          });
        });
        
        // Real-time ranking calculation
        const rankedParticipants = calculateRealTimeRanking(participants);
        
        console.log('🏆 Final ranked leaderboard:', rankedParticipants.map(p => ({
          place: p.place,
          name: p.name,
          badges: p.badgesEarned,
          tier: p.tier
        })));
        
        // Trigger callback with ranked data
        callback(rankedParticipants);
      },
      (error) => {
        console.error('❌ Real-time subscription error:', error);
        
        if (error.code === 'permission-denied') {
          console.error('🚫 Permission denied - check Firestore rules');
          console.log('💡 Go to Firebase Console → Firestore → Rules and set to test mode');
        } else if (error.code === 'unavailable') {
          console.error('📡 Database unavailable - check internet connection');
        } else if (error.code === 'not-found') {
          console.error('🔍 Collection not found - will be created on first write');
        }
        
        // Return empty array but keep subscription alive
        callback([]);
      }
    );
  } catch (error) {
    console.error('💥 Failed to create subscription:', error);
    callback([]);
    return () => {}; // Return empty unsubscribe function
  }
}

/**
 * Calculate real-time ranking with proper competitive ranking
 */
function calculateRealTimeRanking(participants) {
  console.log('🏆 Starting real-time ranking calculation...');
  console.log('📊 Input participants:', participants.map(p => ({
    name: p.name,
    badges: p.badgesEarned,
    points: p.points,
    labs: p.labsCompleted,
    tier: p.tier
  })));
  
  // Ensure all participants have correct tier calculation
  const participantsWithCorrectTiers = participants.map(participant => {
    const badges = parseInt(participant.badgesEarned) || 0;
    const points = parseInt(participant.points) || 0;
    const league = participant.league || '';
    
    // Recalculate tier to ensure consistency
    let tier = 'Newcomer';
    
    if (badges >= 15) {
      tier = 'Cloud Pro';
    } else if (badges >= 8) {
      tier = 'Cloud Explorer';  
    } else if (badges >= 3) {
      tier = 'Cloud Beginner';
    } else if (badges > 0) {
      tier = 'Newcomer';
    }
    
    // League-based upgrades
    if (league === 'Diamond' && tier !== 'Cloud Pro') {
      tier = 'Cloud Pro';
    } else if ((league === 'Platinum' || league === 'Gold') && tier === 'Newcomer') {
      tier = 'Cloud Explorer';
    } else if (league === 'Silver' && tier === 'Newcomer') {
      tier = 'Cloud Beginner';
    }
    
    // Points-based upgrades
    if (points >= 1000 && tier !== 'Cloud Pro') {
      tier = 'Cloud Pro';
    } else if (points >= 500 && (tier === 'Newcomer' || tier === 'Cloud Beginner')) {
      tier = 'Cloud Explorer';
    } else if (points >= 150 && tier === 'Newcomer') {
      tier = 'Cloud Beginner';
    }
    
    return {
      ...participant,
      tier: tier,
      badgesEarned: badges,
      labsCompleted: parseInt(participant.labsCompleted) || 0,
      points: points // ENSURE POINTS ARE INCLUDED
    };
  });
  
  // Sort participants by competitive ranking criteria
  const sortedParticipants = participantsWithCorrectTiers.sort((a, b) => {
    const aBadges = parseInt(a.badgesEarned) || 0;
    const bBadges = parseInt(b.badgesEarned) || 0;
    const aPoints = parseInt(a.points) || 0;
    const bPoints = parseInt(b.points) || 0;
    const aLabs = parseInt(a.labsCompleted) || 0;
    const bLabs = parseInt(b.labsCompleted) || 0;
    
    console.log(`🔄 Comparing ${a.name} (${aBadges} badges, ${aPoints} points, ${aLabs} labs) vs ${b.name} (${bBadges} badges, ${bPoints} points, ${bLabs} labs)`);
    
    // Primary: Badges earned (higher is better)
    if (bBadges !== aBadges) {
      const result = bBadges - aBadges;
      console.log(`  🎖️ Badge comparison: ${bBadges} - ${aBadges} = ${result}`);
      return result;
    }
    
    // Secondary: Points earned (higher is better)  
    if (bPoints !== aPoints) {
      const result = bPoints - aPoints;
      console.log(`  📊 Points comparison: ${bPoints} - ${aPoints} = ${result}`);
      return result;
    }
    
    // Tertiary: Labs completed (higher is better)  
    if (bLabs !== aLabs) {
      const result = bLabs - aLabs;
      console.log(`  🧪 Lab comparison: ${bLabs} - ${aLabs} = ${result}`);
      return result;
    }
    
    // Quaternary: Join date (earlier is better)
    if (a.createdAt && b.createdAt) {
      const aTime = a.createdAt.seconds || a.createdAt._seconds || 0;
      const bTime = b.createdAt.seconds || b.createdAt._seconds || 0;
      if (aTime !== bTime) {
        const result = aTime - bTime;
        console.log(`  📅 Time comparison: ${aTime} - ${bTime} = ${result}`);
        return result;
      }
    }
    
    // Final: Alphabetical by name
    const result = (a.name || '').localeCompare(b.name || '');
    console.log(`  📝 Name comparison: ${a.name} vs ${b.name} = ${result}`);
    return result;
  });
  
  // Assign ranks with proper tie handling
  const rankedParticipants = sortedParticipants.map((participant, index) => {
    const rankingScore = (parseInt(participant.badgesEarned) || 0) * 1000 + 
                        (parseInt(participant.points) || 0) * 10 + 
                        (parseInt(participant.labsCompleted) || 0);
    
    return {
      ...participant,
      place: index + 1,
      rankingScore: rankingScore,
      // Ensure numeric values
      badgesEarned: parseInt(participant.badgesEarned) || 0,
      labsCompleted: parseInt(participant.labsCompleted) || 0,
      points: parseInt(participant.points) || 0
    };
  });
  
  console.log('🏁 Final ranking result:', rankedParticipants.map(p => ({
    place: p.place,
    name: p.name,
    badges: p.badgesEarned,
    points: p.points,
    labs: p.labsCompleted,
    tier: p.tier,
    score: p.rankingScore
  })));
  
  return rankedParticipants;
}

/**
 * Get leaderboard statistics
 * @returns {Promise<object>} - Statistics object
 */
export async function getLeaderboardStats() {
  try {
    const participants = await getAllParticipants();
    
    const stats = {
      totalParticipants: participants.length,
      totalBadges: participants.reduce((sum, p) => sum + (p.badgesEarned || 0), 0),
      totalLabs: participants.reduce((sum, p) => sum + (p.labsCompleted || 0), 0),
      tierDistribution: {
        'Cloud Pro': participants.filter(p => p.tier === 'Cloud Pro').length,
        'Cloud Explorer': participants.filter(p => p.tier === 'Cloud Explorer').length,
        'Cloud Beginner': participants.filter(p => p.tier === 'Cloud Beginner').length,
        'Newcomer': participants.filter(p => p.tier === 'Newcomer').length
      }
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting leaderboard stats:', error);
    throw error;
  }
}
