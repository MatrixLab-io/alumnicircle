import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Button, Input } from '../common';
import { formatCurrency, getEventPaymentMethods, getPaymentMethodLabel } from '../../utils/helpers';
import { validationRules } from '../../utils/validators';
import { PAYMENT_METHODS } from '../../config/constants';

export default function JoinEventModal({
  event,
  isOpen,
  onClose,
  onJoin,
  isLoading,
}) {
  const isPaid = event?.registrationFee > 0;
  const methods = event ? getEventPaymentMethods(event) : [];

  const [chosenMethod, setChosenMethod] = useState(null);

  // Auto-select if only one method (or free event)
  useEffect(() => {
    if (methods.length === 1) {
      setChosenMethod(methods[0]);
    } else {
      setChosenMethod(null);
    }
  }, [event?.id, methods.length]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const result = await onJoin({
      paymentMethod: chosenMethod,
      transactionId: data.transactionId || null,
      paymentSenderNumber: data.paymentSenderNumber || null,
    });
    if (result) {
      reset();
      setChosenMethod(methods.length === 1 ? methods[0] : null);
      onClose();
    }
  };

  const handleCashOrFreeJoin = async () => {
    const result = await onJoin({
      paymentMethod: chosenMethod || null,
      transactionId: null,
    });
    if (result) {
      setChosenMethod(methods.length === 1 ? methods[0] : null);
      onClose();
    }
  };

  if (!event) return null;

  const needsTxId = chosenMethod === PAYMENT_METHODS.BKASH || chosenMethod === PAYMENT_METHODS.NAGAD;
  const isCashChosen = chosenMethod === PAYMENT_METHODS.CASH;
  const showMethodPicker = isPaid && methods.length > 1;

  const getTitle = () => {
    if (!isPaid) return 'Join Event';
    if (!chosenMethod && showMethodPicker) return 'Select Payment Method';
    if (needsTxId) return 'Payment Required';
    if (isCashChosen) return 'Cash Payment';
    return 'Payment Required';
  };

  const getMfsNumber = () => {
    if (chosenMethod === PAYMENT_METHODS.BKASH) return event.bkashNumber;
    if (chosenMethod === PAYMENT_METHODS.NAGAD) return event.nagadNumber;
    return null;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      size="md"
    >
      <form onSubmit={needsTxId ? handleSubmit(onSubmit) : undefined}>
        <Modal.Body>
          {/* Method picker when multiple methods */}
          {showMethodPicker && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Choose Payment Method
              </label>
              <div className="flex flex-wrap gap-2">
                {methods.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setChosenMethod(m); reset(); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      chosenMethod === m
                        ? 'bg-primary-600 text-white'
                        : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {getPaymentMethodLabel(m)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MFS (bKash/Nagad) flow */}
          {isPaid && needsTxId ? (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Registration Fee: {formatCurrency(event.registrationFee)}
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Please send the payment to the following {getPaymentMethodLabel(chosenMethod)} number and enter
                  your transaction ID below.
                </p>
              </div>

              <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {getPaymentMethodLabel(chosenMethod)} Number
                </p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {getMfsNumber()}
                </p>
              </div>

              <Input
                label={`${getPaymentMethodLabel(chosenMethod)} Transaction ID`}
                placeholder="Enter your transaction ID"
                error={errors.transactionId?.message}
                required
                {...register('transactionId', validationRules.bkashTransactionId)}
              />

              <Input
                label="Payment Sent From (Number)"
                type="tel"
                placeholder="01XXXXXXXXX"
                error={errors.paymentSenderNumber?.message}
                required
                {...register('paymentSenderNumber', {
                  required: 'Please enter the number you sent payment from',
                  pattern: {
                    value: /^01[3-9]\d{8}$/,
                    message: 'Enter a valid BD phone number (01XXXXXXXXX)',
                  },
                })}
              />

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your registration will be pending until an admin verifies your
                  payment. You'll receive a notification once approved.
                </p>
              </div>
            </div>
          ) : isPaid && isCashChosen ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Pay by Cash
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Registration Fee: <strong>{formatCurrency(event.registrationFee)}</strong>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You will pay in cash at the event venue. Your registration will be pending until approved by an admin.
              </p>
            </div>
          ) : isPaid && !chosenMethod && showMethodPicker ? (
            <div className="text-center py-4">
              <p className="text-gray-500 dark:text-gray-400">
                Please select a payment method above to continue.
              </p>
            </div>
          ) : !isPaid ? (
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
          ) : null}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          {needsTxId ? (
            <Button type="submit" isLoading={isLoading}>
              Submit Payment
            </Button>
          ) : (isPaid && !chosenMethod && showMethodPicker) ? (
            <Button disabled>
              Select a Method
            </Button>
          ) : (
            <Button onClick={handleCashOrFreeJoin} isLoading={isLoading}>
              {isCashChosen ? 'Register (Pay at Venue)' : 'Confirm Registration'}
            </Button>
          )}
        </Modal.Footer>
      </form>
    </Modal>
  );
}
