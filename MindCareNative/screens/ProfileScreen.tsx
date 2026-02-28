import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { AppStackParamList } from '../navigation/AppNavigator';
import { showErrorToast, showSuccessToast } from '../utils/toast';
import { captureException } from '../config/sentry';

type NavigationProp = NativeStackNavigationProp<AppStackParamList, 'Profile'>;
type RouteProps = RouteProp<AppStackParamList, 'Profile'>;

interface Props {
    navigation: NavigationProp;
    route: RouteProps;
}

interface UserProfile {
    fullName: string;
    email: string;
    role: 'patient' | 'doctor';
    phone: string;
    specialization: string;
    bio: string;
    createdAt: string;
}

export default function ProfileScreen({ navigation }: Props) {
    const userId = auth.currentUser?.uid;

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Editable fields
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [bio, setBio] = useState('');

    useEffect(() => {
        if (!userId) return;

        const fetchProfile = async () => {
            try {
                const snap = await getDoc(doc(db, 'users', userId));
                if (snap.exists()) {
                    const data = snap.data() as UserProfile;
                    setProfile(data);
                    setFullName(data.fullName || data.name || '');
                    setPhone(data.phone || '');
                    setSpecialization(data.specialization || '');
                    setBio(data.bio || '');
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                captureException(error);
                showErrorToast('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    const handleSave = async () => {
        if (!fullName.trim()) {
            Alert.alert('Required', 'Full name cannot be empty.');
            return;
        }
        if (!userId) return;

        setSaving(true);
        try {
            await updateDoc(doc(db, 'users', userId), {
                fullName: fullName.trim(),
                name: fullName.trim(),
                phone: phone.trim(),
                ...(profile?.role === 'doctor' && {
                    specialization: specialization.trim(),
                    bio: bio.trim(),
                }),
            });

            showSuccessToast('Profile updated successfully.');
            navigation.goBack();
        } catch (error) {
            console.error('Error updating profile:', error);
            captureException(error);
            showErrorToast('Failed to save profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    };

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
                <Text style={styles.headerTitle}>My Profile</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* Avatar */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{getInitials(fullName || 'U')}</Text>
                    </View>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>
                            {profile?.role === 'doctor' ? 'Doctor' : 'Patient'}
                        </Text>
                    </View>
                </View>

                {/* Read-only info */}
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{profile?.email || auth.currentUser?.email}</Text>
                    </View>
                    {profile?.createdAt && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Member since</Text>
                            <Text style={styles.infoValue}>{formatDate(profile.createdAt)}</Text>
                        </View>
                    )}
                </View>

                {/* Editable fields */}
                <Text style={styles.sectionTitle}>Edit Profile</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Your full name"
                        placeholderTextColor="#aaa"
                        autoCapitalize="words"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        style={styles.input}
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="+964 770 000 0000"
                        placeholderTextColor="#aaa"
                        keyboardType="phone-pad"
                    />
                </View>

                {/* Doctor-only fields */}
                {profile?.role === 'doctor' && (
                    <>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Specialization</Text>
                            <TextInput
                                style={styles.input}
                                value={specialization}
                                onChangeText={setSpecialization}
                                placeholder="e.g. Clinical Psychology, Psychiatry"
                                placeholderTextColor="#aaa"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Bio (shown to patients)</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={bio}
                                onChangeText={setBio}
                                placeholder="Brief description of your experience and approach..."
                                placeholderTextColor="#aaa"
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                    </>
                )}

                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Changes</Text>
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
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    content: {
        flex: 1,
        padding: 16,
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: '#667eea',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    avatarText: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
    },
    roleBadge: {
        backgroundColor: '#EEF2FF',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 6,
    },
    roleText: {
        color: '#667eea',
        fontWeight: '700',
        fontSize: 14,
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 1,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    infoLabel: {
        fontSize: 14,
        color: '#888',
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
        maxWidth: '60%',
        textAlign: 'right',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#444',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputGroup: {
        marginBottom: 14,
    },
    label: {
        fontSize: 13,
        color: '#555',
        fontWeight: '600',
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 13,
        fontSize: 15,
        color: '#333',
    },
    textArea: {
        height: 100,
    },
    saveButton: {
        backgroundColor: '#667eea',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
