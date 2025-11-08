/**
 * Email validation function
 * @param {string} email - Email to validate
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Password validation function
 * @param {string} password - Password to validate
 * @returns {object} { isValid: boolean, error: string }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long' };
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }
  
  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Phone number validation function
 * @param {string} phone - Phone number to validate
 * @returns {object} { isValid: boolean, error: string }
 */
export const validatePhone = (phone) => {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  // Basic phone validation - at least 10 digits
  const phoneDigits = phone.replace(/\D/g, '');
  
  if (phoneDigits.length < 10) {
    return { isValid: false, error: 'Phone number must contain at least 10 digits' };
  }
  
  if (phoneDigits.length > 15) {
    return { isValid: false, error: 'Phone number is too long' };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Full name validation function
 * @param {string} fullName - Full name to validate
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateFullName = (fullName) => {
  if (!fullName) {
    return { isValid: false, error: 'Full name is required' };
  }
  
  if (fullName.trim().length < 3) {
    return { isValid: false, error: 'Full name must be at least 3 characters long' };
  }
  
  if (fullName.length > 100) {
    return { isValid: false, error: 'Full name is too long' };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Validate login form
 * @param {object} formData - { email, password }
 * @returns {object} { isValid: boolean, errors: object }
 */
export const validateLoginForm = (formData) => {
  const errors = {};
  let isValid = true;
  
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
    isValid = false;
  }
  
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
    isValid = false;
  }
  
  return { isValid, errors };
};

/**
 * Validate registration form
 * @param {object} formData - { fullName, email, password, phone }
 * @returns {object} { isValid: boolean, errors: object }
 */
export const validateRegistrationForm = (formData) => {
  const errors = {};
  let isValid = true;
  
  const nameValidation = validateFullName(formData.fullName);
  if (!nameValidation.isValid) {
    errors.fullName = nameValidation.error;
    isValid = false;
  }
  
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
    isValid = false;
  }
  
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
    isValid = false;
  }
  
  const phoneValidation = validatePhone(formData.phone);
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.error;
    isValid = false;
  }
  
  return { isValid, errors };
};
