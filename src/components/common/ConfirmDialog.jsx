import Modal from './Modal';
import Button from './Button';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) {
  const iconColors = {
    danger: 'text-red-500 bg-red-100 dark:bg-red-900/30',
    warning: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30',
  };

  const buttonVariants = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className={`p-3 rounded-full ${iconColors[variant]} mb-4`}>
            <ExclamationTriangleIcon className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          {message && (
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {message}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 px-6 pb-6">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="flex-1"
        >
          {cancelLabel}
        </Button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={`flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${buttonVariants[variant]}`}
        >
          {isLoading ? (
            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : null}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
