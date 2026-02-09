import { Switch } from '@headlessui/react';
import { cn } from '../../utils/helpers';

export default function Toggle({
  enabled,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  className,
}) {
  const sizes = {
    sm: {
      switch: 'h-5 w-9',
      dot: 'h-3 w-3',
      translate: 'translate-x-4',
    },
    md: {
      switch: 'h-6 w-11',
      dot: 'h-4 w-4',
      translate: 'translate-x-5',
    },
    lg: {
      switch: 'h-7 w-14',
      dot: 'h-5 w-5',
      translate: 'translate-x-7',
    },
  };

  const currentSize = sizes[size];

  return (
    <Switch.Group as="div" className={cn('flex items-center justify-between', className)}>
      {(label || description) && (
        <div className="flex-grow">
          {label && (
            <Switch.Label
              as="span"
              className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
              passive
            >
              {label}
            </Switch.Label>
          )}
          {description && (
            <Switch.Description as="span" className="block text-sm text-gray-500 dark:text-gray-400">
              {description}
            </Switch.Description>
          )}
        </div>
      )}
      <Switch
        checked={enabled}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          'relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent',
          'transition-colors duration-200 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          enabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700',
          currentSize.switch
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none inline-block rounded-full bg-white shadow ring-0',
            'transform transition duration-200 ease-in-out',
            enabled ? currentSize.translate : 'translate-x-1',
            currentSize.dot
          )}
        />
      </Switch>
    </Switch.Group>
  );
}
