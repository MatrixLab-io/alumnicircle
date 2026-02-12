import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { uploadImage } from './cloudinary.service';
import { COLLECTIONS, EVENT_STATUS, PARTICIPANT_STATUS, ACTIVITY_TYPES } from '../config/constants';
import { logActivity } from './activityLog.service';

/**
 * Create a new event
 */
export const createEvent = async (eventData, adminInfo = {}) => {
  const { uid: adminUid, name: adminName, email: adminEmail } = adminInfo;

  const docRef = await addDoc(collection(db, COLLECTIONS.EVENTS), {
    ...eventData,
    currentParticipants: 0,
    status: EVENT_STATUS.UPCOMING,
    createdBy: adminUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Log activity (fire-and-forget)
  logActivity({
    type: ACTIVITY_TYPES.EVENT_CREATED,
    adminId: adminUid,
    adminName,
    adminEmail,
    targetId: docRef.id,
    targetName: eventData.title,
  }).catch(() => {});

  return { id: docRef.id, success: true };
};

/**
 * Upload event banner
 */
export const uploadEventBanner = async (eventId, file) => {
  return await uploadImage(file, `events/${eventId}`);
};

/**
 * Get event by ID
 */
export const getEventById = async (eventId) => {
  const eventDoc = await getDoc(doc(db, COLLECTIONS.EVENTS, eventId));
  if (eventDoc.exists()) {
    return { id: eventId, ...eventDoc.data() };
  }
  return null;
};

/**
 * Update event
 */
export const updateEvent = async (eventId, data, adminInfo = {}) => {
  const { uid: adminUid, name: adminName, email: adminEmail } = adminInfo;

  await updateDoc(doc(db, COLLECTIONS.EVENTS, eventId), {
    ...data,
    updatedAt: serverTimestamp(),
  });

  // Log activity only when admin info is provided (skip for banner-only updates)
  if (adminUid) {
    logActivity({
      type: ACTIVITY_TYPES.EVENT_UPDATED,
      adminId: adminUid,
      adminName,
      adminEmail,
      targetId: eventId,
      targetName: data.title || null,
    }).catch(() => {});
  }

  return { success: true };
};

/**
 * Delete event
 */
export const deleteEvent = async (eventId, adminInfo = {}) => {
  const { uid: adminUid, name: adminName, email: adminEmail } = adminInfo;

  // Get event details before deletion for logging
  let eventTitle = null;
  if (adminUid) {
    const eventData = await getEventById(eventId);
    eventTitle = eventData?.title;
  }

  // Delete all participants first
  const participantsQuery = query(
    collection(db, COLLECTIONS.EVENT_PARTICIPANTS),
    where('eventId', '==', eventId)
  );
  const participantsSnapshot = await getDocs(participantsQuery);
  const deletePromises = participantsSnapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deletePromises);

  // Delete event document
  await deleteDoc(doc(db, COLLECTIONS.EVENTS, eventId));

  // Log activity only when admin info is provided (skip when called from archiveEvent)
  if (adminUid) {
    logActivity({
      type: ACTIVITY_TYPES.EVENT_DELETED,
      adminId: adminUid,
      adminName,
      adminEmail,
      targetId: eventId,
      targetName: eventTitle,
    }).catch(() => {});
  }

  return { success: true };
};

/**
 * Get all events
 */
export const getAllEvents = async (options = {}) => {
  const { status = null, includeCompleted = false } = options;

  let q;
  if (status) {
    q = query(
      collection(db, COLLECTIONS.EVENTS),
      where('status', '==', status),
      orderBy('startDate', 'asc')
    );
  } else if (!includeCompleted) {
    q = query(
      collection(db, COLLECTIONS.EVENTS),
      where('status', 'in', [EVENT_STATUS.UPCOMING, EVENT_STATUS.ONGOING]),
      orderBy('startDate', 'asc')
    );
  } else {
    q = query(
      collection(db, COLLECTIONS.EVENTS),
      orderBy('startDate', 'desc')
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * Get public events
 */
export const getPublicEvents = async () => {
  const q = query(
    collection(db, COLLECTIONS.EVENTS),
    where('isPublic', '==', true),
    where('status', 'in', [EVENT_STATUS.UPCOMING, EVENT_STATUS.ONGOING]),
    orderBy('startDate', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * Join event (create participant record)
 */
export const joinEvent = async (eventId, userId, userData, paymentInfo = {}) => {
  const event = await getEventById(eventId);
  if (!event) throw new Error('Event not found');

  // Check participant limit
  if (event.participantLimit && event.currentParticipants >= event.participantLimit) {
    throw new Error('Event is full');
  }

  // Check if already joined
  const existingQuery = query(
    collection(db, COLLECTIONS.EVENT_PARTICIPANTS),
    where('eventId', '==', eventId),
    where('userId', '==', userId)
  );
  const existingSnapshot = await getDocs(existingQuery);
  if (!existingSnapshot.empty) {
    throw new Error('Already registered for this event');
  }

  const paymentRequired = event.registrationFee > 0;
  const { paymentMethod = null, transactionId = null } = paymentInfo;

  const participantData = {
    eventId,
    userId,
    userName: userData.name,
    userEmail: userData.email,
    userPhone: userData.phone,
    status: paymentRequired ? PARTICIPANT_STATUS.PENDING : PARTICIPANT_STATUS.APPROVED,
    paymentRequired,
    paymentMethod: paymentMethod || null,
    transactionId: transactionId || null,
    bkashTransactionId: paymentMethod === 'bkash' ? transactionId : null,
    paymentVerified: !paymentRequired,
    paymentVerifiedAt: null,
    paymentVerifiedBy: null,
    joinedAt: serverTimestamp(),
    approvedAt: paymentRequired ? null : serverTimestamp(),
    approvedBy: null,
    adminNotes: null,
  };

  const docRef = await addDoc(collection(db, COLLECTIONS.EVENT_PARTICIPANTS), participantData);

  // Update participant count
  await updateDoc(doc(db, COLLECTIONS.EVENTS, eventId), {
    currentParticipants: increment(1),
  });

  return { id: docRef.id, success: true };
};

/**
 * Get event participants
 */
export const getEventParticipants = async (eventId, status = null) => {
  let q = query(
    collection(db, COLLECTIONS.EVENT_PARTICIPANTS),
    where('eventId', '==', eventId),
    orderBy('joinedAt', 'desc')
  );

  if (status) {
    q = query(
      collection(db, COLLECTIONS.EVENT_PARTICIPANTS),
      where('eventId', '==', eventId),
      where('status', '==', status),
      orderBy('joinedAt', 'desc')
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * Approve participant
 */
export const approveParticipant = async (participantId, adminInfo = {}) => {
  const { uid: adminUid, name: adminName, email: adminEmail } = adminInfo;

  // Get participant details for logging
  const participantDoc = await getDoc(doc(db, COLLECTIONS.EVENT_PARTICIPANTS, participantId));
  const participantData = participantDoc.data();

  await updateDoc(doc(db, COLLECTIONS.EVENT_PARTICIPANTS, participantId), {
    status: PARTICIPANT_STATUS.APPROVED,
    paymentVerified: true,
    paymentVerifiedAt: serverTimestamp(),
    paymentVerifiedBy: adminUid,
    approvedAt: serverTimestamp(),
    approvedBy: adminUid,
  });

  // Log activity (fire-and-forget)
  logActivity({
    type: ACTIVITY_TYPES.PARTICIPANT_APPROVED,
    adminId: adminUid,
    adminName,
    adminEmail,
    targetId: participantId,
    targetName: participantData?.userName,
    details: { eventId: participantData?.eventId, userEmail: participantData?.userEmail },
  }).catch(() => {});

  return { success: true };
};

/**
 * Reject participant
 */
export const rejectParticipant = async (participantId, eventId, adminInfo = {}, notes = null) => {
  const { uid: adminUid, name: adminName, email: adminEmail } = adminInfo;

  // Get participant details for logging
  const participantDoc = await getDoc(doc(db, COLLECTIONS.EVENT_PARTICIPANTS, participantId));
  const participantData = participantDoc.data();

  await updateDoc(doc(db, COLLECTIONS.EVENT_PARTICIPANTS, participantId), {
    status: PARTICIPANT_STATUS.REJECTED,
    approvedBy: adminUid,
    adminNotes: notes,
  });

  // Decrement participant count
  await updateDoc(doc(db, COLLECTIONS.EVENTS, eventId), {
    currentParticipants: increment(-1),
  });

  // Log activity (fire-and-forget)
  logActivity({
    type: ACTIVITY_TYPES.PARTICIPANT_REJECTED,
    adminId: adminUid,
    adminName,
    adminEmail,
    targetId: participantId,
    targetName: participantData?.userName,
    details: { eventId, userEmail: participantData?.userEmail, reason: notes },
  }).catch(() => {});

  return { success: true };
};

/**
 * Get user's events
 */
export const getUserEvents = async (userId) => {
  const q = query(
    collection(db, COLLECTIONS.EVENT_PARTICIPANTS),
    where('userId', '==', userId),
    orderBy('joinedAt', 'desc')
  );

  const snapshot = await getDocs(q);
  const participations = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  // Fetch event details for each participation
  const eventsPromises = participations.map(async (p) => {
    const event = await getEventById(p.eventId);
    return { ...p, event };
  });

  return await Promise.all(eventsPromises);
};

/**
 * Archive completed event
 */
export const archiveEvent = async (eventId, adminInfo = {}) => {
  const { uid: adminUid, name: adminName, email: adminEmail } = adminInfo;

  const event = await getEventById(eventId);
  if (!event) throw new Error('Event not found');

  const participants = await getEventParticipants(eventId, PARTICIPANT_STATUS.APPROVED);

  // Create archive document
  await addDoc(collection(db, COLLECTIONS.ARCHIVED_EVENTS), {
    eventData: event,
    participants: participants.map((p) => ({
      userId: p.userId,
      userName: p.userName,
      userEmail: p.userEmail,
      userPhone: p.userPhone,
      paymentVerified: p.paymentVerified,
      bkashTransactionId: p.bkashTransactionId,
    })),
    totalParticipants: participants.length,
    totalRevenue: event.registrationFee * participants.length,
    exportedFileUrl: null,
    archivedAt: serverTimestamp(),
    archivedBy: adminUid,
  });

  // Delete original event and participants (no adminInfo to avoid duplicate log)
  await deleteEvent(eventId);

  // Log activity (fire-and-forget)
  logActivity({
    type: ACTIVITY_TYPES.EVENT_ARCHIVED,
    adminId: adminUid,
    adminName,
    adminEmail,
    targetId: eventId,
    targetName: event.title,
    details: { totalParticipants: participants.length },
  }).catch(() => {});

  return { success: true };
};

/**
 * Get all archived events
 */
export const getArchivedEvents = async () => {
  const q = query(
    collection(db, COLLECTIONS.ARCHIVED_EVENTS),
    orderBy('archivedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * Get a single archived event by ID
 */
export const getArchivedEventById = async (archivedEventId) => {
  const docSnap = await getDoc(doc(db, COLLECTIONS.ARCHIVED_EVENTS, archivedEventId));
  if (docSnap.exists()) {
    return { id: archivedEventId, ...docSnap.data() };
  }
  return null;
};

/**
 * Get event statistics
 */
export const getEventStats = async () => {
  const eventsRef = collection(db, COLLECTIONS.EVENTS);

  const [upcomingSnapshot, ongoingSnapshot, completedSnapshot] = await Promise.all([
    getDocs(query(eventsRef, where('status', '==', EVENT_STATUS.UPCOMING))),
    getDocs(query(eventsRef, where('status', '==', EVENT_STATUS.ONGOING))),
    getDocs(query(eventsRef, where('status', '==', EVENT_STATUS.COMPLETED))),
  ]);

  return {
    upcoming: upcomingSnapshot.size,
    ongoing: ongoingSnapshot.size,
    completed: completedSnapshot.size,
    total: upcomingSnapshot.size + ongoingSnapshot.size + completedSnapshot.size,
  };
};
