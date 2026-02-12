import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { UsersIcon, FunnelIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/layout';
import { Card, Spinner, EmptyState, Avatar, Badge, Dropdown, Button, ConfirmDialog } from '../../components/common';
import { SearchBar } from '../../components/directory';
import { getAllUsers, deleteUser, deleteUsers } from '../../services/user.service';
import { formatDate, getStatusColor, getRoleDisplayName } from '../../utils/helpers';
import { APP_NAME, USER_STATUS, USER_ROLES } from '../../config/constants';

export default function AllUsers() {
  const { userProfile, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [processingId, setProcessingId] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [confirmState, setConfirmState] = useState({ open: false, type: null, uid: null });

  useEffect(() => {
    fetchUsers();
  }, [statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    setSelectedIds(new Set());
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

  // Users that can be deleted (not yourself, not super admins)
  const deletableUsers = filteredUsers.filter(
    (u) => u.uid !== userProfile?.uid && u.role !== USER_ROLES.SUPER_ADMIN
  );

  const toggleSelect = (uid) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) {
        next.delete(uid);
      } else {
        next.add(uid);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === deletableUsers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(deletableUsers.map((u) => u.uid)));
    }
  };

  const adminInfo = {
    uid: userProfile?.uid,
    name: userProfile?.name,
    email: userProfile?.email,
  };

  const openDeleteConfirm = (uid) => setConfirmState({ open: true, type: 'single', uid });
  const openBulkDeleteConfirm = () => setConfirmState({ open: true, type: 'bulk', uid: null });
  const closeConfirm = () => setConfirmState({ open: false, type: null, uid: null });

  const handleConfirmAction = async () => {
    if (confirmState.type === 'single') {
      await executeSingleDelete(confirmState.uid);
    } else if (confirmState.type === 'bulk') {
      await executeBulkDelete();
    }
    closeConfirm();
  };

  const executeSingleDelete = async (uid) => {
    setProcessingId(uid);
    try {
      await deleteUser(uid, adminInfo);
      toast.success('User deleted');
      setUsers((prev) => prev.filter((u) => u.uid !== uid));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(uid);
        return next;
      });
    } catch (error) {
      toast.error('Failed to delete user');
    } finally {
      setProcessingId(null);
    }
  };

  const executeBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      const { succeeded, failed } = await deleteUsers([...selectedIds], adminInfo);
      if (failed > 0) {
        toast.error(`${failed} user${failed > 1 ? 's' : ''} failed to delete`);
      }
      if (succeeded > 0) {
        toast.success(`${succeeded} user${succeeded > 1 ? 's' : ''} deleted`);
      }
      setUsers((prev) => prev.filter((u) => !selectedIds.has(u.uid)));
      setSelectedIds(new Set());
    } catch (error) {
      toast.error('Bulk delete failed');
    } finally {
      setBulkDeleting(false);
    }
  };

  const isDeletable = (user) =>
    user.uid !== userProfile?.uid && user.role !== USER_ROLES.SUPER_ADMIN;

  // Confirm dialog content
  const getConfirmProps = () => {
    if (confirmState.type === 'bulk') {
      const count = selectedIds.size;
      return {
        title: `Delete ${count} user${count > 1 ? 's' : ''}?`,
        message: `This will permanently remove ${count} user${count > 1 ? 's' : ''} and all their associated data. This action cannot be undone.`,
        confirmLabel: `Delete ${count} user${count > 1 ? 's' : ''}`,
        isLoading: bulkDeleting,
      };
    }
    const user = users.find((u) => u.uid === confirmState.uid);
    return {
      title: 'Delete user?',
      message: `This will permanently remove ${user?.name || 'this user'} (${user?.email || ''}) and all their associated data. This action cannot be undone.`,
      confirmLabel: 'Delete',
      isLoading: processingId === confirmState.uid,
    };
  };

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

      {/* Bulk Action Bar */}
      {isSuperAdmin && selectedIds.size > 0 && (
        <div className="flex items-center gap-4 mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <span className="text-sm font-medium text-red-700 dark:text-red-300">
            {selectedIds.size} user{selectedIds.size > 1 ? 's' : ''} selected
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={openBulkDeleteConfirm}
            isLoading={bulkDeleting}
            className="text-red-600 border-red-300 hover:bg-red-100 dark:hover:bg-red-900/30"
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            Delete Selected
          </Button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 ml-auto"
          >
            Clear selection
          </button>
        </div>
      )}

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
                  {isSuperAdmin && (
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={deletableUsers.length > 0 && selectedIds.size === deletableUsers.length}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                      />
                    </th>
                  )}
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
                  {isSuperAdmin && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => {
                  const canDelete = isDeletable(user);
                  return (
                    <tr key={user.uid} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      {isSuperAdmin && (
                        <td className="px-4 py-4">
                          {canDelete ? (
                            <input
                              type="checkbox"
                              checked={selectedIds.has(user.uid)}
                              onChange={() => toggleSelect(user.uid)}
                              className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                            />
                          ) : (
                            <span />
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Avatar src={user.photo} name={user.name} size="sm" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {user.name}
                            {user.uid === userProfile?.uid && (
                              <span className="ml-1.5 text-xs text-primary-600 dark:text-primary-400">(You)</span>
                            )}
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
                      {isSuperAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {canDelete && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openDeleteConfirm(user.uid)}
                              isLoading={processingId === user.uid}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmState.open}
        onClose={closeConfirm}
        onConfirm={handleConfirmAction}
        {...getConfirmProps()}
      />
    </>
  );
}
