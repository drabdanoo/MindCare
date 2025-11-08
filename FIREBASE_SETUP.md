# MindCare - Firebase Setup Guide

## Quick Setup with Sample Data

### Step 1: Start the App
```bash
npm run dev
```

### Step 2: Seed Sample Doctors
1. Open browser DevTools (F12)
2. Go to Console tab
3. Run this command:
```javascript
seedDoctors()
```
4. You should see: "Sample doctors added successfully!"

### Step 3: Refresh the App
1. Refresh the page (F5)
2. Click "Find a Doctor"
3. You should now see 5 sample doctors loaded from Firestore

---

## Firebase Collections Structure

### 1. **users** Collection
Stores patient and doctor profiles.

**Document ID**: User's UID (from Firebase Auth)

**Fields**:
```json
{
  "uid": "user_id",
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+964123456789",
  "dob": "1990-01-01",
  "role": "patient",  // or "doctor"
  "createdAt": "timestamp"
}
```

### 2. **doctors** Collection
Stores doctor profiles (public read).

**Document ID**: Auto-generated

**Fields**:
```json
{
  "name": "Dr. Ahmed Al-Rashid",
  "specialization": "Psychiatrist",
  "languages": ["Arabic", "English"],
  "yearsExp": 12,
  "rate": 50,
  "rating": 4.8,
  "bio": "Specialized in depression and anxiety disorders",
  "image": "👨‍⚕️",
  "verified": true,
  "createdAt": "timestamp"
}
```

### 3. **appointments** Collection
Stores appointment bookings.

**Document ID**: Auto-generated

**Fields**:
```json
{
  "patientId": "user_id",
  "doctorId": "doctor_id",
  "sessionType": "video",  // video, audio, or text
  "date": "2024-01-15",
  "time": "14:00",
  "reason": "Anxiety consultation",
  "emergency": "Mom - 0123456789",
  "status": "pending",  // pending, confirmed, completed, cancelled
  "createdAt": "timestamp"
}
```

---

## Manual Data Entry

### Add a Doctor Manually

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (mindcare-9a4d2)
3. Go to Firestore Database
4. Click on **doctors** collection
5. Click **Add document**
6. Enter the following data:

```
Field: name | Type: String | Value: Dr. Your Name
Field: specialization | Type: String | Value: Psychiatrist
Field: languages | Type: Array | Value: ["Arabic", "English"]
Field: yearsExp | Type: Number | Value: 10
Field: rate | Type: Number | Value: 50
Field: rating | Type: Number | Value: 4.8
Field: bio | Type: String | Value: Your bio here
Field: image | Type: String | Value: 👨‍⚕️
Field: verified | Type: Boolean | Value: true
```

7. Click Save

---

## Language Support

The app now supports 3 languages:

### Arabic (العربية) - Default
- RTL layout
- All UI in Arabic
- Click "العربية" button to switch

### English
- LTR layout
- All UI in English
- Click "EN" button to switch

### Kurdish (کوردی)
- RTL layout
- All UI in Kurdish
- Click "کوردی" button to switch

---

## Real Data Features

### ✅ Implemented
- Registration saves to Firestore
- Login uses Firebase Auth
- Doctors loaded from Firestore
- Appointments saved to Firestore
- User profiles stored in Firestore
- Language preference saved to localStorage

### 📝 Data Flow

1. **Registration**
   - User fills form → Firebase Auth creates account → User data saved to `users` collection

2. **Login**
   - User enters email/password → Firebase Auth verifies → User role loaded from `users` collection

3. **Doctor Discovery**
   - App loads → Fetches all doctors from `doctors` collection → Displays on page

4. **Appointment Booking**
   - User selects doctor → Fills booking form → Appointment saved to `appointments` collection

---

## Testing the Real Data

### Test 1: Register a New User
1. Click "Sign Up"
2. Fill in the form with your details
3. Click "Create Account"
4. Check Firebase Console → users collection → New user should appear

### Test 2: View Doctors
1. Click "Find a Doctor"
2. You should see 5 doctors from Firestore
3. Try switching languages (EN → العربية → کوردی)

### Test 3: Book an Appointment
1. Login with your account
2. Click "Find a Doctor"
3. Click "Book Now" on any doctor
4. Fill the booking form
5. Click "Confirm Booking"
6. Check Firebase Console → appointments collection → New appointment should appear

### Test 4: Language Switching
1. Click language buttons (EN, العربية, کوردی)
2. Entire UI should change language
3. Refresh page → Language preference should persist

---

## Firestore Security Rules

The app uses these security rules (in `firestore.rules`):

```
- users: Only users can read/write their own profile
- doctors: Public read, only doctor can write their profile
- appointments: Users can create, read/update their own appointments
```

---

## Troubleshooting

### Doctors Not Showing?
1. Check if you ran `seedDoctors()` in console
2. Check Firebase Console → Firestore → doctors collection
3. Verify security rules allow public read on doctors

### Registration Not Working?
1. Check browser console for errors (F12)
2. Verify Firebase project is active
3. Check Firestore security rules

### Language Not Changing?
1. Clear browser cache (Ctrl+Shift+Delete)
2. Refresh page
3. Check browser console for translation errors

### Appointments Not Saving?
1. Make sure you're logged in
2. Check browser console for errors
3. Verify Firestore security rules

---

## Next Steps

1. ✅ Add sample doctors with `seedDoctors()`
2. ✅ Test registration and login
3. ✅ Test appointment booking
4. ✅ Test language switching
5. 🔄 Add payment processing
6. 🔄 Add real-time video calls
7. 🔄 Add email notifications

---

## Resources

- [Firebase Console](https://console.firebase.google.com)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)

---

**Last Updated**: November 2, 2025
