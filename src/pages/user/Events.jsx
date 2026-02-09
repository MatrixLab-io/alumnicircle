import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { CalendarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/layout';
import { Button, Spinner, EmptyState, Badge } from '../../components/common';
import { EventCard } from '../../components/events';
import { getAllEvents } from '../../services/event.service';
import { APP_NAME } from '../../config/constants';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('upcoming');

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const status = filter === 'all' ? null : filter;
      const result = await getAllEvents({
        status: filter === 'all' ? null : filter,
        includeCompleted: filter === 'all',
      });
      setEvents(result);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'all', label: 'All Events' },
  ];

  return (
    <>
      <Helmet>
        <title>Events | {APP_NAME}</title>
      </Helmet>

      <PageHeader
        title="Events"
        description="Discover and join alumni events"
        actions={
          <Button
            variant="outline"
            onClick={async () => {
              setRefreshing(true);
              await fetchEvents();
              setRefreshing(false);
              toast.success('Data refreshed');
            }}
            isLoading={refreshing}
            leftIcon={<ArrowPathIcon className="h-4 w-4" />}
          >
            Refresh
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-primary-600 text-white'
                : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon className="h-12 w-12" />}
          title="No events found"
          description={
            filter === 'upcoming'
              ? 'There are no upcoming events at the moment'
              : 'No events match your filter'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </>
  );
}
