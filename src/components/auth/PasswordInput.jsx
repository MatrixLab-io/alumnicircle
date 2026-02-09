import { useState, forwardRef } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Input from '../common/Input';

const PasswordInput = forwardRef(function PasswordInput(
  { label = 'Password', ...props },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = () => setShowPassword(!showPassword);

  return (
    <Input
      ref={ref}
      type={showPassword ? 'text' : 'password'}
      label={label}
      rightIcon={
        <button
          type="button"
          onClick={toggleVisibility}
          className="focus:outline-none hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          {showPassword ? (
            <EyeSlashIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      }
      {...props}
    />
  );
});

export default PasswordInput;
