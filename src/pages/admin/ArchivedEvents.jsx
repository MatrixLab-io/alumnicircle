import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ArchiveBoxIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/layout';
import { Card, Spinner, EmptyState, Badge } from '../../components/common';
import { getArchivedEvents } from '../../services/event.service';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { formatEventLocation } from '../../utils/formatters';
import { exportToExcel, formatArchivedParticipantsForExport } from '../../utils/exportUtils';
import { generateEventPDF } from '../../utils/pdfUtils';
import { APP_NAME } from '../../config/constants';

export default function ArchivedEvents() {
  const [archivedEvents, setArchivedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArchivedEvents();
  }, []);

  const fetchArchivedEvents = async () => {
    setLoading(true);
    try {
      const result = await getArchivedEvents();
      setArchivedEvents(result);
    } catch (error) {
      toast.error('Failed to load archived events');
    } finally {
      setLoading(false);
    }
  };

  const handleExcelDownload = (archivedEvent) => {
    try {
      const formatted = formatArchivedParticipantsForExport(archivedEvent.participants || []);
      const safeTitle = archivedEvent.eventData.title.replace(/[^a-zA-Z0-9]/g, '_');
      exportToExcel(formatted, `${safeTitle}_participants`, 'Participants');
      toast.success('Excel downloaded');
    } catch (error) {
      toast.error('Failed to export Excel');
    }
  };

  const handlePdfDownload = (archivedEvent) => {
    try {
      generateEventPDF(archivedEvent);
      toast.success('PDF downloaded');
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <>
      <Helmet>
        <title>Archived Events | {APP_NAME}</title>
      </Helmet>

      <PageHeader
        title="Archived Events"
        description={`${archivedEvents.length} archived events`}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : archivedEvents.length === 0 ? (
        <EmptyState
          icon={<ArchiveBoxIcon className="h-12 w-12" />}
          title="No archived events"
          description="Completed events that have been archived will appear here"
        />
      ) : (
        <div className="space-y-4">
          {archivedEvents.map((item) => (
            <Card key={item.id}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {item.eventData.title}
                    </h3>
                    <Badge variant="gray">Archived</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
                    <span>{formatDate(item.eventData.startDate)}</span>
                    <span>{formatEventLocation(item.eventData.location)}</span>
                    <span>{item.totalParticipants} participants</span>
                    <span>
                      {item.totalRevenue > 0
                        ? formatCurrency(item.totalRevenue)
                        : 'Free event'}
                    </span>
                    <span className="text-gray-400 dark:text-gray-500">
                      Archived {formatDate(item.archivedAt)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleExcelDownload(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Excel
                  </button>
                  <button
                    onClick={() => handlePdfDownload(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <DocumentTextIcon className="h-4 w-4" />
                    PDF
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
