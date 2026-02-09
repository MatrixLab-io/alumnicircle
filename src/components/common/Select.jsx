import { forwardRef } from 'react';
import { cn } from '../../utils/helpers';

const Select = forwardRef(function Select(
  {
    label,
    options = [],
    placeholder = 'Select an option',
    error,
    helperText,
    disabled = false,
    required = false,
    className,
    selectClassName,
    ...props
  },
  ref
) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          disabled={disabled}
          className={cn(
            'w-full rounded-lg transition-all duration-200 appearance-none',
            'bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm',
            'border border-gray-200 dark:border-gray-700',
            'text-gray-900 dark:text-white',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'px-4 py-2.5 pr-10',
            error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
            selectClassName
          )}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
});

export default Select;
