import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

// 1) Replace the values below with your Firebase Web App config.
// Firebase Console > Project settings > General > Your apps > Web app.
const firebaseConfig = {
  apiKey: "AIzaSyDYycmTA3wOq0yOg_GuKg8JL7yAg-ndbpo",
  authDomain: "gaby-5a3fc.firebaseapp.com",
  projectId: "gaby-5a3fc",
  storageBucket: "gaby-5a3fc.firebasestorage.app",
  messagingSenderId: "860259382658",
  appId: "1:860259382658:web:b2b0f9b671a915c34b8b9b",
  measurementId: "G-GT2KBMDDKN"
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId &&
  !firebaseConfig.apiKey.includes("YOUR_") &&
  !firebaseConfig.projectId.includes("YOUR_")
);

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
