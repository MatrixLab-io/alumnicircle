import ReactPhoneInput from 'react-phone-number-input';
import { cn } from '../../utils/helpers';
import 'react-phone-number-input/style.css';

/**
 * International phone number input with country code selector.
 * Works as a controlled component — use with react-hook-form's Controller.
 *
 * @example
 * <Controller
 *   name="phone"
 *   control={control}
 *   rules={{ required: 'Phone is required', validate: isValidPhone }}
 *   render={({ field }) => (
 *     <PhoneInput label="Phone" value={field.value} onChange={field.onChange} error={errors.phone?.message} />
 *   )}
 * />
 */
export default function PhoneInput({
  label,
  value,
  onChange,
  error,
  helperText,
  required = false,
  className,
  placeholder = 'Phone number',
  defaultCountry = 'BD',
  disabled = false,
}) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div
        className={cn(
          'phone-input-wrapper',
          'flex rounded-lg overflow-hidden transition-all duration-200',
          'bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm',
          'border border-gray-200 dark:border-gray-700',
          'focus-within:ring-2 focus-within:ring-primary-500/50 focus-within:border-primary-500',
          error && 'border-red-500 focus-within:ring-red-500/50 focus-within:border-red-500',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <ReactPhoneInput
          international
          defaultCountry={defaultCountry}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
}
