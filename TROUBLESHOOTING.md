# MindCare - Troubleshooting Guide

## 🔴 Firebase 400 Bad Request Error

### Error Message
```
POST https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=... 400 (Bad Request)
```

### Causes & Solutions

#### 1. **Invalid Email Format**
**Problem**: Email is not a valid email address
**Solution**: 
- Make sure email has @ symbol
- Make sure email has a domain (e.g., @gmail.com)
- Example: `user@example.com` ✅

#### 2. **Empty Fields**
**Problem**: One or more required fields are empty
**Solution**:
- Fill in ALL fields before submitting
- Required fields:
  - Full Name
  - Email
  - Password (6+ characters)
  - Phone Number
  - Date of Birth (for patients)
  - Specialization (for doctors)
  - License Number (for doctors)

#### 3. **Invalid Phone Number**
**Problem**: Phone number is too short
**Solution**:
- Phone must be at least 7 characters
- Example: `+964123456789` ✅

#### 4. **Weak Password**
**Problem**: Password is less than 6 characters
**Solution**:
- Password must be at least 6 characters
- Example: `password123` ✅

#### 5. **Email Already Registered**
**Problem**: Email is already used by another account
**Solution**:
- Use a different email address
- Or login with existing email if you already have an account

#### 6. **Invalid Specialization (Doctor Registration)**
**Problem**: Specialization field is empty
**Solution**:
- Select a specialization from dropdown:
  - Psychiatrist
  - Psychologist
  - Counselor
  - Therapist

#### 7. **Non-Numeric Experience/Rate (Doctor Registration)**
**Problem**: Experience or rate fields contain non-numeric values
**Solution**:
- Experience must be a number (e.g., 10)
- Rate must be a number (e.g., 50)

---

## ✅ How to Fix the 400 Error

### Step 1: Check All Fields
```
Patient Registration:
✓ Full Name: Not empty
✓ Email: Valid format (user@example.com)
✓ Password: 6+ characters
✓ Phone: 7+ characters
✓ Date of Birth: Selected

Doctor Registration:
✓ Full Name: Not empty
✓ Email: Valid format
✓ Password: 6+ characters
✓ Phone: 7+ characters
✓ Specialization: Selected from dropdown
✓ Years of Experience: Number only
✓ Session Rate: Number only
✓ Languages: Comma-separated
✓ Bio: Not empty
✓ License: Not empty
```

### Step 2: Clear Form & Try Again
1. Refresh page (F5)
2. Fill form carefully
3. Submit

### Step 3: Check Browser Console
1. Press F12 to open DevTools
2. Go to Console tab
3. Look for error messages
4. Copy the full error and check below

---

## 🔧 Common Error Messages & Fixes

### "auth/email-already-in-use"
**Meaning**: This email is already registered
**Fix**: 
- Use a different email
- Or login if you already have account

### "auth/invalid-email"
**Meaning**: Email format is invalid
**Fix**:
- Use format: `user@example.com`
- Include @ symbol and domain

### "auth/weak-password"
**Meaning**: Password is too weak
**Fix**:
- Use at least 6 characters
- Example: `password123`

### "auth/operation-not-allowed"
**Meaning**: Email/password authentication is disabled
**Fix**:
- This is a Firebase config issue
- Contact admin

---

## 🌐 Browser Issues

### Issue: Still Seeing Old Version
**Solution**:
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache: Ctrl+Shift+Delete
3. Try different browser

### Issue: "Join as Patient" Button Still Visible When Logged In
**Solution**:
1. Hard refresh: Ctrl+Shift+R
2. Clear cache and cookies
3. Logout and login again

### Issue: Language Not Changing
**Solution**:
1. Hard refresh: Ctrl+Shift+R
2. Clear browser cache
3. Try different browser

---

## 🔐 Firebase Console Issues

### Can't Access Firebase Console
**Solution**:
1. Go to https://console.firebase.google.com
2. Login with your Google account
3. Select project: mindcare-9a4d2

### Can't Find Doctors Collection
**Solution**:
1. Go to Firestore Database
2. Click on "doctors" collection
3. If not visible, create it:
   - Click "Start Collection"
   - Name: "doctors"
   - Click "Next"

### Can't Verify Doctor
**Solution**:
1. Open doctors collection
2. Find doctor with `verified: false`
3. Click to open
4. Find `verified` field
5. Change value to `true`
6. Click "Update"

---

## 📱 Mobile Issues

### Registration Not Working on Mobile
**Solution**:
1. Make sure all fields are filled
2. Use valid email format
3. Make sure keyboard didn't hide submit button
4. Try landscape orientation

### Can't See "Join as Doctor" Button
**Solution**:
1. Scroll down on home page
2. Button is below "Join as Patient"
3. Or refresh page

---

## 🔍 Debugging Steps

### Step 1: Open Browser Console
- Press F12
- Go to Console tab

### Step 2: Check for Errors
- Look for red error messages
- Copy full error text

### Step 3: Check Network Tab
- Go to Network tab
- Refresh page
- Look for failed requests (red)
- Check Firebase API calls

### Step 4: Check Application Tab
- Go to Application tab
- Check localStorage
- Check if language is saved
- Check if user data exists

---

## 📝 Test Checklist

### Patient Registration
- [ ] Fill all fields with valid data
- [ ] Email format is correct
- [ ] Password is 6+ characters
- [ ] Phone is 7+ characters
- [ ] Date of birth is selected
- [ ] Click "Create Account"
- [ ] Should see success message

### Doctor Registration
- [ ] Fill all fields with valid data
- [ ] Email format is correct
- [ ] Password is 6+ characters
- [ ] Phone is 7+ characters
- [ ] Specialization is selected
- [ ] Experience is a number
- [ ] Rate is a number
- [ ] Languages are comma-separated
- [ ] Bio is filled
- [ ] License is filled
- [ ] Click "Register as Doctor"
- [ ] Should see success message

### Login
- [ ] Use registered email
- [ ] Use correct password
- [ ] Click "Sign In"
- [ ] Should be redirected to dashboard

---

## 🆘 Still Having Issues?

### Check These First
1. ✓ Hard refresh (Ctrl+Shift+R)
2. ✓ Clear browser cache
3. ✓ Try different browser
4. ✓ Check all form fields are filled
5. ✓ Check email format is valid
6. ✓ Check password is 6+ characters

### If Still Not Working
1. Open browser console (F12)
2. Copy the full error message
3. Check the error in this guide
4. Follow the solution

---

## 📊 Error Reference

| Error | Cause | Solution |
|-------|-------|----------|
| 400 Bad Request | Invalid data | Check all fields |
| email-already-in-use | Email exists | Use different email |
| invalid-email | Bad format | Use user@example.com |
| weak-password | Too short | Use 6+ characters |
| operation-not-allowed | Firebase config | Contact admin |

---

## 🚀 Quick Fixes

### Fix 1: Clear Everything & Start Fresh
```
1. Logout (if logged in)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Refresh page (F5)
4. Try registration again
```

### Fix 2: Try Different Browser
```
1. Chrome → Firefox
2. Firefox → Safari
3. Safari → Edge
```

### Fix 3: Incognito/Private Mode
```
1. Open incognito window
2. Go to app
3. Try registration
4. This bypasses cache issues
```

---

**Last Updated**: November 3, 2025
**Status**: ✅ Troubleshooting Guide Complete
