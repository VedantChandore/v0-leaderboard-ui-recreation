#!/usr/bin/env node

/**
 * CSV Migration Script for Test Collection
 * Reads users.csv and migrates profile data to test_collection_participants
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { fetchProfileDataDirect } from '../lib/profileParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test collection specific database functions
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  serverTimestamp,
  doc,
  updateDoc
} from 'firebase/firestore';
import { leaderboardDB as db } from '../lib/firebaseDB.js';

const TEST_COLLECTION_NAME = 'test_collection_participants';

/**
 * Add participant to test collection
 */
async function addToTestCollection(participantData) {
  try {
    const cleanedData = {
      ...participantData,
      badgesEarned: parseInt(participantData.badgesEarned) || 0,
      labsCompleted: parseInt(participantData.labsCompleted) || 0,
      points: parseInt(participantData.points) || 0,
      rankingScore: parseInt(participantData.rankingScore) || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    console.log('💾 Storing to test collection:', cleanedData);
    const docRef = await addDoc(collection(db, TEST_COLLECTION_NAME), cleanedData);
    console.log('✅ Added to test collection with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding to test collection:', error);
    throw error;
  }
}

/**
 * Check if participant exists in test collection and return document data
 */
async function getExistingParticipantInTestCollection(profileUrl) {
  try {
    const querySnapshot = await getDocs(collection(db, TEST_COLLECTION_NAME));
    
    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();
      if (data.profileUrl === profileUrl) {
        return {
          id: docSnapshot.id,
          ...data
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error checking test collection:', error);
    return null;
  }
}

/**
 * Update existing participant in test collection
 */
async function updateInTestCollection(participantId, participantData) {
  try {
    const cleanedData = {
      ...participantData,
      badgesEarned: parseInt(participantData.badgesEarned) || 0,
      labsCompleted: parseInt(participantData.labsCompleted) || 0,
      points: parseInt(participantData.points) || 0,
      rankingScore: parseInt(participantData.rankingScore) || 0,
      updatedAt: serverTimestamp(),
      lastRescrapedAt: serverTimestamp()
    };
    
    console.log('🔄 Updating existing participant in test collection:', cleanedData);
    await updateDoc(doc(db, TEST_COLLECTION_NAME, participantId), cleanedData);
    console.log('✅ Updated in test collection with ID:', participantId);
    return participantId;
  } catch (error) {
    console.error('Error updating test collection:', error);
    throw error;
  }
}

/**
 * Parse CSV line with proper comma handling (respects quoted fields)
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
 */
function extractProfileUrls(csvData) {
  const profileUrls = [];
  
  for (const row of csvData) {
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
        excelBadges: parseInt(row['# of Skill Badges Completed']) || 0,
        excelGames: parseInt(row['# of Arcade Games Completed']) || 0,
        accessCodeRedeemed: row['Access Code Redemption Status'] === 'Yes',
        profileStatus: row['Profile URL Status'] || 'Unknown'
      });
    } else {
      console.log(`⚠️ Skipping invalid profile URL for ${row['User Name'] || 'Unknown'}`);
    }
  }
  
  console.log(`✅ Extracted ${profileUrls.length} valid profile URLs`);
  return profileUrls;
}

/**
 * Process a single profile for test collection
 */
