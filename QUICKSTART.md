# MindCare - Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app opens at `http://localhost:3000`

### 3. Test the App
- Click "Find a Doctor" to browse available doctors
- Click "Sign Up" to create an account
- Book an appointment with a doctor

## Project Structure Overview

```
public/
├── index-new.html          ← Main app (rename to index.html to use)
├── js/
│   ├── app.js              ← Main application logic
│   ├── firebase-init.js    ← Firebase setup
│   └── i18n.js             ← Language support
├── locales/
│   ├── en.json             ← English
│   ├── ar.json             ← Arabic
│   └── ku.json             ← Kurdish
└── config/
    └── firebase.config.js  ← Firebase configuration
```

## Key Features

### 🌍 Multi-Language Support
- English, Arabic, Kurdish
- RTL support for Arabic/Kurdish
- Language switcher in navigation

### 🔐 Authentication
- Email/password registration
- Secure login with Firebase
- Session management

### 👨‍⚕️ Doctor Discovery
- Browse doctors
- Filter by specialization, language, price
- View doctor profiles

### 📅 Appointment Booking
- Choose session type (video, audio, text)
- Select date and time
- Add reason for visit

### 📊 Dashboard
- View upcoming appointments
- Track appointment history
- Quick action buttons

## Common Tasks

### Add a New Translation
1. Edit `public/locales/en.json`
2. Add Arabic translation to `public/locales/ar.json`
3. Add Kurdish translation to `public/locales/ku.json`

Example:
```json
{
  "mySection": {
    "myKey": "My text here"
  }
}
```

### Use Translation in HTML
```html
<h1 data-i18n="mySection.myKey">Default text</h1>
```

### Use Translation in JavaScript
```javascript
import { t } from './i18n.js';
const text = t('mySection.myKey');
```

### Add a New Page
1. Add section in `public/index-new.html`:
```html
<section id="myPagePage" class="hidden fade-in">
  <!-- Your content -->
</section>
```

2. Add navigation button:
```html
<button data-nav="myPage">Go to My Page</button>
```

3. The `navigateTo()` function handles the rest!

### Style with Tailwind CSS
Use Tailwind classes directly in HTML:
```html
<div class="bg-blue-600 text-white p-4 rounded-lg">
  Styled with Tailwind!
</div>
```

## Firebase Setup

### Collections Structure

**users** - Patient/Doctor profiles
```javascript
{
  uid: "user_id",
  fullName: "John Doe",
  email: "john@example.com",
  phone: "+964123456789",
  dob: "1990-01-01",
  role: "patient", // or "doctor"
  createdAt: timestamp
}
```

**doctors** - Doctor profiles
```javascript
{
  uid: "doctor_id",
  name: "Dr. Ahmed",
  specialization: "Psychiatrist",
  languages: ["Arabic", "English"],
  yearsExp: 10,
  rate: 50,
  rating: 4.8,
  bio: "Specialized in depression",
  verified: true
}
```

**appointments** - Bookings
```javascript
{
  patientId: "user_id",
  doctorId: "doctor_id",
  sessionType: "video", // video, audio, or text
  date: "2024-01-15",
  time: "14:00",
  reason: "Anxiety consultation",
  emergency: "Mom - 0123456789",
  status: "pending", // pending, confirmed, completed, cancelled
  createdAt: timestamp
}
```

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check code quality
npm run lint

# Format code
npm run format

# Deploy to Firebase
npm run firebase:deploy
```

## Debugging Tips

### Check Console Errors
Open browser DevTools (F12) and check Console tab for errors.

### Firebase Connection Issues
1. Verify Firebase credentials in `public/js/firebase-init.js`
2. Check Firestore security rules in `firestore.rules`
3. Ensure Firebase project is active

### Language Not Changing
1. Clear browser localStorage
2. Check Network tab for locale JSON files
3. Verify locale files exist in `public/locales/`

### Styling Issues
1. Clear browser cache (Ctrl+Shift+Delete)
2. Rebuild with `npm run build`
3. Check Tailwind classes are valid

## Next Steps

1. **Customize Branding**
   - Update logo in navigation
   - Change colors in `tailwind.config.js`
   - Update app name in translations

2. **Add More Doctors**
   - Edit mock doctors in `public/js/app.js`
   - Or connect to Firestore

3. **Implement Real Features**
   - Video/audio calls (WebRTC)
   - Payment processing (Stripe)
   - Email notifications

4. **Deploy to Production**
   - Run `npm run build`
   - Run `npm run firebase:deploy`
   - Visit your Firebase hosting URL

## Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Vite Docs](https://vitejs.dev/)
- [i18next Docs](https://www.i18next.com/)

## Support

For issues or questions:
1. Check the `SETUP.md` file
2. Check the `FEATURES.md` file
3. Review browser console for errors
4. Check Firebase Console for data issues

Happy coding! 🚀
