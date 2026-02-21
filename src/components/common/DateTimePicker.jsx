import { useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { cn } from '../../utils/helpers';

export default function DateTimePicker({
  label,
  value,
  onChange,
  error,
  required = false,
  placeholder = 'Select date & time',
  minDate = null,
  maxDate = null,
  className,
}) {
  const inputRef = useRef(null);
  const fpRef = useRef(null);

  useEffect(() => {
    if (!inputRef.current) return;

    fpRef.current = flatpickr(inputRef.current, {
      enableTime: true,
      dateFormat: 'F j, Y h:i K',
      time_24hr: false,
      defaultDate: value || null,
      minDate: minDate || undefined,
      maxDate: maxDate || undefined,
      disableMobile: true,
      onChange: ([date]) => {
        if (onChange) onChange(date || null);
      },
    });

    return () => {
      fpRef.current?.destroy();
    };
  }, []);

  // Update minDate/maxDate dynamically
  useEffect(() => {
    if (fpRef.current && minDate) {
      fpRef.current.set('minDate', minDate);
    }
  }, [minDate]);

  useEffect(() => {
    if (fpRef.current) {
      fpRef.current.set('maxDate', maxDate || undefined);
    }
  }, [maxDate]);

  // Sync external value changes
  useEffect(() => {
    if (fpRef.current && value) {
      const currentDate = fpRef.current.selectedDates[0];
      const newDate = value instanceof Date ? value : new Date(value);
      if (!currentDate || currentDate.getTime() !== newDate.getTime()) {
        fpRef.current.setDate(newDate, false);
      }
    }
  }, [value]);

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={inputRef}
        placeholder={placeholder}
        readOnly
        className={cn(
          'w-full rounded-lg transition-all duration-200 cursor-pointer',
          'bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm',
          'border border-gray-200 dark:border-gray-700',
          'text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
          'px-4 py-2.5',
          error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
        )}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
