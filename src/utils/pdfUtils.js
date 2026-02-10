import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatEventLocation } from './formatters';
import { getPaymentMethodLabel } from './helpers';

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
    ['Location', formatEventLocation(eventData.location) || '-'],
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

/**
 * Generate an invoice PDF when admin approves a participant
 */
export const generateInvoicePDF = (event, participant) => {
  const doc = new jsPDF();
  const purple = [107, 33, 168];
  const pageWidth = doc.internal.pageSize.getWidth();

  const formatTimestamp = (ts) => {
    if (!ts) return '-';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // ─── Header ────────────────────────────────────────────
  doc.setFillColor(...purple);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('AlumniCircle', 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(220, 210, 255);
  doc.text('Event Registration Invoice', 14, 28);

  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text('INVOICE', pageWidth - 14, 24, { align: 'right' });

  // ─── Invoice meta ──────────────────────────────────────
  let y = 52;
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);

  const invoiceNum = `INV-${(participant.id || '').slice(-8).toUpperCase()}-${new Date().getFullYear()}`;
  const invoiceDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  doc.text(`Invoice #: ${invoiceNum}`, 14, y);
  doc.text(`Date: ${invoiceDate}`, pageWidth - 14, y, { align: 'right' });
  y += 12;

  // ─── Event Details ─────────────────────────────────────
  doc.setFontSize(12);
  doc.setTextColor(...purple);
  doc.text('Event Details', 14, y);
  y += 2;
  doc.setDrawColor(...purple);
  doc.setLineWidth(0.3);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  const eventDetails = [
    ['Event', event.title],
    ['Date', formatTimestamp(event.startDate)],
    ['Location', formatEventLocation(event.location) || '-'],
  ];
  eventDetails.forEach(([label, value]) => {
    doc.setFont(undefined, 'bold');
    doc.text(`${label}:`, 14, y);
    doc.setFont(undefined, 'normal');
    doc.text(value || '-', 55, y);
    y += 7;
  });

  y += 6;

  // ─── Participant Details ───────────────────────────────
  doc.setFontSize(12);
  doc.setTextColor(...purple);
  doc.text('Participant Details', 14, y);
  y += 2;
  doc.setDrawColor(...purple);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  const participantDetails = [
    ['Name', participant.userName],
    ['Email', participant.userEmail],
    ['Phone', participant.userPhone],
  ];
  participantDetails.forEach(([label, value]) => {
    doc.setFont(undefined, 'bold');
    doc.text(`${label}:`, 14, y);
    doc.setFont(undefined, 'normal');
    doc.text(value || '-', 55, y);
    y += 7;
  });

  y += 6;

  // ─── Payment Details ───────────────────────────────────
  doc.setFontSize(12);
  doc.setTextColor(...purple);
  doc.text('Payment Details', 14, y);
  y += 2;
  doc.setDrawColor(...purple);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  const txId = participant.transactionId || participant.bkashTransactionId || '-';
  const methodLabel = participant.paymentMethod ? getPaymentMethodLabel(participant.paymentMethod) : '-';

  // Payment table
  autoTable(doc, {
    startY: y,
    head: [['Description', 'Details']],
    body: [
      ['Payment Method', methodLabel],
      ['Amount', `BDT ${event.registrationFee || 0}`],
      ['Transaction ID', txId],
      ['Status', 'APPROVED'],
    ],
    headStyles: {
      fillColor: purple,
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 10,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
    },
    alternateRowStyles: {
      fillColor: [245, 240, 255],
    },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 16;

  // ─── Total ─────────────────────────────────────────────
  doc.setFillColor(245, 240, 255);
  doc.roundedRect(pageWidth - 90, y - 4, 76, 18, 3, 3, 'F');
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...purple);
  doc.text(`Total: BDT ${event.registrationFee || 0}`, pageWidth - 14, y + 8, { align: 'right' });

  y += 30;

  // ─── Thank You ─────────────────────────────────────────
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.setFont(undefined, 'normal');
  doc.text('Thank you for registering!', pageWidth / 2, y, { align: 'center' });

  // ─── Footer ────────────────────────────────────────────
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `AlumniCircle — Generated on ${invoiceDate}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  const safeName = (participant.userName || 'User').replace(/[^a-zA-Z0-9]/g, '_');
  const safeTitle = (event.title || 'Event').replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Invoice_${safeTitle}_${safeName}.pdf`);
};
