import { USER_ROLES, USER_STATUS, EVENT_STATUS } from '../config/constants';

/**
 * Generate initials from a name
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Format phone number for display
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  // Format as XXX-XXXX-XXXX for Bangladesh numbers
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

/**
 * Format date for display
 */
export const formatDate = (timestamp, options = {}) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(date);
};

/**
 * Format date and time
 */
export const formatDateTime = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const diff = date - new Date();
  const diffDays = Math.round(diff / (1000 * 60 * 60 * 24));

  if (Math.abs(diffDays) < 1) {
    const diffHours = Math.round(diff / (1000 * 60 * 60));
    if (Math.abs(diffHours) < 1) {
      const diffMinutes = Math.round(diff / (1000 * 60));
      return rtf.format(diffMinutes, 'minute');
    }
    return rtf.format(diffHours, 'hour');
  }
  if (Math.abs(diffDays) < 30) return rtf.format(diffDays, 'day');
  if (Math.abs(diffDays) < 365) return rtf.format(Math.round(diffDays / 30), 'month');
  return rtf.format(Math.round(diffDays / 365), 'year');
};

/**
 * Compute live event status based on dates.
 * Returns { status, label, variant } for badge rendering.
 * Respects cancelled/draft as-is; for upcoming/ongoing/completed
 * it re-derives from startDate/endDate vs now.
 */
export const getEventLiveStatus = (event) => {
  if (event.status === EVENT_STATUS.CANCELLED) {
    return { status: 'cancelled', label: 'Cancelled', variant: 'red' };
  }
  if (event.status === EVENT_STATUS.DRAFT) {
    return { status: 'draft', label: 'Draft', variant: 'yellow' };
  }

  const now = new Date();
  const start = event.startDate?.toDate ? event.startDate.toDate() : new Date(event.startDate);
  const end = event.endDate
    ? (event.endDate.toDate ? event.endDate.toDate() : new Date(event.endDate))
    : null;

  if (end && now > end) {
    return { status: 'ended', label: 'Ended', variant: 'gray' };
  }
  if (now >= start) {
    return { status: 'ongoing', label: 'Running', variant: 'green', dot: true };
  }
  return { status: 'upcoming', label: 'Upcoming', variant: 'blue' };
};

/**
 * Format currency (BDT)
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '';
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Get role display name
 */
export const getRoleDisplayName = (role) => {
  const roleNames = {
    [USER_ROLES.USER]: 'Member',
    [USER_ROLES.ADMIN]: 'Admin',
    [USER_ROLES.SUPER_ADMIN]: 'Super Admin',
  };
  return roleNames[role] || 'Unknown';
};

/**
 * Get status badge color
 */
export const getStatusColor = (status) => {
  const colors = {
    [USER_STATUS.PENDING]: 'yellow',
    [USER_STATUS.APPROVED]: 'green',
    [USER_STATUS.REJECTED]: 'red',
  };
  return colors[status] || 'gray';
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text, length = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
};

/**
 * Debounce function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

/**
 * Generate a unique ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Check if a URL is valid
 */
export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
};

/**
 * Slugify a string
 */
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

/**
 * Calculate profile completion percentage
 */
export const calculateProfileCompletion = (profile) => {
  if (!profile) return 0;

  const fields = [
    { key: 'photo', weight: 15, check: (p) => !!p.photo },
    { key: 'bloodGroup', weight: 10, check: (p) => !!p.bloodGroup },
    { key: 'profession', weight: 15, check: (p) => !!p.profession?.type },
    { key: 'professionDetails', weight: 10, check: (p) => {
      if (!p.profession) return false;
      if (p.profession.type === 'business') return !!p.profession.businessName;
      if (p.profession.type === 'service') return !!p.profession.designation && !!p.profession.companyName;
      return !!p.profession.otherDetails;
    }},
    { key: 'address', weight: 10, check: (p) => !!p.address?.city },
    { key: 'socialLinks', weight: 10, check: (p) => {
      const links = p.socialLinks;
      return links && (links.facebook || links.linkedin || links.twitter || links.website);
    }},
    { key: 'phone', weight: 15, check: (p) => !!p.phone },
    { key: 'name', weight: 15, check: (p) => !!p.name },
  ];

  let completion = 0;
  fields.forEach((field) => {
    if (field.check(profile)) {
      completion += field.weight;
    }
  });

  return Math.min(100, completion);
};

/**
 * Class name utility (simple cn function)
 */
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
