# 🔑 Firebase Configuration Guide

## Problem
Your `.env` file has placeholder values. The app needs real Firebase credentials to work.

---

## How to Get Your Firebase Credentials

### Step 1: Open Firebase Console
Go to: https://console.firebase.google.com

### Step 2: Select or Create Your Project
- Click on your **MindCare** project
- Or create a new one if you don't have one

### Step 3: Get Your Web App Credentials

1. Click the **Gear Icon** (Settings) at the top left
2. Select **Project Settings**
3. Click the **Apps** tab
4. Find your **Web App** (should look like `</>`)
5. If no web app exists, click **Add App** → **Web**

### Step 4: Copy Your Credentials
You'll see a code snippet like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "mindcare-xxxx.firebaseapp.com",
  projectId: "mindcare-xxxx",
  storageBucket: "mindcare-xxxx.firebasestorage.app",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:xxxxxxx"
};
```

---

## Update Your .env File

Open `G:\Mindcare\mindcare-native\.env` and replace the placeholder values:

**BEFORE (Wrong):**
```properties
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**AFTER (Correct):**
```properties
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...  (the actual apiKey value)
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=mindcare-xxxx.firebaseapp.com  (the actual authDomain)
EXPO_PUBLIC_FIREBASE_PROJECT_ID=mindcare-xxxx  (the actual projectId)
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=mindcare-xxxx.firebasestorage.app  (the actual storageBucket)
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890  (the actual messagingSenderId)
EXPO_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:xxxxxxx  (the actual appId)
```

---

## Example of Completed .env File

```properties
# Firebase Configuration
# Copy this file to .env and fill in your Firebase project credentials
# DO NOT commit .env file to version control!

EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyA2peT_hLBnAmLgzcz85C_Y3krStx-Emnw
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=mindcare-9a4d2.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=mindcare-9a4d2
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=mindcare-9a4d2.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=424143354909
EXPO_PUBLIC_FIREBASE_APP_ID=1:424143354909:android:ef0872af3eb89e0fb3daf4
```

---

## After Updating .env

### Step 1: Stop the App
Press `Ctrl+C` in PowerShell

### Step 2: Clear Cache
```powershell
cd G:\Mindcare\mindcare-native
npx expo start --clear
```

### Step 3: Restart
```powershell
# Press 'w' for web
```

---

## Test Login

Once the app restarts:

### Register New Patient Account

1. Click "Don't have an account? Register"
2. Enter:
   - Full Name: `John Patient`
   - Email: `patient@demo.com`
   - Phone: `1234567890`
   - Password: `Patient@123` (uppercase, number required)
   - Select: `Patient`
3. Click Register

### Login

1. Email: `patient@demo.com`
2. Password: `Patient@123`
3. Click Login

---

## If You Still See Errors

### Error: "Failed to load resource: 400"
**Cause:** Invalid Firebase credentials
**Solution:** Check `.env` file has correct values from Firebase Console

### Error: "auth/invalid-api-key"
**Cause:** API key is wrong or malformed
**Solution:** Copy exactly from Firebase Console (no extra spaces)

### Error: "auth/operation-not-allowed"
**Cause:** Email/password authentication not enabled
**Solution:** In Firebase Console:
1. Go to **Authentication**
2. Click **Sign-in method** tab
3. Enable **Email/Password** provider

### Error: "Missing or insufficient permissions"
**Cause:** Firestore Security Rules blocking access
**Solution:** Update Firestore Rules to allow testing:
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

## Firebase Setup Checklist

Before testing, ensure you have:

- [ ] Firebase project created
- [ ] Web app registered in Firebase Console
- [ ] Firebase credentials copied to `.env`
- [ ] **Authentication** → **Sign-in method** → **Email/Password** enabled
- [ ] **Firestore Database** created
- [ ] **Firestore Collections** created:
  - `users` collection
  - `appointments` collection
- [ ] **Firestore Security Rules** updated to allow testing

---

## Create Required Firestore Collections

### Collection 1: users

In Firebase Console Firestore:
1. Click **Create collection**
2. Name: `users`
3. Click **Create document**
4. Document ID: (auto-generate)
5. Add these fields:
   - `uid`: string
   - `fullName`: string
   - `email`: string
   - `phone`: string
   - `userType`: string (patient or doctor)
   - `createdAt`: timestamp

### Collection 2: appointments

In Firebase Console Firestore:
1. Click **Create collection**
2. Name: `appointments`
3. Click **Create document**
4. Document ID: (auto-generate)
5. Add these fields:
   - `id`: string
   - `patientId`: string
   - `doctorId`: string
   - `patientName`: string
   - `doctorName`: string
   - `date`: string
   - `time`: string
   - `sessionType`: string
   - `reason`: string
   - `status`: string (pending/confirmed/rejected)

---

## Complete Firebase Setup Steps

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com
   - Click "Create a project"
   - Name: MindCare
   - Enable Analytics (optional)

2. **Create Web App**
   - In Project Settings → Apps
   - Click "Add app" → "Web"
   - Register app
   - Copy credentials to `.env`

3. **Enable Authentication**
   - Left menu → Authentication
   - Click "Sign-in method"
   - Enable "Email/Password"

4. **Create Firestore Database**
   - Left menu → Firestore Database
   - Click "Create database"
   - Select "Start in test mode"
   - Select region
   - Click "Create"

5. **Create Collections**
   - Click "Start collection"
   - Create "users" collection
   - Create "appointments" collection

6. **Update Security Rules**
   - Go to Firestore → Rules tab
   - Replace with:
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
   - Click Publish

---

## Quick Reference

| Item | Where to Find |
|------|----------------|
| API Key | Project Settings → Apps → Web |
| Auth Domain | Firebase Console → Project Settings |
| Project ID | Project Settings → General |
| Storage Bucket | Project Settings → Apps |
| Messaging Sender ID | Project Settings → Apps |
| App ID | Project Settings → Apps |

---

## Support

- For more help: See `STARTUP_GUIDE.md`
- Test accounts: See `DEMO_CREDENTIALS.md`
- Bug fixes: See `BUG_FIXES_REPORT.md`

---

**Once you update `.env` and restart the app, it will work! 🚀**
