import { auth, db } from './firebase-init.js';
import { initI18n, t, setLanguage } from './i18n.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  setDoc,
} from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';

// Global state
let currentUser = null;
let userRole = null; // 'patient' or 'doctor'
let doctors = []; // Will be loaded from Firestore

// Initialize app
async function initApp() {
  await initI18n();
  setupEventListeners();
  setupAuthListener();
  setupLanguageSwitcher();
}

// Setup language switcher
function setupLanguageSwitcher() {
  const langButtons = document.querySelectorAll('[data-lang]');
  
  // Set active button on load
  const currentLang = localStorage.getItem('language') || 'ar';
  langButtons.forEach((btn) => {
    if (btn.getAttribute('data-lang') === currentLang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  langButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = btn.getAttribute('data-lang');
      setLanguage(lang);
      langButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// Setup event listeners
function setupEventListeners() {
  // Navigation
  document.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const page = btn.getAttribute('data-nav');
      navigateTo(page);
    });
  });

  // CTA buttons
  document.getElementById('ctaFindDoctor')?.addEventListener('click', () => {
    if (currentUser) {
      navigateTo('doctors');
    } else {
      navigateTo('login');
    }
  });

  document.getElementById('ctaJoin')?.addEventListener('click', () => {
    navigateTo('register');
  });

  // Auth forms
  document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
  document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
  document.getElementById('doctorRegisterForm')?.addEventListener('submit', handleDoctorRegister);
  document.getElementById('bookingForm')?.addEventListener('submit', handleBooking);

  // Nav buttons
  document.getElementById('navLoginBtn')?.addEventListener('click', () => navigateTo('login'));
  document.getElementById('navSignupBtn')?.addEventListener('click', () => navigateTo('register'));
  document.getElementById('navLogoutBtn')?.addEventListener('click', handleLogout);
  document.getElementById('navDoctorBtn')?.addEventListener('click', () => navigateTo('doctorDashboard'));

  // Load doctors after a short delay to ensure DOM is ready
  setTimeout(() => loadDoctors(), 100);
}

// Setup auth listener
function setupAuthListener() {
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    
    if (user) {
      await checkUserRole(user.uid);
    } else {
      userRole = null;
    }
    
    updateNavigation();
  });
}

// Check user role
async function checkUserRole(uid) {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      userRole = userDoc.data().role || 'patient';
    }
  } catch (error) {
    // User role check failed, defaulting to patient
    userRole = 'patient';
  }
}

// Update navigation based on auth state
function updateNavigation() {
  const navLoginBtn = document.getElementById('navLoginBtn');
  const navSignupBtn = document.getElementById('navSignupBtn');
  const navLogoutBtn = document.getElementById('navLogoutBtn');
  const navUser = document.getElementById('navUser');
  const navDoctorBtn = document.getElementById('navDoctorBtn');
  const ctaFindDoctor = document.getElementById('ctaFindDoctor');
  const ctaJoin = document.getElementById('ctaJoin');
  const ctaJoinDoctor = document.getElementById('ctaJoinDoctor');

  if (currentUser) {
    // User is logged in
    navLoginBtn?.classList.add('hidden');
    navSignupBtn?.classList.add('hidden');
    navLogoutBtn?.classList.remove('hidden');
    navUser?.classList.remove('hidden');
    navUser.textContent = `${t('auth.email')}: ${currentUser.email}`;

    // Hide CTA buttons for logged-in users
    ctaFindDoctor?.classList.add('hidden');
    ctaJoin?.classList.add('hidden');
    ctaJoinDoctor?.classList.add('hidden');

    if (userRole === 'doctor') {
      navDoctorBtn?.classList.remove('hidden');
    }
  } else {
    // User is not logged in
    navLoginBtn?.classList.remove('hidden');
    navSignupBtn?.classList.remove('hidden');
    navLogoutBtn?.classList.add('hidden');
    navUser?.classList.add('hidden');
    navDoctorBtn?.classList.add('hidden');

    // Show CTA buttons for non-logged-in users
    ctaFindDoctor?.classList.remove('hidden');
    ctaJoin?.classList.remove('hidden');
    ctaJoinDoctor?.classList.remove('hidden');
  }
}

