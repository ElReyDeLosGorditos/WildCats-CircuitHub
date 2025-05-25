// src/firebaseconfig.js

// Import Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ✅ ADD THIS

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBVgacn_-wnDHkJcH9lS6nY9FqhjM5M0nE",
  authDomain: "ccs-gadgethub.firebaseapp.com",
  projectId: "ccs-gadgethub",
  storageBucket: "ccs-gadgethub.appspot.com",
  messagingSenderId: "470573412326",
  appId: "1:470573412326:web:02af5e8f0c13f2590a3027",
  measurementId: "G-NNC1R8YVTW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app); // ✅ ADD THIS

// Export
export { auth, provider, db }; // ✅ ALSO EXPORT db
