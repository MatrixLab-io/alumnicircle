/**
 * Email validation
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Phone validation (international, E.164 format from react-phone-number-input)
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  // E.164 format: + followed by 7-15 digits
  return /^\+[1-9]\d{6,14}$/.test(phone);
};

/**
 * Password validation
 * At least 8 characters, 1 uppercase, 1 number
 */
export const isValidPassword = (password) => {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return minLength && hasUppercase && hasNumber;
};

/**
 * Get password strength
 */
export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: 'None' };

  let score = 0;

  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  const labels = {
    0: 'Very Weak',
    1: 'Weak',
    2: 'Weak',
    3: 'Fair',
    4: 'Good',
    5: 'Strong',
    6: 'Very Strong',
  };

  return {
    score,
    label: labels[score] || 'Very Strong',
    color: score <= 2 ? 'red' : score <= 4 ? 'yellow' : 'green',
  };
};

/**
 * URL validation
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Social media URL validators
 */
export const isValidFacebookUrl = (url) => {
  return url ? url.includes('facebook.com') || url.includes('fb.com') : true;
};

export const isValidLinkedInUrl = (url) => {
  return url ? url.includes('linkedin.com') : true;
};

export const isValidTwitterUrl = (url) => {
  return url ? url.includes('twitter.com') || url.includes('x.com') : true;
};

/**
 * Name validation
 */
export const isValidName = (name) => {
  return name && name.trim().length >= 2;
};

/**
 * Date validation - must not be in the past
 */
export const isNotPastDate = (dateStr) => {
  if (!dateStr) return true;
  const selected = new Date(dateStr);
  const now = new Date();
  now.setSeconds(0, 0);
  return selected >= now;
};

/**
 * Date validation - end date must be after start date
 */
export const isAfterDate = (endStr, startStr) => {
  if (!endStr || !startStr) return true;
  return new Date(endStr) > new Date(startStr);
};

/**
 * Form validation rules for React Hook Form
 */
export const validationRules = {
  name: {
    required: 'Name is required',
    minLength: {
      value: 2,
      message: 'Name must be at least 2 characters',
    },
  },
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address',
    },
  },
  phone: {
    required: 'Phone number is required',
    validate: (value) =>
      isValidPhone(value) || 'Please enter a valid phone number',
  },
  password: {
    required: 'Password is required',
    minLength: {
      value: 8,
      message: 'Password must be at least 8 characters',
    },
    validate: (value) => {
      if (!/[A-Z]/.test(value)) {
        return 'Password must contain at least one uppercase letter';
      }
      if (!/[0-9]/.test(value)) {
        return 'Password must contain at least one number';
      }
      return true;
    },
  },
  confirmPassword: (getPassword) => ({
    required: 'Please confirm your password',
    validate: (value) => value === getPassword() || 'Passwords do not match',
  }),
  bkashTransactionId: {
    required: 'Transaction ID is required',
    minLength: {
      value: 8,
      message: 'Transaction ID must be at least 8 characters',
    },
  },
  cashGivenBy: {
    required: 'Name of the person who confirmed payment is required',
    minLength: {
      value: 2,
      message: 'Name must be at least 2 characters',
    },
  },
  cashContactNumber: {
    required: 'Contact number is required',
    minLength: {
      value: 8,
      message: 'Contact number must be at least 8 characters',
    },
  },
  url: {
    validate: (value) => !value || isValidUrl(value) || 'Please enter a valid URL',
  },
  startDate: {
    required: 'Start date is required',
    validate: (value) => isNotPastDate(value) || 'Start date cannot be in the past',
  },
  endDate: (getStartDate) => ({
    validate: (value) => {
      if (!value) return true;
      if (!isNotPastDate(value)) return 'End date cannot be in the past';
      if (!isAfterDate(value, getStartDate())) return 'End date must be after start date';
      return true;
    },
  }),
  contactPhone: {
    validate: (value) => !value || isValidPhone(value) || 'Please enter a valid phone number',
  },
};
