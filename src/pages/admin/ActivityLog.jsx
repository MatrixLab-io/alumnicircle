import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  ArchiveBoxIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/layout';
import { Card, Button, Spinner, EmptyState } from '../../components/common';
import { getActivityLogs } from '../../services/activityLog.service';
import { getRelativeTime, formatDateTime } from '../../utils/helpers';
import { APP_NAME, ACTIVITY_TYPES } from '../../config/constants';

const TYPE_CONFIG = {
  [ACTIVITY_TYPES.USER_APPROVED]: {
    icon: CheckCircleIcon,
    color: 'text-green-500',
    bg: 'bg-green-100 dark:bg-green-900/30',
    label: (name) => `Approved user ${name}`,
  },
  [ACTIVITY_TYPES.USER_REJECTED]: {
    icon: XCircleIcon,
    color: 'text-red-500',
    bg: 'bg-red-100 dark:bg-red-900/30',
    label: (name) => `Rejected user ${name}`,
  },
  [ACTIVITY_TYPES.USER_DELETED]: {
    icon: TrashIcon,
    color: 'text-red-500',
    bg: 'bg-red-100 dark:bg-red-900/30',
    label: (name) => `Deleted user ${name}`,
  },
  [ACTIVITY_TYPES.USER_ROLE_CHANGED]: {
    icon: ShieldCheckIcon,
    color: 'text-purple-500',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    label: (name, details) =>
      `Changed role for ${name} (${details?.oldRole || '?'} → ${details?.newRole || '?'})`,
  },
  [ACTIVITY_TYPES.EVENT_CREATED]: {
    icon: PlusCircleIcon,
    color: 'text-blue-500',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    label: (name) => `Created event "${name}"`,
  },
  [ACTIVITY_TYPES.EVENT_UPDATED]: {
    icon: PencilSquareIcon,
    color: 'text-purple-500',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    label: (name) => `Updated event "${name}"`,
  },
  [ACTIVITY_TYPES.EVENT_DELETED]: {
    icon: TrashIcon,
    color: 'text-red-500',
    bg: 'bg-red-100 dark:bg-red-900/30',
    label: (name) => `Deleted event "${name}"`,
  },
  [ACTIVITY_TYPES.EVENT_ARCHIVED]: {
    icon: ArchiveBoxIcon,
    color: 'text-gray-500',
    bg: 'bg-gray-100 dark:bg-gray-800/50',
    label: (name) => `Archived event "${name}"`,
  },
  [ACTIVITY_TYPES.PARTICIPANT_APPROVED]: {
    icon: CheckCircleIcon,
    color: 'text-green-500',
    bg: 'bg-green-100 dark:bg-green-900/30',
    label: (name) => `Approved participant ${name}`,
  },
  [ACTIVITY_TYPES.PARTICIPANT_REJECTED]: {
    icon: XCircleIcon,
    color: 'text-red-500',
    bg: 'bg-red-100 dark:bg-red-900/30',
    label: (name) => `Rejected participant ${name}`,
  },
};

const FILTER_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'user', label: 'User Actions' },
  { value: 'event', label: 'Event Actions' },
  { value: 'participant', label: 'Participant Actions' },
];

const TYPE_GROUPS = {
  user: [ACTIVITY_TYPES.USER_APPROVED, ACTIVITY_TYPES.USER_REJECTED, ACTIVITY_TYPES.USER_DELETED, ACTIVITY_TYPES.USER_ROLE_CHANGED],
  event: [ACTIVITY_TYPES.EVENT_CREATED, ACTIVITY_TYPES.EVENT_UPDATED, ACTIVITY_TYPES.EVENT_DELETED, ACTIVITY_TYPES.EVENT_ARCHIVED],
  participant: [ACTIVITY_TYPES.PARTICIPANT_APPROVED, ACTIVITY_TYPES.PARTICIPANT_REJECTED],
};

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [filterGroup, setFilterGroup] = useState('');

  const fetchLogs = async (append = false, cursor = null) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const result = await getActivityLogs({
        pageSize: 25,
        lastDoc: append ? cursor : null,
      });

      if (append) {
        setLogs((prev) => [...prev, ...result.logs]);
      } else {
        setLogs(result.logs);
      }
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setFilterGroup('');
    await fetchLogs(false, null);
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  const filteredLogs = filterGroup
    ? logs.filter((log) => TYPE_GROUPS[filterGroup]?.includes(log.type))
    : logs;

  const getLogConfig = (log) => {
    return TYPE_CONFIG[log.type] || {
      icon: ClipboardDocumentListIcon,
      color: 'text-gray-500',
      bg: 'bg-gray-100 dark:bg-gray-800/50',
      label: () => log.type,
    };
  };

  return (
    <>
      <Helmet>
        <title>Activity Log | {APP_NAME}</title>
      </Helmet>

      <PageHeader
        title="Activity Log"
        description="Audit trail of all admin actions"
        actions={
          <Button
            variant="outline"
            onClick={handleRefresh}
            isLoading={refreshing}
            leftIcon={<ArrowPathIcon className="h-4 w-4" />}
          >
            Refresh
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilterGroup(opt.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterGroup === opt.value
                ? 'bg-primary-600 text-white'
                : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          icon={<ClipboardDocumentListIcon className="h-12 w-12" />}
          title="No activity yet"
          description={filterGroup ? 'No logs match this filter' : 'Admin actions will appear here'}
        />
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const config = getLogConfig(log);
            const Icon = config.icon;
            const description = config.label(
              log.targetName || 'Unknown',
              log.details
            );

            return (
              <Card key={log.id}>
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 p-2 rounded-lg ${config.bg}`}>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {description}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        by {log.adminName || 'Unknown admin'}
                      </span>
                      <span
                        className="text-xs text-gray-400 dark:text-gray-500 cursor-default"
                        title={formatDateTime(log.createdAt)}
                      >
                        {getRelativeTime(log.createdAt)}
                      </span>
                    </div>
                    {log.details?.userEmail && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {log.details.userEmail}
                      </p>
                    )}
                    {log.details?.reason && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Reason: {log.details.reason}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}

          {/* Load More */}
          {hasMore && !filterGroup && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => fetchLogs(true, lastDoc)}
                isLoading={loadingMore}
              >
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
