# MindCare Native App

Professional native mobile application for mental health care in Iraq, built with React Native and Expo.

## 🎯 Features

✅ **User Authentication**
- Email/password registration
- Secure login
- Role-based access (Patient/Doctor)

✅ **Patient Features**
- View appointments
- Book appointments with doctors
- Join video calls
- Track appointment status

✅ **Doctor Features**
- View pending appointments
- Approve/reject appointments
- Join video calls
- Manage schedule

✅ **Video Calls**
- Jitsi Meet integration
- Real-time communication
- Screen sharing
- Chat during calls

✅ **Multi-Language Support**
- English
- Arabic (RTL)
- Kurdish (RTL)

## 🔐 Security

We take security seriously. Please follow these best practices:

### Environment Variables
To prevent exposing sensitive credentials:
1. The `.env` file is added to `.gitignore` to prevent it from being committed
2. A `.env.example` file is provided as a template
3. Firebase configuration validation is implemented in the app

To set up your environment:
1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase project credentials in the `.env` file:
   - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
   - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - Platform-specific credentials for web and Android

Never commit your `.env` file to version control.

### Firebase Security Rules
Ensure your Firestore security rules are properly configured to prevent unauthorized access to data.

Example security rules for the users collection:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🚀 Quick Start

### Prerequisites
- Node.js 14+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Android emulator or physical device (for Android)
- Xcode (for iOS on Mac)

### Installation

1. **Navigate to project**
   ```bash
   cd mindcare-native
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Copy `.env.example` to `.env`
   - Fill in your Firebase credentials

4. **Start the development server**
   ```bash
   npm start
   ```

### Running on Different Platforms

- **Android**: `npm run android`
- **iOS**: `npm run ios`
- **Web**: `npm run web`

## 📁 Project Structure

```
mindcare-native/
├── app/
│   ├── screens/          # UI screens
│   ├── services/         # Firebase integration
│   └── utils/            # Utility functions
├── assets/               # Images and icons
└── docs/                 # Documentation
```

## 🛠️ Technologies

- **Frontend**: React Native + Expo
- **Navigation**: React Navigation v6
- **Backend**: Firebase (Auth, Firestore)
- **Video Calls**: Jitsi Meet
- **State Management**: React Context API
- **Internationalization**: i18next

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## 📄 License

This project is licensed under the BSD Zero Clause License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, please open an issue on GitHub or contact the development team.