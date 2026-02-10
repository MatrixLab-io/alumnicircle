import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  CalendarIcon,
  PlusIcon,
  PencilSquareIcon,
  UsersIcon,
  TrashIcon,
  ArchiveBoxIcon,
  ArrowPathIcon,
  MapPinIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/layout';
import { Card, Button, Spinner, EmptyState, Badge, Dropdown } from '../../components/common';
import { getAllEvents, deleteEvent, archiveEvent, getEventById, getEventParticipants } from '../../services/event.service';
import { formatDate, formatCurrency, getEventLiveStatus } from '../../utils/helpers';
import { formatEventLocation } from '../../utils/formatters';
import EventCountdown from '../../components/events/EventCountdown';
import { ADMIN_ROUTES, getEditEventRoute, getEventParticipantsRoute } from '../../config/routes';
import { APP_NAME, EVENT_STATUS, PARTICIPANT_STATUS } from '../../config/constants';
import { exportToExcel, formatParticipantsForExport } from '../../utils/exportUtils';

export default function ManageEvents() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const result = await getAllEvents({ includeCompleted: true });
      setEvents(result);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    setProcessingId(eventId);
    try {
      await deleteEvent(eventId);
      toast.success('Event deleted');
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (error) {
      toast.error('Failed to delete event');
    } finally {
      setProcessingId(null);
    }
  };

  const handleArchive = async (eventId) => {
    if (!confirm('Archive this event? Participants will be exported and the event will be removed.')) {
      return;
    }

    setProcessingId(eventId);
    try {
      // Fetch event + approved participants before archiving
      const event = await getEventById(eventId);
      const participants = await getEventParticipants(eventId, PARTICIPANT_STATUS.APPROVED);

      // Auto-download Excel export
      if (participants.length > 0) {
        const formatted = formatParticipantsForExport(participants);
        const safeTitle = event.title.replace(/[^a-zA-Z0-9]/g, '_');
        exportToExcel(formatted, `${safeTitle}_participants`, 'Participants');
      }

      await archiveEvent(eventId, userProfile.uid);
      toast.success('Event archived successfully');
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (error) {
      toast.error('Failed to archive event');
    } finally {
      setProcessingId(null);
    }
  };

  const renderStatusBadge = (event) => {
    const ls = getEventLiveStatus(event);
    return <Badge variant={ls.variant} dot={ls.dot}>{ls.label}</Badge>;
  };

  return (
    <>
      <Helmet>
        <title>Manage Events | {APP_NAME}</title>
      </Helmet>

      <PageHeader
        title="Manage Events"
        description={`${events.length} total events`}
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
              <Button leftIcon={<PlusIcon className="h-4 w-4" />}>
                Create Event
              </Button>
            </Link>
          </div>
        }
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon className="h-12 w-12" />}
          title="No events yet"
          description="Create your first event to get started"
          action={() => navigate(ADMIN_ROUTES.CREATE_EVENT)}
          actionLabel="Create Event"
        />
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const ls = getEventLiveStatus(event);
            const isFree = !event.registrationFee || event.registrationFee === 0;
            return (
            <Card key={event.id}>
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                {/* Left: banner + info */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {event.banner ? (
                    <img
                      src={event.banner}
                      alt={event.title}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CalendarIcon className="h-10 w-10 text-white/50" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    {/* Title + status */}
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {event.title}
                      </h3>
                      {renderStatusBadge(event)}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-3">
                      {event.description}
                    </p>

                    {/* Detail chips */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Date chip */}
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <CalendarIcon className="h-3.5 w-3.5 text-blue-500" />
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">{formatDate(event.startDate)}</span>
                      </div>

                      {/* Location chip */}
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 max-w-[260px]">
                        <MapPinIcon className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                        <span className="text-xs text-red-700 dark:text-red-300 truncate">{formatEventLocation(event.location)}</span>
                      </div>

                      {/* Participants chip */}
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                        <UsersIcon className="h-3.5 w-3.5 text-purple-500" />
                        <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                          {event.currentParticipants || 0}{event.participantLimit ? ` / ${event.participantLimit}` : ''}
                        </span>
                      </div>

                      {/* Price chip */}
                      {isFree ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                          <span className="text-xs font-semibold text-green-700 dark:text-green-300">Free</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                          <CurrencyDollarIcon className="h-3.5 w-3.5 text-amber-500" />
                          <span className="text-xs font-bold text-amber-700 dark:text-amber-300">{formatCurrency(event.registrationFee)}</span>
                        </div>
                      )}

                      {/* Countdown chip */}
                      {ls.status === 'upcoming' && (
                        <EventCountdown startDate={event.startDate} compact />
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link to={getEventParticipantsRoute(event.id)}>
                    <Button size="sm" variant="outline">
                      <UsersIcon className="h-4 w-4 mr-1" />
                      Participants
                    </Button>
                  </Link>

                  <Dropdown
                    trigger={
                      <Button size="sm" variant="ghost">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </Button>
                    }
                    align="right"
                  >
                    <Dropdown.Item
                      icon={<PencilSquareIcon className="h-4 w-4" />}
                      onClick={() => navigate(getEditEventRoute(event.id))}
                    >
                      Edit Event
                    </Dropdown.Item>
                    <Dropdown.Item
                      icon={<ArchiveBoxIcon className="h-4 w-4" />}
                      onClick={() => handleArchive(event.id)}
                    >
                      Archive Event
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item
                      icon={<TrashIcon className="h-4 w-4" />}
                      onClick={() => handleDelete(event.id)}
                      danger
                    >
                      Delete Event
                    </Dropdown.Item>
                  </Dropdown>
                </div>
              </div>
            </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
