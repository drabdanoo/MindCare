import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initSentry } from './config/sentry';
import Toast from 'react-native-toast-message';
import RootNavigator from './navigation/RootNavigator';
import { requestNotificationPermissions } from './utils/notifications';

// Initialize Sentry error tracking
initSentry();

export default function App() {
  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  return (
    <SafeAreaProvider>
      <RootNavigator />

      {/* Global Toast Component - Must be last child */}
      <Toast />
    </SafeAreaProvider>
  );
}
