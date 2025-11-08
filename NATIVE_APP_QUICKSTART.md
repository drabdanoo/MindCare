# MindCare Native App - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Expo CLI
```bash
npm install -g expo-cli
```

### Step 2: Create Project
```bash
expo init mindcare-native
cd mindcare-native
```

Choose: **"Blank (TypeScript)"**

### Step 3: Install Dependencies
```bash
npm install firebase @react-navigation/native @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install @react-native-async-storage/async-storage
npm install react-native-jitsi-meet
npm install i18next react-i18next
npm install axios
```

### Step 4: Start Development
```bash
expo start
```

### Step 5: Run on Device
- **Android**: Press `a` (requires emulator or device)
- **iOS**: Press `i` (requires Mac + Xcode)
- **Web**: Press `w` (for testing)

---

## 📁 Project Structure

Create this folder structure:

```
mindcare-native/
├── app/
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── DoctorDashboard.js
│   │   ├── PatientDashboard.js
│   │   ├── BookingScreen.js
│   │   ├── PaymentScreen.js
│   │   └── VideoCallScreen.js
│   ├── components/
│   │   ├── DoctorCard.js
│   │   ├── AppointmentCard.js
│   │   └── Header.js
│   ├── services/
│   │   ├── firebase.js
│   │   ├── auth.js
│   │   └── payment.js
│   ├── i18n/
│   │   ├── en.json
│   │   ├── ar.json
│   │   └── ku.json
│   └── App.js
├── app.json
└── package.json
```

---

## 🔧 Firebase Setup

Create `app/services/firebase.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'mindcare-9a4d2.firebaseapp.com',
  projectId: 'mindcare-9a4d2',
  storageBucket: 'mindcare-9a4d2.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
```

---

## 🎨 Main App Component

Create `app/App.js`:

```javascript
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';

import LoginScreen from './screens/LoginScreen';
import DoctorDashboard from './screens/DoctorDashboard';
import PatientDashboard from './screens/PatientDashboard';

const Tab = createBottomTabNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Dashboard" component={PatientDashboard} />
        <Tab.Screen name="Doctors" component={DoctorDashboard} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Loading...</Text>
    </View>
  );
}
```

---

## 📱 Login Screen

Create `app/screens/LoginScreen.js`:

```javascript
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      Alert.alert('Login Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MindCare</Text>
      <Text style={styles.subtitle}>Mental Health Care</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    color: '#2563eb',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    color: '#2563eb',
    textAlign: 'center',
    marginTop: 15,
  },
});
```

---

## 🏥 Doctor Dashboard

Create `app/screens/DoctorDashboard.js`:

```javascript
import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../services/firebase';

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAppointments(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const renderAppointment = ({ item }) => (
    <View style={styles.appointmentCard}>
      <Text style={styles.patientName}>{item.patientName}</Text>
      <Text style={styles.appointmentTime}>{item.date} at {item.time}</Text>
      <Text style={styles.status}>{item.status}</Text>
      
      {item.status === 'pending' && (
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={[styles.button, styles.approveButton]}>
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.rejectButton]}>
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === 'confirmed' && (
        <TouchableOpacity style={[styles.button, styles.callButton]}>
          <Text style={styles.buttonText}>Join Call</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Appointments</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : appointments.length === 0 ? (
        <Text style={styles.emptyText}>No appointments</Text>
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointment}
          keyExtractor={item => item.id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  appointmentTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  status: {
    fontSize: 12,
    color: '#2563eb',
    marginBottom: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  callButton: {
    backgroundColor: '#2563eb',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
});
```

---

## 🛠️ Building Debug APK

### Using Expo (Easiest)

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Configure
eas build:configure

# 4. Build
eas build --platform android --profile preview

# 5. Download APK from Expo dashboard

# 6. Install
adb install app-release.apk
```

### Using Android Studio

```bash
# 1. Build
cd android
./gradlew assembleDebug

# 2. Install
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

## 📋 Next Steps

1. **Create project** - `expo init mindcare-native`
2. **Install dependencies** - `npm install`
3. **Set up Firebase** - Copy credentials
4. **Create screens** - Login, Dashboard, Booking
5. **Add features** - Video calls, Payments
6. **Test** - On emulator/device
7. **Build APK** - For demo
8. **Send to Zain Cash** - For review

---

## 🎯 Demo Checklist

- [ ] User registration
- [ ] User login
- [ ] Doctor discovery
- [ ] Appointment booking
- [ ] Doctor approval
- [ ] Video call
- [ ] Payment flow
- [ ] Multi-language support

---

**Status**: ✅ Quick Start Guide Ready
**Time to First App**: 30 minutes
**Time to Demo**: 2-3 weeks
**Next Step**: Run `expo init mindcare-native`

---

**Last Updated**: November 5, 2025
**Version**: 1.0.0
