import { Appointment, Service, Accoutrement, BeverageOption, ClientProfile, Chair } from '../types';
import { addMinutesToTime, doTimesOverlap, timeToMinutes, minutesToTime, toPersianDigits, getCurrentSolarDateInfo } from './dateUtils';
import { isSlotExpired } from './bookingUtils';

// ─── Financial & Duration Calculators ─────────────────────────────
export interface AppointmentCalculationResult {
  servicePrice: number;
  serviceRealPrice: number;
  discountAmount: number;
  discountPercent: number;
  hasDiscount: boolean;
  accoutrementsPrice: number;
  beveragePrice: number;
  subtotal: number;
  originalSubtotal: number;
  tipAmount: number;
  totalAmount: number;
  originalTotalAmount: number;
  depositAmount: number;
  totalDurationMinutes: number;
}

export function calculateAppointmentTotals(
  service: Service,
  accoutrements: Accoutrement[],
  tipRateOrAmount: number | 'custom',
  customTip = 0,
  beverage?: BeverageOption | null
): AppointmentCalculationResult {
  const servicePrice = service?.price || 0;
  const serviceRealPrice = (service?.realPrice && service.realPrice > 0) ? service.realPrice : servicePrice;
  const hasDiscount = Boolean(serviceRealPrice > servicePrice && servicePrice > 0);
  const discountAmount = hasDiscount ? serviceRealPrice - servicePrice : 0;
  const discountPercent = hasDiscount && serviceRealPrice > 0
    ? Math.round((discountAmount / serviceRealPrice) * 100)
    : 0;

  const beveragePrice = beverage?.price || 0;
  
  const selectedAccoutrements = (accoutrements || []).filter((a) => a.selected);
  const accoutrementsPrice = selectedAccoutrements.reduce((sum, a) => sum + (a.price || 0), 0);
  const accoutrementsDuration = selectedAccoutrements.reduce((sum, a) => sum + (a.durationMinutes || 0), 0);

  const subtotal = servicePrice + accoutrementsPrice + beveragePrice;
  const originalSubtotal = serviceRealPrice + accoutrementsPrice + beveragePrice;
  
  let tipAmount = 0;
  if (tipRateOrAmount === 'custom') {
    tipAmount = customTip;
  } else if (typeof tipRateOrAmount === 'number') {
    tipAmount = Math.round((subtotal * tipRateOrAmount) / 100);
  }

  const totalAmount = subtotal + tipAmount;
  const originalTotalAmount = originalSubtotal + tipAmount;
  const depositAmount = Math.min(50000, totalAmount); // Deposit amount in Toman
  const totalDurationMinutes = (service?.durationMinutes || 45) + accoutrementsDuration;

  return {
    servicePrice,
    serviceRealPrice,
    discountAmount,
    discountPercent,
    hasDiscount,
    accoutrementsPrice,
    beveragePrice,
    subtotal,
    originalSubtotal,
    tipAmount,
    totalAmount,
    originalTotalAmount,
    depositAmount,
    totalDurationMinutes,
  };
}

// ─── Filtering and Search Queries ─────────────────────────────────
export function getAppointmentsForDate(
  appointments: Appointment[],
  dayNumberOrDateString: number | string
): Appointment[] {
  if (typeof dayNumberOrDateString === 'number') {
    return appointments.filter((apt) => apt.dayNumber === dayNumberOrDateString);
  }
  return appointments.filter((apt) => apt.date === dayNumberOrDateString);
}

export function getAppointmentsForChair(
  appointments: Appointment[],
  chairId: string
): Appointment[] {
  return appointments.filter((apt) => apt.chairId === chairId);
}

export function getAppointmentsForCustomer(
  appointments: Appointment[],
  customerId: string
): Appointment[] {
  return appointments.filter((apt) => apt.customerId === customerId);
}

export function getAppointmentsForBarber(
  appointments: Appointment[],
  barberId: string
): Appointment[] {
  return appointments.filter((apt) => apt.barberId === barberId);
}

export function findCustomerByPhone(
  customers: ClientProfile[],
  phone: string
): ClientProfile | undefined {
  const clean = (p: string) => p.replace(/\D/g, '');
  const targetClean = clean(phone);
  if (!targetClean) return undefined;
  return customers.find((c) => clean(c.phone) === targetClean);
}

// ─── Active & Next Appointment Queries ────────────────────────────
export function getActiveAppointment(
  appointments: Appointment[],
  dayNumber?: number
): Appointment | undefined {
  const targetDay = dayNumber !== undefined ? dayNumber : getCurrentSolarDateInfo().dayNumber;
  return appointments.find(
    (apt) => apt.dayNumber === targetDay && apt.status === 'in_progress'
  );
}

export function getNextAppointment(
  appointments: Appointment[],
  dayNumber?: number
): Appointment | undefined {
  const targetDay = dayNumber !== undefined ? dayNumber : getCurrentSolarDateInfo().dayNumber;
  const sorted = sortAppointmentsChronologically(
    appointments.filter(
      (apt) =>
        apt.dayNumber === targetDay &&
        (apt.status === 'confirmed' || apt.status === 'reserved' || apt.status === 'available')
    )
  );
  return sorted[0];
}

