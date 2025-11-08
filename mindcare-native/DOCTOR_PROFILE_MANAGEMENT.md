# Doctor Profile Management

## Overview

This document explains how doctor profiles are managed in the MindCare application. The system allows doctors to create profiles with their specialties, consultation fees, and availability, which are then displayed to patients for appointment booking.

## How It Works

### 1. Doctor Registration

When a doctor registers for an account:
1. They provide basic information (name, email, phone, etc.)
2. Their account is set to `approved: false` and `status: pending`
3. They must wait for admin approval before accessing the doctor dashboard

### 2. Admin Approval Process

An admin (not implemented in this version) would:
1. Review pending doctor registrations
2. Approve qualified doctors by setting `approved: true` in their user document
3. Once approved, doctors can log in and complete their professional profiles

### 3. Profile Completion

After approval, doctors can:
1. Log in to their dashboard
2. Navigate to the "Profile" tab
3. Fill in their:
   - Specialty (e.g., Clinical Psychology, Psychiatry)
   - Consultation fee per hour
   - Availability (start time, end time)
4. Save their profile, which sets `profileCompleted: true`

### 4. Patient Access

Patients can:
1. Navigate to the "Doctors" tab in their dashboard
2. View a list of all approved doctors with completed profiles
3. See each doctor's:
   - Name
   - Specialty
   - Consultation fee
   - Availability hours
4. Book appointments with doctors (booking functionality to be implemented)

## Database Structure

### User Document (in 'users' collection)

When a doctor completes their profile, their user document contains:

```javascript
{
  uid: 'doctor-uid',
  fullName: 'Dr. John Smith',
  email: 'john@example.com',
  phone: '+1234567890',
  userType: 'doctor',
  approved: true,
  status: 'active',
  createdAt: Timestamp,
  specialty: 'Clinical Psychology',
  consultationFee: '50',
  availability: {
    startTime: '09:00',
    endTime: '17:00',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  profileCompleted: true
}
```

## Implementation Details

### Doctor Dashboard

The doctor dashboard now includes three tabs:
1. **Dashboard** - Overview with statistics
2. **Appointments** - Manage patient appointments
3. **Profile** - Manage professional profile

### Patient Dashboard

The patient dashboard now includes three tabs:
1. **Dashboard** - Overview with statistics
2. **Appointments** - View personal appointments
3. **Doctors** - Browse available doctors

## Future Enhancements

1. **Admin Panel** - Create an admin interface for approving doctors
2. **Appointment Booking** - Implement functionality for patients to book appointments with doctors
3. **Advanced Availability** - Add more detailed availability settings (specific days, breaks, etc.)
4. **Doctor Ratings** - Allow patients to rate doctors
5. **Search and Filter** - Enable patients to search and filter doctors by specialty, fee, etc.

## Technical Notes

1. Doctors must have both `approved: true` and `profileCompleted: true` to appear in the patient doctor listing
2. Profile information is stored in the user document in the 'users' collection
3. Patient dashboard fetches only doctors that meet the criteria when the "Doctors" tab is accessed
4. All profile data is updated in real-time using Firestore