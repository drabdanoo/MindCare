import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { AppStackParamList } from '../navigation/AppNavigator';
import { showErrorToast } from '../utils/toast';
import { captureException } from '../config/sentry';

type NavigationProp = NativeStackNavigationProp<AppStackParamList, 'Prescriptions'>;
type RouteProps = RouteProp<AppStackParamList, 'Prescriptions'>;

interface Props {
    navigation: NavigationProp;
    route: RouteProps;
}

interface Prescription {
    id: string;
    patientId: string;
    doctorId: string;
    appointmentId: string;
    medicationName: string[];
    dosage: string[];
    instructions: string;
    duration: string;
    refills: number;
    notes?: string;
    status: 'active' | 'completed' | 'cancelled';
    createdAt: any;
}

export default function PrescriptionsScreen({ navigation, route }: Props) {
    const { patientId, role } = route.params;
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        // Doctors see prescriptions they wrote; patients see their own
        const field = role === 'doctor' ? 'doctorId' : 'patientId';
        const id = role === 'doctor' ? userId : patientId;

        const q = query(
            collection(db, 'prescriptions'),
            where(field, '==', id),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const list = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Prescription[];
                setPrescriptions(list);
                setLoading(false);
                setRefreshing(false);
            },
            (error) => {
                console.error('Error fetching prescriptions:', error);
                captureException(error);
                showErrorToast('Failed to load prescriptions');
                setLoading(false);
                setRefreshing(false);
            }
        );

        return () => unsubscribe();
    }, [patientId, role]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return '#10b981';
            case 'completed': return '#6366f1';
            case 'cancelled': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const formatDate = (createdAt: any) => {
        if (!createdAt) return '';
        const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const renderPrescription = ({ item }: { item: Prescription }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
            </View>

            {/* Medications */}
            <Text style={styles.sectionLabel}>Medications</Text>
            {item.medicationName.map((name, index) => (
                <View key={index} style={styles.medicationItem}>
                    <View style={styles.medDot} />
                    <View style={styles.medInfo}>
                        <Text style={styles.medName}>{name}</Text>
                        <Text style={styles.medDosage}>{item.dosage[index]}</Text>
                    </View>
                </View>
            ))}

            {/* Instructions */}
            <Text style={styles.sectionLabel}>Instructions</Text>
            <Text style={styles.instructionsText}>{item.instructions}</Text>

            {/* Duration & Refills */}
            <View style={styles.metaRow}>
                <View style={styles.metaChip}>
                    <Text style={styles.metaLabel}>Duration</Text>
                    <Text style={styles.metaValue}>{item.duration}</Text>
                </View>
                <View style={styles.metaChip}>
                    <Text style={styles.metaLabel}>Refills</Text>
                    <Text style={styles.metaValue}>{item.refills}</Text>
                </View>
            </View>

            {/* Notes */}
            {item.notes ? (
                <>
                    <Text style={styles.sectionLabel}>Notes</Text>
                    <Text style={styles.notesText}>{item.notes}</Text>
                </>
            ) : null}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#667eea" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {role === 'doctor' ? 'Prescriptions Written' : 'My Prescriptions'}
                </Text>
                <View style={{ width: 60 }} />
            </View>

            {prescriptions.length === 0 ? (
                <View style={styles.centered}>
                    <Text style={styles.emptyText}>No prescriptions yet</Text>
                    <Text style={styles.emptySubtext}>
                        {role === 'doctor'
                            ? 'Write a prescription from a completed appointment'
                            : 'Your prescriptions will appear here after a consultation'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={prescriptions}
                    renderItem={renderPrescription}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => setRefreshing(true)}
                            colors={['#667eea']}
                        />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
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
    backButton: {
        color: '#667eea',
        fontSize: 16,
        fontWeight: '600',
        width: 60,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#333',
    },
    listContent: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    cardDate: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 10,
    },
    statusText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#667eea',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 6,
        marginTop: 12,
    },
    medicationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 6,
        gap: 8,
    },
    medDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#667eea',
        marginTop: 5,
    },
    medInfo: {
        flex: 1,
    },
    medName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    medDosage: {
        fontSize: 13,
        color: '#666',
        marginTop: 1,
    },
    instructionsText: {
        fontSize: 14,
        color: '#444',
        lineHeight: 20,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 14,
    },
    metaChip: {
        flex: 1,
        backgroundColor: '#f0f4ff',
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
    },
    metaLabel: {
        fontSize: 11,
        color: '#667eea',
        fontWeight: '600',
        marginBottom: 2,
    },
    metaValue: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
    },
    notesText: {
        fontSize: 13,
        color: '#666',
        fontStyle: 'italic',
        lineHeight: 18,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        lineHeight: 20,
    },
});
