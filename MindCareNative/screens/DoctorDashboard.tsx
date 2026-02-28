import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { AppStackParamList } from '../navigation/AppNavigator';
import { showErrorToast, showSuccessToast } from '../utils/toast';
import { captureException } from '../config/sentry';

type DoctorDashboardNavigationProp = NativeStackNavigationProp<AppStackParamList, 'DoctorDashboard'>;
type DoctorDashboardRouteProp = RouteProp<AppStackParamList, 'DoctorDashboard'>;

interface Props {
  navigation: DoctorDashboardNavigationProp;
  route: DoctorDashboardRouteProp;
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  reason: string;
  status: string;
  paymentStatus?: 'unpaid' | 'pending_verification' | 'confirmed';
  paymentMethodName?: string;
  paymentNote?: string;
  createdAt: any;
}

export default function DoctorDashboard({ navigation, route }: Props) {
  const [userName, setUserName] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) {
      return;
    }

    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserName(data.name || data.fullName || 'Doctor');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserData();

    // Real-time listener for appointments
    const appointmentsRef = collection(db, 'appointments');
    const q = query(
      appointmentsRef,
      where('doctorId', '==', userId),
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

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: newStatus,
        acceptedAt: newStatus === 'accepted' ? new Date() : null,
      });
      showSuccessToast(`Appointment ${newStatus}`);
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      captureException(error);
      showErrorToast('Failed to update appointment status');
    }
  };

  const handleConfirmPayment = async (appointmentId: string) => {
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        paymentStatus: 'confirmed',
        paymentConfirmedAt: new Date(),
      });
      showSuccessToast('Payment confirmed');
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      captureException(error);
      showErrorToast('Failed to confirm payment');
    }
  };

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
    if (userId) {
      getDoc(doc(db, 'users', userId)).then(userDoc => {
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserName(data.name || data.fullName || 'Doctor');
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

  const renderAppointment = ({ item }: { item: Appointment }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.patientName}>{item.patientName}</Text>
          <Text style={styles.appointmentDate}>{item.date} at {item.time}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.reasonLabel}>Reason:</Text>
      <Text style={styles.reasonText}>{item.reason}</Text>

      {/* Payment section */}
      {item.paymentStatus === 'pending_verification' && (
        <View style={styles.paymentSection}>
          <View style={styles.paymentInfoRow}>
            <View style={styles.paymentPendingBadge}>
              <Text style={styles.paymentPendingText}>PAYMENT PENDING VERIFICATION</Text>
            </View>
          </View>
          {item.paymentMethodName && (
            <Text style={styles.paymentDetail}>Method: {item.paymentMethodName}</Text>
          )}
          {item.paymentNote && (
            <Text style={styles.paymentDetail}>Reference: {item.paymentNote}</Text>
          )}
          <TouchableOpacity
            style={styles.confirmPaymentButton}
            onPress={() => handleConfirmPayment(item.id)}
          >
            <Text style={styles.confirmPaymentText}>Confirm Payment Received</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.paymentStatus === 'confirmed' && (
        <View style={styles.paymentConfirmedBadge}>
          <Text style={styles.paymentConfirmedText}>PAYMENT CONFIRMED</Text>
        </View>
      )}

      {item.status === 'pending' && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleStatusUpdate(item.id, 'accepted')}
          >
            <Text style={styles.actionButtonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.declineButton]}
            onPress={() => handleStatusUpdate(item.id, 'declined')}
          >
            <Text style={styles.actionButtonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === 'accepted' && (
        <TouchableOpacity
          style={[styles.actionButton, styles.completeButton]}
          onPress={() => handleStatusUpdate(item.id, 'completed')}
        >
          <Text style={styles.actionButtonText}>Mark as Completed</Text>
        </TouchableOpacity>
      )}

      {item.status === 'completed' && (
        <TouchableOpacity
          style={[styles.actionButton, styles.prescriptionButton]}
          onPress={() =>
            navigation.navigate('WritePrescription', {
              appointmentId: item.id,
              patientId: item.patientId,
              patientName: item.patientName,
            })
          }
        >
          <Text style={styles.actionButtonText}>Write Prescription</Text>
        </TouchableOpacity>
      )}
    </View>
  );

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
          <Text style={styles.welcomeText}>Dr. {userName}</Text>
          <Text style={styles.subtitle}>Your Appointments</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.prescriptionsLink}
            onPress={() =>
              navigation.navigate('Prescriptions', {
                patientId: userId || '',
                role: 'doctor',
              })
            }
          >
            <Text style={styles.prescriptionsLinkText}>Prescriptions</Text>
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
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{appointments.filter(a => a.status === 'pending').length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{appointments.filter(a => a.status === 'accepted').length}</Text>
            <Text style={styles.statLabel}>Accepted</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{appointments.filter(a => a.status === 'completed').length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {appointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No appointments yet</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
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
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  appointmentDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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
  reasonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#10b981',
  },
  declineButton: {
    backgroundColor: '#ef4444',
  },
  completeButton: {
    backgroundColor: '#6366f1',
    marginTop: 8,
  },
  prescriptionButton: {
    backgroundColor: '#667eea',
    marginTop: 8,
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
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
  },
  paymentSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  paymentInfoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  paymentPendingBadge: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  paymentPendingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b45309',
  },
  paymentDetail: {
    fontSize: 13,
    color: '#555',
    marginBottom: 3,
  },
  confirmPaymentButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  confirmPaymentText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  paymentConfirmedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 10,
  },
  paymentConfirmedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065f46',
  },
});
