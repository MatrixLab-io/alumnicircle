import { cn } from '../../utils/helpers';

const variants = {
  glass: 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border border-white/20 dark:border-gray-700/50',
  solid: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700',
  outline: 'border-2 border-gray-200 dark:border-gray-700 bg-transparent',
};

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export default function Card({
  children,
  variant = 'glass',
  padding = 'md',
  hover = false,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        'rounded-xl shadow-xl',
        variants[variant],
        paddings[padding],
        hover && 'transition-all duration-200 hover:shadow-2xl hover:scale-[1.02]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Card subcomponents
Card.Header = function CardHeader({ children, className, ...props }) {
  return (
    <div
      className={cn('border-b border-gray-200 dark:border-gray-700 pb-4 mb-4', className)}
      {...props}
    >
      {children}
    </div>
  );
};

Card.Body = function CardBody({ children, className, ...props }) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ children, className, ...props }) {
  return (
    <div
      className={cn('border-t border-gray-200 dark:border-gray-700 pt-4 mt-4', className)}
      {...props}
    >
      {children}
    </div>
  );
};

Card.Title = function CardTitle({ children, className, ...props }) {
  return (
    <h3
      className={cn('text-lg font-semibold text-gray-900 dark:text-white', className)}
      {...props}
    >
      {children}
    </h3>
  );
};

Card.Description = function CardDescription({ children, className, ...props }) {
  return (
    <p
      className={cn('text-sm text-gray-500 dark:text-gray-400 mt-1', className)}
      {...props}
    >
      {children}
    </p>
  );
};
