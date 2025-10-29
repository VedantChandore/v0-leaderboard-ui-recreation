// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your leaderboard Firebase configuration
const leaderboardConfig = {
  apiKey: "AIzaSyDDaoyykpvt86aEhxOlH11w6gvU6KeCHyY",
  authDomain: "gdg-leaderboard-82013.firebaseapp.com",
  projectId: "gdg-leaderboard-82013",
  storageBucket: "gdg-leaderboard-82013.firebasestorage.app",
  messagingSenderId: "504131997053",
  appId: "1:504131997053:web:b28f0b6c0b8d17498a9014",
  measurementId: "G-WRF4GF23QX"
};


// Initialize Firebase app for leaderboard (separate from auth)
const leaderboardApp = initializeApp(leaderboardConfig, 'leaderboard');

// Initialize Cloud Firestore and get a reference to the service
export const leaderboardDB = getFirestore(leaderboardApp);

export default leaderboardApp;