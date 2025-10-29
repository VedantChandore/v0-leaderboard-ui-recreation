#!/usr/bin/env node

/**
 * CSV Migration Script
 * Reads users.csv and migrates profile data to the leaderboard database
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchProfileDataDirect } from '../lib/profileParser.js';
import { addParticipant, participantExists } from '../lib/leaderboardDB.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parse CSV line with proper comma handling (respects quoted fields)
 * @param {string} line - CSV line
 * @returns {Array} - Array of field values
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Read and parse CSV file
 * @param {string} filePath - Path to the CSV file
 * @returns {Array} - Array of user data objects
 */
function readCSVFile(filePath) {
  try {
    console.log('📊 Reading CSV file:', filePath);
    
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }
    
    // Parse header row
    const headers = parseCSVLine(lines[0]);
    console.log('📋 CSV Headers:', headers);
    
    // Parse data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length === headers.length) {
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        data.push(row);
      }
    }
    
    console.log(`✅ Found ${data.length} rows in CSV file`);
    return data;
  } catch (error) {
    console.error('❌ Error reading CSV file:', error);
    throw error;
  }
}

/**
 * Extract profile URLs from CSV data
 * @param {Array} csvData - Raw CSV data
 * @returns {Array} - Array of valid profile URLs
 */
function extractProfileUrls(csvData) {
  const profileUrls = [];
  
  for (const row of csvData) {
    // Look for the profile URL column (handle different possible column names)
    const profileUrl = row['Google Cloud Skills Boost Profile URL'] || 
                      row['Profile URL'] || 
                      row['profileUrl'];
    
    if (profileUrl && 
        typeof profileUrl === 'string' && 
        profileUrl.includes('cloudskillsboost.google') &&
        profileUrl.includes('/public_profiles/')) {
      
      console.log(`🔗 Found profile URL for ${row['User Name'] || 'Unknown'}: ${profileUrl}`);
      profileUrls.push({
        name: row['User Name'] || 'Unknown User',
        email: row['User Email'] || '',
        profileUrl: profileUrl.trim(),
        skillBadges: parseInt(row['# of Skill Badges Completed']) || 0,
        arcadeGames: parseInt(row['# of Arcade Games Completed']) || 0
      });
    } else {
      console.log(`⚠️ Skipping invalid profile URL for ${row['User Name'] || 'Unknown'}`);
    }
  }
  
  console.log(`✅ Extracted ${profileUrls.length} valid profile URLs`);
  return profileUrls;
}

/**
 * Process a single profile
 * @param {object} userInfo - User info with profile URL
 * @returns {Promise<boolean>} - Success status
 */
async function processProfile(userInfo) {
  try {
    console.log(`\n👤 Processing: ${userInfo.name}`);
    console.log(`🔗 Profile URL: ${userInfo.profileUrl}`);
    
    // Check if participant already exists
    const exists = await participantExists(userInfo.profileUrl);
    if (exists) {
      console.log(`⚠️ Participant already exists, skipping: ${userInfo.name}`);
      return false;
    }
    
    // Fetch profile data using existing scraper
    console.log('🌐 Fetching profile data...');
    const profileData = await fetchProfileDataDirect(userInfo.profileUrl);
    
    console.log('📊 Profile data retrieved:', {
      name: profileData.name,
      tier: profileData.tier,
      badges: profileData.badgesEarned,
      points: profileData.points,
      labs: profileData.labsCompleted
    });
    
    // Add to database using existing function
    console.log('💾 Adding to database...');
    const participantId = await addParticipant(profileData);
    
    console.log(`✅ Successfully added: ${profileData.name} (ID: ${participantId})`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error processing ${userInfo.name}:`, error.message);
    return false;
  }
}

/**
 * Main migration function
 */
async function runMigration() {
  try {
    console.log('🚀 Starting CSV migration...\n');
    
    // Check if Firebase is configured
    try {
      await import('../lib/leaderboardDB.js');
    } catch (error) {
      if (error.code === 'ERR_MODULE_NOT_FOUND') {
        console.error('❌ Firebase configuration missing!');
        console.error('Please ensure you have:');
        console.error('1. Created lib/firebaseDB.js with your Firebase config');
        console.error('2. Set up your Firebase project and Firestore database');
        console.error('3. Added your service account credentials');
        process.exit(1);
      }
      throw error;
    }
    
    // Path to CSV file
    const csvPath = path.join(__dirname, 'users.csv');
    
    // Check if CSV file exists
    if (!fs.existsSync(csvPath)) {
      console.error('❌ CSV file not found!');
      console.error(`Expected file: ${csvPath}`);
      console.error('Please place your users.csv file in the migration folder.');
      process.exit(1);
    }
    
    // Read CSV file
    const csvData = readCSVFile(csvPath);
    
    // Extract profile URLs
    const profileUrls = extractProfileUrls(csvData);
    
    if (profileUrls.length === 0) {
      console.log('❌ No valid profile URLs found in CSV file');
      console.log('Please check that your CSV has a "Google Cloud Skills Boost Profile URL" column');
      return;
    }
    
    console.log(`\n📋 Starting migration of ${profileUrls.length} profiles...\n`);
    
    // Process each profile with delay to avoid rate limiting
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < profileUrls.length; i++) {
      const userInfo = profileUrls[i];
      
      console.log(`\n[${i + 1}/${profileUrls.length}] Processing...`);
      
      try {
        const success = await processProfile(userInfo);
        
        if (success) {
          successCount++;
        } else {
          skipCount++;
        }
        
        // Add delay between requests to be respectful
        if (i < profileUrls.length - 1) {
          console.log('⏳ Waiting 2 seconds before next request...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error) {
        console.error(`❌ Failed to process ${userInfo.name}:`, error.message);
        errorCount++;
      }
    }
    
    // Final summary
    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Successfully added: ${successCount}`);
    console.log(`   ⚠️ Skipped (already exists): ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📋 Total processed: ${profileUrls.length}`);
    
    if (successCount > 0) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('New participants have been added to the leaderboard.');
    } else {
      console.log('\n⚠️ No new participants were added.');
    }
    
  } catch (error) {
    console.error('\n💥 Migration failed:', error.message);
    
    if (error.code === 'ERR_MODULE_NOT_FOUND') {
      console.error('Please check your Firebase configuration and try again.');
    } else {
      console.error('Please check your CSV file and database configuration.');
    }
    
    process.exit(1);
  }
}

// Run the migration
runMigration();
