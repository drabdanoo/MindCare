import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { AppStackParamList } from '../navigation/AppNavigator';
import { showErrorToast, showSuccessToast, showInfoToast } from '../utils/toast';
import { captureException } from '../config/sentry';

type PatientDashboardNavigationProp = NativeStackNavigationProp<AppStackParamList, 'PatientDashboard'>;
type PatientDashboardRouteProp = RouteProp<AppStackParamList, 'PatientDashboard'>;

interface Props {
  navigation: PatientDashboardNavigationProp;
  route: PatientDashboardRouteProp;
}

interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  patientName: string;
  date: string;
  time: string;
  reason: string;
  status: string;
  paymentStatus?: 'unpaid' | 'pending_verification' | 'confirmed';
  paymentMethodName?: string;
  createdAt: any;
}

interface Doctor {
  id: string;
  name: string;
  specialization?: string;
  email: string;
}

export default function PatientDashboard({ navigation, route }: Props) {
  const [userName, setUserName] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) {
      // Should handle this case, maybe redirect to login if auth state desyncs
      return;
    }

    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserName(data.name || data.fullName || 'Patient');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserData();

    const fetchDoctors = async () => {
      try {
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
      }
    };

    fetchDoctors();

    // Real-time listener for appointments
    const appointmentsRef = collection(db, 'appointments');
    const q = query(
      appointmentsRef,
      where('patientId', '==', userId),
      orderBy('date', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const appointmentsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Appointment[];
        setAppointments(appointmentsList);
        setLoading(false);
        setRefreshing(false);
      },
      (error) => {
        console.error('Error fetching appointments:', error);
        captureException(error);
        showErrorToast('Failed to load appointments');
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showSuccessToast('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      captureException(error);
      showErrorToast('Failed to logout');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    // The snapshot listener will automatically update the data
    // We can re-fetch user data here if we want
    if (userId) {
      getDoc(doc(db, 'users', userId)).then(userDoc => {
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserName(data.name || data.fullName || 'Patient');
        }
        setRefreshing(false);
      });
    } else {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'declined':
        return '#ef4444';
      case 'completed':
        return '#6366f1';
      default:
        return '#6b7280';
    }
  };

  const renderDoctorCard = ({ item }: { item: Doctor }) => (
    <TouchableOpacity
      style={styles.doctorCard}
      onPress={() => navigation.navigate('BookAppointment', { doctorId: item.id })}
    >
      <Image
        source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random` }}
        style={styles.doctorImage}
      />
      <Text style={styles.doctorName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.doctorSpeciality}>{item.specialization || 'General'}</Text>
      <Text style={styles.doctorFee}>$50 / Visit</Text>
    </TouchableOpacity>
  );

  const getPaymentBadge = (paymentStatus?: string) => {
    switch (paymentStatus) {
      case 'pending_verification':
        return { label: 'PAYMENT PENDING', color: '#f59e0b' };
      case 'confirmed':
        return { label: 'PAID', color: '#10b981' };
      default:
        return null;
    }
  };

  const renderAppointment = ({ item }: { item: Appointment }) => {
    const paymentBadge = getPaymentBadge(item.paymentStatus);
    const showPayButton =
      item.status === 'accepted' && !item.paymentStatus || item.paymentStatus === 'unpaid';

    return (
      <View style={styles.appointmentCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.appointmentDate}>{item.date}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.appointmentTime}>Time: {item.time}</Text>
        <Text style={styles.appointmentReason}>Reason: {item.reason}</Text>

        {paymentBadge && (
          <View style={[styles.paymentBadge, { backgroundColor: paymentBadge.color }]}>
            <Text style={styles.paymentBadgeText}>{paymentBadge.label}</Text>
          </View>
        )}

        {showPayButton && (
          <TouchableOpacity
            style={styles.payButton}
            onPress={() =>
              navigation.navigate('PaymentScreen', {
                appointmentId: item.id,
                doctorName: item.doctorName || 'Doctor',
                date: item.date,
                time: item.time,
              })
            }
          >
            <Text style={styles.payButtonText}>Pay Now</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.prescriptionsLink}
            onPress={() =>
              navigation.navigate('Prescriptions', {
                patientId: userId || '',
                role: 'patient',
              })
            }
          >
            <Text style={styles.prescriptionsLinkText}>My Rx</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.prescriptionsLink}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.prescriptionsLinkText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Find a Doctor</Text>
        <FlatList
          data={doctors}
          renderItem={renderDoctorCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.doctorList}
          ListEmptyComponent={<Text style={styles.emptyText}>No doctors found.</Text>}
        />

        <Text style={styles.sectionTitle}>My Appointments</Text>
        {appointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No appointments yet</Text>
            <Text style={styles.emptySubtext}>Book your first appointment to get started</Text>
          </View>
        ) : (
          <FlatList
            data={appointments}
            renderItem={renderAppointment}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#667eea']} />
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('BookAppointment')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#667eea',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  appointmentTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  appointmentReason: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    marginTop: -4, // Center slightly better visually
  },
  doctorList: {
    paddingBottom: 16,
    marginBottom: 8,
  },
  doctorCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    width: 140,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  doctorName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 2,
  },
  doctorSpeciality: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  doctorFee: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  paymentBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  paymentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  payButton: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  payButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prescriptionsLink: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  prescriptionsLinkText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});
