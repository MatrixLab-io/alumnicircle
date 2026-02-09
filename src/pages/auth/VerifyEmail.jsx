import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { EnvelopeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Button } from '../../components/common';
import { PUBLIC_ROUTES } from '../../config/routes';
import { APP_NAME } from '../../config/constants';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { user, resendVerificationEmail, logout, isEmailVerified } = useAuth();
  const [isResending, setIsResending] = useState(false);

  // If already verified, redirect
  if (isEmailVerified) {
    navigate(PUBLIC_ROUTES.PENDING_APPROVAL);
    return null;
  }

  const handleResend = async () => {
    setIsResending(true);
    const result = await resendVerificationEmail();
    setIsResending(false);

    if (result.success) {
      toast.success('Verification email sent! Check your inbox.');
    } else {
      toast.error(result.error || 'Failed to send email. Please try again.');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate(PUBLIC_ROUTES.LOGIN);
  };

  return (
    <>
      <Helmet>
        <title>Verify Email | {APP_NAME}</title>
      </Helmet>

      <Card className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <EnvelopeIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Verify Your Email
        </h1>

        <p className="text-gray-500 dark:text-gray-400 mb-6">
          We've sent a verification link to{' '}
          <strong className="text-gray-900 dark:text-white">{user?.email}</strong>.
          Please check your inbox and click the link to verify your account.
        </p>

        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-6">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Can't find the email? Check your spam folder or click the button below to resend.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            fullWidth
            onClick={handleResend}
            isLoading={isResending}
            leftIcon={<ArrowPathIcon className="h-5 w-5" />}
          >
            Resend Verification Email
          </Button>

          <Button fullWidth variant="outline" onClick={handleLogout}>
            Back to Login
          </Button>
        </div>

        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          Already verified?{' '}
          <button
            onClick={() => window.location.reload()}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            Refresh this page
          </button>
        </p>
      </Card>
    </>
  );
}
