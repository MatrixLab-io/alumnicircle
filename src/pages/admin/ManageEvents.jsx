import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  CalendarIcon,
  PlusIcon,
  PencilSquareIcon,
  UsersIcon,
  TrashIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/layout';
import { Card, Button, Spinner, EmptyState, Badge, Dropdown } from '../../components/common';
import { getAllEvents, deleteEvent, archiveEvent } from '../../services/event.service';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { ADMIN_ROUTES, getEditEventRoute, getEventParticipantsRoute } from '../../config/routes';
import { APP_NAME, EVENT_STATUS } from '../../config/constants';

export default function ManageEvents() {
  const { userProfile } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

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
      await archiveEvent(eventId, userProfile.uid);
      toast.success('Event archived successfully');
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (error) {
      toast.error('Failed to archive event');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      [EVENT_STATUS.UPCOMING]: 'blue',
      [EVENT_STATUS.ONGOING]: 'green',
      [EVENT_STATUS.COMPLETED]: 'gray',
      [EVENT_STATUS.CANCELLED]: 'red',
      [EVENT_STATUS.DRAFT]: 'yellow',
    };
    return <Badge variant={variants[status] || 'gray'}>{status}</Badge>;
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
          <Link to={ADMIN_ROUTES.CREATE_EVENT}>
            <Button leftIcon={<PlusIcon className="h-4 w-4" />}>
              Create Event
            </Button>
          </Link>
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
          action={() => window.location.href = ADMIN_ROUTES.CREATE_EVENT}
          actionLabel="Create Event"
        />
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
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

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {event.title}
                      </h3>
                      {getStatusBadge(event.status)}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">
                      {event.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>{formatDate(event.startDate)}</span>
                      <span>{event.location}</span>
                      <span>
                        {event.currentParticipants || 0}
                        {event.participantLimit && ` / ${event.participantLimit}`} participants
                      </span>
                      <span>
                        {event.registrationFee > 0
                          ? formatCurrency(event.registrationFee)
                          : 'Free'}
                      </span>
                    </div>
                  </div>
                </div>

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
                      onClick={() => window.location.href = getEditEventRoute(event.id)}
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
          ))}
        </div>
      )}
    </>
  );
}
