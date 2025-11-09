# Cloud Function Architecture Diagram

## End-to-End Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                    MINDCARE APPOINTMENT NOTIFICATION SYSTEM                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


                              [PATIENT APP]
                                   │
                                   │ Books Appointment
                                   ▼
                         ┌──────────────────┐
                         │ AppointmentBook  │
                         │ Called           │
                         │                  │
                         │ Writes:          │
                         │ {                │
                         │   patientId,     │
                         │   doctorId,      │
                         │   date,          │
                         │   timeSlot,      │
                         │   status:        │
                         │   "pending"      │
                         │ }                │
                         └──────────────────┘
                                   │
                                   │ addDoc(appointmentsRef, ...)
                                   ▼
                         ┌──────────────────────┐
                         │ Firestore            │
                         │ appointments/...     │
                         │ Document Created     │
                         └──────────────────────┘
                                   │
                                   │ onWrite Trigger!
                                   ▼
         ┌──────────────────────────────────────────────────────┐
         │                                                      │
         │   CLOUD FUNCTION: onAppointmentStatusChange         │
         │   (functions/src/appointmentNotifications.ts)       │
         │                                                      │
         │   1. Detect: New document + status="pending"        │
         │   2. Route: Doctor is recipient                     │
         │   3. Fetch: Doctor name from users/{doctorId}       │
         │   4. Generate: Message title & body                 │
         │                                                      │
         └──────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
         ┌──────────────────────┐    ┌─────────────────────────┐
         │ Mock Notification    │    │ Firestore notifications │
         │ Dispatch             │    │ Collection              │
         │                      │    │                         │
         │ Log to Console:      │    │ Write Document:         │
         │ ✓ Notification      │    │ {                       │
         │   queued for        │    │   recipientId: dr123,   │
         │   doctor            │    │   recipientType:        │
         │   (dr123):          │    │   "doctor",             │
         │   "New Appt         │    │   title: "New Appt...",│
         │   Request"          │    │   body: "A patient...", │
         │                      │    │   status: "unread"      │
         │ [Future Integration]│    │ }                       │
         │ - Expo Push         │    │                         │
         │ - Email             │    │ [In-App Inbox Display] │
         │ - FCM               │    │                         │
         └──────────────────────┘    └─────────────────────────┘
                    │                             │
                    └──────────────┬──────────────┘
                                   │
                         ┌─────────────────────┐
                         │  DOCTOR GETS        │
                         │  NOTIFIED!          │
                         │                     │
                         │ Can see in:         │
                         │ - Cloud logs        │
                         │ - Firestore inbox   │
                         │ - DoctorDashboard   │
                         └─────────────────────┘
                                   │
                                   │ Doctor Reviews & 
                                   │ Clicks "Confirm" Button
                                   │
                                   ▼
                         ┌──────────────────┐
                         │ DoctorAppointment│
                         │ Manager Updates  │
                         │ Status:          │
                         │ "confirmed"      │
                         └──────────────────┘
                                   │
                                   │ updateDoc(..., {status: "confirmed"})
                                   ▼
                         ┌──────────────────────┐
                         │ Firestore            │
                         │ appointments/...     │
                         │ Document Updated     │
                         └──────────────────────┘
                                   │
                                   │ onWrite Trigger! (again)
                                   ▼
         ┌──────────────────────────────────────────────────────┐
         │                                                      │
         │   CLOUD FUNCTION: onAppointmentStatusChange         │
         │   (triggers again on status update)                 │
         │                                                      │
         │   1. Detect: status changed pending → confirmed     │
         │   2. Route: Patient is recipient                    │
         │   3. Fetch: Patient name from users/{patientId}     │
         │   4. Generate: "Appointment Confirmed" message      │
         │                                                      │
         └──────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
         ┌──────────────────────┐    ┌─────────────────────────┐
         │ Mock Notification    │    │ Firestore notifications │
         │ Dispatch             │    │ Collection              │
         │                      │    │                         │
         │ Log to Console:      │    │ Write Document:         │
         │ ✓ Notification      │    │ {                       │
         │   queued for        │    │   recipientId: pat456,  │
         │   patient           │    │   recipientType:        │
         │   (pat456):         │    │   "patient",            │
         │   "Appointment      │    │   title: "Appointment..│
         │   Confirmed"        │    │   body: "Your appt...", │
         │                      │    │   status: "unread"      │
         │ [Future Integration]│    │ }                       │
         │ - Expo Push         │    │                         │
         │ - Email             │    │ [In-App Inbox Display] │
         │ - FCM               │    │                         │
         └──────────────────────┘    └─────────────────────────┘
                    │                             │
                    └──────────────┬──────────────┘
                                   │
                         ┌─────────────────────┐
                         │  PATIENT GETS       │
                         │  NOTIFIED!          │
                         │                     │
                         │ Can see in:         │
                         │ - Cloud logs        │
                         │ - Firestore inbox   │
                         │ - PatientDashboard  │
                         └─────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                           STATUS TRANSITION MAP                            │
