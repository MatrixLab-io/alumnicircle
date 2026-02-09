import { cn } from '../../utils/helpers';

export default function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
  className,
}) {
  return (
    <div className={cn('mb-8', className)}>
      {breadcrumb && (
        <nav className="mb-4">
          {breadcrumb}
        </nav>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
