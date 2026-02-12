import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Button, Input } from '../common';
import GoogleSignInButton from './GoogleSignInButton';
import PasswordInput from './PasswordInput';
import { validationRules } from '../../utils/validators';
import { getPasswordStrength } from '../../utils/validators';
import { PUBLIC_ROUTES } from '../../config/routes';

const PASSWORD_RULES = [
  { key: 'minLength', label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { key: 'uppercase', label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { key: 'number', label: 'One number', test: (v) => /[0-9]/.test(v) },
];

const STRENGTH_COLORS = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
};

const STRENGTH_TEXT_COLORS = {
  red: 'text-red-500',
  yellow: 'text-yellow-500',
  green: 'text-green-500',
};

function PasswordChecklist({ password }) {
  if (!password) return null;

  const strength = getPasswordStrength(password);
  const strengthPercent = Math.round((strength.score / 6) * 100);

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${STRENGTH_COLORS[strength.color]}`}
            style={{ width: `${strengthPercent}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${STRENGTH_TEXT_COLORS[strength.color]}`}>
          {strength.label}
        </span>
      </div>

      {/* Requirements checklist */}
      <ul className="space-y-1">
        {PASSWORD_RULES.map((rule) => {
          const passed = rule.test(password);
          return (
            <li key={rule.key} className="flex items-center gap-1.5">
              {passed ? (
                <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
              ) : (
                <XCircleIcon className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
              )}
              <span className={`text-xs ${passed ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                {rule.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ConfirmPasswordStatus({ password, confirmPassword }) {
  if (!confirmPassword) return null;

  const matches = password === confirmPassword;

  return (
    <div className="mt-1 flex items-center gap-1.5">
      {matches ? (
        <>
          <CheckCircleIcon className="h-3.5 w-3.5 text-green-500" />
          <span className="text-xs text-green-600 dark:text-green-400">Passwords match</span>
        </>
      ) : (
        <>
          <XCircleIcon className="h-3.5 w-3.5 text-red-500" />
          <span className="text-xs text-red-500">Passwords do not match</span>
        </>
      )}
    </div>
  );
}

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
  } = useForm({ mode: 'onChange' });

  const password = watch('password', '');
  const confirmPassword = watch('confirmPassword', '');

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
    const result = await signInWithGoogle({ isRegistration: true });
    setIsGoogleLoading(false);

    if (result.success) {
      if (result.isNewUser) {
        toast.success('Account created! Please wait for admin approval.');
        navigate(PUBLIC_ROUTES.PENDING_APPROVAL);
      } else {
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } else if (result.noProfile) {
      toast.error('Registration failed. Please try again.');
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
          Connect with your Adarsha School Batch 2003 classmates
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

        <div>
          <PasswordInput
            label="Password"
            placeholder="Create a password"
            error={errors.password?.message}
            required
            {...register('password', validationRules.password)}
          />
          <PasswordChecklist password={password} />
        </div>

        <div>
          <PasswordInput
            label="Confirm Password"
            placeholder="Confirm your password"
            error={errors.confirmPassword?.message}
            required
            {...register('confirmPassword', validationRules.confirmPassword(() => password))}
          />
          <ConfirmPasswordStatus password={password} confirmPassword={confirmPassword} />
        </div>

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
