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
  MagnifyingGlassIcon,
  PencilSquareIcon,
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
  updateParticipantPayment,
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
  const [search, setSearch] = useState('');
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [editForm, setEditForm] = useState({ paymentMethod: '', transactionId: '', paymentSenderNumber: '', cashGivenBy: '', cashContactNumber: '' });
  const [savingPayment, setSavingPayment] = useState(false);

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
      await approveParticipant(participantId, { uid: userProfile.uid, name: userProfile.name, email: userProfile.email });
      toast.success('Participant approved');
      // Re-fetch event to reflect updated currentParticipants count
      const updatedEvent = await getEventById(id);
      if (updatedEvent) setEvent(updatedEvent);
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
      await rejectParticipant(participantId, id, { uid: userProfile.uid, name: userProfile.name, email: userProfile.email }, reason);
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

  const startEditPayment = (participant) => {
    setEditingPaymentId(participant.id);
    setEditForm({
      paymentMethod: participant.paymentMethod || '',
      transactionId: participant.transactionId || '',
      paymentSenderNumber: participant.paymentSenderNumber || '',
      cashGivenBy: participant.cashGivenBy || '',
      cashContactNumber: participant.cashContactNumber || '',
    });
  };

  const handleSavePayment = async (participantId) => {
    setSavingPayment(true);
    try {
      await updateParticipantPayment(participantId, editForm);
      toast.success('Payment info updated');
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === participantId
            ? {
                ...p,
                paymentMethod: editForm.paymentMethod || null,
                transactionId: editForm.transactionId || null,
                paymentSenderNumber: editForm.paymentSenderNumber || null,
                bkashTransactionId: editForm.paymentMethod === 'bkash' ? editForm.transactionId : null,
                cashGivenBy: editForm.paymentMethod === 'cash' ? (editForm.cashGivenBy || null) : null,
                cashContactNumber: editForm.paymentMethod === 'cash' ? (editForm.cashContactNumber || null) : null,
              }
            : p
        )
      );
      setEditingPaymentId(null);
    } catch (error) {
      toast.error('Failed to update payment');
    } finally {
      setSavingPayment(false);
    }
  };

  const handleExport = () => {
    const exportData = formatParticipantsForExport(filteredParticipants);
    exportToExcel(exportData, `${event.title}-participants`);
    toast.success('Exported successfully');
  };

  const filteredParticipants = participants.filter((p) => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return (
        p.userName?.toLowerCase().includes(q) ||
        p.userEmail?.toLowerCase().includes(q) ||
        p.userPhone?.toLowerCase().includes(q) ||
        (p.transactionId || p.bkashTransactionId)?.toLowerCase().includes(q) ||
        p.paymentSenderNumber?.toLowerCase().includes(q) ||
        p.cashGivenBy?.toLowerCase().includes(q) ||
        p.cashContactNumber?.toLowerCase().includes(q)
      );
    }
    return true;
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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

      {/* Search */}
      <div className="relative mb-4">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, phone, TxID or sender number…"
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
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
          title="No participants found"
          description={search ? 'No results match your search' : filter === 'all' ? 'No one has registered yet' : 'No participants match this filter'}
        />
      ) : (
        <div className="space-y-3">
          {filteredParticipants.map((participant) => (
            <Card key={participant.id} padding="sm">
              {/* Header: avatar + name/email/phone + badges */}
              <div className="flex items-start gap-3">
                <Avatar name={participant.userName} size="md" className="flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white leading-tight">
                    {participant.userName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {participant.userEmail}
                  </p>
                  {participant.userPhone && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {participant.userPhone}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {getStatusBadge(participant)}
                    {participant.paymentRequired && (
                      <Badge variant={participant.paymentVerified ? 'green' : 'yellow'}>
                        {participant.paymentVerified ? 'Paid' : 'Payment Pending'}
                      </Badge>
                    )}
                    {participant.paymentRequired && (
                      <Badge variant="gray">
                        {participant.paymentMethod === 'nagad' ? 'Nagad' : participant.paymentMethod === 'cash' ? 'Cash' : 'bKash'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment details: TxID + Sent From side by side (bKash/Nagad) */}
              {(participant.transactionId || participant.bkashTransactionId) && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-xs text-amber-600 dark:text-amber-400 mb-0.5">Transaction ID</p>
                    <p className="font-mono text-sm font-bold text-amber-900 dark:text-amber-100 tracking-wider select-all break-all">
                      {participant.transactionId || participant.bkashTransactionId}
                    </p>
                  </div>
                  {participant.paymentSenderNumber ? (
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-xs text-blue-600 dark:text-blue-400 mb-0.5">Sent From</p>
                      <p className="font-mono text-sm font-bold text-blue-900 dark:text-blue-100 tracking-wider select-all">
                        {participant.paymentSenderNumber}
                      </p>
                    </div>
                  ) : <div />}
                </div>
              )}

              {/* Payment details: Cash Given By + Contact Number (cash payments) */}
              {participant.paymentMethod === 'cash' && (participant.cashGivenBy || participant.cashContactNumber) && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-xs text-amber-600 dark:text-amber-400 mb-0.5">Confirmed By</p>
                    <p className="text-sm font-bold text-amber-900 dark:text-amber-100 select-all break-all">
                      {participant.cashGivenBy || '-'}
                    </p>
                  </div>
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-0.5">Contact Number</p>
                    <p className="font-mono text-sm font-bold text-blue-900 dark:text-blue-100 tracking-wider select-all">
                      {participant.cashContactNumber || '-'}
                    </p>
                  </div>
                </div>
              )}

              {/* Edit payment button (paid events only) */}
              {participant.paymentRequired && editingPaymentId !== participant.id && (
                <button
                  onClick={() => startEditPayment(participant)}
                  className="mt-2 flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  <PencilSquareIcon className="h-3.5 w-3.5" />
                  Edit Payment Info
                </button>
              )}

              {/* Inline edit payment form */}
              {editingPaymentId === participant.id && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50 space-y-2">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Update Payment</p>
                  <select
                    value={editForm.paymentMethod}
                    onChange={(e) => setEditForm((f) => ({ ...f, paymentMethod: e.target.value, transactionId: '', paymentSenderNumber: '', cashGivenBy: '', cashContactNumber: '' }))}
                    className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select payment method</option>
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="cash">Cash</option>
                  </select>
                  {editForm.paymentMethod && editForm.paymentMethod !== 'cash' && (
                    <>
                      <input
                        type="text"
                        placeholder="Transaction ID"
                        value={editForm.transactionId}
                        onChange={(e) => setEditForm((f) => ({ ...f, transactionId: e.target.value }))}
                        className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <input
                        type="text"
                        placeholder="Sender Number"
                        value={editForm.paymentSenderNumber}
                        onChange={(e) => setEditForm((f) => ({ ...f, paymentSenderNumber: e.target.value }))}
                        className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </>
                  )}
                  {editForm.paymentMethod === 'cash' && (
                    <>
                      <input
                        type="text"
                        placeholder="Confirmed By (name)"
                        value={editForm.cashGivenBy}
                        onChange={(e) => setEditForm((f) => ({ ...f, cashGivenBy: e.target.value }))}
                        className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <input
                        type="tel"
                        placeholder="Contact Number"
                        value={editForm.cashContactNumber}
                        onChange={(e) => setEditForm((f) => ({ ...f, cashContactNumber: e.target.value }))}
                        className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </>
                  )}
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" onClick={() => setEditingPaymentId(null)} className="flex-1">Cancel</Button>
                    <Button size="sm" onClick={() => handleSavePayment(participant.id)} isLoading={savingPayment} disabled={!editForm.paymentMethod} className="flex-1">Save</Button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {participant.status === PARTICIPANT_STATUS.PENDING && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(participant.id)}
                    disabled={processingId === participant.id}
                    className="flex-1 text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(participant.id)}
                    isLoading={processingId === participant.id}
                    className="flex-1"
                  >
                    <CheckIcon className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
