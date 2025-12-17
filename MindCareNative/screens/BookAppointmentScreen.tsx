import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    FlatList,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/AppNavigator';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { showErrorToast, showSuccessToast } from '../utils/toast';

type NavigationProp = NativeStackNavigationProp<AppStackParamList, 'AppointmentBooking'>;

interface Props {
    navigation: NavigationProp;
}

interface Doctor {
    id: string;
    name: string;
    specialization?: string;
    email: string;
}

export default function BookAppointmentScreen({ navigation }: Props) {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [reason, setReason] = useState('');

    // Set default date/time to tomorrow
    useEffect(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateString = tomorrow.toISOString().split('T')[0];
        setDate(dateString);
        setTime('10:00');
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            // Create a query against the collection.
            const q = query(collection(db, 'users'), where('role', '==', 'doctor'));
            const querySnapshot = await getDocs(q);
            const doctorsList: Doctor[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                doctorsList.push({
                    id: doc.id,
                    name: data.name || data.fullName || 'Unknown Doctor',
                    email: data.email,
                    specialization: data.specialization || 'General',
                });
            });
            setDoctors(doctorsList);
        } catch (error) {
            console.error('Error fetching doctors:', error);
            showErrorToast('Failed to load doctors list');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        if (!selectedDoctor) {
            Alert.alert('Error', 'Please select a doctor');
            return false;
        }
        // Simple regex for YYYY-MM-DD
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!date.match(dateRegex)) {
            Alert.alert('Error', 'Invalid date format. Use YYYY-MM-DD');
            return false;
        }
        // Simple regex for HH:MM
        const timeRegex = /^\d{2}:\d{2}$/;
        if (!time.match(timeRegex)) {
            Alert.alert('Error', 'Invalid time format. Use HH:MM');
            return false;
        }
        if (!reason.trim()) {
            Alert.alert('Error', 'Please enter a reason for the appointment');
            return false;
        }
        return true;
    };

    const handleBook = async () => {
        if (!validateForm()) return;
        if (!auth.currentUser) return;

        setSubmitting(true);
        try {
            await addDoc(collection(db, 'appointments'), {
                patientId: auth.currentUser.uid,
                patientName: auth.currentUser.displayName || 'Patient', // In a real app, fetch actual profile name
                doctorId: selectedDoctor?.id,
                doctorName: selectedDoctor?.name,
                date,
                time,
                reason,
                status: 'pending',
                createdAt: new Date(),
            });

            showSuccessToast('Appointment request sent!');
            navigation.goBack();
        } catch (error) {
            console.error('Error booking appointment:', error);
            showErrorToast('Failed to book appointment');
        } finally {
            setSubmitting(false);
        }
    };

    const renderDoctorItem = ({ item }: { item: Doctor }) => (
        <TouchableOpacity
            style={[
                styles.doctorCard,
                selectedDoctor?.id === item.id && styles.selectedDoctorCard,
            ]}
            onPress={() => setSelectedDoctor(item)}
        >
            <View>
                <Text style={[styles.doctorName, selectedDoctor?.id === item.id && styles.selectedDoctorText]}>
                    {item.name}
                </Text>
                <Text style={[styles.doctorSpecialization, selectedDoctor?.id === item.id && styles.selectedDoctorSubtext]}>
                    {item.specialization}
                </Text>
            </View>
            {selectedDoctor?.id === item.id && (
                <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Book Appointment</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.closeButton}>Close</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <Text style={styles.sectionTitle}>Select Doctor</Text>
                {loading ? (
                    <ActivityIndicator color="#667eea" />
                ) : doctors.length === 0 ? (
                    <Text style={styles.emptyText}>No doctors available at the moment.</Text>
                ) : (
                    <FlatList
                        data={doctors}
                        renderItem={renderDoctorItem}
                        keyExtractor={item => item.id}
                        scrollEnabled={false} // Nested in ScrollView
                        style={styles.doctorList}
                    />
                )}

                <Text style={styles.sectionTitle}>Appointment Details</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
                    <TextInput
                        style={styles.input}
                        value={date}
                        onChangeText={setDate}
                        placeholder="2025-12-25"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Time (HH:MM)</Text>
                    <TextInput
                        style={styles.input}
                        value={time}
                        onChangeText={setTime}
                        placeholder="14:00"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Reason for Visit</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={reason}
                        onChangeText={setReason}
                        placeholder="Describe your symptoms..."
                        multiline
                        numberOfLines={3}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.bookButton, submitting && styles.disabledButton]}
                    onPress={handleBook}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.bookButtonText}>Confirm Booking</Text>
                    )}
                </TouchableOpacity>

                {/* Spacer for bottom padding */}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        color: '#667eea',
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#666',
        marginTop: 16,
        marginBottom: 8,
    },
    doctorList: {
        marginBottom: 16,
    },
    doctorCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectedDoctorCard: {
        borderColor: '#667eea',
        backgroundColor: '#EEF2FF',
    },
    doctorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    selectedDoctorText: {
        color: '#667eea',
    },
    doctorSpecialization: {
        fontSize: 14,
        color: '#888',
        marginTop: 2,
    },
    selectedDoctorSubtext: {
        color: '#818CF8',
    },
    checkmark: {
        backgroundColor: '#667eea',
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmarkText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    emptyText: {
        color: '#999',
        fontStyle: 'italic',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    bookButton: {
        backgroundColor: '#667eea',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
    },
    disabledButton: {
        opacity: 0.7,
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
