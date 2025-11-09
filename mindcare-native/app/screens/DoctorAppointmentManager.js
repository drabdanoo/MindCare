import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { auth, db } from '../services/firebase';
import { collection, onSnapshot, query, updateDoc, where, doc, getDocs } from 'firebase/firestore';

export default function DoctorAppointmentManager({ navigation }) {
  const doctorId = auth?.currentUser?.uid || null;
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (!doctorId) {
      setLoading(false);
      return;
    }
    const qA = query(collection(db, 'appointments'), where('doctorId', '==', doctorId));
    const unsub = onSnapshot(qA, async (snap) => {
      try {
        const base = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Enrich with patient profiles (name, photo)
        const enriched = await enrichWithPatients(base);
        setAppointments(enriched);
      } catch (e) {
        console.error('Enrichment failed', e);
        setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } finally {
        setLoading(false);
      }
    }, (err) => {
      console.error('Failed to load appointments', err);
      setLoading(false);
      Alert.alert('Error', 'Failed to load appointments');
    });
    return unsub;
  }, [doctorId]);

  // Batch fetch patients in chunks of 10 using where('__name__','in', ids)
  const enrichWithPatients = async (appts) => {
    const ids = Array.from(new Set(appts.map(a => a.patientId).filter(Boolean)));
    if (ids.length === 0) return appts;
    const chunks = [];
    for (let i = 0; i < ids.length; i += 10) chunks.push(ids.slice(i, i + 10));
    const usersCol = collection(db, 'users');
    const maps = new Map();
    for (const chunk of chunks) {
      try {
        const qU = query(usersCol, where('__name__', 'in', chunk));
        const snap = await getDocs(qU);
        snap.forEach(d => maps.set(d.id, d.data()));
      } catch (e) {
        // Fallback: if 'in' fails (too many) we could do per-doc fetch, but we keep it simple here.
        console.warn('Batch users fetch failed for chunk; some names may be missing', e);
      }
    }
    return appts.map(a => ({
      ...a,
      _patient: maps.get(a.patientId) || null,
    }));
  };

  // Utility: derive two-letter initials from full name
  const getInitials = (fullName) => {
    if (!fullName || typeof fullName !== 'string') return 'PT';
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const first = parts[0][0] || '';
      const last = parts[parts.length - 1][0] || '';
      return (first + last).toUpperCase();
    }
    if (parts.length === 1) {
      const w = parts[0];
      return (w.slice(0, 2)).toUpperCase();
    }
    return 'PT';
  };

  const byStatus = useMemo(() => {
    const pending = [];
    const confirmed = [];
    const other = [];
    for (const a of appointments) {
      if (a.status === 'pending') pending.push(a);
      else if (a.status === 'confirmed') confirmed.push(a);
      else other.push(a);
    }
    return { pending, confirmed, other };
  }, [appointments]);

  const updateStatus = async (id, next) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status: next });
    } catch (e) {
      console.error('Update failed', e);
      Alert.alert('Error', `Failed to set status: ${next}`);
    }
  };

  const renderItem = ({ item }) => {
    const patient = item._patient || {};
    const name = patient.fullName || item.patientName || item.patientId || 'Unknown Patient';
    const photoURL = patient.photoURL;
    const initials = getInitials(name);
    return (
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={styles.patientRow}>
            {photoURL ? (
              <Image source={{ uri: photoURL }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <Text style={styles.patient}>{name}</Text>
          </View>
          <Text style={[styles.status, { color: getStatusColor(item.status) }]}>{item.status || 'pending'}</Text>
        </View>
        <Text style={styles.when}>{item.date || 'TBD'} at {item.time || item.timeSlot || 'TBD'}</Text>

        {item.status === 'pending' && (
          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.smallBtn, styles.confirmBtn]} onPress={() => updateStatus(item.id, 'confirmed')}>
              <Text style={styles.smallBtnText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.smallBtn, styles.rejectBtn]} onPress={() => updateStatus(item.id, 'rejected')}>
              <Text style={styles.smallBtnText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.containerCenter}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Appointment Manager</Text>

      <Text style={styles.bucketTitle}>Pending</Text>
      {byStatus.pending.length === 0 ? (
        <Text style={styles.empty}>No pending requests.</Text>
      ) : (
        <FlatList data={byStatus.pending} keyExtractor={i => i.id} renderItem={renderItem} />
      )}

      <Text style={styles.bucketTitle}>Confirmed</Text>
      {byStatus.confirmed.length === 0 ? (
        <Text style={styles.empty}>No confirmed appointments.</Text>
      ) : (
        <FlatList data={byStatus.confirmed} keyExtractor={i => i.id} renderItem={renderItem} />
      )}

      <Text style={styles.bucketTitle}>Rejected / Cancelled</Text>
      {byStatus.other.length === 0 ? (
        <Text style={styles.empty}>No rejected or cancelled.</Text>
      ) : (
        <FlatList data={byStatus.other} keyExtractor={i => i.id} renderItem={renderItem} />
      )}
    </View>
  );
}

function getStatusColor(status) {
  switch (status) {
    case 'confirmed': return '#10b981';
    case 'pending': return '#f59e0b';
    case 'rejected': return '#ef4444';
    case 'cancelled': return '#ef4444';
    default: return '#666';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  containerCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 12 },
  bucketTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 16, marginBottom: 8 },
  empty: { color: '#6b7280', fontStyle: 'italic' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  patientRow: { flexDirection: 'row', alignItems: 'center' },
  patient: { fontSize: 16, fontWeight: '600', color: '#111827' },
  when: { marginTop: 6, color: '#374151' },
  status: { fontWeight: '700', textTransform: 'capitalize' },
  actionsRow: { flexDirection: 'row', marginTop: 10 },
  smallBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginRight: 8 },
  confirmBtn: { backgroundColor: '#10b981' },
  rejectBtn: { backgroundColor: '#ef4444' },
  smallBtnText: { color: '#fff', fontWeight: '700' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e5e7eb', marginRight: 10 },
  avatarPlaceholder: { justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  avatarText: { color: '#9ca3af', fontWeight: '700', fontSize: 12 },
});
