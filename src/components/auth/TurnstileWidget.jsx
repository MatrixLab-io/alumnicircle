import { forwardRef } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { useTheme } from '../../contexts/ThemeContext';

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

const TurnstileWidget = forwardRef(function TurnstileWidget({ onSuccess, onExpire, onError }, ref) {
  const { isDark } = useTheme();

  return (
    <div className="flex justify-center">
      <Turnstile
        ref={ref}
        siteKey={SITE_KEY}
        onSuccess={onSuccess}
        onExpire={onExpire}
        onError={onError}
        options={{ theme: isDark ? 'dark' : 'light' }}
      />
    </div>
  );
});

export default TurnstileWidget;
