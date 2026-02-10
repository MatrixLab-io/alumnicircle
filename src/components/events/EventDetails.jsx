import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  CurrencyDollarIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { Card, Badge } from '../common';
import { formatDate, formatDateTime, formatCurrency, getEventLiveStatus, getEventPaymentMethods, getPaymentMethodLabel } from '../../utils/helpers';
import { formatEventLocation } from '../../utils/formatters';
import EventCountdown from './EventCountdown';

export default function EventDetails({ event }) {
  const isFree = !event.registrationFee || event.registrationFee === 0;
  const isFull = event.participantLimit && event.currentParticipants >= event.participantLimit;
  const spotsLeft = event.participantLimit
    ? event.participantLimit - (event.currentParticipants || 0)
    : null;
  const liveStatus = getEventLiveStatus(event);

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
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={liveStatus.variant} dot={liveStatus.dot}>{liveStatus.label}</Badge>
            <Badge variant={isFree ? 'green' : 'yellow'}>
              {isFree ? 'Free Event' : formatCurrency(event.registrationFee)}
            </Badge>
            {isFull && <Badge variant="red">Full</Badge>}
          </div>
          {liveStatus.status === 'upcoming' && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Starts in</p>
              <EventCountdown startDate={event.startDate} />
            </div>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-start gap-3 p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600/70 dark:text-blue-400/70">Date & Time</p>
            <p className="font-semibold text-gray-900 dark:text-white mt-0.5">
              {formatDateTime(event.startDate)}
            </p>
            {event.endDate && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                to {formatDateTime(event.endDate)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <MapPinIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-red-600/70 dark:text-red-400/70">Location</p>
            <p className="font-semibold text-gray-900 dark:text-white mt-0.5">
              {formatEventLocation(event.location)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-lg">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <UsersIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-purple-600/70 dark:text-purple-400/70">Participants</p>
            <p className="font-semibold text-gray-900 dark:text-white mt-0.5">
              {event.currentParticipants || 0}
              {event.participantLimit && <span className="text-gray-500 dark:text-gray-400 font-normal"> / {event.participantLimit}</span>}
            </p>
            {spotsLeft !== null && spotsLeft > 0 && (
              <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                {spotsLeft} spots left
              </span>
            )}
            {isFull && (
              <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium">
                Full
              </span>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <CurrencyDollarIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-amber-600/70 dark:text-amber-400/70">Registration Fee</p>
            {isFree ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold mt-1">
                Free
              </span>
            ) : (
              <>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(event.registrationFee)}
                </p>
                {(() => {
                  const methods = getEventPaymentMethods(event);
                  if (methods.length === 0) return null;
                  return (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex flex-wrap gap-1.5">
                        {methods.map((m) => (
                          <span key={m} className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium">
                            {getPaymentMethodLabel(m)}
                          </span>
                        ))}
                      </div>
                      {event.bkashNumber && methods.includes('bkash') && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium text-gray-700 dark:text-gray-300">bKash:</span> {event.bkashNumber}
                        </p>
                      )}
                      {event.nagadNumber && methods.includes('nagad') && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Nagad:</span> {event.nagadNumber}
                        </p>
                      )}
                    </div>
                  );
                })()}
              </>
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
