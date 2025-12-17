import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initSentry } from './config/sentry';
import Toast from 'react-native-toast-message';
import RootNavigator from './navigation/RootNavigator';

// Initialize Sentry error tracking
initSentry();

export default function App() {
  return (
    <SafeAreaProvider>
      <RootNavigator />
      
      {/* Global Toast Component - Must be last child */}
      <Toast />
    </SafeAreaProvider>
  );
}
