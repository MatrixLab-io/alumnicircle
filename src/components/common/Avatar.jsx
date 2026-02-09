import { cn, getInitials } from '../../utils/helpers';

const sizes = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
  xl: 'h-16 w-16 text-xl',
  '2xl': 'h-24 w-24 text-2xl',
};

export default function Avatar({
  src,
  alt,
  name,
  size = 'md',
  className,
  ...props
}) {
  const initials = getInitials(name || alt);

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || 'Avatar'}
        className={cn(
          'rounded-full object-cover ring-2 ring-white dark:ring-gray-800',
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-medium',
        'bg-gradient-to-br from-primary-400 to-primary-600 text-white',
        'ring-2 ring-white dark:ring-gray-800',
        sizes[size],
        className
      )}
      {...props}
    >
      {initials}
    </div>
  );
}

// Avatar Group
Avatar.Group = function AvatarGroup({ children, max = 4, size = 'md', className }) {
  const childArray = Array.isArray(children) ? children : [children];
  const visible = childArray.slice(0, max);
  const remaining = childArray.length - max;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visible.map((child, index) => (
        <div key={index} className="relative" style={{ zIndex: visible.length - index }}>
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'relative rounded-full flex items-center justify-center font-medium',
            'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
            'ring-2 ring-white dark:ring-gray-800',
            sizes[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};
