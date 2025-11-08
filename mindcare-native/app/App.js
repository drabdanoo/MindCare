import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './services/firebase';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import PatientDashboard from './screens/PatientDashboard';
import DoctorDashboard from './screens/DoctorDashboard';
import VideoCallScreen from './screens/VideoCallScreen';
import PendingApproval from './screens/PendingApproval';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name="Login" component={LoginScreen} />
			<Stack.Screen name="Register" component={RegisterScreen} />
		</Stack.Navigator>
	);
}

function PatientStack() {
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name="PatientDashboard" component={PatientDashboard} />
			<Stack.Screen name="VideoCall" component={VideoCallScreen} />
		</Stack.Navigator>
	);
}

function DoctorStack() {
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name="DoctorDashboard" component={DoctorDashboard} />
			<Stack.Screen name="VideoCall" component={VideoCallScreen} />
		</Stack.Navigator>
	);
}

function AppTabs({ userType }) {
	return (
		<Tab.Navigator
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: '#2563eb',
				tabBarInactiveTintColor: '#999',
			}}
		>
			{userType === 'patient' ? (
				<Tab.Screen
					name="PatientTab"
					component={PatientStack}
					options={{ tabBarLabel: 'Dashboard' }}
				/>
			) : (
				<Tab.Screen
					name="DoctorTab"
					component={DoctorStack}
					options={{ tabBarLabel: 'Appointments' }}
				/>
			)}
		</Tab.Navigator>
	);
}

export default function App() {
	const [user, setUser] = useState(null);
	const [userType, setUserType] = useState('patient');
	const [doctorApproved, setDoctorApproved] = useState(true);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
			try {
				if (currentUser) {
					try {
						const userDocRef = doc(db, 'users', currentUser.uid);
						const userDoc = await getDoc(userDocRef);
						if (userDoc.exists()) {
							const data = userDoc.data();
							setUserType(data?.userType || 'patient');
							if (data?.userType === 'doctor') {
								setDoctorApproved(!!data?.approved);
							} else {
								setDoctorApproved(true);
							}
						} else {
							// no user doc; default to patient
							setUserType('patient');
							setDoctorApproved(true);
						}
					} catch (e) {
						console.warn('Failed to load user profile, defaulting to patient', e);
						setUserType('patient');
						setDoctorApproved(true);
					}
				} else {
					setUserType(null);
					setDoctorApproved(true);
				}
				setUser(currentUser);
			} finally {
				setLoading(false);
			}
		});

		return unsubscribe;
	}, []);

	if (loading) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size="large" color="#2563eb" />
			</View>
		);
	}

	return (
		<NavigationContainer>
			{user ? (
				userType === 'doctor' && !doctorApproved ? (
					<PendingApproval />
				) : (
					<AppTabs userType={userType} />
				)
			) : (
				<AuthStack />
			)}
		</NavigationContainer>
	);
}

