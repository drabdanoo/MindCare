# MindCare - Native App Development Strategy

## 🎯 Objective
Build a **native mobile app** (not webview) for iOS and Android to showcase to Zain Cash and other payment providers.

---

## 🏗️ Architecture Recommendation

### Best Option: React Native + Expo
**Why React Native?**
- ✅ Single codebase for iOS & Android
- ✅ Native performance (not webview)
- ✅ Reuse existing React knowledge
- ✅ Fast development
- ✅ Easy to build debug APK/IPA
- ✅ Firebase integration built-in
- ✅ Tailwind CSS support available
- ✅ Can deploy to App Store & Play Store later

**Alternative Options:**
- Flutter - Also good, but requires learning Dart
- Native Swift/Kotlin - Slower development, separate codebases
- Ionic - Uses webview (you don't want this)

---

## 🚀 Quick Start: React Native + Expo

### Step 1: Install Expo CLI
```bash
npm install -g expo-cli
```

### Step 2: Create New React Native Project
```bash
expo init mindcare-native
cd mindcare-native
```

### Step 3: Choose Template
```
Select: "Blank (TypeScript)" or "Blank"
```

### Step 4: Install Dependencies
```bash
npm install firebase
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install axios
npm install i18next react-i18next
```

### Step 5: Start Development
```bash
expo start
```

### Step 6: Run on Device
- **Android**: Press `a` in terminal (requires Android emulator or physical device)
- **iOS**: Press `i` in terminal (requires Mac with Xcode)
- **Web**: Press `w` in terminal (for testing)

---

## 📁 Project Structure

```
mindcare-native/
├── app/
│   ├── screens/
│   │   ├── AuthScreen.js
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── DoctorDashboard.js
│   │   ├── PatientDashboard.js
│   │   ├── BookingScreen.js
│   │   ├── VideoCallScreen.js
│   │   └── PaymentScreen.js
│   ├── components/
│   │   ├── DoctorCard.js
│   │   ├── AppointmentCard.js
│   │   ├── PaymentMethod.js
│   │   └── Header.js
│   ├── services/
│   │   ├── firebase.js
│   │   ├── auth.js
│   │   ├── firestore.js
│   │   └── payment.js
│   ├── i18n/
│   │   ├── en.json
│   │   ├── ar.json
│   │   └── ku.json
│   └── App.js
├── app.json
├── package.json
└── README.md
```

---

## 🔧 Building Debug APK for Android

### Option 1: Using Expo (Easiest)
```bash
# Build APK
eas build --platform android --profile preview

# Download APK from Expo dashboard
# Install on device: adb install app-release.apk
```

### Option 2: Using Android Studio
```bash
# Generate signed APK
cd android
./gradlew assembleDebug
# APK will be in: android/app/build/outputs/apk/debug/
```

### Option 3: Using EAS CLI (Recommended)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build debug APK
eas build --platform android --profile preview

# Download and install
adb install app-release.apk
```

---

## 📱 Building Debug IPA for iOS

### Option 1: Using Expo (Easiest)
```bash
# Build IPA
eas build --platform ios --profile preview

# Download from Expo dashboard
# Install using Xcode or TestFlight
```

### Option 2: Using Xcode
```bash
# Open Xcode project
open ios/mindcare.xcworkspace

# Select "Generic iOS Device"
# Product → Build
# Product → Archive
# Distribute App
```

---

## 🎨 Converting Web App to Native

### What to Reuse
- ✅ Firebase configuration
- ✅ Authentication logic
- ✅ Firestore queries
- ✅ Business logic
- ✅ i18n translations
- ✅ API endpoints

### What to Rebuild
- ❌ UI components (use React Native components)
- ❌ Navigation (use React Navigation)
- ❌ Styling (use React Native StyleSheet)
- ❌ Video calls (use react-native-jitsi-meet)

---

## 💻 Sample Code: Login Screen (React Native)

```javascript
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './services/firebase';

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
      // Navigation handled by auth state listener
    } catch (error) {
      Alert.alert('Login Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MindCare</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#2563eb',
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

## 🎥 Video Call Integration (React Native)

```javascript
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import JitsiMeet, { JitsiMeetView } from 'react-native-jitsi-meet';

export default function VideoCallScreen({ route }) {
  const { appointmentId, participantName } = route.params;

  const handleStartCall = () => {
    const options = {
      room: appointmentId,
      userInfo: {
        displayName: participantName,
      },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
      },
      featureFlags: {
        'chat.enabled': true,
        'recording.enabled': true,
        'raise-hand.enabled': true,
      },
    };

    JitsiMeet.call(options);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Video Call</Text>
      <Text style={styles.subtitle}>{participantName}</Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={handleStartCall}
      >
        <Text style={styles.buttonText}>Join Call</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

---

## 💳 Payment Integration (React Native)

```javascript
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { processMobileMoneyPayment } from './services/payment';

export default function PaymentScreen({ route, navigation }) {
  const { appointmentId, amount } = route.params;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('zaincash');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!name || !phone || !email) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await processMobileMoneyPayment(
        paymentMethod,
        name,
        phone,
        email,
        amount,
        appointmentId
      );

      if (result.success) {
        Alert.alert('Success', `Payment initiated!\n\nTransaction ID: ${result.transactionId}`);
        navigation.goBack();
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Complete Payment</Text>
      
      <View style={styles.summary}>
        <Text style={styles.summaryText}>Amount: ${amount.toFixed(2)}</Text>
      </View>

      <Text style={styles.label}>Payment Method</Text>
      <View style={styles.methodsContainer}>
        {['zaincash', 'asiacellhawala', 'superqi', 'korek'].map(method => (
          <TouchableOpacity
            key={method}
            style={[
              styles.methodButton,
              paymentMethod === method && styles.methodButtonActive,
            ]}
            onPress={() => setPaymentMethod(method)}
          >
            <Text style={styles.methodText}>{method.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone (+964...)"
        value={phone}
        onChangeText={setPhone}
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handlePayment}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Processing...' : 'Pay Now'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  summary: {
    backgroundColor: '#f0f9ff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  methodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 10,
  },
  methodButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    alignItems: 'center',
  },
  methodButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#f0f9ff',
  },
  methodText: {
    fontSize: 12,
    fontWeight: 'bold',
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
    marginBottom: 30,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

---

## 🔐 Firebase Configuration (React Native)

```javascript
// services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

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
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);
```

---

## 📦 Dependencies for React Native

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-native": "^0.73.0",
    "expo": "^50.0.0",
    "firebase": "^10.7.0",
    "@react-native-async-storage/async-storage": "^1.21.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "react-native-screens": "^3.27.0",
    "react-native-safe-area-context": "^4.7.0",
    "react-native-jitsi-meet": "^7.0.0",
    "react-i18next": "^13.5.0",
    "i18next": "^23.7.0",
    "axios": "^1.6.0"
  }
}
```

---

## 🚀 Building Debug APK (Step-by-Step)

### Using Expo (Recommended)

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login to Expo
eas login

# 3. Configure project
eas build:configure

# 4. Build debug APK
eas build --platform android --profile preview

# 5. Download APK from Expo dashboard

# 6. Install on device
adb install app-release.apk

# 7. Or send to Zain Cash via email/cloud
```

### Using Android Studio

```bash
# 1. Generate debug APK
cd android
./gradlew assembleDebug

# 2. APK location
# android/app/build/outputs/apk/debug/app-debug.apk

# 3. Install
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📋 Implementation Checklist

### Phase 1: Setup
- [ ] Install Expo CLI
- [ ] Create React Native project
- [ ] Install dependencies
- [ ] Set up Firebase
- [ ] Configure authentication

### Phase 2: Core Screens
- [ ] Login screen
- [ ] Register screen
- [ ] Doctor dashboard
- [ ] Patient dashboard
- [ ] Booking screen

### Phase 3: Features
- [ ] Doctor discovery
- [ ] Appointment booking
- [ ] Video calls (Jitsi)
- [ ] Payment integration
- [ ] Notifications

### Phase 4: Build & Test
- [ ] Test on Android emulator
- [ ] Test on iOS simulator
- [ ] Build debug APK
- [ ] Build debug IPA
- [ ] Test on physical devices

### Phase 5: Demo
- [ ] Create demo account
- [ ] Test full flow
- [ ] Record demo video
- [ ] Prepare for Zain Cash demo

---

## 🎯 Timeline

**Week 1**: Setup & Core Screens
**Week 2**: Features & Integration
**Week 3**: Testing & Debugging
**Week 4**: Build & Demo

---

## 📱 Supported Platforms

- ✅ Android (API 21+)
- ✅ iOS (12.0+)
- ✅ Web (for testing)

---

## 💡 Pro Tips

1. **Start with Android** - Easier to build debug APK
2. **Use Expo** - Faster development
3. **Test on physical device** - Better for demos
4. **Use Firebase emulator** - For local testing
5. **Keep web version** - For admin dashboard

---

## 📞 Resources

- **React Native Docs**: https://reactnative.dev/
- **Expo Docs**: https://docs.expo.dev/
- **Firebase React Native**: https://rnfirebase.io/
- **React Navigation**: https://reactnavigation.org/

---

**Status**: ✅ Native App Strategy Complete
**Recommendation**: Use React Native + Expo
**Timeline**: 4 weeks to demo-ready app
**Next Step**: Create new React Native project

---

**Last Updated**: November 5, 2025
**Version**: 1.0.0
