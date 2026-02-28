# MindCare Native - React Native Mobile App

## Overview

MindCare Native is a cross-platform mobile application for telemedicine consultations, built with React Native and Expo. The app provides secure video consultations, appointment management, and prescription tracking.

## Tech Stack

- **Framework:** React Native (Expo)
- **Language:** TypeScript
- **Backend:** Firebase (Auth, Firestore)
- **Navigation:** React Navigation 7
- **Notifications:** Expo Notifications
- **State Management:** React Hooks

## Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Studio (for Android development)
- Firebase project with active Firestore and Authentication

## Installation

### 1. Clone and Install Dependencies

```bash
cd MindCareNative
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and add your Firebase credentials:

```bash
cp .env.example .env
```

Edit `.env` with your Firebase configuration:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 3. Update app.config.ts

Ensure your `app.config.ts` has the correct bundle identifiers and permissions.

## Running the App

### Start Development Server

```bash
npm start
```

This opens the Expo DevTools in your browser. From here you can:

### Run on Android

```bash
npm run android
```

Or scan the QR code with the Expo Go app (Android).

### Run on iOS

```bash
npm run ios
```

Or scan the QR code with Camera app (iOS).

### Run on Web

```bash
npm run web
```

## Project Structure

```
MindCareNative/
├── App.tsx                 # Root component with navigation
├── app.config.ts           # Expo configuration
├── config/
│   └── firebase.ts         # Firebase initialization
├── screens/
│   ├── LoginScreen.tsx     # Login screen
│   ├── RegisterScreen.tsx  # Registration screen
│   ├── PatientDashboard.tsx # Patient appointment list
│   └── DoctorDashboard.tsx  # Doctor appointment management
├── components/             # Reusable UI components
├── utils/
│   ├── validation.ts       # Form validation utilities
│   └── notifications.ts    # Push notification setup
├── services/              # API/Database services
└── types/                 # TypeScript type definitions
```

## Features Implemented

### Authentication
- ✅ Email/Password registration
- ✅ Login with validation
- ✅ Role-based authentication (Patient/Doctor)
- ✅ Secure session management

### Patient Features
- ✅ View appointments (real-time)
- ✅ Appointment status tracking
- ✅ Pull-to-refresh appointments

### Doctor Features
- ✅ View all appointments (real-time)
- ✅ Accept/Decline appointments
- ✅ Mark appointments as completed
- ✅ Dashboard statistics

### Input Validation
- ✅ Email format validation
- ✅ Password strength requirements
- ✅ Phone number validation
- ✅ Full name validation
- ✅ Inline error messages

### UI/UX
- ✅ Material Design principles
- ✅ Smooth animations
- ✅ Loading states
- ✅ Empty states
- ✅ Status badges with color coding

## Building for Production

### Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

### Configure EAS Build

```bash
eas build:configure
```

### Build for Android

```bash
npm run build:android
```

### Build for iOS

```bash
npm run build:ios
```

## Environment Variables Reference

| Variable                                   | Description               | Required |
|--------------------------------------------|---------------------------|----------|
| `EXPO_PUBLIC_FIREBASE_API_KEY`             | Firebase API key          | Yes      |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`         | Firebase auth domain      | Yes      |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID`          | Firebase project ID       | Yes      |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`      | Firebase storage bucket   | Yes      |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID        | Yes      |
| `EXPO_PUBLIC_FIREBASE_APP_ID`              | Firebase app ID           | Yes      |
| `EXPO_PUBLIC_SENTRY_DSN`                   | Sentry error tracking DSN | No       |

## Troubleshooting

### Firebase Connection Issues

Ensure your Firebase project has:
- Authentication enabled (Email/Password provider)
- Firestore database created
- Security rules configured (see `firestore.rules` in web app)

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
expo start --clear
```

### iOS Simulator Issues

```bash
# Reset iOS simulator
xcrun simctl erase all
```

### Android Emulator Issues

```bash
# Cold boot Android emulator
emulator -avd <device-name> -no-snapshot-load
```

## Testing

### Manual Testing Checklist

- [ ] Register new patient account
- [ ] Login with patient credentials
- [ ] View appointments (should be empty)
- [ ] Logout
- [ ] Register doctor account
- [ ] Login as doctor
- [ ] View appointments dashboard
- [ ] Accept/decline appointments
- [ ] Logout

## Security Best Practices

- ✅ Environment variables for Firebase config
- ✅ No hardcoded credentials
- ✅ Input validation on all forms
- ✅ Firestore security rules enforce RBAC
- ✅ Password requirements enforced
- ✅ Secure authentication flow

## Performance Optimizations

- Real-time Firestore listeners (no polling)
- Memoized components where applicable
- Optimized FlatList rendering
- Lazy loading for large lists

## Future Enhancements

- [ ] Video call integration (Jitsi Meet)
- [ ] Prescription management UI
- [ ] Push notifications for reminders
- [ ] In-app messaging
- [ ] Payment integration
- [ ] Profile editing
- [ ] Doctor search and filtering
- [ ] Appointment booking flow
- [ ] Dark mode support
- [ ] Offline support

## Support

For issues or questions:
- Check Firebase Console for backend errors
- Review Expo logs: `expo start` terminal output
- Check React Native debugger for frontend errors

## License

Proprietary - MindCare Platform

---

**Status:** ✅ Core features implemented and working
**Last Updated:** December 14, 2025
