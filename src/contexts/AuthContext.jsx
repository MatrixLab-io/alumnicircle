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
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';
import { USER_ROLES, USER_STATUS, VISIBILITY, COLLECTIONS } from '../config/constants';
import { getErrorMessage, logError } from '../utils/errorMessages';

const actionCodeSettings = {
  url: (import.meta.env.VITE_APP_URL || 'http://localhost:5173') + '/auth/action',
  handleCodeInApp: true,
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
      // Profile fetch failed silently
      return null;
    }
  };

  // Check if email already exists in Firestore users collection
  const getExistingProfileByEmail = async (email) => {
    const q = query(
      collection(db, COLLECTIONS.USERS),
      where('email', '==', email),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { uid: docSnap.id, ...docSnap.data() };
    }
    return null;
  };

  // Create initial user profile
  const createUserProfile = async (uid, data) => {
    // Check for duplicate email
    const existing = await getExistingProfileByEmail(data.email);
    if (existing) {
      // Tell the user which auth method was used originally
      const method = existing.authProvider === 'google' ? 'Google' : 'email/password';
      throw { code: 'auth/email-already-in-use', message: `An account with this email already exists. Please sign in with ${method}.` };
    }

    const userRef = doc(db, COLLECTIONS.USERS, uid);
    const profileData = {
      email: data.email,
      name: data.name,
      phone: data.phone || '',
      authProvider: data.authProvider || 'email',
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
      emailVerified: data.authProvider === 'google',
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
      await createUserProfile(result.user.uid, { email, name, phone, authProvider: 'email' });

      // Send email verification with redirect
      await sendEmailVerification(result.user, actionCodeSettings);

      return { success: true, user: result.user };
    } catch (err) {
      logError('Register', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Register/Login with Google
  const signInWithGoogle = async (additionalData = {}) => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);

      // Check if user profile exists for this UID
      const existingProfile = await fetchUserProfile(result.user.uid);

      if (!existingProfile) {
        // No profile for this UID — check if email already registered under a different UID
        const emailProfile = await getExistingProfileByEmail(result.user.email);

        if (emailProfile) {
          // Block if originally registered with email/password
          if (emailProfile.authProvider === 'email') {
            await signOut(auth);
            setUser(null);
            setUserProfile(null);
            const msg = 'This email was registered with email/password. Please sign in with your email and password.';
            setError(msg);
            return { success: false, error: msg };
          }
          // Email exists under a different UID with Google — use the existing profile
          setUserProfile(emailProfile);
          await updateDoc(doc(db, COLLECTIONS.USERS, emailProfile.uid), {
            lastLoginAt: serverTimestamp(),
          });
          return { success: true, user: result.user, isNewUser: false };
        }

        // If coming from the registration page, create the profile
        if (additionalData.isRegistration || additionalData.name || additionalData.phone) {
          await createUserProfile(result.user.uid, {
            email: result.user.email,
            name: additionalData.name || result.user.displayName || '',
            phone: additionalData.phone || '',
            authProvider: 'google',
          });
          await fetchUserProfile(result.user.uid);
          return { success: true, user: result.user, isNewUser: true };
        }

        // No Firestore profile — could be new user or deleted user
        // Delete the auto-created Firebase Auth account to keep things clean
        try { await result.user.delete(); } catch (_) { await signOut(auth); }
        setUser(null);
        setUserProfile(null);
        return { success: false, noProfile: true };
      } else {
        // Block if originally registered with email/password
        if (existingProfile.authProvider === 'email') {
          await signOut(auth);
          setUser(null);
          setUserProfile(null);
          const msg = 'This account was registered with email/password. Please sign in with your email and password.';
          setError(msg);
          return { success: false, error: msg };
        }
        // Existing Google user - update last login
        await updateDoc(doc(db, COLLECTIONS.USERS, result.user.uid), {
          lastLoginAt: serverTimestamp(),
        });
      }

      return { success: true, user: result.user, isNewUser: false };
    } catch (err) {
      logError('Google Sign-In', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Login with email and password
  const loginWithEmail = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);

      // Check if Firestore profile still exists (may have been deleted by admin)
      const profile = await fetchUserProfile(result.user.uid);
      if (!profile) {
        // User was deleted by admin — sign out and notify the caller
        await signOut(auth);
        setUser(null);
        setUserProfile(null);
        return { success: false, accountRemoved: true };
      }

      // Block if originally registered with Google
      if (profile.authProvider === 'google') {
        await signOut(auth);
        setUser(null);
        setUserProfile(null);
        const msg = 'This account was registered with Google. Please sign in with Google.';
        setError(msg);
        return { success: false, error: msg };
      }

      // Update last login (and mark email verified if confirmed)
      const loginUpdate = { lastLoginAt: serverTimestamp() };
      if (result.user.emailVerified) loginUpdate.emailVerified = true;
      await updateDoc(doc(db, COLLECTIONS.USERS, result.user.uid), loginUpdate);

      return { success: true, user: result.user, profile };
    } catch (err) {
      logError('Login', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Request re-approval for a deleted account (signs in and creates pending profile)
  const requestReapproval = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;
      const userRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
      const profileData = {
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        phone: '',
        authProvider: 'email',
        phoneVisibility: VISIBILITY.PRIVATE,
        emailVisibility: VISIBILITY.PUBLIC,
        nameVisibility: VISIBILITY.PUBLIC,
        role: USER_ROLES.USER,
        status: USER_STATUS.PENDING,
        photo: firebaseUser.photoURL || null,
        bloodGroup: null,
        profession: null,
        address: null,
        socialLinks: null,
        profileCompletion: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        approvedAt: null,
        approvedBy: null,
        lastLoginAt: serverTimestamp(),
        emailVerified: false,
      };
      await setDoc(userRef, profileData);
      await fetchUserProfile(firebaseUser.uid);
      return { success: true };
    } catch (err) {
      logError('Re-approval request', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Request re-approval for a deleted Google account
  const requestReapprovalGoogle = async () => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // Double-check profile doesn't exist already (in case of race)
      const existing = await fetchUserProfile(firebaseUser.uid);
      if (existing) {
        return { success: true };
      }

      const userRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
      const profileData = {
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        phone: '',
        authProvider: 'google',
        phoneVisibility: VISIBILITY.PRIVATE,
        emailVisibility: VISIBILITY.PUBLIC,
        nameVisibility: VISIBILITY.PUBLIC,
        role: USER_ROLES.USER,
        status: USER_STATUS.PENDING,
        photo: firebaseUser.photoURL || null,
        bloodGroup: null,
        profession: null,
        address: null,
        socialLinks: null,
        profileCompletion: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        approvedAt: null,
        approvedBy: null,
        lastLoginAt: serverTimestamp(),
        emailVerified: true,
      };
      await setDoc(userRef, profileData);
      await fetchUserProfile(firebaseUser.uid);
      return { success: true };
    } catch (err) {
      logError('Google re-approval request', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
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
    if (!user) return { success: false, error: 'Please sign in to resend verification email.' };
    try {
      await sendEmailVerification(user, actionCodeSettings);
      return { success: true };
    } catch (err) {
      logError('Resend Verification', err);
      const errorMessage = getErrorMessage(err);
      return { success: false, error: errorMessage };
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (err) {
      logError('Password Reset', err);
      const errorMessage = getErrorMessage(err);
      return { success: false, error: errorMessage };
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
    requestReapproval,
    requestReapprovalGoogle,
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
