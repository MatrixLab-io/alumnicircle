import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../config/constants';

/**
 * Log an admin activity
 */
export const logActivity = async ({ type, adminId, adminName, adminEmail, targetId, targetName, details = {} }) => {
  await addDoc(collection(db, COLLECTIONS.ACTIVITY_LOGS), {
    type,
    adminId,
    adminName,
    adminEmail,
    targetId: targetId || null,
    targetName: targetName || null,
    details,
    createdAt: serverTimestamp(),
  });
};

/**
 * Get activity logs with optional filters and pagination
 */
export const getActivityLogs = async (options = {}) => {
  const { type = null, adminId = null, pageSize = 20, lastDoc = null } = options;

  const constraints = [collection(db, COLLECTIONS.ACTIVITY_LOGS)];
  const queryConstraints = [];

  if (type) {
    queryConstraints.push(where('type', '==', type));
  }

  if (adminId) {
    queryConstraints.push(where('adminId', '==', adminId));
  }

  queryConstraints.push(orderBy('createdAt', 'desc'));
  queryConstraints.push(limit(pageSize));

  if (lastDoc) {
    queryConstraints.push(startAfter(lastDoc));
  }

  const q = query(collection(db, COLLECTIONS.ACTIVITY_LOGS), ...queryConstraints);
  const snapshot = await getDocs(q);

  const logs = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return {
    logs,
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    hasMore: snapshot.docs.length === pageSize,
  };
};
