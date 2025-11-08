# MindCare - Complete Testing Guide

## ✅ All Critical Bugs Fixed

### Fixes Applied
1. ✅ **Only verified doctors shown** - Added `where('verified', '==', true)` filter
2. ✅ **Verification check before booking** - Added doctor verification validation
3. ✅ **Firestore rules enforced** - Only verified doctors readable by patients
4. ✅ **Doctor ID consistency** - Ensured proper UID handling

---

## 🧪 Complete End-to-End Testing

### Phase 1: Doctor Registration & Approval

**Step 1: Register as Doctor**
1. Go to https://mindcare-9a4d2.web.app
2. Hard refresh: Ctrl+Shift+R
3. Click "Join as Doctor"
4. Fill form:
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
5. Click "Register as Doctor"
6. See: "Doctor registration submitted!"

**Step 2: Verify Doctor is Unverified**
1. Go to Firebase Console: https://console.firebase.google.com
2. Select project: mindcare-9a4d2
3. Open Firestore Database
4. Click "doctors" collection
5. Find doctor with email: doctor@test.com
6. Verify `verified: false`

**Step 3: Approve Doctor**
1. In Firebase Console, open the doctor document
2. Find `verified` field
3. Change from `false` to `true`
4. Click "Update"

**Step 4: Verify Doctor is Now Verified**
1. Refresh Firebase Console
2. Check `verified: true`

---

### Phase 2: Patient Registration & Doctor Search

**Step 1: Register as Patient**
1. Go to https://mindcare-9a4d2.web.app
2. Hard refresh: Ctrl+Shift+R
3. Click "Join as Patient"
4. Fill form:
   - Name: Patient Test
   - Email: patient@test.com
   - Phone: +964987654321
   - Password: password123
   - Date of Birth: Any date
5. Click "Create Account"
6. See: "Registration successful!"

**Step 2: Patient Logs In**
1. Click "Sign In"
2. Email: patient@test.com
3. Password: password123
4. Click "Sign In"
5. Should see "Your Dashboard" (patient dashboard)

**Step 3: Patient Searches for Doctors**
1. Click "Find a Doctor"
2. Should see the verified doctor (Dr. Test)
3. Should NOT see any unverified doctors
4. Doctor card shows:
   - Name: Dr. Test
   - Specialization: Psychiatrist
   - Experience: 10 years
   - Rate: $50
   - Languages: Arabic, English
   - Bio: Test bio

---

### Phase 3: Patient Books Appointment

**Step 1: Patient Clicks Book Now**
1. On doctor card, click "Book Now"
2. Should see booking form
3. Selected doctor shows: "with Dr. Test"

**Step 2: Patient Fills Booking Form**
1. Session Type: Video
2. Date: Tomorrow (or any future date)
3. Time: 10:00 AM
4. Reason: Consultation
5. Emergency Contact: Patient Name
6. Click "Confirm Booking"
7. See: "Appointment booked successfully!"

**Step 3: Verify Appointment in Firebase**
1. Go to Firebase Console
2. Open "appointments" collection
3. Find the appointment
4. Check fields:
   - `patientId`: patient's UID
   - `doctorId`: doctor's UID (should match doctor's document ID)
   - `status`: pending
   - `sessionType`: video
   - `date`: tomorrow's date
   - `time`: 10:00
   - `reason`: Consultation

---

### Phase 4: Doctor Approves Appointment

**Step 1: Doctor Logs In**
1. Go to https://mindcare-9a4d2.web.app
2. Hard refresh: Ctrl+Shift+R
3. Click "Sign In"
4. Email: doctor@test.com
5. Password: password123
6. Click "Sign In"
7. Should see "Doctor Dashboard" (NOT patient dashboard)

**Step 2: Doctor Dashboard Loads**
1. Should see "Verified" badge (green)
2. Should see statistics:
   - Pending Approval: 1
   - Approved: 0
   - Completed: 0

**Step 3: Doctor Sees Pending Appointment**
1. Scroll to "Pending Appointments" section
2. Should see appointment with:
   - Patient Request
   - Date: tomorrow
   - Time: 10:00 AM
   - Session: video
   - Reason: Consultation
   - Status: Pending (yellow)
   - Buttons: Approve, Reject

**Step 4: Doctor Approves Appointment**
1. Click "Approve" button
2. See: "Appointment approved! Patient has been notified."
3. Appointment moves to "Approved Appointments" section
4. Statistics update:
   - Pending Approval: 0
   - Approved: 1

**Step 5: Verify Appointment Status Changed**
1. Go to Firebase Console
2. Open "appointments" collection
3. Find the appointment
4. Check `status`: should be "confirmed"
5. Check `confirmedAt`: should have timestamp

---

### Phase 5: Patient Sees Confirmation

**Step 1: Patient Logs In**
1. Go to https://mindcare-9a4d2.web.app
2. Hard refresh: Ctrl+Shift+R
3. Click "Sign In"
4. Email: patient@test.com
5. Password: password123
6. Click "Sign In"

