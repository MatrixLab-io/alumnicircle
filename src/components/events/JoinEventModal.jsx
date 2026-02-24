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
  const [cashGivenBy, setCashGivenBy] = useState('');
  const [cashContactNumber, setCashContactNumber] = useState('');

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
      cashGivenBy: chosenMethod === PAYMENT_METHODS.CASH ? cashGivenBy : null,
      cashContactNumber: chosenMethod === PAYMENT_METHODS.CASH ? cashContactNumber : null,
    });
    if (result) {
      setCashGivenBy('');
      setCashContactNumber('');
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

  // Returns array of numbers for the chosen method (handles legacy single-string too)
  const getMfsNumbers = () => {
    if (chosenMethod === PAYMENT_METHODS.BKASH) {
      if (Array.isArray(event.bkashNumbers) && event.bkashNumbers.length > 0) return event.bkashNumbers;
      return event.bkashNumber ? [event.bkashNumber] : [];
    }
    if (chosenMethod === PAYMENT_METHODS.NAGAD) {
      if (Array.isArray(event.nagadNumbers) && event.nagadNumbers.length > 0) return event.nagadNumbers;
      return event.nagadNumber ? [event.nagadNumber] : [];
    }
    return [];
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
                    onClick={() => { setChosenMethod(m); reset(); setCashGivenBy(''); setCashContactNumber(''); }}
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
              {(() => {
                const fee = event.registrationFee;
                const charge = Math.ceil(fee * 0.0185);
                const total = fee + charge;
                return (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm text-yellow-800 dark:text-yellow-200">
                      <span>Registration Fee</span>
                      <span className="font-medium">{formatCurrency(fee)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-yellow-700 dark:text-yellow-300">
                      <span>Cashout Charge (1.85%)</span>
                      <span>+ {formatCurrency(charge)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-yellow-900 dark:text-yellow-100 border-t border-yellow-200 dark:border-yellow-700 pt-2">
                      <span>Total to Send</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 pt-1">
                      Please send exactly <strong>{formatCurrency(total)}</strong> to the {getPaymentMethodLabel(chosenMethod)} number below, then enter your transaction ID &amp; sender number.
                    </p>
                  </div>
                );
              })()}

              <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Send to {getPaymentMethodLabel(chosenMethod)} Number
                </p>
                {getMfsNumbers().map((num, i) => (
                  <p key={i} className="text-2xl font-bold text-primary-600 dark:text-primary-400 leading-tight">
                    {num}
                  </p>
                ))}
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
            <div className="space-y-4">
              <div className="text-center">
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirmed By <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cashGivenBy}
                  onChange={(e) => setCashGivenBy(e.target.value)}
                  placeholder="Name of the person who confirmed payment"
                  className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {cashGivenBy.length > 0 && cashGivenBy.length < 2 && (
                  <p className="mt-1 text-xs text-red-500">Name must be at least 2 characters</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={cashContactNumber}
                  onChange={(e) => setCashContactNumber(e.target.value)}
                  placeholder="Their phone number"
                  className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {cashContactNumber.length > 0 && cashContactNumber.length < 8 && (
                  <p className="mt-1 text-xs text-red-500">Contact number must be at least 8 characters</p>
                )}
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your registration will be pending until an admin verifies your cash payment. You'll receive a notification once approved.
                </p>
              </div>
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
            <Button
              onClick={handleCashOrFreeJoin}
              isLoading={isLoading}
              disabled={isCashChosen && (cashGivenBy.trim().length < 2 || cashContactNumber.trim().length < 8)}
            >
              {isCashChosen ? 'Confirm & Join' : 'Confirm Registration'}
            </Button>
          )}
        </Modal.Footer>
      </form>
    </Modal>
  );
}
