import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBvo7_gtUMweDDBM6WUhL3IZXDtZoLamNs",
  authDomain: "generator-qr-rzszerzony.firebaseapp.com",
  projectId: "generator-qr-rzszerzony",
  storageBucket: "generator-qr-rzszerzony.firebasestorage.app",
  messagingSenderId: "1079188070816",
  appId: "1:1079188070816:web:161764fc79c1fcf75b44c5",
  measurementId: "G-MJ37F1DELM"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
