import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// Avoid logging sensitive values to the console.

// Support platform-specific keys so web and android can use different API keys/appIds
const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const isWeb = Platform.OS === 'web';

const apiKey = isWeb
  ? (process.env.EXPO_PUBLIC_FIREBASE_API_KEY_WEB || '')
  : (process.env.EXPO_PUBLIC_FIREBASE_API_KEY_ANDROID || process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '');

const appId = isWeb
  ? (process.env.EXPO_PUBLIC_FIREBASE_APP_ID_WEB || '')
  : (process.env.EXPO_PUBLIC_FIREBASE_APP_ID_ANDROID || process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '');

const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`;

// Do not log Firebase config in production or development to prevent accidental leaks.

// Validate required configuration
const missingConfigs = [];
if (!projectId) missingConfigs.push('EXPO_PUBLIC_FIREBASE_PROJECT_ID');
if (!storageBucket) missingConfigs.push('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET');
if (!messagingSenderId) missingConfigs.push('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');

if (missingConfigs.length > 0) {
  // Missing configuration; ensure your .env values are set.
}

if (isWeb && (!apiKey || !appId)) {
  throw new Error(
    'Firebase web credentials are missing. Please set EXPO_PUBLIC_FIREBASE_API_KEY_WEB and EXPO_PUBLIC_FIREBASE_APP_ID_WEB in your .env, then restart the Expo server. Alternatively, run the Android app which uses Android Firebase keys.'
  );
}


// Only initialize Firebase if we have the basic required configuration
const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
};

// Do not log full config to avoid leaking credentials

let app, auth, db;

try {
  // Check if we have minimum required config
  if (projectId && storageBucket && messagingSenderId) {
    app = initializeApp(firebaseConfig);
    
    // Use getAuth() instead of initializeAuth for better compatibility
    auth = getAuth(app);
    
    // Use the default database in the new project unless explicitly set otherwise
    db = getFirestore(app);
    
    // Firebase initialized.
  } else {
    // Firebase not initialized due to missing configuration
    throw new Error('Firebase configuration is incomplete');
  }
} catch (error) {
  // Failed to initialize Firebase
  // Provide fallback objects to prevent app crashes
  auth = null;
  db = null;
}

export { auth, db };