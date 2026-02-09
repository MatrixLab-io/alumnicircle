import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { cn } from '../../utils/helpers';

export default function Dropdown({
  trigger,
  children,
  align = 'right',
  width = 'w-48',
  className,
}) {
  const alignments = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <Menu as="div" className={cn('relative inline-block text-left', className)}>
      <Menu.Button as={Fragment}>
        {trigger}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={cn(
            'absolute z-50 mt-2 origin-top-right rounded-xl overflow-hidden',
            'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl',
            'border border-gray-200 dark:border-gray-700',
            'shadow-lg ring-1 ring-black/5',
            'focus:outline-none',
            width,
            alignments[align]
          )}
        >
          <div className="py-1">{children}</div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

// Dropdown Item
Dropdown.Item = function DropdownItem({
  children,
  icon,
  onClick,
  disabled = false,
  danger = false,
  className,
}) {
  return (
    <Menu.Item disabled={disabled}>
      {({ active }) => (
        <button
          type="button"
          onClick={onClick}
          className={cn(
            'w-full flex items-center px-4 py-2 text-sm transition-colors',
            active && 'bg-gray-100 dark:bg-gray-800',
            disabled && 'opacity-50 cursor-not-allowed',
            danger
              ? 'text-red-600 dark:text-red-400'
              : 'text-gray-700 dark:text-gray-300',
            className
          )}
        >
          {icon && <span className="mr-3 h-5 w-5">{icon}</span>}
          {children}
        </button>
      )}
    </Menu.Item>
  );
};

// Dropdown Divider
Dropdown.Divider = function DropdownDivider() {
  return <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />;
};

// Dropdown Label
Dropdown.Label = function DropdownLabel({ children }) {
  return (
    <div className="px-4 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
      {children}
    </div>
  );
};

// Simple Dropdown Button Trigger
Dropdown.Button = function DropdownButton({ children, className }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg',
        'bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm',
        'border border-gray-200 dark:border-gray-700',
        'text-gray-700 dark:text-gray-300',
        'hover:bg-gray-50 dark:hover:bg-gray-800',
        'focus:outline-none focus:ring-2 focus:ring-primary-500',
        className
      )}
    >
      {children}
      <ChevronDownIcon className="ml-2 -mr-1 h-4 w-4" />
    </button>
  );
};
