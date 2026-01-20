import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCO5r-8hPDpEJD2qY2llWyf_gAQXVlu4CU",
    authDomain: "stop-procrastinating-9ffaf.firebaseapp.com",
    projectId: "stop-procrastinating-9ffaf",
    storageBucket: "stop-procrastinating-9ffaf.firebasestorage.app",
    messagingSenderId: "270312713724",
    appId: "1:270312713724:web:98e212793206ff87511679",
    measurementId: "G-KYLVPZXV20"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
