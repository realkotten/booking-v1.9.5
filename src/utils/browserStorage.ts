import { Appointment, ClientProfile } from '../types';
import { DEFAULT_CLIENT_PROFILE } from '../data/seedData';
import { normalizePhoneNumber } from './customerUtils';

export const BROWSER_GUEST_ID_KEY = 'atelier_browser_guest_id_v2';
export const BROWSER_GUEST_PROFILE_KEY = 'atelier_browser_guest_data_v2';
export const LEGACY_CURRENT_CUSTOMER_KEY = 'atelier_current_customer_v1';
export const BROWSER_BOOKING_IDS_KEY = 'atelier_user_booking_ids_v2';

/**
 * Retrieves or initializes a persistent guest device ID for this browser.
 */
export function getOrCreateBrowserGuestId(): string {
  if (typeof window === 'undefined') return 'guest_ssr';
  try {
    let guestId = localStorage.getItem(BROWSER_GUEST_ID_KEY);
    if (!guestId) {
      guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem(BROWSER_GUEST_ID_KEY, guestId);
    }
    return guestId;
  } catch (e) {
    return `guest_${Date.now()}`;
  }
}

/**
 * Loads the browser-stored user / guest profile, creating a default one if none exists.
 * Preserves user-entered name, phone, preferences, formula notes, and avatar.
 */
export function loadStoredBrowserProfile(): ClientProfile {
  const fallbackGuestId = getOrCreateBrowserGuestId();

  if (typeof window === 'undefined') {
    return {
      ...DEFAULT_CLIENT_PROFILE,
      id: fallbackGuestId,
    };
  }

  try {
    // 1. Try modern browser profile key
    const modernSaved = localStorage.getItem(BROWSER_GUEST_PROFILE_KEY);
    if (modernSaved) {
      const parsed = JSON.parse(modernSaved);
      if (parsed && typeof parsed === 'object') {
        return {
          ...DEFAULT_CLIENT_PROFILE,
          ...parsed,
          id: parsed.id || fallbackGuestId,
        };
      }
    }

    // 2. Try legacy storage key
    const legacySaved = localStorage.getItem(LEGACY_CURRENT_CUSTOMER_KEY);
    if (legacySaved) {
      const parsed = JSON.parse(legacySaved);
      if (parsed && typeof parsed === 'object') {
        // Discard old mock names if they were placeholder dummies
        const isDummyPlaceholder =
          parsed.name === 'مهدی صالحی' ||
          parsed.name === 'مشتری رویال' ||
          parsed.phone === '۰۹۱۲۳۴۵۶۷۸۹';

        if (!isDummyPlaceholder && (parsed.name || parsed.phone || parsed.formulaNotes)) {
          const loaded: ClientProfile = {
            ...DEFAULT_CLIENT_PROFILE,
            ...parsed,
            id: parsed.id || fallbackGuestId,
          };
          saveStoredBrowserProfile(loaded);
          return loaded;
        }
      }
    }
  } catch (e) {
    console.warn('Error reading stored profile from browser storage', e);
  }

  // Initial fresh guest profile with persistent ID
  const freshGuest: ClientProfile = {
    ...DEFAULT_CLIENT_PROFILE,
    id: fallbackGuestId,
    roleOrTitle: 'کاربر مهمان (حافظه مرورگر)',
    memberTier: 'مهمان',
  };
  saveStoredBrowserProfile(freshGuest);
  return freshGuest;
}

/**
 * Persists user profile updates into browser storage so non-logged-in users
 * maintain their data, preferences, and semi-logged-in state across visits.
 */
export function saveStoredBrowserProfile(profile: ClientProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BROWSER_GUEST_PROFILE_KEY, JSON.stringify(profile));
    localStorage.setItem(LEGACY_CURRENT_CUSTOMER_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving browser profile to localStorage', e);
  }
}

/**
 * Retrieves the list of appointment IDs booked by this browser.
 */
export function getStoredUserBookingIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BROWSER_BOOKING_IDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((id): id is string => typeof id === 'string' && id.length > 0);
      }
    }
  } catch (e) {
    console.warn('Error reading booking IDs from localStorage', e);
  }
  return [];
}

/**
 * Adds an appointment ID to the browser-stored bookings list so the user
 * can always retrieve their reservations, even without an online account.
 */
export function addStoredUserBookingId(appointmentId: string): void {
  if (typeof window === 'undefined' || !appointmentId) return;
  try {
    const current = getStoredUserBookingIds();
    if (!current.includes(appointmentId)) {
      const updated = [appointmentId, ...current];
      localStorage.setItem(BROWSER_BOOKING_IDS_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.error('Error saving booking ID to localStorage', e);
  }
}

/**
 * Removes an appointment ID from local browser storage (e.g. if cancelled/archived).
 */
export function removeStoredUserBookingId(appointmentId: string): void {
  if (typeof window === 'undefined' || !appointmentId) return;
  try {
    const current = getStoredUserBookingIds();
    const filtered = current.filter((id) => id !== appointmentId);
    localStorage.setItem(BROWSER_BOOKING_IDS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Error removing booking ID from localStorage', e);
  }
}

/**
 * Universal matcher that checks if an appointment belongs to the current browser user / logged in client.
 * Prioritizes:
 * 1. Explicitly recorded local browser booking IDs (100% accurate for anything booked on this browser)
 * 2. Exact customer ID match (for both logged-in UIDs and persistent browser guest IDs)
 * 3. Normalized phone match (if both appointment and profile provide a phone)
 * 4. Exact trimmed customer name match (if name is provided and not generic placeholder)
 */
export function isAppointmentForUser(
  apt: Appointment,
  currentCustomer: ClientProfile | null,
  localBookingIds?: string[]
): boolean {
  if (!apt) return false;

  // 1. Browser booking IDs match (Highest reliability for local and guest users)
  const bookingIds = localBookingIds || getStoredUserBookingIds();
  if (apt.id && bookingIds.includes(apt.id)) {
    return true;
  }
  if (apt.appointmentNumber && bookingIds.includes(apt.appointmentNumber)) {
    return true;
  }

  if (!currentCustomer) return false;

  // 2. Exact Customer ID match
  if (
    apt.customerId &&
    currentCustomer.id &&
    apt.customerId === currentCustomer.id &&
    apt.customerId !== 'guest' &&
    apt.customerId !== 'client-user'
  ) {
    return true;
  }

  // 3. Normalized Phone match
  const aptPhone = normalizePhoneNumber(apt.customerPhone || '');
  const custPhone = normalizePhoneNumber(currentCustomer.phone || '');
  if (aptPhone && custPhone && aptPhone.length >= 7 && custPhone.length >= 7) {
    if (aptPhone === custPhone || aptPhone.endsWith(custPhone) || custPhone.endsWith(aptPhone)) {
      return true;
    }
  }

  // 4. Customer Name match (if distinctive, not empty or generic)
  const aptName = apt.customerName ? apt.customerName.trim().toLowerCase() : '';
  const custName = currentCustomer.name ? currentCustomer.name.trim().toLowerCase() : '';
  if (
    aptName &&
    custName &&
    custName.length >= 2 &&
    aptName === custName &&
    custName !== 'مشتری' &&
    custName !== 'مشتری گرامی' &&
    custName !== 'کاربر مهمان'
  ) {
    return true;
  }

  return false;
}
