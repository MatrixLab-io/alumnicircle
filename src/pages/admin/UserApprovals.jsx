import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { CheckIcon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/layout';
import { Card, Button, Spinner, EmptyState, Avatar, Badge } from '../../components/common';
import { getPendingUsers, approveUser, rejectUser } from '../../services/user.service';
import { formatDate } from '../../utils/helpers';
import { APP_NAME } from '../../config/constants';

export default function UserApprovals() {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const result = await getPendingUsers();
      setUsers(result);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      toast.error('Failed to load pending users');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (uid) => {
    setProcessingId(uid);
    try {
      await approveUser(uid, userProfile.uid);
      toast.success('User approved successfully');
      setUsers((prev) => prev.filter((u) => u.uid !== uid));
    } catch (error) {
      toast.error('Failed to approve user');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (uid) => {
    if (!confirm('Are you sure you want to reject this user?')) return;

    setProcessingId(uid);
    try {
      await rejectUser(uid, userProfile.uid);
      toast.success('User rejected');
      setUsers((prev) => prev.filter((u) => u.uid !== uid));
    } catch (error) {
      toast.error('Failed to reject user');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>User Approvals | {APP_NAME}</title>
      </Helmet>

      <PageHeader
        title="User Approvals"
        description={`${users.length} users waiting for approval`}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={<CheckIcon className="h-12 w-12" />}
          title="All caught up!"
          description="No pending user approvals"
        />
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <Card key={user.uid}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar src={user.photo} name={user.name} size="lg" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {user.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.phone}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Registered {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(user.uid)}
                    disabled={processingId === user.uid}
                    className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(user.uid)}
                    isLoading={processingId === user.uid}
                  >
                    <CheckIcon className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
