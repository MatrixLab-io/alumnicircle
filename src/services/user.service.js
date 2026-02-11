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
import { COLLECTIONS, USER_STATUS, ITEMS_PER_PAGE } from '../config/constants';
import { calculateProfileCompletion } from '../utils/helpers';

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
export const approveUser = async (uid, adminUid) => {
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

  // Send approval email
  if (userData?.email && userData?.name) {
    try {
      const emailSent = await sendApprovalEmail(userData.email, userData.name);
      if (emailSent) {
        console.log('✅ Approval email sent to:', userData.email);
      } else {
        console.log('⚠️ Approval email not sent (EmailJS not configured or error occurred)');
      }
    } catch (error) {
      console.error('❌ Failed to send approval email:', error);
      // Don't fail the approval if email fails
    }
  }

  return { success: true };
};

/**
 * Reject user
 */
export const rejectUser = async (uid, adminUid) => {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    status: USER_STATUS.REJECTED,
    approvedAt: serverTimestamp(),
    approvedBy: adminUid,
    updatedAt: serverTimestamp(),
  });
  return { success: true };
};

/**
 * Update user role
 */
export const updateUserRole = async (uid, role) => {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    role,
    updatedAt: serverTimestamp(),
  });
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
 * Delete user
 */
export const deleteUser = async (uid) => {
  // Delete user document
  await deleteDoc(doc(db, COLLECTIONS.USERS, uid));
  return { success: true };
};

/**
 * Get user statistics
 */
export const getUserStats = async () => {
  const usersRef = collection(db, COLLECTIONS.USERS);

  const [totalSnapshot, pendingSnapshot, approvedSnapshot] = await Promise.all([
    getDocs(usersRef),
    getDocs(query(usersRef, where('status', '==', USER_STATUS.PENDING))),
    getDocs(query(usersRef, where('status', '==', USER_STATUS.APPROVED))),
  ]);

  return {
    total: totalSnapshot.size,
    pending: pendingSnapshot.size,
    approved: approvedSnapshot.size,
    rejected: totalSnapshot.size - pendingSnapshot.size - approvedSnapshot.size,
  };
};
