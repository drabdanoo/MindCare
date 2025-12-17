import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PatientDashboard from '../screens/PatientDashboard';
import DoctorDashboard from '../screens/DoctorDashboard';

/**
 * App Stack - Rendered when user IS authenticated
 * Contains all authenticated screens (dashboards, appointments, etc.)
 */

export type AppStackParamList = {
  PatientDashboard: undefined;
  DoctorDashboard: undefined;
  AppointmentBooking?: { doctorId: string; doctorName: string };
  VideoCall?: { roomName: string; appointmentId: string };
  Profile?: undefined;
  Prescriptions?: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#667eea',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="PatientDashboard"
        component={PatientDashboard}
        options={{
          title: 'My Appointments',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="DoctorDashboard"
        component={DoctorDashboard}
        options={{
          title: 'Doctor Dashboard',
          headerShown: true,
        }}
      />
      {/* Future screens: AppointmentBooking, VideoCall, Profile, Prescriptions */}
    </Stack.Navigator>
  );
}
