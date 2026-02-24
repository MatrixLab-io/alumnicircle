import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { formatEventLocation } from './formatters';

/**
 * Export data to CSV
 */
export const exportToCSV = (data, filename = 'export') => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
};

/**
 * Export data to Excel
 */
export const exportToExcel = (data, filename = 'export', sheetName = 'Sheet1') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  downloadBlob(blob, `${filename}.xlsx`);
};

/**
 * Download blob as file
 */
const downloadBlob = (blob, filename) => {
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Format event participants for export
 */
export const formatParticipantsForExport = (participants) => {
  return participants.map((p, index) => ({
    'S.No': index + 1,
    'Name': p.userName,
    'Email': p.userEmail,
    'Phone': p.userPhone,
    'Status': p.status,
    'Payment Required': p.paymentRequired ? 'Yes' : 'No',
    'Payment Method': p.paymentMethod || '-',
    'Transaction ID': p.transactionId || p.bkashTransactionId || '-',
    'Sent From': p.paymentSenderNumber || '-',
    'Confirmed By': p.cashGivenBy || '-',
    'Confirmed By Contact': p.cashContactNumber || '-',
    'Payment Verified': p.paymentVerified ? 'Yes' : 'No',
    'Joined At': p.joinedAt?.toDate?.().toLocaleString() || '-',
    'Approved At': p.approvedAt?.toDate?.().toLocaleString() || '-',
  }));
};

/**
 * Format members for export
 */
export const formatMembersForExport = (members) => {
  return members.map((m, index) => ({
    'S.No': index + 1,
    'Name': m.name,
    'Email': m.email,
    'Phone': m.phone,
    'Blood Group': m.bloodGroup || '-',
    'Profession': m.profession?.type || '-',
    'Business/Company': m.profession?.businessName || m.profession?.companyName || '-',
    'Designation': m.profession?.designation || '-',
    'City': m.address?.city || '-',
    'Status': m.status,
    'Joined': m.createdAt?.toDate?.().toLocaleDateString() || '-',
  }));
};

/**
 * Format archived event for export
 */
export const formatArchivedEventForExport = (event, participants) => {
  return {
    eventInfo: {
      'Title': event.title,
      'Description': event.description,
      'Location': formatEventLocation(event.location),
      'Event Date': (event.eventDate || event.startDate)?.toDate?.().toLocaleString() || '-',
      'Registration Deadline': (event.registrationDeadline || event.endDate)?.toDate?.().toLocaleString() || '-',
      'Registration Fee': event.registrationFee || 'Free',
      'Total Participants': participants.length,
    },
    participants: formatParticipantsForExport(participants),
  };
};

/**
 * Format archived event participants for export (slimmer data shape from archive)
 */
export const formatArchivedParticipantsForExport = (participants) => {
  return participants.map((p, index) => ({
    'S.No': index + 1,
    'Name': p.userName,
    'Email': p.userEmail,
    'Phone': p.userPhone,
    'Payment Verified': p.paymentVerified ? 'Yes' : 'No',
    'Transaction ID': p.bkashTransactionId || '-',
  }));
};

/**
 * Parse CSV file
 */
export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => resolve(results.data),
      error: (error) => reject(error),
    });
  });
};

/**
 * Parse Excel file
 */
export const parseExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
