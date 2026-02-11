/**
 * Centralized Error Message Handler
 *
 * Converts technical error codes to user-friendly messages
 * Hides implementation details (Firebase, etc.) from users
 */

/**
 * Get user-friendly error message from error code or object
 * @param {Error|string} error - Error object or error code string
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  // If error is a string, treat it as error code
  const errorCode = typeof error === 'string' ? error : error?.code;
  const errorMessage = typeof error === 'string' ? '' : error?.message;

  // Map error codes to user-friendly messages
  const errorMap = {
    // Authentication Errors
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'Invalid email or password.',
    'auth/wrong-password': 'Invalid email or password.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
    'auth/weak-password': 'Password must be at least 6 characters long.',
    'auth/operation-not-allowed': 'This operation is not allowed. Please contact support.',
    'auth/account-exists-with-different-credential': 'An account already exists with this email. Please sign in using your original method.',

    // Email Verification Errors
    'auth/expired-action-code': 'This verification link has expired. Please request a new one.',
    'auth/invalid-action-code': 'This link is invalid or has already been used.',
    'auth/user-token-expired': 'Your session has expired. Please sign in again.',

    // Password Reset Errors
    'auth/invalid-password': 'Password must be at least 6 characters long.',
    'auth/missing-password': 'Please enter a password.',

    // Network Errors
    'auth/network-request-failed': 'Network error. Please check your connection and try again.',
    'auth/timeout': 'Request timed out. Please try again.',

    // Too Many Requests
    'auth/too-many-requests': 'Too many attempts. Please try again later.',

    // Popup Errors
    'auth/popup-closed-by-user': 'Sign-in cancelled.',
    'auth/popup-blocked': 'Pop-up was blocked by your browser. Please allow pop-ups and try again.',
    'auth/cancelled-popup-request': 'Sign-in cancelled.',

    // Token Errors
    'auth/invalid-user-token': 'Your session has expired. Please sign in again.',
    'auth/requires-recent-login': 'Please sign in again to continue.',

    // Missing Information
    'auth/missing-email': 'Please enter your email address.',
    'auth/internal-error': 'An unexpected error occurred. Please try again.',
  };

  // Return mapped message or default
  if (errorCode && errorMap[errorCode]) {
    return errorMap[errorCode];
  }

  // Check for specific error message patterns
  if (errorMessage) {
    if (errorMessage.includes('email') && errorMessage.includes('already')) {
      return 'This email is already registered. Please sign in instead.';
    }
    if (errorMessage.includes('password') && errorMessage.includes('weak')) {
      return 'Please choose a stronger password (at least 6 characters).';
    }
    if (errorMessage.includes('network')) {
      return 'Network error. Please check your connection and try again.';
    }
  }

  // Default error message (no technical details)
  return 'An error occurred. Please try again or contact support if the problem persists.';
};

/**
 * Get user-friendly success message
 * @param {string} action - Action that succeeded
 * @returns {string} Success message
 */
export const getSuccessMessage = (action) => {
  const successMap = {
    'login': 'Welcome back!',
    'register': 'Account created successfully!',
    'logout': 'Signed out successfully.',
    'password-reset-email': 'Password reset email sent. Please check your inbox.',
    'password-reset': 'Password updated successfully.',
    'email-verified': 'Email verified successfully!',
    'profile-updated': 'Profile updated successfully.',
    'photo-uploaded': 'Photo uploaded successfully.',
  };

  return successMap[action] || 'Success!';
};

/**
 * Log technical error for debugging (console only)
 * @param {string} context - Where the error occurred
 * @param {Error} error - The error object
 */
export const logError = (context, error) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔴 Error: ${context}`);
    console.error('Error code:', error?.code);
    console.error('Error message:', error?.message);
    console.error('Full error:', error);
    console.groupEnd();
  }
};

/**
 * Get user-friendly email verification message
 * @param {string} type - Type of email sent
 * @returns {string} Message to show user
 */
export const getEmailMessage = (type) => {
  const emailMap = {
    'verification': 'Please check your email to verify your account.',
    'password-reset': 'Password reset instructions have been sent to your email.',
    'approval': 'You will receive an email notification when your account is approved.',
  };

  return emailMap[type] || 'Email sent successfully.';
};
