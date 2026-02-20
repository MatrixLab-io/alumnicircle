import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { uploadImage } from './cloudinary.service';
import { sendApprovalEmail } from './email.service';
import { COLLECTIONS, USER_STATUS, USER_ROLES, ITEMS_PER_PAGE, ACTIVITY_TYPES } from '../config/constants';
import { calculateProfileCompletion } from '../utils/helpers';
import { logActivity } from './activityLog.service';

/**
 * Get user by ID
 */
export const getUserById = async (uid) => {
  const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  if (userDoc.exists()) {
    return { uid, ...userDoc.data() };
  }
  return null;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (uid, data) => {
  const userRef = doc(db, COLLECTIONS.USERS, uid);
  const updateData = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  // Calculate profile completion
  const currentUser = await getUserById(uid);
  const mergedData = { ...currentUser, ...data };
  updateData.profileCompletion = calculateProfileCompletion(mergedData);

  await updateDoc(userRef, updateData);
  return { success: true };
};

/**
 * Upload user photo
 */
export const uploadUserPhoto = async (uid, file) => {
  const downloadURL = await uploadImage(file, `users/${uid}`);
  await updateUserProfile(uid, { photo: downloadURL });
  return downloadURL;
};

/**
 * Delete user photo
 */
export const deleteUserPhoto = async (uid) => {
  await updateUserProfile(uid, { photo: null });
};

/**
 * Get all approved users (for directory)
 */
export const getApprovedUsers = async (options = {}) => {
  const {
    pageSize = ITEMS_PER_PAGE,
    lastDoc = null,
    searchTerm = '',
    sortBy = 'name',
    sortOrder = 'asc',
  } = options;

  let q = query(
    collection(db, COLLECTIONS.USERS),
    where('status', '==', USER_STATUS.APPROVED),
    orderBy(sortBy, sortOrder),
    limit(pageSize)
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);
  const users = snapshot.docs.map((doc) => ({
    uid: doc.id,
    ...doc.data(),
  }));

  // Client-side search filtering (for simplicity)
  let filteredUsers = users;
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredUsers = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.profession?.businessName?.toLowerCase().includes(term) ||
        user.profession?.companyName?.toLowerCase().includes(term)
    );
  }

  return {
    users: filteredUsers,
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    hasMore: snapshot.docs.length === pageSize,
  };
};

/**
 * Get pending users (for admin approval)
 */
export const getPendingUsers = async () => {
  const q = query(
    collection(db, COLLECTIONS.USERS),
    where('status', '==', USER_STATUS.PENDING),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    uid: doc.id,
    ...doc.data(),
  }));
};

/**
 * Approve user
 */
export const approveUser = async (uid, adminInfo = {}) => {
  const { uid: adminUid, name: adminName, email: adminEmail } = adminInfo;

  // Get user details before approval
  const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  const userData = userDoc.data();

  // Update user status
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    status: USER_STATUS.APPROVED,
    approvedAt: serverTimestamp(),
    approvedBy: adminUid,
    updatedAt: serverTimestamp(),
  });

  // Send approval email (fire-and-forget, don't fail the approval if email fails)
  if (userData?.email && userData?.name) {
    try {
      await sendApprovalEmail(userData.email, userData.name);
    } catch (_) {
      // Don't fail the approval if email fails
    }
  }

  // Log activity (fire-and-forget)
  logActivity({
    type: ACTIVITY_TYPES.USER_APPROVED,
    adminId: adminUid,
    adminName,
    adminEmail,
    targetId: uid,
    targetName: userData?.name,
    details: { userEmail: userData?.email },
  }).catch(() => {});

  return { success: true };
};

/**
 * Reject user
 */
export const rejectUser = async (uid, adminInfo = {}) => {
  const { uid: adminUid, name: adminName, email: adminEmail } = adminInfo;

  // Get user details before deletion
  const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  const userData = userDoc.data();

  // Delete user document (rejected users are removed entirely)
  await deleteDoc(doc(db, COLLECTIONS.USERS, uid));

  // Log activity (fire-and-forget)
  logActivity({
    type: ACTIVITY_TYPES.USER_REJECTED,
    adminId: adminUid,
    adminName,
    adminEmail,
    targetId: uid,
    targetName: userData?.name,
    details: { userEmail: userData?.email },
  }).catch(() => {});

  return { success: true };
};

