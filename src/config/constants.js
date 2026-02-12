// App Configuration
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'AlumniCircle';
export const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173';

// User Roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
};

// User Status
export const USER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// Event Status
export const EVENT_STATUS = {
  DRAFT: 'draft',
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Participant Status
export const PARTICIPANT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// Payment Methods
export const PAYMENT_METHODS = {
  BKASH: 'bkash',
  NAGAD: 'nagad',
  CASH: 'cash',
};

// Visibility Options
export const VISIBILITY = {
  PUBLIC: 'public',
  PRIVATE: 'private',
};

// Blood Groups
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Profession Types
export const PROFESSION_TYPES = {
  BUSINESS: 'business',
  SERVICE: 'service',
  OTHER: 'other',
};

// Pagination
export const ITEMS_PER_PAGE = 20;

// File Upload Limits
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Firebase Collections
export const COLLECTIONS = {
  USERS: 'users',
  EVENTS: 'events',
  EVENT_PARTICIPANTS: 'eventParticipants',
  ARCHIVED_EVENTS: 'archivedEvents',
  ACTIVITY_LOGS: 'activityLogs',
};

// Activity Log Types
export const ACTIVITY_TYPES = {
  USER_APPROVED: 'USER_APPROVED',
  USER_REJECTED: 'USER_REJECTED',
  USER_DELETED: 'USER_DELETED',
  USER_ROLE_CHANGED: 'USER_ROLE_CHANGED',
  EVENT_CREATED: 'EVENT_CREATED',
  EVENT_UPDATED: 'EVENT_UPDATED',
  EVENT_DELETED: 'EVENT_DELETED',
  EVENT_ARCHIVED: 'EVENT_ARCHIVED',
  PARTICIPANT_APPROVED: 'PARTICIPANT_APPROVED',
  PARTICIPANT_REJECTED: 'PARTICIPANT_REJECTED',
};
