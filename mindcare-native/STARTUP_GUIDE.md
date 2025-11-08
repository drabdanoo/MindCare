# 🚀 STARTUP GUIDE - Fix Expo CLI Issues

## Problem You're Experiencing

```
WARNING: The legacy expo-cli does not support Node +17
ExpoMetroConfig.loadAsync is not a function
```

This happens because you have the **old global expo-cli** installed, but your project needs the **new local Expo CLI**.

---

## Solution

### Step 1: Stop the current process
Press `Ctrl+C` in PowerShell to stop the dev server

### Step 2: Use Local Expo CLI

Instead of:
```powershell
npm start
```

Use:
```powershell
npx expo start
```

The `npx` command runs the local version in your project's `node_modules`.

---

## Complete Startup Process

### First Time Setup

```powershell
# Navigate to project
cd G:\Mindcare\mindcare-native

# Install all dependencies
npm install

# Start with local CLI
npx expo start
```

### Subsequent Startups

```powershell
# Navigate to project
cd G:\Mindcare\mindcare-native

# Start with local CLI (always use npx)
npx expo start
```

---

## What to Do After Running npx expo start

You'll see something like:

```
To run the app with live reloading, choose an option:

› Metro waiting on exp://192.168.x.x:19000
› Press 'a' │ android
› Press 'i' │ ios  
› Press 'w' │ web
› Press 'j' │ bundler
```

### Choose one:

**For Web (Easiest for Testing):**
```
Press 'w'
```

**For Android:**
```
Press 'a'
```

**For iOS:**
```
Press 'i'
```

---

## If You Still Get Errors

### Error: "Cannot find module..."

```powershell
# Clear everything and reinstall
rm -r node_modules
rm package-lock.json
npm install
npx expo start --clear
```

### Error: "Metro config not found"

```powershell
# Clear Metro cache
npx expo start --clear
```

### Error: "Port 19000 already in use"

```powershell
# Use different port
npx expo start --port 19001
```

---

## For Future Development

### Always use one of these commands:

```powershell
# Start development server
npx expo start

# Start for web
npx expo start --web

# Start for Android
npx expo start --android

# Start for iOS
npx expo start --ios

# Start with cleared cache
npx expo start --clear
```

### Never use:

```powershell
npm start        # ❌ Uses old global expo-cli
expo start       # ❌ Uses old global expo-cli
```

---

## Permanent Fix (Optional)

### Uninstall Global Expo CLI

```powershell
npm uninstall -g expo-cli
```

This prevents accidentally using the old global version.

---

## Environment Verification

Make sure your `.env` file is set up correctly:

```powershell
# Check if .env exists
Test-Path .env

# Create from template if missing
cp .env.example .env
```

Edit `.env` with your Firebase credentials:

```properties
EXPO_PUBLIC_FIREBASE_API_KEY=your_actual_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## Testing the App

Once the dev server is running:

### Demo Credentials

**Patient Login:**
- Email: `patient@demo.com`
- Password: `Patient@123`

**Doctor Login:**
- Email: `doctor@demo.com`
- Password: `Doctor@123`

**Password Requirements:**
- ✅ 6+ characters
- ✅ 1 uppercase letter
- ✅ 1 number

See `DEMO_CREDENTIALS.md` for more details.

---

## Quick Reference Commands

```powershell
# Change to project directory
cd G:\Mindcare\mindcare-native

# Start development server (WEB)
npx expo start --web

# Start development server (ANDROID)
npx expo start --android

# Start development server (iOS)
npx expo start --ios

# Clear cache and restart
npx expo start --clear

# Install dependencies
npm install

# Remove node_modules and reinstall
rm -r node_modules; npm install

# Check environment setup
Test-Path .env
```

---

## Troubleshooting Checklist

- [x] Using `npx expo start` instead of `npm start`
- [x] `.env` file has Firebase credentials
- [x] Dependencies installed with `npm install`
- [x] No port conflicts (19000)
- [x] Clear cache if needed

---

## Success Indicators

When running `npx expo start --web`, you should see:

✅ Metro bundler starting
✅ No "ExpoMetroConfig" errors
✅ Dev server URL displayed
✅ Web app opens in browser
✅ Can login with demo credentials

---

## Next Steps

1. Run: `npx expo start --web`
2. Choose `w` for web
3. App opens in browser
4. Login with demo credentials
5. Test the features

---

**You're ready to go! 🎉**

Still stuck? Check:
- `DEMO_CREDENTIALS.md` - For test accounts
- `BUG_FIXES_REPORT.md` - For detailed fixes
- `QUICK_START.md` - For quick reference
