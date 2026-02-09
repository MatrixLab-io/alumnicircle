import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generate a PDF summary for an archived event
 */
export const generateEventPDF = (archivedEvent) => {
  const { eventData, participants, totalParticipants, totalRevenue, archivedAt } = archivedEvent;
  const doc = new jsPDF();

  const purple = [107, 33, 168]; // #6B21A8 — app theme purple

  // Title
  doc.setFontSize(20);
  doc.setTextColor(...purple);
  doc.text(eventData.title, 14, 22);

  // Subtitle
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Event Summary Report', 14, 30);

  // Divider line
  doc.setDrawColor(...purple);
  doc.setLineWidth(0.5);
  doc.line(14, 34, 196, 34);

  // Event details
  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  let y = 42;
  const lineHeight = 7;

  const formatTimestamp = (ts) => {
    if (!ts) return '-';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const details = [
    ['Location', eventData.location || '-'],
    ['Start Date', formatTimestamp(eventData.startDate)],
    ['End Date', formatTimestamp(eventData.endDate)],
    ['Registration Fee', eventData.registrationFee > 0 ? `BDT ${eventData.registrationFee}` : 'Free'],
    ['Total Participants', String(totalParticipants)],
    ['Total Revenue', `BDT ${totalRevenue}`],
    ['Archived On', formatTimestamp(archivedAt)],
  ];

  details.forEach(([label, value]) => {
    doc.setFont(undefined, 'bold');
    doc.text(`${label}:`, 14, y);
    doc.setFont(undefined, 'normal');
    doc.text(value, 65, y);
    y += lineHeight;
  });

  y += 6;

  // Participants table
  if (participants && participants.length > 0) {
    doc.setFontSize(13);
    doc.setTextColor(...purple);
    doc.text('Participants', 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [['#', 'Name', 'Email', 'Phone', 'Payment', 'Transaction ID']],
      body: participants.map((p, i) => [
        i + 1,
        p.userName,
        p.userEmail,
        p.userPhone,
        p.paymentVerified ? 'Verified' : 'Pending',
        p.bkashTransactionId || '-',
      ]),
      headStyles: {
        fillColor: purple,
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: [245, 240, 255],
      },
      margin: { left: 14, right: 14 },
    });
  }

  // Footer on every page
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `AlumniCircle — Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  const safeTitle = eventData.title.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`${safeTitle}_summary.pdf`);
};
