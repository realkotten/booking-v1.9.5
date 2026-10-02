import { ClientProfile, Appointment } from '../types';

/**
 * Normalizes a phone number for consistent search and duplication checking.
 * Strips all spaces, dashes, parentheses, plus signs, and converts Persian/Arabic digits.
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

  let normalized = phone;
  for (let i = 0; i < 10; i++) {
    normalized = normalized.replace(new RegExp(persianDigits[i], 'g'), i.toString());
    normalized = normalized.replace(new RegExp(arabicDigits[i], 'g'), i.toString());
  }
  return normalized.replace(/\D/g, '');
}

/**
 * Validates that a user enters a complete full name (sequence of strings + space + sequence of strings).
 * Rejects single-word names (e.g. only "علی" or "John") and requires at least two words with >= 2 characters each.
 */
export function validateFullName(name: string): { isValid: boolean; error?: string } {
  if (!name || !name.trim()) {
    return {
      isValid: false,
      error: 'لطفاً نام و نام‌خانوادگی خود را وارد کنید.',
    };
  }

  const trimmed = name.trim();
  // Split by any standard whitespace
  const parts = trimmed.split(/\s+/).filter(Boolean);

  if (parts.length < 2) {
    return {
      isValid: false,
      error: 'لطفاً نام و نام‌خانوادگی کامل را وارد کنید (شامل نام و نام خانوادگی با فاصله بین آن‌ها).',
    };
  }

  const hasInvalidPartLength = parts.some((p) => p.replace(/[\u200C\u200B]/g, '').length < 2);
  if (hasInvalidPartLength) {
    return {
      isValid: false,
      error: 'هر بخش از نام و نام‌خانوادگی باید حداقل دارای ۲ حرف باشد.',
    };
  }

  return { isValid: true };
}

/**
 * Retrieves all appointments belonging to a customer from current and past collections.
 * Deduplicates by appointment ID and sorts newest first.
 */
export function getCustomerAppointments(
  customerId: string,
  appointments: Appointment[],
  pastAppointments: Appointment[] = []
): Appointment[] {
  const combined = [...appointments, ...pastAppointments];
  const matching = combined.filter(
    (a) => a.customerId === customerId && a.customerId !== 'studio-internal'
  );

  // Deduplicate by ID
  const uniqueMap = new Map<string, Appointment>();
  matching.forEach((apt) => {
    if (!uniqueMap.has(apt.id)) {
      uniqueMap.set(apt.id, apt);
    }
  });

  const uniqueList = Array.from(uniqueMap.values());

  // Sort newest first: Day number descending, then start time descending
  return uniqueList.sort((a, b) => {
    const dayA = a.dayNumber || 0;
    const dayB = b.dayNumber || 0;
    if (dayA !== dayB) return dayB - dayA;
    return (b.startTime || '').localeCompare(a.startTime || '');
  });
}

export interface CustomerDerivedStats {
  totalVisits: number;
  completedVisitsCount: number;
  cancelledVisitsCount: number;
  lastVisit: Appointment | null;
  nextAppointment: Appointment | null;
  totalSpending: number;
}

/**
 * Calculates dynamic statistics for a customer directly from shared data models.
 */
export function getCustomerStats(
  customer: ClientProfile,
  appointments: Appointment[],
  pastAppointments: Appointment[] = []
): CustomerDerivedStats {
  const customerApts = getCustomerAppointments(customer.id, appointments, pastAppointments);

  const completedApts = customerApts.filter((a) => a.status === 'completed');
  const cancelledApts = customerApts.filter((a) => a.status === 'cancelled');

  // Find next appointment (upcoming/confirmed/in_progress on or after today)
  const upcomingApts = customerApts.filter(
    (a) =>
      a.status === 'confirmed' ||
      a.status === 'reserved' ||
      a.status === 'in_progress'
  );

  // Next appointment is the earliest upcoming appointment
  const nextAppointment =
    upcomingApts.length > 0
      ? [...upcomingApts].sort((a, b) => {
          const dayA = a.dayNumber || 0;
          const dayB = b.dayNumber || 0;
          if (dayA !== dayB) return dayA - dayB;
          return (a.startTime || '').localeCompare(b.startTime || '');
        })[0]
      : null;

  // Last completed visit
  const lastVisit = completedApts.length > 0 ? completedApts[0] : null;

  // Total spending from completed appointments
  const appointmentSpending = completedApts.reduce(
    (sum, a) => sum + (a.totalAmount || a.servicePrice || 0),
    0
  );

  const totalSpending = appointmentSpending;

  return {
    totalVisits: completedApts.length > 0 ? completedApts.length : customer.totalVisits || 0,
    completedVisitsCount: completedApts.length,
    cancelledVisitsCount: cancelledApts.length,
    lastVisit,
    nextAppointment,
    totalSpending,
  };
}

