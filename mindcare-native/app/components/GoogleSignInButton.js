import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Image, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../services/firebase';

// Make sure to add the redirect page to the "Valid redirect URIs" on your Google app settings
WebBrowser.maybeCompleteAuthSession();

export default function GoogleSignInButton({ onSignInSuccess, onSignInError }) {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: 'YOUR_WEB_CLIENT_ID', // Replace with your Web Client ID from Google Cloud Console
    androidClientId: 'YOUR_ANDROID_CLIENT_ID', // Replace with your Android Client ID from Google Cloud Console
    iosClientId: 'YOUR_IOS_CLIENT_ID', // Replace with your iOS Client ID from Google Cloud Console (if applicable)
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then((userCredential) => {
          // Sign in was successful
          onSignInSuccess && onSignInSuccess(userCredential.user);
        })
        .catch((error) => {
          // Handle error
          onSignInError && onSignInError(error);
        });
    }
  }, [response]);

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => {
        promptAsync();
      }}
      disabled={!request}
    >
      {request ? (
        <>
          <Image
            source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }}
            style={styles.googleIcon}
          />
          <Text style={styles.buttonText}>Sign in with Google</Text>
        </>
      ) : (
        <ActivityIndicator size="small" color="#757575" />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 4,
    // Cross-platform shadow: Android uses elevation; iOS uses shadow*; Web uses boxShadow
    ...(Platform.select({
      android: { elevation: 2 },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      web: {
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
      },
      default: {},
    }) || {}),
    marginTop: 10,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  buttonText: {
    color: '#757575',
    fontSize: 16,
    fontWeight: '500',
  },
});