import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

// Your Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Safety check for Firebase API Key
if (!firebaseConfig.apiKey) {
  console.warn("⚠️ Firebase API Key is missing. Firebase features will not work.");
}

// Initialize Firebase (safely)
const app = firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null;

// Initialize Firebase Auth
export const auth = app ? getAuth(app) : null;

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider()

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: "select_account",
})

export default app
