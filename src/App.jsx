import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';

// Contexts
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import { ErrorBoundary, FeedbackWidget } from './components/common';
import { MainLayout, AuthLayout, AdminLayout } from './components/layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';

// Public Pages
import Landing from './pages/public/Landing';
import PublicEvent from './pages/public/PublicEvent';
import NotFound from './pages/public/NotFound';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import PendingApproval from './pages/auth/PendingApproval';
import ForgotPassword from './pages/auth/ForgotPassword';
import EmailAction from './pages/auth/EmailAction';

// User Pages
import Dashboard from './pages/user/Dashboard';
import Profile from './pages/user/Profile';
import EditProfile from './pages/user/EditProfile';
import Directory from './pages/user/Directory';
import Events from './pages/user/Events';
import EventDetailsPage from './pages/user/EventDetailsPage';
import MyEvents from './pages/user/MyEvents';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserApprovals from './pages/admin/UserApprovals';
import AllUsers from './pages/admin/AllUsers';
import CreateEvent from './pages/admin/CreateEvent';
import ManageEvents from './pages/admin/ManageEvents';
import EventParticipants from './pages/admin/EventParticipants';
import EditEvent from './pages/admin/EditEvent';
import ArchivedEvents from './pages/admin/ArchivedEvents';
import ManageAdmins from './pages/admin/ManageAdmins';
import ActivityLog from './pages/admin/ActivityLog';

// Route configs
import { PUBLIC_ROUTES, USER_ROUTES, ADMIN_ROUTES } from './config/routes';

function AuthAwareFeedback() {
  const { userProfile } = useAuth();
  if (!userProfile) return null;
  return (
    <FeedbackWidget
      userName={userProfile.name || ''}
      userEmail={userProfile.email || ''}
    />
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ThemeProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path={PUBLIC_ROUTES.HOME} element={<Landing />} />
                <Route path={PUBLIC_ROUTES.PUBLIC_EVENT} element={<PublicEvent />} />

                {/* Email Action Handler (verification, password reset, etc.) */}
                <Route path="/auth/action" element={<EmailAction />} />

                {/* Auth Routes (only for non-authenticated users) */}
                <Route element={<AuthLayout />}>
                  <Route
                    path={PUBLIC_ROUTES.LOGIN}
                    element={
                      <PublicRoute>
                        <Login />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path={PUBLIC_ROUTES.REGISTER}
                    element={
                      <PublicRoute>
                        <Register />
                      </PublicRoute>
                    }
                  />
                  <Route path={PUBLIC_ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
                  <Route path={PUBLIC_ROUTES.VERIFY_EMAIL} element={<VerifyEmail />} />
                  <Route path={PUBLIC_ROUTES.PENDING_APPROVAL} element={<PendingApproval />} />
                </Route>

                {/* Protected User Routes */}
                <Route
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path={USER_ROUTES.DASHBOARD} element={<Dashboard />} />
                  <Route path={USER_ROUTES.PROFILE} element={<Profile />} />
                  <Route path={USER_ROUTES.EDIT_PROFILE} element={<EditProfile />} />
                  <Route path={USER_ROUTES.DIRECTORY} element={<Directory />} />
                  <Route path={USER_ROUTES.EVENTS} element={<Events />} />
                  <Route path={USER_ROUTES.EVENT_DETAILS} element={<EventDetailsPage />} />
                  <Route path={USER_ROUTES.MY_EVENTS} element={<MyEvents />} />
                </Route>

                {/* Protected Admin Routes */}
                <Route
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path={ADMIN_ROUTES.DASHBOARD} element={<AdminDashboard />} />
                  <Route path={ADMIN_ROUTES.USER_APPROVALS} element={<UserApprovals />} />
                  <Route path={ADMIN_ROUTES.ALL_USERS} element={<AllUsers />} />
                  <Route path={ADMIN_ROUTES.CREATE_EVENT} element={<CreateEvent />} />
                  <Route path={ADMIN_ROUTES.MANAGE_EVENTS} element={<ManageEvents />} />
                  <Route path={ADMIN_ROUTES.ARCHIVED_EVENTS} element={<ArchivedEvents />} />
                  <Route path={ADMIN_ROUTES.EDIT_EVENT} element={<EditEvent />} />
                  <Route path={ADMIN_ROUTES.EVENT_PARTICIPANTS} element={<EventParticipants />} />
                  <Route path={ADMIN_ROUTES.ACTIVITY_LOG} element={<ActivityLog />} />
                </Route>

                {/* Super Admin Routes */}
                <Route
                  element={
                    <ProtectedRoute requireSuperAdmin>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path={ADMIN_ROUTES.MANAGE_ADMINS} element={<ManageAdmins />} />
                </Route>

                {/* Catch all - 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>

            {/* Feedback Widget */}
            <AuthAwareFeedback />

            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1f2937',
                  color: '#fff',
                  borderRadius: '0.75rem',
                },
                success: {
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
