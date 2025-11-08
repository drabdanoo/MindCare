# MindCare - Setup & Development Guide

## Overview

MindCare is a secure telemedicine platform for mental health care, designed specifically for the Iraqi population with multi-language support (Arabic, English, Kurdish).

## Project Structure

```
mindcare/
├── public/
│   ├── index-new.html          # Main application (use this instead of index.html)
│   ├── js/
│   │   ├── firebase-init.js    # Firebase initialization
│   │   ├── i18n.js             # Internationalization
│   │   └── app.js              # Main application logic
│   ├── config/
│   │   └── firebase.config.js  # Firebase configuration
│   └── locales/
│       ├── en.json             # English translations
│       ├── ar.json             # Arabic translations
│       └── ku.json             # Kurdish translations
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── .eslintrc.json              # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── .env.example                # Environment variables template
├── package.json                # Dependencies and scripts
└── firestore.rules             # Firestore security rules
```

## Installation

### Prerequisites
- Node.js 16+ and npm
- Firebase project (already configured)

### Steps

1. **Clone/Setup the project**
   ```bash
   cd g:\Mindcare
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your Firebase credentials (or use the fallback config in `firebase-init.js`).

## Development

### Start Dev Server
```bash
npm run dev
```
This will start Vite on `http://localhost:3000` with hot module reloading.

### Build for Production
```bash
npm run build
```
Output will be in the `dist/` folder.

### Preview Production Build
```bash
npm run preview
```

### Code Quality
```bash
npm run lint      # Check code with ESLint
npm run format    # Format code with Prettier
```

## Firebase Setup

### Firestore Collections

**users** - Patient/Doctor profiles
```json
{
  "uid": "user_id",
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "dob": "date",
  "role": "patient|doctor",
  "createdAt": "timestamp"
}
```

**doctors** - Doctor profiles (public read)
```json
{
  "uid": "doctor_id",
  "name": "string",
  "specialization": "string",
  "languages": ["string"],
  "yearsExp": "number",
  "rate": "number",
  "rating": "number",
  "bio": "string",
  "verified": "boolean"
}
```

**appointments** - Appointment bookings
```json
{
  "patientId": "string",
  "doctorId": "string",
  "sessionType": "video|audio|text",
  "date": "string",
  "time": "string",
  "reason": "string",
  "emergency": "string",
  "status": "pending|confirmed|completed|cancelled",
  "createdAt": "timestamp"
}
```

### Deploy to Firebase Hosting
```bash
npm run firebase:deploy
```

## Features

### Current MVP Features
- ✅ Multi-language support (Arabic, English, Kurdish)
- ✅ User authentication (Email/Password)
- ✅ Doctor discovery and filtering
- ✅ Appointment booking
- ✅ Patient dashboard
- ✅ Doctor dashboard
- ✅ Session type selection (video, audio, text)
- ✅ Emergency contact information

### Planned Features
- 🔄 Video/Audio/Text session integration (WebRTC)
- 🔄 E-prescription system
- 🔄 Payment integration (Stripe/PayPal)
- 🔄 Appointment reminders (Email/SMS)
- 🔄 Medical records management
- 🔄 Prescription history
- 🔄 Doctor verification system
- 🔄 Rating and reviews
- 🔄 Admin dashboard
- 🔄 Insurance integration
- 🔄 Accessibility features (WCAG 2.1)

## Internationalization (i18n)

### Adding New Translations

1. Add keys to `public/locales/en.json`
2. Add Arabic translations to `public/locales/ar.json`
3. Add Kurdish translations to `public/locales/ku.json`

### Using Translations in HTML
```html
<!-- Text content -->
<h1 data-i18n="home.title">Default text</h1>

<!-- Placeholder text -->
<input data-i18n-placeholder="auth.email" />
```

### Using Translations in JavaScript
```javascript
import { t } from './i18n.js';

const message = t('common.success');
```

## Security Considerations

### Current Implementation
- ✅ Firebase Authentication
- ✅ Firestore Security Rules
- ✅ HTTPS only
- ✅ Environment variables for sensitive data

### Recommendations for Production
- [ ] Enable Firebase reCAPTCHA
- [ ] Implement rate limiting
- [ ] Add HIPAA compliance measures
- [ ] Enable audit logging
- [ ] Implement data encryption at rest
- [ ] Regular security audits
- [ ] GDPR compliance for data handling
- [ ] Two-factor authentication (2FA)

## Performance Optimization

- Vite for fast development and optimized builds
- Tailwind CSS for minimal CSS output
- Lazy loading for images
- Code splitting for better caching

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Firebase Connection Issues
- Check `.env.local` configuration
- Verify Firebase project is active
- Check Firestore security rules

### Language Not Changing
- Clear browser localStorage
- Check console for translation loading errors
- Verify locale JSON files are in `public/locales/`

### Build Errors
- Delete `node_modules` and `dist` folders
- Run `npm install` again
- Clear npm cache: `npm cache clean --force`

## Contributing

1. Create a feature branch
2. Make changes and test locally
3. Run `npm run lint` and `npm run format`
4. Submit pull request

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, please open an issue on the project repository.

## Roadmap

### Phase 1 (Current)
- MVP with basic booking and authentication

### Phase 2
- Real-time video/audio sessions
- Payment processing
- Appointment reminders

### Phase 3
- E-prescriptions
- Medical records
- Advanced analytics

### Phase 4
- AI-powered recommendations
- Telemedicine marketplace
- Insurance integration
