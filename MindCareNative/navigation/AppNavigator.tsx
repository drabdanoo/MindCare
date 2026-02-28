import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PatientDashboard from '../screens/PatientDashboard';
import DoctorDashboard from '../screens/DoctorDashboard';
import MeetingScreen from '../screens/MeetingScreen';
import BookAppointmentScreen from '../screens/BookAppointmentScreen';
import PaymentScreen from '../screens/PaymentScreen';
import WritePrescriptionScreen from '../screens/WritePrescriptionScreen';
import PrescriptionsScreen from '../screens/PrescriptionsScreen';

/**
 * App Stack - Rendered when user IS authenticated
 * Contains all authenticated screens (dashboards, appointments, etc.)
 */

export type AppStackParamList = {
  PatientDashboard: undefined;
  DoctorDashboard: undefined;
  AppointmentBooking: undefined; // Renamed for consistency with implemented screen
  BookAppointment: { doctorId?: string } | undefined;
  Meeting: { roomName: string; userName: string };
  PaymentScreen: {
    appointmentId: string;
    doctorName: string;
    date: string;
    time: string;
  };
  WritePrescription: {
    appointmentId: string;
    patientId: string;
    patientName: string;
  };
  Prescriptions: {
    patientId: string;
    role: 'patient' | 'doctor';
  };
  Profile?: undefined;
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
      <Stack.Screen
        name="Meeting"
        component={MeetingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BookAppointment"
        component={BookAppointmentScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PaymentScreen"
        component={PaymentScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="WritePrescription"
        component={WritePrescriptionScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Prescriptions"
        component={PrescriptionsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
