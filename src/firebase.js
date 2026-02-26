import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAkXuqeb3oqnUdS5DP5cad7L-PlAy5rCL0",
  authDomain: "ferramenta-pwa-52765.firebaseapp.com",
  projectId: "ferramenta-pwa-52765",
  storageBucket: "ferramenta-pwa-52765.firebasestorage.app",
  messagingSenderId: "33627759029",
  appId: "1:33627759029:web:0b609c47195be353ee39fc",
  measurementId: "G-6CVNPT6BM1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, googleProvider, signInWithPopup, signOut, db };