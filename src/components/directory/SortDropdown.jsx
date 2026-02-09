import { ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { Dropdown } from '../common';

const sortOptions = [
  { value: 'name', label: 'Name (A-Z)', order: 'asc' },
  { value: 'name', label: 'Name (Z-A)', order: 'desc' },
  { value: 'bloodGroup', label: 'Blood Group', order: 'asc' },
  { value: 'createdAt', label: 'Newest First', order: 'desc' },
  { value: 'createdAt', label: 'Oldest First', order: 'asc' },
];

export default function SortDropdown({ sortBy, sortOrder, onSort }) {
  const currentLabel = sortOptions.find(
    (opt) => opt.value === sortBy && opt.order === sortOrder
  )?.label || 'Sort by';

  return (
    <Dropdown
      trigger={
        <button
          type="button"
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          {currentLabel}
          <ChevronUpDownIcon className="ml-2 h-4 w-4" />
        </button>
      }
      align="right"
    >
      {sortOptions.map((option, index) => (
        <Dropdown.Item
          key={`${option.value}-${option.order}`}
          onClick={() => onSort(option.value, option.order)}
        >
          {option.label}
        </Dropdown.Item>
      ))}
    </Dropdown>
  );
}
