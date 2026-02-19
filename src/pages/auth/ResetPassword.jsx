import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Button, Input } from '../../components/common';
import { PUBLIC_ROUTES } from '../../config/routes';
import { APP_NAME } from '../../config/constants';

export default function ResetPassword() {
  const { confirmNewPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  if (!oobCode) {
    return (
      <Card className="text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Invalid or expired reset link. Please request a new one.
        </p>
        <Link to={PUBLIC_ROUTES.FORGOT_PASSWORD}>
          <Button>Request New Link</Button>
        </Link>
      </Card>
    );
  }

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await confirmNewPassword(oobCode, data.password);
    setIsLoading(false);

    if (result.success) {
      setSuccess(true);
    } else {
      toast.error(result.error || 'Failed to reset password. The link may have expired.');
    }
  };

  if (success) {
    return (
      <>
        <Helmet>
          <title>Password Reset | {APP_NAME}</title>
        </Helmet>
        <Card className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Password Reset!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Your password has been updated successfully. You can now sign in with your new password.
          </p>
          <Button fullWidth onClick={() => navigate(PUBLIC_ROUTES.LOGIN)}>
            Sign In
          </Button>
        </Card>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Reset Password | {APP_NAME}</title>
      </Helmet>

      <Card>
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <LockClosedIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Set New Password
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password"
            error={errors.password?.message}
            required
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' },
            })}
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Confirm new password"
            error={errors.confirmPassword?.message}
            required
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === watch('password') || 'Passwords do not match',
            })}
          />
          <Button type="submit" fullWidth isLoading={isLoading}>
            Reset Password
          </Button>
        </form>
      </Card>
    </>
  );
}
