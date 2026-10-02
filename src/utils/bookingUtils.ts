import { Accoutrement, Service, Appointment } from '../types';
import { getDiscountInfo } from './pricingUtils';

export const uid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// ── Price & Duration Math ─────────────────────────────────────────
export interface BookingTotals {
  servicePrice: number;
  serviceRealPrice: number;
  discountAmount: number;
  discountPercent: number;
  hasDiscount: boolean;
  extrasPrice: number;
  total: number;
  originalTotal: number;
  totalDuration: number;
  selectedExtras: Accoutrement[];
}

export const calculateBookingTotals = (
  service: Service | null,
  accoutrements: Accoutrement[]
): BookingTotals => {
  const selectedExtras = accoutrements.filter((a) => a.selected);
  const discountInfo = getDiscountInfo(service);
  const servicePrice = discountInfo.discountedPrice;
  const serviceRealPrice = discountInfo.realPrice;
  const hasDiscount = discountInfo.hasDiscount;
  const discountAmount = discountInfo.discountAmount;
  const discountPercent = discountInfo.discountPercent;

  const extrasPrice = selectedExtras.reduce(
    (sum, a) => sum + (Number.isFinite(a.price) ? a.price : 0),
    0
  );
  const totalDuration =
    (service?.durationMinutes ?? 0) +
    selectedExtras.reduce((sum, a) => sum + (a.durationMinutes ?? 0), 0);
  return {
    servicePrice,
    serviceRealPrice,
    discountAmount,
    discountPercent,
    hasDiscount,
    extrasPrice,
    total: servicePrice + extrasPrice,
    originalTotal: serviceRealPrice + extrasPrice,
    totalDuration: totalDuration > 0 ? totalDuration : 40,
    selectedExtras,
  };
};

// ── Time Helpers ──────────────────────────────────────────────────
export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const minutesToTime = (minutes: number): string => {
  const normalized = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export const addMinutes = (time: string, minutes: number): string => {
  return minutesToTime(timeToMinutes(time) + minutes);
};

// ── Day Options (Persian Solar) ──────────────────────────────────
export interface DayOption {
  dayNumber: number;   // Persian-calendar day of month
  label: string;       // «۴ آبان»
  weekday: string;     // «چهارشنبه»
  badge: string;       // «امروز» / «فردا» / ''
  fullDateStr: string; // ISO / Persian readable
  isToday: boolean;
  isPast: boolean;
  dateKey: string;
}

export const generateUpcomingDays = (count = 14, referenceDate: Date = new Date()): DayOption[] => {
  const dayFmt = new Intl.DateTimeFormat('en-u-ca-persian-nu-latn', { day: 'numeric' });
  const partsFmt = new Intl.DateTimeFormat('fa-IR', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  });

  return Array.from({ length: count }, (_, i) => {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() + i);
    const parts = partsFmt.formatToParts(d);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
    const dayNum = Number(dayFmt.format(d));
    const label = `${get('day')} ${get('month')}`;
    const weekday = get('weekday');
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateKey = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    return {
      dayNumber: dayNum,
      label,
      weekday,
      badge: i === 0 ? 'امروز' : i === 1 ? 'فردا' : '',
      fullDateStr: `${weekday} ${label}`,
      isToday: i === 0,
      isPast: false,
      dateKey,
    };
  });
};

/**
 * Checks whether a given Persian dayNumber is today.
 */
export const isTodayDayNumber = (dayNumber: number, referenceDate: Date = new Date()): boolean => {
  const days = generateUpcomingDays(14, referenceDate);
  return days.length > 0 && days[0].dayNumber === dayNumber;
};

/**
 * Checks whether a given Persian dayNumber is tomorrow.
 */
export const isTomorrowDayNumber = (dayNumber: number, referenceDate: Date = new Date()): boolean => {
  const days = generateUpcomingDays(14, referenceDate);
  return days.length > 1 && days[1].dayNumber === dayNumber;
};

/**
 * Checks whether a given Persian dayNumber has already expired (is in the past).
 */
export const isDateExpired = (dayNumber: number, referenceDate: Date = new Date()): boolean => {
  const days = generateUpcomingDays(14, referenceDate);
  return !days.some((d) => d.dayNumber === dayNumber);
};

