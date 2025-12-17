# REST API Documentation

**MindCare Telemedicine Platform - API Reference**

Last Updated: December 14, 2025  
Version: 1.0.0  
Base URL: `https://mindcare-9a4d2.web.app` (Production)

---

## Overview

MindCare uses **Firebase Firestore SDK** for data operations, not traditional REST endpoints. This document describes the client-side API patterns and authentication requirements.

**Authentication:** All API operations require Firebase Authentication with valid JWT tokens.

**Authorization:** Role-Based Access Control (RBAC) enforced via Firestore Security Rules.

---

## Authentication

### Login
**Method:** Firebase Auth SDK  
**Function:** `signInWithEmailAndPassword(auth, email, password)`

```javascript
// Request
const userCredential = await signInWithEmailAndPassword(auth, email, password);
const user = userCredential.user;

// Response
{
  "user": {
    "uid": "abc123xyz",
    "email": "patient@example.com",
    "emailVerified": true
  },
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Register
**Method:** Firebase Auth SDK  
**Function:** `createUserWithEmailAndPassword(auth, email, password)`

```javascript
// Request
const userCredential = await createUserWithEmailAndPassword(auth, email, password);

// Response
{
  "user": {
    "uid": "xyz789abc",
    "email": "newpatient@example.com",
    "emailVerified": false
  }
}
```

---

## Appointments API

### Create Appointment

**Endpoint Pattern:** Firestore SDK - `addDoc(collection(db, 'appointments'), data)`  
**Authentication:** Required (Patient role)  
**Validation:** Zod schema (`appointmentSchema.js`)

#### Request Body

```json
{
  "patientId": "abc123xyz",
  "doctorId": "doctor_456",
  "patientName": "John Doe",
  "date": "2025-12-20",
  "time": "14:30",
  "reason": "Follow-up consultation for anxiety management and medication review.",
  "status": "pending"
}
```

#### Request Body Schema (Zod)

```javascript
{
  patientId: z.string().min(1, "Patient ID is required"),
  doctorId: z.string().min(1, "Doctor ID is required"),
  patientName: z.string().min(3, "Name must be at least 3 characters")
                        .max(50, "Name must be less than 50 characters"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  reason: z.string().min(10, "Reason must be at least 10 characters")
                    .max(500, "Reason must be less than 500 characters"),
  status: z.enum(["pending", "accepted", "declined", "completed", "cancelled"])
}
```

#### Success Response (201 Created)

```json
{
  "success": true,
  "appointmentId": "appt_789xyz123",
  "message": "Appointment created successfully",
  "data": {
    "id": "appt_789xyz123",
    "patientId": "abc123xyz",
    "doctorId": "doctor_456",
    "patientName": "John Doe",
    "date": "2025-12-20",
    "time": "14:30",
    "reason": "Follow-up consultation for anxiety management and medication review.",
    "status": "pending",
    "createdAt": "2025-12-14T10:30:00.000Z"
  }
}
```

#### Error Response (400 Bad Request)

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "reason",
      "message": "Reason must be at least 10 characters"
    },
    {
      "field": "date",
      "message": "Invalid date format (YYYY-MM-DD)"
    }
  ]
}
```

#### Error Response (403 Forbidden)

```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Patient can only create appointments for themselves"
}
```

---

### Get User Appointments

**Endpoint Pattern:** Firestore SDK - `getDocs(query(...))`  
**Authentication:** Required  
**Authorization:** User can only access their own appointments

#### Query Parameters

```javascript
// For Patients
const q = query(
  collection(db, 'appointments'),
  where('patientId', '==', currentUserId),
  orderBy('date', 'asc')
);

// For Doctors
const q = query(
  collection(db, 'appointments'),
  where('doctorId', '==', currentUserId),
  orderBy('date', 'asc')
);
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "appt_001",
      "patientId": "abc123xyz",
      "doctorId": "doctor_456",
      "patientName": "John Doe",
      "date": "2025-12-20",
      "time": "14:30",
      "reason": "Follow-up consultation",
      "status": "accepted",
      "createdAt": "2025-12-14T10:30:00.000Z",
      "acceptedAt": "2025-12-14T11:15:00.000Z"
    },
    {
      "id": "appt_002",
      "patientId": "abc123xyz",
      "doctorId": "doctor_789",
      "patientName": "John Doe",
      "date": "2025-12-25",
      "time": "10:00",
      "reason": "Initial consultation",
      "status": "pending",
      "createdAt": "2025-12-14T12:00:00.000Z"
    }
  ]
}
```

---

### Update Appointment Status

**Endpoint Pattern:** Firestore SDK - `updateDoc(doc(db, 'appointments', id), data)`  
**Authentication:** Required  
**Authorization:** Doctor or Admin can update, Patient can cancel their own

#### Request Body

```json
{
  "status": "accepted",
  "acceptedAt": "2025-12-14T15:30:00.000Z"
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Appointment status updated successfully",
  "data": {
    "id": "appt_001",
    "status": "accepted",
    "acceptedAt": "2025-12-14T15:30:00.000Z"
  }
}
```

---

## Prescriptions API

### Create Prescription

**Endpoint Pattern:** Firestore SDK - `addDoc(collection(db, 'prescriptions'), data)`  
**Authentication:** Required (Doctor role only)  
**Validation:** Zod schema (`prescriptionSchema.js`)

#### Request Body

```json
{
  "patientId": "abc123xyz",
  "doctorId": "doctor_456",
  "appointmentId": "appt_789xyz123",
  "medicationName": ["Sertraline", "Alprazolam"],
  "dosage": ["50mg once daily", "0.25mg as needed (max 3x daily)"],
  "instructions": "Take Sertraline in the morning with food. Use Alprazolam only for acute anxiety episodes. Avoid alcohol.",
  "duration": "30 days",
  "refills": 2,
  "status": "active"
}
```

#### Request Body Schema (Zod)

```javascript
{
  patientId: z.string().min(1),
  doctorId: z.string().min(1),
  appointmentId: z.string().min(1),
  medicationName: z.array(z.string().min(1)).min(1).max(10),
  dosage: z.array(z.string().min(1)).min(1),
  instructions: z.string().min(10).max(1000),
  duration: z.string().max(50),
  refills: z.number().int().min(0).max(12),
  status: z.enum(["active", "completed", "cancelled"])
}
```

#### Success Response (201 Created)

```json
{
  "success": true,
  "prescriptionId": "rx_456abc",
  "message": "Prescription created successfully",
  "data": {
    "id": "rx_456abc",
    "patientId": "abc123xyz",
    "doctorId": "doctor_456",
    "appointmentId": "appt_789xyz123",
    "medicationName": ["Sertraline", "Alprazolam"],
    "dosage": ["50mg once daily", "0.25mg as needed (max 3x daily)"],
    "instructions": "Take Sertraline in the morning with food...",
    "duration": "30 days",
    "refills": 2,
    "status": "active",
    "createdAt": "2025-12-14T16:00:00.000Z",
    "expiresAt": "2026-01-13T16:00:00.000Z"
  }
}
```

#### Error Response (403 Forbidden)

```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Only doctors can create prescriptions"
}
```

---

## Reminders API

### Get Pending Reminders

**Endpoint Pattern:** Firestore SDK - `getDocs(query(...))`  
**Authentication:** Required  
**Authorization:** User can only access their own reminders

#### Query Parameters

```javascript
const q = query(
  collection(db, 'reminders'),
  where('userId', '==', currentUserId),
  where('isSent', '==', false),
  where('remindAt', '<=', new Date()),
  orderBy('remindAt', 'asc')
);
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "reminder_001",
      "appointmentId": "appt_001",
      "userId": "abc123xyz",
      "remindAt": "2025-12-19T14:30:00.000Z",
      "type": "24_hours_before",
      "title": "Appointment Reminder",
      "message": "Your appointment with Dr. Smith is tomorrow at 2:30 PM",
      "isSent": false,
      "isRead": false,
      "appointmentData": {
        "doctorName": "Dr. Smith",
        "patientName": "John Doe",
        "dateTime": "2025-12-20T14:30:00.000Z",
        "status": "accepted"
      },
      "createdAt": "2025-12-14T10:30:00.000Z"
    }
  ]
}
```

---

## Doctors API

### Get All Doctors

**Endpoint Pattern:** Firestore SDK - `getDocs(collection(db, 'doctors'))`  
**Authentication:** Optional (public read access)  
**Authorization:** None required

#### Success Response (200 OK)

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "doctor_001",
      "fullName": "Dr. Sarah Smith",
      "specialty": "Psychiatrist",
      "languages": ["English", "Spanish"],
      "experience": "10 years",
      "fee": 150,
      "rating": 4.8,
      "reviewCount": 127,
      "bio": "Board-certified psychiatrist specializing in anxiety and depression treatment.",
      "availability": "Mon-Fri, 9 AM - 5 PM",
      "verified": true,
      "role": "doctor",
      "email": "dr.smith@mindcare.com"
    }
  ]
}
```

---

## Error Codes

| HTTP Status | Error Code | Description |
|-------------|-----------|-------------|
| 400 | `VALIDATION_ERROR` | Request body failed Zod schema validation |
| 401 | `UNAUTHENTICATED` | Missing or invalid Firebase authentication token |
| 403 | `UNAUTHORIZED` | User lacks permission for requested operation (RBAC) |
| 404 | `NOT_FOUND` | Requested resource does not exist |
| 409 | `CONFLICT` | Duplicate resource (e.g., appointment slot already booked) |
| 500 | `INTERNAL_ERROR` | Server error (logged to Sentry) |

---

## Rate Limiting

**Firestore Quotas:**
- Reads: 50,000 per day (free tier)
- Writes: 20,000 per day (free tier)
- Deletes: 20,000 per day (free tier)

**Best Practices:**
- Implement client-side caching for doctor lists
- Use real-time listeners instead of polling
- Batch multiple writes when possible

---

## Code Examples

### JavaScript/TypeScript (Client SDK)

```javascript
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { appointmentSchema } from './validation/appointmentSchema';

