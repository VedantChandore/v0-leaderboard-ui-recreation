// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v9-compat and v9+
const firebaseConfig = {
  apiKey: "AIzaSyATDtcN0_WY-FrB4-uPDCFky-3dyRtb-Q8",
  authDomain: "leaderboard-ui-recreation.firebaseapp.com",
  projectId: "leaderboard-ui-recreation",
  storageBucket: "leaderboard-ui-recreation.firebasestorage.app",
  messagingSenderId: "522101456239",
  appId: "1:522101456239:web:c4cd81501708e3ac7e7c9a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;