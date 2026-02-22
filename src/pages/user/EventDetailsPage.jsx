import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/layout';
import { Button, Spinner, Card, Badge } from '../../components/common';
import { EventDetails, JoinEventModal } from '../../components/events';
import { getEventById, joinEvent, getUserParticipation } from '../../services/event.service';
import { getEventLiveStatus, getEventPaymentMethods, getPaymentMethodLabel } from '../../utils/helpers';
import { USER_ROUTES } from '../../config/routes';
import { APP_NAME, PARTICIPANT_STATUS, PAYMENT_METHODS } from '../../config/constants';

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [userParticipation, setUserParticipation] = useState(null);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const eventData = await getEventById(id);
      if (!eventData) {
        toast.error('Event not found');
        navigate(USER_ROUTES.EVENTS);
        return;
      }
      setEvent(eventData);

      // Check if user already joined (constrained query — safe for non-admin members)
      const userPart = await getUserParticipation(id, userProfile?.uid);
      setUserParticipation(userPart);
    } catch (error) {
      toast.error('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async (paymentInfo) => {
    setIsJoining(true);
    try {
      await joinEvent(event.id, userProfile.uid, {
        name: userProfile.name,
        email: userProfile.email,
        phone: userProfile.phone,
      }, paymentInfo || {});

      toast.success(
        event.registrationFee > 0
          ? 'Registration submitted! Waiting for payment verification.'
          : 'Successfully registered for the event!'
      );

      await fetchEvent();
      return true;
    } catch (error) {
      toast.error(error.message || 'Failed to join event');
      return false;
    } finally {
      setIsJoining(false);
    }
  };

  const getParticipationStatus = () => {
    if (!userParticipation) return null;

    switch (userParticipation.status) {
      case PARTICIPANT_STATUS.PENDING:
        return (
          <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-3">
              <Badge variant="yellow">Pending</Badge>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Your registration is pending approval.
                {userParticipation.paymentRequired && !userParticipation.paymentVerified && (
                  <> Payment verification in progress.</>
                )}
              </p>
            </div>
          </Card>
        );
      case PARTICIPANT_STATUS.APPROVED:
        return (
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <Badge variant="green">Registered</Badge>
              <p className="text-sm text-green-800 dark:text-green-200">
                You are registered for this event.
              </p>
            </div>
          </Card>
        );
      case PARTICIPANT_STATUS.REJECTED:
        return (
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3">
              <Badge variant="red">Rejected</Badge>
              <p className="text-sm text-red-800 dark:text-red-200">
                Your registration was not approved.
                {userParticipation.adminNotes && (
                  <> Reason: {userParticipation.adminNotes}</>
                )}
              </p>
            </div>
          </Card>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <Spinner.Page message="Loading event..." />;
  }

  if (!event) {
    return null;
  }

  const liveStatus = getEventLiveStatus(event);
  const canJoin =
    !userParticipation &&
    liveStatus.status !== 'ended' &&
    liveStatus.status !== 'cancelled' &&
    (!event.participantLimit || event.currentParticipants < event.participantLimit);

  return (
    <>
      <Helmet>
        <title>{event.title} | {APP_NAME}</title>
      </Helmet>

      <PageHeader
        title={event.title}
        actions={
          <Button
            variant="outline"
            onClick={() => navigate(USER_ROUTES.EVENTS)}
            leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
          >
            Back to Events
          </Button>
        }
      />

      <div className="max-w-4xl space-y-6">
        {/* Participation Status */}
        {getParticipationStatus()}

        {/* Event Details */}
        <EventDetails event={event} />

        {/* Join Button */}
        {canJoin && (
          <div className="flex justify-center">
            <Button size="lg" onClick={() => setShowJoinModal(true)}>
              {event.registrationFee > 0
                ? (() => {
                    const methods = getEventPaymentMethods(event);
                    if (methods.length === 1) return `Register (${getPaymentMethodLabel(methods[0])})`;
                    return 'Register (Paid)';
                  })()
                : 'Register for Free'}
            </Button>
          </div>
        )}
      </div>

      {/* Join Modal */}
      <JoinEventModal
        event={event}
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoin={handleJoinEvent}
        isLoading={isJoining}
      />
    </>
  );
}
