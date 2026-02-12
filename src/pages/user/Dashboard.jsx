import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  UsersIcon,
  CalendarIcon,
  UserCircleIcon,
  ArrowRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/layout';
import { Card, Button, Badge, Spinner, Avatar } from '../../components/common';
import { getUserStats } from '../../services/user.service';
import { getAllEvents, getUserEvents } from '../../services/event.service';
import { formatDate, getEventLiveStatus } from '../../utils/helpers';
import { formatEventLocation } from '../../utils/formatters';
import { USER_ROUTES, getEventDetailsRoute } from '../../config/routes';
import { APP_NAME } from '../../config/constants';

export default function Dashboard() {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [userStats, events, myEvents] = await Promise.all([
        getUserStats(),
        getAllEvents({ status: 'upcoming' }),
        userProfile?.uid ? getUserEvents(userProfile.uid) : [],
      ]);
      setStats(userStats);
      const activeEvents = events.filter((e) => getEventLiveStatus(e).status !== 'ended');
      setUpcomingEvents(activeEvents.slice(0, 3));
      setRegisteredEventIds(new Set(myEvents.map((e) => e.eventId)));
    } catch (error) {
      // silently handled
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

  const profileCompletion = userProfile?.profileCompletion || 0;

  return (
    <>
      <Helmet>
        <title>Dashboard | {APP_NAME}</title>
      </Helmet>

      <PageHeader
        title={`Welcome back, ${userProfile?.name?.split(' ')[0]}!`}
        description="Here's what's happening in your alumni community"
        actions={
          <Button
            variant="outline"
            onClick={handleRefresh}
            isLoading={refreshing}
            leftIcon={<ArrowPathIcon className="h-4 w-4" />}
          >
            Refresh
          </Button>
        }
      />

      {/* Profile Completion Banner */}
      {profileCompletion < 100 && (
        <Card className="mb-8 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar src={userProfile?.photo} name={userProfile?.name} size="lg" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Complete Your Profile
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your profile is {profileCompletion}% complete. Add more info to help classmates find you.
                </p>
                <div className="mt-2 w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 rounded-full transition-all duration-500"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
              </div>
            </div>
            <Link to={USER_ROUTES.EDIT_PROFILE}>
              <Button size="sm">
                Complete Profile
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <UsersIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Members</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.approved || 0}
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
              {upcomingEvents.length}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
            <UserCircleIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Profile Complete</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {profileCompletion}%
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/30">
            <UsersIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Batch</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              2003
            </p>
          </div>
        </Card>
      </div>

      {/* Quick Actions & Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link
              to={USER_ROUTES.DIRECTORY}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <UsersIcon className="h-5 w-5 text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Browse Directory
                </span>
              </div>
              <ArrowRightIcon className="h-4 w-4 text-gray-400" />
            </Link>

            <Link
              to={USER_ROUTES.EVENTS}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">
                  View Events
                </span>
              </div>
              <ArrowRightIcon className="h-4 w-4 text-gray-400" />
            </Link>

            <Link
              to={USER_ROUTES.PROFILE}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <UserCircleIcon className="h-5 w-5 text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">
                  My Profile
                </span>
              </div>
              <ArrowRightIcon className="h-4 w-4 text-gray-400" />
            </Link>
          </div>
        </Card>

        {/* Upcoming Events */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Upcoming Events
            </h3>
            <Link
              to={USER_ROUTES.EVENTS}
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              View All
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No upcoming events at the moment
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <CalendarIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {event.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(event.startDate)} - {formatEventLocation(event.location)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={event.registrationFee > 0 ? 'yellow' : 'green'} size="sm">
                      {event.registrationFee > 0 ? 'Paid' : 'Free'}
                    </Badge>
                    {registeredEventIds.has(event.id) ? (
                      <Badge variant="green" size="sm">Registered</Badge>
                    ) : (
                      <Link to={getEventDetailsRoute(event.id)}>
                        <Button size="sm">
                          Register
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
