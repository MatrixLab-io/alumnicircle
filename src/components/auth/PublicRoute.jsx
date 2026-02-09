import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner } from '../common';
import { USER_ROUTES, ADMIN_ROUTES, PUBLIC_ROUTES } from '../../config/routes';

export default function PublicRoute({ children }) {
  const { user, userProfile, loading, isAdmin, isApproved, isEmailVerified } = useAuth();

  if (loading) {
    return <Spinner.Page message="Loading..." />;
  }

  // If user is logged in and fully authenticated, redirect appropriately
  if (user && userProfile) {
    if (!isEmailVerified) {
      return <Navigate to={PUBLIC_ROUTES.VERIFY_EMAIL} replace />;
    }
    if (!isApproved) {
      return <Navigate to={PUBLIC_ROUTES.PENDING_APPROVAL} replace />;
    }
    // Redirect to dashboard
    if (isAdmin) {
      return <Navigate to={ADMIN_ROUTES.DASHBOARD} replace />;
    }
    return <Navigate to={USER_ROUTES.DASHBOARD} replace />;
  }

  return children;
}
