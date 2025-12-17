import { z } from 'zod';

/**
 * Zod schema for appointment creation validation
 * Enforces data integrity and sanitization for all appointment inputs
 */
export const appointmentSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  
  patientName: z.string()
    .trim()
    .min(3, 'Patient name must be at least 3 characters')
    .max(50, 'Patient name must not exceed 50 characters'),
  
  dateTime: z.date({
    required_error: 'Appointment date and time is required',
    invalid_type_error: 'Invalid date format',
  }),
  
  reason: z.string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must not exceed 500 characters'),
});

/**
 * Type inference from Zod schema for TypeScript-like autocomplete
 */
export type AppointmentInput = z.infer<typeof appointmentSchema>;
