import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PatientDashboard from '../screens/PatientDashboard';
import DoctorDashboard from '../screens/DoctorDashboard';
import MeetingScreen from '../screens/MeetingScreen';
import BookAppointmentScreen from '../screens/BookAppointmentScreen';

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
  Profile?: undefined;
  Prescriptions?: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

type Props = {
  userRole: string | null;
};

export default function AppNavigator({ userRole }: Props) {
  const initialRoute: keyof AppStackParamList =
    userRole === 'doctor' ? 'DoctorDashboard' : 'PatientDashboard';

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
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
    </Stack.Navigator>
  );
}
