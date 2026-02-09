import { Link } from 'react-router-dom';
import { CalendarIcon, MapPinIcon, UsersIcon } from '@heroicons/react/24/outline';
import { Card, Badge, Button } from '../common';
import { formatDate, formatCurrency, getEventLiveStatus } from '../../utils/helpers';
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

        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 flex-shrink-0" />
            <span>{formatDate(event.startDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{formatEventLocation(event.location)}</span>
          </div>
          {event.participantLimit && (
            <div className="flex items-center gap-2">
              <UsersIcon className="h-4 w-4 flex-shrink-0" />
              <span>
                {event.currentParticipants || 0} / {event.participantLimit} participants
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Countdown for upcoming events */}
      {liveStatus.status === 'upcoming' && (
        <div className="mt-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Starts in</p>
          <EventCountdown startDate={event.startDate} compact />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Badge variant={isFree ? 'green' : 'yellow'}>
          {isFree ? 'Free' : formatCurrency(event.registrationFee)}
        </Badge>

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
