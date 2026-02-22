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
  limit,
  serverTimestamp,
  increment,
  writeBatch,
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
    status: eventData.status ?? EVENT_STATUS.UPCOMING,
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
  const { status = null, includeCompleted = false, includeDraft = false } = options;

  let q;
  if (status) {
    q = query(
      collection(db, COLLECTIONS.EVENTS),
      where('status', '==', status),
      orderBy('eventDate', 'asc')
    );
  } else if (!includeCompleted) {
    q = query(
      collection(db, COLLECTIONS.EVENTS),
      where('status', 'in', [EVENT_STATUS.UPCOMING, EVENT_STATUS.ONGOING]),
      orderBy('eventDate', 'asc')
    );
  } else {
    q = query(
      collection(db, COLLECTIONS.EVENTS),
      orderBy('createdAt', 'desc')
    );
  }

  const snapshot = await getDocs(q);
  const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  // Drafts are only visible to admins — filter them out for user-facing calls
  if (!includeDraft) {
    return events.filter((e) => e.status !== EVENT_STATUS.DRAFT);
  }
  return events;
};

/**
 * Get public events
 */
export const getPublicEvents = async () => {
  const q = query(
    collection(db, COLLECTIONS.EVENTS),
    where('isPublic', '==', true),
    where('status', 'in', [EVENT_STATUS.UPCOMING, EVENT_STATUS.ONGOING]),
    orderBy('eventDate', 'asc')
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
  const { paymentMethod = null, transactionId = null, paymentSenderNumber = null } = paymentInfo;

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
    paymentSenderNumber: paymentSenderNumber || null,
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

  // For free events the participant is immediately approved — increment count now.
  // For paid events the count is incremented when the admin approves payment.
  if (!paymentRequired) {
    await updateDoc(doc(db, COLLECTIONS.EVENTS, eventId), {
      currentParticipants: increment(1),
    });
  }

  return { id: docRef.id, success: true };
};

/**
 * Get a single user's participation record for an event (member-safe query)
 */
export const getUserParticipation = async (eventId, userId) => {
  if (!eventId || !userId) return null;
  const q = query(
    collection(db, COLLECTIONS.EVENT_PARTICIPANTS),
    where('eventId', '==', eventId),
    where('userId', '==', userId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
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

  // Increment confirmed participant count.
  // Free-event participants were already counted at join; paid-event
  // participants are counted here when payment is confirmed.
  if (participantData?.paymentRequired) {
    await updateDoc(doc(db, COLLECTIONS.EVENTS, participantData.eventId), {
      currentParticipants: increment(1),
    });
  }

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

  // Decrement count only if the participant was already counted:
  //   - free-event participants are counted at join (status was APPROVED)
  //   - paid-event participants are counted at admin approval (status was APPROVED)
  //   - paid pending participants were never counted → no decrement needed
  if (participantData?.status === PARTICIPANT_STATUS.APPROVED) {
    await updateDoc(doc(db, COLLECTIONS.EVENTS, eventId), {
      currentParticipants: increment(-1),
    });
  }

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
/**
 * Publish a draft event — determines the correct status from eventDate
 */
export const publishEvent = async (eventId) => {
  const event = await getEventById(eventId);
  if (!event) throw new Error('Event not found');

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const rawDate = event.eventDate || event.startDate;

  let newStatus = EVENT_STATUS.UPCOMING; // default when no date set
  if (rawDate) {
    const eventDate = rawDate.toDate ? rawDate.toDate() : new Date(rawDate);
    if (eventDate > todayEnd) newStatus = EVENT_STATUS.UPCOMING;
    else if (eventDate >= todayStart) newStatus = EVENT_STATUS.ONGOING;
    else newStatus = EVENT_STATUS.COMPLETED;
  }

  await updateDoc(doc(db, COLLECTIONS.EVENTS, eventId), {
    status: newStatus,
    updatedAt: serverTimestamp(),
  });

  return { success: true, status: newStatus };
};

/**
 * Auto-sync event statuses based on eventDate.
 * - eventDate is today       → ongoing
 * - eventDate is in the past → completed
 * - eventDate is in future   → upcoming (corrects any wrongly-set status)
 * Skips draft and cancelled events.
 */
export const syncEventStatuses = async () => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // Only look at events that could be stale (upcoming or ongoing)
  const q = query(
    collection(db, COLLECTIONS.EVENTS),
    where('status', 'in', [EVENT_STATUS.UPCOMING, EVENT_STATUS.ONGOING])
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return;

  const batch = writeBatch(db);
  let changeCount = 0;

  snapshot.docs.forEach((docSnap) => {
    const event = docSnap.data();
    const rawDate = event.eventDate || event.startDate;
    if (!rawDate) return;

    const eventDate = rawDate.toDate ? rawDate.toDate() : new Date(rawDate);

    let newStatus;
    if (eventDate > todayEnd) {
      newStatus = EVENT_STATUS.UPCOMING;
    } else if (eventDate >= todayStart) {
      newStatus = EVENT_STATUS.ONGOING;
    } else {
      newStatus = EVENT_STATUS.COMPLETED;
    }

    if (newStatus !== event.status) {
      batch.update(docSnap.ref, { status: newStatus, updatedAt: serverTimestamp() });
      changeCount++;
    }
  });

  if (changeCount > 0) {
    await batch.commit();
  }
};

export const getEventStats = async () => {
  const eventsRef = collection(db, COLLECTIONS.EVENTS);

  const [upcomingSnapshot, ongoingSnapshot, completedSnapshot, draftSnapshot] = await Promise.all([
    getDocs(query(eventsRef, where('status', '==', EVENT_STATUS.UPCOMING))),
    getDocs(query(eventsRef, where('status', '==', EVENT_STATUS.ONGOING))),
    getDocs(query(eventsRef, where('status', '==', EVENT_STATUS.COMPLETED))),
    getDocs(query(eventsRef, where('status', '==', EVENT_STATUS.DRAFT))),
  ]);

  return {
    upcoming: upcomingSnapshot.size,
    ongoing: ongoingSnapshot.size,
    completed: completedSnapshot.size,
    drafts: draftSnapshot.size,
    total: upcomingSnapshot.size + ongoingSnapshot.size + completedSnapshot.size,
  };
};
