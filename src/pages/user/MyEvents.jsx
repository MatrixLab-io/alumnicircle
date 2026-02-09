import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/layout';
import { Card, Spinner, EmptyState, Badge, Button } from '../../components/common';
import { getUserEvents } from '../../services/event.service';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { getEventDetailsRoute, USER_ROUTES } from '../../config/routes';
import { APP_NAME, PARTICIPANT_STATUS } from '../../config/constants';

export default function MyEvents() {
  const { userProfile } = useAuth();
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);

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
      console.error('Error fetching user events:', error);
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
          <Link to={USER_ROUTES.EVENTS}>
            <Button variant="outline">Browse Events</Button>
          </Link>
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
                      {participation.event?.location && ` • ${participation.event.location}`}
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
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Transaction ID: <span className="font-mono">{participation.bkashTransactionId}</span>
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