│                                                                             │
│  NEW → pending           Recipient: Doctor  | Msg: "New Appointment..."   │
│  pending → confirmed     Recipient: Patient | Msg: "Appointment Confirmed" │
│  pending → rejected      Recipient: Patient | Msg: "Appointment Rejected"  │
│  confirmed → cancelled   Recipient: Doctor  | Msg: "Appointment Cancelled" │
│  confirmed → completed   Recipient: Patient | Msg: "Appointment Completed" │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                         CLOUD FUNCTION INTERNALS                           │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ onAppointmentStatusChange(change, context)                         │  │
│  ├─────────────────────────────────────────────────────────────────────┤  │
│  │                                                                     │  │
│  │  1. Extract Snapshots:                                             │  │
│  │     beforeData = change.before.data()  (old version)              │  │
│  │     afterData = change.after.data()    (new version)              │  │
│  │                                                                     │  │
│  │  2. Check if new or status changed:                               │  │
│  │     isNewDocument = !beforeData                                    │  │
│  │     statusChanged = newStatus !== oldStatus                        │  │
│  │                                                                     │  │
│  │  3. Determine Recipient & Message:                                │  │
│  │     if (isNewDocument || status === 'pending') →                  │  │
│  │         recipient = doctorId, type = 'doctor'                     │  │
│  │     else if (status === 'confirmed') →                            │  │
│  │         recipient = patientId, type = 'patient'                   │  │
│  │     else if (status === 'rejected') →                             │  │
│  │         recipient = patientId, type = 'patient'                   │  │
│  │     else if (status === 'cancelled') →                            │  │
│  │         recipient = doctorId, type = 'doctor'                     │  │
│  │     else if (status === 'completed') →                            │  │
│  │         recipient = patientId, type = 'patient'                   │  │
│  │                                                                     │  │
│  │  4. Fetch Recipient Details:                                      │  │
│  │     recipientData = db.collection('users').doc(recipientId)       │  │
│  │     recipientName = recipientData.fullName                        │  │
│  │                                                                     │  │
│  │  5. Dispatch Notification:                                        │  │
│  │     dispatchNotification({                                        │  │
│  │       recipientId, recipientType, recipientName,                 │  │
│  │       messageTitle, messageBody, appointmentId                    │  │
│  │     })                                                             │  │
│  │                                                                     │  │
│  │  6. Return (async complete)                                       │  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                            DEPLOYMENT DIAGRAM                              │
│                                                                             │
│   Local Development              Firebase Backend               Frontend  │
│                                                                             │
│   functions/                                                              │
│   ├── src/                                                               │
│   │   ├── appointmentNotifications.ts  ──npm build──>  lib/             │
│   │   └── index.ts                                      │               │
│   ├── package.json                                      │               │
│   └── tsconfig.json                                     │               │
│                                                          ▼               │
│                                                   Firebase Console   PatientApp │
│                                                   ├─ Functions        │       │
│                                                   │  └─ onAppointment  │       │
│                                                   │     StatusChange   │       │
│                                                   │     (LIVE)         │       │
│                                                   │                    ◄──────►│
│                                                   └─ Firestore         │       │
│                                                      └─ appointments  ──────►  │
│                                                      └─ notifications      │   │
│                                                      └─ users             │   │
│                                                                          │   │
│                                                   [firebase deploy]     │   │
│                                         <─────────────────────────────┘   │
│                                                                            │
│                                         ┌───────────────────────────────┘
│                                         │
│                                    trigger on
│                                  appointment
│                                  writes
│                                         │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                          ERROR HANDLING FLOWCHART                          │
│                                                                             │
│                   Write Received
│                         │
│         ┌───────────────┴───────────────┐
│         ▼                               ▼
│    Is document    ────NO───>  Skip
│    new?          YES          │
│         │                     └─> return
│         └──────┐
│                ▼
│       Did status change?
│         YES              NO
│         │                │
│         ▼                └──> Skip & return
│    Have required fields?
│    (patientId, doctorId,
│     status, date, timeSlot)
│         │
│        NO ────────> Log warning & return
│         │
│        YES
│         ▼
│    Determine recipient
│    based on status
│         │
│        NO ────────> Log (no recipient) & return
│    recipient?
│         │
│        YES
│         ▼
│    Fetch from users collection
│         │
│      NOT FOUND ──> Log warning & return
│         │
│      EXISTS
│         ▼
│    Check recipientType not null
│         │
│        NULL ──> Log & return (type guard)
│         │
│    NOT NULL
│         ▼
│    Dispatch notification
│         │
│       ERROR ──────────────────> Log error
│         │                      (no retry)
│      SUCCESS ─────────────────> Log success
│         │
│         ▼
│    Write to notifications collection
│         │
│       ERROR ──────────────────> Log error
│         │
│      SUCCESS ─────────────────> Log success
│         │
│         ▼
│    COMPLETE ✓
│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Relationships

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   Frontend                Backend                Database                  │
│   ─────────                ───────                ────────                  │
│                                                                             │
│   AppointmentScheduler.js   (calls)              Firestore                  │
│   • Date Picker      ───────────────> addDoc() ────────> appointments/... │
│   • Book Now Button                    │                      │            │
│                                        │                      │            │
│                                        │         ┌────────────┘            │
│                                        │         │ onWrite trigger         │
│                                        │         ▼                         │
│   DoctorDashboard.js                                 Cloud Function         │
│   • View Pending    ◄─────────────────┴─────────  onAppointmentStatus     │
│   • Click Confirm                      Write        Change                │
│                                        │                │                 │
│                                        │                ▼                 │
│   DoctorAppointmentManager.js         │         Query & Transform          │
│   • Confirm Button   ──────────────────┘         Determine Recipient      │
│   • Reject Button     updateDoc()                 Personalize Message     │
│                                                   │                       │
│                                                   ▼                       │
│                        ┌────────────────────  Firestore               ◄──┐
│                        │                      notifications/{docId}      │
│                        │                      • recipientId              │
│                        │                      • title                    │
│                        │                      • body                     │
│                        │                      • status: unread           │
│                        │                      │                         │
│                        ▼                      ▼                         │
│   PatientDashboard.js              Query notifications collection        │
│   • Appointment Status ◄─────────────────  WHERE recipientId = uid       │
│   • Notification Inbox              ORDER BY createdAt DESC              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## File Dependencies

