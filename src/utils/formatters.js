/**
 * Format date to input value (YYYY-MM-DD)
 */
export const toDateInputValue = (date) => {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toISOString().split('T')[0];
};

/**
 * Format datetime to input value (YYYY-MM-DDTHH:mm)
 */
export const toDateTimeInputValue = (date) => {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toISOString().slice(0, 16);
};

/**
 * Parse date input value to Date object
 */
export const parseDateInput = (value) => {
  if (!value) return null;
  return new Date(value);
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format number with commas
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '';
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 0) => {
  if (value === null || value === undefined) return '';
  return `${value.toFixed(decimals)}%`;
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Title case
 */
export const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
};

/**
 * Format profession for display
 */
export const formatProfession = (profession) => {
  if (!profession || !profession.type) return 'Not specified';

  switch (profession.type) {
    case 'business':
      return profession.businessName || 'Business Owner';
    case 'service':
      const parts = [];
      if (profession.designation) parts.push(profession.designation);
      if (profession.companyName) parts.push(`at ${profession.companyName}`);
      return parts.length > 0 ? parts.join(' ') : 'Service Professional';
    case 'other':
      return profession.otherDetails || 'Other';
    default:
      return 'Not specified';
  }
};

/**
 * Format address for display
 */
export const formatAddress = (address) => {
  if (!address) return '';
  const parts = [];
  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.postCode) parts.push(address.postCode);
  if (address.country) parts.push(address.country);
  return parts.join(', ');
};

/**
 * Format event location for display.
 * Supports both legacy string and new structured object.
 */
export const formatEventLocation = (location) => {
  if (!location) return '';
  if (typeof location === 'string') return location;
  const parts = [];
  if (location.street) parts.push(location.street);
  if (location.city) parts.push(location.city);
  if (location.postCode) parts.push(location.postCode);
  if (location.country) parts.push(location.country);
  return parts.join(', ');
};

/**
 * Format duration (in minutes) to human readable
 */
export const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

/**
 * Pluralize a word
 */
export const pluralize = (count, singular, plural = null) => {
  if (count === 1) return singular;
  return plural || `${singular}s`;
};
