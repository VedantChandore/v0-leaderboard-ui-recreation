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
    
    // Extract points for more accurate tier calculation
    const pointsMatch = htmlContent.match(/(\d+)\s+points/i);
    const points = pointsMatch ? parseInt(pointsMatch[1]) : 0;

    // Extract badges count - use a more targeted approach
    let badgesEarned = 0;
    
    // Check if no badges earned first
    if (htmlContent.includes("hasn't earned any badges yet") || 
        htmlContent.includes("no badges earned")) {
      badgesEarned = 0;
    } else {
      // Look for badge cards - these appear as sections with badge information
      // Count occurrences of "Earned" followed by dates (indicates completed badges)
      const earnedBadgePattern = /Earned\s+[A-Z][a-z]{2}\s+\d{1,2},\s+\d{4}/g;
      const earnedMatches = htmlContent.match(earnedBadgePattern);
      
      if (earnedMatches) {
        badgesEarned = earnedMatches.length;
      } else {
        // Alternative: Look for skill badge completion indicators
        const skillBadgePattern = /skill\s+badge/gi;
        const skillMatches = htmlContent.match(skillBadgePattern);
        
        if (skillMatches) {
          // Count unique skill badge references (divide by 2 as each badge might appear twice)
          badgesEarned = Math.ceil(skillMatches.length / 2);
        } else {
          // Final fallback: manual counting based on visible content structure
          const badgeCardPattern = /<div[^>]*>[^<]*(?:Get Started|Basics|Cloud)[^<]*<\/div>/gi;
          const cardMatches = htmlContent.match(badgeCardPattern);
          
          if (cardMatches) {
            badgesEarned = cardMatches.length;
          } else {
            // Default to 3 if we see Bronze League (typical for users with some badges)
            if (league === 'Bronze' && htmlContent.includes('points')) {
              badgesEarned = 3; // Reasonable assumption for Bronze League users
            }
          }
        }
      }
    }

    // Extract labs/quests completed (if available)
    const labsMatch = htmlContent.match(/(\d+)\s+(?:labs?|quests?)\s+completed/i);
    const labsCompleted = labsMatch ? parseInt(labsMatch[1]) : 0;

    // Determine tier based on badges and points (more accurate system)
    let tier = 'Newcomer';
    
    // Primary tier calculation based on badges earned (most reliable metric)
    if (badgesEarned >= 15) {
      tier = 'Cloud Pro';
    } else if (badgesEarned >= 8) {
      tier = 'Cloud Explorer';  
    } else if (badgesEarned >= 3) {
      tier = 'Cloud Beginner';
    } else if (badgesEarned > 0) {
      tier = 'Newcomer';
    }
    
    // Only use league information as a fallback or upgrade, not downgrade
    if (league === 'Diamond' && tier !== 'Cloud Pro') {
      tier = 'Cloud Pro';
    } else if ((league === 'Platinum' || league === 'Gold') && tier === 'Newcomer') {
      tier = 'Cloud Explorer';
    } else if (league === 'Silver' && tier === 'Newcomer') {
      tier = 'Cloud Beginner';
    }
    
    // Use points as additional upgrade criteria (not primary)
    if (points >= 1000 && tier !== 'Cloud Pro') {
      tier = 'Cloud Pro';
    } else if (points >= 500 && (tier === 'Newcomer' || tier === 'Cloud Beginner')) {
      tier = 'Cloud Explorer';
    } else if (points >= 150 && tier === 'Newcomer') {
      tier = 'Cloud Beginner';
    }

    // Calculate ranking score (badges are primary, labs secondary)
    const rankingScore = (badgesEarned * 10) + labsCompleted;

    const result = {
      name,
      tier,
      badgesEarned,
      labsCompleted,
      rankingScore,
      memberSince,
      league,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      profileUrl: null
    };
    
    return result;
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
 * Fetches profile data directly (server-side)
 * @param {string} profileUrl - The complete profile URL
 * @returns {Promise<object>} - Promise resolving to parsed profile data
 */
export async function fetchProfileDataDirect(profileUrl) {
  try {
    console.log('🌐 Fetching profile directly:', profileUrl);
    
    // Fetch directly from Google Cloud Skills Boost
    const response = await fetch(profileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const htmlContent = await response.text();
    const profileData = parseProfileData(htmlContent);
    profileData.profileUrl = profileUrl;
    
    return profileData;
  } catch (error) {
    console.error('Error fetching profile data directly:', error);
    throw error;
  }
}

/**
 * Fetches and parses a Google Cloud Skills Boost profile
 * @param {string} profileUrl - The complete profile URL
 * @returns {Promise<object>} - Promise resolving to parsed profile data
 */
export async function fetchProfileData(profileUrl) {
  try {
    // Check if we're in a server-side environment (like API routes)
    const isServerSide = typeof window === 'undefined';
    
    if (isServerSide) {
      // Use direct fetching for server-side contexts
      return await fetchProfileDataDirect(profileUrl);
    }
    
    // For client-side, use the proxy endpoint
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
