import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const registerForPushNotificationsAsync = async () => {
    let token;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    return token;
};

export const scheduleAppointmentReminder = async (appointmentDate: Date, doctorName: string) => {
    const triggerDate = new Date(appointmentDate);
    triggerDate.setMinutes(triggerDate.getMinutes() - 15); // 15 minutes before

    if (triggerDate.getTime() < Date.now()) {
        console.log('Appointment is too soon for 15m reminder');
        return;
    }

    try {
        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: "Upcoming Appointment",
                body: `You have an appointment with Dr. ${doctorName} in 15 minutes.`,
                sound: true,
                data: { screen: 'PatientDashboard' },
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: triggerDate,
            },
        });
        console.log('Scheduled notification:', id, 'for', triggerDate.toISOString());
        return id;
    } catch (error) {
        console.error('Error scheduling notification:', error);
    }
};

export const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
};
