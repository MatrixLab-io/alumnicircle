import { cn } from '../../utils/helpers';
import Button from './Button';

export default function EmptyState({
  icon,
  title,
  description,
  action,
  actionLabel,
  secondaryAction,
  secondaryActionLabel,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-gray-400 dark:text-gray-500">
          {icon}
        </div>
      )}
      {title && (
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <Button onClick={action}>
              {actionLabel || 'Take Action'}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction}>
              {secondaryActionLabel || 'Cancel'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
