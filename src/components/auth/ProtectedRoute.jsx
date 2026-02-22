import { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner } from '../common';
import { PUBLIC_ROUTES } from '../../config/routes';

export default function ProtectedRoute({ children, requireAdmin = false, requireSuperAdmin = false }) {
  const location = useLocation();
  const { user, userProfile, loading, isAdmin, isSuperAdmin, isApproved, isEmailVerified, refreshProfile } = useAuth();

  // Auto-retry profile fetch when user is set but profile is missing (Firestore hiccup)
  const retryCount = useRef(0);
  const [retryFailed, setRetryFailed] = useState(false);

  useEffect(() => {
    if (!loading && user && !userProfile && retryCount.current < 3 && !retryFailed) {
      retryCount.current += 1;
      const delay = retryCount.current * 1000; // 1s, 2s, 3s back-off
      const timer = setTimeout(async () => {
        await refreshProfile();
        if (retryCount.current >= 3) setRetryFailed(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [loading, user, userProfile, retryFailed, refreshProfile]);

  // Show loading while checking auth
  if (loading) {
    return <Spinner.Page message="Checking authentication..." />;
  }

  // Not logged in
  if (!user) {
    return <Navigate to={PUBLIC_ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Email not verified
  if (!isEmailVerified) {
    return <Navigate to={PUBLIC_ROUTES.VERIFY_EMAIL} replace />;
  }

  // Profile missing — retrying in background
  if (!userProfile) {
    if (retryFailed) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Could not load your profile. Please check your connection.
          </p>
          <button
            onClick={() => { retryCount.current = 0; setRetryFailed(false); }}
            className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }
    return <Spinner.Page message="Loading profile..." />;
  }

  // Check approval status
  if (!isApproved) {
    if (userProfile.status === 'pending') {
      return <Navigate to={PUBLIC_ROUTES.PENDING_APPROVAL} replace />;
    }
    if (userProfile.status === 'rejected') {
      return <Navigate to={PUBLIC_ROUTES.LOGIN} replace />;
    }
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check super admin requirement
  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}
