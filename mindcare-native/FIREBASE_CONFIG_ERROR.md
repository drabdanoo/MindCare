# ⚠️ IMMEDIATE ACTION REQUIRED

## The Problem

Your app shows this error:
```
Failed to load resource: the server responded with a status of 400
```

**Reason:** Your `.env` file has placeholder values instead of real Firebase credentials.

---

## The Solution (3 Steps)

### Step 1: Get Real Firebase Credentials

Go to: **https://console.firebase.google.com**

1. Open your MindCare project
2. Click ⚙️ (Settings) → Project Settings
3. Click Apps tab
4. Click your Web app (or create one)
5. Copy the credentials

You'll see something like:
```
apiKey: "AIzaSyA2peT_hLBnAmLgzcz85C_Y3krStx-Emnw"
authDomain: "mindcare-9a4d2.firebaseapp.com"
projectId: "mindcare-9a4d2"
storageBucket: "mindcare-9a4d2.firebasestorage.app"
messagingSenderId: "424143354909"
appId: "1:424143354909:android:ef0872af3eb89e0fb3daf4"
```

### Step 2: Edit Your .env File

**File:** `G:\Mindcare\mindcare-native\.env`

**Replace this:**
```properties
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**With this (your actual values):**
```properties
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyA2peT_hLBnAmLgzcz85C_Y3krStx-Emnw
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=mindcare-9a4d2.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=mindcare-9a4d2
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=mindcare-9a4d2.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=424143354909
EXPO_PUBLIC_FIREBASE_APP_ID=1:424143354909:android:ef0872af3eb89e0fb3daf4
```

### Step 3: Restart the App

```powershell
# In PowerShell
cd G:\Mindcare\mindcare-native
npx expo start --clear
# Press 'w' for web
```

---

## Also Required: Firebase Setup

Before the app will work, your Firebase project needs:

### ✅ Enable Email/Password Authentication
1. Firebase Console → Authentication
2. Sign-in method tab
3. Enable "Email/Password"

### ✅ Create Firestore Collections
1. Firebase Console → Firestore Database
2. Create collection: `users`
3. Create collection: `appointments`

### ✅ Update Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## After Setup - Test Login

Register new account:
- Email: `test@demo.com`
- Password: `Test@123` (must have uppercase + number)
- Phone: `1234567890`
- Type: Patient

Then login with those credentials.

---

## Detailed Setup Guide

See **`FIREBASE_SETUP.md`** for complete step-by-step Firebase configuration.

---

## Quick Checklist

- [ ] Get Firebase credentials from console
- [ ] Update `.env` with real values
- [ ] Enable Email/Password auth in Firebase
- [ ] Create Firestore collections
- [ ] Restart app with `npx expo start --clear`
- [ ] Register test account
- [ ] Login successfully

---

**Once you update `.env`, the app will work! 🎯**
