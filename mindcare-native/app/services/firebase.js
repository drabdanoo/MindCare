import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// Debug logging to see what environment variables are available
console.log('Firebase Environment Variables Debug:');
console.log('- EXPO_PUBLIC_FIREBASE_PROJECT_ID:', process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID);
console.log('- EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET:', process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET);
console.log('- EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:', process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID);
console.log('- EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN);
console.log('- EXPO_PUBLIC_FIREBASE_API_KEY_WEB:', process.env.EXPO_PUBLIC_FIREBASE_API_KEY_WEB);
console.log('- EXPO_PUBLIC_FIREBASE_APP_ID_WEB:', process.env.EXPO_PUBLIC_FIREBASE_APP_ID_WEB);
console.log('- EXPO_PUBLIC_FIREBASE_API_KEY_ANDROID:', process.env.EXPO_PUBLIC_FIREBASE_API_KEY_ANDROID);
console.log('- EXPO_PUBLIC_FIREBASE_APP_ID_ANDROID:', process.env.EXPO_PUBLIC_FIREBASE_APP_ID_ANDROID);
console.log('- Platform:', Platform.OS);

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

// Debug logging for the values that will be used in the config
console.log('Firebase Config Values:');
console.log('- isWeb:', isWeb);
console.log('- apiKey:', apiKey);
console.log('- appId:', appId);
console.log('- authDomain:', authDomain);
console.log('- projectId:', projectId);
console.log('- storageBucket:', storageBucket);
console.log('- messagingSenderId:', messagingSenderId);

// Validate required configuration
const missingConfigs = [];
if (!projectId) missingConfigs.push('EXPO_PUBLIC_FIREBASE_PROJECT_ID');
if (!storageBucket) missingConfigs.push('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET');
if (!messagingSenderId) missingConfigs.push('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');

if (missingConfigs.length > 0) {
  console.error('Missing Firebase configuration:', missingConfigs.join(', '));
  console.error('Please check your .env file and ensure all required variables are set.');
}

if (isWeb && (!apiKey || !appId)) {
  // Provide a friendly error for web when no web credentials are configured
  // This avoids the cryptic Firebase auth/invalid-api-key error.
  // Either add WEB keys to .env or run the Android app instead of web.
  console.warn(
    'Firebase web credentials missing. Set EXPO_PUBLIC_FIREBASE_API_KEY_WEB and EXPO_PUBLIC_FIREBASE_APP_ID_WEB in .env, or run the Android app (which uses Android keys).'
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

console.log('Final Firebase Config:', firebaseConfig);

let app, auth, db;

try {
  // Check if we have minimum required config
  if (projectId && storageBucket && messagingSenderId) {
    app = initializeApp(firebaseConfig);
    
    // Use getAuth() instead of initializeAuth for better compatibility
    auth = getAuth(app);
    
    // Use the default database in the new project unless explicitly set otherwise
    db = getFirestore(app);
    
    console.log('Firebase initialized successfully');
  } else {
    console.error('Firebase not initialized due to missing configuration');
    throw new Error('Firebase configuration is incomplete');
  }
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  // Provide fallback objects to prevent app crashes
  auth = null;
  db = null;
}

export { auth, db };