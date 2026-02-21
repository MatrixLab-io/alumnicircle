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
    ['Event Date', formatTimestamp(eventData.eventDate || eventData.startDate)],
    ['Registration Deadline', formatTimestamp(eventData.registrationDeadline || eventData.endDate)],
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
  const pageWidth  = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ── Palette ──────────────────────────────────────────────
  const purple      = [107, 33, 168];
  const purpleLight = [245, 240, 255];
  const purpleFade  = [180, 140, 230];
  const dark        = [30,  30,  40];
  const mid         = [90,  90, 100];
  const light       = [160, 155, 175];
  const green       = [22, 163,  74];
  const greenLight  = [240, 253, 244];

  const formatTs = (ts) => {
    if (!ts) return '-';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Deterministic 4-digit number derived from participant ID — same invoice always gets same number
  const _hash = (participant.id || Date.now().toString())
    .split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
  const invoiceSeq = String(Math.abs(_hash) % 9000 + 1000);
  const invoiceNum  = `INV-ALMC-${invoiceSeq}`;
  const invoiceDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const txId        = participant.transactionId || participant.bkashTransactionId || '-';
  const senderNum   = participant.paymentSenderNumber || null;
  const method      = participant.paymentMethod ? getPaymentMethodLabel(participant.paymentMethod) : '-';
  const fee         = event.registrationFee || 0;

  // ── Header bar ───────────────────────────────────────────
  doc.setFillColor(...purple);
  doc.rect(0, 0, pageWidth, 38, 'F');

  // App name
  doc.setFontSize(17);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('AlumniCircle', 14, 16);

  // Tagline
  doc.setFontSize(7.5);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...purpleFade);
  doc.text('School Batch 2003  |  alumnicircle.app', 14, 24);

  // INVOICE (right)
  doc.setFontSize(22);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('INVOICE', pageWidth - 14, 17, { align: 'right' });

  // Invoice # and date (right, small)
  doc.setFontSize(7.5);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...purpleFade);
  doc.text(`${invoiceNum}   ${invoiceDate}`, pageWidth - 14, 26, { align: 'right' });

  // ── Two-column info boxes ─────────────────────────────────
  const boxY  = 46;
  const boxH  = 38;
  const col1X = 14;
  const col2X = 113;
  const colW  = 89;
  const bgCol = [249, 247, 253];

  // Box 1 — Billed To
  doc.setFillColor(...bgCol);
  doc.setDrawColor(225, 215, 245);
  doc.setLineWidth(0.3);
  doc.roundedRect(col1X, boxY, colW, boxH, 3, 3, 'FD');

  doc.setFontSize(6.5);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...purpleFade);
  doc.text('BILLED TO', col1X + 5, boxY + 8);

  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...dark);
  doc.text(participant.userName || '-', col1X + 5, boxY + 17);

  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...mid);
  doc.text(participant.userEmail || '-', col1X + 5, boxY + 25, { maxWidth: colW - 10 });
  doc.text(participant.userPhone  || '-', col1X + 5, boxY + 32);

  // Box 2 — Event
  doc.setFillColor(...bgCol);
  doc.roundedRect(col2X, boxY, colW, boxH, 3, 3, 'FD');

  doc.setFontSize(6.5);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...purpleFade);
  doc.text('EVENT', col2X + 5, boxY + 8);

  doc.setFontSize(9.5);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...dark);
  doc.text(event.title || '-', col2X + 5, boxY + 17, { maxWidth: colW - 10 });

  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...mid);
  doc.text(formatTs(event.eventDate || event.startDate), col2X + 5, boxY + 26);
  const loc = formatEventLocation(event.location) || '-';
  doc.text(loc, col2X + 5, boxY + 33, { maxWidth: colW - 10 });

  // ── Line-item table ───────────────────────────────────────
  const tableY = boxY + boxH + 10;

  const txCell = senderNum ? `${txId}\nFrom: ${senderNum}` : txId;

  autoTable(doc, {
    startY: tableY,
    head: [['#', 'Description', 'Method', 'Transaction ID', 'Amount']],
    body: [[
      '1',
      'Event Registration Fee',
      method,
      txCell,
      `BDT ${fee}`,
    ]],
    headStyles: {
      fillColor: purple,
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
    },
    bodyStyles: {
      fontSize: 9,
      textColor: dark,
      cellPadding: { top: 6, bottom: 6, left: 4, right: 4 },
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 26, halign: 'center' },
      3: { cellWidth: 42, fontStyle: 'normal' },
      4: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: { fillColor: purpleLight },
    margin: { left: 14, right: 14 },
  });

  const afterTable = doc.lastAutoTable.finalY;

  // ── Totals block (right-aligned) ─────────────────────────
  const totW = 78;
  const totX = pageWidth - 14 - totW;
  const totY = afterTable + 10;

  doc.setFillColor(...purpleLight);
  doc.setDrawColor(210, 195, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(totX, totY, totW, 28, 3, 3, 'FD');

  // Subtotal row
  doc.setFontSize(8.5);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...mid);
  doc.text('Subtotal', totX + 6, totY + 9);
  doc.setTextColor(...dark);
  doc.text(`BDT ${fee}`, totX + totW - 6, totY + 9, { align: 'right' });

  // Divider
  doc.setDrawColor(200, 185, 235);
  doc.line(totX + 5, totY + 14, totX + totW - 5, totY + 14);

  // Total row
  doc.setFontSize(10.5);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...purple);
  doc.text('Total', totX + 6, totY + 23);
  doc.text(`BDT ${fee}`, totX + totW - 6, totY + 23, { align: 'right' });

  // ── Status badge (left, same row as totals) ───────────────
  doc.setFillColor(...greenLight);
  doc.setDrawColor(187, 247, 208);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, totY + 4, 34, 12, 3, 3, 'FD');
  doc.setFontSize(8.5);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...green);
  doc.text('PAID', 31, totY + 12, { align: 'center' });

  // ── Thank you note ────────────────────────────────────────
  const noteY = totY + 46;
  doc.setFontSize(9.5);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...mid);
  doc.text('Thank you for registering — we look forward to seeing you!', pageWidth / 2, noteY, { align: 'center' });

  // ── Footer ────────────────────────────────────────────────
  doc.setDrawColor(220, 210, 240);
  doc.setLineWidth(0.3);
  doc.line(14, pageHeight - 18, pageWidth - 14, pageHeight - 18);

  doc.setFontSize(7.5);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...light);
  doc.text(
    `AlumniCircle  ·  alumnicircle.app  ·  Generated ${invoiceDate}`,
    pageWidth / 2,
    pageHeight - 11,
    { align: 'center' }
  );

  const safeName  = (participant.userName || 'User').replace(/[^a-zA-Z0-9]/g, '_');
  const safeTitle = (event.title        || 'Event').replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Invoice_${safeTitle}_${safeName}.pdf`);
};
