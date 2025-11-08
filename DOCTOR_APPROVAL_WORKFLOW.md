# MindCare - Doctor Approval & Appointment Workflow

## 🏥 Complete Doctor Workflow

### Phase 1: Doctor Registration
1. Doctor clicks "Join as Doctor"
2. Fills registration form
3. Submits
4. Account created with `verified: false`

### Phase 2: Admin Approval (MANUAL STEP)
1. Admin goes to Firebase Console
2. Approves doctor profile
3. Doctor can now login

### Phase 3: Doctor Login
1. Doctor uses email/password to login
2. Sees "Doctor Dashboard" button
3. Clicks to access dashboard

### Phase 4: Appointment Management
1. Patient books appointment
2. Doctor sees pending appointment
3. Doctor approves or rejects
4. Patient is notified

---

## 👨‍💼 How to Approve Doctor (Admin)

### Step-by-Step Admin Approval

**Step 1: Go to Firebase Console**
```
https://console.firebase.google.com
```

**Step 2: Select Project**
- Project: `mindcare-9a4d2`

**Step 3: Open Firestore Database**
- Click "Firestore Database" in left menu

**Step 4: Find Doctors Collection**
- Click on "doctors" collection
- You'll see all registered doctors

**Step 5: Find Pending Doctor**
- Look for doctor with `verified: false`
- This is the doctor awaiting approval

**Step 6: Approve Doctor**
- Click on the doctor document
- Find the `verified` field
- Change value from `false` to `true`
- Click "Update"

**Step 7: Doctor Can Now Login**
- Doctor can now login with email/password
- Doctor dashboard shows "Verified" badge
- Doctor can see and manage appointments

---

## 🔐 Doctor Login Flow

### Login Process
1. Doctor goes to app
2. Clicks "Sign In"
3. Enters email and password
4. Clicks "Sign In"
5. Redirected to dashboard

### Doctor Dashboard
Shows:
- Verification status badge
- Statistics (pending, approved, completed)
- Pending appointments (awaiting doctor approval)
- Approved appointments (confirmed)
- Completed appointments

---

## 📅 Appointment Booking Flow

### Patient Side
1. Patient clicks "Find a Doctor"
2. Selects a verified doctor
3. Clicks "Book Now"
4. Fills booking form:
   - Session type (video/audio/text)
   - Preferred date
   - Preferred time
   - Reason for visit
   - Emergency contact
5. Clicks "Confirm Booking"
6. Appointment saved with status = "pending"

### Doctor Side - Pending Appointments
1. Doctor logs in
2. Clicks "Doctor Dashboard"
3. Sees "Pending Appointments" section
4. Shows all patient booking requests
5. For each appointment, doctor can:
   - **Approve**: Confirms the appointment
   - **Reject**: Declines the appointment

### Doctor Approves Appointment
1. Doctor clicks "Approve" button
2. Appointment status changes to "confirmed"
3. Patient is notified (in their dashboard)
4. Appointment moves to "Approved Appointments" section

### Doctor Rejects Appointment
1. Doctor clicks "Reject" button
2. Appointment status changes to "rejected"
3. Patient is notified
4. Appointment removed from pending list

### Patient Notification
1. Patient logs in
2. Goes to dashboard
3. Sees appointment status:
   - **Pending**: Waiting for doctor approval
   - **Confirmed**: Doctor approved, appointment is scheduled
   - **Rejected**: Doctor rejected, can book with another doctor
   - **Completed**: Appointment finished

---

## 📊 Appointment Status Flow

```
Patient Books
    ↓
Appointment Created (status: pending)
    ↓
Doctor Sees Pending Appointment
    ↓
Doctor Approves OR Rejects
    ↓
If Approved:
  - Status: confirmed
  - Patient sees confirmed appointment
  - Both can see appointment details
  ↓
If Rejected:
  - Status: rejected
  - Patient notified
  - Patient can book with another doctor
```

---

## 🧪 Testing the Complete Workflow

### Test 1: Doctor Registration & Approval

**Step 1: Register as Doctor**
1. Go to https://mindcare-9a4d2.web.app
2. Click "Join as Doctor"
3. Fill form:
   - Name: Dr. Test
   - Email: doctor@test.com
   - Phone: +964123456789
   - Password: password123
   - Specialization: Psychiatrist
   - Experience: 10
   - Rate: 50
   - Languages: Arabic, English
   - Bio: Test bio
   - License: TEST123
4. Click "Register as Doctor"
5. See: "Doctor registration submitted!"

**Step 2: Approve in Firebase**
1. Go to Firebase Console
2. Open doctors collection
3. Find doctor with email: doctor@test.com
4. Change `verified` from `false` to `true`
5. Click "Update"

