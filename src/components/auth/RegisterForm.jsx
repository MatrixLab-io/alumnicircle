import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Button, Input } from '../common';
import GoogleSignInButton from './GoogleSignInButton';
import PasswordInput from './PasswordInput';
import { validationRules } from '../../utils/validators';
import { PUBLIC_ROUTES } from '../../config/routes';

export default function RegisterForm() {
  const navigate = useNavigate();
  const { registerWithEmail, signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await registerWithEmail(
      data.email,
      data.password,
      data.name,
      data.phone
    );
    setIsLoading(false);

    if (result.success) {
      toast.success('Account created! Please verify your email.');
      navigate(PUBLIC_ROUTES.VERIFY_EMAIL);
    } else {
      toast.error(result.error || 'Registration failed. Please try again.');
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
        navigate('/dashboard');
      }
    } else {
      toast.error(result.error || 'Google sign-in failed. Please try again.');
    }
  };

  return (
    <Card className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Join AlumniCircle
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Connect with your Batch 2003 classmates
        </p>
      </div>

      {/* Google Sign In */}
      <GoogleSignInButton
        onClick={handleGoogleSignIn}
        isLoading={isGoogleLoading}
        disabled={isLoading}
        label="Sign up with Google"
      />

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white dark:bg-gray-900 text-gray-500">
            or register with email
          </span>
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="Enter your full name"
          error={errors.name?.message}
          required
          {...register('name', validationRules.name)}
        />

        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          error={errors.email?.message}
          required
          {...register('email', validationRules.email)}
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="01XXXXXXXXX"
          helperText="Bangladesh phone number (11 digits)"
          error={errors.phone?.message}
          required
          {...register('phone', validationRules.phone)}
        />

        <PasswordInput
          label="Password"
          placeholder="Create a password"
          helperText="At least 8 characters, 1 uppercase, 1 number"
          error={errors.password?.message}
          required
          {...register('password', validationRules.password)}
        />

        <PasswordInput
          label="Confirm Password"
          placeholder="Confirm your password"
          error={errors.confirmPassword?.message}
          required
          {...register('confirmPassword', validationRules.confirmPassword(() => password))}
        />

        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          disabled={isGoogleLoading}
        >
          Create Account
        </Button>
      </form>

      {/* Info */}
      <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
        <p className="text-sm text-primary-700 dark:text-primary-300">
          <strong>Note:</strong> After registration, you'll need to verify your email and wait for admin approval before accessing the directory.
        </p>
      </div>

      {/* Login Link */}
      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{' '}
        <Link
          to={PUBLIC_ROUTES.LOGIN}
          className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          Sign in
        </Link>
      </p>
    </Card>
  );
}
