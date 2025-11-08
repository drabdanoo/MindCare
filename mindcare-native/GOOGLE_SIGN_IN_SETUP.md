# Google Sign-In Setup Guide

This guide will help you set up Google Sign-In for the MindCare application.

## Prerequisites

1. You must have already set up Firebase Authentication in your project
2. You should have the SHA-1 certificate fingerprint registered in your Firebase project

## Step 1: Get Your SHA-1 Certificate Fingerprint

### For Debug Keystore (Development)

On Windows:
```bash
keytool -list -v -keystore "C:\Users\2023\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

On macOS/Linux:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### For Release Keystore (Production)

```bash
keytool -list -v -keystore "path/to/your/release.keystore" -alias your_key_alias -storepass your_store_password -keypass your_key_password
```

## Step 2: Add SHA-1 to Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project "mindcareapp-209c7"
3. Click on the gear icon (Project settings) in the left sidebar
4. Under "Your apps" section, find your Android app
5. Click "Add fingerprint" and enter the SHA-1 certificate fingerprint you generated

## Step 3: Enable Google Sign-In Method

1. In Firebase Console, go to "Authentication" in the left sidebar
2. Click on the "Sign-in method" tab
3. Enable "Google" as a sign-in provider

## Step 4: Get Google Client IDs

1. In Firebase Console, go to Project Settings
2. Under "Your apps" section, find your Web app (or create one if it doesn't exist)
3. Note the Web client ID (it ends with .apps.googleusercontent.com)
4. Under "Your apps" section, find your Android app
5. Note the Android client ID (it also ends with .apps.googleusercontent.com)

## Step 5: Update GoogleSignInButton.js

In the [GoogleSignInButton.js](file:///g:/Mindcare/mindcare-native/app/components/GoogleSignInButton.js) file, replace the placeholder client IDs with your actual client IDs:

```javascript
const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
  clientId: 'YOUR_WEB_CLIENT_ID', // Replace with your Web Client ID
  androidClientId: 'YOUR_ANDROID_CLIENT_ID', // Replace with your Android Client ID
  iosClientId: 'YOUR_IOS_CLIENT_ID', // Replace with your iOS Client ID (if applicable)
});
```

## Step 6: Configure Google Cloud Console (if needed)

If you're having issues with Google Sign-In, you may need to configure the OAuth consent screen:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "APIs & Services" > "OAuth consent screen"
4. Configure the consent screen with your app information
5. Add the required scopes (email, profile, openid)

## Testing Google Sign-In

After completing the setup:

1. Restart your development server
2. Open the app in your browser or mobile device
3. On the Login or Register screen, you should see a "Sign in with Google" button
4. Click the button to test Google Sign-In

## Troubleshooting

### Common Issues

1. **"CONFIGURATION_NOT_FOUND" Error**
   - Make sure you've added the SHA-1 fingerprint to your Firebase project
   - Ensure you're using the correct package name in your app.json

2. **"DEVELOPER_ERROR" on Android**
   - Double-check that the SHA-1 fingerprint matches exactly
   - Make sure you're using the correct Android client ID

3. **Redirect URI Mismatch**
   - Ensure your Google Cloud OAuth client is properly configured
   - Check that the redirect URIs are correctly set up

### Debugging Tips

1. Check the browser console or device logs for detailed error messages
2. Make sure you're using the correct client IDs for each platform
3. Verify that Google Sign-In is enabled in Firebase Authentication
4. Confirm that your SHA-1 fingerprint is correctly registered in Firebase

## Additional Notes

- For web, Google Sign-In works through a popup window
- For mobile, it uses the device's native Google Sign-In flow
- Users who sign in with Google will still need to complete their profile information (phone number, user type) if needed