# MindCare - Video Call Integration Guide

## 📞 Current Appointment Flow

### What Happens When Doctor Approves

**Step 1: Doctor Approves Appointment**
```
Doctor clicks "Approve"
    ↓
Appointment status: pending → confirmed
    ↓
confirmedAt timestamp set
    ↓
Patient notified (dashboard updates)
```

**Step 2: Appointment Confirmed**
- Appointment saved in Firestore with:
  - `status: 'confirmed'`
  - `confirmedAt: timestamp`
  - `sessionType: 'video'` (or audio/text)
  - `date: '2025-11-05'`
  - `time: '10:00'`

**Step 3: Patient & Doctor See Confirmed Appointment**
- Patient dashboard shows: "Confirmed" (blue badge)
- Doctor dashboard shows: "Approved Appointments" section

---

## 🎥 Video Call Flow (Current Gap)

### Current State
- ✅ Appointment booking works
- ✅ Doctor approval works
- ✅ Patient notification works
- ❌ **Video call NOT implemented**

### What's Missing
1. **Video call initiation** - No way to start call
2. **Video call service** - No provider integrated
3. **Call link generation** - No meeting links
4. **Call notifications** - No reminders to join
5. **In-call features** - No video/audio/chat

---

## 🎯 Video Call Service Options

### Option 1: Agora (Recommended for Iraq)
**Pros**:
- Low latency in Middle East
- Affordable pricing
- Good for developing countries
- Easy integration
- Free tier available

**Cons**:
- Requires API key
- Need backend for token generation

**Cost**: Free tier + pay-as-you-go

**Integration**: 
```javascript
// Install Agora SDK
npm install agora-rtc-sdk-ng

// Initialize
const agoraEngine = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
```

---

### Option 2: Jitsi Meet (Open Source)
**Pros**:
- Free and open source
- No API key needed
- Self-hosted option
- Works in Iraq
- Easy to use

**Cons**:
- Less polished UI
- Requires more setup

**Cost**: Free

**Integration**:
```html
<script src="https://meet.jit.si/external_api.js"></script>
<div id="jitsi-container"></div>
<script>
  const api = new JitsiMeetExternalAPI("meet.jit.si", {
    roomName: "appointmentId",
    parentNode: document.querySelector("#jitsi-container"),
  });
</script>
```

---

### Option 3: Twilio (Professional)
**Pros**:
- Enterprise-grade
- Reliable
- Good documentation
- Works globally

**Cons**:
- Expensive
- Overkill for MVP
- Requires backend

**Cost**: $0.01-0.05 per minute

**Integration**: Requires backend server

---

### Option 4: Firebase Realtime Database + WebRTC
**Pros**:
- Free tier available
- Already using Firebase
- Full control
- No third-party dependency

**Cons**:
- Complex implementation
- Requires WebRTC knowledge
- Need STUN/TURN servers

**Cost**: Minimal (Firebase pricing)

---

## 🚀 Recommended Solution: Jitsi Meet

### Why Jitsi?
1. **Free** - No cost
2. **Simple** - Easy integration
3. **Works in Iraq** - No regional restrictions
4. **Open source** - Can self-host if needed
5. **No backend needed** - Works with frontend only

### Implementation Steps

**Step 1: Add Jitsi to HTML**
```html
<script src="https://meet.jit.si/external_api.js"></script>
```

**Step 2: Create Video Call Page**
```html
<section id="videoCallPage" class="hidden fade-in">
  <div class="max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold">Video Call</h2>
      <button onclick="endCall()" class="bg-red-600 text-white px-4 py-2 rounded">End Call</button>
    </div>
    <div id="jitsi-container" style="height: 600px;"></div>
  </div>
</section>
```

**Step 3: Add JavaScript**
```javascript
let jitsiApi = null;

function startVideoCall(appointmentId, participantName) {
  const options = {
    roomName: appointmentId,
    width: "100%",
    height: 600,
    parentNode: document.querySelector("#jitsi-container"),
    userInfo: {
      displayName: participantName,
    },
    configOverwrite: {
      startWithAudioMuted: false,
      startWithVideoMuted: false,
    },
    interfaceConfigOverwrite: {
      TOOLBAR_BUTTONS: [
        "microphone",
        "camera",
        "closedcaptions",
        "desktop",
        "fullscreen",
        "fodeviceselection",
        "hangup",
        "profile",
        "chat",
        "recording",
        "livestreaming",
        "etherpad",
        "sharedvideo",
        "settings",
        "raisehand",
        "videoquality",
        "filmstrip",
        "feedback",
        "stats",
        "shortcuts",
        "tileview",
        "download",
        "help",
        "mute-everyone",
      ],
    },
  };

  jitsiApi = new JitsiMeetExternalAPI("meet.jit.si", options);

  jitsiApi.addEventListener("videoConferenceJoined", onVideoConferenceJoined);
  jitsiApi.addEventListener("videoConferenceLocked", onVideoConferenceLocked);
  jitsiApi.addEventListener("videoConferenceLeft", onVideoConferenceLeft);
}

function onVideoConferenceJoined() {
  console.log("Video conference joined");
}

function onVideoConferenceLocked() {
  console.log("Video conference locked");
}

function onVideoConferenceLeft() {
  console.log("Video conference left");
  navigateTo("dashboard");
}

function endCall() {
  if (jitsiApi) {
    jitsiApi.dispose();
    jitsiApi = null;
  }
  navigateTo("dashboard");
}
```

