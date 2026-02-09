import { forwardRef } from 'react';
import { cn } from '../../utils/helpers';

const Textarea = forwardRef(function Textarea(
  {
    label,
    placeholder,
    error,
    helperText,
    disabled = false,
    required = false,
    rows = 4,
    className,
    textareaClassName,
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
      <textarea
        ref={ref}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={cn(
          'w-full rounded-lg transition-all duration-200 resize-none',
          'bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm',
          'border border-gray-200 dark:border-gray-700',
          'text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'px-4 py-2.5',
          error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
          textareaClassName
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
});

export default Textarea;