```
Root Project
├── app/
│   └── screens/
│       ├── AppointmentScheduler.js
│       │   ├── Imports: firebase.js
│       │   ├── Writes: appointments collection
│       │   └── Triggers: Cloud Function
│       │
│       ├── DoctorAppointmentManager.js
│       │   ├── Imports: firebase.js
│       │   ├── Updates: appointments status
│       │   └── Triggers: Cloud Function
│       │
│       └── PatientDashboard.js
│           ├── Imports: firebase.js
│           ├── Reads: notifications collection
│           └── Displays: in-app inbox
│
├── functions/
│   └── src/
│       ├── appointmentNotifications.ts ◄─── CLOUD FUNCTION
│       │   ├── Listens: appointments onWrite
│       │   ├── Reads: users collection
│       │   └── Writes: notifications collection
│       │
│       └── index.ts
│           ├── Initializes: Firebase Admin SDK
│           └── Exports: appointmentNotifications
│
├── firestore.rules
│   ├── appointments: ✅ Enforces role-based access
│   ├── notifications: ✅ Allows recipient reads, Cloud Function writes
│   └── users: ✅ Allows authenticated reads, owner writes
│
└── firebase.js
    └── Exports: db, auth, storage, etc.

Flow: Frontend writes → Firestore → Cloud Function reads & processes → 
      Firestore writes → Frontend reads
```

This completes the end-to-end architecture and implementation details!

