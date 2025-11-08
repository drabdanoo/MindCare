# MindCare - Real Data Setup (Quick Guide)

## ✅ What's New

Your app now has:
- ✅ **Arabic as default language** (with English & Kurdish support)
- ✅ **Real Firebase data storage** (no more mock data)
- ✅ **Working language switcher** (EN, العربية, کوردی)
- ✅ **Real user registration** (saves to Firestore)
- ✅ **Real doctor data** (loads from Firestore)
- ✅ **Real appointments** (saves to Firestore)

---

## 🚀 Quick Start (3 Steps)

### Step 1: Start the App
```bash
npm run dev
```
Opens at `http://localhost:3000`

### Step 2: Add Sample Doctors
1. Open browser DevTools (Press **F12**)
2. Go to **Console** tab
3. Copy and paste:
```javascript
seedDoctors()
```
4. Press Enter
5. You should see: **"Sample doctors added successfully!"**

### Step 3: Refresh & Test
1. Refresh the page (F5)
2. Click **"Find a Doctor"**
3. You should see **5 real doctors from Firestore**
4. Try switching languages: **EN → العربية → کوردی**

---

## 🌍 Language Switching

### Default Language: Arabic (العربية)
- Page loads in Arabic by default
- RTL layout automatically applied
- All text in Arabic

### Switch Languages
Click buttons in top-right:
- **EN** → English (LTR)
- **العربية** → Arabic (RTL)
- **کوردی** → Kurdish (RTL)

### Language Preference
- Your choice is saved automatically
- Next time you visit, same language loads

---

## 📊 Real Data Features

### 1. User Registration
```
Sign Up → Fill Form → Save to Firestore
```
- Email, password, name, phone, DOB all saved
- User role set to "patient"
- Can login anytime with email/password

### 2. Doctor Discovery
```
Find a Doctor → Load from Firestore → Display
```
- 5 sample doctors included
- Add more doctors manually in Firebase Console
- Doctors show name, specialization, rate, rating, languages

### 3. Appointment Booking
```
Select Doctor → Fill Form → Save to Firestore
```
- Session type (video, audio, text)
- Date and time
- Reason for visit
- Emergency contact
- Status: pending (waiting for doctor confirmation)

### 4. User Dashboard
```
Login → View Dashboard → See Appointments
```
- Shows upcoming appointments
- Shows appointment statistics
- Quick actions to book new appointments

---

## 🧪 Testing Checklist

### Test 1: Language Switching
- [ ] Click "EN" → Page changes to English
- [ ] Click "العربية" → Page changes to Arabic
- [ ] Click "کوردی" → Page changes to Kurdish
- [ ] Refresh page → Language persists

### Test 2: Registration
- [ ] Click "Sign Up"
- [ ] Fill all fields
- [ ] Click "Create Account"
- [ ] Check Firebase Console → users collection → New user appears

### Test 3: Doctor Discovery
- [ ] Click "Find a Doctor"
- [ ] See 5 doctors from Firestore
- [ ] Try switching languages
- [ ] Doctor info should translate

### Test 4: Appointment Booking
- [ ] Login with your account
- [ ] Click "Find a Doctor"
- [ ] Click "Book Now" on any doctor
- [ ] Fill booking form
- [ ] Click "Confirm Booking"
- [ ] Check Firebase Console → appointments collection → New appointment appears

### Test 5: Dashboard
- [ ] After booking, click "Your Dashboard"
- [ ] See your upcoming appointment
- [ ] See statistics (upcoming, completed, etc.)

---

## 📱 Firebase Collections

### users Collection
```
Document ID: User's UID
Fields:
- fullName: "John Doe"
- email: "john@example.com"
- phone: "+964123456789"
- dob: "1990-01-01"
- role: "patient"
- createdAt: timestamp
```

### doctors Collection
```
Document ID: Auto-generated
Fields:
- name: "Dr. Ahmed Al-Rashid"
- specialization: "Psychiatrist"
- languages: ["Arabic", "English"]
- yearsExp: 12
- rate: 50
- rating: 4.8
- bio: "Specialized in depression..."
- verified: true
```

### appointments Collection
```
Document ID: Auto-generated
Fields:
- patientId: "user_id"
- doctorId: "doctor_id"
- sessionType: "video"
- date: "2024-01-15"
- time: "14:00"
- reason: "Anxiety consultation"
- emergency: "Mom - 0123456789"
- status: "pending"
```

---

## 🔧 Add More Doctors Manually

### Option 1: Using Console (Easiest)
```javascript
// In browser console
seedDoctors()
```

### Option 2: Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **mindcare-9a4d2**
3. Go to **Firestore Database**
4. Click **doctors** collection
5. Click **Add document**
6. Fill in doctor details
7. Click **Save**

---

## 🌐 Live App

Your app is deployed at:
**https://mindcare-9a4d2.web.app**

Changes you make locally will be live after:
```bash
npm run build
npm run firebase:deploy
```

---

## 📝 File Changes Summary

### Modified Files
- `public/js/i18n.js` - Fixed language loading, Arabic as default
- `public/js/app.js` - Real Firestore data integration
- `public/index-new.html` - Added seed-data script

### New Files
- `public/js/seed-data.js` - Sample doctor data
- `FIREBASE_SETUP.md` - Firebase setup guide
- `REAL_DATA_SETUP.md` - This file

---

## 🐛 Troubleshooting

### Doctors Not Showing?
```javascript
// Run in console to add sample doctors
seedDoctors()
```

### Language Not Changing?
1. Clear browser cache (Ctrl+Shift+Delete)
2. Refresh page (F5)
3. Try again

### Registration Not Working?
1. Check browser console (F12)
2. Make sure email is unique
3. Password must be at least 6 characters

### Appointments Not Saving?
1. Make sure you're logged in
2. Check browser console for errors
3. Verify all form fields are filled

---

## 🎯 Next Steps

1. ✅ Test all features
2. ✅ Add more doctors
3. ✅ Create test accounts
4. 🔄 Add payment processing
5. 🔄 Add real-time video calls
6. 🔄 Add email notifications

---

## 📞 Need Help?

1. Check **FIREBASE_SETUP.md** for detailed Firebase info
2. Check **SETUP.md** for development guide
3. Check browser console (F12) for errors
4. Check Firebase Console for data issues

---

**App Status**: ✅ Ready to Use
**Default Language**: 🇸🇦 Arabic
**Data Storage**: 🔥 Firebase Firestore
**Deployment**: 🌐 Firebase Hosting

Enjoy! 🚀