// Navigate to page
function navigateTo(page) {
  // Protect pages that require authentication
  const protectedPages = ['dashboard', 'booking', 'doctorDashboard'];
  if (protectedPages.includes(page) && !currentUser) {
    alert('Please login first');
    navigateTo('login');
    return;
  }

  // Redirect logged-in users away from auth pages
  const authPages = ['login', 'register'];
  if (authPages.includes(page) && currentUser) {
    navigateTo('dashboard');
    return;
  }

  // Hide all pages
  document.querySelectorAll('section[id$="Page"]').forEach((section) => {
    section.classList.add('hidden');
  });

  // Show selected page
  const pageElement = document.getElementById(`${page}Page`);
  if (pageElement) {
    pageElement.classList.remove('hidden');
  }

  // Load dashboard data if navigating to dashboard
  if (page === 'dashboard' && currentUser) {
    loadDashboardData();
  }

  // Load doctor dashboard if navigating to doctor dashboard
  if (page === 'doctorDashboard' && currentUser && userRole === 'doctor') {
    loadDoctorDashboard();
  }

  // Scroll to top
  window.scrollTo(0, 0);
}

// Load dashboard data
async function loadDashboardData() {
  try {
    const q = query(collection(db, 'appointments'), where('patientId', '==', currentUser.uid));
    const querySnapshot = await getDocs(q);

    let upcoming = 0;
    let completed = 0;
    const appointments = [];

    querySnapshot.forEach((doc) => {
      const apt = { id: doc.id, ...doc.data() };
      if (apt.status === 'completed') {
        completed++;
      } else if (apt.status === 'pending' || apt.status === 'confirmed') {
        upcoming++;
      }
      appointments.push(apt);
    });

    // Update stats
    document.getElementById('statUpcoming').textContent = upcoming;
    document.getElementById('statCompleted').textContent = completed;

    // Display appointments
    const upcomingList = document.getElementById('upcomingList');
    if (appointments.length === 0) {
      upcomingList.innerHTML = '<p class="text-gray-500">No appointments scheduled</p>';
    } else {
      upcomingList.innerHTML = appointments
        .map(
          (apt) => `
        <div class="border border-gray-200 p-4 rounded-lg">
          <div class="flex justify-between items-start mb-3">
            <div>
              <p class="font-semibold text-gray-900">${apt.date} at ${apt.time}</p>
              <p class="text-sm text-gray-600">${apt.sessionType} session</p>
              <p class="text-sm text-gray-600">${apt.reason}</p>
            </div>
            <span class="px-3 py-1 rounded-full text-sm font-medium ${
              apt.status === 'completed'
                ? 'bg-green-100 text-green-800'
                : apt.status === 'confirmed'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
            }">${apt.status}</span>
          </div>
          ${apt.status === 'confirmed' ? `<button onclick="startVideoCall('${apt.id}', '${currentUser.displayName || 'Patient'}')" class="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium">Join Video Call</button>` : ''}
        </div>
      `
        )
        .join('');
    }
  } catch (error) {
    // Error loading dashboard data
  }
}