export function getTodayAppointments(
  appointments: Appointment[],
  dayNumber?: number
): Appointment[] {
  const targetDay = dayNumber !== undefined ? dayNumber : getCurrentSolarDateInfo().dayNumber;
  const todayList = appointments.filter((apt) => apt.dayNumber === targetDay);
  return sortAppointmentsChronologically(todayList);
}

// ─── Conflict Checking & Slot Availability ────────────────────────
export function checkAppointmentConflict(
  appointments: Appointment[],
  chairId: string,
  dayNumber: number,
  startTime: string,
  durationMinutes: number,
  excludeAppointmentId?: string
): { hasConflict: boolean; conflictingAppointment?: Appointment } {
  const newEndTime = addMinutesToTime(startTime, durationMinutes);

  const dayAppointments = appointments.filter(
    (apt) =>
      apt.dayNumber === dayNumber &&
      apt.chairId === chairId &&
      apt.status !== 'cancelled' &&
      apt.id !== excludeAppointmentId
  );

  for (const apt of dayAppointments) {
    const aptEndTime = apt.endTime || addMinutesToTime(apt.startTime, apt.durationMinutes || 45);
    if (doTimesOverlap(startTime, newEndTime, apt.startTime, aptEndTime)) {
      return { hasConflict: true, conflictingAppointment: apt };
    }
  }

  return { hasConflict: false };
}

export interface AvailableTimeSlot {
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

/**
 * Calculates open empty gaps in today's working hours (10:00 to 20:30) for a chair.
 */
export function getAvailableTimeSlots(
  appointments: Appointment[],
  chairId = 'chair-01',
  dayNumber?: number,
  openTime = '10:00',
  closeTime = '20:30',
  minGapMinutes = 30
): AvailableTimeSlot[] {
  const targetDay = dayNumber !== undefined ? dayNumber : getCurrentSolarDateInfo().dayNumber;
  const activeAndBooked = appointments.filter(
    (apt) =>
      apt.dayNumber === targetDay &&
      apt.chairId === chairId &&
      apt.status !== 'cancelled'
  );

  const sorted = sortAppointmentsChronologically(activeAndBooked);
  const openMins = timeToMinutes(openTime);
  const closeMins = timeToMinutes(closeTime);

  const slots: AvailableTimeSlot[] = [];
  let currentPointer = openMins;

  for (const apt of sorted) {
    const aptStart = timeToMinutes(apt.startTime);
    const aptEnd = timeToMinutes(
      apt.endTime || addMinutesToTime(apt.startTime, apt.durationMinutes || 45)
    );

    if (aptStart > currentPointer) {
      const gap = aptStart - currentPointer;
      if (gap >= minGapMinutes) {
        slots.push({
          startTime: minutesToTime(currentPointer),
          endTime: minutesToTime(aptStart),
          durationMinutes: gap,
        });
      }
    }
    currentPointer = Math.max(currentPointer, aptEnd);
  }

  if (closeMins > currentPointer) {
    const gap = closeMins - currentPointer;
    if (gap >= minGapMinutes) {
      slots.push({
        startTime: minutesToTime(currentPointer),
        endTime: minutesToTime(closeMins),
        durationMinutes: gap,
      });
    }
  }

  return slots;
}

// ─── Chronological Sorting ────────────────────────────────────────
export function sortAppointmentsChronologically(appointments: Appointment[]): Appointment[] {
  return [...appointments].sort((a, b) => {
    if (a.dayNumber !== b.dayNumber) {
      return a.dayNumber - b.dayNumber;
    }
    return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  });
}

// ─── Customer Online Booking Availability Slots ───────────────────
export interface CustomerTimeSlot {
  time: string;
  timePersian: string;
  period: 'morning' | 'afternoon' | 'evening';
  periodLabel: string;
  isAvailable: boolean;
  conflictReason?: string;
}

/**
 * Calculates customer-facing discrete time slots for a given day and service duration,
 * using the shared checkAppointmentConflict engine and considering studio opening hours.
 */
export function getCustomerAvailableSlots(
  appointments: Appointment[],
  chairId: string,
  dayNumber: number,
  durationMinutes = 45,
  openTime = '10:00',
  closeTime = '20:30',
  stepMinutes = 15
): CustomerTimeSlot[] {
  const startMins = timeToMinutes(openTime);
  const closeMins = timeToMinutes(closeTime);
  const slots: CustomerTimeSlot[] = [];

  for (let m = startMins; m <= closeMins; m += stepMinutes) {
    const timeStr = minutesToTime(m);
    const conflict = checkAppointmentConflict(
      appointments,
      chairId,
      dayNumber,
      timeStr,
      durationMinutes
    );

    let period: 'morning' | 'afternoon' | 'evening' = 'afternoon';
    let periodLabel = 'بعدازظهر';
    if (m < 720) {
      period = 'morning';
      periodLabel = 'صبح';
    } else if (m >= 1020) {
      period = 'evening';
      periodLabel = 'عصر و غروب';
    }

    const expired = isSlotExpired(dayNumber, timeStr);
    slots.push({
      time: timeStr,
      timePersian: toPersianDigits(timeStr),
      period,
      periodLabel,
      isAvailable: !expired && !conflict.hasConflict,
      conflictReason: expired ? 'منقضی شده' : conflict.hasConflict ? 'رزرو شده' : undefined,
    });
  }

  return slots;
}
