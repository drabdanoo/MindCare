import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request notification permissions
export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.warn('Notification permissions not granted');
    return false;
  }
  
  // Configure notification channel for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'MindCare Reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#667eea',
    });
  }
  
  return true;
};

// Schedule appointment reminder
export const scheduleAppointmentReminder = async (
  appointmentId: string,
  title: string,
  body: string,
  triggerDate: Date
): Promise<string> => {
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { appointmentId, type: 'appointment_reminder' },
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: triggerDate,
  });
  
  return identifier;
};

// Cancel scheduled notification
export const cancelNotification = async (notificationId: string): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
};

// Get push notification token
export const getPushToken = async (): Promise<string | null> => {
  try {
    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
};