// Load doctor dashboard
async function loadDoctorDashboard() {
  try {
    // Get doctor's profile to check verification status
    const docProfileSnap = await getDoc(doc(db, 'doctors', currentUser.uid));
    const docProfile = docProfileSnap.data();

    // Update verification badge
    const badge = document.getElementById('docVerifiedBadge');
    if (docProfile?.verified) {
      badge.textContent = 'Verified';
      badge.className = 'text-sm px-3 py-1 rounded-full bg-green-100 text-green-800';
    } else {
      badge.textContent = 'Pending Verification';
      badge.className = 'text-sm px-3 py-1 rounded-full bg-yellow-100 text-yellow-800';
    }

    // Get appointments for this doctor
    const q = query(collection(db, 'appointments'), where('doctorId', '==', currentUser.uid));
    const querySnapshot = await getDocs(q);

    let pending = 0;
    let approved = 0;
    let completed = 0;
    const pendingAppts = [];
    const approvedAppts = [];
    const completedAppts = [];

    querySnapshot.forEach((doc) => {
      const apt = { id: doc.id, ...doc.data() };
      if (apt.status === 'pending') {
        pending++;
        pendingAppts.push(apt);
      } else if (apt.status === 'confirmed') {
        approved++;
        approvedAppts.push(apt);
      } else if (apt.status === 'completed') {
        completed++;
        completedAppts.push(apt);
      }
    });

    // Update stats
    document.getElementById('docStatPending').textContent = pending;
    document.getElementById('docStatApproved').textContent = approved;
    document.getElementById('docStatCompleted').textContent = completed;

    // Display pending appointments
    const pendingList = document.getElementById('doctorPendingList');
    if (pendingAppts.length === 0) {
      pendingList.innerHTML = '<p class="text-gray-500">No pending appointments</p>';
    } else {
      pendingList.innerHTML = pendingAppts
        .map(
          (apt) => `
        <div class="border border-yellow-200 p-4 rounded-lg bg-yellow-50">
          <div class="flex justify-between items-start mb-3">
            <div>
              <p class="font-semibold text-gray-900">Patient Request</p>
              <p class="text-sm text-gray-600">${apt.date} at ${apt.time}</p>
              <p class="text-sm text-gray-600">${apt.sessionType} session</p>
              <p class="text-sm text-gray-600">Reason: ${apt.reason}</p>
            </div>
            <span class="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">Pending</span>
          </div>
          <div class="flex space-x-2">
            <button onclick="approveAppointment('${apt.id}')" class="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium">Approve</button>
            <button onclick="rejectAppointment('${apt.id}')" class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium">Reject</button>
          </div>
        </div>
      `
        )
        .join('');
    }

    // Display approved appointments
    const approvedList = document.getElementById('doctorApprovedList');
    if (approvedAppts.length === 0) {
      approvedList.innerHTML = '<p class="text-gray-500">No approved appointments</p>';
    } else {
      approvedList.innerHTML = approvedAppts
        .map(
          (apt) => `
        <div class="border border-blue-200 p-4 rounded-lg bg-blue-50">
          <div class="flex justify-between items-start mb-3">
            <div>
              <p class="font-semibold text-gray-900">Confirmed Appointment</p>
              <p class="text-sm text-gray-600">${apt.date} at ${apt.time}</p>
              <p class="text-sm text-gray-600">${apt.sessionType} session</p>
            </div>
            <span class="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">Confirmed</span>
          </div>
          <button onclick="startVideoCall('${apt.id}', 'Dr. ${currentUser.displayName || 'Doctor'}')" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">Join Video Call</button>
        </div>
      `
        )
        .join('');
    }

    // Display completed appointments
    const completedList = document.getElementById('doctorCompletedList');
    if (completedAppts.length === 0) {
      completedList.innerHTML = '<p class="text-gray-500">No completed appointments</p>';
    } else {
      completedList.innerHTML = completedAppts
        .map(
          (apt) => `
        <div class="border border-green-200 p-4 rounded-lg bg-green-50">
          <div class="flex justify-between items-start">
            <div>
              <p class="font-semibold text-gray-900">Completed</p>
              <p class="text-sm text-gray-600">${apt.date} at ${apt.time}</p>
              <p class="text-sm text-gray-600">${apt.sessionType} session</p>
            </div>
            <span class="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Completed</span>
          </div>
        </div>
      `
        )
        .join('');
    }
  } catch (error) {
    // Error loading doctor dashboard
  }
}

// Approve appointment
window.approveAppointment = async function (appointmentId) {
  try {
    await updateDoc(doc(db, 'appointments', appointmentId), {
      status: 'confirmed',
      confirmedAt: serverTimestamp(),
    });
    alert('Appointment approved! Patient has been notified.');
    loadDoctorDashboard();
  } catch (error) {
    alert(`Error approving appointment: ${error.message}`);
  }
};

// Reject appointment
window.rejectAppointment = async function (appointmentId) {
  try {
    await updateDoc(doc(db, 'appointments', appointmentId), {
      status: 'rejected',
      rejectedAt: serverTimestamp(),
    });
    alert('Appointment rejected. Patient has been notified.');
    loadDoctorDashboard();
  } catch (error) {
    alert(`Error rejecting appointment: ${error.message}`);
  }
};

// Register handler
async function handleRegister(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  // Validate form
  const email = formData.get('email')?.trim();
  const password = formData.get('password')?.trim();
  const fullName = formData.get('fullName')?.trim();
  const phone = formData.get('phone')?.trim();
  const dob = formData.get('dob')?.trim();

  if (!email || !password || !fullName || !phone || !dob) {
    alert('Please fill in all fields');
    return;
  }

  if (password.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address');
    return;
  }

  // Validate phone format (basic check)
  if (phone.length < 7) {
    alert('Please enter a valid phone number');
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Save user data with UID as document ID
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      fullName: fullName,
      email: email,
      phone: phone,
      dob: dob,
      role: 'patient',
      createdAt: serverTimestamp(),
    });

    alert('Registration successful!');
    navigateTo('home');
    e.target.reset();
  } catch (error) {
    // Handle specific Firebase errors
    if (error.code === 'auth/email-already-in-use') {
      alert('This email is already registered. Please login or use a different email.');
    } else if (error.code === 'auth/invalid-email') {
      alert('Invalid email address');
    } else if (error.code === 'auth/weak-password') {
      alert('Password is too weak. Use at least 6 characters.');
    } else {
      alert(`Registration failed: ${error.message}`);
    }
  }
}

