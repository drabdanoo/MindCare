import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { setUserContext, clearUserContext } from '../config/sentry';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

/**
 * Root Navigator - Conditionally renders AuthStack or AppStack
 * based on Firebase Authentication state
 * 
 * Flow:
 * 1. Listen to Firebase auth state changes
 * 2. If user is null → Show AuthNavigator (Login/Register)
 * 3. If user exists → Fetch user data from Firestore → Show AppNavigator
 * 4. Set Sentry user context for error tracking
 */

export default function RootNavigator() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // User authenticated - fetch role from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const role = userDoc.data()?.role || 'patient';
            setUserRole(role);
          }
          
          // Set Sentry user context
          setUserContext(currentUser.uid, currentUser.email || undefined, userRole || undefined);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        // User logged out - clear context
        setUserRole(null);
        clearUserContext();
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Show loading spinner during auth state initialization
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user === null ? (
        // User NOT authenticated → Show AuthStack (Login/Register)
        <AuthNavigator />
      ) : (
        // User authenticated → Show AppStack (Dashboards/Features)
        <AppNavigator />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
