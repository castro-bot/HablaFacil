import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAuth, Auth } from 'firebase/auth';

/**
 * Firebase configuration from environment variables
 * Following Clean Code: Externalize configuration
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Checks if Firebase is properly configured
 */
export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

// Initialize Firebase only if configured
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured()) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  storage = getStorage(app);
  auth = getAuth(app);
}

/**
 * Get Firestore instance
 * Throws if Firebase is not configured
 */
export function getFirestoreInstance(): Firestore {
  if (!db) {
    throw new Error(
      'Firebase is not configured. Please set up your .env file with Firebase credentials.'
    );
  }
  return db;
}

/**
 * Get Storage instance
 * Throws if Firebase is not configured
 */
export function getStorageInstance(): FirebaseStorage {
  if (!storage) {
    throw new Error(
      'Firebase Storage is not configured. Please set up your .env file with Firebase credentials.'
    );
  }
  return storage;
}

/**
 * Get Auth instance
 * Throws if Firebase is not configured
 */
export function getAuthInstance(): Auth {
  if (!auth) {
    throw new Error(
      'Firebase Auth is not configured. Please set up your .env file with Firebase credentials.'
    );
  }
  return auth;
}

export { app, db, storage, auth };
