import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  GlobeAltIcon,
  LockClosedIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  ArchiveBoxIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Modal, Button, Badge } from '../common';
import { formatDate, formatCurrency, getEventLiveStatus, getEventPaymentMethods, getPaymentMethodLabel } from '../../utils/helpers';
import { formatEventLocation } from '../../utils/formatters';
import { EVENT_STATUS, PAYMENT_METHODS } from '../../config/constants';

export default function AdminEventModal({
  event,
  isOpen,
  onClose,
  onPublish,
  onEdit,
  onArchive,
  onDelete,
  onParticipants,
  processingId,
}) {
  if (!event) return null;

  const ls = getEventLiveStatus(event);
  const isDraft = event.status === EVENT_STATUS.DRAFT;
  const isCancelled = event.status === EVENT_STATUS.CANCELLED;
  const isCompleted = event.status === EVENT_STATUS.COMPLETED;
  const isActive = event.status === EVENT_STATUS.UPCOMING || event.status === EVENT_STATUS.ONGOING;
  const isFree = !event.registrationFee || event.registrationFee === 0;
  const paymentMethods = getEventPaymentMethods(event);
  const isProcessing = processingId === event.id;

  // Resolve payment numbers (new array or legacy single string)
  const bkashNums = Array.isArray(event.bkashNumbers) && event.bkashNumbers.length > 0
    ? event.bkashNumbers : event.bkashNumber ? [event.bkashNumber] : [];
  const nagadNums = Array.isArray(event.nagadNumbers) && event.nagadNumbers.length > 0
    ? event.nagadNumbers : event.nagadNumber ? [event.nagadNumber] : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" showCloseButton={false}>
      {/* Banner */}
      <div className="relative">
        {event.banner ? (
          <img
            src={event.banner}
            alt={event.title}
            className="w-full h-48 object-cover rounded-t-2xl"
          />
        ) : (
          <div className="w-full h-32 bg-gradient-to-br from-primary-500 to-primary-700 rounded-t-2xl flex items-center justify-center">
            <CalendarIcon className="h-12 w-12 text-white/40" />
          </div>
        )}
        {/* Close button overlay */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/40 text-white hover:bg-black/60 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {/* Status badge overlay */}
        <div className="absolute bottom-3 left-4">
          <Badge variant={ls.variant} dot={ls.dot}>{ls.label}</Badge>
        </div>
        {/* Public/Private badge */}
        <div className="absolute bottom-3 right-4">
          {event.isPublic ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
              <GlobeAltIcon className="h-3 w-3" /> Public
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              <LockClosedIcon className="h-3 w-3" /> Members Only
            </span>
          )}
        </div>
      </div>

      <Modal.Body className="space-y-4">
        {/* Title + description */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{event.title}</h2>
          {event.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap line-clamp-3">
              {event.description}
            </p>
          )}
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Event date */}
          {(event.eventDate || event.startDate) && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <CalendarIcon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-0.5">Event Date</p>
                <p className="text-sm text-gray-900 dark:text-white">{formatDate(event.eventDate || event.startDate)}</p>
              </div>
            </div>
          )}

          {/* Registration deadline */}
          {(event.registrationDeadline || event.endDate) && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <ClockIcon className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-0.5">Registration Deadline</p>
                <p className="text-sm text-gray-900 dark:text-white">{formatDate(event.registrationDeadline || event.endDate)}</p>
              </div>
            </div>
          )}

          {/* Location */}
          {event.location && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
              <MapPinIcon className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-0.5">Location</p>
                <p className="text-sm text-gray-900 dark:text-white">{formatEventLocation(event.location)}</p>
              </div>
            </div>
          )}

          {/* Participants */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
            <UsersIcon className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-0.5">Participants</p>
              <p className="text-sm text-gray-900 dark:text-white">
                {event.currentParticipants || 0}
                {event.participantLimit ? ` / ${event.participantLimit} limit` : ' registered'}
              </p>
            </div>
          </div>

          {/* Fee */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
            <CurrencyDollarIcon className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-0.5">Registration Fee</p>
              <p className="text-sm text-gray-900 dark:text-white">
                {isFree ? 'Free' : formatCurrency(event.registrationFee)}
              </p>
            </div>
          </div>
        </div>

        {/* Payment methods & numbers */}
        {!isFree && paymentMethods.length > 0 && (
          <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Payment Methods</p>
            <div className="flex flex-wrap gap-1.5">
              {paymentMethods.map((m) => (
                <span key={m} className="px-2 py-0.5 rounded-md bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium">
                  {getPaymentMethodLabel(m)}
                </span>
              ))}
            </div>
            {bkashNums.length > 0 && (
              <div className="space-y-0.5">
                {bkashNums.map((n, i) => (
                  <p key={i} className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">bKash{bkashNums.length > 1 ? ` ${i + 1}` : ''}:</span> {n}
                  </p>
                ))}
              </div>
            )}
            {nagadNums.length > 0 && (
              <div className="space-y-0.5">
                {nagadNums.map((n, i) => (
                  <p key={i} className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Nagad{nagadNums.length > 1 ? ` ${i + 1}` : ''}:</span> {n}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contact persons */}
        {event.contactPersons?.length > 0 && (
          <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Contact Persons</p>
            {event.contactPersons.map((cp, i) => (
              <div key={i} className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-900 dark:text-white font-medium">{cp.name}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{cp.phone}</span>
              </div>
            ))}
          </div>
        )}
      </Modal.Body>

      {/* Action footer */}
      <Modal.Footer className="flex items-center justify-between gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Delete — always available */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(event.id)}
            isLoading={isProcessing}
            className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
            leftIcon={<TrashIcon className="h-4 w-4" />}
          >
            Delete
          </Button>

          {/* Edit — always available */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(event.id)}
            leftIcon={<PencilSquareIcon className="h-4 w-4" />}
          >
            Edit
          </Button>

          {/* Archive — published events only */}
          {!isDraft && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onArchive(event.id)}
              isLoading={isProcessing}
              leftIcon={<ArchiveBoxIcon className="h-4 w-4" />}
            >
              Archive
            </Button>
          )}

          {/* Participants — published events only */}
          {!isDraft && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onParticipants(event.id)}
              leftIcon={<UsersIcon className="h-4 w-4" />}
            >
              Participants
            </Button>
          )}

          {/* Publish — draft only */}
          {isDraft && (
            <Button
              size="sm"
              onClick={() => onPublish(event.id)}
              isLoading={isProcessing}
              leftIcon={<CheckCircleIcon className="h-4 w-4" />}
            >
              Publish
            </Button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
}
