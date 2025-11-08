# Demo Credentials for MindCare Native App

## ⚠️ IMPORTANT: For Development/Testing Only

These are demo credentials for testing the app. Do NOT use these in production.

---

## Demo Patient Account

**Email:** patient@demo.com  
**Password:** Patient@123

### Steps to Create This Account:
1. Click "Don't have an account? Register" on login screen
2. Enter:
   - Full Name: John Patient
   - Email: patient@demo.com
   - Phone: 1234567890
   - Password: Patient@123
   - Select: Patient
3. Click Register

---

## Demo Doctor Account

**Email:** doctor@demo.com  
**Password:** Doctor@123

### Steps to Create This Account:
1. Click "Don't have an account? Register" on login screen
2. Enter:
   - Full Name: Jane Doctor
   - Email: doctor@demo.com
   - Phone: 9876543210
   - Password: Doctor@123
   - Select: Doctor
3. Click Register

---

## Password Requirements

All passwords must have:
- ✅ Minimum 6 characters
- ✅ At least 1 uppercase letter (A-Z)
- ✅ At least 1 number (0-9)

Example valid passwords:
- `Patient@123`
- `Doctor@456`
- `TestUser@789`
- `MyApp@2025`

---

## Testing Workflows

### Patient Flow
1. Login with patient@demo.com / Patient@123
2. View appointments dashboard
3. Join video calls for confirmed appointments
4. Logout

### Doctor Flow
1. Login with doctor@demo.com / Doctor@123
2. View appointment requests
3. Approve or reject appointments
4. Join video calls for confirmed appointments
5. Logout

---

## Firestore Database Setup

Before testing, make sure your Firestore database has these collections:

### Collections Required:
1. **users** - User profiles
   - Fields: uid, fullName, email, phone, userType, createdAt

2. **appointments** - Appointments data
   - Fields: id, patientId, doctorId, patientName, doctorName, date, time, sessionType, reason, status

### Sample Appointment Data

```json
{
  "id": "apt001",
  "patientId": "patient_uid_here",
  "doctorId": "doctor_uid_here",
  "patientName": "John Patient",
  "doctorName": "Jane Doctor",
  "date": "2025-11-10",
  "time": "14:30",
  "sessionType": "online",
  "reason": "General consultation",
  "status": "pending"
}
```

---

## Running the App

### Using Local Expo CLI (Recommended)

```bash
# Run from project directory
npx expo start

# Then select:
# - Press 'w' for web
# - Press 'a' for Android
# - Press 'i' for iOS
```

### If you get errors:

```bash
# Clear cache and reinstall
rm -r node_modules
npm install
npx expo start --clear
```

---

## Troubleshooting

### Error: "expo-cli does not support Node +17"
**Solution:** Use `npx expo` instead of global `expo` command

### Error: "getReactNativePersistence is not a function"
**Solution:** Already fixed! Using `getAuth()` instead

### Error: "ExpoMetroConfig.loadAsync is not a function"
**Solution:** Use `npx expo start` instead of `npm start`

### Error: "Cannot find module..."
**Solution:** Run `npm install` to install all dependencies

---

## Quick Start Command

```bash
# Navigate to project
cd G:\Mindcare\mindcare-native

# Install dependencies (if not done)
npm install

# Start with local Expo CLI
npx expo start

# Open in browser or select platform
```

---

## Test Checklist

- [ ] Register new patient account
- [ ] Login with patient credentials
- [ ] View patient dashboard
- [ ] Logout
- [ ] Register new doctor account
- [ ] Login with doctor credentials
- [ ] View doctor dashboard
- [ ] Logout
- [ ] Test invalid email format
- [ ] Test weak password
- [ ] Test existing email registration

---

## Firebase Configuration

Make sure your `.env` file has valid Firebase credentials:

```properties
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Get these from your Firebase Console:
1. Go to https://console.firebase.google.com
2. Select your project
3. Project Settings → Service Accounts
4. Copy your credentials

---

## Support

For issues:
1. Check `BUG_FIXES_REPORT.md` for detailed fixes
2. Check `QUICK_START.md` for quick reference
3. Verify Firebase credentials in `.env`
4. Clear cache: `npx expo start --clear`

---

**Happy testing! 🚀**
