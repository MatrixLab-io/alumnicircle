import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Button, Input } from '../common';
import GoogleSignInButton from './GoogleSignInButton';
import PasswordInput from './PasswordInput';
import { validationRules } from '../../utils/validators';
import { PUBLIC_ROUTES, USER_ROUTES, ADMIN_ROUTES } from '../../config/routes';

export default function LoginForm() {
  const navigate = useNavigate();
  const { loginWithEmail, signInWithGoogle, userProfile, isAdmin, isApproved, isPending, isEmailVerified } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
    setIsLoading(true);
    const result = await loginWithEmail(data.email, data.password);
    setIsLoading(false);

    if (result.success) {
      toast.success('Welcome back!');
      // Wait for profile to be fetched then redirect
      setTimeout(() => handleRedirect(result.user), 500);
    } else {
      toast.error(result.error || 'Login failed. Please check your credentials.');
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const result = await signInWithGoogle();
    setIsGoogleLoading(false);

    if (result.success) {
      if (result.isNewUser) {
        toast.success('Account created! Please wait for admin approval.');
        navigate(PUBLIC_ROUTES.PENDING_APPROVAL);
      } else {
        toast.success('Welcome back!');
        setTimeout(() => handleRedirect(result.user), 500);
      }
    } else {
      toast.error(result.error || 'Google sign-in failed. Please try again.');
    }
  };

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

        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          disabled={isGoogleLoading}
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
