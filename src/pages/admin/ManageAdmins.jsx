import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ShieldCheckIcon, UserPlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/layout';
import { Card, Button, Spinner, EmptyState, Avatar, Badge, Modal, Input, Select, ConfirmDialog } from '../../components/common';
import { getAllUsers, updateUserRole } from '../../services/user.service';
import { formatDate } from '../../utils/helpers';
import { APP_NAME, USER_ROLES, USER_STATUS } from '../../config/constants';

export default function ManageAdmins() {
  const { userProfile } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getAllUsers({ pageSize: 200 });
      const users = result.users;

      // Separate admins and regular users
      const adminUsers = users.filter(
        (u) => u.role === USER_ROLES.ADMIN || u.role === USER_ROLES.SUPER_ADMIN
      );
      const regularUsers = users.filter(
        (u) => u.role === USER_ROLES.USER && u.status === USER_STATUS.APPROVED
      );

      setAdmins(adminUsers);
      setAllUsers(regularUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }

    setIsProcessing(true);
    try {
      await updateUserRole(selectedUserId, USER_ROLES.ADMIN, { uid: userProfile.uid, name: userProfile.name, email: userProfile.email });
      toast.success('Admin added successfully');
      setShowAddModal(false);
      setSelectedUserId('');
      await fetchData();
    } catch (error) {
      toast.error('Failed to add admin');
    } finally {
      setIsProcessing(false);
    }
  };

  const executeRemoveAdmin = async () => {
    const admin = removeTarget;
    if (!admin) return;
    setRemoveTarget(null);

    setIsProcessing(true);
    try {
      await updateUserRole(admin.uid, USER_ROLES.USER, { uid: userProfile.uid, name: userProfile.name, email: userProfile.email });
      toast.success('Admin removed');
      await fetchData();
    } catch (error) {
      toast.error('Failed to remove admin');
    } finally {
      setIsProcessing(false);
    }
  };

  const userOptions = allUsers.map((u) => ({
    value: u.uid,
    label: `${u.name} (${u.email})`,
  }));

  return (
    <>
      <Helmet>
        <title>Manage Admins | {APP_NAME}</title>
      </Helmet>

      <PageHeader
        title="Manage Admins"
        description="Add or remove system administrators"
        actions={
          <Button
            onClick={() => setShowAddModal(true)}
            leftIcon={<UserPlusIcon className="h-4 w-4" />}
          >
            Add Admin
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : admins.length === 0 ? (
        <EmptyState
          icon={<ShieldCheckIcon className="h-12 w-12" />}
          title="No admins"
          description="Add your first admin to help manage the community"
        />
      ) : (
        <div className="space-y-4">
          {admins.map((admin) => (
            <Card key={admin.uid}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar src={admin.photo} name={admin.name} size="lg" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {admin.name}
                      </h3>
                      {admin.uid === userProfile.uid && (
                        <Badge variant="blue" size="sm">You</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {admin.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={admin.role === USER_ROLES.SUPER_ADMIN ? 'purple' : 'green'}>
                        {admin.role === USER_ROLES.SUPER_ADMIN ? 'Super Admin' : 'Admin'}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        Since {formatDate(admin.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {admin.role !== USER_ROLES.SUPER_ADMIN && admin.uid !== userProfile.uid && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRemoveTarget(admin)}
                    className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Admin Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Admin"
      >
        <Modal.Body>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Select an approved member to grant admin privileges. Admins can approve users
            and manage events.
          </p>
          <Select
            label="Select User"
            options={userOptions}
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            placeholder="Choose a member..."
          />
          {userOptions.length === 0 && (
            <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
              No approved members available to add as admin.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddAdmin}
            isLoading={isProcessing}
            disabled={!selectedUserId}
          >
            Add Admin
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Remove Admin Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={executeRemoveAdmin}
        variant="warning"
        title="Remove admin?"
        message={`This will revoke admin privileges from ${removeTarget?.name || 'this user'}. They will become a regular member.`}
        confirmLabel="Remove Admin"
      />
    </>
  );
}
