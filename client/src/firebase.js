import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  //FacebookAuthProvider 
} from "firebase/auth";

// Firebase config is read from environment variables (see client/.env, which is
// gitignored) instead of being hard-coded here. Copy client/.env.example to
// client/.env and fill in the real values for local development, and set the
// same VITE_FIREBASE_* variables in your hosting provider's dashboard for
// production builds (Vercel/Netlify/Render env settings, etc).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

if (!firebaseConfig.apiKey) {
  // Fails fast in dev if the .env file hasn't been set up yet, instead of
  // silently shipping a broken Firebase Auth instance.
  console.error(
    "Missing VITE_FIREBASE_API_KEY — copy client/.env.example to client/.env and fill in your Firebase project's values."
  );
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Add provider exports
export const googleProvider = new GoogleAuthProvider();
//export const facebookProvider = new FacebookAuthProvider();