/**
 * Checks whether a given time slot on a specific day is in the past (expired hour or expired date).
 */
export const isSlotExpired = (
  dayNumber: number,
  timeStr: string,
  bufferMinutes = 0,
  referenceDate: Date = new Date()
): boolean => {
  if (!timeStr || !timeStr.includes(':')) return true;
  const days = generateUpcomingDays(14, referenceDate);
  const dayIdx = days.findIndex((d) => d.dayNumber === dayNumber);

  // If not found in the upcoming 14 days, the date has expired or is invalid
  if (dayIdx === -1) {
    return true;
  }

  // Future date (tomorrow or later): hours are not expired
  if (dayIdx > 0) {
    return false;
  }

  // Today (dayIdx === 0): compare against current local time
  const now = referenceDate;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const slotMinutes = timeToMinutes(timeStr);

  return slotMinutes <= currentMinutes + bufferMinutes;
};

/**
 * Checks whether all operating slots for a given day have expired.
 */
export const areAllSlotsExpiredForDay = (
  dayNumber: number,
  allSlots: string[] = MASTER_TIME_SLOTS,
  referenceDate: Date = new Date()
): boolean => {
  return allSlots.every((s) => isSlotExpired(dayNumber, s, 0, referenceDate));
};

/**
 * Computes the safest initial non-expired booking day and time.
 * If today still has open future slots, returns today and the next available slot.
 * If all slots today have expired (e.g. night time), returns tomorrow and '10:00'.
 */
export const getInitialBookingSlot = (
  existingAppointments: Appointment[] = [],
  referenceDate: Date = new Date()
): { dayNumber: number; time: string; isToday: boolean } => {
  const upcoming = generateUpcomingDays(14, referenceDate);
  if (upcoming.length === 0) {
    return { dayNumber: 1, time: '10:00', isToday: false };
  }

  const today = upcoming[0];
  const tomorrow = upcoming[1] || today;

  // Check today's slots that are NOT expired
  const validTodaySlots = MASTER_TIME_SLOTS.filter(
    (s) => !isSlotExpired(today.dayNumber, s, 10, referenceDate)
  );

  // Find first available non-expired slot today
  for (const slot of validTodaySlots) {
    const status = checkSlotAvailability(today.dayNumber, slot, 40, existingAppointments);
    if (status.isAvailable) {
      return { dayNumber: today.dayNumber, time: slot, isToday: true };
    }
  }

  // If all slots today have expired or are booked, default to tomorrow at 10:00 AM
  return { dayNumber: tomorrow.dayNumber, time: '10:00', isToday: false };
};

// ── Master Salon Schedule Slots (15-minute intervals from 10:00 to 22:00) ───────
export const MASTER_TIME_SLOTS: string[] = [
  '10:00', '10:15', '10:30', '10:45',
  '11:00', '11:15', '11:30', '11:45',
  '12:00', '12:15', '12:30', '12:45',
  '13:00', '13:15', '13:30', '13:45',
  '14:00', '14:15', '14:30', '14:45',
  '15:00', '15:15', '15:30', '15:45',
  '16:00', '16:15', '16:30', '16:45',
  '17:00', '17:15', '17:30', '17:45',
  '18:00', '18:15', '18:30', '18:45',
  '19:00', '19:15', '19:30', '19:45',
  '20:00', '20:15', '20:30', '20:45',
  '21:00', '21:15', '21:30', '21:45',
  '22:00',
];

export const TIME_SLOTS = MASTER_TIME_SLOTS;

/**
 * Generates day time slots in 15-minute increments up to closeTime inclusive.
 */
export const generateDayTimeSlots = (
  openTime = '10:00',
  closeTime = '20:30',
  breakStart?: string,
  breakEnd?: string,
  stepMinutes = 15
): string[] => {
  const openM = timeToMinutes(openTime || '10:00');
  const closeM = timeToMinutes(closeTime || '20:30');
  const bStartM = breakStart ? timeToMinutes(breakStart) : null;
  const bEndM = breakEnd ? timeToMinutes(breakEnd) : null;

  const hasBreak =
    bStartM !== null &&
    bEndM !== null &&
    bStartM < bEndM &&
    bStartM > openM &&
    bEndM < closeM;

  const slots: string[] = [];
  for (let m = openM; m <= closeM; m += stepMinutes) {
    if (hasBreak && bStartM !== null && bEndM !== null && m >= bStartM && m < bEndM) {
      continue;
    }
    slots.push(minutesToTime(m));
  }
  return slots;
};

