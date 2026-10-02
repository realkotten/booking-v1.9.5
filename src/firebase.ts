import { initializeApp } from 'firebase/app';
import { DEFAULT_CLIENT_AVATAR } from './data/avatars';
import { 
  getAuth, 
  GoogleAuthProvider, 
  OAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  initializeFirestore,
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  collection,
  onSnapshot
} from 'firebase/firestore';
import type { Appointment } from './types';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID and robust long-polling transport for web/iframe
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  ignoreUndefinedProperties: true
}, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Configure Apple Auth Provider
export const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

// Export Phone Auth helpers
export { RecaptchaVerifier, signInWithPhoneNumber };
export type { ConfirmationResult };

/**
 * Safely clear any existing RecaptchaVerifier instance and DOM contents
 */
export function clearPhoneRecaptcha(containerId = 'phone-recaptcha-container'): void {
  if (typeof window === 'undefined') return;
  try {
    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch (e) {}
      (window as any).recaptchaVerifier = null;
    }
  } catch (e) {
    (window as any).recaptchaVerifier = null;
  }

  // Ensure DOM container is emptied and reset cleanly to avoid "reCAPTCHA has already been rendered"
  try {
    const el = document.getElementById(containerId);
    if (el && el.parentNode) {
      const freshEl = document.createElement('div');
      freshEl.id = containerId;
      freshEl.className = el.className;
      el.parentNode.replaceChild(freshEl, el);
    }
  } catch (e) {}
}

/**
 * Initialize invisible RecaptchaVerifier for Phone Authentication
 */
export function getOrCreatePhoneRecaptcha(containerId = 'phone-recaptcha-container', isInvisible = true): RecaptchaVerifier {
  if (typeof window === 'undefined') return null as any;

  // Clear previous verifier and reset container DOM node
  clearPhoneRecaptcha(containerId);

  let containerEl = document.getElementById(containerId);
  if (!containerEl) {
    containerEl = document.createElement('div');
    containerEl.id = containerId;
    document.body.appendChild(containerEl);
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: isInvisible ? 'invisible' : 'normal',
    callback: () => {
      // reCAPTCHA solved silently
    },
    'expired-callback': () => {
      console.warn('reCAPTCHA expired.');
      clearPhoneRecaptcha(containerId);
    }
  });

  (window as any).recaptchaVerifier = verifier;
  return verifier;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection passively
export async function testConnection() {
  try {
    const testDoc = await getDoc(doc(db, 'test', 'connection'));
    return testDoc.exists();
  } catch (error) {
    // Graceful offline fallback
    return false;
  }
}

// User profile helper to save/sync Firestore profile
export async function syncUserProfile(user: FirebaseUser, extraData?: { phoneNumber?: string; formulaNotes?: string; displayName?: string }) {
  if (!user || !user.uid) return null;
  
  const userRef = doc(db, 'users', user.uid);
  try {
    const existingSnap = await getDoc(userRef);
    const existingData = existingSnap.exists() ? existingSnap.data() : null;

    const profileData = {
      id: user.uid,
      email: user.email || '',
      displayName: extraData?.displayName || user.displayName || existingData?.displayName || '',
      photoURL: user.photoURL || existingData?.photoURL || DEFAULT_CLIENT_AVATAR,
      phoneNumber: extraData?.phoneNumber || existingData?.phoneNumber || user.phoneNumber || '',
      formulaNotes: extraData?.formulaNotes || existingData?.formulaNotes || '',
      role: (['heiskottensbro@gmail.com', 'astrologistkotten@gmail.com', 'speakerkot10@gmail.com'].includes(user.email || '') || existingData?.role === 'admin') ? 'admin' : 'client',
      updatedAt: new Date().toISOString(),
      ...(existingSnap.exists() ? {} : { createdAt: new Date().toISOString() })
    };

    await setDoc(userRef, profileData, { merge: true });
    return profileData;
  } catch (err) {
    console.warn('Could not sync user profile to Firestore (using local fallback):', err);
    return null;
  }
}

/**
 * Sync appointment to Firestore cloud database with complete attribute validation
 */
