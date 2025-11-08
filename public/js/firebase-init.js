import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';

// Use fallback config for now (in production, use environment variables)
const firebaseConfig = {
  apiKey: 'AIzaSyCWj52nov-vdKBfHQjz95B-39O19adW4T8',
  authDomain: 'mindcare-9a4d2.firebaseapp.com',
  projectId: 'mindcare-9a4d2',
  storageBucket: 'mindcare-9a4d2.appspot.com',
  messagingSenderId: '424143354909',
  appId: '1:424143354909:web:a792439841410d69b3daf4',
  measurementId: 'G-DMGTJKG75Y',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log('Firebase initialized successfully');
