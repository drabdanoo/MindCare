import { z } from 'zod';

/**
 * Zod schema for appointment creation validation
 * Enforces data integrity and sanitization for all appointment inputs
 * MIGRATED FROM WEB APP - ZERO MODIFICATIONS REQUIRED
 */
export const appointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  
  doctorId: z.string().min(1, 'Doctor ID is required'),
  
  patientName: z.string()
    .trim()
    .min(3, 'Patient name must be at least 3 characters')
    .max(50, 'Patient name must not exceed 50 characters'),
  
  date: z.string().regex(
    /^\d{4}-\d{2}-\d{2}$/,
    'Date must be in YYYY-MM-DD format'
  ),
  
  time: z.string().regex(
    /^([01]\d|2[0-3]):([0-5]\d)$/,
    'Time must be in HH:MM format (24-hour)'
  ),
  
  reason: z.string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must not exceed 500 characters'),
  
  status: z.enum(['pending', 'accepted', 'declined', 'completed', 'cancelled'])
    .default('pending'),
});

/**
 * Type inference from Zod schema for TypeScript autocomplete
 */
export type AppointmentInput = z.infer<typeof appointmentSchema>;

/**
 * Validate appointment data and return structured errors
 */
export const validateAppointment = (data: unknown) => {
  const result = appointmentSchema.safeParse(data);
  
  if (!result.success) {
    return {
      isValid: false,
      errors: result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    };
  }
  
  return {
    isValid: true,
    data: result.data,
  };
};