// Doctor registration handler
async function handleDoctorRegister(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  // Get form values
  const email = formData.get('email')?.trim();
  const password = formData.get('password')?.trim();
  const fullName = formData.get('fullName')?.trim();
  const phone = formData.get('phone')?.trim();
  const specialization = formData.get('specialization')?.trim();
  const yearsExpStr = formData.get('yearsExp')?.trim();
  const rateStr = formData.get('rate')?.trim();
  const languages = formData.get('languages')?.trim();
  const bio = formData.get('bio')?.trim();
  const license = formData.get('license')?.trim();

  // Validate all fields are filled
  if (!email || !password || !fullName || !phone || !specialization || !yearsExpStr || !rateStr || !languages || !bio || !license) {
    alert('Please fill in all fields');
    return;
  }

  // Validate password length
  if (password.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address');
    return;
  }

  // Validate phone format
  if (phone.length < 7) {
    alert('Please enter a valid phone number');
    return;
  }

  // Convert and validate experience and rate
  const yearsExp = parseInt(yearsExpStr);
  const rate = parseInt(rateStr);

  if (isNaN(yearsExp) || yearsExp < 0 || yearsExp > 70) {
    alert('Years of experience must be a number between 0 and 70');
    return;
  }

  if (isNaN(rate) || rate < 10) {
    alert('Session rate must be a number of at least $10');
    return;
  }

  // Validate languages
  if (languages.length < 3) {
    alert('Please enter at least one language');
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Save doctor data with UID as document ID
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      fullName: fullName,
      email: email,
      phone: phone,
      role: 'doctor',
      createdAt: serverTimestamp(),
    });

    // Save doctor profile in doctors collection with UID as document ID
    await setDoc(doc(db, 'doctors', userCredential.user.uid), {
      uid: userCredential.user.uid,
      name: fullName,
      email: email,
      phone: phone,
      specialization: specialization,
      yearsExp: yearsExp,
      rate: rate,
      languages: languages.split(',').map(l => l.trim()),
      bio: bio,
      license: license,
      verified: false,
      rating: 5.0,
      image: '👨‍⚕️',
      createdAt: serverTimestamp(),
    });

    alert('Doctor registration submitted! Your profile is pending verification by our admin team.');
    navigateTo('home');
    e.target.reset();
  } catch (error) {
    // Handle specific Firebase errors
    if (error.code === 'auth/email-already-in-use') {
      alert('This email is already registered. Please login or use a different email.');
    } else if (error.code === 'auth/invalid-email') {
      alert('Invalid email address');
    } else if (error.code === 'auth/weak-password') {
      alert('Password is too weak. Use at least 6 characters.');
    } else {
      alert(`Doctor registration failed: ${error.message}`);
    }
  }
}

// Login handler
async function handleLogin(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !password) {
    alert('Please enter email and password');
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Get user role immediately
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    const role = userDoc.exists() ? (userDoc.data().role || 'patient') : 'patient';
    
    alert('Login successful!');
    
    // Redirect based on user role
    if (role === 'doctor') {
      navigateTo('doctorDashboard');
    } else {
      navigateTo('dashboard');
    }
    e.target.reset();
  } catch (error) {
    alert(`Login failed: ${error.message}`);
  }
}

// Logout handler
async function handleLogout() {
  try {
    await signOut(auth);
    currentUser = null;
    userRole = null;
    navigateTo('home');
  } catch (error) {
    alert(`Logout failed: ${error.message}`);
  }
}

// Load doctors from Firestore
async function loadDoctors() {
  const doctorCards = document.getElementById('doctorCards');
  if (!doctorCards) return;

  try {
    doctorCards.innerHTML = '<p class="col-span-full text-center text-gray-500">Loading doctors...</p>';
    
    // Only load VERIFIED doctors
    const q = query(collection(db, 'doctors'), where('verified', '==', true));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      doctorCards.innerHTML = '<p class="col-span-full text-center text-gray-500">No doctors available</p>';
      return;
    }

    doctors = [];
    querySnapshot.forEach((doc) => {
      doctors.push({ id: doc.id, ...doc.data() });
    });

    doctorCards.innerHTML = doctors
      .map(
        (doctor) => `
      <div class="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
        <div class="text-4xl mb-4">${doctor.image || '👨‍⚕️'}</div>
        <h3 class="text-xl font-semibold mb-2">${doctor.name}</h3>
        <p class="text-sm text-gray-600 mb-3">${doctor.specialization}</p>
        <div class="space-y-2 mb-4 text-sm">
          <p><strong>${t('doctors.yearsExp')}:</strong> ${doctor.yearsExp} years</p>
          <p><strong>${t('doctors.ratePerSession')}:</strong> $${doctor.rate}</p>
          <p><strong>Rating:</strong> ⭐ ${doctor.rating || 'N/A'}</p>
          <p><strong>${t('doctors.filterLanguage')}:</strong> ${doctor.languages?.join(', ') || 'N/A'}</p>
          <p class="text-gray-600">${doctor.bio || ''}</p>
        </div>
        <button onclick="bookDoctor('${doctor.id}', '${doctor.name}')" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
          ${t('doctors.bookNow')}
        </button>
      </div>
    `
      )
      .join('');
  } catch (error) {
    doctorCards.innerHTML = '<p class="col-span-full text-center text-red-500">Error loading doctors</p>';
  }
}

