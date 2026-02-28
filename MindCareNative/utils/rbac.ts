/**
 * Role-Based Access Control (RBAC) Utilities
 * MIGRATED FROM WEB APP - ZERO MODIFICATIONS REQUIRED
 * Pure JavaScript logic with no DOM dependencies
 */

export type UserRole = 'patient' | 'doctor' | 'admin';

/**
 * Check if user role is authorized for a specific action
 * @param userRole - Current user's role
 * @param requiredRole - Role(s) required for the action
 * @returns true if authorized, false otherwise
 */
export const isAuthorized = (
  userRole: UserRole | null | undefined,
  requiredRole: UserRole | UserRole[]
): boolean => {
  if (!userRole) return false;
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  
  return userRole === requiredRole;
};

/**
 * Check if user can view appointment details
 * @param userRole - Current user's role
 * @returns true if authorized
 */
export const canViewAppointmentDetails = (userRole: UserRole | null): boolean => {
  const allowedRoles: UserRole[] = ['doctor', 'patient', 'admin'];
  return allowedRoles.includes(userRole as UserRole);
};

/**
 * Check if user can access doctor dashboard
 * @param userRole - Current user's role
 * @returns true if authorized
 */
export const canAccessDoctorDashboard = (userRole: UserRole | null): boolean => {
  return userRole === 'doctor' || userRole === 'admin';
};

/**
 * Check if user can create prescriptions
 * @param userRole - Current user's role
 * @returns true if authorized
 */
export const canCreatePrescription = (userRole: UserRole | null): boolean => {
  return userRole === 'doctor';
};

/**
 * Check if user can modify appointment status
 * @param userRole - Current user's role
 * @param appointmentOwnerId - User ID who owns the appointment
 * @param currentUserId - Current logged-in user ID
 * @returns true if authorized
 */
export const canModifyAppointmentStatus = (
  userRole: UserRole | null,
  appointmentOwnerId: string,
  currentUserId: string
): boolean => {
  if (userRole === 'admin') return true;
  if (userRole === 'doctor') return true;
  if (userRole === 'patient' && appointmentOwnerId === currentUserId) return true;
  return false;
};

/**
 * Check if user can view prescriptions
 * @param userRole - Current user's role
 * @param prescriptionPatientId - Patient ID from prescription
 * @param prescriptionDoctorId - Doctor ID from prescription
 * @param currentUserId - Current logged-in user ID
 * @returns true if authorized
 */
export const canViewPrescription = (
  userRole: UserRole | null,
  prescriptionPatientId: string,
  prescriptionDoctorId: string,
  currentUserId: string
): boolean => {
  if (userRole === 'admin') return true;
  if (userRole === 'doctor' && prescriptionDoctorId === currentUserId) return true;
  if (userRole === 'patient' && prescriptionPatientId === currentUserId) return true;
  return false;
};

/**
 * Get user role display name
 * @param role - User role
 * @returns Formatted role name
 */
export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    patient: 'Patient',
    doctor: 'Doctor',
    admin: 'Administrator',
  };
  return roleNames[role];
};

/**
 * Check if role is valid
 * @param role - Role to validate
 * @returns true if valid role
 */
export const isValidRole = (role: string): role is UserRole => {
  return ['patient', 'doctor', 'admin'].includes(role);
};
