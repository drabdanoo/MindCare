# Security Best Practices

## Environment Variables

To prevent exposing sensitive credentials, we've implemented the following security measures:

1. The `.env` file is added to `.gitignore` to prevent it from being committed to the repository
2. A `.env.example` file is provided as a template
3. Firebase configuration validation is implemented in the app

## Setup Instructions

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase project credentials in the `.env` file:
   - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
   - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - Platform-specific credentials for web and Android

## Credential Storage

Never commit your `.env` file to version control. The file should only exist locally on your development machine.

For production deployments:
- Use your platform's secure environment variable management (e.g., Expo Environment Variables, Firebase Environment Configuration)
- Never hardcode credentials in the source code

## Firebase Security Rules

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

## Additional Security Considerations

1. Always validate user input on both client and server-side
2. Use Firebase Authentication to manage user sessions
3. Implement proper error handling without exposing sensitive information
4. Regularly rotate API keys and credentials
5. Monitor Firebase usage for unusual activity