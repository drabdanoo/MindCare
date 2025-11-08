import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { collection, query, where, onSnapshot, updateDoc, doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';

// Check if Firebase services are properly initialized
const isFirebaseInitialized = !!auth && !!db;

export default function DoctorDashboard({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'appointments', or 'profile'
  const [doctorProfile, setDoctorProfile] = useState({
    specialty: '',
    consultationFee: '',
    availability: {
      startTime: '09:00',
      endTime: '17:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    }
  });
  const [profileLoading, setProfileLoading] = useState(false);

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
        where('doctorId', '==', auth.currentUser.uid)
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
            setError('Failed to load appointments: ' + err.message);
          }
          setLoading(false);
        },
        (err) => {
          console.error('Firestore listener error:', err);
          setError('Failed to fetch appointments: ' + err.message);
          setLoading(false);
        }
      );
      
      // Load doctor profile
      loadDoctorProfile();
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

  const loadDoctorProfile = async () => {
    try {
      setProfileLoading(true);
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setDoctorProfile({
          specialty: userData.specialty || '',
          consultationFee: userData.consultationFee || '',
          availability: userData.availability || {
            startTime: '09:00',
            endTime: '17:00',
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
          }
        });
      }
    } catch (err) {
      console.error('Error loading doctor profile:', err);
      Alert.alert('Error', 'Failed to load profile information');
    } finally {
      setProfileLoading(false);
    }
  };

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

  const updateAppointmentStatus = async (appointmentId, status) => {
    // Check if Firebase Firestore is initialized
    if (!db) {
      Alert.alert('Error', 'Database service is not available');
      return;
    }

    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status,
        updatedAt: new Date(),
      });
      Alert.alert('Success', `Appointment ${status} successfully`);
    } catch (error) {
      console.error('Error updating appointment:', error);
      Alert.alert('Error', `Failed to ${status} appointment: ${error.message}`);
    }
  };

  // Helpers for profile validation
  const VALID_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const isValidTime = (t) => {
    if (typeof t !== 'string') return false;
    const m = t.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
    return !!m;
  };
  const timeToMinutes = (t) => {
    const [hh, mm] = t.split(':').map(Number);
    return hh * 60 + mm;
  };

  const saveDoctorProfile = async () => {
    setProfileLoading(true);
    try {
      // Validate specialty
      const specialty = (doctorProfile?.specialty ?? '').trim();
      if (!specialty) {
        setProfileLoading(false);
        Alert.alert('Validation Error', 'Please enter your specialty.');
        return;
      }

      // Validate and sanitize consultation fee
      const feeStr = String(doctorProfile?.consultationFee ?? '').trim();
      const feeNum = Number(feeStr);
      if (!Number.isFinite(feeNum) || feeNum <= 0) {
        setProfileLoading(false);
        Alert.alert('Validation Error', 'Consultation fee must be a positive number.');
        return;
      }

      // Validate availability
      const availability = doctorProfile?.availability || {};
      const startTime = (availability?.startTime ?? '').trim();
      const endTime = (availability?.endTime ?? '').trim();
      const days = Array.isArray(availability?.days) ? availability.days : [];

      if (!isValidTime(startTime) || !isValidTime(endTime)) {
        setProfileLoading(false);
        Alert.alert('Validation Error', 'Availability times must be in HH:MM (24-hour) format.');
        return;
      }

      if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
        setProfileLoading(false);
        Alert.alert('Validation Error', 'End time must be after start time.');
        return;
      }

      if (!Array.isArray(days) || days.length === 0 || !days.every(d => VALID_DAYS.includes(d))) {
        setProfileLoading(false);
        Alert.alert('Validation Error', 'Please select at least one valid day of availability.');
        return;
      }

      // Sanitize normalized fields
      const normalizedAvailability = {
        startTime,
        endTime,
        days: Array.from(new Set(days)).filter(d => VALID_DAYS.includes(d)),
      };

      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        specialty,
        consultationFee: feeNum,
        availability: normalizedAvailability,
        profileCompleted: true,
      });
      Alert.alert('Success', 'Profile saved successfully');
    } catch (err) {
      console.error('Error saving doctor profile:', err);
      Alert.alert('Error', 'Failed to save profile: ' + err.message);
    } finally {
      setProfileLoading(false);
    }
  };

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
        <Text style={styles.welcomeTitle}>Welcome Doctor</Text>
        <Text style={styles.welcomeText}>
          Manage your patient appointments and provide quality mental healthcare services.
        </Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{appointments.length}</Text>
          <Text style={styles.statLabel}>Total Requests</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {appointments.filter(a => a.status === 'pending').length}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {appointments.filter(a => a.status === 'confirmed').length}
          </Text>
          <Text style={styles.statLabel}>Confirmed</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => setActiveTab('appointments')}
      >
        <Text style={styles.actionButtonText}>
          {appointments.filter(a => a.status === 'pending').length > 0 
            ? `Review ${appointments.filter(a => a.status === 'pending').length} Pending Requests` 
            : 'View All Appointments'}
        </Text>
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
          <Text style={styles.emptyText}>No appointment requests</Text>
        </View>
      ) : (
        <FlatList
          data={appointments}
          renderItem={({ item }) => (
            <View style={styles.appointmentCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.patientName}>{item.patientName || 'N/A'}</Text>
                <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
                  {item.status || 'pending'}
                </Text>
              </View>
              <Text style={styles.appointmentTime}>
                {item.date || 'TBD'} at {item.time || 'TBD'}
              </Text>
              <Text style={styles.sessionType}>{item.sessionType || 'standard'} session</Text>
              <Text style={styles.reason}>{item.reason || 'No details provided'}</Text>

              {item.status === 'pending' && (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.actionButtonSecondary, styles.approveButton]}
                    onPress={() => updateAppointmentStatus(item.id, 'confirmed')}
                  >
                    <Text style={styles.buttonText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButtonSecondary, styles.rejectButton]}
                    onPress={() => updateAppointmentStatus(item.id, 'rejected')}
                  >
                    <Text style={styles.buttonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}

              {item.status === 'confirmed' && (
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => navigation.navigate('VideoCall', { appointmentId: item.id })}
                >
                  <Text style={styles.buttonText}>Start Video Call</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );

  // Profile content
  const profileContent = (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Text style={styles.profileTitle}>Professional Profile</Text>
        <Text style={styles.profileSubtitle}>Complete your profile to be visible to patients</Text>
      </View>
      
      <View style={styles.profileForm}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Specialty</Text>
          <TextInput
            style={styles.input}
            value={doctorProfile.specialty}
            onChangeText={(text) => setDoctorProfile({...doctorProfile, specialty: text})}
            placeholder="e.g., Clinical Psychology, Psychiatry"
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Consultation Fee (USD per hour)</Text>
          <TextInput
            style={styles.input}
            value={doctorProfile.consultationFee}
            onChangeText={(text) => setDoctorProfile({...doctorProfile, consultationFee: text})}
            placeholder="e.g., 50"
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Availability Start Time</Text>
          <TextInput
            style={styles.input}
            value={doctorProfile.availability.startTime}
            onChangeText={(text) => setDoctorProfile({
              ...doctorProfile, 
              availability: {...doctorProfile.availability, startTime: text}
            })}
            placeholder="e.g., 09:00"
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Availability End Time</Text>
          <TextInput
            style={styles.input}
            value={doctorProfile.availability.endTime}
            onChangeText={(text) => setDoctorProfile({
              ...doctorProfile, 
              availability: {...doctorProfile.availability, endTime: text}
            })}
            placeholder="e.g., 17:00"
            placeholderTextColor="#999"
          />
        </View>
        
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={saveDoctorProfile}
          disabled={profileLoading}
        >
          {profileLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Profile</Text>
          )}
        </TouchableOpacity>
      </View>
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
            {appointments.filter(a => a.status === 'pending').length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {appointments.filter(a => a.status === 'pending').length}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content based on active tab */}
      {activeTab === 'dashboard' ? dashboardContent : 
       activeTab === 'appointments' ? appointmentsContent : 
       profileContent}
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
    backgroundColor: '#f59e0b',
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
  patientName: {
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButtonSecondary: {
    flex: 1,
    marginHorizontal: 5,
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  callButton: {
    backgroundColor: '#2563eb',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  // Profile styles
  profileHeader: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  profileTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  profileForm: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
