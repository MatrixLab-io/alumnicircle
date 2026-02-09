import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Button } from '../../components/common';
import { PUBLIC_ROUTES, USER_ROUTES } from '../../config/routes';
import { APP_NAME } from '../../config/constants';

export default function PendingApproval() {
  const navigate = useNavigate();
  const { userProfile, logout, refreshProfile, isApproved } = useAuth();

  // If approved, redirect to dashboard
  useEffect(() => {
    if (isApproved) {
      navigate(USER_ROUTES.DASHBOARD);
    }
  }, [isApproved, navigate]);

  if (isApproved) {
    return null;
  }

  const handleRefresh = async () => {
    await refreshProfile();
    if (isApproved) {
      navigate(USER_ROUTES.DASHBOARD);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate(PUBLIC_ROUTES.LOGIN);
  };

  return (
    <>
      <Helmet>
        <title>Pending Approval | {APP_NAME}</title>
      </Helmet>

      <Card className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
          <ClockIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Awaiting Approval
        </h1>

        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Thank you for registering, <strong className="text-gray-900 dark:text-white">{userProfile?.name}</strong>!
          Your account is pending approval from an administrator.
        </p>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            This helps us ensure that only Batch 2003 alumni can access the directory.
            You'll receive an email once your account is approved.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            fullWidth
            onClick={handleRefresh}
            leftIcon={<ArrowPathIcon className="h-5 w-5" />}
          >
            Check Approval Status
          </Button>

          <Button fullWidth variant="outline" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>

        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          Questions? Contact the administrator for assistance.
        </p>
      </Card>
    </>
  );
}
