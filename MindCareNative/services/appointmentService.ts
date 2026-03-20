import { runTransaction, collection, query, where, getDocs, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface AppointmentData {
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    date: string; // YYYY-MM-DD (Legacy but kept for querying)
    time: string; // HH:MM (Legacy)
    utcTimestamp: string; // The source of truth for conflict checks
    reason: string;
    status: 'pending';
    createdAt: Date;
}

export const bookAppointmentWithTransaction = async (data: AppointmentData) => {
    try {
        await runTransaction(db, async (transaction) => {
            const appointmentsRef = collection(db, 'appointments');
            const q = query(
                appointmentsRef,
                where('doctorId', '==', data.doctorId),
                where('utcTimestamp', '==', data.utcTimestamp),
                where('status', 'in', ['pending', 'accepted'])
            );

            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                throw new Error('SLOT_OCCUPIED: This time slot is already booked.');
            }

            const newDocRef = doc(appointmentsRef);
            transaction.set(newDocRef, data);
        });
        console.log('Transaction successful!');
        return true;
    } catch (e: any) {
        console.error('Transaction failed: ', e);
        throw e;
    }
};