---

## 📅 Appointment Timeline

### Before Appointment
```
T-24 hours: Email reminder sent
T-1 hour: SMS reminder sent
T-15 min: In-app notification
```

### At Appointment Time
```
Patient sees: "Join Video Call" button
Doctor sees: "Join Video Call" button
```

### During Appointment
```
Video call active
Both can see/hear each other
Can record (optional)
Can chat
```

### After Appointment
```
Call ends
Appointment marked as "completed"
Both can rate the session
```

---

## 🔧 Implementation Plan

### Phase 1: Basic Video Call (Week 1)
- [ ] Add Jitsi integration
- [ ] Create video call page
- [ ] Add "Join Call" button to confirmed appointments
- [ ] Test with 2 users

### Phase 2: Call Management (Week 2)
- [ ] Add call reminders
- [ ] Add call history
- [ ] Add call recording
- [ ] Add call ratings

### Phase 3: Advanced Features (Week 3)
- [ ] Screen sharing
- [ ] Virtual backgrounds
- [ ] Chat during call
- [ ] Call transcription

### Phase 4: Production (Week 4)
- [ ] Self-host Jitsi (optional)
- [ ] Add analytics
- [ ] Performance optimization
- [ ] Security hardening

---

## 📊 Data Structure for Video Calls

### Appointments Collection (Updated)
```json
{
  "patientId": "patient_uid",
  "doctorId": "doctor_uid",
  "sessionType": "video",
  "date": "2025-11-05",
  "time": "10:00",
  "reason": "Consultation",
  "status": "confirmed",
  "confirmedAt": "timestamp",
  
  // NEW: Video call fields
  "callRoomId": "appointmentId",
  "callStartedAt": null,
  "callEndedAt": null,
  "callDuration": 0,
  "callRecordingUrl": null,
  
  // NEW: Ratings
  "patientRating": null,
  "doctorRating": null,
  "patientFeedback": null,
  "doctorFeedback": null
}
```

### Call History Collection (New)
```json
{
  "appointmentId": "apt_123",
  "patientId": "patient_uid",
  "doctorId": "doctor_uid",
  "startedAt": "timestamp",
  "endedAt": "timestamp",
  "duration": 1800, // seconds
  "recordingUrl": "https://...",
  "participants": ["patient_uid", "doctor_uid"]
}
```

---

## 🔐 Security Considerations

### Video Call Security
1. **Room ID** - Use appointment ID as room ID
2. **Authentication** - Only doctor and patient can join
3. **Encryption** - Jitsi uses DTLS-SRTP
4. **Recording** - Only with consent
5. **Privacy** - No data stored on Jitsi servers

### Firestore Rules for Calls
```
match /callHistory/{id} {
  allow create: if signedIn() && 
    (request.resource.data.patientId == request.auth.uid ||
     request.resource.data.doctorId == request.auth.uid);
  
  allow read: if signedIn() && 
    (resource.data.patientId == request.auth.uid ||
     resource.data.doctorId == request.auth.uid);
}
```

---

## 💰 Cost Analysis

### Jitsi Meet (Recommended)
- **Cost**: FREE
- **Participants**: Unlimited
- **Duration**: Unlimited
- **Recording**: Limited (Jitsi servers)
- **Self-hosting**: Optional

### Agora
- **Cost**: $0.0099 per minute
- **Participants**: 1-17 (free tier)
- **Duration**: Unlimited
- **Recording**: Included
- **Self-hosting**: No

### Twilio
- **Cost**: $0.01-0.05 per minute
- **Participants**: Unlimited
- **Duration**: Unlimited
- **Recording**: Included
- **Self-hosting**: No

---

## 🎯 Recommended Next Steps

1. **Immediate** (This week)
   - Integrate Jitsi Meet
   - Add video call page
   - Add "Join Call" button

2. **Short-term** (Next 2 weeks)
   - Add call reminders
   - Add call history
   - Add ratings

3. **Medium-term** (Next month)
   - Add screen sharing
   - Add chat
   - Add recording

4. **Long-term** (Next quarter)
   - Self-host Jitsi
   - Add AI transcription
   - Add call analytics

---

## 📞 Support & Resources

### Jitsi Documentation
- https://jitsi.org/
- https://jitsi.github.io/handbook/

### Agora Documentation
- https://docs.agora.io/

### Twilio Documentation
- https://www.twilio.com/docs/video

### WebRTC Resources
- https://webrtc.org/
- https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API

---

**Last Updated**: November 3, 2025
**Status**: ✅ Ready for Implementation
**Recommendation**: Use Jitsi Meet for MVP
