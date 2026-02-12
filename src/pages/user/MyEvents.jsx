import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CalendarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/layout';
import { Card, Spinner, EmptyState, Badge, Button } from '../../components/common';
import toast from 'react-hot-toast';
import { getUserEvents } from '../../services/event.service';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { formatEventLocation } from '../../utils/formatters';
import { getEventDetailsRoute, USER_ROUTES } from '../../config/routes';
import { APP_NAME, PARTICIPANT_STATUS } from '../../config/constants';

export default function MyEvents() {
  const { userProfile } = useAuth();
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMyEvents();
  }, [userProfile?.uid]);

  const fetchMyEvents = async () => {
    if (!userProfile?.uid) return;
    setLoading(true);
    try {
      const result = await getUserEvents(userProfile.uid);
      setParticipations(result);
    } catch (error) {
      // silently handled
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case PARTICIPANT_STATUS.PENDING:
        return <Badge variant="yellow">Pending</Badge>;
      case PARTICIPANT_STATUS.APPROVED:
        return <Badge variant="green">Approved</Badge>;
      case PARTICIPANT_STATUS.REJECTED:
        return <Badge variant="red">Rejected</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>My Events | {APP_NAME}</title>
      </Helmet>

      <PageHeader
        title="My Events"
        description="Events you've registered for"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                setRefreshing(true);
                await fetchMyEvents();
                setRefreshing(false);
                toast.success('Data refreshed');
              }}
              isLoading={refreshing}
              leftIcon={<ArrowPathIcon className="h-4 w-4" />}
            >
              Refresh
            </Button>
            <Link to={USER_ROUTES.EVENTS}>
              <Button variant="outline">Browse Events</Button>
            </Link>
          </div>
        }
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : participations.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon className="h-12 w-12" />}
          title="No events yet"
          description="You haven't registered for any events"
          action={() => window.location.href = USER_ROUTES.EVENTS}
          actionLabel="Browse Events"
        />
      ) : (
        <div className="space-y-4">
          {participations.map((participation) => (
            <Card key={participation.id}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  {participation.event?.banner ? (
                    <img
                      src={participation.event.banner}
                      alt={participation.event?.title}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CalendarIcon className="h-8 w-8 text-white/50" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {participation.event?.title || 'Event'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {participation.event?.startDate
                        ? formatDate(participation.event.startDate)
                        : 'Date TBD'}
                      {participation.event?.location && ` • ${formatEventLocation(participation.event.location)}`}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {getStatusBadge(participation.status)}
                      {participation.paymentRequired && (
                        <Badge variant={participation.paymentVerified ? 'green' : 'yellow'}>
                          {participation.paymentVerified ? 'Payment Verified' : 'Payment Pending'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:flex-shrink-0">
                  {participation.event && (
                    <Link to={getEventDetailsRoute(participation.eventId)}>
                      <Button size="sm" variant="outline">
                        View Event
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {participation.bkashTransactionId && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Transaction ID:</span>
                    <span className="font-mono text-sm font-bold text-amber-900 dark:text-amber-100 tracking-wider select-all">
                      {participation.bkashTransactionId}
                    </span>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
