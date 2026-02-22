import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  UsersIcon,
  CalendarIcon,
  UserPlusIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import AuthProviderBadge from '../../components/admin/AuthProviderBadge';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/layout';
import { Card, Button, Badge, Spinner, Avatar } from '../../components/common';
import { getUserStats, getPendingUsers, getLatestMembers } from '../../services/user.service';
import { getEventStats, syncEventStatuses } from '../../services/event.service';
import { formatDate } from '../../utils/helpers';
import { ADMIN_ROUTES } from '../../config/routes';
import { APP_NAME } from '../../config/constants';

export default function AdminDashboard() {
  const { userProfile } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [eventStats, setEventStats] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [latestMembers, setLatestMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      // Sync stale event statuses first, then fetch stats
      await syncEventStatuses().catch(() => {});
      const [users, events, pending, latest] = await Promise.all([
        getUserStats().catch(() => null),
        getEventStats().catch(() => null),
        getPendingUsers().catch(() => []),
        getLatestMembers(5).catch(() => []),
      ]);
      if (users) setUserStats(users);
      if (events) setEventStats(events);
      setPendingUsers((pending || []).slice(0, 5));
      setLatestMembers(latest || []);
    } catch (error) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  if (loading) {
    return <Spinner.Page message="Loading dashboard..." />;
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | {APP_NAME}</title>
      </Helmet>

      <PageHeader
        title="Admin Dashboard"
        description="Manage users, events, and community settings"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              isLoading={refreshing}
              leftIcon={<ArrowPathIcon className="h-4 w-4" />}
            >
              Refresh
            </Button>
            <Link to={ADMIN_ROUTES.CREATE_EVENT}>
              <Button>Create Event</Button>
            </Link>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <Card className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
            <UsersIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Members</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {userStats?.approved || 0}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex-shrink-0">
            <ShieldCheckIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Admins</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {userStats?.admins || 0}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex-shrink-0">
            <UserPlusIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {userStats?.pending || 0}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex-shrink-0">
            <EnvelopeIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Unverified</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {userStats?.approvedUnverified || 0}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 flex-shrink-0">
            <CalendarIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Upcoming</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {eventStats?.upcoming || 0}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex-shrink-0">
            <CheckCircleIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active Events</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {eventStats?.ongoing || 0}
            </p>
          </div>
        </Card>

      </div>

      {/* Pending Approvals */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Pending User Approvals
          </h3>
          <Link
            to={ADMIN_ROUTES.USER_APPROVALS}
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            View All
          </Link>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircleIcon className="h-12 w-12 mx-auto text-green-400 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              No pending approvals
            </p>
          </div>
        ) : (
          <>
          {/* Mobile: stacked rows */}
          <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
            {pendingUsers.map((user) => (
              <div key={user.uid} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={user.photo} name={user.name} size="sm" />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <AuthProviderBadge provider={user.authProvider} />
                      {user.authProvider === 'email' && !user.emailVerified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                          <ExclamationTriangleIcon className="h-3 w-3" />
                          Not verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Link
                  to={ADMIN_ROUTES.USER_APPROVALS}
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium flex-shrink-0"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>

          {/* Desktop: full table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Phone</th>
                  <th className="pb-3 font-medium">Provider</th>
                  <th className="pb-3 font-medium">Registered</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {pendingUsers.map((user) => (
                  <tr key={user.uid}>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={user.photo} name={user.name} size="sm" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">
                      {user.email}
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">
                      {user.phone}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-row flex-wrap items-center gap-1">
                        <AuthProviderBadge provider={user.authProvider} />
                        {user.authProvider === 'email' && !user.emailVerified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                            <ExclamationTriangleIcon className="h-3 w-3" />
                            Not verified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="py-3">
                      <Link
                        to={ADMIN_ROUTES.USER_APPROVALS}
                        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link to={ADMIN_ROUTES.USER_APPROVALS}>
          <Card hover className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/30">
              <UserPlusIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Review Pending Users
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {userStats?.pending || 0} waiting for approval
              </p>
            </div>
          </Card>
        </Link>

        <Link to={ADMIN_ROUTES.CREATE_EVENT}>
          <Card hover className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
              <CalendarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Create New Event
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Plan a reunion or gathering
              </p>
            </div>
          </Card>
        </Link>

        <Link to={ADMIN_ROUTES.ALL_USERS}>
          <Card hover className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <UsersIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Manage All Users
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View and manage members
              </p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Latest Joined Members */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Latest Joined Members
          </h3>
          <Link
            to={ADMIN_ROUTES.ALL_USERS}
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            View All
          </Link>
        </div>

        {latestMembers.length === 0 ? (
          <div className="text-center py-8">
            <UsersIcon className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No approved members yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {latestMembers.map((member) => (
              <div key={member.uid} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={member.photo} name={member.name} size="sm" />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{member.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.email}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <AuthProviderBadge provider={member.authProvider} />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {formatDate(member.approvedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
