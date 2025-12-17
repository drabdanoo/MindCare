import 'dotenv/config';

export default {
  expo: {
    name: 'MindCare',
    slug: 'mindcare-native',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#667eea'
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.mindcare.app',
      infoPlist: {
        NSCameraUsageDescription: 'MindCare needs camera access for video consultations with your doctor.',
        NSMicrophoneUsageDescription: 'MindCare needs microphone access for audio during video consultations.',
        NSPhotoLibraryUsageDescription: 'MindCare needs photo library access to upload medical documents.'
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#667eea'
      },
      package: 'com.abdullah.mindcareapp',
      permissions: [
        'CAMERA',
        'RECORD_AUDIO',
        'MODIFY_AUDIO_SETTINGS',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
        'NOTIFICATIONS'
      ],
      googleServicesFile: './google-services.json'
    },
    web: {
      favicon: './assets/favicon.png'
    },
    plugins: [
      [
        'expo-notifications',
        {
          icon: './assets/icon.png',
          color: '#667eea'
        }
      ]
    ],
    extra: {
      firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
      eas: {
        projectId: '51a246f7-36df-4c58-b0d2-09984d67c8c6'
      }
    }
  }
};
