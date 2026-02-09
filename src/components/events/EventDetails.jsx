import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  CurrencyDollarIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { Card, Badge } from '../common';
import { formatDate, formatDateTime, formatCurrency } from '../../utils/helpers';

export default function EventDetails({ event }) {
  const isFree = !event.registrationFee || event.registrationFee === 0;
  const isFull = event.participantLimit && event.currentParticipants >= event.participantLimit;
  const spotsLeft = event.participantLimit
    ? event.participantLimit - (event.currentParticipants || 0)
    : null;

  return (
    <Card>
      {/* Banner */}
      {event.banner ? (
        <img
          src={event.banner}
          alt={event.title}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
      ) : (
        <div className="w-full h-64 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg mb-6 flex items-center justify-center">
          <CalendarIcon className="h-24 w-24 text-white/50" />
        </div>
      )}

      {/* Title & Status */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {event.title}
          </h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant={event.status === 'ongoing' ? 'green' : 'blue'}>
              {event.status === 'ongoing' ? 'Happening Now' : 'Upcoming'}
            </Badge>
            <Badge variant={isFree ? 'green' : 'yellow'}>
              {isFree ? 'Free Event' : formatCurrency(event.registrationFee)}
            </Badge>
            {isFull && <Badge variant="red">Full</Badge>}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
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

        <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <MapPinIcon className="h-6 w-6 text-primary-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {event.location}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
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

        <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <CurrencyDollarIcon className="h-6 w-6 text-primary-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Registration Fee</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {isFree ? 'Free' : formatCurrency(event.registrationFee)}
            </p>
            {!isFree && event.bkashNumber && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                bKash: {event.bkashNumber}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          About this Event
        </h3>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {event.description}
          </p>
        </div>
      </div>

      {/* Contact Persons */}
      {event.contactPersons?.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Contact Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {event.contactPersons.map((cp, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
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
    </Card>
  );
}
