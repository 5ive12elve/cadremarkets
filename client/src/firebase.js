// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJuedadgv8G9zdyuT2kbERqF3qlzBPQeM",
  authDomain: "cadremarkets-fce26.firebaseapp.com",
  projectId: "cadremarkets-fce26",
  storageBucket: "cadremarkets-fce26.firebasestorage.app",
  messagingSenderId: "589781239887",
  appId: "1:589781239887:web:2bc8e9f91e41045062423a"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with optimal settings
export const auth = getAuth(app);

// Configure auth settings for better OAuth performance
auth.languageCode = 'en'; // or use auth.useDeviceLanguage();

// Initialize Firebase Storage
export const storage = getStorage(app);