// Book doctor
window.bookDoctor = async function (doctorId, doctorName) {
  if (!currentUser) {
    alert('Please login first');
    navigateTo('login');
    return;
  }

  try {
    // Verify doctor exists and is verified
    const docSnap = await getDoc(doc(db, 'doctors', doctorId));
    if (!docSnap.exists()) {
      alert('Doctor not found');
      return;
    }
    
    if (!docSnap.data().verified) {
      alert('This doctor is not yet verified. Please choose another doctor.');
      return;
    }

    window.selectedDoctorId = doctorId;
    document.getElementById('selectedDoctor').textContent = `with Dr. ${doctorName}`;
    navigateTo('booking');
  } catch (error) {
    alert(`Error loading doctor information: ${error.message}`);
  }
};

// Handle booking
async function handleBooking(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  // Validate booking form
  const sessionType = formData.get('sessionType');
  const date = formData.get('date');
  const time = formData.get('time');
  const reason = formData.get('reason');
  const emergency = formData.get('emergency');

  if (!sessionType || !date || !time || !reason || !emergency) {
    alert('Please fill in all booking fields');
    return;
  }

  // Validate date is in future
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) {
    alert('Please select a future date');
    return;
  }

  try {
    await addDoc(collection(db, 'appointments'), {
      patientId: currentUser.uid,
      doctorId: window.selectedDoctorId,
      sessionType: sessionType,
      date: date,
      time: time,
      reason: reason,
      emergency: emergency,
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    alert('Appointment booked successfully!');
    navigateTo('dashboard');
    e.target.reset();
  } catch (error) {
    alert(`Booking failed: ${error.message}`);
  }
}

// Jitsi video call integration
let jitsiApi = null;
let callStartTime = null;
let callTimerInterval = null;

window.startVideoCall = async function (appointmentId, participantName) {
  try {
    // Update appointment to mark call as started
    await updateDoc(doc(db, 'appointments', appointmentId), {
      callStartedAt: serverTimestamp(),
    });

    callStartTime = Date.now();
    navigateTo('videoCall');

    // Initialize Jitsi Meet
    const options = {
      roomName: appointmentId,
      width: '100%',
      height: 600,
      parentNode: document.querySelector('#jitsi-container'),
      userInfo: {
        displayName: participantName,
      },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        disableSimulcast: false,
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone',
          'camera',
          'closedcaptions',
          'desktop',
          'fullscreen',
          'fodeviceselection',
          'hangup',
          'chat',
          'settings',
          'raisehand',
          'videoquality',
          'filmstrip',
          'stats',
          'shortcuts',
          'tileview',
          'help',
        ],
        SHOW_JITSI_WATERMARK: false,
        MOBILE_APP_PROMO: false,
      },
    };

    jitsiApi = new JitsiMeetExternalAPI('meet.jit.si', options);

    // Event listeners
    jitsiApi.addEventListener('videoConferenceJoined', () => {
      console.log('Video conference joined');
      startCallTimer();
    });

    jitsiApi.addEventListener('videoConferenceLeft', () => {
      console.log('Video conference left');
      endVideoCall();
    });

    jitsiApi.addEventListener('participantJoined', (event) => {
      console.log('Participant joined:', event.detail);
    });

    jitsiApi.addEventListener('participantLeft', (event) => {
      console.log('Participant left:', event.detail);
    });
  } catch (error) {
    alert(`Error starting video call: ${error.message}`);
    navigateTo('dashboard');
  }
};

function startCallTimer() {
  const timerElement = document.getElementById('callTimer');
  callTimerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - callStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, 1000);
}

window.endVideoCall = async function () {
  try {
    // Stop timer
    if (callTimerInterval) {
      clearInterval(callTimerInterval);
    }

    // Dispose Jitsi
    if (jitsiApi) {
      jitsiApi.dispose();
      jitsiApi = null;
    }

    // Navigate back
    navigateTo('dashboard');
  } catch (error) {
    console.error('Error ending video call:', error);
    navigateTo('dashboard');
  }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
