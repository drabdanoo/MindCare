import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { AppStackParamList } from '../navigation/AppNavigator';
import { showErrorToast, showSuccessToast } from '../utils/toast';

type NavigationProp = NativeStackNavigationProp<AppStackParamList, 'WritePrescription'>;
type RouteProps = RouteProp<AppStackParamList, 'WritePrescription'>;

interface Props {
    navigation: NavigationProp;
    route: RouteProps;
}

interface MedicationRow {
    name: string;
    dosage: string;
}

export default function WritePrescriptionScreen({ navigation, route }: Props) {
    const { appointmentId, patientId, patientName } = route.params;

    const [medications, setMedications] = useState<MedicationRow[]>([
        { name: '', dosage: '' },
    ]);
    const [instructions, setInstructions] = useState('');
    const [duration, setDuration] = useState('');
    const [refills, setRefills] = useState('0');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const addMedication = () => {
        if (medications.length >= 10) {
            Alert.alert('Limit reached', 'Maximum 10 medications per prescription.');
            return;
        }
        setMedications([...medications, { name: '', dosage: '' }]);
    };

    const removeMedication = (index: number) => {
        if (medications.length === 1) return;
        setMedications(medications.filter((_, i) => i !== index));
    };

    const updateMedication = (index: number, field: keyof MedicationRow, value: string) => {
        const updated = [...medications];
        updated[index][field] = value;
        setMedications(updated);
    };

    const validate = () => {
        for (const med of medications) {
            if (!med.name.trim()) {
                Alert.alert('Missing field', 'Please enter all medication names.');
                return false;
            }
            if (!med.dosage.trim()) {
                Alert.alert('Missing field', 'Please enter dosage for all medications.');
                return false;
            }
        }
        if (instructions.trim().length < 10) {
            Alert.alert('Too short', 'Instructions must be at least 10 characters.');
            return false;
        }
        if (instructions.trim().length > 1000) {
            Alert.alert('Too long', 'Instructions must be 1000 characters or less.');
            return false;
        }
        if (!duration.trim()) {
            Alert.alert('Missing field', 'Please enter the treatment duration.');
            return false;
        }
        if (duration.trim().length > 50) {
            Alert.alert('Too long', 'Duration must be 50 characters or less.');
            return false;
        }
        if (notes.trim().length > 500) {
            Alert.alert('Too long', 'Notes must be 500 characters or less.');
            return false;
        }
        const refillNum = parseInt(refills, 10);
        if (isNaN(refillNum) || refillNum < 0 || refillNum > 12) {
            Alert.alert('Invalid', 'Refills must be a number between 0 and 12.');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        if (!auth.currentUser) return;

        setSubmitting(true);
        try {
            await addDoc(collection(db, 'prescriptions'), {
                patientId,
                patientName,
                doctorId: auth.currentUser.uid,
                appointmentId,
                medicationName: medications.map(m => m.name.trim()),
                dosage: medications.map(m => m.dosage.trim()),
                instructions: instructions.trim(),
                duration: duration.trim(),
                refills: parseInt(refills, 10),
                notes: notes.trim() || null,
                status: 'active',
                createdAt: new Date(),
            });

            showSuccessToast('Prescription written successfully.');
            navigation.goBack();
        } catch (error) {
            console.error('Error writing prescription:', error);
            showErrorToast('Failed to save prescription. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Write Prescription</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.closeButton}>Cancel</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* Patient info */}
                <View style={styles.patientCard}>
                    <Text style={styles.patientLabel}>Patient</Text>
                    <Text style={styles.patientName}>{patientName}</Text>
                </View>

                {/* Medications */}
                <Text style={styles.sectionTitle}>Medications</Text>
                {medications.map((med, index) => (
                    <View key={index} style={styles.medicationRow}>
                        <View style={styles.medicationIndex}>
                            <Text style={styles.medicationIndexText}>{index + 1}</Text>
                        </View>
                        <View style={styles.medicationFields}>
                            <TextInput
                                style={styles.input}
                                placeholder="Medication name"
                                placeholderTextColor="#aaa"
                                value={med.name}
                                onChangeText={v => updateMedication(index, 'name', v)}
                            />
                            <TextInput
                                style={[styles.input, styles.inputTop]}
                                placeholder="Dosage (e.g. 500mg twice daily)"
                                placeholderTextColor="#aaa"
                                value={med.dosage}
                                onChangeText={v => updateMedication(index, 'dosage', v)}
                            />
                        </View>
                        {medications.length > 1 && (
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => removeMedication(index)}
                            >
                                <Text style={styles.removeButtonText}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ))}

                <TouchableOpacity style={styles.addMedButton} onPress={addMedication}>
                    <Text style={styles.addMedButtonText}>+ Add Medication</Text>
                </TouchableOpacity>

                {/* Instructions */}
                <Text style={styles.sectionTitle}>Instructions</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="General instructions for the patient (min 10 characters)..."
                    placeholderTextColor="#aaa"
                    value={instructions}
                    onChangeText={setInstructions}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    maxLength={1000}
                />

                {/* Duration & Refills */}
                <View style={styles.row}>
                    <View style={styles.halfField}>
                        <Text style={styles.sectionTitle}>Duration</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 7 days"
                            placeholderTextColor="#aaa"
                            value={duration}
                            onChangeText={setDuration}
                            maxLength={50}
                        />
                    </View>
                    <View style={styles.halfField}>
                        <Text style={styles.sectionTitle}>Refills</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0"
                            placeholderTextColor="#aaa"
                            value={refills}
                            onChangeText={setRefills}
                            keyboardType="numeric"
                            maxLength={2}
                        />
                    </View>
                </View>

                {/* Notes */}
                <Text style={styles.sectionTitle}>Notes (optional)</Text>
                <TextInput
                    style={[styles.input, styles.textAreaSmall]}
                    placeholder="Additional notes..."
                    placeholderTextColor="#aaa"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={2}
                    textAlignVertical="top"
                    maxLength={500}
                />

                {/* Submit */}
                <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Save Prescription</Text>
                    )}
                </TouchableOpacity>

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
        color: '#ef4444',
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    patientCard: {
        backgroundColor: '#667eea',
        borderRadius: 10,
        padding: 14,
        marginBottom: 20,
    },
    patientLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    patientName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#444',
        marginBottom: 8,
        marginTop: 4,
    },
    medicationRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
        gap: 8,
    },
    medicationIndex: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#667eea',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
    medicationIndexText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    medicationFields: {
        flex: 1,
        gap: 6,
    },
    removeButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#fee2e2',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    removeButtonText: {
        color: '#ef4444',
        fontSize: 12,
        fontWeight: 'bold',
    },
    addMedButton: {
        borderWidth: 1.5,
        borderColor: '#667eea',
        borderStyle: 'dashed',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    addMedButtonText: {
        color: '#667eea',
        fontWeight: '600',
        fontSize: 14,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        color: '#333',
    },
    inputTop: {
        marginTop: 6,
    },
    textArea: {
        height: 100,
        marginBottom: 16,
    },
    textAreaSmall: {
        height: 70,
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    halfField: {
        flex: 1,
    },
    submitButton: {
        backgroundColor: '#667eea',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