**Step 3: Doctor Login**
1. Go back to app
2. Click "Sign In"
3. Email: doctor@test.com
4. Password: password123
5. Click "Sign In"
6. See "Doctor Dashboard" button in nav
7. Click it
8. Should see "Verified" badge

### Test 2: Patient Books Appointment

**Step 1: Register as Patient**
1. Click "Join as Patient"
2. Fill form
3. Register

**Step 2: Book Appointment**
1. Click "Find a Doctor"
2. See the doctor you registered
3. Click "Book Now"
4. Fill booking form:
   - Session: Video
   - Date: Tomorrow
   - Time: 10:00 AM
   - Reason: Consultation
   - Emergency: Your Name
5. Click "Confirm Booking"
6. See: "Appointment booked successfully!"

**Step 3: Doctor Approves**
1. Doctor logs in
2. Clicks "Doctor Dashboard"
3. Sees pending appointment from patient
4. Clicks "Approve"
5. See: "Appointment approved! Patient has been notified."
6. Appointment moves to "Approved Appointments"

**Step 4: Patient Sees Confirmation**
1. Patient logs in
2. Clicks "Your Dashboard"
3. Sees appointment with status "confirmed"
4. Can see appointment details

### Test 3: Doctor Rejects Appointment

**Step 1: Patient Books**
- Same as Test 2, Step 2

**Step 2: Doctor Rejects**
1. Doctor logs in
2. Clicks "Doctor Dashboard"
3. Sees pending appointment
4. Clicks "Reject"
5. See: "Appointment rejected. Patient has been notified."

**Step 3: Patient Sees Rejection**
1. Patient logs in
2. Clicks "Your Dashboard"
3. Sees appointment with status "rejected"
4. Can book with another doctor

---

## 📱 Doctor Dashboard Tabs

### Pending Appointments (Yellow)
- Shows all patient booking requests
- Doctor hasn't responded yet
- Buttons: Approve, Reject
- Shows: Date, Time, Session Type, Reason

### Approved Appointments (Blue)
- Shows confirmed appointments
- Doctor approved, appointment is scheduled
- Shows: Date, Time, Session Type
- Status: Confirmed

### Completed Appointments (Green)
- Shows finished appointments
- Appointment has been completed
- Shows: Date, Time, Session Type
- Status: Completed

### Statistics
- **Pending Approval**: Number of pending appointments
- **Approved**: Number of confirmed appointments
- **Completed**: Number of completed appointments

---

## 🔔 Notification System

### Current Implementation
- Alerts shown to user when action taken
- Patient dashboard updates when doctor approves/rejects
- Doctor dashboard updates after approval/rejection

### Future Enhancements
- Email notifications
- SMS notifications
- In-app notifications
- Push notifications

---

## 🔐 Security & Permissions

### Doctor Can:
- Create their own profile
- Update their own profile
- View appointments assigned to them
- Approve/reject appointments

### Patient Can:
- Create appointments
- View their own appointments
- See doctor profiles (verified only)

### Admin Can:
- Verify/unverify doctors
- View all data
- Manage platform

---

## 📊 Database Structure

### Doctors Collection
```json
{
  "uid": "doctor_uid",
  "name": "Dr. Test",
  "email": "doctor@test.com",
  "specialization": "Psychiatrist",
  "yearsExp": 10,
  "rate": 50,
  "languages": ["Arabic", "English"],
  "bio": "Test bio",
  "license": "TEST123",
  "verified": true,  // Admin sets this
  "rating": 5.0,
  "image": "👨‍⚕️",
  "createdAt": "timestamp"
}
```

### Appointments Collection
```json
{
  "patientId": "patient_uid",
  "doctorId": "doctor_uid",
  "sessionType": "video",
  "date": "2025-11-05",
  "time": "10:00",
  "reason": "Consultation",
  "emergency": "Patient Name",
  "status": "pending",  // pending, confirmed, rejected, completed
  "confirmedAt": "timestamp",  // Set when doctor approves
  "rejectedAt": "timestamp",   // Set when doctor rejects
  "createdAt": "timestamp"
}
```

---

## 🚀 Live & Deployed

All features deployed to: **https://mindcare-9a4d2.web.app**

---

## 📞 Troubleshooting

### Doctor Can't Login
- Check if doctor is verified in Firebase
- Check email/password is correct
- Try hard refresh (Ctrl+Shift+R)

### Doctor Dashboard Not Showing
- Make sure user role is "doctor"
- Check if logged in
- Try hard refresh

### Appointments Not Showing
- Make sure appointments exist in Firestore
- Check if appointment doctorId matches doctor's UID
- Try hard refresh

### Approval Not Working
- Check Firestore rules allow update
- Make sure you're updating the correct field
- Try refreshing page after approval

---

**Last Updated**: November 3, 2025
**Status**: ✅ Complete Doctor Workflow Implemented
**Version**: 1.3.0
