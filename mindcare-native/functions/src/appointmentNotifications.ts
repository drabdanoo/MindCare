import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

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
export const onAppointmentStatusChange = functions
  .firestore
  .document('appointments/{appointmentId}')
  .onWrite(async (change, context) => {
    const appointmentId = context.params.appointmentId;

    // Get before/after snapshots
    const beforeData = change.before.exists ? change.before.data() : null;
    const afterData = change.after.exists ? change.after.data() : null;

    // If document was deleted, skip (rule prevents this, but be safe)
    if (!afterData) {
      console.log(`Appointment ${appointmentId} deleted; skipping notification.`);
      return;
    }

    // Extract key fields
    const {
      patientId,
      doctorId,
      date,
      timeSlot,
      status: newStatus,
    } = afterData;

    // Ensure required fields exist
    if (!patientId || !doctorId || !newStatus) {
      console.warn(`Appointment ${appointmentId} missing required fields; skipping.`);
      return;
    }

    // Determine if this is a new document or a status change
    const isNewDocument = !beforeData;
    const oldStatus = beforeData?.status || null;
    const statusChanged = newStatus !== oldStatus;

    // Only notify if document is new or status changed
    if (!isNewDocument && !statusChanged) {
      console.log(`Appointment ${appointmentId}: no status change; skipping.`);
      return;
    }

    console.log(
      `Appointment ${appointmentId}: ${oldStatus || 'NEW'} → ${newStatus}`
    );

    // Determine recipient and message based on status
    let recipientId: string | null = null;
    let recipientType: 'doctor' | 'patient' | null = null;
    let messageTitle = '';
    let messageBody = '';

    if (isNewDocument || newStatus === 'pending') {
      // New appointment → notify doctor
      recipientId = doctorId;
      recipientType = 'doctor';
      messageTitle = 'New Appointment Request';
      messageBody = `A patient has requested an appointment on ${date} at ${timeSlot}.`;
    } else if (newStatus === 'confirmed') {
      // Appointment confirmed → notify patient
      recipientId = patientId;
      recipientType = 'patient';
      messageTitle = 'Appointment Confirmed';
      messageBody = `Your appointment on ${date} at ${timeSlot} has been confirmed.`;
    } else if (newStatus === 'rejected') {
      // Appointment rejected → notify patient
      recipientId = patientId;
      recipientType = 'patient';
      messageTitle = 'Appointment Rejected';
      messageBody = `Your appointment request for ${date} at ${timeSlot} has been rejected.`;
    } else if (newStatus === 'cancelled') {
      // Appointment cancelled → notify the other party (if old status was confirmed)
      const otherParty = oldStatus === 'confirmed' ? 'doctor' : null;
      if (otherParty) {
        recipientId = doctorId;
        recipientType = 'doctor';
        messageTitle = 'Appointment Cancelled';
        messageBody = `Your appointment on ${date} at ${timeSlot} has been cancelled by the patient.`;
      }
    } else if (newStatus === 'completed') {
      // Appointment completed → notify patient
      recipientId = patientId;
      recipientType = 'patient';
      messageTitle = 'Appointment Completed';
      messageBody = `Your appointment on ${date} has been completed. Thank you for using Mindcare.`;
    }

    // If no recipient determined, skip
    if (!recipientId) {
      console.log(`No recipient determined for status: ${newStatus}`);
      return;
    }

    try {
      // Fetch recipient details (name, push token, etc.)
      const recipientSnap = await db.collection('users').doc(recipientId).get();
      const recipientData = recipientSnap.data();

      if (!recipientSnap.exists) {
        console.warn(`Recipient ${recipientId} not found in users collection.`);
        return;
      }

      const recipientName = recipientData?.fullName || 'User';

      // Type guard: ensure recipientType is not null
      if (!recipientType) {
        console.log(`No recipient type determined; skipping dispatch.`);
        return;
      }

      // Dispatch notification
      await dispatchNotification({
        recipientId,
        recipientType,
        recipientName,
        messageTitle,
        messageBody,
        appointmentId,
        appointmentData: afterData,
      });

      console.log(
        `✓ Notification queued for ${recipientType} (${recipientId}): "${messageTitle}"`
      );
    } catch (error) {
      console.error(`Failed to process appointment notification:`, error);
      // Silently fail to avoid retries; consider logging to a dead-letter collection
    }
  });

/**
 * Mock notification dispatch function
 * In production, this would integrate with:
 * - Expo Push Notifications (for mobile)
 * - SendGrid / Resend (for email)
 * - Firebase Cloud Messaging (FCM)
 * - In-app inbox (Firestore collection)
 */
async function dispatchNotification(payload: {
  recipientId: string;
  recipientType: 'doctor' | 'patient';
  recipientName: string;
  messageTitle: string;
  messageBody: string;
  appointmentId: string;
  appointmentData: any;
}): Promise<void> {
  const {
    recipientId,
    recipientType,
    recipientName,
    messageTitle,
    messageBody,
    appointmentId,
    appointmentData,
  } = payload;

  // Mock implementation: log to console
  console.log({
    event: 'NOTIFICATION_DISPATCHED',
    timestamp: new Date().toISOString(),
    recipient: {
      id: recipientId,
      type: recipientType,
      name: recipientName,
    },
    message: {
      title: messageTitle,
      body: messageBody,
    },
    appointment: {
      id: appointmentId,
      status: appointmentData.status,
      date: appointmentData.date,
      timeSlot: appointmentData.timeSlot,
    },
    nextSteps: 'Integrate with Expo Push, Email, or FCM service',
  });

  // Write to notifications collection for in-app inbox
  const notificationRef = db.collection('notifications').doc();
  await notificationRef.set({
    recipientId,
    recipientType,
    title: messageTitle,
    body: messageBody,
    appointmentId,
    status: 'unread',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`✓ Notification document written to collection for ${recipientId}`);
}
