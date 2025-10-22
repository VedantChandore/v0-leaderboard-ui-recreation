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
    // Extract name from title tag (most reliable)
    const nameMatch = htmlContent.match(/<title>([^|]+)\s*\|\s*Google Cloud Skills Boost<\/title>/);
    const name = nameMatch ? nameMatch[1].trim() : 'Unknown User';

    // Extract member since year from the specific pattern
    const memberMatch = htmlContent.match(/Member since (\d{4})/);
    const memberSince = memberMatch ? memberMatch[1] : new Date().getFullYear().toString();

    // Extract league information from the HTML structure
    const leagueMatch = htmlContent.match(/<h2 class='ql-headline-medium'>([^<]+) League<\/h2>/);
    const league = leagueMatch ? leagueMatch[1].trim() : 'Bronze';
    
    // Extract points from the league section - IMPROVED PATTERN
    const pointsMatch = htmlContent.match(/<strong>(\d+) points<\/strong>/);
    const points = pointsMatch ? parseInt(pointsMatch[1]) : 0;
    console.log('📊 Points extracted:', points);

    // Extract badges count - PRIORITY CHECK for no badges message
    let badgesEarned = 0;
    
    // Primary check: Look for explicit "no badges" messages
    if (htmlContent.includes("hasn't earned any badges yet") || 
        htmlContent.includes("hasn't earned any skill badges yet") ||
        htmlContent.includes("ISHA hasn't earned any badges yet") ||
        htmlContent.includes("hasn&#39;t earned any badges yet")) {
      console.log('🚫 Found "no badges" message - setting badges to 0');
      badgesEarned = 0;
    } else {
      // NEW: Count profile-badge divs (most accurate for earned badges)
      const profileBadgePattern = /<div class='profile-badge'>/g;
      const profileBadgeMatches = htmlContent.match(profileBadgePattern);
      
      if (profileBadgeMatches && profileBadgeMatches.length > 0) {
        badgesEarned = profileBadgeMatches.length;
        console.log('🎯 Found profile-badge divs:', badgesEarned);
      } else {
        // Fallback: Look for "Earned" followed by date patterns
        const earnedBadgePattern = /Earned\s+[A-Z][a-z]{2}\s+\d{1,2},\s+\d{4}/g;
        const earnedMatches = htmlContent.match(earnedBadgePattern);
        
        if (earnedMatches && earnedMatches.length > 0) {
          badgesEarned = earnedMatches.length;
          console.log('✅ Found earned badges pattern:', badgesEarned);
        } else {
          // Alternative: Look for badge card structures
          const badgeCardPattern = /<div[^>]*class="[^"]*badge[^"]*"[^>]*>/gi;
          const badgeMatches = htmlContent.match(badgeCardPattern);
          
          if (badgeMatches && badgeMatches.length > 0) {
            badgesEarned = badgeMatches.length;
            console.log('🎯 Found badge card structures:', badgesEarned);
          } else {
            // Final fallback: estimate based on league and points (only if no explicit "no badges" message)
            if (league.toLowerCase() === 'bronze' && points > 0) {
              badgesEarned = Math.max(1, Math.floor(points / 50)); // More conservative estimation
              console.log('📊 Estimated badges from Bronze league:', badgesEarned);
            } else if (league.toLowerCase() === 'silver') {
              badgesEarned = Math.max(3, Math.floor(points / 60));
              console.log('📊 Estimated badges from Silver league:', badgesEarned);
            } else if (league.toLowerCase() === 'gold') {
              badgesEarned = Math.max(8, Math.floor(points / 70));
              console.log('📊 Estimated badges from Gold league:', badgesEarned);
            } else if (league.toLowerCase() === 'platinum') {
              badgesEarned = Math.max(12, Math.floor(points / 80));
              console.log('📊 Estimated badges from Platinum league:', badgesEarned);
            } else if (league.toLowerCase() === 'diamond') {
              badgesEarned = Math.max(15, Math.floor(points / 100));
              console.log('📊 Estimated badges from Diamond league:', badgesEarned);
            } else {
              // If we reach here with no other indicators, assume 0 badges
              badgesEarned = 0;
              console.log('❓ No badge indicators found - defaulting to 0');
            }
          }
        }
      }
    }

    // Extract labs/quests completed (if available in the HTML)
    const labsMatch = htmlContent.match(/(\d+)\s+(?:labs?|quests?)\s+completed/i) ||
                     htmlContent.match(/Completed\s+(\d+)\s+(?:labs?|quests?)/i);
    const labsCompleted = labsMatch ? parseInt(labsMatch[1]) : 0;

    // Determine tier based on badges earned (primary) and league (secondary)
    let tier = 'Newcomer';
    
    // Primary tier calculation based on badges earned
    if (badgesEarned >= 15) {
      tier = 'Cloud Pro';
    } else if (badgesEarned >= 8) {
      tier = 'Cloud Explorer';  
    } else if (badgesEarned >= 3) {
      tier = 'Cloud Beginner';
    } else if (badgesEarned > 0) {
      tier = 'Newcomer';
    } else {
      // Explicitly handle 0 badges case
      tier = 'Newcomer';
    }
    
    // Use league information as additional tier determination
    const leagueLower = league.toLowerCase();
    if (leagueLower === 'diamond' && tier !== 'Cloud Pro') {
      tier = 'Cloud Pro';
    } else if ((leagueLower === 'platinum' || leagueLower === 'gold') && 
               (tier === 'Newcomer' || tier === 'Cloud Beginner')) {
      tier = 'Cloud Explorer';
    } else if (leagueLower === 'silver' && tier === 'Newcomer') {
      tier = 'Cloud Beginner';
    }
    
    // Use points as additional upgrade criteria
    if (points >= 1000 && tier !== 'Cloud Pro') {
      tier = 'Cloud Pro';
    } else if (points >= 500 && (tier === 'Newcomer' || tier === 'Cloud Beginner')) {
      tier = 'Cloud Explorer';
    } else if (points >= 150 && tier === 'Newcomer') {
      tier = 'Cloud Beginner';
    }

    // UPDATED: Calculate ranking score with points as secondary criteria
    const rankingScore = (badgesEarned * 1000) + (points * 10) + labsCompleted;

    const result = {
      name,
      tier,
      badgesEarned,
      labsCompleted,
      rankingScore,
      memberSince,
      league,
      points, // Include points in the result
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      profileUrl: null
    };

    console.log('🔍 Parsed profile data:', {
      name,
      badgesEarned,
      labsCompleted,
      tier,
      league,
      points,
      memberSince,
      rankingScore,
      noBadgesMessageFound: htmlContent.includes("hasn't earned any badges yet") || htmlContent.includes("hasn&#39;t earned any badges yet")
    });
    
    return result;
  } catch (error) {
    console.error('Error parsing profile data:', error);
    return {
      name: 'Unknown User',
      memberSince: new Date().getFullYear().toString(),
      league: 'Bronze',
      tier: 'Newcomer',
      badgesEarned: 0,
      labsCompleted: 0,
      points: 0,
      rankingScore: 0,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Unknown`,
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
    // Support both old and new domain formats
    const validHostnames = ['www.cloudskillsboost.google', 'www.skills.google'];
    return validHostnames.includes(urlObj.hostname) && 
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
    points: profileData.points, // ADD POINTS
    league: profileData.league, // ADD LEAGUE
    profileUrl: profileData.profileUrl,
    memberSince: profileData.memberSince
  };
}
