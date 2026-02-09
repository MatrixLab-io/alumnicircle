import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';
import { USER_ROLES, USER_STATUS, VISIBILITY, COLLECTIONS } from '../config/constants';

const actionCodeSettings = {
  url: import.meta.env.VITE_APP_URL + '/login?verified=true',
  handleCodeInApp: false,
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
      if (userDoc.exists()) {
        const profile = { uid, ...userDoc.data() };
        setUserProfile(profile);
        return profile;
      }
      return null;
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return null;
    }
  };

  // Create initial user profile
  const createUserProfile = async (uid, data) => {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    const profileData = {
      email: data.email,
      name: data.name,
      phone: data.phone || '',
      phoneVisibility: VISIBILITY.PRIVATE,
      emailVisibility: VISIBILITY.PUBLIC,
      nameVisibility: VISIBILITY.PUBLIC,
      role: USER_ROLES.USER,
      status: USER_STATUS.PENDING,
      photo: null,
      bloodGroup: null,
      profession: null,
      address: null,
      socialLinks: null,
      profileCompletion: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      approvedAt: null,
      approvedBy: null,
      lastLoginAt: null,
    };

    await setDoc(userRef, profileData);
    return { uid, ...profileData };
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchUserProfile(firebaseUser.uid);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Register with email and password
  const registerWithEmail = async (email, password, name, phone) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Create user profile in Firestore
      await createUserProfile(result.user.uid, { email, name, phone });

      // Send email verification with redirect
      await sendEmailVerification(result.user, actionCodeSettings);

      return { success: true, user: result.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Register/Login with Google
  const signInWithGoogle = async (additionalData = {}) => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);

      // Check if user profile exists
      const existingProfile = await fetchUserProfile(result.user.uid);

      if (!existingProfile) {
        // New user - create profile
        await createUserProfile(result.user.uid, {
          email: result.user.email,
          name: additionalData.name || result.user.displayName || '',
          phone: additionalData.phone || '',
        });
        await fetchUserProfile(result.user.uid);
      } else {
        // Existing user - update last login
        await updateDoc(doc(db, COLLECTIONS.USERS, result.user.uid), {
          lastLoginAt: serverTimestamp(),
        });
      }

      return { success: true, user: result.user, isNewUser: !existingProfile };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Login with email and password
  const loginWithEmail = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);

      // Update last login
      await updateDoc(doc(db, COLLECTIONS.USERS, result.user.uid), {
        lastLoginAt: serverTimestamp(),
      });

      await fetchUserProfile(result.user.uid);
      return { success: true, user: result.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Send verification email
  const resendVerificationEmail = async () => {
    if (!user) return { success: false, error: 'No user logged in' };
    try {
      await sendEmailVerification(user, actionCodeSettings);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Refresh user profile
  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.uid);
    }
  };

  // Check user permissions
  const isAdmin = userProfile?.role === USER_ROLES.ADMIN || userProfile?.role === USER_ROLES.SUPER_ADMIN;
  const isSuperAdmin = userProfile?.role === USER_ROLES.SUPER_ADMIN;
  const isApproved = userProfile?.status === USER_STATUS.APPROVED;
  const isPending = userProfile?.status === USER_STATUS.PENDING;
  const isRejected = userProfile?.status === USER_STATUS.REJECTED;
  const isEmailVerified = user?.emailVerified || false;

  const value = {
    user,
    userProfile,
    loading,
    error,
    registerWithEmail,
    signInWithGoogle,
    loginWithEmail,
    logout,
    resendVerificationEmail,
    resetPassword,
    refreshProfile,
    isAdmin,
    isSuperAdmin,
    isApproved,
    isPending,
    isRejected,
    isEmailVerified,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
