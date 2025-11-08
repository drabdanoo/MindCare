import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';

// Check if Firebase services are properly initialized
const isFirebaseInitialized = !!auth && !!db;

export default function PatientDashboard({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'appointments', or 'doctors'

  useEffect(() => {
    // Check if Firebase is initialized
    if (!isFirebaseInitialized) {
      setError('Firebase services are not properly configured');
      setLoading(false);
      return;
    }

    let unsubscribe;

    // Ensure auth.currentUser exists before querying
    if (!auth.currentUser) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'appointments'),
        where('patientId', '==', auth.currentUser.uid)
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          try {
            const data = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            }));
            setAppointments(data);
            setError(null);
          } catch (err) {
            console.error('Error mapping appointments:', err);
            setError('Failed to load appointments');
          }
          setLoading(false);
        },
        (err) => {
          console.error('Firestore listener error:', err);
          setError('Failed to fetch appointments: ' + err.message);
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Error setting up listener:', err);
      setError('Failed to set up appointments listener: ' + err.message);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const loadDoctors = async () => {
    try {
      setDoctorsLoading(true);
      // Query for approved doctors with completed profiles
      const q = query(
        collection(db, 'users'),
        where('userType', '==', 'doctor'),
        where('approved', '==', true),
        where('profileCompleted', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const doctorsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setDoctors(doctorsData);
    } catch (err) {
      console.error('Error loading doctors:', err);
      Alert.alert('Error', 'Failed to load doctors: ' + err.message);
    } finally {
      setDoctorsLoading(false);
    }
  };

  useEffect(() => {
    // Load doctors when the doctors tab is selected
    if (activeTab === 'doctors' && doctors.length === 0) {
      loadDoctors();
    }
  }, [activeTab]);

  const handleLogout = async () => {
    // Check if Firebase Auth is initialized
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

  const renderAppointment = ({ item }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.doctorName}>{item.doctorName || 'N/A'}</Text>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
          {item.status || 'pending'}
        </Text>
      </View>
      <Text style={styles.appointmentTime}>
        {item.date || 'TBD'} at {item.time || 'TBD'}
      </Text>
      <Text style={styles.sessionType}>{item.sessionType || 'standard'} session</Text>
      <Text style={styles.reason}>{item.reason || 'No details provided'}</Text>

      {item.status === 'confirmed' && (
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => navigation.navigate('VideoCall', { appointmentId: item.id })}
        >
          <Text style={styles.buttonText}>Join Video Call</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderDoctor = ({ item }) => (
    <View style={styles.doctorCard}>
      <View style={styles.doctorHeader}>
        <Text style={styles.doctorName}>{item.fullName || 'Unknown Doctor'}</Text>
        <Text style={styles.specialty}>{item.specialty || 'Specialty not specified'}</Text>
      </View>
      
      <View style={styles.doctorInfo}>
        <Text style={styles.fee}>Fee: ${item.consultationFee || 'N/A'} / hour</Text>
        <Text style={styles.availability}>
          Available: {item.availability?.startTime || '09:00'} - {item.availability?.endTime || '17:00'}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.bookButton}
        onPress={() => console.log('Book appointment with doctor:', item.id)}
      >
        <Text style={styles.bookButtonText}>Book Appointment</Text>
      </TouchableOpacity>
    </View>
  );

  // Display error message if Firebase is not initialized
  if (!isFirebaseInitialized) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Dashboard</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Appointment service is not available. Please contact support.
          </Text>
        </View>
      </View>
    );
  }

  // Dashboard content
  const dashboardContent = (
    <View style={styles.dashboardContainer}>
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>Welcome to MindCare</Text>
        <Text style={styles.welcomeText}>
          Your mental health journey starts here. Book appointments with qualified professionals 
          and take control of your wellbeing.
        </Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{appointments.length}</Text>
          <Text style={styles.statLabel}>Total Appointments</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {appointments.filter(a => a.status === 'confirmed').length}
          </Text>
          <Text style={styles.statLabel}>Confirmed</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {appointments.filter(a => a.status === 'pending').length}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => setActiveTab('appointments')}
      >
        <Text style={styles.actionButtonText}>View All Appointments</Text>
      </TouchableOpacity>
    </View>
  );

  // Appointments content
  const appointmentsContent = (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
      ) : appointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No appointments yet</Text>
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => setActiveTab('doctors')}
          >
            <Text style={styles.buttonText}>Find a Doctor</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointment}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );

  // Doctors content
  const doctorsContent = (
    <View style={styles.container}>
      <View style={styles.doctorsHeader}>
        <Text style={styles.doctorsTitle}>Available Doctors</Text>
        <Text style={styles.doctorsSubtitle}>Browse our qualified mental health professionals</Text>
      </View>
      
      {doctorsLoading ? (
        <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
      ) : doctors.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No doctors available at the moment</Text>
        </View>
      ) : (
        <FlatList
          data={doctors}
          renderItem={renderDoctor}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Dashboard</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutButton}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>
            Dashboard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'appointments' && styles.activeTab]}
          onPress={() => setActiveTab('appointments')}
        >
          <View style={styles.tabWithBadge}>
            <Text style={[styles.tabText, activeTab === 'appointments' && styles.activeTabText]}>
              Appointments
            </Text>
            {appointments.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{appointments.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'doctors' && styles.activeTab]}
          onPress={() => setActiveTab('doctors')}
        >
          <Text style={[styles.tabText, activeTab === 'doctors' && styles.activeTabText]}>
            Doctors
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content based on active tab */}
      {activeTab === 'dashboard' ? dashboardContent : 
       activeTab === 'appointments' ? appointmentsContent : 
       doctorsContent}
    </View>
  );
}

const getStatusColor = (status) => {
  switch (status) {
    case 'confirmed':
      return '#10b981';
    case 'pending':
      return '#f59e0b';
    case 'rejected':
      return '#ef4444';
    default:
      return '#666';
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  tabWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dashboardContainer: {
    flex: 1,
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  actionButton: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    margin: 15,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: {
    color: '#991b1b',
    fontSize: 14,
    fontWeight: '500',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  listContainer: {
    padding: 15,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  appointmentTime: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  sessionType: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  reason: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  callButton: {
    backgroundColor: '#2563eb',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 20,
  },
  bookButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  // Doctors styles
  doctorsHeader: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  doctorsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  doctorsSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  doctorCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  doctorHeader: {
    marginBottom: 10,
  },
  specialty: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  doctorInfo: {
    marginBottom: 15,
  },
  fee: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  availability: {
    fontSize: 14,
    color: '#666',
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
