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
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { validateLoginForm } from '../utils/validation';
import GoogleSignInButton from '../components/GoogleSignInButton';

// Check if Firebase Auth is properly initialized
const isAuthInitialized = !!auth;

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleLogin = async () => {
    console.log('Attempting login with email:', email);
    
    // Check if Firebase Auth is initialized
    if (!isAuthInitialized) {
      console.error('Firebase Auth is not initialized');
      Alert.alert(
        'Configuration Error',
        'Authentication is not properly configured. Please check your Firebase credentials.'
      );
      return;
    }

    // Validate form
    const { isValid, errors: validationErrors } = validateLoginForm({
      email,
      password,
    });

    if (!isValid) {
      console.log('Form validation failed:', validationErrors);
      setErrors(validationErrors);
      Alert.alert('Validation Error', Object.values(validationErrors).join('\n'));
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      console.log('Calling signInWithEmailAndPassword');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', userCredential.user);
    } catch (error) {
      // Surface precise Firebase error information for troubleshooting
      console.error('Login error:', {
        code: error?.code,
        message: error?.message,
        name: error?.name,
        customData: error?.customData,
      });
      let errorMessage = 'Login failed. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.code) {
        // Show raw code if it's something unexpected (e.g., auth/invalid-api-key)
        errorMessage = `${error.code.replace('auth/', '')}: ${error.message || 'Unknown error'}`;
      }
      Alert.alert('Login Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignInSuccess = (user) => {
    console.log('Google Sign-In successful:', user);
    Alert.alert('Success', 'Google Sign-In successful!');
    // The user is automatically redirected to the dashboard by the App.js component
  };

  const handleGoogleSignInError = (error) => {
    console.error('Google Sign-In error:', error);
    Alert.alert('Google Sign-In Error', error.message || 'An error occurred during Google Sign-In');
  };

  // Display error message if Firebase Auth is not initialized
  if (!isAuthInitialized) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>MindCare</Text>
        <Text style={styles.subtitle}>Mental Health Care</Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Authentication service is not available. Please contact support.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>MindCare</Text>
      <Text style={styles.subtitle}>Mental Health Care</Text>

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

      {errors.password && <Text style={styles.errorMessage}>{errors.password}</Text>}
      <TextInput
        style={[styles.input, errors.password && styles.inputError]}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
        placeholderTextColor="#999"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
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

      <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={loading}>
        <Text style={styles.link}>Don't have an account? Register</Text>
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
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    color: '#2563eb',
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
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