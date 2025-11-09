# Doctor Visibility Fix

## Issue Description

Patients were not able to see doctors in the "Doctors" tab even when doctors existed in the database. This was happening because the query used to fetch doctors for patients was too restrictive.

## Root Cause

The original query in [PatientDashboard.js](file:///g:/Mindcare/mindcare-native/app/screens/PatientDashboard.js) required doctors to have `profileCompleted: true`:

```javascript
const q = query(
  collection(db, 'users'),
  where('userType', '==', 'doctor'),
  where('approved', '==', true),
  where('profileCompleted', '==', true)
);
```

However:
1. Doctors are not created with `profileCompleted: false` during registration
2. Admin approval does not set `profileCompleted: false`
3. Only when doctors complete their profile is `profileCompleted: true` set

This meant that approved doctors who had not yet completed their profile would not appear in the patient's doctor list.

## Solution

The query was modified to be more flexible. Instead of requiring `profileCompleted: true`, it now:

1. Queries for approved doctors without checking `profileCompleted`
2. Filters the results in code to ensure they have the required profile fields (specialty, consultationFee, availability)

```javascript
const q = query(
  collection(db, 'users'),
  where('userType', '==', 'doctor'),
  where('approved', '==', true)
);

const doctorsData = querySnapshot.docs
  .map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
  .filter(doctor => 
    doctor.specialty && 
    (doctor.consultationFee || doctor.consultationFee === 0) && 
    doctor.availability
  );
```

This ensures that any approved doctor who has completed their profile with the minimum required information will be visible to patients.

## Testing

To test this fix:

1. Register a new doctor account
2. Approve the doctor via AdminPanel
3. Log in as the approved doctor and complete their profile
4. Log in as a patient and navigate to the "Doctors" tab
5. The doctor should now be visible in the list

## Future Improvements

1. Consider adding a more explicit `profileCompleted` field during registration
2. Add better error handling and user feedback when no doctors are available
3. Implement search and filtering capabilities for the doctor list