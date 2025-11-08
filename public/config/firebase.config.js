// Firebase configuration - loads from environment variables
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Fallback for development (use the credentials from the original firebase.js)
export const fallbackConfig = {
  apiKey: 'AIzaSyCWj52nov-vdKBfHQjz95B-39O19adW4T8',
  authDomain: 'mindcare-9a4d2.firebaseapp.com',
  projectId: 'mindcare-9a4d2',
  storageBucket: 'mindcare-9a4d2.appspot.com',
  messagingSenderId: '424143354909',
  appId: '1:424143354909:web:a792439841410d69b3daf4',
  measurementId: 'G-DMGTJKG75Y',
};
