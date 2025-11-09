import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth, db } from '../services/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, query, where, getDocs } from 'firebase/firestore';

// NOTE: If @react-native-community/datetimepicker is not installed, you need to install it.
// expo install @react-native-community/datetimepicker

export default function AppointmentScheduler({ route, navigation }) {
  const doctorId = route?.params?.doctorId || null;
  const fee = route?.params?.fee || 0;
  const doctor = route?.params?.doctor || {};
  const patientId = auth?.currentUser?.uid || null;

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [booking, setBooking] = useState(false);
  const [unavailableMsg, setUnavailableMsg] = useState('');
  
  // NEW: Commitment-based transactional flow
  const [step, setStep] = useState('selection'); // 'selection' | 'review'
  const [commitmentAgreed, setCommitmentAgreed] = useState(false);

  // Real availability with unified model and same-day past-time filtering.
  useEffect(() => {
    let mounted = true;
    const loadSlots = async () => {
      if (!doctorId) return;
      setLoadingSlots(true);
      try {
        // 1) Load doctor availability (prefer route param; fallback to users collection)
        let availabilityRaw = doctor?.availability;
        if (!availabilityRaw) {
          const ref = doc(db, 'users', doctorId);
          const snap = await getDoc(ref);
          availabilityRaw = snap.exists() ? snap.data().availability : null;
        }
        // 2) Map to per-day blocks for selected date
        const dayBlocks = buildDayBlocks(availabilityRaw, selectedDate);
        if (!dayBlocks || dayBlocks.length === 0) {
          if (mounted) {
            setTimeSlots([]);
            setSelectedSlot(null);
            setUnavailableMsg('Doctor is not available on this day.');
          }
          return;
        }
        // 3) Generate 30-min increments; filter out past times if booking same day
        const generated = [];
        const today = new Date();
        const sameDay = selectedDate.toDateString() === today.toDateString();
        const nowMinutes = today.getHours() * 60 + today.getMinutes();
        dayBlocks.forEach(block => {
          const [startH, startM] = String(block.start).split(':').map(Number);
          const [endH, endM] = String(block.end).split(':').map(Number);
          let startMinutes = startH * 60 + startM;
          const endMinutes = endH * 60 + endM;
          if (sameDay && nowMinutes >= endMinutes) return; // entire block in the past
          if (sameDay && nowMinutes > startMinutes) startMinutes = nowMinutes; // move start forward
          for (let m = startMinutes; m < endMinutes; m += 30) {
            const h = Math.floor(m / 60).toString().padStart(2, '0');
            const mm = (m % 60).toString().padStart(2, '0');
            generated.push(`${h}:${mm}`);
          }
        });
        // 3. Fetch existing appointments for this doctor+date that are pending or confirmed
        const apptQ = query(
          collection(db,'appointments'),
          where('doctorId','==',doctorId),
          where('date','==', selectedDate.toISOString().split('T')[0])
        );
        const apptSnap = await getDocs(apptQ);
        const occupied = new Set();
        apptSnap.forEach(d => {
          const data = d.data();
          if (['pending','confirmed'].includes(data.status) && data.timeSlot) {
            occupied.add(data.timeSlot);
          }
        });
        const free = generated.filter(slot => !occupied.has(slot));
        if (mounted) {
          setTimeSlots(free);
          setSelectedSlot(null);
          setUnavailableMsg(free.length === 0 ? 'No available slots for the selected day/time.' : '');
        }
      } catch (e) {
        console.error('Availability load failed', e);
        if (mounted) {
          setTimeSlots([]);
          setSelectedSlot(null);
          setUnavailableMsg('Unable to load availability.');
        }
      } finally {
        if (mounted) setLoadingSlots(false);
      }
    };
    loadSlots();
    return () => { mounted = false; };
  }, [doctorId, selectedDate, doctor]);

  // Map stored availability to per-day blocks for the selected date
  // Supports:
  //  - Object { startTime, endTime, days: ['Monday', ...] }
  //  - Array  [ { day: 'Mon'|'Monday', start: '09:00', end: '17:00' }, ... ]
  function buildDayBlocks(availability, date) {
    if (!availability) return [];
    const fullNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const abbr = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const idx = date.getDay();
    const dayFull = fullNames[idx];
    const dayAbbr = abbr[idx];

    // Object model
    if (availability && typeof availability === 'object' && !Array.isArray(availability)) {
      const { startTime, endTime, days } = availability || {};
      const list = Array.isArray(days) ? days : [];
      const hasDay = list.includes(dayFull) || list.includes(dayAbbr);
      if (!hasDay || !isValidTime(startTime) || !isValidTime(endTime)) return [];
      return [{ day: dayFull, start: startTime, end: endTime }];
    }

    // Array model
    if (Array.isArray(availability)) {
      const blocks = availability.filter(b => {
        const d = b?.day;
        if (!d) return false;
        return d === dayFull || d === dayAbbr;
      });
      return blocks.filter(b => isValidTime(b?.start) && isValidTime(b?.end));
    }
    return [];
  }

  function isValidTime(t) {
    if (typeof t !== 'string') return false;
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(t.trim());
  }

  const onDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      if (d < new Date().setHours(0, 0, 0, 0)) {
        Alert.alert('Invalid Date', 'Please select a future date.');
        return;
      }
      setSelectedDate(d);
    }
  };

  // NEW: Navigation to review step
  const proceedToReview = () => {
    if (!patientId) {
      Alert.alert('Error', 'You must be logged in to book an appointment.');
      return;
    }
    if (!doctorId || !selectedSlot) {
      Alert.alert('Missing Info', 'Please select a date and a time slot.');
      return;
    }
    // Move to review step
    setStep('review');
    setCommitmentAgreed(false); // Reset checkbox when entering review
  };

  // UPDATED: Booking logic with commitment_pending status
  const confirmBooking = async () => {
    if (!commitmentAgreed) {
      Alert.alert('Commitment Required', 'Please agree to pay the consultation fee to proceed.');
      return;
    }
    try {
      setBooking(true);
      const appointmentsRef = collection(db, 'appointments');
      const appointment = {
        patientId,
        doctorId,
        date: selectedDate.toISOString().split('T')[0], // yyyy-mm-dd
        timeSlot: selectedSlot,
        // Back-compat fields for existing UI
        time: selectedSlot,
        doctorName: doctor?.fullName || null,
        fee,
        // NEW: Use 'commitment_pending' status to indicate patient has committed to payment
        status: 'commitment_pending',
        createdAt: serverTimestamp(),
      };
      await addDoc(appointmentsRef, appointment);
      Alert.alert('Success', 'Appointment request submitted. Awaiting doctor confirmation.');
      navigation.navigate('PatientDashboard');
    } catch (e) {
      console.error('Failed to book appointment', e);
      Alert.alert('Error', 'Failed to book appointment.');
    } finally {
      setBooking(false);
    }
  };

  // NEW: Go back from review to selection
  const goBackToSelection = () => {
    setStep('selection');
    setCommitmentAgreed(false);
  };

  const renderSlot = ({ item }) => {
    const selected = item === selectedSlot;
    return (
      <TouchableOpacity
        style={[styles.slot, selected && styles.slotSelected]}
        onPress={() => setSelectedSlot(item)}
      >
        <Text style={[styles.slotText, selected && styles.slotTextSelected]}>{item}</Text>
      </TouchableOpacity>
    );
  };

  // STEP 1: Selection (Date, Time, Slot Selection)
  if (step === 'selection') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Schedule Appointment</Text>
        <Text style={styles.doctorName}>{doctor?.fullName || 'Doctor'}</Text>
        <Text style={styles.fee}>Consultation Fee: ${fee} / hour</Text>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>Date: {selectedDate.toDateString()}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        <Text style={styles.sectionTitle}>Available Time Slots</Text>
        {loadingSlots ? (
          <Text style={styles.loadingText}>Loading slots...</Text>
        ) : timeSlots.length === 0 ? (
          <Text style={styles.loadingText}>{unavailableMsg || 'No available slots.'}</Text>
        ) : (
          <FlatList
            data={timeSlots}
            keyExtractor={(i) => i}
            renderItem={renderSlot}
            numColumns={3}
            columnWrapperStyle={styles.slotRow}
            contentContainerStyle={styles.slotList}
          />
        )}

        <TouchableOpacity
          style={[styles.confirmButton, (!selectedSlot) && styles.confirmButtonDisabled]}
          disabled={!selectedSlot}
          onPress={proceedToReview}
        >
          <Text style={styles.confirmButtonText}>
            Next: Review & Commit
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // STEP 2: Review & Commitment (Invoice Summary + Commitment Checkbox)
  if (step === 'review') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Review & Commitment</Text>
        
        {/* Invoice Summary Card */}
        <View style={styles.invoiceCard}>
          <Text style={styles.invoiceTitle}>Appointment Details</Text>
          
          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabel}>Doctor:</Text>
            <Text style={styles.invoiceValue}>{doctor?.fullName || 'N/A'}</Text>
          </View>
          
          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabel}>Date:</Text>
            <Text style={styles.invoiceValue}>{selectedDate.toDateString()}</Text>
          </View>
          
          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabel}>Time Slot:</Text>
            <Text style={styles.invoiceValue}>{selectedSlot}</Text>
          </View>
          
          <View style={styles.invoiceDivider} />
          
          <View style={styles.invoiceRow}>
            <Text style={styles.feeLabel}>Consultation Fee:</Text>
            <Text style={styles.feeValue}>${fee.toFixed(2)}</Text>
          </View>
          
          <Text style={styles.invoiceNote}>
            This fee will be charged upon confirmation by the doctor.
          </Text>
        </View>

        {/* Commitment Checkbox */}
        <View style={styles.commitmentContainer}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setCommitmentAgreed(!commitmentAgreed)}
          >
            <View style={[styles.checkbox, commitmentAgreed && styles.checkboxChecked]}>
              {commitmentAgreed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.commitmentText}>
              I agree to pay the full consultation fee of ${fee.toFixed(2)} upon confirmation by the doctor.
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={goBackToSelection}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.confirmButton, (!commitmentAgreed || booking) && styles.confirmButtonDisabled]}
            disabled={!commitmentAgreed || booking}
            onPress={confirmBooking}
          >
            <Text style={styles.confirmButtonText}>
              {booking ? 'Confirming...' : 'Confirm Booking'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Fallback
  return <View style={styles.container}><Text>Unknown step</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  doctorName: { fontSize: 18, fontWeight: '600', color: '#2563eb', marginBottom: 4 },
  fee: { fontSize: 16, color: '#555', marginBottom: 20 },
  dateButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  dateButtonText: { color: '#fff', fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 10 },
  loadingText: { color: '#666', marginVertical: 20 },
  slotList: { paddingBottom: 20 },
  slotRow: { justifyContent: 'space-between', marginBottom: 10 },
  slot: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 4,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  slotSelected: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  slotText: { color: '#333', fontWeight: '500' },
  slotTextSelected: { color: '#fff' },
  confirmButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 'auto',
  },
  confirmButtonDisabled: { opacity: 0.6 },
  confirmButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  // NEW: Invoice Review Styles
  invoiceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  invoiceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  invoiceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  invoiceDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  feeLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  feeValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10b981',
  },
  invoiceNote: {
    fontSize: 12,
    color: '#888',
    marginTop: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // NEW: Commitment Checkbox Styles
  commitmentContainer: {
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#fff',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  commitmentText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    lineHeight: 20,
  },

  // NEW: Button Row for Back & Confirm
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#333',
    fontWeight: '700',
    fontSize: 16,
  },
});