async function processProfileForTest(userInfo) {
  try {
    console.log(`\n👤 Processing: ${userInfo.name}`);
    console.log(`🔗 Profile URL: ${userInfo.profileUrl}`);
    
    // Check if participant already exists in test collection
    const existingParticipant = await getExistingParticipantInTestCollection(userInfo.profileUrl);
    
    // Fetch profile data using existing scraper
    console.log('🌐 Fetching profile data...');
    const profileData = await fetchProfileDataDirect(userInfo.profileUrl);
    
    // Add Excel metadata to profile data
    const enhancedData = {
      ...profileData,
      excelBadges: userInfo.excelBadges,
      excelGames: userInfo.excelGames,
      accessCodeRedeemed: userInfo.accessCodeRedeemed,
      profileStatus: userInfo.profileStatus,
      userEmail: userInfo.email,
      migrationSource: 'csv_import',
      migrationDate: new Date().toISOString()
    };
    
    if (existingParticipant) {
      console.log(`🔄 Participant exists, updating with fresh data: ${userInfo.name}`);
      
      // Compare old vs new data
      const oldBadges = existingParticipant.badgesEarned || 0;
      const newBadges = enhancedData.badgesEarned || 0;
      const oldPoints = existingParticipant.points || 0;
      const newPoints = enhancedData.points || 0;
      
      console.log('📊 Progress comparison:', {
        name: enhancedData.name,
        badges: `${oldBadges} → ${newBadges} (${newBadges - oldBadges >= 0 ? '+' : ''}${newBadges - oldBadges})`,
        points: `${oldPoints} → ${newPoints} (${newPoints - oldPoints >= 0 ? '+' : ''}${newPoints - oldPoints})`,
        tier: `${existingParticipant.tier || 'Unknown'} → ${enhancedData.tier}`
      });
      
      // Update existing participant
      await updateInTestCollection(existingParticipant.id, enhancedData);
      console.log(`✅ Successfully updated: ${enhancedData.name} (ID: ${existingParticipant.id})`);
      return 'updated';
      
    } else {
      console.log(`➕ New participant, adding to test collection: ${userInfo.name}`);
      
      console.log('📊 New profile data:', {
        name: enhancedData.name,
        tier: enhancedData.tier,
        badges: enhancedData.badgesEarned,
        points: enhancedData.points,
        labs: enhancedData.labsCompleted,
        excelBadges: enhancedData.excelBadges,
        accessCode: enhancedData.accessCodeRedeemed
      });
      
      // Add to test collection
      console.log('💾 Adding to test collection...');
      const participantId = await addToTestCollection(enhancedData);
      
      console.log(`✅ Successfully added to test collection: ${enhancedData.name} (ID: ${participantId})`);
      return 'added';
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${userInfo.name}:`, error.message);
    return 'error';
  }
}

/**
 * Process multiple profiles concurrently
 */
async function processProfilesBatch(profileUrls, batchSize = 5, delay = 1000) {
  const results = {
    added: 0,
    updated: 0,
    errors: 0,
    details: []
  };

  for (let i = 0; i < profileUrls.length; i += batchSize) {
    const batch = profileUrls.slice(i, i + batchSize);
    
    console.log(`\n🚀 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(profileUrls.length / batchSize)}`);
    console.log(`📋 Profiles ${i + 1}-${Math.min(i + batchSize, profileUrls.length)} of ${profileUrls.length}`);
    
    // Process batch concurrently
    const batchPromises = batch.map(async (userInfo, index) => {
      const globalIndex = i + index + 1;
      try {
        console.log(`[${globalIndex}/${profileUrls.length}] 🌐 Fetching: ${userInfo.name}`);
        
        const result = await processProfileForTest(userInfo);
        
        console.log(`[${globalIndex}/${profileUrls.length}] ✅ ${result}: ${userInfo.name}`);
        
        return {
          name: userInfo.name,
          result: result,
          index: globalIndex,
          success: true
        };
      } catch (error) {
        console.error(`[${globalIndex}/${profileUrls.length}] ❌ Error: ${userInfo.name} - ${error.message}`);
        
        return {
          name: userInfo.name,
          result: 'error',
          index: globalIndex,
          success: false,
          error: error.message
        };
      }
    });
    
    // Wait for batch to complete
    const batchResults = await Promise.allSettled(batchPromises);
    
    // Process results
    batchResults.forEach((promiseResult, index) => {
      if (promiseResult.status === 'fulfilled') {
        const result = promiseResult.value;
        results.details.push(result);
        
        if (result.result === 'added') {
          results.added++;
        } else if (result.result === 'updated') {
          results.updated++;
        } else if (result.result === 'error') {
          results.errors++;
        }
      } else {
        // Promise was rejected
        const userInfo = batch[index];
        console.error(`❌ Promise rejected for ${userInfo.name}:`, promiseResult.reason);
        results.errors++;
        results.details.push({
          name: userInfo.name,
          result: 'error',
          index: i + index + 1,
          success: false,
          error: promiseResult.reason?.message || 'Promise rejected'
        });
      }
    });
    
    // Show batch summary
    const batchAdded = results.details.slice(-batch.length).filter(r => r.result === 'added').length;
    const batchUpdated = results.details.slice(-batch.length).filter(r => r.result === 'updated').length;
    const batchErrors = results.details.slice(-batch.length).filter(r => r.result === 'error').length;
    
    console.log(`📊 Batch ${Math.floor(i / batchSize) + 1} Summary: ✅ ${batchAdded} added, 🔄 ${batchUpdated} updated, ❌ ${batchErrors} errors`);
    
    // Add delay between batches (except for the last batch)
    if (i + batchSize < profileUrls.length) {
      console.log(`⏳ Waiting ${delay}ms before next batch...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return results;
}

/**
 * Main migration function for test collection
 */
async function runTestMigration() {
  try {
    console.log('🚀 Starting CSV migration to TEST COLLECTION (CONCURRENT MODE)...\n');
    console.log('📝 Target collection: test_collection_participants');
    console.log('🔄 Mode: Update existing participants with fresh data');
    console.log('⚡ Concurrent processing: 5 profiles per batch\n');
    
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
    
    console.log(`\n📋 Starting CONCURRENT migration of ${profileUrls.length} profiles...\n`);
    
    // Configuration for concurrent processing
    const BATCH_SIZE = 5; // Process 5 profiles simultaneously
    const BATCH_DELAY = 1000; // 1 second delay between batches
    
    console.log(`⚙️ Configuration:`);
    console.log(`   📦 Batch size: ${BATCH_SIZE} concurrent profiles`);
    console.log(`   ⏱️ Batch delay: ${BATCH_DELAY}ms`);
    console.log(`   📊 Total batches: ${Math.ceil(profileUrls.length / BATCH_SIZE)}\n`);
    
    const startTime = Date.now();
    
    // Process profiles concurrently in batches
    const results = await processProfilesBatch(profileUrls, BATCH_SIZE, BATCH_DELAY);
    
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;
    
    // Final summary with performance metrics
    console.log('\n📊 CONCURRENT MIGRATION Summary:');
    console.log(`   🗂️  Collection: ${TEST_COLLECTION_NAME}`);
    console.log(`   ➕ New participants added: ${results.added}`);
    console.log(`   🔄 Existing participants updated: ${results.updated}`);
    console.log(`   ❌ Errors: ${results.errors}`);
    console.log(`   📋 Total processed: ${profileUrls.length}`);
    console.log(`   ⏱️ Total time: ${totalTime.toFixed(2)} seconds`);
    console.log(`   ⚡ Average per profile: ${(totalTime / profileUrls.length).toFixed(2)} seconds`);
    
    // Show error details if any
    if (results.errors > 0) {
      console.log('\n❌ Error Details:');
      results.details
        .filter(r => r.result === 'error')
        .forEach(error => {
          console.log(`   [${error.index}] ${error.name}: ${error.error}`);
        });
    }
    
    if (results.added > 0 || results.updated > 0) {
      console.log('\n🎉 Concurrent migration completed successfully!');
      console.log(`${results.added} new participants added, ${results.updated} existing participants updated.`);
      console.log(`⚡ Performance: ${((results.added + results.updated) / totalTime * 60).toFixed(1)} profiles/minute`);
    } else {
      console.log('\n⚠️ No changes were made to the test collection.');
    }
    
  } catch (error) {
    console.error('\n💥 Concurrent migration failed:', error.message);
    console.error('Please check your CSV file and database configuration.');
    process.exit(1);
  }
}

// Run the test migration
runTestMigration();
