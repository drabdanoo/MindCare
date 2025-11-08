import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { createUserWithEmailAndPassword, updateProfile, deleteUser } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { validateRegistrationForm } from '../utils/validation';
import GoogleSignInButton from '../components/GoogleSignInButton';

// Check if Firebase services are properly initialized
const isFirebaseInitialized = !!auth && !!db;

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState('patient');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleRegister = async () => {
    console.log('Attempting registration with email:', email, 'and userType:', userType);
    
    // Check if Firebase is initialized
    if (!isFirebaseInitialized) {
      console.error('Firebase services are not initialized');
      Alert.alert(
        'Configuration Error',
        'Registration service is not properly configured. Please check your Firebase credentials.'
      );
      return;
    }

    // Validate form
    const { isValid, errors: validationErrors } = validateRegistrationForm({
      fullName,
      email,
      password,
      phone,
    });

    if (!isValid) {
      console.log('Form validation failed:', validationErrors);
      setErrors(validationErrors);
      Alert.alert('Validation Error', Object.values(validationErrors).join('\n'));
      return;
    }

    setErrors({});
    setLoading(true);
    let userCredential; // Define userCredential outside the try block
    try {
      console.log('Calling createUserWithEmailAndPassword');
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User created:', user.uid);

      await updateProfile(user, {
        displayName: fullName,
      });
      console.log('User profile updated');

      const isDoctor = userType === 'doctor';
      console.log('Creating user document in Firestore');
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        fullName,
        email,
        phone,
        userType, // 'doctor' or 'patient'
        approved: isDoctor ? false : true, // doctors need admin approval
        status: isDoctor ? 'pending' : 'active',
        createdAt: new Date(),
        requestedAt: isDoctor ? new Date() : null,
      });
      console.log('User document created in Firestore');

      Alert.alert(
        'Success',
        isDoctor
          ? 'Account created! Your doctor profile is pending admin approval.'
          : 'Account created successfully!',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      console.error('Registration error:', error);
      
      // If user was created, but profile update or firestore doc creation fails, delete the user
      if (userCredential) {
        try {
          await deleteUser(userCredential.user);
        } catch (deleteError) {
          console.error("Failed to delete user after registration error:", deleteError);
        }
      }

      let errorMessage = 'Registration failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password accounts are not enabled.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        // Catch firestore errors from setDoc
        errorMessage = 'Failed to save user profile. Please try again.';
      }
      Alert.alert('Registration Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignInSuccess = (user) => {
    console.log('Google Sign-In successful:', user);
    Alert.alert(
      'Success', 
      'Google Sign-In successful! Please complete your profile.',
      [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
    );
    // The user is automatically redirected to the dashboard by the App.js component
  };

  const handleGoogleSignInError = (error) => {
    console.error('Google Sign-In error:', error);
    Alert.alert('Google Sign-In Error', error.message || 'An error occurred during Google Sign-In');
  };

  // Display error message if Firebase is not initialized
  if (!isFirebaseInitialized) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Registration service is not available. Please contact support.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      {errors.fullName && <Text style={styles.errorMessage}>{errors.fullName}</Text>}
      <TextInput
        style={[styles.input, errors.fullName && styles.inputError]}
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
        editable={!loading}
        placeholderTextColor="#999"
      />

      {errors.email && <Text style={styles.errorMessage}>{errors.email}</Text>}
      <TextInput
        style={[styles.input, errors.email && styles.inputError]}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
        keyboardType="email-address"
        placeholderTextColor="#999"
        autoCapitalize="none"
      />

      {errors.phone && <Text style={styles.errorMessage}>{errors.phone}</Text>}
      <TextInput
        style={[styles.input, errors.phone && styles.inputError]}
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        editable={!loading}
        keyboardType="phone-pad"
        placeholderTextColor="#999"
      />

      {errors.password && <Text style={styles.errorMessage}>{errors.password}</Text>}
      <TextInput
        style={[styles.input, errors.password && styles.inputError]}
        placeholder="Password (Min 6 chars, 1 uppercase, 1 number)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>I am a:</Text>
      <View style={styles.typeContainer}>
        <TouchableOpacity
          style={[styles.typeButton, userType === 'patient' && styles.typeButtonActive]}
          onPress={() => setUserType('patient')}
          disabled={loading}
        >
          <Text style={styles.typeText}>Patient</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, userType === 'doctor' && styles.typeButtonActive]}
          onPress={() => setUserType('doctor')}
          disabled={loading}
        >
          <Text style={styles.typeText}>Doctor</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>

      {/* Google Sign-In Button */}
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <GoogleSignInButton 
        onSignInSuccess={handleGoogleSignInSuccess}
        onSignInError={handleGoogleSignInError}
      />

      <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
        <Text style={styles.link}>Already have an account? Login</Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2563eb',
    marginTop: 20,
  },
  errorMessage: {
    color: '#ef4444',
    fontSize: 12,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#000',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fee2e2',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    padding: 15,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
    fontSize: 14,
  },
  link: {
    color: '#2563eb',
    textAlign: 'center',
    marginTop: 15,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 15,
    borderRadius: 8,
    margin: 20,
  },
  errorText: {
    color: '#991b1b',
    textAlign: 'center',
    fontWeight: '500',
  },
});