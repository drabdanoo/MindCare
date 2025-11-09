import * as functions from 'firebase-functions';
/**
 * Cloud Function: onAppointmentStatusChange
 *
 * Triggered on write to the appointments collection.
 * Detects status changes and sends notifications:
 * - 'pending': Notify doctor of new booking
 * - 'confirmed'/'rejected': Notify patient of decision
 * - 'completed': Optionally notify patient
 * - 'cancelled': Notify the other party
 */
export declare const onAppointmentStatusChange: functions.CloudFunction<functions.Change<functions.firestore.DocumentSnapshot>>;