export async function syncAppointmentToFirestore(appointment: Appointment): Promise<boolean> {
  if (!appointment || !appointment.id) return false;
  const aptRef = doc(db, 'appointments', appointment.id);

  try {
    const payload: Record<string, any> = {
      id: appointment.id,
      customerName: appointment.customerName || 'مشتری گرامی',
      serviceName: appointment.service?.name || (appointment as any).serviceName || 'اصلاح مو و پیرایش',
      status: appointment.status || 'confirmed',
      appointmentNumber: appointment.appointmentNumber || '',
      customerId: appointment.customerId || '',
      customerPhone: appointment.customerPhone || '',
      serviceId: appointment.serviceId || appointment.service?.id || '',
      servicePrice: Number(appointment.servicePrice || appointment.service?.price || 0),
      totalAmount: Number(appointment.totalAmount || 0),
      depositAmount: Number(appointment.depositAmount || 0),
      date: appointment.date || '',
      dayNumber: Number(appointment.dayNumber || 1),
      startTime: appointment.startTime || '',
      endTime: appointment.endTime || '',
      durationMinutes: Number(appointment.durationMinutes || 45),
      barberId: appointment.barberId || '',
      barberName: appointment.barberName || '',
      chairId: appointment.chairId || '',
      chairName: appointment.chairName || '',
      notes: appointment.customerNotes || appointment.stylingNotes || '',
      customerNotes: appointment.customerNotes || '',
      stylingNotes: appointment.stylingNotes || '',
      isQuietSession: Boolean(appointment.isQuietSession),
      isVip: Boolean(appointment.isVip),
      bookingSource: appointment.bookingSource || 'online',
      createdAt: appointment.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Attach userId only if authenticated
    if (auth.currentUser?.uid) {
      payload.userId = auth.currentUser.uid;
    }

    if (appointment.service) {
      payload.service = {
        id: appointment.service.id,
        name: appointment.service.name,
        price: Number(appointment.service.price || 0),
        durationMinutes: Number(appointment.service.durationMinutes || 45),
        description: appointment.service.description || '',
      };
    }

    if (appointment.additionalAccoutrements && appointment.additionalAccoutrements.length > 0) {
      payload.additionalAccoutrements = appointment.additionalAccoutrements;
    }

    if (appointment.beverage) {
      payload.beverage = appointment.beverage;
    }

    await setDoc(aptRef, payload, { merge: true });
    return true;
  } catch (err) {
    console.warn('Could not sync appointment to Firestore:', err);
    return false;
  }
}

/**
 * Real-time cloud subscription to appointments in Firestore
 * Updates across all devices (client phone, barber phone, admin console) instantly
 */
export function subscribeToFirestoreAppointments(
  onUpdate: (appointments: Appointment[]) => void
): () => void {
  try {
    const colRef = collection(db, 'appointments');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const items: Appointment[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.id) {
            items.push(data as Appointment);
          }
        });
        // Sort newest first
        items.sort((a, b) => {
          const timeA = new Date(a.createdAt || 0).getTime();
          const timeB = new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });
        if (items.length > 0) {
          onUpdate(items);
        }
      },
      (error) => {
        console.warn('Firestore appointments onSnapshot notice:', error.message);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Could not subscribe to Firestore appointments:', err);
    return () => {};
  }
}

/**
 * Update appointment status in Firestore
 */
export async function updateAppointmentStatusInFirestore(
  appointmentId: string,
  status: Appointment['status']
): Promise<boolean> {
  if (!appointmentId) return false;
  try {
    const aptRef = doc(db, 'appointments', appointmentId);
    await updateDoc(aptRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.warn('Could not update appointment status in Firestore:', err);
    return false;
  }
}

/**
 * Delete appointment from Firestore
 */
export async function deleteAppointmentFromFirestore(appointmentId: string): Promise<boolean> {
  if (!appointmentId) return false;
  try {
    const aptRef = doc(db, 'appointments', appointmentId);
    await deleteDoc(aptRef);
    return true;
  } catch (err) {
    console.warn('Could not delete appointment from Firestore:', err);
    return false;
  }
}

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  type FirebaseUser
};
