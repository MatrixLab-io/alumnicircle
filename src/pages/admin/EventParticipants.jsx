import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  DocumentArrowDownIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/layout';
import { Card, Button, Spinner, EmptyState, Badge, Avatar } from '../../components/common';
import {
  getEventById,
  getEventParticipants,
  approveParticipant,
  rejectParticipant,
} from '../../services/event.service';
import { exportToExcel, formatParticipantsForExport } from '../../utils/exportUtils';
import { formatDate } from '../../utils/helpers';
import { ADMIN_ROUTES } from '../../config/routes';
import { APP_NAME, PARTICIPANT_STATUS } from '../../config/constants';

export default function EventParticipants() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventData, participantData] = await Promise.all([
        getEventById(id),
        getEventParticipants(id),
      ]);

      if (!eventData) {
        toast.error('Event not found');
        navigate(ADMIN_ROUTES.MANAGE_EVENTS);
        return;
      }

      setEvent(eventData);
      setParticipants(participantData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load event data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const [eventData, participantData] = await Promise.all([
        getEventById(id),
        getEventParticipants(id),
      ]);
      setEvent(eventData);
      setParticipants(participantData);
      toast.success('Data refreshed');
    } catch (error) {
      toast.error('Failed to refresh');
    } finally {
      setRefreshing(false);
    }
  };

  const handleApprove = async (participantId) => {
    setProcessingId(participantId);
    try {
      await approveParticipant(participantId, userProfile.uid);
      toast.success('Participant approved');
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === participantId ? { ...p, status: PARTICIPANT_STATUS.APPROVED, paymentVerified: true } : p
        )
      );
    } catch (error) {
      toast.error('Failed to approve participant');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (participantId) => {
    const reason = prompt('Reason for rejection (optional):');
    setProcessingId(participantId);
    try {
      await rejectParticipant(participantId, id, userProfile.uid, reason);
      toast.success('Participant rejected');
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === participantId ? { ...p, status: PARTICIPANT_STATUS.REJECTED } : p
        )
      );
    } catch (error) {
      toast.error('Failed to reject participant');
    } finally {
      setProcessingId(null);
    }
  };

  const handleExport = () => {
    const exportData = formatParticipantsForExport(filteredParticipants);
    exportToExcel(exportData, `${event.title}-participants`);
    toast.success('Exported successfully');
  };

  const filteredParticipants = participants.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const pendingCount = participants.filter((p) => p.status === PARTICIPANT_STATUS.PENDING).length;

  const getStatusBadge = (participant) => {
    switch (participant.status) {
      case PARTICIPANT_STATUS.PENDING:
        return <Badge variant="yellow">Pending</Badge>;
      case PARTICIPANT_STATUS.APPROVED:
        return <Badge variant="green">Approved</Badge>;
      case PARTICIPANT_STATUS.REJECTED:
        return <Badge variant="red">Rejected</Badge>;
      default:
        return <Badge variant="gray">{participant.status}</Badge>;
    }
  };

  if (loading) {
    return <Spinner.Page message="Loading participants..." />;
  }

  return (
    <>
      <Helmet>
        <title>Event Participants | {APP_NAME}</title>
      </Helmet>

      <PageHeader
        title="Event Participants"
        description={event?.title}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              isLoading={refreshing}
              leftIcon={<ArrowPathIcon className="h-4 w-4" />}
            >
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              leftIcon={<DocumentArrowDownIcon className="h-4 w-4" />}
              disabled={participants.length === 0}
            >
              Export
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(ADMIN_ROUTES.MANAGE_EVENTS)}
              leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
            >
              Back
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card padding="sm" className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {participants.length}
          </p>
          <p className="text-sm text-gray-500">Total</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
          <p className="text-sm text-gray-500">Pending</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {participants.filter((p) => p.status === PARTICIPANT_STATUS.APPROVED).length}
          </p>
          <p className="text-sm text-gray-500">Approved</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-2xl font-bold text-red-600">
            {participants.filter((p) => p.status === PARTICIPANT_STATUS.REJECTED).length}
          </p>
          <p className="text-sm text-gray-500">Rejected</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', PARTICIPANT_STATUS.PENDING, PARTICIPANT_STATUS.APPROVED, PARTICIPANT_STATUS.REJECTED].map(
          (f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Participants List */}
      {filteredParticipants.length === 0 ? (
        <EmptyState
          icon={<UsersIcon className="h-12 w-12" />}
          title="No participants"
          description={filter === 'all' ? 'No one has registered yet' : 'No participants match this filter'}
        />
      ) : (
        <div className="space-y-4">
          {filteredParticipants.map((participant) => (
            <Card key={participant.id}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar name={participant.userName} size="lg" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {participant.userName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {participant.userEmail}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {participant.userPhone}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusBadge(participant)}
                      {participant.paymentRequired && (
                        <Badge variant={participant.paymentVerified ? 'green' : 'yellow'}>
                          {participant.paymentVerified ? 'Paid' : 'Payment Pending'}
                        </Badge>
                      )}
                    </div>
                    {participant.bkashTransactionId && (
                      <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <span className="text-xs font-medium text-amber-700 dark:text-amber-300">TxID:</span>
                        <span className="font-mono text-sm font-bold text-amber-900 dark:text-amber-100 tracking-wider select-all">
                          {participant.bkashTransactionId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {participant.status === PARTICIPANT_STATUS.PENDING && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(participant.id)}
                      disabled={processingId === participant.id}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(participant.id)}
                      isLoading={processingId === participant.id}
                    >
                      <CheckIcon className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