**Step 2: Patient Dashboard Shows Confirmed Appointment**
1. Should see "Your Dashboard"
2. Scroll to "Upcoming Appointments"
3. Should see appointment with:
   - Date: tomorrow
   - Time: 10:00 AM
   - Session: video
   - Reason: Consultation
   - Status: confirmed (blue badge)

---

### Phase 6: Doctor Rejects Appointment (Alternative Flow)

**Step 1: Patient Books Another Appointment**
1. Patient logs in
2. Click "Find a Doctor"
3. Click "Book Now" on doctor
4. Fill booking form (different time)
5. Click "Confirm Booking"

**Step 2: Doctor Rejects**
1. Doctor logs in
2. Click "Doctor Dashboard"
3. See new pending appointment
4. Click "Reject" button
5. See: "Appointment rejected. Patient has been notified."

**Step 3: Patient Sees Rejection**
1. Patient logs in
2. Click "Your Dashboard"
3. See appointment with status "rejected" (red badge)

---

## 🔍 Verification Checklist

### Doctor Registration
- [ ] Doctor can register with all fields
- [ ] Account created in Firebase Auth
- [ ] User record created in users collection
- [ ] Doctor profile created in doctors collection
- [ ] Doctor marked as `verified: false` initially

### Doctor Approval
- [ ] Admin can change `verified` to `true` in Firebase
- [ ] Doctor can login after approval
- [ ] Doctor sees "Verified" badge on dashboard

### Patient Search
- [ ] Only verified doctors shown
- [ ] Unverified doctors NOT shown
- [ ] Doctor information displayed correctly

### Patient Booking
- [ ] Patient can book with verified doctor
- [ ] Cannot book with unverified doctor
- [ ] Appointment saved with correct data
- [ ] Appointment status: pending

### Doctor Approval
- [ ] Doctor sees pending appointments
- [ ] Doctor can approve appointment
- [ ] Doctor can reject appointment
- [ ] Appointment status updates correctly
- [ ] Statistics update correctly

### Patient Notification
- [ ] Patient sees confirmed appointment
- [ ] Patient sees rejected appointment
- [ ] Appointment details are correct

---

## 🐛 Troubleshooting

### Doctor Not Showing in Patient Search
**Solution**:
1. Check if doctor is verified in Firebase
2. Go to doctors collection
3. Find doctor
4. Check `verified: true`
5. Refresh patient page

### Appointment Not Showing on Doctor Dashboard
**Solution**:
1. Check appointment exists in Firebase
2. Check `doctorId` matches doctor's UID
3. Check `status: pending`
4. Refresh doctor dashboard page

### Doctor Sees Patient Dashboard Instead of Doctor Dashboard
**Solution**:
1. Check user role in users collection
2. Should be `role: doctor`
3. Logout and login again
4. Hard refresh: Ctrl+Shift+R

### Booking Button Not Working
**Solution**:
1. Make sure you're logged in
2. Make sure doctor is verified
3. Check browser console for errors
4. Hard refresh: Ctrl+Shift+R

---

## 📊 Test Scenarios

### Scenario 1: Complete Happy Path
```
1. Register doctor
2. Approve doctor
3. Register patient
4. Patient books appointment
5. Doctor approves
6. Patient sees confirmation
✓ PASS
```

### Scenario 2: Doctor Rejects
```
1. Register doctor
2. Approve doctor
3. Register patient
4. Patient books appointment
5. Doctor rejects
6. Patient sees rejection
✓ PASS
```

### Scenario 3: Unverified Doctor Not Shown
```
1. Register doctor (not approved)
2. Register patient
3. Patient searches for doctors
4. Unverified doctor NOT shown
✓ PASS
```

### Scenario 4: Cannot Book Unverified Doctor
```
1. Register doctor (not approved)
2. Register patient
3. Try to book unverified doctor
4. Get error: "not yet verified"
✓ PASS
```

---

## 🚀 Performance Checks

- [ ] Doctor search loads in < 2 seconds
- [ ] Doctor dashboard loads in < 2 seconds
- [ ] Appointment approval responds immediately
- [ ] No console errors
- [ ] No network errors

---

## 📱 Browser Compatibility

Test on:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Chrome
- [ ] Mobile Safari

---

## 🔐 Security Checks

- [ ] Unverified doctors not readable by patients
- [ ] Patients can only see their own appointments
- [ ] Doctors can only see their own appointments
- [ ] Cannot modify other user's data
- [ ] Cannot approve/reject other doctor's appointments

---

## ✅ Final Sign-Off

When all tests pass:
- [ ] Doctor registration works
- [ ] Doctor approval works
- [ ] Patient search works
- [ ] Patient booking works
- [ ] Doctor approval works
- [ ] Patient notification works
- [ ] No bugs found
- [ ] System ready for production

---

**Test Date**: November 3, 2025
**Status**: ✅ Ready for Testing
**Next**: Execute all test scenarios
