import { forwardRef } from 'react';
import { cn } from '../../utils/helpers';

const Checkbox = forwardRef(function Checkbox(
  {
    label,
    description,
    error,
    disabled = false,
    className,
    ...props
  },
  ref
) {
  return (
    <div className={cn('relative flex items-start', className)}>
      <div className="flex items-center h-5">
        <input
          ref={ref}
          type="checkbox"
          disabled={disabled}
          className={cn(
            'h-4 w-4 rounded transition-colors duration-200',
            'border-gray-300 dark:border-gray-600',
            'text-primary-600 focus:ring-primary-500',
            'bg-white/50 dark:bg-gray-800/50',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-red-500'
          )}
          {...props}
        />
      </div>
      {(label || description) && (
        <div className="ml-3 text-sm">
          {label && (
            <label
              htmlFor={props.id}
              className={cn(
                'font-medium cursor-pointer',
                disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-gray-500 dark:text-gray-400">{description}</p>
          )}
          {error && (
            <p className="text-red-500 mt-1">{error}</p>
          )}
        </div>
      )}
    </div>
  );
});

export default Checkbox;
