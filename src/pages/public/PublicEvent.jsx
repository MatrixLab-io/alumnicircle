import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { getEventById } from '../../services/event.service';
import { formatDateTime, formatCurrency, getEventLiveStatus } from '../../utils/helpers';
import { formatEventLocation } from '../../utils/formatters';
import { APP_NAME } from '../../config/constants';
import { PUBLIC_ROUTES } from '../../config/routes';
import EventCountdown from '../../components/events/EventCountdown';

export default function PublicEvent() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const eventData = await getEventById(id);
      if (!eventData) {
        setError('Event not found');
        return;
      }
      if (eventData.isPublic === false) {
        setError('This event is not publicly available');
        return;
      }
      setEvent(eventData);
    } catch (err) {
      console.error('Error fetching event:', err);
      setError('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <CalendarIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{error}</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            The event you're looking for might have been removed or is not publicly accessible.
          </p>
          <Link
            to={PUBLIC_ROUTES.HOME}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const isFree = !event.registrationFee || event.registrationFee === 0;
  const isFull = event.participantLimit && event.currentParticipants >= event.participantLimit;
  const spotsLeft = event.participantLimit
    ? event.participantLimit - (event.currentParticipants || 0)
    : null;
  const liveStatus = getEventLiveStatus(event);

  return (
    <>
      <Helmet>
        <title>{event.title} | {APP_NAME}</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link
              to={PUBLIC_ROUTES.HOME}
              className="text-lg font-bold text-primary-600 dark:text-primary-400"
            >
              {APP_NAME}
            </Link>
            <Link
              to={PUBLIC_ROUTES.LOGIN}
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              Sign In to Register
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            {/* Banner */}
            {event.banner ? (
              <img
                src={event.banner}
                alt={event.title}
                className="w-full h-64 sm:h-80 object-cover"
              />
            ) : (
              <div className="w-full h-64 sm:h-80 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <CalendarIcon className="h-24 w-24 text-white/50" />
              </div>
            )}

            <div className="p-6 sm:p-8">
              {/* Title & Status */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  {event.title}
                </h1>
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    liveStatus.variant === 'green'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : liveStatus.variant === 'gray'
                      ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      : liveStatus.variant === 'red'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      : liveStatus.variant === 'yellow'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {liveStatus.label}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    isFree
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {isFree ? 'Free Event' : formatCurrency(event.registrationFee)}
                  </span>
                  {isFull && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                      Full
                    </span>
                  )}
                </div>
                {liveStatus.status === 'upcoming' && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Starts in</p>
                    <EventCountdown startDate={event.startDate} />
                  </div>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <CalendarIcon className="h-6 w-6 text-primary-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date & Time</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDateTime(event.startDate)}
                    </p>
                    {event.endDate && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        to {formatDateTime(event.endDate)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <MapPinIcon className="h-6 w-6 text-primary-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatEventLocation(event.location)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <UsersIcon className="h-6 w-6 text-primary-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Participants</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {event.currentParticipants || 0}
                      {event.participantLimit && ` / ${event.participantLimit}`}
                    </p>
                    {spotsLeft !== null && spotsLeft > 0 && (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {spotsLeft} spots left
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <CurrencyDollarIcon className="h-6 w-6 text-primary-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Registration Fee</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {isFree ? 'Free' : formatCurrency(event.registrationFee)}
                    </p>
                    {!isFree && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {event.paymentMethod === 'cash' ? 'Pay by Cash' : event.bkashNumber ? `bKash: ${event.bkashNumber}` : ''}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  About this Event
                </h3>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* Contact Persons */}
              {event.contactPersons?.length > 0 && (
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {event.contactPersons.map((cp, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                      >
                        <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-900/30">
                          <PhoneIcon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {cp.name}
                          </p>
                          <a
                            href={`tel:${cp.phone}`}
                            className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                          >
                            {cp.phone}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Want to register for this event?
                </p>
                <Link
                  to={PUBLIC_ROUTES.LOGIN}
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors hover:shadow-[0_0_20px_rgba(147,51,234,0.5)]"
                >
                  Sign In to Register
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 text-sm text-gray-400 dark:text-gray-500">
          {APP_NAME} &copy; {new Date().getFullYear()}
        </div>
      </div>
    </>
  );
}
