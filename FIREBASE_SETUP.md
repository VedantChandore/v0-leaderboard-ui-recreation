# 🚀 Firebase Authentication Setup Instructions

This project now includes Firebase Authentication! Follow these simple steps to set up authentication:

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `leaderboard-ui-recreation`
4. Follow the setup wizard (you can disable Google Analytics if you want)

## Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password** and **Google** sign-in methods

## Step 3: Add Your Web App

1. In Project Overview, click the **Web** icon (`</>`)
2. Register your app with nickname: `leaderboard-ui`
3. Copy the Firebase config object

## Step 4: Update Firebase Config

Open `lib/firebase.js` and replace the placeholder config with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com", 
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-actual-app-id"
};
```

## Step 5: Set Up Authentication Domain (for Google Sign-in)

1. In Firebase Console, go to **Authentication > Settings**
2. In **Authorized domains**, add your domain:
   - For local development: `localhost`
   - For production: your actual domain

## 🎉 That's it!

Your authentication is now ready! The app will:

- ✅ Show a login form when users are not authenticated
- ✅ Support Email/Password and Google sign-in
- ✅ Display user info in the sidebar once logged in
- ✅ Include a working logout button
- ✅ Protect the leaderboard behind authentication

## Features Included:

- 🔐 **Protected Routes**: Users must login to view the leaderboard
- 👤 **User Profile**: Shows authenticated user's name/email in sidebar  
- 🚪 **Easy Logout**: Red logout button in the sidebar
- 🔄 **Loading States**: Smooth loading experience
- 🎨 **Beautiful UI**: Matches the existing Google Cloud theme
- ⚡ **Google Sign-in**: One-click authentication with Google

## Running the App

```bash
npm run dev
```

Visit `http://localhost:3001` and you'll see the login screen first!

---

**Note**: The Firebase config in `lib/firebase.js` needs to be updated with your actual Firebase project credentials for authentication to work.