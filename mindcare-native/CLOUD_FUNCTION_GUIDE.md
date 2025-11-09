# Mindcare Cloud Functions Implementation Guide

## Overview

The Mindcare application uses Firebase Cloud Functions to automatically trigger notifications whenever appointments are created or their status changes. This document provides the complete implementation and deployment instructions.

---

## Cloud Function: `onAppointmentStatusChange`

### Location
- **Directory:** `functions/src/appointmentNotifications.ts`
- **Main Entry:** `functions/src/index.ts`

### Trigger
- **Event:** Firestore `onWrite` on `appointments/{appointmentId}`
- **Covers:** Both new documents and updates

### Logic Flow

```
1. Listen for write event to appointments/{appointmentId}
   ↓
2. Detect if document is new or if status field changed
   ↓
3. Determine recipient based on status transition:
   - New/pending          → Notify Doctor
   - confirmed/rejected   → Notify Patient
   - cancelled            → Notify Doctor (if was confirmed)
   - completed            → Notify Patient
   ↓
4. Fetch recipient details (name, contact info) from users collection
   ↓
5. Dispatch notification (mock or real):
   - Log to Cloud Functions console
   - Write to notifications Firestore collection (in-app inbox)
   - [Future] Send Expo Push, Email, or FCM notification
```

### Complete Function Code

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Cloud Function: onAppointmentStatusChange
 * 
 * Triggered on write to the appointments collection.
 * Detects status changes and sends notifications:
 * - 'pending': Notify doctor of new booking
 * - 'confirmed'/'rejected': Notify patient of decision
 * - 'completed': Optionally notify patient
 * - 'cancelled': Notify the other party
 */
export const onAppointmentStatusChange = functions
  .firestore
  .document('appointments/{appointmentId}')
  .onWrite(async (change, context) => {
    const appointmentId = context.params.appointmentId;

    // Get before/after snapshots
    const beforeData = change.before.exists ? change.before.data() : null;
    const afterData = change.after.exists ? change.after.data() : null;

    // If document was deleted, skip
    if (!afterData) {
      console.log(`Appointment ${appointmentId} deleted; skipping notification.`);
      return;
    }

    // Extract key fields
    const {
      patientId,
      doctorId,
      date,
      timeSlot,
      status: newStatus,
    } = afterData;

    // Ensure required fields exist
    if (!patientId || !doctorId || !newStatus) {
      console.warn(`Appointment ${appointmentId} missing required fields; skipping.`);
      return;
    }

    // Determine if this is a new document or a status change
    const isNewDocument = !beforeData;
    const oldStatus = beforeData?.status || null;
    const statusChanged = newStatus !== oldStatus;

    // Only notify if document is new or status changed
    if (!isNewDocument && !statusChanged) {
      console.log(`Appointment ${appointmentId}: no status change; skipping.`);
      return;
    }

    console.log(
      `Appointment ${appointmentId}: ${oldStatus || 'NEW'} → ${newStatus}`
    );

    // Determine recipient and message based on status
    let recipientId: string | null = null;
    let recipientType: 'doctor' | 'patient' | null = null;
    let messageTitle = '';
    let messageBody = '';

    if (isNewDocument || newStatus === 'pending') {
      // New appointment → notify doctor
      recipientId = doctorId;
      recipientType = 'doctor';
      messageTitle = 'New Appointment Request';
      messageBody = `A patient has requested an appointment on ${date} at ${timeSlot}.`;
    } else if (newStatus === 'confirmed') {
      // Appointment confirmed → notify patient
      recipientId = patientId;
      recipientType = 'patient';
      messageTitle = 'Appointment Confirmed';
      messageBody = `Your appointment on ${date} at ${timeSlot} has been confirmed.`;
    } else if (newStatus === 'rejected') {
      // Appointment rejected → notify patient
      recipientId = patientId;
      recipientType = 'patient';
      messageTitle = 'Appointment Rejected';
      messageBody = `Your appointment request for ${date} at ${timeSlot} has been rejected.`;
    } else if (newStatus === 'cancelled') {
      // Appointment cancelled → notify the other party (if old status was confirmed)
      const otherParty = oldStatus === 'confirmed' ? 'doctor' : null;
      if (otherParty) {
        recipientId = doctorId;
        recipientType = 'doctor';
        messageTitle = 'Appointment Cancelled';
        messageBody = `Your appointment on ${date} at ${timeSlot} has been cancelled by the patient.`;
      }
    } else if (newStatus === 'completed') {
      // Appointment completed → notify patient
      recipientId = patientId;
      recipientType = 'patient';
      messageTitle = 'Appointment Completed';
      messageBody = `Your appointment on ${date} has been completed. Thank you for using Mindcare.`;
    }

    // If no recipient determined, skip
    if (!recipientId) {
      console.log(`No recipient determined for status: ${newStatus}`);
      return;
    }

    try {
      // Fetch recipient details (name, push token, etc.)
      const recipientSnap = await db.collection('users').doc(recipientId).get();
      const recipientData = recipientSnap.data();

      if (!recipientSnap.exists) {
        console.warn(`Recipient ${recipientId} not found in users collection.`);
        return;
      }

      const recipientName = recipientData?.fullName || 'User';

      // Type guard: ensure recipientType is not null
      if (!recipientType) {
        console.log(`No recipient type determined; skipping dispatch.`);
        return;
      }

      // Dispatch notification
      await dispatchNotification({
        recipientId,
        recipientType,
        recipientName,
        messageTitle,
        messageBody,
        appointmentId,
        appointmentData: afterData,
      });

      console.log(
        `✓ Notification queued for ${recipientType} (${recipientId}): "${messageTitle}"`
      );
    } catch (error) {
      console.error(`Failed to process appointment notification:`, error);
    }
  });

