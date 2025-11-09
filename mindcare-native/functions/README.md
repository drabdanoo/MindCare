# Firebase Functions for Mindcare

This directory contains the backend Cloud Functions for the Mindcare telemedicine application.

## Setup

1. Install dependencies:
```bash
cd functions
npm install
```

2. Build TypeScript:
```bash
npm run build
```

3. Deploy to Firebase:
```bash
npm run deploy
```

Or from the root:
```bash
firebase deploy --only functions
```

## Functions

### `onAppointmentStatusChange`
- **Trigger:** Firestore write to `appointments/{appointmentId}`
- **Purpose:** Listen for appointment creation/status changes and dispatch notifications
- **Behavior:**
  - New appointment (status='pending') → Notify doctor
  - Status change to 'confirmed'/'rejected' → Notify patient
  - Status change to 'cancelled' → Notify doctor (if was confirmed)
  - Status change to 'completed' → Notify patient

## Development

Use the Firebase Emulator to test locally:
```bash
npm run serve
```

View logs:
```bash
npm run logs
```

## Integration Roadmap

The current implementation writes to a `notifications` collection for in-app inbox display.

To add push notifications:
1. Fetch `pushToken` from user document
2. Integrate Expo Push Notifications or Firebase Cloud Messaging (FCM)
3. Call notification service API from `dispatchNotification()`

To add email:
1. Integrate SendGrid, Resend, or similar
2. Fetch user email from Firestore
3. Send templated emails from `dispatchNotification()`
