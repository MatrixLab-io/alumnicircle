import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  UsersIcon,
  CalendarIcon,
  UserPlusIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

function AuthProviderBadge({ provider }) {
  if (provider === 'google') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
        <svg className="h-3 w-3" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
      <EnvelopeIcon className="h-3 w-3" />
      Email
    </span>
  );
}
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/layout';
import { Card, Button, Badge, Spinner, Avatar } from '../../components/common';
import { getUserStats, getPendingUsers } from '../../services/user.service';
import { getEventStats } from '../../services/event.service';
import { formatDate } from '../../utils/helpers';
import { ADMIN_ROUTES } from '../../config/routes';
import { APP_NAME } from '../../config/constants';

export default function AdminDashboard() {
  const { userProfile } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [eventStats, setEventStats] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [users, events, pending] = await Promise.all([
        getUserStats(),
        getEventStats(),
        getPendingUsers(),
      ]);
      setUserStats(users);
      setEventStats(events);
      setPendingUsers(pending.slice(0, 5));
    } catch (error) {

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <UsersIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Members</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {userStats?.approved || 0}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/30">
            <UserPlusIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pending Approvals</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {userStats?.pending || 0}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
            <CalendarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming Events</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {eventStats?.upcoming || 0}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
            <CheckCircleIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Active Events</p>
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
                    <div className="mt-1">
                      <AuthProviderBadge provider={user.authProvider} />
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
                      <AuthProviderBadge provider={user.authProvider} />
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
    </>
  );
}