// ── Demand Analytics & Internal Database Tracking ─────────────────
const DEMAND_STORAGE_KEY = 'royal:internal_demand_analytics:v2';
const CONSTRAINTS_STORAGE_KEY = 'royal:customer_availability_constraints:v2';

export interface DemandRecord {
  id: string;
  dayNumber: number;
  weekday?: string;
  dateLabel?: string;
  requestedTime: string;
  serviceId?: string;
  serviceName?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  wasReserved?: boolean;
  timestamp: string;
  source: string;
}

export interface CustomerConstraintRecord {
  id: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  unavailableDays: string[]; // e.g. ['دوشنبه', 'پنج‌شنبه']
  unavailableTimeWindow: string; // e.g. 'ساعات اداری ۸ الی ۱۷'
  workPatternType: 'fixed_office' | 'shift_rotational' | 'university' | 'night_shift' | 'weekend_only' | 'custom';
  patternNote: string; // Short client note e.g. "شیفت‌های متغیر بیمارستان ۲۴-۴۸"
  updatedAt: string;
}

// Seed demo data for rich initial management analytics
const SEED_DEMAND_RECORDS: DemandRecord[] = [
  { id: 'd-1', dayNumber: 22, weekday: 'سه‌شنبه', dateLabel: '۲۲ آبان', requestedTime: '18:00', serviceName: 'پیرایش رویال کلاسیک', customerName: 'سهراب بختیاری', customerPhone: '۰۹۱۲۱۱۱۴۴۵۵', wasReserved: true, timestamp: '2026-09-20T10:15:00Z', source: 'customer_preference_inquiry' },
  { id: 'd-2', dayNumber: 22, weekday: 'سه‌شنبه', dateLabel: '۲۲ آبان', requestedTime: '18:00', serviceName: 'پیرایش و طراحی ریش', customerName: 'کیوان دادگر', customerPhone: '۰۹۱۲۵۵۵۷۷۸۸', wasReserved: false, timestamp: '2026-09-20T11:40:00Z', source: 'customer_preference_inquiry' },
  { id: 'd-3', dayNumber: 22, weekday: 'سه‌شنبه', dateLabel: '۲۲ آبان', requestedTime: '18:00', serviceName: 'پکیج پیرایش VIP', customerName: 'آرشام شایان', customerPhone: '۰۹۱۹۳۳۳۲۲۱۱', wasReserved: false, timestamp: '2026-09-20T14:20:00Z', source: 'customer_preference_inquiry' },
  { id: 'd-4', dayNumber: 23, weekday: 'چهارشنبه', dateLabel: '۲۳ آبان', requestedTime: '19:30', serviceName: 'اصلاح کلاسیک و سشوار', customerName: 'سهراب بختیاری', customerPhone: '۰۹۱۲۱۱۱۴۴۵۵', wasReserved: true, timestamp: '2026-09-21T09:10:00Z', source: 'customer_preference_inquiry' },
  { id: 'd-5', dayNumber: 23, weekday: 'چهارشنبه', dateLabel: '۲۳ آبان', requestedTime: '19:30', serviceName: 'پاکسازی و پیرایش پوست', customerName: 'امیرعلی صبوری', customerPhone: '۰۹۳۵۴۴۴۹۹۰۰', wasReserved: false, timestamp: '2026-09-21T12:05:00Z', source: 'customer_preference_inquiry' },
  { id: 'd-6', dayNumber: 24, weekday: 'پنج‌شنبه', dateLabel: '۲۴ آبان', requestedTime: '17:00', serviceName: 'پکیج داماد و مراقبت ویژه', customerName: 'پوریا انصاری', customerPhone: '۰۹۱۲۸۸۸۶۶۳۳', wasReserved: true, timestamp: '2026-09-21T16:30:00Z', source: 'customer_preference_inquiry' },
  { id: 'd-7', dayNumber: 24, weekday: 'پنج‌شنبه', dateLabel: '۲۴ آبان', requestedTime: '18:00', serviceName: 'پیرایش کلاسیک', customerName: 'مهرشاد کاوه', customerPhone: '۰۹۱۲۷۷۷۱۱۲۲', wasReserved: true, timestamp: '2026-09-22T08:30:00Z', source: 'customer_preference_inquiry' },
  { id: 'd-8', dayNumber: 24, weekday: 'پنج‌شنبه', dateLabel: '۲۴ آبان', requestedTime: '18:00', serviceName: 'طراحی خط و پیرایش ریش', customerName: 'بردیا فیاض', customerPhone: '۰۹۱۸۴۴۴۲۲۱۱', wasReserved: false, timestamp: '2026-09-22T09:45:00Z', source: 'customer_preference_inquiry' },
  { id: 'd-9', dayNumber: 25, weekday: 'جمعه', dateLabel: '۲۵ آبان', requestedTime: '11:30', serviceName: 'پکیج پیرایش آخر هفته', customerName: 'داریوش فرهمند', customerPhone: '۰۹۱۲۹۹۹۳۳۴۴', wasReserved: true, timestamp: '2026-09-22T11:00:00Z', source: 'customer_preference_inquiry' },
  { id: 'd-10', dayNumber: 25, weekday: 'جمعه', dateLabel: '۲۵ آبان', requestedTime: '11:30', serviceName: 'پیرایش مو و استایلینگ', customerName: 'آرمین نیکو', customerPhone: '۰۹۳۶۵۵۵۱۱۴۴', wasReserved: false, timestamp: '2026-09-22T13:20:00Z', source: 'customer_preference_inquiry' },
  { id: 'd-11', dayNumber: 22, weekday: 'سه‌شنبه', dateLabel: '۲۲ آبان', requestedTime: '09:30', serviceName: 'پیرایش صبحگاهی بیزنس', customerName: 'دکتر هومن ارجمند', customerPhone: '۰۹۱۲۲۲۲۳۳۴۴', wasReserved: true, timestamp: '2026-09-22T14:10:00Z', source: 'customer_preference_inquiry' },
  { id: 'd-12', dayNumber: 23, weekday: 'چهارشنبه', dateLabel: '۲۳ آبان', requestedTime: '20:30', serviceName: 'پیرایش رویال کلاسیک', customerName: 'کیوان دادگر', customerPhone: '۰۹۱۲۵۵۵۷۷۸۸', wasReserved: true, timestamp: '2026-09-22T15:00:00Z', source: 'customer_preference_inquiry' },
];

