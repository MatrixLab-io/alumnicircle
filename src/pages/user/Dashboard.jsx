import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  UsersIcon,
  CalendarIcon,
  UserCircleIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/layout';
import { Card, Button, Badge, Spinner, Avatar, Modal } from '../../components/common';
import { getUserStats } from '../../services/user.service';
import { getAllEvents, getUserEvents } from '../../services/event.service';
import { formatDate, formatDateTime, formatCurrency, getEventLiveStatus, getEventPaymentMethods, getPaymentMethodLabel } from '../../utils/helpers';
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
  const [selectedEvent, setSelectedEvent] = useState(null);

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
                <button
                  key={event.id}
                  type="button"
                  onClick={() => setSelectedEvent(event)}
                  className="w-full text-left p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <CalendarIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">
                        {event.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {formatDate(event.eventDate || event.startDate)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {formatEventLocation(event.location)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700/50">
                    <div className="flex items-center gap-2">
                      <Badge variant={event.registrationFee > 0 ? 'yellow' : 'green'} size="sm">
                        {event.registrationFee > 0 ? 'Paid' : 'Free'}
                      </Badge>
                      {registeredEventIds.has(event.id) && (
                        <Badge variant="green" size="sm">Registered</Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Event Detail Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || 'Event Details'}
        size="lg"
      >
        {selectedEvent && (() => {
          const ev = selectedEvent;
          const isFree = !ev.registrationFee || ev.registrationFee === 0;
          const liveStatus = getEventLiveStatus(ev);
          const isRegistered = registeredEventIds.has(ev.id);
          const isFull = ev.participantLimit && ev.currentParticipants >= ev.participantLimit;
          const spotsLeft = ev.participantLimit ? ev.participantLimit - (ev.currentParticipants || 0) : null;
          const methods = getEventPaymentMethods(ev);

          return (
            <>
              <Modal.Body>
                {/* Banner */}
                {ev.banner ? (
                  <img src={ev.banner} alt={ev.title} className="w-full h-40 object-cover rounded-lg mb-4" />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg mb-4 flex items-center justify-center">
                    <CalendarIcon className="h-14 w-14 text-white/50" />
                  </div>
                )}

                {/* Status badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge variant={liveStatus.variant} dot={liveStatus.dot}>{liveStatus.label}</Badge>
                  <Badge variant={isFree ? 'green' : 'yellow'}>
                    {isFree ? 'Free' : formatCurrency(ev.registrationFee)}
                  </Badge>
                  {isFull && <Badge variant="red">Full</Badge>}
                  {isRegistered && <Badge variant="green">Registered</Badge>}
                </div>

                {/* Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Date & Time</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDateTime(ev.eventDate || ev.startDate)}
                      </p>
                      {(ev.registrationDeadline || ev.endDate) && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Deadline: {formatDate(ev.registrationDeadline || ev.endDate)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <MapPinIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatEventLocation(ev.location)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <UsersIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Participants</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {ev.currentParticipants || 0}
                        {ev.participantLimit && <span className="text-gray-500 font-normal"> / {ev.participantLimit}</span>}
                        {spotsLeft !== null && spotsLeft > 0 && (
                          <span className="ml-2 text-xs text-green-600 dark:text-green-400">({spotsLeft} spots left)</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {!isFree && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <CurrencyDollarIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Registration Fee</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {formatCurrency(ev.registrationFee)}
                        </p>
                        {methods.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {methods.map((m) => (
                              <span key={m} className="px-1.5 py-0.5 rounded text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                                {getPaymentMethodLabel(m)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                {ev.description && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">About</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {ev.description}
                    </p>
                  </div>
                )}

                {/* Contact Persons */}
                {ev.contactPersons?.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Contact</h4>
                    <div className="space-y-2">
                      {ev.contactPersons.map((cp, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <PhoneIcon className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">{cp.name}</span>
                          <a href={`tel:${cp.phone}`} className="text-primary-600 dark:text-primary-400 hover:underline">{cp.phone}</a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Modal.Body>

              <Modal.Footer>
                <Button variant="outline" onClick={() => setSelectedEvent(null)}>Close</Button>
                {!isRegistered && liveStatus.status !== 'ended' && !isFull && (
                  <Link to={getEventDetailsRoute(ev.id)} onClick={() => setSelectedEvent(null)}>
                    <Button>Register</Button>
                  </Link>
                )}
              </Modal.Footer>
            </>
          );
        })()}
      </Modal>
    </>
  );
}