// Create appointment with validation
async function createAppointment(appointmentData) {
  try {
    // Validate with Zod
    const validatedData = appointmentSchema.parse(appointmentData);
    
    // Add to Firestore
    const docRef = await addDoc(collection(db, 'appointments'), {
      ...validatedData,
      createdAt: serverTimestamp()
    });
    
    showToast('Appointment booked successfully!', 'success');
    return docRef.id;
  } catch (error) {
    if (error instanceof z.ZodError) {
      showToast(error.errors[0].message, 'error');
    } else {
      console.error('Error creating appointment:', error);
      Sentry.captureException(error);
      showToast('Failed to book appointment', 'error');
    }
  }
}

// Get user appointments
async function getUserAppointments(userId, role) {
  const q = query(
    collection(db, 'appointments'),
    where(role === 'doctor' ? 'doctorId' : 'patientId', '==', userId),
    orderBy('date', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
```

---

## Firestore Security Rules

All API operations are governed by Firestore Security Rules (see `firestore.rules`):

```javascript
// Example: Appointments collection
match /appointments/{appointmentId} {
  allow read: if request.auth != null && 
    (resource.data.patientId == request.auth.uid || 
     resource.data.doctorId == request.auth.uid);
  
  allow create: if request.auth != null && 
    request.resource.data.patientId == request.auth.uid;
  
  allow update: if request.auth != null && 
    (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'doctor' ||
     resource.data.patientId == request.auth.uid);
}
```

---

## Testing

**Unit Tests:** See `__tests__/rbac.test.js` for RBAC authorization tests  
**Integration Tests:** Use Firebase Emulator Suite for local testing

```bash
# Start Firebase emulators
firebase emulators:start

# Run tests against emulators
npm test
```

---

**Next Steps:**
- Add WebSocket documentation for real-time appointment updates
- Document Jitsi Meet video session API integration
- Add payment gateway API documentation (Stripe/PayPal)
