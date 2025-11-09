import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';

// DoctorProfileDetail expects full doctor object in route.params.doctor
export default function DoctorProfileDetail({ route, navigation }) {
  const doctor = route?.params?.doctor || {};

  const {
    fullName = 'Unknown Doctor',
    specialty = 'Specialty not specified',
    photoURL = '',
    rating = 4.7, // assumed placeholder
    reviewsCount = 25, // assumed placeholder
    bio = 'Experience details not provided.',
    education = 'Education and certifications not listed.',
  } = doctor;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          {photoURL ? (
            <Image source={{ uri: photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarPlaceholderText}>DR</Text>
            </View>
          )}
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.specialty}>{specialty}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingText}>⭐ {rating.toFixed(1)} / 5.0</Text>
            <Text style={styles.reviewCount}>({reviewsCount} Reviews)</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.sectionBody}>{bio}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education & Certifications</Text>
          <Text style={styles.sectionBody}>{education}</Text>
        </View>
      </ScrollView>

      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[styles.actionButton, styles.messageButton]}
          onPress={() =>
            navigation.navigate('SecureChat', {
              doctorId: doctor.id,
              patientId: doctor.patientId || null,
              doctor,
            })
          }
        >
          <Text style={styles.actionButtonText}>Message Doctor</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.bookNowButton]}
          onPress={() =>
            navigation.navigate('AppointmentScheduler', {
              doctorId: doctor.id,
              fee: Number(doctor.consultationFee || 0),
              doctor,
            })
          }
        >
          <Text style={styles.actionButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e5e7eb',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    color: '#9ca3af',
    fontWeight: '700',
    fontSize: 28,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  specialty: {
    fontSize: 18,
    color: '#2563eb',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  sectionBody: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
  },
  actionBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  messageButton: {
    backgroundColor: '#4b5563',
  },
  bookNowButton: {
    backgroundColor: '#2563eb',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