/**
 * Filters customers by text query (name or phone) and membership filter.
 */
export function filterCustomers(
  customers: ClientProfile[],
  searchQuery: string,
  filterType: 'all' = 'all'
): ClientProfile[] {
  const query = searchQuery.trim().toLowerCase();
  const normalizedQuery = normalizePhoneNumber(searchQuery);

  return customers.filter((customer) => {
    if (customer.isArchived) return false;

    // Search query
    if (!query) return true;

    const nameMatch = customer.name.toLowerCase().includes(query);
    const memberIdMatch = (customer.memberId || '').toLowerCase().includes(query);
    const phoneNormalized = normalizePhoneNumber(customer.phone);
    const phoneMatch =
      customer.phone.includes(query) ||
      (normalizedQuery.length > 0 && phoneNormalized.includes(normalizedQuery));

    return nameMatch || memberIdMatch || phoneMatch;
  });
}

// ─── Domain Constants & Options ────────────────────────────────────

export const HAIR_TYPES = [
  { value: 'Straight', label: 'صاف (Straight)' },
  { value: 'Wavy', label: 'موج‌دار (Wavy)' },
  { value: 'Curly', label: 'فر (Curly)' },
  { value: 'Coily', label: 'مجعد / فنری (Coily)' },
];

export const HAIR_DENSITIES = [
  { value: 'Low', label: 'کم‌پشت / ظریف (Low)' },
  { value: 'Medium', label: 'متوسط و نرمال (Medium)' },
  { value: 'High', label: 'پرپشت و متراکم (High)' },
];

export const FACE_SHAPES = [
  { value: 'Oval', label: 'بیضی (Oval)' },
  { value: 'Round', label: 'گرد (Round)' },
  { value: 'Square', label: 'مربعی (Square)' },
  { value: 'Oblong', label: 'مستطیلی / کشیده (Oblong)' },
  { value: 'Heart', label: 'قلبی (Heart)' },
  { value: 'Diamond', label: 'لوزی (Diamond)' },
];

export const FAVORITE_FADES = [
  { value: 'Low Fade', label: 'لو فید (Low Fade)' },
  { value: 'Mid Fade', label: 'مید فید (Mid Fade)' },
  { value: 'High Fade', label: 'های فید (High Fade)' },
  { value: 'Skin Fade', label: 'اسکین فید (Skin Fade)' },
  { value: 'Taper', label: 'تیپر کلاسیک (Taper)' },
];

export const BEVERAGE_PREFERENCES = [
  { value: 'Double Espresso', label: 'اسپرسوی دوبل تک‌خاستگاه' },
  { value: 'Masala Tea', label: 'چای ماسالای سلطنتی' },
  { value: 'Sparkling Water', label: 'آب گازدار پریمیر همراه با لیمو' },
  { value: 'Fresh Juice', label: 'آب‌میوه ارگانیک روز' },
  { value: 'Earl Grey Tea', label: 'چای ارل گری با عطر ترنج' },
  { value: 'Water Still', label: 'آب معدنی چشمه آلپ خنک' },
];

export const AUDIO_PREFERENCES = [
  { value: 'Jazz', label: 'موسیقی جاز کلاسیک (Jazz)' },
  { value: 'Instrumental', label: 'موسیقی بی‌کلام آرامش‌بخش (Instrumental)' },
  { value: 'Silence', label: 'سکوت کامل و تمرکز (Silence)' },
  { value: 'Ambient', label: 'امبینت صوتی سوئیت (Ambient)' },
];
