import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Button, Input } from '../../components/common';
import { validationRules } from '../../utils/validators';
import { PUBLIC_ROUTES } from '../../config/routes';
import { APP_NAME } from '../../config/constants';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await resetPassword(data.email);
    setIsLoading(false);

    if (result.success) {
      setEmailSent(true);
      toast.success('Password reset email sent!');
    } else {
      toast.error(result.error || 'Failed to send reset email. Please try again.');
    }
  };

  if (emailSent) {
    return (
      <>
        <Helmet>
          <title>Check Your Email | {APP_NAME}</title>
        </Helmet>

        <Card className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <EnvelopeIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Check Your Email
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mb-6">
            We've sent a password reset link to{' '}
            <strong className="text-gray-900 dark:text-white">{getValues('email')}</strong>.
          </p>

          <Link to={PUBLIC_ROUTES.LOGIN}>
            <Button fullWidth variant="outline" leftIcon={<ArrowLeftIcon className="h-5 w-5" />}>
              Back to Login
            </Button>
          </Link>
        </Card>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Forgot Password | {APP_NAME}</title>
      </Helmet>

      <Card>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Forgot Password?
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            error={errors.email?.message}
            required
            {...register('email', validationRules.email)}
          />

          <Button type="submit" fullWidth isLoading={isLoading}>
            Send Reset Link
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to={PUBLIC_ROUTES.LOGIN}
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium inline-flex items-center gap-1"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </Card>
    </>
  );
}
