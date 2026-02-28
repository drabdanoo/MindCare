/**
 * Database Seeding Script - Development Only
 * Creates demo doctor profiles for local testing
 * 
 * CRITICAL: This file is ONLY imported when VITE_ENABLE_SEEDING=true
 * Production builds will tree-shake this entire module
 */

import { db } from './firebase.js';
import { collection, doc, getDoc, setDoc, writeBatch } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';

/**
 * Demo doctor data for development/testing
 */
const DEMO_DOCTORS = [
  {
    id: 'demo_doctor_1',
    fullName: 'Dr. Sarah Ahmed',
    specialty: 'Clinical Psychiatrist',
    languages: ['Arabic', 'English'],
    experience: '12 years',
    fee: 50,
    rating: 4.8,
    reviewCount: 124,
    bio: 'Board-certified psychiatrist specializing in anxiety, depression, and trauma therapy. Fluent in Arabic and English.',
    availability: 'Mon-Fri, 9 AM - 5 PM',
    verified: true,
    role: 'doctor',
    email: 'demo.doctor1@mindcare.dev',
  },
  {
    id: 'demo_doctor_2',
    fullName: 'Dr. Omar Hassan',
    specialty: 'Child & Adolescent Psychologist',
    languages: ['Arabic', 'Kurdish', 'English'],
    experience: '8 years',
    fee: 45,
    rating: 4.9,
    reviewCount: 89,
    bio: 'Specialized in working with children and teenagers. Expert in behavioral therapy and family counseling.',
    availability: 'Tue-Sat, 10 AM - 6 PM',
    verified: true,
    role: 'doctor',
    email: 'demo.doctor2@mindcare.dev',
  },
  {
    id: 'demo_doctor_3',
    fullName: 'Dr. Layla Mansour',
    specialty: 'Addiction Counselor',
    languages: ['Arabic', 'English'],
    experience: '15 years',
    fee: 60,
    rating: 4.7,
    reviewCount: 156,
    bio: 'Compassionate addiction specialist with extensive experience in substance abuse recovery and relapse prevention.',
    availability: 'Mon-Fri, 2 PM - 10 PM',
    verified: true,
    role: 'doctor',
    email: 'demo.doctor3@mindcare.dev',
  },
];

/**
 * Check if demo doctors already exist in the database
 * @returns {Promise<boolean>} - True if seeding is needed
 */
async function needsSeeding() {
  try {
    // Check if first demo doctor exists
    const doctorDoc = await getDoc(doc(db, 'doctors', DEMO_DOCTORS[0].id));
    return !doctorDoc.exists();
  } catch (error) {
    console.error('Error checking seeding status:', error);
    return false;
  }
}

/**
 * Seed the database with demo doctor profiles
 * Uses batch writes for efficiency and atomicity
 * 
 * @returns {Promise<void>}
 */
export async function seedDatabase() {
  console.log('🌱 Checking if database seeding is required...');
  
  // Skip if already seeded
  if (!(await needsSeeding())) {
    console.log('✅ Database already contains demo data. Skipping seed.');
    return;
  }
  
  console.log('🌱 Seeding database with demo doctors...');
  
  try {
    // Use batch write for atomic operation
    const batch = writeBatch(db);
    
    DEMO_DOCTORS.forEach(doctor => {
      const doctorRef = doc(db, 'doctors', doctor.id);
      batch.set(doctorRef, {
        ...doctor,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
    
    // Commit all writes atomically
    await batch.commit();
    
    console.log(`✅ Successfully seeded ${DEMO_DOCTORS.length} demo doctors`);
    console.log('📋 Demo doctor IDs:', DEMO_DOCTORS.map(d => d.id));
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

/**
 * Clear demo data (for testing/cleanup)
 * WARNING: Only use in development
 * 
 * @returns {Promise<void>}
 */
export async function clearSeedData() {
  if (import.meta.env.VITE_APP_ENV === 'production') {
    throw new Error('Cannot clear seed data in production');
  }
  
  console.log('🗑️ Clearing demo doctor data...');
  
  const batch = writeBatch(db);
  
  DEMO_DOCTORS.forEach(doctor => {
    const doctorRef = doc(db, 'doctors', doctor.id);
    batch.delete(doctorRef);
  });
  
  await batch.commit();
  
  console.log('✅ Demo data cleared');
}

// Export demo doctor IDs for reference (will be tree-shaken in production)
export const DEMO_DOCTOR_IDS = DEMO_DOCTORS.map(d => d.id);