const SEED_CUSTOMER_CONSTRAINTS: CustomerConstraintRecord[] = [
  {
    id: 'c-1',
    customerName: 'سهراب بختیاری',
    customerPhone: '۰۹۱۲۱۱۱۴۴۵۵',
    unavailableDays: ['شنبه', 'دوشنبه', 'چهارشنبه'],
    unavailableTimeWindow: 'ساعات اداری ۸:۰۰ تا ۱۷:۰۰',
    workPatternType: 'fixed_office',
    patternNote: 'کارمند شرکت نفت، شنبه تا چهارشنبه تا ساعت ۱۷ درگیر جلسات کاری',
    updatedAt: '2026-09-21T14:00:00Z',
  },
  {
    id: 'c-2',
    customerName: 'کیوان دادگر',
    customerPhone: '۰۹۱۲۵۵۵۷۷۸۸',
    unavailableDays: ['یکشنبه', 'سه‌شنبه'],
    unavailableTimeWindow: 'صبح و ظهر (۸:۰۰ تا ۱۵:۰۰)',
    workPatternType: 'university',
    patternNote: 'دانشجوی مقطع ارشد معماری، روزهای فرد تا ظهر کلاس‌های کارگاهی',
    updatedAt: '2026-09-22T10:30:00Z',
  },
  {
    id: 'c-3',
    customerName: 'دکتر هومن ارجمند',
    customerPhone: '۰۹۱۲۲۲۲۳۳۴۴',
    unavailableDays: ['پنج‌شنبه'],
    unavailableTimeWindow: 'شیفت چرخشی بیمارستان',
    workPatternType: 'shift_rotational',
    patternNote: 'پزشک جراح، کشیک‌های چرخشی ۲۴ ساعته (بهترین زمان: صبح‌های اول وقت ۹:۰۰)',
    updatedAt: '2026-09-22T12:00:00Z',
  },
];

