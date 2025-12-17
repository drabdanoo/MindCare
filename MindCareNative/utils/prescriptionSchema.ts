import { z } from 'zod';

/**
 * Zod schema for prescription creation validation
 * Ensures data integrity for all prescription inputs
 * MIGRATED FROM WEB APP - ZERO MODIFICATIONS REQUIRED
 */
export const prescriptionSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  
  doctorId: z.string().min(1, 'Doctor ID is required'),
  
  appointmentId: z.string().min(1, 'Appointment ID is required'),
  
  // Medication arrays must have matching lengths
  medicationName: z.array(z.string().min(1, 'Medication name cannot be empty'))
    .min(1, 'At least one medication is required')
    .max(10, 'Maximum 10 medications per prescription'),
  
  dosage: z.array(z.string().min(1, 'Dosage cannot be empty'))
    .min(1, 'At least one dosage is required'),
  
  instructions: z.string()
    .min(10, 'Instructions must be at least 10 characters')
    .max(1000, 'Instructions must not exceed 1000 characters'),
  
  duration: z.string()
    .min(1, 'Duration is required')
    .max(50, 'Duration must not exceed 50 characters'),
  
  refills: z.number()
    .int('Refills must be a whole number')
    .min(0, 'Refills cannot be negative')
    .max(12, 'Maximum 12 refills allowed'),
  
  status: z.enum(['active', 'completed', 'cancelled'])
    .default('active'),
  
  pharmacyInstructions: z.string()
    .max(500, 'Pharmacy instructions must not exceed 500 characters')
    .optional(),
  
  notes: z.string()
    .max(1000, 'Notes must not exceed 1000 characters')
    .optional(),
}).refine(
  (data) => data.medicationName.length === data.dosage.length,
  {
    message: 'Number of medications must match number of dosages',
    path: ['dosage'],
  }
);

/**
 * Type inference from Zod schema
 */
export type PrescriptionInput = z.infer<typeof prescriptionSchema>;

/**
 * Validate prescription data and return structured errors
 */
export const validatePrescription = (data: unknown) => {
  const result = prescriptionSchema.safeParse(data);
  
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