/**
 * Update user role
 */
export const updateUserRole = async (uid, role, adminInfo = {}) => {
  const { uid: adminUid, name: adminName, email: adminEmail } = adminInfo;

  // Get user details before role change
  const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  const userData = userDoc.data();
  const oldRole = userData?.role;

  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    role,
    updatedAt: serverTimestamp(),
  });

  // Log activity (fire-and-forget)
  if (adminUid) {
    logActivity({
      type: ACTIVITY_TYPES.USER_ROLE_CHANGED,
      adminId: adminUid,
      adminName,
      adminEmail,
      targetId: uid,
      targetName: userData?.name,
      details: { userEmail: userData?.email, oldRole, newRole: role },
    }).catch(() => {});
  }

  return { success: true };
};

/**
 * Get all users (for super admin)
 */
export const getAllUsers = async (options = {}) => {
  const { status = null, pageSize = ITEMS_PER_PAGE, lastDoc = null } = options;

  let q = query(
    collection(db, COLLECTIONS.USERS),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  if (status) {
    q = query(
      collection(db, COLLECTIONS.USERS),
      where('status', '==', status),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
  }

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);
  return {
    users: snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() })),
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    hasMore: snapshot.docs.length === pageSize,
  };
};

/**
 * Delete user and their event participation records
 */
export const deleteUser = async (uid, adminInfo = {}) => {
  const { uid: adminUid, name: adminName, email: adminEmail } = adminInfo;

  // Get user details before deletion for logging
  const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  const userData = userDoc.data();

  // Delete all event participation records for this user
  const participantsQuery = query(
    collection(db, COLLECTIONS.EVENT_PARTICIPANTS),
    where('userId', '==', uid)
  );
  const participantsSnapshot = await getDocs(participantsQuery);
  const deletePromises = participantsSnapshot.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(deletePromises);

  // Delete user document
  await deleteDoc(doc(db, COLLECTIONS.USERS, uid));

  // Log activity (fire-and-forget)
  if (adminUid) {
    logActivity({
      type: ACTIVITY_TYPES.USER_DELETED,
      adminId: adminUid,
      adminName,
      adminEmail,
      targetId: uid,
      targetName: userData?.name,
      details: { userEmail: userData?.email },
    }).catch(() => {});
  }

  return { success: true };
};

/**
 * Bulk delete users
 */
export const deleteUsers = async (uids, adminInfo = {}) => {
  const results = await Promise.allSettled(
    uids.map((uid) => deleteUser(uid, adminInfo))
  );
  const succeeded = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;
  return { succeeded, failed };
};

/**
 * Get user statistics
 */
export const getUserStats = async () => {
  const usersRef = collection(db, COLLECTIONS.USERS);

  const [totalSnapshot, pendingSnapshot, approvedSnapshot, adminSnapshot] = await Promise.all([
    getDocs(usersRef),
    getDocs(query(usersRef, where('status', '==', USER_STATUS.PENDING))),
    getDocs(query(usersRef, where('status', '==', USER_STATUS.APPROVED))),
    getDocs(query(usersRef, where('role', 'in', [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]))),
  ]);

  const approvedDocs = approvedSnapshot.docs.map((d) => d.data());
  const approvedUnverified = approvedDocs.filter(
    (u) => u.authProvider === 'email' && !u.emailVerified
  ).length;

  return {
    total: totalSnapshot.size,
    pending: pendingSnapshot.size,
    approved: approvedSnapshot.size,
    admins: adminSnapshot.size,
    approvedUnverified,
    rejected: totalSnapshot.size - pendingSnapshot.size - approvedSnapshot.size,
  };
};

/**
 * Get latest approved members (ordered by createdAt — uses existing index)
 */
export const getLatestMembers = async (count = 5) => {
  const q = query(
    collection(db, COLLECTIONS.USERS),
    where('status', '==', USER_STATUS.APPROVED),
    orderBy('createdAt', 'desc'),
    limit(count)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
};
