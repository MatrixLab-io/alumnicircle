import { Link } from 'react-router-dom';
import { CalendarIcon, MapPinIcon, UsersIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { Card, Badge, Button } from '../common';
import { formatDate, formatCurrency, getEventLiveStatus, getEventPaymentMethods, getPaymentMethodLabel } from '../../utils/helpers';
import { formatEventLocation } from '../../utils/formatters';
import { getEventDetailsRoute } from '../../config/routes';
import EventCountdown from './EventCountdown';

export default function EventCard({ event, showActions = true }) {
  const isFree = !event.registrationFee || event.registrationFee === 0;
  const isFull = event.participantLimit && event.currentParticipants >= event.participantLimit;
  const liveStatus = getEventLiveStatus(event);

  return (
    <Card hover className="overflow-hidden flex flex-col">
      {/* Banner */}
      {event.banner ? (
        <img
          src={event.banner}
          alt={event.title}
          className="w-full h-40 object-cover -mx-6 -mt-6 mb-4"
          style={{ width: 'calc(100% + 3rem)' }}
        />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-primary-400 to-primary-600 -mx-6 -mt-6 mb-4 flex items-center justify-center" style={{ width: 'calc(100% + 3rem)' }}>
          <CalendarIcon className="h-16 w-16 text-white/50" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
            {event.title}
          </h3>
          <Badge variant={liveStatus.variant} dot={liveStatus.dot}>{liveStatus.label}</Badge>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
          {event.description}
        </p>

        {/* Details with colored icons and labels */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex-shrink-0 w-7 h-7 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{formatDate(event.eventDate || event.startDate)}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex-shrink-0 w-7 h-7 rounded-md bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <MapPinIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{formatEventLocation(event.location)}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex-shrink-0 w-7 h-7 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <UsersIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-800 dark:text-gray-200">{event.currentParticipants || 0}</span>
              {event.participantLimit && <span> / {event.participantLimit}</span>}
              <span className="ml-1">participants</span>
            </span>
            {isFull && <Badge variant="red" className="ml-auto">Full</Badge>}
          </div>
        </div>
      </div>

      {/* Countdown for upcoming events */}
      {liveStatus.status === 'upcoming' && (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/50">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-1.5">Starts in</p>
          <EventCountdown eventDate={event.eventDate || event.startDate} compact />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          {isFree ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold">
              Free
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-bold">
              <CurrencyDollarIcon className="h-4 w-4" />
              {formatCurrency(event.registrationFee)}
            </span>
          )}
        </div>

        {showActions && liveStatus.status !== 'ended' && liveStatus.status !== 'cancelled' && (
          <Link to={getEventDetailsRoute(event.id)}>
            <Button size="sm" disabled={isFull}>
              {isFull ? 'Full' : 'View Details'}
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
}
