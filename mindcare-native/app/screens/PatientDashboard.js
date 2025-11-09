import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  TextInput,
  Image,
} from 'react-native';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';

// Check if Firebase services are properly initialized
const isFirebaseInitialized = !!auth && !!db;

// Utility: derive two-letter initials from doctor name
const getInitials = (fullName) => {
  if (!fullName || typeof fullName !== 'string') return 'DR';
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return 'DR';
};

// Doctor Card Component - now fully pressable to navigate to detail
const DoctorCard = ({ doctor, onPress }) => {
  const initials = getInitials(doctor.fullName || 'Doctor');
  const hasPhoto = typeof doctor.photoURL === 'string' && doctor.photoURL.trim().length > 0;
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.doctorCard}>
      <View style={styles.doctorHeaderRow}>
        {hasPhoto ? (
          <Image source={{ uri: doctor.photoURL }} style={styles.doctorAvatar} />
        ) : (
          <View style={[styles.doctorAvatar, styles.doctorAvatarPlaceholder]}>
            <Text style={styles.avatarPlaceholderText}>{initials}</Text>
          </View>
        )}
        <View style={styles.doctorHeaderText}>
          <Text style={styles.doctorName}>{doctor.fullName || 'Unknown Doctor'}</Text>
          <Text style={styles.specialty}>{doctor.specialty || 'Specialty not specified'}</Text>
        </View>
      </View>
      <View style={styles.doctorInfo}>
        <Text style={styles.fee}>Fee: ${doctor.consultationFee || 'N/A'} / hour</Text>
      </View>
      <View style={styles.cardActionsRow}>
        <Text style={styles.tapHint}>Tap for full profile</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function PatientDashboard({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch appointments
  useEffect(() => {
    if (!isFirebaseInitialized || !auth.currentUser) {
      setError('User not authenticated or Firebase not configured');
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'appointments'),
      where('patientId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(data);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch doctors
  useEffect(() => {
    const loadDoctors = async () => {
      if (!isFirebaseInitialized) {
        setDoctorsLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, 'users'),
          where('userType', '==', 'doctor'),
          where('approved', '==', true)
        );
        
        const querySnapshot = await getDocs(q);
        
        const doctorsData = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(doctor => 
            doctor.specialty && 
            doctor.consultationFee && 
            doctor.availability
          );
        
        setDoctors(doctorsData);
        setFilteredDoctors(doctorsData);
      } catch (err) {
        console.error('Error loading doctors:', err);
        Alert.alert('Error', 'Failed to load doctors: ' + err.message);
      } finally {
        setDoctorsLoading(false);
      }
    };

    loadDoctors();
  }, []);

  // Handle search filtering
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDoctors(doctors);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = doctors.filter(doctor => {
        const nameMatch = doctor.fullName?.toLowerCase().includes(lowercasedQuery);
        const specialtyMatch = doctor.specialty?.toLowerCase().includes(lowercasedQuery);
        return nameMatch || specialtyMatch;
      });
      setFilteredDoctors(filtered);
    }
  }, [searchQuery, doctors]);

  const handleLogout = async () => {
    if (!auth) {
      Alert.alert('Error', 'Authentication service is not available');
      return;
    }
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      // Lazy import to avoid top-level import since only used here
      const { doc, updateDoc } = await import('firebase/firestore');
      const ref = doc(db, 'appointments', appointmentId);
      await updateDoc(ref, { status: 'cancelled' });
    } catch (e) {
      console.error('Failed to cancel appointment', e);
      Alert.alert('Error', 'Unable to cancel appointment.');
    }
  };

  const renderAppointment = ({ item }) => {
    const showJoin = item.status === 'confirmed';
    const showCancel = ['pending', 'confirmed'].includes(item.status);
    return (
      <View style={styles.appointmentCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.doctorName}>{item.doctorName || 'N/A'}</Text>
          <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
            {item.status || 'pending'}
          </Text>
        </View>
        <Text style={styles.appointmentTime}>
          {item.date || 'TBD'} at {item.time || item.timeSlot || 'TBD'}
        </Text>
        <View style={styles.appointmentActionsRow}>
          {showJoin && (
            <TouchableOpacity
              style={[styles.smallButton, styles.joinButton]}
              onPress={() => navigation.navigate('VideoCall', { appointmentId: item.id })}
            >
              <Text style={styles.smallButtonText}>Join Call</Text>
            </TouchableOpacity>
          )}
          {showCancel && (
            <TouchableOpacity
              style={[styles.smallButton, styles.cancelButton]}
              onPress={() => cancelAppointment(item.id)}
            >
              <Text style={styles.smallButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (!isFirebaseInitialized) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Dashboard</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Service is not available.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Patient Dashboard</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutButton}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ListHeaderComponent={
          <>
            <View style={styles.doctorsSection}>
              <Text style={styles.doctorsTitle}>Find a Doctor</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name or specialty..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {doctorsLoading ? (
                <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 20 }} />
              ) : (
                filteredDoctors.length === 0 && <Text style={styles.emptyText}>No doctors found.</Text>
              )}
            </View>
          </>
        }
        data={filteredDoctors}
        renderItem={({ item }) => (
          <DoctorCard
            doctor={item}
            onPress={() => navigation.navigate('DoctorProfileDetail', { doctor: item })}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={
            <>
              <View style={styles.appointmentsSection}>
                <Text style={styles.appointmentsTitle}>My Appointments</Text>
                {loading ? (
                  <ActivityIndicator size="large" color="#2563eb" />
                ) : (
                  <>
                    <AppointmentBuckets appointments={appointments} />
                  </>
                )}
              </View>
            </>
        }
      />
    </View>
  );
}

// Component to bucket appointments into Upcoming / Past
function AppointmentBuckets({ appointments }) {
  if (!appointments || appointments.length === 0) {
    return <Text style={styles.emptyText}>You have no appointments.</Text>;
  }
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const upcoming = [];
  const past = [];
  appointments.forEach(appt => {
    const apptDateStr = appt.date;
    // Prioritize explicit completed/cancelled as past
    if (['completed', 'cancelled', 'rejected'].includes(appt.status)) {
      past.push(appt);
      return;
    }
    if (apptDateStr < todayStr) {
      past.push(appt);
    } else {
      upcoming.push(appt);
    }
  });

  return (
    <View>
      <Text style={styles.bucketTitle}>Upcoming</Text>
      {upcoming.length === 0 ? (
        <Text style={styles.bucketEmpty}>No upcoming appointments.</Text>
      ) : (
        upcoming.map(item => <View key={item.id}>{renderInlineAppointment(item)}</View>)
      )}
      <Text style={styles.bucketTitle}>Past</Text>
      {past.length === 0 ? (
        <Text style={styles.bucketEmpty}>No past appointments.</Text>
      ) : (
        past.map(item => <View key={item.id}>{renderInlineAppointment(item)}</View>)
      )}
    </View>
  );
}

// Reuse card rendering inside bucket
function renderInlineAppointment(item) {
  return (
    <View style={styles.appointmentCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.doctorName}>{item.doctorName || 'N/A'}</Text>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
          {item.status || 'pending'}
        </Text>
      </View>
      <Text style={styles.appointmentTime}>
        {item.date || 'TBD'} at {item.time || item.timeSlot || 'TBD'}
      </Text>
    </View>
  );
}

const getStatusColor = (status) => {
  switch (status) {
    case 'confirmed': return '#10b981';
    case 'pending': return '#f59e0b';
    case 'rejected': return '#ef4444';
    default: return '#666';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  doctorsSection: {
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  doctorsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  searchInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    ...Platform.select({
      android: { elevation: 3 },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  doctorHeader: {
    marginBottom: 10,
  },
  doctorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  doctorHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  doctorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e5e7eb',
  },
  doctorAvatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  avatarPlaceholderText: {
    color: '#9ca3af',
    fontWeight: '700',
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  specialty: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
    marginTop: 4,
  },
  doctorInfo: {
    marginBottom: 15,
  },
  fee: {
    fontSize: 16,
    color: '#333',
  },
  bookButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  appointmentsSection: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  appointmentsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  appointmentTime: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  callButton: {
    backgroundColor: '#10b981',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  appointmentActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 6,
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginRight: 10,
  },
  joinButton: {
    backgroundColor: '#10b981',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
  },
  smallButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  bucketTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 10,
    marginBottom: 8,
  },
  bucketEmpty: {
    color: '#666',
    fontSize: 14,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    margin: 15,
    borderRadius: 6,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 14,
    fontWeight: '500',
  },
});