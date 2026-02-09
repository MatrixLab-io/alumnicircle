import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner } from '../common';
import { PUBLIC_ROUTES } from '../../config/routes';

export default function ProtectedRoute({ children, requireAdmin = false, requireSuperAdmin = false }) {
  const location = useLocation();
  const { user, userProfile, loading, isAdmin, isSuperAdmin, isApproved, isEmailVerified } = useAuth();

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

  // Wait for profile to load
  if (!userProfile) {
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
