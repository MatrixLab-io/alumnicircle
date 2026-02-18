import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ExclamationTriangleIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Button, Input } from '../common';
import GoogleSignInButton from './GoogleSignInButton';
import PasswordInput from './PasswordInput';
import TurnstileWidget from './TurnstileWidget';
import { validationRules } from '../../utils/validators';
import { PUBLIC_ROUTES, USER_ROUTES, ADMIN_ROUTES } from '../../config/routes';

export default function LoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithEmail, signInWithGoogle, requestReapproval, userProfile, isEmailVerified } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isReapproving, setIsReapproving] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const turnstileRef = useRef(null);

  // 'accountRemoved' = email/password user deleted by admin
  // 'noProfile' = Google user with no Firestore profile (could be new or deleted)
  const [blockedState, setBlockedState] = useState(null);
  const lastCredentials = useRef(null);

  // Show success toast if redirected from email verification
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      toast.success('Email verified successfully! Please sign in.');
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleRedirect = (profile) => {
    if (!isEmailVerified) {
      navigate(PUBLIC_ROUTES.VERIFY_EMAIL);
      return;
    }
    if (profile?.status === 'pending') {
      navigate(PUBLIC_ROUTES.PENDING_APPROVAL);
      return;
    }
    if (profile?.status === 'rejected') {
      toast.error('Your account has been rejected. Please contact support.');
      return;
    }
    if (profile?.role === 'admin' || profile?.role === 'super_admin') {
      navigate(ADMIN_ROUTES.DASHBOARD);
    } else {
      navigate(USER_ROUTES.DASHBOARD);
    }
  };

  const onSubmit = async (data) => {
    if (!turnstileToken) {
      toast.error('Please complete the security check.');
      return;
    }
    setIsLoading(true);
    const result = await loginWithEmail(data.email, data.password);
    setIsLoading(false);
    turnstileRef.current?.reset();
    setTurnstileToken(null);

    if (result.accountRemoved) {
      lastCredentials.current = { email: data.email, password: data.password };
      setBlockedState('accountRemoved');
      return;
    }

    if (result.success) {
      toast.success('Welcome back!');
      setTimeout(() => handleRedirect(result.profile), 500);
    } else {
      toast.error(result.error || 'Login failed. Please check your credentials.');
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const result = await signInWithGoogle();
    setIsGoogleLoading(false);

    if (result.noProfile) {
      lastCredentials.current = { google: true };
      setBlockedState('noProfile');
      return;
    }

    if (result.success) {
      if (result.isNewUser) {
        toast.success('Account created! Please wait for admin approval.');
        navigate(PUBLIC_ROUTES.PENDING_APPROVAL);
      } else {
        toast.success('Welcome back!');
        // Use userProfile from context since Google sign-in sets it
        setTimeout(() => handleRedirect(userProfile), 500);
      }
    } else {
      toast.error(result.error || 'Google sign-in failed. Please try again.');
    }
  };

  const handleRequestReapproval = async () => {
    setIsReapproving(true);
    const { email, password } = lastCredentials.current;
    const result = await requestReapproval(email, password);
    setIsReapproving(false);

    if (result.success) {
      toast.success('Re-approval request submitted!');
      navigate(PUBLIC_ROUTES.PENDING_APPROVAL, { state: { reactivated: true } });
    } else {
      toast.error(result.error || 'Failed to submit request. Please try again.');
    }
  };

  const handleBackToSignIn = () => {
    setBlockedState(null);
    lastCredentials.current = null;
  };

  // Email/password: Account removed by admin
  if (blockedState === 'accountRemoved') {
    return (
      <Card className="w-full">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Account Removed
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Your account has been removed by an administrator.
            If you believe this was a mistake, you can request re-approval below.
          </p>

          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg mb-6 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Requesting re-approval will submit your account for admin review.
              You won't be able to access the app until an administrator approves your account.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              fullWidth
              onClick={handleRequestReapproval}
              isLoading={isReapproving}
            >
              Request Re-approval
            </Button>

            <Button fullWidth variant="outline" onClick={handleBackToSignIn}>
              Back to Sign In
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Google: No Firestore profile found — ask to register
  if (blockedState === 'noProfile') {
    return (
      <Card className="w-full">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No Account Found
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mb-6">
            We couldn't find an account linked to your Google profile.
            Please register to create your account.
          </p>

          <div className="space-y-3">
            <Button
              fullWidth
              onClick={() => navigate(PUBLIC_ROUTES.REGISTER)}
              leftIcon={<UserPlusIcon className="h-5 w-5" />}
            >
              Register New Account
            </Button>

            <Button fullWidth variant="outline" onClick={handleBackToSignIn}>
              Back to Sign In
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome Back
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Sign in to your account to continue
        </p>
      </div>

      {/* Google Sign In */}
      <GoogleSignInButton
        onClick={handleGoogleSignIn}
        isLoading={isGoogleLoading}
        disabled={isLoading}
      />

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white dark:bg-gray-900 text-gray-500">
            or continue with email
          </span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          error={errors.email?.message}
          required
          {...register('email', validationRules.email)}
        />

        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          error={errors.password?.message}
          required
          {...register('password', { required: 'Password is required' })}
        />

        <div className="flex items-center justify-end">
          <Link
            to={PUBLIC_ROUTES.FORGOT_PASSWORD}
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Forgot password?
          </Link>
        </div>

        <TurnstileWidget
          ref={turnstileRef}
          onSuccess={setTurnstileToken}
          onExpire={() => setTurnstileToken(null)}
          onError={() => setTurnstileToken(null)}
        />

        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          disabled={isGoogleLoading || !turnstileToken}
        >
          Sign In
        </Button>
      </form>

      {/* Register Link */}
      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Don't have an account?{' '}
        <Link
          to={PUBLIC_ROUTES.REGISTER}
          className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          Register now
        </Link>
      </p>
    </Card>
  );
}
