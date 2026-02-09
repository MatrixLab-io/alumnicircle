import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { UsersIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/layout';
import { Card, Spinner, EmptyState, Avatar, Badge, Dropdown, Button } from '../../components/common';
import { SearchBar } from '../../components/directory';
import { getAllUsers } from '../../services/user.service';
import { formatDate, getStatusColor, getRoleDisplayName } from '../../utils/helpers';
import { APP_NAME, USER_STATUS } from '../../config/constants';

export default function AllUsers() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, [statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const status = statusFilter === 'all' ? null : statusFilter;
      const result = await getAllUsers({ status, pageSize: 100 });
      setUsers(result.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.phone?.includes(term)
    );
  });

  const statusFilters = [
    { value: 'all', label: 'All Users' },
    { value: USER_STATUS.APPROVED, label: 'Approved' },
    { value: USER_STATUS.PENDING, label: 'Pending' },
    { value: USER_STATUS.REJECTED, label: 'Rejected' },
  ];

  return (
    <>
      <Helmet>
        <title>All Users | {APP_NAME}</title>
      </Helmet>

      <PageHeader
        title="All Users"
        description={`${filteredUsers.length} total users`}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by name, email, phone..."
          className="flex-1"
        />
        <Dropdown
          trigger={
            <button className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
              <FunnelIcon className="h-4 w-4 mr-2" />
              {statusFilters.find((f) => f.value === statusFilter)?.label}
            </button>
          }
          align="right"
        >
          {statusFilters.map((filter) => (
            <Dropdown.Item
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
            </Dropdown.Item>
          ))}
        </Dropdown>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={<UsersIcon className="h-12 w-12" />}
          title="No users found"
          description={searchTerm ? 'Try adjusting your search' : 'No users match the current filter'}
        />
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar src={user.photo} name={user.name} size="sm" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {getRoleDisplayName(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
