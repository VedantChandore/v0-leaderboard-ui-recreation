/**
 * Leaderboard Manager - Handles ranking logic and participant management
 */

/**
 * Calculates ranking based on badges and labs completed
 * @param {object} participant - Participant data
 * @returns {number} - Ranking score
 */
export function calculateRankingScore(participant) {
  // Badges are worth 10 points each, labs are worth 1 point each
  return (participant.badgesEarned * 10) + participant.labsCompleted;
}

/**
 * Sorts participants by ranking score and assigns places
 * @param {Array} participants - Array of participant objects
 * @returns {Array} - Sorted array with place assignments
 */
export function rankParticipants(participants) {
  return participants
    .map(participant => ({
      ...participant,
      rankingScore: calculateRankingScore(participant)
    }))
    .sort((a, b) => {
      // Primary sort: badges earned (descending)
      if (b.badgesEarned !== a.badgesEarned) {
        return b.badgesEarned - a.badgesEarned;
      }
      // Secondary sort: labs completed (descending)
      if (b.labsCompleted !== a.labsCompleted) {
        return b.labsCompleted - a.labsCompleted;
      }
      // Tertiary sort: alphabetical by name
      return a.name.localeCompare(b.name);
    })
    .map((participant, index) => ({
      ...participant,
      place: index + 1
    }));
}

/**
 * Determines tier based on badges earned
 * @param {number} badgesEarned - Number of badges earned
 * @returns {string} - Tier name
 */
export function determineTier(badgesEarned) {
  if (badgesEarned >= 15) return 'Cloud Pro';
  if (badgesEarned >= 8) return 'Cloud Explorer';
  if (badgesEarned >= 3) return 'Cloud Beginner';
  return 'Newcomer';
}

/**
 * Gets tier color for UI display
 * @param {string} tier - Tier name
 * @returns {string} - CSS color class
 */
export function getTierColor(tier) {
  const colors = {
    'Cloud Pro': 'text-[#4285F4]',
    'Cloud Explorer': 'text-[#0F9D58]',
    'Cloud Beginner': 'text-[#F4B400]',
    'Newcomer': 'text-gray-500'
  };
  return colors[tier] || 'text-gray-500';
}

/**
 * Gets tier background color for UI display
 * @param {string} tier - Tier name
 * @returns {string} - CSS background class
 */
export function getTierBgColor(tier) {
  const colors = {
    'Cloud Pro': 'bg-[#4285F4]/10 border border-[#4285F4]/20',
    'Cloud Explorer': 'bg-[#0F9D58]/10 border border-[#0F9D58]/20',
    'Cloud Beginner': 'bg-[#F4B400]/10 border border-[#F4B400]/20',
    'Newcomer': 'bg-gray-100 border border-gray-200'
  };
  return colors[tier] || 'bg-gray-100 border border-gray-200';
}

/**
 * Gets tier icon for UI display
 * @param {string} tier - Tier name
 * @returns {string} - Emoji icon
 */
export function getTierIcon(tier) {
  const icons = {
    'Cloud Pro': '☁️',
    'Cloud Explorer': '🌥️',
    'Cloud Beginner': '🌩️',
    'Newcomer': '🔰'
  };
  return icons[tier] || '🔰';
}

/**
 * Validates if a participant can be added (no duplicates)
 * @param {Array} existingParticipants - Current participants
 * @param {string} profileUrl - New participant's profile URL
 * @returns {boolean} - True if can be added, false if duplicate
 */
export function canAddParticipant(existingParticipants, profileUrl) {
  const profileId = profileUrl.split('/public_profiles/')[1]?.split('?')[0];
  return !existingParticipants.some(participant => 
    participant.profileUrl?.includes(profileId)
  );
}
