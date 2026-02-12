// Public Routes
export const PUBLIC_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  PENDING_APPROVAL: '/pending-approval',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  PUBLIC_EVENT: '/event/:id/public',
};

// Protected User Routes
export const USER_ROUTES = {
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  EDIT_PROFILE: '/profile/edit',
  DIRECTORY: '/directory',
  EVENTS: '/events',
  EVENT_DETAILS: '/event/:id',
  MY_EVENTS: '/my-events',
};

// Admin Routes
export const ADMIN_ROUTES = {
  DASHBOARD: '/admin/dashboard',
  USER_APPROVALS: '/admin/users',
  ALL_USERS: '/admin/users/all',
  CREATE_EVENT: '/admin/events/create',
  EDIT_EVENT: '/admin/events/:id/edit',
  MANAGE_EVENTS: '/admin/events',
  EVENT_PARTICIPANTS: '/admin/events/:id/participants',
  ARCHIVED_EVENTS: '/admin/events/archived',
  MANAGE_ADMINS: '/admin/manage-admins',
  ACTIVITY_LOG: '/admin/activity-log',
};

// Route Helpers
export const getEventDetailsRoute = (id) => `/event/${id}`;
export const getPublicEventRoute = (id) => `/event/${id}/public`;
export const getEditEventRoute = (id) => `/admin/events/${id}/edit`;
export const getEventParticipantsRoute = (id) => `/admin/events/${id}/participants`;
