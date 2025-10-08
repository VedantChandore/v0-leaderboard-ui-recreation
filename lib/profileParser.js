/**
 * Google Cloud Skills Boost Profile Parser
 * Extracts profile data from Google Cloud Skills Boost public profile URLs
 */

/**
 * Extracts profile ID from Google Cloud Skills Boost URL
 * @param {string} url - The profile URL
 * @returns {string|null} - The profile ID or null if invalid
 */
export function extractProfileId(url) {
  try {
    const regex = /\/public_profiles\/([a-f0-9-]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting profile ID:', error);
    return null;
  }
}

/**
 * Parses profile data from HTML content
 * @param {string} htmlContent - The HTML content from the profile page
 * @returns {object} - Parsed profile data
 */
export function parseProfileData(htmlContent) {
  try {
    // Extract name from title or h1 tag
    const nameMatch = htmlContent.match(/<title>([^|]+)\s*\|\s*Google Cloud Skills Boost<\/title>/) ||
                     htmlContent.match(/<h1[^>]*>([^<]+)<\/h1>/);
    const name = nameMatch ? nameMatch[1].trim() : 'Unknown User';

    // Extract member since year
    const memberMatch = htmlContent.match(/Member since (\d{4})/);
    const memberSince = memberMatch ? memberMatch[1] : new Date().getFullYear().toString();

    // Extract league/tier information
    const leagueMatch = htmlContent.match(/(Bronze|Silver|Gold|Platinum|Diamond)\s+League/i);
    const league = leagueMatch ? leagueMatch[1] : 'Bronze';

    // Extract badges count
    const badgeMatch = htmlContent.match(/(\d+)\s+badges?/i) ||
                      htmlContent.match(/earned\s+(\d+)\s+badge/i);
    let badgesEarned = badgeMatch ? parseInt(badgeMatch[1]) : 0;

    // Check if no badges earned
    if (htmlContent.includes("hasn't earned any badges yet") || 
        htmlContent.includes("no badges earned")) {
      badgesEarned = 0;
    }

    // Extract labs/quests completed (if available)
    const labsMatch = htmlContent.match(/(\d+)\s+(?:labs?|quests?)\s+completed/i);
    const labsCompleted = labsMatch ? parseInt(labsMatch[1]) : 0;

    // Determine tier based on badges earned (more accurate than league)
    let tier = 'Cloud Beginner';
    if (badgesEarned >= 15) {
      tier = 'Cloud Pro';
    } else if (badgesEarned >= 8) {
      tier = 'Cloud Explorer';
    } else if (badgesEarned >= 3) {
      tier = 'Cloud Beginner';
    } else {
      tier = 'Newcomer';
    }

    // Calculate ranking score (badges are primary, labs secondary)
    const rankingScore = (badgesEarned * 10) + labsCompleted;

    return {
      name,
      tier,
      badgesEarned,
      labsCompleted,
      rankingScore,
      memberSince,
      league,
      avatar: `/gaming-avatar-${Math.floor(Math.random() * 12) + 1}.png`,
      profileUrl: null
    };
  } catch (error) {
    console.error('Error parsing profile data:', error);
    return {
      name: 'Unknown User',
      memberSince: new Date().getFullYear().toString(),
      league: 'Bronze',
      tier: 'Cloud Beginner',
      badgesEarned: '0',
      labsCompleted: '0',
      completionRate: '0%',
      avatar: '/gaming-avatar-1.png',
      profileUrl: null
    };
  }
}

/**
 * Fetches and parses a Google Cloud Skills Boost profile
 * @param {string} profileUrl - The complete profile URL
 * @returns {Promise<object>} - Promise resolving to parsed profile data
 */
export async function fetchProfileData(profileUrl) {
  try {
    const response = await fetch(`/api/proxy-profile?url=${encodeURIComponent(profileUrl)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const htmlContent = await response.text();
    const profileData = parseProfileData(htmlContent);
    profileData.profileUrl = profileUrl;
    
    return profileData;
  } catch (error) {
    console.error('Error fetching profile data:', error);
    throw error;
  }
}

/**
 * Validates if a URL is a valid Google Cloud Skills Boost profile URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidProfileUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'www.cloudskillsboost.google' && 
           url.includes('/public_profiles/') &&
           extractProfileId(url) !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Converts profile data to simplified leaderboard entry format
 * @param {object} profileData - The parsed profile data
 * @returns {object} - Leaderboard entry object (place will be assigned during sorting)
 */
export function toLeaderboardEntry(profileData) {
  return {
    name: profileData.name,
    tier: profileData.tier,
    avatar: profileData.avatar,
    rankingScore: profileData.rankingScore,
    badgesEarned: profileData.badgesEarned,
    labsCompleted: profileData.labsCompleted,
    profileUrl: profileData.profileUrl,
    memberSince: profileData.memberSince
  };
}
