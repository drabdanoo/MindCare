import Toast from 'react-native-toast-message';

/**
 * Native toast notification utilities
 * REPLACES WEB APP'S TOASTIFY.JS WITH REACT-NATIVE-TOAST-MESSAGE
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Show a toast notification
 * @param message - Message to display
 * @param type - Toast type (success, error, info, warning)
 * @param duration - Duration in milliseconds (default: 3000)
 */
export const showToast = (
  message: string,
  type: ToastType = 'info',
  duration: number = 3000
) => {
  Toast.show({
    type,
    text1: getToastTitle(type),
    text2: message,
    visibilityTime: duration,
    position: 'top',
    topOffset: 60,
  });
};

/**
 * Show success toast
 */
export const showSuccessToast = (message: string) => {
  showToast(message, 'success');
};

/**
 * Show error toast
 */
export const showErrorToast = (message: string) => {
  showToast(message, 'error', 4000);
};

/**
 * Show info toast
 */
export const showInfoToast = (message: string) => {
  showToast(message, 'info');
};

/**
 * Show warning toast
 */
export const showWarningToast = (message: string) => {
  showToast(message, 'warning');
};

/**
 * Hide current toast
 */
export const hideToast = () => {
  Toast.hide();
};

/**
 * Get toast title based on type
 */
const getToastTitle = (type: ToastType): string => {
  const titles: Record<ToastType, string> = {
    success: 'Success',
    error: 'Error',
    info: 'Info',
    warning: 'Warning',
  };
  return titles[type];
};

/**
 * Custom toast with title and message
 */
export const showCustomToast = (
  title: string,
  message: string,
  type: ToastType = 'info',
  duration: number = 3000
) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    visibilityTime: duration,
    position: 'top',
    topOffset: 60,
  });
};

/**
 * Show validation error toast with field context
 */
export const showValidationErrorToast = (fieldName: string, errorMessage: string) => {
  showCustomToast(
    `Validation Error: ${fieldName}`,
    errorMessage,
    'error',
    4000
  );
};
