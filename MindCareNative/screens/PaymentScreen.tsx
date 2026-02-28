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
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AppStackParamList } from '../navigation/AppNavigator';
import { PAYMENT_CONFIG, WalletOption } from '../config/paymentConfig';
import { showErrorToast, showSuccessToast } from '../utils/toast';

type NavigationProp = NativeStackNavigationProp<AppStackParamList, 'PaymentScreen'>;
type RouteProps = RouteProp<AppStackParamList, 'PaymentScreen'>;

interface Props {
    navigation: NavigationProp;
    route: RouteProps;
}

export default function PaymentScreen({ navigation, route }: Props) {
    const { appointmentId, doctorName, date, time } = route.params;
    const { sessionFee, currencySymbol, wallets } = PAYMENT_CONFIG;

    const [selectedWallet, setSelectedWallet] = useState<WalletOption>(wallets[0]);
    const [transferNote, setTransferNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!transferNote.trim()) {
            Alert.alert('Required', 'Please enter your transfer reference (name or phone number you used).');
            return;
        }

        setSubmitting(true);
        try {
            await updateDoc(doc(db, 'appointments', appointmentId), {
                paymentStatus: 'pending_verification',
                paymentMethod: selectedWallet.id,
                paymentMethodName: selectedWallet.name,
                paymentNote: transferNote.trim(),
                paymentSubmittedAt: new Date(),
            });

            showSuccessToast('Payment submitted! Waiting for confirmation.');
            navigation.goBack();
        } catch (error) {
            console.error('Error submitting payment:', error);
            showErrorToast('Failed to submit payment. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Complete Payment</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.closeButton}>Close</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* Appointment Summary */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Appointment Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Doctor</Text>
                        <Text style={styles.summaryValue}>{doctorName}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Date</Text>
                        <Text style={styles.summaryValue}>{date}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Time</Text>
                        <Text style={styles.summaryValue}>{time}</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total Due</Text>
                        <Text style={styles.totalAmount}>{currencySymbol}{sessionFee}</Text>
                    </View>
                </View>

                {/* Instructions */}
                <Text style={styles.sectionTitle}>How to Pay</Text>
                <View style={styles.stepsCard}>
                    <Text style={styles.step}>1. Select a wallet below</Text>
                    <Text style={styles.step}>2. Transfer {currencySymbol}{sessionFee} to the number shown</Text>
                    <Text style={styles.step}>3. Use your name or phone as the transfer reference</Text>
                    <Text style={styles.step}>4. Enter that reference below and tap "I've Paid"</Text>
                </View>

                {/* Wallet Selection */}
                <Text style={styles.sectionTitle}>Select Payment Method</Text>
                {wallets.map((wallet) => (
                    <TouchableOpacity
                        key={wallet.id}
                        style={[
                            styles.walletCard,
                            selectedWallet.id === wallet.id && styles.walletCardSelected,
                        ]}
                        onPress={() => setSelectedWallet(wallet)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.walletHeader}>
                            <View style={styles.walletRadio}>
                                {selectedWallet.id === wallet.id && (
                                    <View style={styles.walletRadioInner} />
                                )}
                            </View>
                            <Text style={[
                                styles.walletName,
                                selectedWallet.id === wallet.id && styles.walletNameSelected,
                            ]}>
                                {wallet.name}
                            </Text>
                        </View>

                        {selectedWallet.id === wallet.id && (
                            <View style={styles.walletDetails}>
                                <View style={styles.walletNumberBox}>
                                    <Text style={styles.walletNumberLabel}>Transfer to:</Text>
                                    <Text style={styles.walletNumber}>{wallet.number}</Text>
                                </View>
                                <Text style={styles.walletInstructions}>{wallet.instructions}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}

                {/* Transfer Reference Input */}
                <Text style={styles.sectionTitle}>Your Transfer Reference</Text>
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                        Enter the name or phone number you used when sending the transfer
                    </Text>
                    <TextInput
                        style={styles.input}
                        value={transferNote}
                        onChangeText={setTransferNote}
                        placeholder="e.g. Ahmed Ali  or  0770-123-4567"
                        placeholderTextColor="#aaa"
                    />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>I've Completed the Transfer</Text>
                    )}
                </TouchableOpacity>

                <Text style={styles.disclaimer}>
                    Your appointment will be confirmed once the clinic verifies the transfer (usually within a few hours).
                </Text>

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
        color: '#667eea',
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    summaryCard: {
        backgroundColor: '#667eea',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    summaryTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    summaryValue: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.3)',
        marginTop: 8,
        paddingTop: 12,
        marginBottom: 0,
    },
    totalLabel: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
    totalAmount: {
        fontSize: 22,
        color: '#fff',
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#444',
        marginBottom: 10,
        marginTop: 4,
    },
    stepsCard: {
        backgroundColor: '#EEF2FF',
        borderRadius: 10,
        padding: 14,
        marginBottom: 20,
        gap: 6,
    },
    step: {
        fontSize: 14,
        color: '#444',
        lineHeight: 22,
    },
    walletCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#e5e7eb',
        padding: 14,
        marginBottom: 10,
    },
    walletCardSelected: {
        borderColor: '#667eea',
        backgroundColor: '#fafbff',
    },
    walletHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    walletRadio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#667eea',
        justifyContent: 'center',
        alignItems: 'center',
    },
    walletRadioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#667eea',
    },
    walletName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    walletNameSelected: {
        color: '#667eea',
    },
    walletDetails: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    walletNumberBox: {
        backgroundColor: '#f0f4ff',
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
    },
    walletNumberLabel: {
        fontSize: 12,
        color: '#667eea',
        fontWeight: '600',
        marginBottom: 2,
    },
    walletNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        letterSpacing: 0.5,
    },
    walletInstructions: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
        lineHeight: 18,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 14,
        fontSize: 16,
        color: '#333',
    },
    submitButton: {
        backgroundColor: '#667eea',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 14,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disclaimer: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        lineHeight: 18,
    },
});
