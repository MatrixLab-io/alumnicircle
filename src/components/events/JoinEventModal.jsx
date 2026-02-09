import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Modal, Button, Input } from '../common';
import { formatCurrency } from '../../utils/helpers';
import { validationRules } from '../../utils/validators';

export default function JoinEventModal({
  event,
  isOpen,
  onClose,
  onJoin,
  isLoading,
}) {
  const isPaid = event?.registrationFee > 0;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const result = await onJoin(data.bkashTransactionId);
    if (result) {
      reset();
      onClose();
    }
  };

  const handleFreeJoin = async () => {
    const result = await onJoin(null);
    if (result) {
      onClose();
    }
  };

  if (!event) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isPaid ? 'Payment Required' : 'Join Event'}
      size="md"
    >
      <form onSubmit={isPaid ? handleSubmit(onSubmit) : undefined}>
        <Modal.Body>
          {isPaid ? (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Registration Fee: {formatCurrency(event.registrationFee)}
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Please send the payment to the following bKash number and enter
                  your transaction ID below.
                </p>
              </div>

              <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  bKash Number
                </p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {event.bkashNumber}
                </p>
              </div>

              <Input
                label="bKash Transaction ID"
                placeholder="Enter your transaction ID"
                error={errors.bkashTransactionId?.message}
                required
                {...register('bkashTransactionId', validationRules.bkashTransactionId)}
              />

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your registration will be pending until an admin verifies your
                  payment. You'll receive a notification once approved.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Free Event
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Click the button below to confirm your registration for{' '}
                <strong>{event.title}</strong>.
              </p>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          {isPaid ? (
            <Button type="submit" isLoading={isLoading}>
              Submit Payment
            </Button>
          ) : (
            <Button onClick={handleFreeJoin} isLoading={isLoading}>
              Confirm Registration
            </Button>
          )}
        </Modal.Footer>
      </form>
    </Modal>
  );
}
