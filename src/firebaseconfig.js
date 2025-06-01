// src/firebaseconfig.js

// Import Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ✅ ADD THIS


// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDDo_qvy5B5nG_ylv9p9x_Il7rGDhSqQQY",
  authDomain: "circuithub-75f4a.firebaseapp.com",
  projectId: "circuithub-75f4a",
  storageBucket: "circuithub-75f4a.firebasestorage.app",
  messagingSenderId: "143046842577",
  appId: "1:143046842577:web:2cd6d71c3f919d1a5acdf0",
  measurementId: "G-5XD3DGTZ3P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app); // ✅ ADD THIS

// Export
export { auth, provider, db }; // ✅ ALSO EXPORT db
