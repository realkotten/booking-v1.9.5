// ══════════════════════════════════════════════════════════════════
// ATELIER DATE & TIME FOUNDATION UTILITIES
// ══════════════════════════════════════════════════════════════════

/**
 * Converts English digits to Persian digits.
 */
export function toPersianDigits(input: string | number): string {
  if (input === undefined || input === null) return '';
  const str = String(input);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, (w) => persianDigits[+w]);
}

/**
 * Converts Persian and Arabic digits to English digits.
 */
export function toEnglishDigits(input: string | number): string {
  if (typeof input === 'number') return String(input);
  if (!input) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let res = String(input);
  for (let i = 0; i < 10; i++) {
    res = res.replace(new RegExp(persianDigits[i], 'g'), String(i));
    res = res.replace(new RegExp(arabicDigits[i], 'g'), String(i));
  }
  return res;
}

/**
 * Safely parses any Persian/Arabic/Latin number string into a valid number.
 */
export function safeParseNumber(input: string | number | undefined | null, fallback = 0): number {
  if (typeof input === 'number') return isNaN(input) ? fallback : input;
  if (!input) return fallback;
  const englishStr = toEnglishDigits(String(input)).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(englishStr);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Parses time string 'HH:mm' into total minutes from start of day.
 */
export function timeToMinutes(timeStr: string): number {
  const normalized = toEnglishDigits(timeStr).trim();
  const [hours, minutes] = normalized.split(':').map((v) => parseInt(v, 10) || 0);
  return hours * 60 + minutes;
}

/**
 * Converts total minutes from start of day into 'HH:mm'.
 */
export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}`;
}

/**
 * Adds duration in minutes to a given 'HH:mm' time.
 */
export function addMinutesToTime(startTime: string, durationMinutes: number): string {
  const startMins = timeToMinutes(startTime);
  const endMins = startMins + durationMinutes;
  return minutesToTime(endMins);
}

/**
 * Formats a time span string, e.g. "15:15 - 16:00" or Persianized "۱۵:۱۵ الی ۱۶:۰۰".
 */
export function formatTimeSpan(startTime: string, durationMinutes: number, inPersian = true): string {
  const endTime = addMinutesToTime(startTime, durationMinutes);
  if (inPersian) {
    return `${toPersianDigits(startTime)} الی ${toPersianDigits(endTime)}`;
  }
  return `${startTime} - ${endTime}`;
}

/**
 * Calculates duration between two time strings in minutes.
 */
export function calculateDurationBetweenTimes(startTime: string, endTime: string): number {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  return Math.max(0, end - start);
}

/**
 * Checks whether two time spans [startA, endA) and [startB, endB) overlap.
 */
export function doTimesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const sA = timeToMinutes(startA);
  const eA = timeToMinutes(endA);
  const sB = timeToMinutes(startB);
  const eB = timeToMinutes(endB);
  return sA < eB && sB < eA;
}

// ─── PERSIAN CALENDAR STRUCTURES & REAL-TIME SYSTEM ─────────────

/**
 * Normalizes Persian weekday strings by stripping ZWNJ (\u200c) and spaces.
 * Ensures consistent matching between 'پنج‌شنبه' and 'پنجشنبه', 'یک‌شنبه' and 'یکشنبه', 'سه‌شنبه' and 'سه شنبه'.
 */
export function normalizeWeekday(dayStr?: string): string {
  if (!dayStr) return '';
  return dayStr
    .replace(/\u200c/g, '')
    .replace(/\s+/g, '')
    .trim();
}

export function matchDayConfig<T extends { dayOfWeek: string }>(
  hoursList: T[] = [],
  targetWeekday: string
): T | undefined {
  if (!targetWeekday || !hoursList.length) return undefined;
  const normTarget = normalizeWeekday(targetWeekday);
  return hoursList.find((h) => normalizeWeekday(h.dayOfWeek) === normTarget);
}

export interface SolarDateInfo {
  dayNumber: number;
  dayNumberPersian: string;
  monthName: string;
  monthNumber: number;
  year: number;
  yearPersian: string;
  dayName: string;
  dayShortName: string;
  dateString: string;
  dateKey: string;
  timeString: string;
  timeStringPersian: string;
  secondsString: string;
  fullTimeString: string;
  fullTimeStringPersian: string;
  rawDate: Date;
}

/**
 * Dynamically retrieves full Solar Hijri (Jalali) date & time information from any Date object (defaults to real-time now).
 */
export function getCurrentSolarDateInfo(targetDate: Date = new Date()): SolarDateInfo {
  try {
    const formatterFa = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const formatterLatn = new Intl.DateTimeFormat('en-u-ca-persian-nu-latn', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });

    const partsFa = formatterFa.formatToParts(targetDate);
    const partsLatn = formatterLatn.formatToParts(targetDate);

    const dayStr = partsLatn.find((p) => p.type === 'day')?.value || '1';
    const monthNumStr = partsLatn.find((p) => p.type === 'month')?.value || '1';
    const yearStr = partsLatn.find((p) => p.type === 'year')?.value || '1403';

    const monthStr = partsFa.find((p) => p.type === 'month')?.value || 'مهر';
    const weekdayStr = partsFa.find((p) => p.type === 'weekday')?.value || 'سه‌شنبه';

    const dayNumber = parseInt(dayStr, 10) || 1;
    const monthNumber = parseInt(monthNumStr, 10) || 1;
    const year = parseInt(yearStr, 10) || 1403;

    const shortWeekdayMap: Record<string, string> = {
      'شنبه': 'ش',
      'یک‌شنبه': 'ی',
      'دوشنبه': 'د',
      'سه‌شنبه': 'س',
      'چهارشنبه': 'چ',
      'پنج‌شنبه': 'پ',
      'جمعه': 'ج',
    };

    const dayShortName = shortWeekdayMap[weekdayStr] || weekdayStr.slice(0, 1);

    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateKey = `${year}-${pad(monthNumber)}-${pad(dayNumber)}`;

    const hours = targetDate.getHours();
    const mins = targetDate.getMinutes();
    const secs = targetDate.getSeconds();

    const timeString = `${pad(hours)}:${pad(mins)}`;
    const fullTimeString = `${pad(hours)}:${pad(mins)}:${pad(secs)}`;

    return {
      dayNumber,
      dayNumberPersian: toPersianDigits(dayNumber),
      monthName: monthStr,
      monthNumber,
      year,
      yearPersian: toPersianDigits(year),
      dayName: weekdayStr,
      dayShortName,
      dateString: `${weekdayStr}، ${toPersianDigits(dayNumber)} ${monthStr} ${toPersianDigits(year)}`,
      dateKey,
      timeString,
      timeStringPersian: toPersianDigits(timeString),
      secondsString: pad(secs),
      fullTimeString,
      fullTimeStringPersian: toPersianDigits(fullTimeString),
      rawDate: targetDate,
    };
  } catch (e) {
    const fallbackDate = targetDate;
    const day = fallbackDate.getDate();
    return {
      dayNumber: day,
      dayNumberPersian: toPersianDigits(day),
      monthName: 'مهر',
      monthNumber: 7,
      year: 1403,
      yearPersian: '۱۴۰۳',
      dayName: 'سه‌شنبه',
      dayShortName: 'س',
      dateString: `سه‌شنبه، ${toPersianDigits(day)} مهر ۱۴۰۳`,
      dateKey: `1403-07-${day.toString().padStart(2, '0')}`,
      timeString: '12:00',
      timeStringPersian: '۱۲:۰۰',
      secondsString: '00',
      fullTimeString: '12:00:00',
      fullTimeStringPersian: '۱۲:۰۰:۰۰',
      rawDate: fallbackDate,
    };
  }
}

export interface ScheduleWeekDay {
  dayNumber: number;
  dayNumberPersian: string;
  dayName: string;         // 'شنبه', 'یک‌شنبه', 'دوشنبه', ...
  dayShortName: string;    // 'ش', 'ی', 'د', ...
  dateString: string;      // 'شنبه، ۱۹ مهر ۱۴۰۳'
  dateKey: string;         // '1403-07-19'
  isToday: boolean;
  monthName: string;
  year: number;
  rawDate: Date;
}

export const PERSIAN_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 
  'تیر', 'مرداد', 'شهریور', 
  'مهر', 'آبان', 'آذر', 
  'دی', 'بهمن', 'اسفند'
];

export const ATELIER_ACTIVE_MONTH = getCurrentSolarDateInfo().monthName + ' ' + getCurrentSolarDateInfo().yearPersian;
export const ATELIER_ACTIVE_YEAR = getCurrentSolarDateInfo().year;
export const ATELIER_ACTIVE_MONTH_INDEX = getCurrentSolarDateInfo().monthNumber - 1;

/**
 * Dynamically generates the 7-day week strip (Saturday to Friday) from real-time clock.
 * Handles weekOffset (0 = current week, +1 = next week, -1 = prev week).
 */
export function getScheduleWeekDays(weekOffset = 0, referenceDate: Date = new Date()): ScheduleWeekDay[] {
  const now = new Date(referenceDate);
  const nowSolar = getCurrentSolarDateInfo(now);
  
  // In JS: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  // In Persian calendar, week starts on Saturday (6)
  // Calculate how many days to subtract to reach Saturday:
  const dayOfWeek = now.getDay();
  const daysSinceSaturday = (dayOfWeek + 1) % 7;
  
  // Saturday of this target week
  const saturday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysSinceSaturday + (weekOffset * 7));

  const weekDays: ScheduleWeekDay[] = [];

  for (let i = 0; i < 7; i++) {
    const curDate = new Date(saturday.getFullYear(), saturday.getMonth(), saturday.getDate() + i);
    const solarInfo = getCurrentSolarDateInfo(curDate);
    const isToday = 
      solarInfo.dayNumber === nowSolar.dayNumber &&
      solarInfo.monthNumber === nowSolar.monthNumber &&
      solarInfo.year === nowSolar.year;

    weekDays.push({
      dayNumber: solarInfo.dayNumber,
      dayNumberPersian: solarInfo.dayNumberPersian,
      dayName: solarInfo.dayName,
      dayShortName: solarInfo.dayShortName,
      dateString: solarInfo.dateString,
      dateKey: solarInfo.dateKey,
      isToday,
      monthName: solarInfo.monthName,
      year: solarInfo.year,
      rawDate: curDate,
    });
  }

  return weekDays;
}

/**
 * Returns full Persian date string for a day number dynamically based on real-time calendar and accurate weekday.
 */
export function getPersianDateForDay(dayNumber?: number, monthName?: string, year?: number): string {
  const current = getCurrentSolarDateInfo();
  if (dayNumber === undefined || (dayNumber === current.dayNumber && (!monthName || monthName === current.monthName))) {
    return current.dateString;
  }

  // Look in upcoming 30 days to get the exact real Date object and exact dayName
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const curDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const s = getCurrentSolarDateInfo(curDate);
    if (s.dayNumber === dayNumber) {
      if (!monthName || s.monthName === monthName) {
        return s.dateString;
      }
    }
  }

  return `${toPersianDigits(dayNumber)} ${monthName || current.monthName} ${toPersianDigits(year || current.year)}`;
}

/**
 * Accurately formats an appointment's scheduled date for visiting the barber (not the date it was reserved).
 */
export function formatAppointmentDate(apt?: { date?: string; dayNumber?: number } | null): string {
  if (!apt) return '';
  if (apt.dayNumber !== undefined && apt.dayNumber > 0) {
    const now = new Date();
    for (let i = 0; i < 30; i++) {
      const curDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      const s = getCurrentSolarDateInfo(curDate);
      if (s.dayNumber === apt.dayNumber) {
        return `${s.dayName}، ${s.dayNumberPersian} ${s.monthName}`;
      }
    }
    return getPersianDateForDay(apt.dayNumber);
  }
  return apt.date || getPersianDateForDay();
}

export interface BookingCalendarDay {
  dayNumber: number;
  dayNumberPersian: string;
  dayName: string;
  dayShortName: string;
  dateString: string;
  dateKey: string;
  isToday: boolean;
  isAvailable: boolean;
  unavailableReason?: string;
  monthName: string;
  year: number;
  rawDate: Date;
}

/**
 * Dynamically generates real-time future booking days for online reservation starting from today.
 */
export function getBookingCalendarDays(
  count = 14,
  startDate: Date = new Date()
): BookingCalendarDay[] {
  const now = new Date(startDate);
  const nowSolar = getCurrentSolarDateInfo(now);
  const days: BookingCalendarDay[] = [];

  for (let i = 0; i < count; i++) {
    const curDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const solarInfo = getCurrentSolarDateInfo(curDate);
    
    // In Persian calendar, Friday (جمعه) is the weekend/closed day by default
    const isFriday = solarInfo.dayName === 'جمعه';
    const isAvailable = !isFriday;
    const unavailableReason = isFriday ? 'رویداد خصوصی و نظافت جامع سالن' : undefined;
    
    const isToday = i === 0;

    days.push({
      dayNumber: solarInfo.dayNumber,
      dayNumberPersian: solarInfo.dayNumberPersian,
      dayName: solarInfo.dayName,
      dayShortName: solarInfo.dayShortName,
      dateString: solarInfo.dateString,
      dateKey: solarInfo.dateKey,
      isToday,
      isAvailable,
      unavailableReason,
      monthName: solarInfo.monthName,
      year: solarInfo.year,
      rawDate: curDate,
    });
  }

  return days;
}
