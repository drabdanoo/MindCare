# Database Schema Reference

**MindCare Telemedicine Platform - Firestore Database Schema**

Last Updated: December 14, 2025  
Version: 1.0.0

---

## Overview

This document provides a comprehensive reference for all Firestore collections, their fields, relationships, and indexing requirements.

**Collections:**
- [appointments](#appointments-collection) - Appointment scheduling and management
- [prescriptions](#prescriptions-collection) - Medication prescriptions (F4)
- [reminders](#reminders-collection) - Appointment reminder notifications (F4)
- [doctors](#doctors-collection) - Doctor profiles and availability
- [users](#users-collection) - Patient/Doctor user accounts

---

## Collections

### `appointments` Collection

**Purpose:** Stores all appointment bookings between patients and doctors.

**Security Rules:** Firestore rules enforce that patients can only read/write their own appointments, and doctors can only access appointments assigned to them.

#### Schema

| Field Name | Data Type | Required | Purpose/Relation | Constraints |
|-----------|-----------|----------|------------------|-------------|
| `patientId` | `string` | ✅ | Links to user document in `/users` | Non-empty, must match authenticated user |
| `doctorId` | `string` | ✅ | Links to doctor document in `/doctors` | Non-empty, must be verified doctor |
| `patientName` | `string` | ✅ | Patient's full name for display | 3-50 characters (Zod validated) |
| `date` | `string` | ✅ | Appointment date (ISO format) | Format: YYYY-MM-DD |
| `time` | `string` | ✅ | Appointment time (24-hour format) | Format: HH:MM |
| `reason` | `string` | ✅ | Patient's reason for visit | 10-500 characters (Zod validated) |
| `status` | `string` | ✅ | Current appointment state | Enum: `pending`, `accepted`, `declined`, `completed`, `cancelled`, `in-progress` |
| `createdAt` | `Timestamp` | ✅ | Creation timestamp | Server timestamp |
| `acceptedAt` | `Timestamp` | ❌ | When doctor accepted | Server timestamp |
| `completionNote` | `string` | ❌ | Doctor's notes after session | Max 1000 characters |
| `hasPrescription` | `boolean` | ❌ | Whether prescription was created | Default: false |
| `prescriptionId` | `string` | ❌ | Links to prescription in `/prescriptions` | Only present if hasPrescription=true |
| `sessionStartedAt` | `Timestamp` | ❌ | Video session start time | Server timestamp |
| `sessionEndedAt` | `Timestamp` | ❌ | Video session end time | Server timestamp |

#### Composite Indexes

**Required for efficient queries:**

```json
{
  "collectionGroup": "appointments",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "patientId", "order": "ASCENDING" },
    { "fieldPath": "date", "order": "ASCENDING" }
  ]
}
```

```json
{
  "collectionGroup": "appointments",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "doctorId", "order": "ASCENDING" },
    { "fieldPath": "date", "order": "ASCENDING" }
  ]
}
```

#### Common Queries

```javascript
// Get all appointments for a patient
const q = query(
  collection(db, 'appointments'),
  where('patientId', '==', userId),
  orderBy('date', 'asc')
);

// Get all appointments for a doctor
const q = query(
  collection(db, 'appointments'),
  where('doctorId', '==', doctorId),
  orderBy('date', 'asc')
);
```

---

### `prescriptions` Collection

**Purpose:** Stores medication prescriptions created by doctors for patients.

**Security Rules:** Only the prescribing doctor can create/update. Both patient and doctor can read.

#### Schema

| Field Name | Data Type | Required | Purpose/Relation | Constraints |
|-----------|-----------|----------|------------------|-------------|
| `patientId` | `string` | ✅ | Links to user in `/users` | Non-empty |
| `doctorId` | `string` | ✅ | Links to doctor in `/doctors` | Must match authenticated doctor |
| `appointmentId` | `string` | ✅ | Links to appointment in `/appointments` | Non-empty |
| `medicationName` | `Array<string>` | ✅ | List of prescribed medications | 1-10 items, each non-empty |
| `dosage` | `Array<string>` | ✅ | Dosage for each medication | Must match medicationName array length |
| `instructions` | `string` | ✅ | General patient instructions | 10-1000 characters |
| `duration` | `string` | ✅ | Prescription duration | Max 50 characters (e.g., "30 days") |
| `refills` | `number` | ✅ | Number of refills allowed | Integer, 0-12 |
| `status` | `string` | ✅ | Prescription status | Enum: `active`, `completed`, `cancelled` |
| `createdAt` | `Timestamp` | ✅ | Creation timestamp | Server timestamp |
| `expiresAt` | `Timestamp` | ✅ | Expiration date | Calculated: createdAt + duration |
| `notes` | `string` | ❌ | Private doctor notes | Max 1000 characters |
| `pharmacyInstructions` | `string` | ❌ | Instructions for pharmacy | Max 500 characters |

#### Composite Indexes

```json
{
  "collectionGroup": "prescriptions",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "patientId", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

```json
{
  "collectionGroup": "prescriptions",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "doctorId", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

---

### `reminders` Collection

**Purpose:** Stores appointment reminder notifications for both patients and doctors.

**Security Rules:** Users can only read/update their own reminders.

#### Schema

| Field Name | Data Type | Required | Purpose/Relation | Constraints |
|-----------|-----------|----------|------------------|-------------|
| `appointmentId` | `string` | ✅ | Links to appointment in `/appointments` | Non-empty |
| `userId` | `string` | ✅ | Links to user in `/users` (patient or doctor) | Non-empty |
| `remindAt` | `Timestamp` | ✅ | When to trigger notification | Must be future timestamp |
| `type` | `string` | ✅ | Reminder type | Enum: `24_hours_before`, `1_hour_before`, `30_minutes_before` |
| `title` | `string` | ✅ | Notification title | Non-empty |
| `message` | `string` | ✅ | Notification message | Non-empty |
| `isSent` | `boolean` | ✅ | Delivery status | Default: false |
| `isRead` | `boolean` | ✅ | User acknowledgment status | Default: false |
| `appointmentData` | `Object` | ✅ | Cached appointment metadata | See sub-fields below |
| `appointmentData.doctorName` | `string` | ✅ | Doctor's name for display | Non-empty |
| `appointmentData.patientName` | `string` | ✅ | Patient's name for display | Non-empty |
| `appointmentData.dateTime` | `Timestamp` | ✅ | Appointment time | Non-empty |
| `appointmentData.status` | `string` | ✅ | Appointment status | Enum: `accepted`, `pending` |
| `createdAt` | `Timestamp` | ✅ | Creation timestamp | Server timestamp |
| `sentAt` | `Timestamp` | ❌ | Delivery timestamp | Server timestamp |

#### Composite Indexes

```json
{
  "collectionGroup": "reminders",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "isSent", "order": "ASCENDING" },
    { "fieldPath": "remindAt", "order": "ASCENDING" }
  ]
}
```

---

### `doctors` Collection

**Purpose:** Stores doctor profiles, specialties, and availability.

**Security Rules:** Public read access. Only the doctor can update their own profile.

#### Schema

| Field Name | Data Type | Required | Purpose/Relation | Constraints |
|-----------|-----------|----------|------------------|-------------|
| `fullName` | `string` | ✅ | Doctor's full name | 3-100 characters |
| `specialty` | `string` | ✅ | Medical specialty | Non-empty |
| `languages` | `Array<string>` | ✅ | Languages spoken | At least 1 language |
| `experience` | `string` | ✅ | Years of experience | Non-empty |
| `fee` | `number` | ✅ | Session fee in USD | Positive number |
| `rating` | `number` | ❌ | Average rating | 0-5 |
| `reviewCount` | `number` | ❌ | Number of reviews | Non-negative integer |
| `bio` | `string` | ✅ | Professional biography | Max 500 characters |
| `availability` | `string` | ✅ | Availability schedule | Non-empty |
| `verified` | `boolean` | ✅ | Verification status | Default: false |
| `role` | `string` | ✅ | User role | Always `doctor` |
| `email` | `string` | ✅ | Contact email | Valid email format |
| `createdAt` | `Timestamp` | ✅ | Profile creation date | Server timestamp |
| `updatedAt` | `Timestamp` | ✅ | Last update timestamp | Server timestamp |

---

### `users` Collection

**Purpose:** Stores user accounts for both patients and doctors.

**Security Rules:** Users can only read/write their own document.

#### Schema

| Field Name | Data Type | Required | Purpose/Relation | Constraints |
|-----------|-----------|----------|------------------|-------------|
| `fullName` | `string` | ✅ | User's full name | 3-100 characters |
| `email` | `string` | ✅ | Email address | Valid email, unique |
| `phone` | `string` | ✅ | Phone number | Valid phone format |
| `dob` | `string` | ✅ | Date of birth | ISO date format |
| `role` | `string` | ✅ | User role | Enum: `patient`, `doctor`, `admin` |
| `createdAt` | `Timestamp` | ✅ | Account creation date | Server timestamp |

---

## Relationships

### Entity Relationship Diagram (ERD)

```
users (patients)
  ├── 1:N → appointments (patientId)
  ├── 1:N → prescriptions (patientId)
  └── 1:N → reminders (userId)

doctors
  ├── 1:N → appointments (doctorId)
  ├── 1:N → prescriptions (doctorId)
  └── 1:N → reminders (userId)

appointments
  ├── 1:1 → prescriptions (appointmentId)
  └── 1:N → reminders (appointmentId)
```

---

## Data Validation

All write operations are validated using:
1. **Client-Side:** Zod schemas (see `public/validation/*.js`)
2. **Server-Side:** Firestore Security Rules (see `firestore.rules`)

**Example Zod Schema Reference:**
- `appointmentSchema.js` - Appointment creation validation
- `prescriptionSchema.js` - Prescription creation validation

---

## Backup and Recovery

- **Automated Backups:** Firestore automatic daily backups (enabled in Firebase Console)
- **Export Command:** `gcloud firestore export gs://mindcare-backups`
- **Retention Policy:** 30 days

---

## Migration History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-12-14 | Initial schema documentation | Development Team |

---

**Next Steps:**
- Add `payments` collection schema when payment integration is implemented
- Document `sessions` collection for video call metadata
- Add `notifications` collection for system notifications
