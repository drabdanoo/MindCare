import Toastify from 'toastify-js';

/**
 * Toast notification utilities
 * Replaces native alert() with modern, non-blocking notifications
 */

export const toast = {
  success: (message) => {
    Toastify({
      text: message,
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
      stopOnFocus: true,
    }).showToast();
  },

  error: (message) => {
    Toastify({
      text: message,
      duration: 4000,
      gravity: "top",
      position: "right",
      backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
      stopOnFocus: true,
    }).showToast();
  },

  info: (message) => {
    Toastify({
      text: message,
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: "linear-gradient(to right, #2193b0, #6dd5ed)",
      stopOnFocus: true,
    }).showToast();
  },

  warning: (message) => {
    Toastify({
      text: message,
      duration: 3500,
      gravity: "top",
      position: "right",
      backgroundColor: "linear-gradient(to right, #f2994a, #f2c94c)",
      stopOnFocus: true,
    }).showToast();
  },
};
