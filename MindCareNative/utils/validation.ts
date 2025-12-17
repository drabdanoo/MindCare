export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }
  
  return { isValid: true };
};

export const validatePhone = (phone: string): ValidationResult => {
  const phoneRegex = /^\d{10,15}$/;
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  if (!phoneRegex.test(digitsOnly)) {
    return { isValid: false, error: 'Phone must be 10-15 digits' };
  }
  
  return { isValid: true };
};

export const validateFullName = (name: string): ValidationResult => {
  if (!name) {
    return { isValid: false, error: 'Full name is required' };
  }
  
  if (name.length < 3) {
    return { isValid: false, error: 'Name must be at least 3 characters' };
  }
  
  if (name.length > 100) {
    return { isValid: false, error: 'Name must be less than 100 characters' };
  }
  
  return { isValid: true };
};
