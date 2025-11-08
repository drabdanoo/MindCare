# MindCare - Deployment Guide

## Firebase Hosting Deployment

### Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project created and configured
- `.firebaserc` file configured (already present)

### Step 1: Build the Project
```bash
npm run build
```

This creates a `dist/` folder with optimized production files.

### Step 2: Deploy to Firebase
```bash
npm run firebase:deploy
```

Or manually:
```bash
firebase deploy
```

### Step 3: Verify Deployment
Visit your Firebase hosting URL (shown in deployment output).

## Environment Variables

### For Development
Create `.env.local`:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### For Production
Set environment variables in Firebase Console or use `.env.production.local`.

## Firestore Security Rules Deployment

The `firestore.rules` file is automatically deployed with `firebase deploy`.

To deploy only rules:
```bash
firebase deploy --only firestore:rules
```

## Continuous Deployment (CD)

### GitHub Actions Example
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: mindcare-9a4d2
```

## Monitoring & Logging

### Firebase Console
- Monitor real-time database usage
- View authentication logs
- Check Firestore quota usage
- Review security rule violations

### Performance Monitoring
Enable Firebase Performance Monitoring in the console to track:
- Page load times
- Custom traces
- Network requests

## Scaling Considerations

### Database
- Firestore auto-scales for read/write operations
- Monitor quota usage in Firebase Console
- Consider composite indexes for complex queries

### Hosting
- Firebase Hosting uses CDN globally
- Static assets cached automatically
- No server management required

### Authentication
- Firebase Auth handles scaling automatically
- No rate limiting for development
- Production rate limits apply

## Backup & Recovery

### Firestore Backups
Enable automated backups in Firebase Console:
1. Go to Firestore Database
2. Backups tab
3. Create backup schedule

### Manual Backup
```bash
firebase firestore:export gs://your-bucket/backup-$(date +%s)
```

## Troubleshooting

### Deployment Fails
1. Check Firebase CLI version: `firebase --version`
2. Verify authentication: `firebase login`
3. Check `.firebaserc` configuration
4. Ensure `dist/` folder exists

### Rules Not Updating
1. Verify syntax: `firebase deploy --dry-run`
2. Check rule violations in Console
3. Restart Firebase emulator if testing locally

### Slow Performance
1. Check Firestore indexes in Console
2. Review query patterns
3. Enable caching headers for static assets
4. Use CDN for images and large files

## Production Checklist

- [ ] Environment variables configured
- [ ] Firestore security rules reviewed
- [ ] Firebase Authentication enabled
- [ ] HTTPS enforced
- [ ] Error tracking configured (Sentry)
- [ ] Analytics enabled
- [ ] Backup schedule set
- [ ] Monitoring alerts configured
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] API keys restricted
- [ ] Sensitive data encrypted
- [ ] Audit logging enabled
- [ ] Performance baseline established
- [ ] Disaster recovery plan documented

## Rollback Procedure

### Rollback to Previous Version
```bash
firebase hosting:channels:list
firebase hosting:clone mindcare-9a4d2:live mindcare-9a4d2:rollback
```

Or redeploy previous build:
```bash
npm run build
firebase deploy
```

## Cost Optimization

### Firestore
- Use indexes efficiently
- Batch operations where possible
- Archive old data
- Monitor query costs

### Hosting
- Compress assets
- Use CDN caching
- Lazy load images
- Minify code (Vite does this)

### Authentication
- Use custom claims for authorization
- Cache user data locally
- Implement session management

## Support & Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
