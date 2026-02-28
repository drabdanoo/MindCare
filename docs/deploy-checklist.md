# Production Deployment Checklist

**MindCare Telemedicine Platform - Pre-Deployment Verification**

Last Updated: December 14, 2025  
Version: 1.0.0

---

## Overview

This checklist **MUST** be completed before **EVERY** production deployment. All items are mandatory and non-negotiable for security, performance, and reliability.

**Deployment Approval:** ✅ All items checked = Approved | ❌ Any item unchecked = BLOCKED

---

## ✅ Mandatory Pre-Deployment Checks

### 1. Environment Configuration & Security

**Status:** ⬜ Not Started | ⬜ In Progress | ⬜ **VERIFIED**

#### 1.1 Environment Variables

- [ ] **Production Firebase credentials** configured in `.env.production`
  - [ ] `VITE_FIREBASE_API_KEY` set (production project)
  - [ ] `VITE_FIREBASE_AUTH_DOMAIN` set (production project)
  - [ ] `VITE_FIREBASE_PROJECT_ID` set (production project)
  - [ ] `VITE_FIREBASE_STORAGE_BUCKET` set (production project)
  - [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` set (production project)
  - [ ] `VITE_FIREBASE_APP_ID` set (production project)
  - [ ] All values match production Firebase console

- [ ] **Sentry configuration** in `.env.production`
  - [ ] `VITE_SENTRY_DSN` set to production Sentry project
  - [ ] `VITE_SENTRY_ENVIRONMENT` set to `"production"`
  - [ ] Sentry project created for production monitoring

- [ ] **Database seeding** disabled in production
  - [ ] `VITE_ENABLE_SEEDING=false` in `.env.production`
  - [ ] Verify seed.js has environment check: `if (import.meta.env.VITE_ENABLE_SEEDING === 'true')`

- [ ] **No sensitive data** in version control
  - [ ] `.env.production` NOT committed to Git
  - [ ] `.env.development` NOT committed to Git
  - [ ] Only `.env.example` in repository
  - [ ] Run: `git log --all --full-history -- "*.env*"` (should show NO .env files)

#### 1.2 GitHub Secrets Configuration

- [ ] All production secrets configured in GitHub repository settings
  - [ ] `FIREBASE_API_KEY_PROD`
  - [ ] `FIREBASE_AUTH_DOMAIN_PROD`
  - [ ] `FIREBASE_PROJECT_ID_PROD`
  - [ ] `FIREBASE_STORAGE_BUCKET_PROD`
  - [ ] `FIREBASE_MESSAGING_SENDER_ID_PROD`
  - [ ] `FIREBASE_APP_ID_PROD`
  - [ ] `SENTRY_DSN_PROD`
  - [ ] `SENTRY_AUTH_TOKEN` (for source map uploads)

- [ ] GitHub Actions workflow uses production secrets
  - [ ] Verify `.github/workflows/ci.yml` references `_PROD` secrets
  - [ ] Workflow runs `npm run build` (production mode)

**Verification Command:**
```bash
# Verify production build uses correct environment
npm run build
# Check dist/assets/*.js for VITE_FIREBASE_PROJECT_ID value
grep -r "mindcare-.*-prod" dist/
```

---

### 2. CI/CD Pipeline & Build Verification

**Status:** ⬜ Not Started | ⬜ In Progress | ⬜ **VERIFIED**

#### 2.1 Continuous Integration

- [ ] **All CI checks passing** on main branch
  - [ ] GitHub Actions workflow status: ✅ Passing
  - [ ] No failing test suites
  - [ ] Linting checks passed (if configured)
  - [ ] Build successful without errors

- [ ] **Test coverage** meets minimum threshold
  - [ ] Run: `npm test -- --coverage`
  - [ ] Coverage ≥ 40% (current target)
  - [ ] RBAC tests passing (20+ tests in `__tests__/rbac.test.js`)
  - [ ] Example tests passing (3 tests in `__tests__/example.test.js`)

- [ ] **Production build** completed successfully
  - [ ] Run: `npm run build`
  - [ ] No build errors or warnings
  - [ ] `dist/` folder generated
  - [ ] Assets minified and optimized

#### 2.2 Code Quality

- [ ] **No console errors** in production build
  - [ ] Run: `grep -r "console.log\|console.error" public/ --exclude-dir=node_modules`
  - [ ] Remove or replace with Sentry logging

- [ ] **No TODO/FIXME** comments blocking deployment
  - [ ] Run: `grep -r "TODO\|FIXME" public/ src/ --exclude-dir=node_modules`
  - [ ] Resolve or document as known issues

**Verification Command:**
```bash
# Run full CI pipeline locally
npm install
npm test
npm run build
```

---

### 3. Firebase Configuration & Database

**Status:** ⬜ Not Started | ⬜ In Progress | ⬜ **VERIFIED**

#### 3.1 Firestore Database

- [ ] **Firestore Security Rules** deployed
  - [ ] Rules defined in `firestore.rules`
  - [ ] Rules cover all collections: `users`, `doctors`, `appointments`, `prescriptions`, `reminders`
  - [ ] RBAC enforcement implemented (role-based access)
  - [ ] Run: `firebase deploy --only firestore:rules --project <PROD_PROJECT_ID>`
  - [ ] Verify in Firebase Console > Firestore > Rules

- [ ] **Composite Indexes** deployed
  - [ ] Indexes defined in `firestore.indexes.json`
  - [ ] Required indexes for queries:
    - [ ] `appointments`: `patientId + date`
    - [ ] `appointments`: `doctorId + date`
    - [ ] `prescriptions`: `patientId + createdAt`
    - [ ] `prescriptions`: `doctorId + createdAt`
    - [ ] `reminders`: `userId + isSent + remindAt`
  - [ ] Run: `firebase deploy --only firestore:indexes --project <PROD_PROJECT_ID>`
  - [ ] Verify in Firebase Console > Firestore > Indexes (all "Enabled")

- [ ] **Test data removed** from production database
  - [ ] No demo/seed data in production Firestore
  - [ ] Verify: `VITE_ENABLE_SEEDING=false` in production
  - [ ] Manual check: Firebase Console > Firestore > Data (no test doctors)

#### 3.2 Firebase Authentication

- [ ] **Authentication methods** configured
  - [ ] Email/Password enabled in Firebase Console
  - [ ] Email verification enabled (recommended)
  - [ ] Password reset emails configured

- [ ] **Authorized domains** configured
  - [ ] Production domain added to Firebase Console > Authentication > Settings > Authorized domains
  - [ ] `localhost` removed from authorized domains (production only)

**Verification Command:**
```bash
# Deploy all Firebase configurations
firebase use <PROD_PROJECT_ID>
firebase deploy --only firestore:rules,firestore:indexes
```

---

### 4. Error Monitoring & Performance Tracking

**Status:** ⬜ Not Started | ⬜ In Progress | ⬜ **VERIFIED**

#### 4.1 Sentry Integration

- [ ] **Sentry initialized** in production build
  - [ ] `public/sentry.js` loaded before app initialization
  - [ ] Sentry DSN configured in `.env.production`
  - [ ] Environment set to `production`
  - [ ] Trace sampling configured (`tracesSampleRate: 0.1`)

- [ ] **Sentry error tracking** verified
  - [ ] Test error capture: `Sentry.captureException(new Error('Test'))`
  - [ ] Verify error appears in Sentry dashboard
  - [ ] Source maps uploaded for stack traces (if configured)

- [ ] **Performance monitoring** enabled
  - [ ] Transaction monitoring active (10% sample rate)
  - [ ] Critical user flows instrumented:
    - [ ] Appointment booking
    - [ ] Prescription creation
    - [ ] Video session initiation

#### 4.2 Firebase Performance Monitoring

- [ ] **Performance monitoring** SDK installed
  - [ ] `firebase/performance` imported in `firebase.js`
  - [ ] Performance tracking enabled in Firebase Console
  - [ ] Automatic page load metrics collected

**Verification Command:**
```bash
# Check Sentry integration in build
npm run build
grep -r "Sentry.init" dist/
```

---

### 5. Accessibility, Validation & User Experience

**Status:** ⬜ Not Started | ⬜ In Progress | ⬜ **VERIFIED**

#### 5.1 Accessibility (WCAG 2.1 Level AA)

- [ ] **Skip navigation** links present
  - [ ] "Skip to main content" link at top of page
  - [ ] Link styled and functional (`:focus` visible)

- [ ] **Form labels** properly associated
  - [ ] All form inputs have `<label>` with `for` attribute
  - [ ] Labels match input `id` attributes
  - [ ] Placeholder text NOT used as labels

- [ ] **ARIA labels** for dynamic content
  - [ ] Modals have `role="dialog"` and `aria-labelledby`
  - [ ] Buttons have descriptive `aria-label` (icon-only buttons)
  - [ ] Live regions for toast notifications (`aria-live="polite"`)

- [ ] **Keyboard navigation** functional
  - [ ] All interactive elements accessible via Tab key
  - [ ] Modal traps focus until closed
  - [ ] Esc key closes modals

- [ ] **Color contrast** meets WCAG standards
  - [ ] Text contrast ratio ≥ 4.5:1 (normal text)
  - [ ] Text contrast ratio ≥ 3:1 (large text)
  - [ ] Run: Lighthouse Accessibility audit in Chrome DevTools

**Verification Command:**
```bash
# Run Lighthouse audit (requires Chrome)
npx lighthouse https://<production-url> --view --only-categories=accessibility
# Target score: ≥ 90
```

#### 5.2 Input Validation

- [ ] **Zod schemas** applied to all forms
  - [ ] Appointment form: `appointmentSchema.js`
  - [ ] Prescription form: `prescriptionSchema.js`
  - [ ] Registration form: Zod schema implemented

- [ ] **Client-side validation** working
  - [ ] Invalid inputs show error messages
  - [ ] Error messages are user-friendly (not raw Zod errors)
  - [ ] Form submission blocked until valid

- [ ] **Server-side validation** enforced
  - [ ] Firestore Security Rules validate data types
  - [ ] Rules check required fields
  - [ ] Rules enforce string length constraints

#### 5.3 User Feedback

- [ ] **Toast notifications** implemented
  - [ ] Success messages for: appointment booking, prescription creation
  - [ ] Error messages for: validation failures, network errors
  - [ ] Toastify.js configured with non-blocking toasts
  - [ ] All `alert()` calls replaced with `showToast()`

**Verification Steps:**
1. Book appointment with invalid data → Should show toast error
2. Book appointment with valid data → Should show toast success
3. Navigate via keyboard only → All features accessible
4. Run screen reader → All content announced correctly

---

## 🚨 Critical Security Checks

### Pre-Deployment Security Audit

- [ ] **No hardcoded credentials** in codebase
  - [ ] Search: `grep -r "apiKey\|password\|secret" public/ --exclude-dir=node_modules`
  - [ ] All sensitive values in environment variables

- [ ] **Firebase rules** deny unauthorized access
  - [ ] Test: Attempt to read another user's appointments (should fail)
  - [ ] Test: Patient attempts to create prescription (should fail)
  - [ ] Test: Unauthenticated user accesses data (should fail)

- [ ] **XSS protection** implemented
  - [ ] User input sanitized before rendering
  - [ ] `innerHTML` not used with user data
  - [ ] Content Security Policy headers configured (if applicable)

- [ ] **CORS** configured correctly
  - [ ] Firebase Hosting configured for production domain
  - [ ] No wildcard (`*`) CORS origins in production

---

## 📊 Performance Benchmarks

### Pre-Deployment Performance Targets

- [ ] **Page Load Time** (Lighthouse)
  - [ ] First Contentful Paint (FCP): ≤ 1.8s
  - [ ] Largest Contentful Paint (LCP): ≤ 2.5s
  - [ ] Time to Interactive (TTI): ≤ 3.8s
  - [ ] Cumulative Layout Shift (CLS): ≤ 0.1

- [ ] **Bundle Size**
  - [ ] Main JS bundle: ≤ 250KB (gzipped)
  - [ ] Total page weight: ≤ 1MB (first load)
  - [ ] Run: `npm run build` and check `dist/` folder size

**Verification Command:**
```bash
# Run Lighthouse performance audit
npx lighthouse https://<production-url> --view --only-categories=performance
# Target score: ≥ 85
```

---

## 🔄 Rollback Plan

### Emergency Rollback Procedure

1. **Firebase Hosting Rollback**
   ```bash
   firebase hosting:rollback --project <PROD_PROJECT_ID>
   ```

2. **Revert Git Commit**
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Firestore Rules Rollback**
   - Firebase Console > Firestore > Rules > View History
   - Select previous version and publish

4. **Notify Stakeholders**
   - Send incident report to team
   - Update status page (if applicable)

---

## ✅ Final Sign-Off

### Deployment Approval

**All checks completed:** ⬜ YES | ⬜ NO (BLOCKED)

**Approved by:**
- [ ] Lead Developer: _________________ Date: _______
- [ ] DevOps Engineer: ________________ Date: _______
- [ ] QA Lead: _______________________ Date: _______

**Deployment Date/Time:** _______________________

**Deployment Command:**
```bash
# Set production project
firebase use <PROD_PROJECT_ID>

# Build production bundle
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Verify deployment
curl -I https://<production-url>
```

---

## 📝 Post-Deployment Verification

### After Deployment (Within 1 Hour)

- [ ] **Smoke tests** on production URL
  - [ ] Homepage loads without errors
  - [ ] User registration working
  - [ ] User login working
  - [ ] Appointment booking working
  - [ ] Doctor dashboard accessible

- [ ] **Sentry monitoring** active
  - [ ] Check Sentry dashboard for errors
  - [ ] Verify no critical errors in last 15 minutes

- [ ] **Firebase Analytics** tracking
  - [ ] Verify events logged in Firebase Console > Analytics

- [ ] **Performance monitoring** data flowing
  - [ ] Check Firebase Console > Performance
  - [ ] Verify page load metrics recorded

---

## 🆘 Emergency Contacts

**Production Issues:**
- Lead Developer: [Contact Info]
- DevOps Engineer: [Contact Info]
- Firebase Support: https://firebase.google.com/support

**Monitoring Dashboards:**
- Sentry: https://sentry.io/organizations/mindcare
- Firebase Console: https://console.firebase.google.com
- GitHub Actions: https://github.com/drabdanoo/MindCare/actions

---

**Document Version History:**

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-12-14 | Initial checklist creation | Development Team |

---

**Next Review Date:** [Set quarterly review schedule]
