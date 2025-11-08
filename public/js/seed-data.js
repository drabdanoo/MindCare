// Script to seed sample doctors into Firestore
// Run this once to populate the database with sample data

import { db } from './firebase-init.js';
import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';

const sampleDoctors = [
  {
    name: 'Dr. Ahmed Al-Rashid',
    specialization: 'Psychiatrist',
    languages: ['Arabic', 'English'],
    yearsExp: 12,
    rate: 50,
    rating: 4.8,
    bio: 'Specialized in depression and anxiety disorders',
    image: '👨‍⚕️',
    verified: true,
    createdAt: serverTimestamp(),
  },
  {
    name: 'Dr. Layla Hassan',
    specialization: 'Psychologist',
    languages: ['Arabic', 'Kurdish'],
    yearsExp: 8,
    rate: 40,
    rating: 4.9,
    bio: 'Expert in family therapy and trauma counseling',
    image: '👩‍⚕️',
    verified: true,
    createdAt: serverTimestamp(),
  },
  {
    name: 'Dr. Karim Saleh',
    specialization: 'Counselor',
    languages: ['Arabic', 'English', 'Kurdish'],
    yearsExp: 6,
    rate: 30,
    rating: 4.7,
    bio: 'Specializes in stress management and life coaching',
    image: '👨‍⚕️',
    verified: true,
    createdAt: serverTimestamp(),
  },
  {
    name: 'Dr. Fatima Al-Zahra',
    specialization: 'Psychiatrist',
    languages: ['Arabic', 'English'],
    yearsExp: 15,
    rate: 60,
    rating: 4.9,
    bio: 'Specializes in women mental health and PTSD',
    image: '👩‍⚕️',
    verified: true,
    createdAt: serverTimestamp(),
  },
  {
    name: 'Dr. Hassan Al-Mousawi',
    specialization: 'Psychologist',
    languages: ['Arabic', 'Kurdish', 'English'],
    yearsExp: 10,
    rate: 45,
    rating: 4.8,
    bio: 'Expert in adolescent psychology and behavioral therapy',
    image: '👨‍⚕️',
    verified: true,
    createdAt: serverTimestamp(),
  },
];

export async function seedDoctors() {
  try {
    const doctorsRef = collection(db, 'doctors');
    
    for (const doctor of sampleDoctors) {
      await addDoc(doctorsRef, doctor);
    }
    
    alert('Sample doctors added successfully!');
    return true;
  } catch (error) {
    alert(`Error seeding doctors: ${error.message}`);
    return false;
  }
}

// Call this function from browser console to seed data
window.seedDoctors = seedDoctors;