export const recordTimeDemand = (
  dayNumber: number,
  requestedTime: string,
  serviceId?: string,
  extraMeta?: {
    weekday?: string;
    dateLabel?: string;
    serviceName?: string;
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    wasReserved?: boolean;
  }
) => {
  try {
    const raw = localStorage.getItem(DEMAND_STORAGE_KEY);
    const list: DemandRecord[] = raw ? JSON.parse(raw) : [...SEED_DEMAND_RECORDS];
    list.push({
      id: uid(),
      dayNumber,
      requestedTime,
      serviceId,
      weekday: extraMeta?.weekday,
      dateLabel: extraMeta?.dateLabel,
      serviceName: extraMeta?.serviceName,
      customerId: extraMeta?.customerId,
      customerName: extraMeta?.customerName || 'مشتری محترم',
      customerPhone: extraMeta?.customerPhone || '',
      wasReserved: extraMeta?.wasReserved ?? false,
      timestamp: new Date().toISOString(),
      source: 'customer_preference_inquiry',
    });
    if (list.length > 500) list.shift();
    localStorage.setItem(DEMAND_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Fail-safe
  }
};

export const recordCustomerAvailabilityConstraint = (
  record: Omit<CustomerConstraintRecord, 'id' | 'updatedAt'>
) => {
  try {
    const raw = localStorage.getItem(CONSTRAINTS_STORAGE_KEY);
    const list: CustomerConstraintRecord[] = raw ? JSON.parse(raw) : [...SEED_CUSTOMER_CONSTRAINTS];
    const existingIdx = list.findIndex(
      (c) =>
        (record.customerPhone && c.customerPhone === record.customerPhone) ||
        (record.customerName && c.customerName === record.customerName)
    );

    const fullRecord: CustomerConstraintRecord = {
      ...record,
      id: existingIdx >= 0 ? list[existingIdx].id : uid(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      list[existingIdx] = fullRecord;
    } else {
      list.unshift(fullRecord);
    }

    localStorage.setItem(CONSTRAINTS_STORAGE_KEY, JSON.stringify(list));
    return fullRecord;
  } catch {
    return null;
  }
};

export const getCustomerAvailabilityConstraints = (): CustomerConstraintRecord[] => {
  try {
    const raw = localStorage.getItem(CONSTRAINTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : SEED_CUSTOMER_CONSTRAINTS;
  } catch {
    return SEED_CUSTOMER_CONSTRAINTS;
  }
};

export interface HourlyDemandDetail {
  hour: string;
  totalDemand: number;
  reservedCount: number;
  missedDemandCount: number; // Requested but was occupied / reserved by another client
  demandingUsers: {
    name: string;
    phone: string;
    count: number;
    lastRequested: string;
  }[];
}

export interface DayOfWeekDemandDetail {
  weekday: string;
  count: number;
  percentage: number;
}

export interface DateDemandDetail {
  dayNumber: number;
  dateLabel: string;
  count: number;
}

export interface TopDemandingUser {
  name: string;
  phone: string;
  preferredHours: string[];
  totalQueries: number;
}

export interface DetailedDemandAnalytics {
  totalDemandQueries: number;
  mostDemandedHours: HourlyDemandDetail[];
  mostDemandedDates: DateDemandDetail[];
  mostDemandedWeekdays: DayOfWeekDemandDetail[];
  topDemandingUsers: TopDemandingUser[];
  customerConstraints: CustomerConstraintRecord[];
}

export const getDetailedDemandAnalytics = (): DetailedDemandAnalytics => {
  try {
    const raw = localStorage.getItem(DEMAND_STORAGE_KEY);
    const list: DemandRecord[] = raw ? JSON.parse(raw) : SEED_DEMAND_RECORDS;
    const constraints = getCustomerAvailabilityConstraints();

    // 1. Group by Hour
    const hourMap: Record<
      string,
      {
        totalDemand: number;
        reservedCount: number;
        userMap: Record<string, { name: string; phone: string; count: number; lastRequested: string }>;
      }
    > = {};

    list.forEach((item) => {
      const h = item.requestedTime;
      if (!hourMap[h]) {
        hourMap[h] = { totalDemand: 0, reservedCount: 0, userMap: {} };
      }
      hourMap[h].totalDemand += 1;
      if (item.wasReserved) {
        hourMap[h].reservedCount += 1;
      }
      const uKey = item.customerPhone || item.customerName || 'ناشناس';
      if (!hourMap[h].userMap[uKey]) {
        hourMap[h].userMap[uKey] = {
          name: item.customerName || 'مشتری محترم',
          phone: item.customerPhone || '',
          count: 0,
          lastRequested: item.timestamp,
        };
      }
      hourMap[h].userMap[uKey].count += 1;
      hourMap[h].userMap[uKey].lastRequested = item.timestamp;
    });

    const mostDemandedHours: HourlyDemandDetail[] = Object.entries(hourMap)
      .map(([hour, data]) => {
        const users = Object.values(data.userMap).sort((a, b) => b.count - a.count);
        return {
          hour,
          totalDemand: data.totalDemand,
          reservedCount: data.reservedCount,
          missedDemandCount: Math.max(0, data.totalDemand - data.reservedCount),
          demandingUsers: users,
        };
      })
      .sort((a, b) => b.totalDemand - a.totalDemand);

    // 2. Group by Date
    const dateMap: Record<number, { count: number; dateLabel: string }> = {};
    list.forEach((item) => {
      if (!dateMap[item.dayNumber]) {
        dateMap[item.dayNumber] = {
          count: 0,
          dateLabel: item.dateLabel || `${item.dayNumber} آبان`,
        };
      }
      dateMap[item.dayNumber].count += 1;
    });

    const mostDemandedDates: DateDemandDetail[] = Object.entries(dateMap)
      .map(([dayNumber, data]) => ({
        dayNumber: Number(dayNumber),
        dateLabel: data.dateLabel,
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count);

    // 3. Group by Weekday
    const ALL_WEEKDAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
    const weekdayMap: Record<string, number> = {};
    ALL_WEEKDAYS.forEach((w) => (weekdayMap[w] = 0));

    list.forEach((item) => {
      const w = item.weekday || 'پنج‌شنبه';
      weekdayMap[w] = (weekdayMap[w] || 0) + 1;
    });

    const totalCount = list.length || 1;
    const mostDemandedWeekdays: DayOfWeekDemandDetail[] = ALL_WEEKDAYS.map((weekday) => ({
      weekday,
      count: weekdayMap[weekday] || 0,
      percentage: Math.round(((weekdayMap[weekday] || 0) / totalCount) * 100),
    })).sort((a, b) => b.count - a.count);

    // 4. Top Demanding Users
    const userAgg: Record<
      string,
      { name: string; phone: string; preferredHours: Set<string>; totalQueries: number }
    > = {};

    list.forEach((item) => {
      const uKey = item.customerPhone || item.customerName || 'کاربر';
      if (!userAgg[uKey]) {
        userAgg[uKey] = {
          name: item.customerName || 'کاربر سالن',
          phone: item.customerPhone || '',
          preferredHours: new Set(),
          totalQueries: 0,
        };
      }
      userAgg[uKey].totalQueries += 1;
      userAgg[uKey].preferredHours.add(item.requestedTime);
    });

    const topDemandingUsers: TopDemandingUser[] = Object.values(userAgg)
      .map((u) => ({
        name: u.name,
        phone: u.phone,
        preferredHours: Array.from(u.preferredHours),
        totalQueries: u.totalQueries,
      }))
      .sort((a, b) => b.totalQueries - a.totalQueries);

    return {
      totalDemandQueries: list.length,
      mostDemandedHours,
      mostDemandedDates,
      mostDemandedWeekdays,
      topDemandingUsers,
      customerConstraints: constraints,
    };
  } catch {
    return {
      totalDemandQueries: 0,
      mostDemandedHours: [],
      mostDemandedDates: [],
      mostDemandedWeekdays: [],
      topDemandingUsers: [],
      customerConstraints: [],
    };
  }
};

export const getInternalDemandStats = getDetailedDemandAnalytics;

// ── Schedule Gaps & Availability Calculation ──────────────────────
export interface TimeRange {
  start: number;
  end: number;
}

export interface ScheduleGap {
  start: number;
  end: number;
  durationMinutes: number;
  startFormatted: string;
  endFormatted: string;
}

export interface SlotAvailability {
  time: string;
  isAvailable: boolean;
  isExpired?: boolean;
  conflictReason?: string;
  activeAppointmentsCount: number;
  availableGap?: ScheduleGap;
}

/**
 * Calculates occupied time intervals on a given day.
 * Combines active appointments with realistic chair occupancy.
 */
export const getDayOccupiedRanges = (
  dayNumber: number,
  existingAppointments: Appointment[] = []
): TimeRange[] => {
  const ranges: TimeRange[] = [];

  // Active confirmed appointments from database/store
  const dayAppointments = existingAppointments.filter(
    (apt) =>
      apt.dayNumber === dayNumber &&
      apt.status !== 'cancelled' &&
      apt.status !== 'completed'
  );

  for (const apt of dayAppointments) {
    const start = timeToMinutes(apt.startTime);
    const duration = apt.durationMinutes || 40;
    ranges.push({ start, end: start + duration });
  }

  return ranges;
};

/**
 * Calculates open gaps between existing bookings during salon operating hours (openTime to closeTime).
 * Allows reservations starting up to closeTime, completing when finished.
 */
export const calculateScheduleGaps = (
  dayNumber: number,
  minRequiredDuration: number,
  existingAppointments: Appointment[] = [],
  totalChairsCapacity = 1,
  openTime = '10:00',
  closeTime = '21:00'
): ScheduleGap[] => {
  const salonOpen = timeToMinutes(openTime || '10:00');
  const salonClose = timeToMinutes(closeTime || '21:00');
  // Since the barber closes after the last reservation is finished, virtual schedule window extends past closeTime
  const scheduleHorizon = salonClose + Math.max(180, minRequiredDuration + 60);

  // Point-by-point occupancy across operating minutes in 5-minute granularity
  const step = 5;
  const isMinuteAvailable: boolean[] = [];

  const occupiedRanges = getDayOccupiedRanges(dayNumber, existingAppointments);

  for (let m = salonOpen; m < scheduleHorizon; m += step) {
    let activeBookings = 0;
    for (const r of occupiedRanges) {
      if (m >= r.start && m < r.end) {
        activeBookings++;
      }
    }
    isMinuteAvailable.push(activeBookings < totalChairsCapacity);
  }

  const gaps: ScheduleGap[] = [];
  let currentGapStart: number | null = null;

  for (let i = 0; i < isMinuteAvailable.length; i++) {
    const m = salonOpen + i * step;
    if (isMinuteAvailable[i]) {
      if (currentGapStart === null) {
        currentGapStart = m;
      }
    } else {
      if (currentGapStart !== null) {
        const gapEnd = m;
        const dur = gapEnd - currentGapStart;
        if (dur >= minRequiredDuration) {
          gaps.push({
            start: currentGapStart,
            end: gapEnd,
            durationMinutes: dur,
            startFormatted: minutesToTime(currentGapStart),
            endFormatted: minutesToTime(gapEnd),
          });
        }
        currentGapStart = null;
      }
    }
  }

  if (currentGapStart !== null) {
    const gapEnd = scheduleHorizon;
    const dur = gapEnd - currentGapStart;
    if (dur >= minRequiredDuration) {
      gaps.push({
        start: currentGapStart,
        end: gapEnd,
        durationMinutes: dur,
        startFormatted: minutesToTime(currentGapStart),
        endFormatted: minutesToTime(gapEnd),
      });
    }
  }

  return gaps;
};

/**
 * Checks whether a given slot is available for the requested total duration
 */
export const checkSlotAvailability = (
  dayNumber: number,
  time: string,
  totalDurationMinutes: number,
  existingAppointments: Appointment[] = [],
  totalChairsCapacity = 1,
  openTime = '10:00',
  closeTime = '21:00'
): SlotAvailability => {
  const slotStart = timeToMinutes(time);
  const slotEnd = slotStart + totalDurationMinutes;
  const salonOpen = timeToMinutes(openTime || '10:00');
  const salonClose = timeToMinutes(closeTime || '21:00');

  // 1. Strict Expired check: block past date or past hour on today
  if (isSlotExpired(dayNumber, time, 0)) {
    return {
      time,
      isAvailable: false,
      isExpired: true,
      conflictReason: 'ساعت انتخابی سپری شده است و امکان رزرو ندارد',
      activeAppointmentsCount: 0,
    };
  }

  // 2. Before opening hours check
  if (slotStart < salonOpen) {
    return {
      time,
      isAvailable: false,
      isExpired: false,
      conflictReason: `ساعت انتخابی پیش از ساعت شروع کار سالن (${openTime}) است`,
      activeAppointmentsCount: totalChairsCapacity,
    };
  }

  // 3. After closing hours check (the barber sets working hours based on the last reservation start time)
  if (slotStart > salonClose) {
    return {
      time,
      isAvailable: false,
      isExpired: false,
      conflictReason: `ساعت انتخابی پس از آخرین ساعت پذیرش سالن (${closeTime}) است`,
      activeAppointmentsCount: totalChairsCapacity,
    };
  }

  const gaps = calculateScheduleGaps(
    dayNumber,
    totalDurationMinutes,
    existingAppointments,
    totalChairsCapacity,
    openTime,
    closeTime
  );

  const matchingGap = gaps.find((g) => slotStart >= g.start && slotEnd <= g.end);

  const occupiedRanges = getDayOccupiedRanges(dayNumber, existingAppointments);
  let activeOverlaps = 0;
  for (const r of occupiedRanges) {
    if (Math.max(slotStart, r.start) < Math.min(slotEnd, r.end)) {
      activeOverlaps++;
    }
  }

  const isAvailable = Boolean(matchingGap);

  return {
    time,
    isAvailable,
    isExpired: false,
    conflictReason: !isAvailable ? 'نوبت این ساعت قبلاً رزرو شده است' : undefined,
    activeAppointmentsCount: activeOverlaps,
    availableGap: matchingGap,
  };
};

export interface NearestSlotResult {
  nearest: string | null;
  alternatives: string[];
  gapInfo?: {
    start: string;
    end: string;
    gapDuration: number;
    differenceMinutes: number;
  };
}

/**
 * Finds the closest available time slot to the user's preferred time,
 * considering the duration of their selected service plus any added extras
 * and fitting inside the gaps between existing bookings.
 * Strictly guarantees that expired slots are excluded.
 */
export const findClosestAvailableSlotByGaps = (
  dayNumber: number,
  requestedTime: string,
  totalDurationMinutes: number,
  existingAppointments: Appointment[] = [],
  allSlots: string[] = MASTER_TIME_SLOTS,
  totalChairsCapacity = 1,
  openTime = '10:00',
  closeTime = '21:00'
): NearestSlotResult => {
  const requestedMins = timeToMinutes(requestedTime);
  const salonOpen = timeToMinutes(openTime || '10:00');
  const salonClose = timeToMinutes(closeTime || '21:00');

  const validSlotsWithGaps = allSlots
    .filter((slot) => {
      const sMin = timeToMinutes(slot);
      return sMin >= salonOpen && sMin <= salonClose && !isSlotExpired(dayNumber, slot, 0);
    })
    .map((slot) => {
      const availability = checkSlotAvailability(
        dayNumber,
        slot,
        totalDurationMinutes,
        existingAppointments,
        totalChairsCapacity,
        openTime,
        closeTime
      );
      return {
        slot,
        availability,
        distance: Math.abs(timeToMinutes(slot) - requestedMins),
      };
    })
    .filter((item) => item.availability.isAvailable && !item.availability.isExpired);

  if (validSlotsWithGaps.length === 0) {
    return { nearest: null, alternatives: [] };
  }

  const sorted = [...validSlotsWithGaps].sort((a, b) => {
    if (a.distance !== b.distance) {
      return a.distance - b.distance;
    }
    const is30BlockA = a.slot.endsWith(':00') || a.slot.endsWith(':30');
    const is30BlockB = b.slot.endsWith(':00') || b.slot.endsWith(':30');
    if (is30BlockA && !is30BlockB) return -1;
    if (!is30BlockA && is30BlockB) return 1;
    return 0;
  });

  const best = sorted[0];
  const matchingGap = best.availability.availableGap;

  return {
    nearest: best.slot,
    alternatives: sorted.slice(1, 4).map((s) => s.slot),
    gapInfo: matchingGap
      ? {
          start: matchingGap.startFormatted,
          end: matchingGap.endFormatted,
          gapDuration: matchingGap.durationMinutes,
          differenceMinutes: best.distance,
        }
      : undefined,
  };
};

export const findNearestAvailableSlot = findClosestAvailableSlotByGaps;
