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
import { db } from './firebase';

const COLLECTION_NAME = 'leaderboard_participants';

/**
 * Add a new participant to the leaderboard
 * @param {object} participantData - Participant data from profile parser
 * @returns {Promise<string>} - Document ID of created participant
 */
export async function addParticipant(participantData) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...participantData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('Participant added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding participant:', error);
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
 * Check if a participant already exists by profile URL
 * @param {string} profileUrl - Google Cloud Skills Boost profile URL
 * @returns {Promise<boolean>} - True if participant exists
 */
export async function participantExists(profileUrl) {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('profileUrl', '==', profileUrl)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking participant existence:', error);
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
export function subscribeToLeaderboard(callback) {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy('badgesEarned', 'desc'),
    orderBy('labsCompleted', 'desc'),
    orderBy('name', 'asc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const participants = [];
    querySnapshot.forEach((doc) => {
      participants.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    callback(participants);
  }, (error) => {
    console.error('Error in leaderboard subscription:', error);
  });
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
