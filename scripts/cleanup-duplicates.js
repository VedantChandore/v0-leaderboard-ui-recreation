#!/usr/bin/env node

/**
 * Database Cleanup Utility
 * Removes duplicate participants based on profile ID matching
 */

import { cleanupDuplicateParticipants } from '../lib/leaderboardDB.js';

async function runCleanup() {
  try {
    console.log('🚀 Starting database cleanup...');
    console.log('This will remove duplicate participants with the same profile ID.');
    console.log('The most recent entry for each profile will be kept.\n');
    
    const duplicatesRemoved = await cleanupDuplicateParticipants();
    
    console.log('\n📊 Cleanup Summary:');
    console.log(`   Duplicates removed: ${duplicatesRemoved}`);
    
    if (duplicatesRemoved > 0) {
      console.log('\n✅ Database cleanup completed successfully!');
      console.log('The leaderboard should now have no duplicate entries.');
    } else {
      console.log('\n✅ No duplicates found. Database is clean!');
    }
    
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error.message);
    console.error('Please check your Firebase configuration and try again.');
    process.exit(1);
  }
}

// Run the cleanup
runCleanup();