/**
 * Mock notification dispatch function
 * In production, integrate with:
 * - Expo Push Notifications (for mobile)
 * - SendGrid / Resend (for email)
 * - Firebase Cloud Messaging (FCM)
 * - In-app inbox (Firestore collection)
 */
async function dispatchNotification(payload: {
  recipientId: string;
  recipientType: 'doctor' | 'patient';
  recipientName: string;
  messageTitle: string;
  messageBody: string;
  appointmentId: string;
  appointmentData: any;
}): Promise<void> {
  const {
    recipientId,
    recipientType,
    recipientName,
    messageTitle,
    messageBody,
    appointmentId,
    appointmentData,
  } = payload;

  // Mock implementation: log to console
  console.log({
    event: 'NOTIFICATION_DISPATCHED',
    timestamp: new Date().toISOString(),
    recipient: {
      id: recipientId,
      type: recipientType,
      name: recipientName,
    },
    message: {
      title: messageTitle,
      body: messageBody,
    },
    appointment: {
      id: appointmentId,
      status: appointmentData.status,
      date: appointmentData.date,
      timeSlot: appointmentData.timeSlot,
    },
    nextSteps: 'Integrate with Expo Push, Email, or FCM service',
  });

  // Write to notifications collection for in-app inbox
  const notificationRef = db.collection('notifications').doc();
  await notificationRef.set({
    recipientId,
    recipientType,
    title: messageTitle,
    body: messageBody,
    appointmentId,
    status: 'unread',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`✓ Notification document written to collection for ${recipientId}`);
}
```

---

## Status Change Notification Matrix

| Transition | Recipient | Message |
|-----------|-----------|---------|
| NEW → pending | Doctor | "New appointment request from [Patient] on [Date] at [Time]" |
| pending → confirmed | Patient | "Your appointment on [Date] at [Time] has been confirmed" |
| pending → rejected | Patient | "Your appointment request for [Date] at [Time] has been rejected" |
| confirmed → cancelled | Doctor | "Your appointment on [Date] at [Time] has been cancelled by the patient" |
| confirmed → completed | Patient | "Your appointment on [Date] has been completed" |

---

## Frontend Integration (Already Implemented)

### AppointmentScheduler.js
When a patient books an appointment:
```javascript
const appointment = {
  patientId,
  doctorId,
  date,
  timeSlot,
  status: 'pending',  // ← Triggers function: notifies doctor
  createdAt: serverTimestamp(),
};
await addDoc(appointmentsRef, appointment);
```

### DoctorAppointmentManager.js
When a doctor confirms/rejects:
```javascript
await updateDoc(doc(db, 'appointments', id), { status: next });
// Where next is 'confirmed' or 'rejected' → Triggers function: notifies patient
```

---

## Deployment

### Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project initialized: `firebase init functions`
- Authenticated to Firebase: `firebase login`

### Steps

1. **Navigate to functions directory:**
   ```bash
   cd functions
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build TypeScript (if using .ts):**
   ```bash
   npm run build
   ```

4. **Deploy to Firebase:**
   ```bash
   firebase deploy --only functions
   ```

   Or from root:
   ```bash
   firebase deploy --only functions:onAppointmentStatusChange
   ```

5. **Monitor logs:**
   ```bash
   firebase functions:log
   ```

---

## Testing Locally

### Option 1: Firebase Emulator
```bash
firebase emulators:start --only firestore,functions
```

Then trigger appointments via Firestore console to see logs.

### Option 2: Deployed Function
Once deployed, any appointment write will trigger the function. Check logs via:
```bash
firebase functions:log --lines 50
```

---

## Future Enhancements

### 1. Expo Push Notifications
```typescript
const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
await expo.sendPushNotificationsAsync([{
  to: recipientData.pushToken,
  title: messageTitle,
  body: messageBody,
  data: { appointmentId },
}]);
```

### 2. Email Notifications
```typescript
import sgMail from '@sendgrid/mail';
await sgMail.send({
  to: recipientData.email,
  from: 'noreply@mindcare.app',
  subject: messageTitle,
  text: messageBody,
  html: `<h2>${messageTitle}</h2><p>${messageBody}</p>`,
});
```

### 3. FCM (Firebase Cloud Messaging)
```typescript
await admin.messaging().send({
  token: recipientData.fcmToken,
  notification: { title: messageTitle, body: messageBody },
  data: { appointmentId, recipientType },
});
```

### 4. In-App Notification History
Already implemented—writes to `notifications` collection. Frontend can query:
```javascript
const notificationsRef = query(
  collection(db, 'notifications'),
  where('recipientId', '==', currentUser.uid),
  orderBy('createdAt', 'desc')
);
```

---

## Security Considerations

- **No direct writes to notifications:** Cloud Function is the only writer (prevents user spoofing)
- **Recipient validation:** Function checks user exists before dispatching
- **Immutable appointment status:** Firestore rules enforce status-only updates by doctor
- **Audit trail:** All notifications logged to Firestore with timestamps

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Function not triggering | Check Firestore rules allow reads/writes; verify appointmentId format |
| "Missing required fields" warning | Ensure appointment doc has patientId, doctorId, status, date, timeSlot |
| Notifications not written | Check notifications collection in Firestore console; verify permissions |
| Deployment fails | Run `npm run build` locally; check TypeScript errors |
| Can't find recipient | Verify user doc exists in users/{userId} with fullName field |

---

## Summary

✅ **Complete:** Cloud Function triggers on all appointment writes  
✅ **Complete:** Status transitions properly routed to doctor/patient  
✅ **Complete:** Mock notifications logged to console and Firestore  
✅ **Ready:** Integrated with frontend (AppointmentScheduler, DoctorAppointmentManager)  
✅ **Ready:** Deploy to production via Firebase CLI  
⏳ **Future:** Add real push/email notifications via external services  

