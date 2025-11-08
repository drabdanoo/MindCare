# MindCare - Getting Started Checklist

## ✅ First Time Setup (5 minutes)

### Step 1: Install Dependencies
```bash
npm install
```
**What it does**: Downloads all required packages from npm

### Step 2: Start Development Server
```bash
npm run dev
```
**What it does**: Starts local server at `http://localhost:3000`

### Step 3: Open in Browser
Visit `http://localhost:3000` and you should see the MindCare app!

## 🧪 Testing the App (10 minutes)

### Test 1: Language Switching
1. Look at top-right navigation
2. Click "EN" → "العربية" → "کوردی"
3. ✅ Entire page should change language

### Test 2: Doctor Discovery
1. Click "Find a Doctor" button
2. ✅ Should see 3 doctor cards
3. Try filtering by specialization/language/price
4. Click "Book Now" on any doctor

### Test 3: Registration
1. Click "Sign Up" button
2. Fill in the form:
   - Full Name: John Doe
   - Email: john@example.com
   - Phone: +964123456789
   - Date of Birth: 1990-01-01
   - Password: password123
3. Click "Create Account"
4. ✅ Should see success message

### Test 4: Login
1. Click "Login" button
2. Enter email and password from registration
3. Click "Sign In"
4. ✅ Should see dashboard

### Test 5: Appointment Booking
1. From dashboard, click "Book New Appointment"
2. Select a doctor
3. Fill in booking form:
   - Session Type: Video Call
   - Date: Pick any future date
   - Time: 9:00 AM
   - Reason: Anxiety consultation
   - Emergency Contact: Mom - 0123456789
4. Click "Confirm Booking"
5. ✅ Should see success message

## 📁 File Structure Overview

```
public/
├── index-new.html          ← Main app file
├── js/
│   ├── app.js              ← Application logic
│   ├── firebase-init.js    ← Firebase setup
│   └── i18n.js             ← Language system
└── locales/
    ├── en.json             ← English text
    ├── ar.json             ← Arabic text
    └── ku.json             ← Kurdish text
```

## 🛠️ Common Tasks

### Add a New Translation
1. Open `public/locales/en.json`
2. Add your text:
```json
{
  "mySection": {
    "myText": "Hello World"
  }
}
```
3. Add Arabic to `public/locales/ar.json`
4. Add Kurdish to `public/locales/ku.json`
5. Use in HTML: `<h1 data-i18n="mySection.myText">Default</h1>`

### Change Colors
1. Open `tailwind.config.js`
2. Modify theme colors
3. Use in HTML: `<div class="bg-blue-600">Blue</div>`

### Add a New Page
1. Add section in `public/index-new.html`:
```html
<section id="myPagePage" class="hidden fade-in">
  <h1>My Page</h1>
</section>
```
2. Add button: `<button data-nav="myPage">Go to My Page</button>`
3. Done! Navigation handles the rest

### Fix Code Style
```bash
npm run format    # Auto-fix formatting
npm run lint      # Check for issues
```

## 🔍 Debugging Tips

### App Not Loading?
1. Check browser console (F12)
2. Look for red errors
3. Check if `npm run dev` is still running
4. Try refreshing page (Ctrl+R)

### Language Not Changing?
1. Clear browser cache (Ctrl+Shift+Delete)
2. Check Network tab for locale files
3. Verify files exist in `public/locales/`

### Firebase Issues?
1. Check `public/js/firebase-init.js`
2. Verify Firebase project is active
3. Check Firestore security rules

### Styling Not Applied?
1. Clear browser cache
2. Rebuild: `npm run build`
3. Verify Tailwind class names are correct

## 📚 Documentation Guide

| Need | Read This |
|------|-----------|
| Quick start | QUICKSTART.md |
| Setup details | SETUP.md |
| Features | FEATURES.md |
| Deploy | DEPLOYMENT.md |
| Project status | PROJECT_STATUS.md |
| Full summary | IMPLEMENTATION_SUMMARY.md |

## 🚀 Ready to Deploy?

### Step 1: Build
```bash
npm run build
```

### Step 2: Deploy
```bash
npm run firebase:deploy
```

### Step 3: Verify
Visit your Firebase hosting URL (shown after deploy)

## 🎯 What's Next?

### For Developers
1. Review the code structure
2. Understand the i18n system
3. Learn Firebase integration
4. Start adding features

### For Designers
1. Customize colors in `tailwind.config.js`
2. Modify layouts in HTML
3. Add new pages
4. Improve UI/UX

### For Product Managers
1. Review FEATURES.md for recommendations
2. Check PROJECT_STATUS.md for roadmap
3. Plan next features
4. Gather user feedback

## 💡 Pro Tips

### Hot Reload
Changes to files auto-reload in browser during `npm run dev`

### Translation Workflow
1. Add English text first
2. Then add Arabic
3. Then add Kurdish
4. Test all three languages

### Git Workflow
```bash
git add .
git commit -m "Add new feature"
git push
```

### Performance
- Vite builds are fast (< 1s)
- Tailwind CSS is optimized
- Firebase handles scaling

## ❓ FAQ

**Q: How do I change the app name?**
A: Update "MindCare" in `public/locales/*.json` files

**Q: How do I add more doctors?**
A: Edit mock doctors in `public/js/app.js` or connect to Firestore

**Q: How do I add payment?**
A: See FEATURES.md for payment integration recommendations

**Q: How do I add video calls?**
A: See FEATURES.md for WebRTC recommendations

**Q: How do I deploy?**
A: Run `npm run build` then `npm run firebase:deploy`

## 🆘 Need Help?

1. Check the relevant documentation file
2. Review code comments
3. Check browser console for errors
4. Review Firebase Console for data issues
5. Ask team members

## ✨ You're Ready!

You now have:
- ✅ Modern build setup
- ✅ Multi-language support
- ✅ Authentication system
- ✅ Doctor discovery
- ✅ Appointment booking
- ✅ Responsive design
- ✅ Complete documentation

**Happy coding! 🚀**

---

**Next Steps**:
1. Explore the app
2. Read QUICKSTART.md
3. Review FEATURES.md
4. Start building!
