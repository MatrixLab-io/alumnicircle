import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { cn } from '../../utils/helpers';

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) {
  if (totalPages <= 1) return null;

  const pages = [];
  const showEllipsisStart = currentPage > 3;
  const showEllipsisEnd = currentPage < totalPages - 2;

  // Always show first page
  pages.push(1);

  if (showEllipsisStart) {
    pages.push('...');
  }

  // Show pages around current page
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
    if (!pages.includes(i)) {
      pages.push(i);
    }
  }

  if (showEllipsisEnd) {
    pages.push('...');
  }

  // Always show last page
  if (totalPages > 1 && !pages.includes(totalPages)) {
    pages.push(totalPages);
  }

  return (
    <nav
      className={cn('flex items-center justify-center gap-1', className)}
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          'p-2 rounded-lg transition-colors',
          'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
          'dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>

      {pages.map((page, index) => (
        page === '...' ? (
          <span
            key={`ellipsis-${index}`}
            className="px-3 py-2 text-gray-400"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={cn(
              'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              page === currentPage
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            )}
          >
            {page}
          </button>
        )
      ))}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          'p-2 rounded-lg transition-colors',
          'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
          'dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    </nav>
  );
}
