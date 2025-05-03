import { initializeApp, getApps, getApp } from "firebase/app"; // Correct import for app
import { getDatabase } from "firebase/database"; // Keep getDatabase import as is

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyBxMf3oKo6-D-XfO7I5ztnRY951WtCL2k",
  authDomain: "project-eyes-cb262.firebaseapp.com",
  databaseURL:
    "https://project-eyes-cb262-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "project-eyes-cb262",
  storageBucket: "project-eyes-cb262.appspot.com",
  messagingSenderId: "929031932923",
  appId: "1:929031932923:android:97ff76d4259e73209a195e",
};

// Initialize Firebase app only if it's not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize the Firebase Realtime Database
const database = getDatabase(app);

// Debugging: Ensure Firebase is initialized properly
console.log("Firebase App Initialized:", app);

// Export app and database
export { app, database };
