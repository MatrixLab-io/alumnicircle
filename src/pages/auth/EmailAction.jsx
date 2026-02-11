import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { applyActionCode } from 'firebase/auth';
import { Helmet } from 'react-helmet-async';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { auth } from '../../config/firebase';
import { Card, Button, Spinner } from '../../components/common';
import { APP_NAME } from '../../config/constants';
import { getErrorMessage, logError } from '../../utils/errorMessages';

export default function EmailAction() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5); // 5 seconds countdown
  const processingRef = useRef(false); // Use ref to prevent double processing across re-renders

  useEffect(() => {
    // Prevent double processing using ref (survives re-renders)
    if (processingRef.current) return;

    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');

    if (!mode || !oobCode) {
      setStatus('error');
      setMessage('This link is invalid. Please request a new verification email.');
      return;
    }

    processingRef.current = true;
    handleAction(mode, oobCode);
  }, [searchParams]);

  // Countdown timer for success state
  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (status === 'success' && countdown === 0) {
      navigate('/pending-approval', {
        replace: true,
        state: { fromVerification: true }
      });
    }
  }, [status, countdown, navigate]);

  const handleAction = async (mode, code) => {
    try {
      if (mode === 'verifyEmail') {
        // Add small delay to prevent flash during double-mount in dev mode
        await new Promise(resolve => setTimeout(resolve, 300));

        // Verify the email
        await applyActionCode(auth, code);

        // Force reload the current user to get updated emailVerified status
        if (auth.currentUser) {
          await auth.currentUser.reload();
        }

        // Set success state - countdown will handle redirect
        setStatus('success');
        setMessage('Your email has been successfully verified!');
        setCountdown(5); // Start 5 second countdown
      } else if (mode === 'resetPassword') {
        // Handle password reset
        navigate(`/reset-password?oobCode=${code}`, { replace: true });
      } else {
        setStatus('error');
        setMessage('Unknown action. Please contact support.');
      }
    } catch (error) {
      logError('Email Action', error);

      // If already in success state, ignore the error (caused by double-mount)
      if (status === 'success') {
        console.log('Ignoring error - already verified');
        return;
      }

      // Check if user is actually verified despite the error
      if (error.code === 'auth/invalid-action-code') {
        if (auth.currentUser) {
          await auth.currentUser.reload();
          if (auth.currentUser.emailVerified) {
            // Email is verified, show success instead of error
            setStatus('success');
            setMessage('Your email has been successfully verified!');
            setCountdown(5);
            return;
          }
        }
      }

      // Get user-friendly error message
      const errorMessage = getErrorMessage(error);

      // Only set error after a small delay to prevent flash
      setTimeout(() => {
        // Double-check we're not in success state
        if (status !== 'success') {
          setStatus('error');
          setMessage(errorMessage);
        }
      }, 200);
    }
  };

  return (
    <>
      <Helmet>
        <title>Email Verification | {APP_NAME}</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-12">
        <Card className="w-full max-w-md">
          <div className="text-center">
            {status === 'loading' && (
              <>
                <Spinner size="lg" className="mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Verifying your email...
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Please wait while we verify your email address.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircleIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Email Verified!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {message}
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg mb-6">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40">
                    <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                      {countdown}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setCountdown(0); // Skip countdown
                    navigate('/pending-approval', { replace: true, state: { fromVerification: true } });
                  }}
                  variant="outline"
                >
                  Continue Now
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <XCircleIcon className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Verification Failed
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {message}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => navigate('/login')}>
                    Go to Sign In
                  </Button>
                  <Button onClick={() => navigate('/register')}>
                    Register Again
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
