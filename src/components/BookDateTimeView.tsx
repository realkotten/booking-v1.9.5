import React, { useMemo, useState, useEffect } from 'react';
import { AtelierShell } from './AtelierShell';
import { useAtelier } from '../store/AtelierContext';
import { Accoutrement, Service } from '../types';
import { PriceSummary } from './booking/PriceSummary';
import {
  addMinutes,
  generateUpcomingDays,
  checkSlotAvailability,
  findClosestAvailableSlotByGaps,
  calculateScheduleGaps,
  generateDayTimeSlots,
  calculateBookingTotals,
  isSlotExpired,
  areAllSlotsExpiredForDay,
} from '../utils/bookingUtils';
import { toPersianDigits, matchDayConfig, normalizeWeekday } from '../utils/dateUtils';
import { hapticLight, hapticSelection, hapticWarning } from '../utils/hapticUtils';
import {
  ArrowRight,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Zap,
  CalendarCheck,
  Hourglass,
  Layers,
  X,
  Sparkles,
  Bell,
  BellRing,
} from 'lucide-react';
import { SpatialTilt } from './common/SpatialTilt';

interface BookDateTimeViewProps {
  service: Service | null;
  selectedDay: number;
  selectedTime: string;
  preferredTime?: string;
  accoutrements: Accoutrement[];
  onSelectDay: (day: number) => void;
  onSelectTime: (time: string) => void;
  onBackToPreference: () => void;
  onContinueToCheckout: () => void;
  onOpenProfile?: () => void;
}

export const BookDateTimeView: React.FC<BookDateTimeViewProps> = ({
  service,
  selectedDay,
  selectedTime,
  preferredTime = '18:00',
  accoutrements,
  onSelectDay,
  onSelectTime,
  onBackToPreference,
  onContinueToCheckout,
  onOpenProfile,
}) => {
  const { activeChair, activeBarber, settings, appointments, currentCustomer, logHourDemand } = useAtelier();
  const days = useMemo(() => generateUpcomingDays(14), []);
  const totals = useMemo(
    () => calculateBookingTotals(service, accoutrements),
    [service, accoutrements]
  );

  const activeDay = days.find((d) => d.dayNumber === selectedDay) ?? days[0];

  // Active operating hours from barber profile or studio settings
  const activeWorkingHours = useMemo(() => {
    if (activeBarber?.workingHours && activeBarber.workingHours.length > 0) {
      return activeBarber.workingHours;
    }
    return settings?.operatingHours || [];
  }, [activeBarber, settings]);

  const activeWorkingDays = useMemo(() => {
    if (activeBarber?.workingDays && activeBarber.workingDays.length > 0) {
      return activeBarber.workingDays;
    }
    return activeWorkingHours.filter((h) => !h.isClosed).map((h) => h.dayOfWeek);
  }, [activeBarber, activeWorkingHours]);

  const currentDayConfig = useMemo(() => {
    return matchDayConfig(activeWorkingHours, activeDay.weekday);
  }, [activeWorkingHours, activeDay.weekday]);

  const isDayOff = useMemo(() => {
    if (!currentDayConfig) return false;
    if (currentDayConfig.isClosed) return true;
    if (activeWorkingDays.length > 0) {
      const normDay = normalizeWeekday(activeDay.weekday);
      const isDayActive = activeWorkingDays.some((d) => normalizeWeekday(d) === normDay);
      if (!isDayActive) return true;
    }
    return false;
  }, [currentDayConfig, activeWorkingDays, activeDay.weekday]);

  const openTime = currentDayConfig?.openTime || '10:00';
  const closeTime = currentDayConfig?.closeTime || '20:30';
  const breakStart = currentDayConfig?.breakStart;
  const breakEnd = currentDayConfig?.breakEnd;

  // Day slots generated in 15-minute intervals up to closeTime
  const daySlots = useMemo(() => {
    if (isDayOff) return [];
    return generateDayTimeSlots(openTime, closeTime, breakStart, breakEnd, 15);
  }, [isDayOff, openTime, closeTime, breakStart, breakEnd]);

  // Tracks if all slots on the selected day are expired
  const isDayAllExpired = useMemo(
    () => isDayOff || areAllSlotsExpiredForDay(selectedDay, daySlots),
    [isDayOff, selectedDay, daySlots]
  );

  // Available free gaps between existing appointments on this day
  const scheduleGaps = useMemo(() => {
    if (isDayOff) return [];
    return calculateScheduleGaps(selectedDay, totals.totalDuration, appointments, 1, openTime, closeTime);
  }, [selectedDay, totals.totalDuration, appointments, isDayOff, openTime, closeTime]);

  // Map of availability for all slots on this day for the combined duration (service + extras)
  const slotsStatus = useMemo(() => {
    return daySlots.map((slot) => ({
      slot,
      ...checkSlotAvailability(selectedDay, slot, totals.totalDuration, appointments, 1, openTime, closeTime),
    }));
  }, [daySlots, selectedDay, totals.totalDuration, appointments, openTime, closeTime]);

  // Status of the user's initially preferred time
  const preferredTimeStatus = useMemo(() => {
    return checkSlotAvailability(
      selectedDay,
      preferredTime,
      totals.totalDuration,
      appointments,
      1,
      openTime,
      closeTime
    );
  }, [selectedDay, preferredTime, totals.totalDuration, appointments, openTime, closeTime]);

  // Tracks if the user clicked on a booked/taken slot to show immediate feedback
  const [takenSlotAttempted, setTakenSlotAttempted] = useState<string | null>(null);
  const [expiredNoticeMessage, setExpiredNoticeMessage] = useState<string | null>(null);
  const [waitlistedSlots, setWaitlistedSlots] = useState<Record<string, boolean>>({});

  const handleJoinWaitlist = (slotTime: string) => {
    hapticSelection();
    setWaitlistedSlots((prev) => ({ ...prev, [slotTime]: true }));
    logHourDemand({
      dayNumber: selectedDay,
      requestedTime: slotTime,
      serviceId: service.id,
      serviceName: service.name,
      weekday: activeDay.weekday,
      dateLabel: activeDay.label,
      customerName: currentCustomer?.name || 'مشتری محترم',
      customerPhone: currentCustomer?.phone || '',
      wasReserved: false,
    });
  };

  // Selected slot status
  const currentSlotStatus = useMemo(() => {
    if (!selectedTime) return null;
    return (
      slotsStatus.find((s) => s.slot === selectedTime) ||
      checkSlotAvailability(selectedDay, selectedTime, totals.totalDuration, appointments, 1, openTime, closeTime)
    );
  }, [slotsStatus, selectedDay, selectedTime, totals.totalDuration, appointments, openTime, closeTime]);

  // Nearest available slot calculated using booking gap analysis
  const targetBookedTime = takenSlotAttempted || (!preferredTimeStatus.isAvailable ? preferredTime : null);
  const isTargetExpired = targetBookedTime ? isSlotExpired(selectedDay, targetBookedTime) : false;

  const nearestResult = useMemo(() => {
    if (!targetBookedTime) return null;
    return findClosestAvailableSlotByGaps(
      selectedDay,
      targetBookedTime,
      totals.totalDuration,
      appointments,
      daySlots,
      1,
      openTime,
      closeTime
    );
  }, [targetBookedTime, selectedDay, totals.totalDuration, appointments, daySlots, openTime, closeTime]);

  // Auto-highlight and auto-select closest available slot if preferred time was booked or expired
  useEffect(() => {
    const isCurrentExpired = selectedTime ? isSlotExpired(selectedDay, selectedTime) : false;
    if ((!preferredTimeStatus.isAvailable || isCurrentExpired) && nearestResult?.nearest) {
      if (selectedTime === preferredTime || !selectedTime || isCurrentExpired) {
        onSelectTime(nearestResult.nearest);
      }
    } else if (isCurrentExpired && !nearestResult?.nearest) {
      onSelectTime('');
    }
  }, [preferredTimeStatus.isAvailable, nearestResult?.nearest, selectedDay, selectedTime]);

  const endTime = useMemo(() => {
    if (!selectedTime) return '';
    return addMinutes(selectedTime, totals.totalDuration);
  }, [selectedTime, totals.totalDuration]);

  if (!service) return null;

  const handleSlotClick = (slot: string, isAvailable: boolean, isExpired?: boolean) => {
    if (isExpired) {
      hapticWarning();
      setExpiredNoticeMessage(`ساعت ${toPersianDigits(slot)} سپری شده است و امکان رزرو ندارد.`);
      setTakenSlotAttempted(null);
      return;
    }

    setExpiredNoticeMessage(null);
    if (isAvailable) {
      hapticSelection();
    } else {
      hapticWarning();
    }

    // Log slot request into application demand state
    logHourDemand({
      dayNumber: selectedDay,
      requestedTime: slot,
      serviceId: service.id,
      serviceName: service.name,
      weekday: activeDay.weekday,
      dateLabel: activeDay.label,
      customerName: currentCustomer?.name || 'مشتری محترم',
      customerPhone: currentCustomer?.phone || '',
      wasReserved: isAvailable,
    });

    if (!isAvailable) {
      // User clicked a booked slot: show notice and auto-select & highlight nearest available gap block
      setTakenSlotAttempted(slot);
      const res = findClosestAvailableSlotByGaps(
        selectedDay,
        slot,
        totals.totalDuration,
        appointments,
        daySlots,
        1,
        openTime,
        closeTime
      );
      if (res.nearest) {
        onSelectTime(res.nearest);
      }
    } else {
      // Available slot clicked
      setTakenSlotAttempted(null);
      onSelectTime(slot);
    }
  };

  // Filter only active, non-expired slots for display
  const visibleSlots = useMemo(() => {
    return slotsStatus.filter((s) => !s.isExpired);
  }, [slotsStatus]);

  // Group visible slots by time period cleanly
  const morningSlots = useMemo(() => visibleSlots.filter((s) => s.slot < '13:00'), [visibleSlots]);
  const afternoonSlots = useMemo(() => visibleSlots.filter((s) => s.slot >= '13:00' && s.slot < '17:00'), [visibleSlots]);
  const eveningSlots = useMemo(() => visibleSlots.filter((s) => s.slot >= '17:00'), [visibleSlots]);

  const highlightedNearestSlot = nearestResult?.nearest;

  return (
    <AtelierShell id="book-datetime-container">
      {/* Top Header */}
      <header
        id="datetime-header"
        className="relative z-30 flex shrink-0 items-center justify-between px-6 pt-1"
        dir="rtl"
      >
        <button
          type="button"
          onClick={() => {
            hapticLight();
            onBackToPreference();
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white bg-white/80 shadow-2xs transition-transform active:scale-95"
          title="بازگشت به انتخاب زمان دلخواه"
        >
          <ArrowRight className="h-4 w-4 text-stone-700" />
        </button>

        <div className="text-center">
          <span className="block text-[9px] font-bold text-[#bf5938]">مرحله دوم · ۲ از ۲ زمان‌بندی</span>
          <h1 className="font-serif text-sm font-bold text-stone-900">
            انتخاب از میان ساعت‌های خالی سالن
          </h1>
        </div>

        {onOpenProfile ? (
          <button
            type="button"
            onClick={() => {
              hapticLight();
              onOpenProfile();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white bg-white/80 shadow-2xs transition-transform active:scale-95"
            title="پروفایل کاربری"
          >
            <User className="h-4 w-4 text-stone-700" />
          </button>
        ) : (
          <div className="h-8 w-8" />
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 pb-36 pt-3" dir="rtl">
        {/* Notice for Expired Slot Click Attempt */}
        {expiredNoticeMessage && (
          <div className="mb-4 rounded-[22px] border border-amber-200 bg-amber-50/90 p-3.5 shadow-2xs backdrop-blur-xl animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-amber-200/80 p-2 text-amber-900">
                <AlertCircle className="h-4 w-4 shrink-0" />
              </div>
              <p className="text-xs font-bold text-amber-950">
                {expiredNoticeMessage}
              </p>
            </div>
          </div>
        )}

        {/* Notice if All Slots on Selected Day Are Expired */}
        {isDayAllExpired && (
          <div className="mb-4 clay-card rounded-[26px] p-4 border border-white">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-black text-stone-900">
                  ساعت کاری امروز به پایان رسیده است
                </h3>
                <p className="mt-1 text-[11px] leading-5 text-stone-600">
                  کلیه ساعات کاری نوبت‌دهی امروز سپری شده‌اند. می‌توانید نوبت خود را برای فردا یا روزهای آینده ثبت فرمایید.
                </p>
                {days.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      hapticSelection();
                      onSelectDay(days[1].dayNumber);
                    }}
                    className="mt-3 flex items-center gap-1.5 rounded-xl bg-[#22262e] hover:bg-[#1a1d23] text-white border border-white/10 px-3.5 py-2 text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <span>مشاهده تقویم فردا ({days[1].weekday}، {days[1].label})</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Taken Slot Notice & Gap-Calculated Closest Slot Banner ── */}
        {targetBookedTime && !isDayAllExpired && (
          <div className="mb-4 clay-card rounded-[26px] p-4 border border-white animate-fadeIn">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#fedecb]/60 text-[#6d3e26] flex items-center justify-center shrink-0 shadow-2xs">
                <Zap className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black text-stone-900">
                    {isTargetExpired
                      ? `ساعت ${toPersianDigits(targetBookedTime)} سپری شده است`
                      : `ساعت ${toPersianDigits(targetBookedTime)} قبلاً رزرو شده — گزینه‌های آزاد نزدیک:`}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                      isTargetExpired
                        ? 'bg-stone-200 text-stone-700'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {isTargetExpired ? 'منقضی شده' : 'تکمیل ظرفیت'}
                  </span>
                </div>

                {/* Quick-tap closest options */}
                {nearestResult?.nearest ? (
                  <div className="mt-2 space-y-1.5">
                    <p className="text-[10.5px] text-stone-600">
                      نزدیک‌ترین ساعت‌های خالی متناسب با مدت زمان خدمت شما ({toPersianDigits(totals.totalDuration)} دقیقه):
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {[nearestResult.nearest, ...(nearestResult.alternatives || [])].filter(Boolean).map((opt) => {
                        const isSelected = selectedTime === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              hapticSelection();
                              onSelectTime(opt);
                            }}
                            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                              isSelected
                                ? 'bg-gradient-to-b from-white to-[#f1f5f9] text-[#0f172a] border border-white shadow-xs font-black ring-1 ring-white/80'
                                : 'clay-card-subtle text-stone-900 border border-white hover:bg-white'
                            }`}
                          >
                            {isSelected ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#0f172a]" />
                            ) : (
                              <Clock className="h-3 w-3 text-stone-600" />
                            )}
                            <span>ساعت {toPersianDigits(opt)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="mt-1 text-[11px] text-stone-600">
                    برای این روز نوبت خالی دیگری در دسترس نیست؛ لطفاً روز دیگری را بررسی فرمایید.
                  </p>
                )}

                {/* Smart Waitlist Option */}
                {!isTargetExpired && (
                  <div className="mt-3 rounded-2xl border border-white bg-white/70 p-2.5 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-stone-800">
                        <Bell className="h-3.5 w-3.5 text-stone-700" />
                        <span>لیست انتظار ساعت {toPersianDigits(targetBookedTime)}:</span>
                      </div>
                      {waitlistedSlots[targetBookedTime] ? (
                        <span className="flex items-center gap-1 rounded-lg bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>عضویت در لیست انتظار ثبت شد</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleJoinWaitlist(targetBookedTime)}
                          className="flex items-center gap-1 rounded-xl bg-gradient-to-b from-white to-[#f1f5f9] hover:from-white hover:to-[#e2e8f0] text-[#0f172a] border border-white px-2.5 py-1 text-[10px] font-black shadow-2xs transition-all active:scale-95 cursor-pointer ring-1 ring-white/80"
                        >
                          <BellRing className="h-3 w-3 text-[#0f172a]" />
                          <span>در صورت کنسلی به من پیامک بده</span>
                        </button>
                      )}
                    </div>
                    {waitlistedSlots[targetBookedTime] && (
                      <p className="mt-1 text-[10px] text-emerald-800">
                        در صورت لغو نوبت یا باز شدن ظرفیت، فوراً پیامک اطلاع‌رسانی برای شما ارسال خواهد شد.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Success Banner when Chosen Time is Available ── */}
        {!targetBookedTime && selectedTime && currentSlotStatus?.isAvailable && (
          <div className="mb-4 clay-card rounded-[24px] border border-emerald-300/40 bg-emerald-50/70 p-3.5 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <CalendarCheck className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-emerald-950">
                  ساعت انتخابی ({toPersianDigits(selectedTime)}) با بازه زمانی {toPersianDigits(totals.totalDuration)} دقیقه کاملاً هماهنگ است و برای شما ثبت می‌شود.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Date Selector */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="flex items-center gap-1.5 text-xs font-black text-stone-800">
              <Calendar className="h-4 w-4 text-[#bf5938]" />
              تقویم روزهای سالن
            </h2>
            <span className="text-[11px] font-bold text-stone-700">
              {activeDay.weekday}، {activeDay.label}
            </span>
          </div>

          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2 pt-1">
            {days.map((d) => {
              const isSelected = d.dayNumber === selectedDay;
              return (
                <SpatialTilt
                  key={d.dayNumber}
                  as="button"
                  maxTilt={10}
                  glareOpacity={0.35}
                  scaleOnHover={1.03}
                  onClick={() => {
                    hapticSelection();
                    setTakenSlotAttempted(null);
                    onSelectDay(d.dayNumber);
                  }}
                  className={`flex min-w-[76px] shrink-0 flex-col items-center rounded-2xl p-2.5 transition-colors cursor-pointer ${
                    isSelected
                      ? 'apple-glass-active ring-2 ring-white shadow-md'
                      : 'apple-3d-tile text-stone-800'
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold ${
                      isSelected ? 'text-[#0f172a]' : 'text-stone-500'
                    }`}
                  >
                    {d.badge || d.weekday}
                  </span>
                  <span className={`mt-0.5 text-base font-black ${isSelected ? 'text-[#0f172a]' : 'text-stone-900'}`}>
                    {toPersianDigits(d.dayNumber)}
                  </span>
                  <span
                    className={`text-[9px] font-bold ${
                      isSelected ? 'text-stone-600' : 'text-stone-600'
                    }`}
                  >
                    {d.label.split(' ')[1] || ''}
                  </span>
                </SpatialTilt>
              );
            })}
          </div>
        </section>

        {/* Time Selection Header */}
        <section className="mt-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="flex items-center gap-1.5 text-xs font-black text-stone-800">
              <Clock className="h-4 w-4 text-[#bf5938]" />
              انتخاب ساعت نوبت (از {toPersianDigits(openTime)} تا {toPersianDigits(closeTime)})
            </h2>
            {selectedTime && currentSlotStatus?.isAvailable && (
              <span className="text-[11px] font-bold text-[#bf5938]">
                {toPersianDigits(selectedTime)} الی {toPersianDigits(endTime)}
              </span>
            )}
          </div>

          {/* Time Slot Groups */}
          <div className="space-y-3">
            {visibleSlots.length === 0 ? (
              <div className="rounded-2xl clay-card-subtle p-4 text-center">
                <Clock className="mx-auto h-6 w-6 text-stone-400 mb-1.5" />
                <p className="text-xs font-bold text-stone-800">
                  کلیه ساعات کاری نوبت‌دهی امروز سپری شده‌اند.
                </p>
                <p className="mt-1 text-[11px] text-stone-600 font-medium">
                  لطفاً روزهای آینده را از تقویم بالا انتخاب فرمایید.
                </p>
              </div>
            ) : (
              <>
                {/* Morning Slots */}
                {morningSlots.length > 0 && (
                  <div>
                    <span className="mb-1.5 block text-[10px] font-bold text-stone-600 px-1">
                      نوبت‌های صبح ({toPersianDigits(morningSlots[0]?.slot || openTime)} تا {toPersianDigits(morningSlots[morningSlots.length - 1]?.slot || '۱۲:۴۰')})
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {morningSlots.map(({ slot, isAvailable }) => {
                        const isSelected = selectedTime === slot;
                        const isNearest = highlightedNearestSlot === slot && isAvailable;
                        const isAttemptedTaken = takenSlotAttempted === slot && !isAvailable;

                        return (
                          <SpatialTilt
                            key={slot}
                            as="button"
                            maxTilt={12}
                            glareOpacity={0.4}
                            scaleOnHover={1.04}
                            disabled={!isAvailable}
                            onClick={() => handleSlotClick(slot, isAvailable, false)}
                            className={`relative flex h-[52px] flex-col items-center justify-center rounded-2xl text-center text-xs font-bold transition-colors cursor-pointer ${
                              isSelected && isAvailable
                                ? 'apple-glass-active ring-1 ring-white/40'
                                : isNearest
                                ? 'bg-[#fdf2ee] text-[#bf5938] border border-[#f3d0c4] shadow-xs'
                                : isAttemptedTaken
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : !isAvailable
                                ? 'bg-stone-100/70 text-stone-400 cursor-not-allowed border border-transparent shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] opacity-50'
                                : 'apple-3d-tile text-stone-800'
                            }`}
                          >
                            <span className={`text-[15px] font-bold font-mono ${!isAvailable ? 'line-through opacity-60' : ''}`}>
                              {slot}
                            </span>
                            {!isAvailable ? (
                              <span className="mt-0.5 text-[8px] font-medium text-rose-500">رزرو شده</span>
                            ) : isNearest && !isSelected ? (
                              <span className="mt-0.5 text-[8px] font-extrabold text-[#bf5938]">نزدیک‌ترین</span>
                            ) : null}
                          </SpatialTilt>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Afternoon Slots */}
                {afternoonSlots.length > 0 && (
                  <div>
                    <span className="mb-1.5 block text-[10px] font-bold text-stone-600 px-1">
                      نوبت‌های بعدازظهر ({toPersianDigits(afternoonSlots[0]?.slot || '۱۳:۰۰')} تا {toPersianDigits(afternoonSlots[afternoonSlots.length - 1]?.slot || '۱۶:۴۰')})
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {afternoonSlots.map(({ slot, isAvailable }) => {
                        const isSelected = selectedTime === slot;
                        const isNearest = highlightedNearestSlot === slot && isAvailable;
                        const isAttemptedTaken = takenSlotAttempted === slot && !isAvailable;

                        return (
                          <SpatialTilt
                            key={slot}
                            as="button"
                            maxTilt={12}
                            glareOpacity={0.4}
                            scaleOnHover={1.04}
                            disabled={!isAvailable}
                            onClick={() => handleSlotClick(slot, isAvailable, false)}
                            className={`relative flex h-[52px] flex-col items-center justify-center rounded-2xl text-center text-xs font-bold transition-colors cursor-pointer ${
                              isSelected && isAvailable
                                ? 'apple-glass-active ring-1 ring-white/40'
                                : isNearest
                                ? 'bg-[#fdf2ee] text-[#bf5938] border border-[#f3d0c4] shadow-xs'
                                : isAttemptedTaken
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : !isAvailable
                                ? 'bg-stone-100/70 text-stone-400 cursor-not-allowed border border-transparent shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] opacity-50'
                                : 'apple-3d-tile text-stone-800'
                            }`}
                          >
                            <span className={`text-[15px] font-bold font-mono ${!isAvailable ? 'line-through opacity-60' : ''}`}>
                              {slot}
                            </span>
                            {!isAvailable ? (
                              <span className="mt-0.5 text-[8px] font-medium text-rose-500">رزرو شده</span>
                            ) : isNearest && !isSelected ? (
                              <span className="mt-0.5 text-[8px] font-extrabold text-[#bf5938]">نزدیک‌ترین</span>
                            ) : null}
                          </SpatialTilt>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Evening Slots */}
                {eveningSlots.length > 0 && (
                  <div>
                    <span className="mb-1.5 block text-[10px] font-bold text-stone-600 px-1">
                      نوبت‌های عصر و شب ({toPersianDigits(eveningSlots[0]?.slot || '۱۷:۰۰')} تا {toPersianDigits(eveningSlots[eveningSlots.length - 1]?.slot || closeTime)})
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {eveningSlots.map(({ slot, isAvailable }) => {
                        const isSelected = selectedTime === slot;
                        const isNearest = highlightedNearestSlot === slot && isAvailable;
                        const isAttemptedTaken = (targetBookedTime === slot || takenSlotAttempted === slot) && !isAvailable;

                        return (
                          <SpatialTilt
                            key={slot}
                            as="button"
                            maxTilt={12}
                            glareOpacity={0.4}
                            scaleOnHover={1.04}
                            disabled={!isAvailable}
                            onClick={() => handleSlotClick(slot, isAvailable, false)}
                            className={`relative flex h-[52px] flex-col items-center justify-center rounded-2xl text-center text-xs font-bold transition-colors cursor-pointer ${
                              isSelected && isAvailable
                                ? 'apple-glass-active ring-1 ring-white/40'
                                : isNearest
                                ? 'bg-[#fdf2ee] text-[#bf5938] border border-[#f3d0c4] shadow-xs'
                                : isAttemptedTaken
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : !isAvailable
                                ? 'bg-stone-100/70 text-stone-400 cursor-not-allowed border border-transparent shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] opacity-50'
                                : 'apple-3d-tile text-stone-800'
                            }`}
                          >
                            <span className={`text-[15px] font-bold font-mono ${!isAvailable ? 'line-through opacity-60' : ''}`}>
                              {slot}
                            </span>
                            {!isAvailable ? (
                              <span className="mt-0.5 text-[8px] font-medium text-rose-500">رزرو شده</span>
                            ) : isNearest && !isSelected ? (
                              <span className="mt-0.5 text-[8px] font-extrabold text-[#bf5938]">نزدیک‌ترین</span>
                            ) : null}
                          </SpatialTilt>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      {/* Floating Live Price Summary */}
      <PriceSummary
        service={service}
        accoutrements={accoutrements}
        ctaLabel="تأیید زمان و رفتن به پرداخت"
        onCta={onContinueToCheckout}
        ctaDisabled={!selectedTime || !currentSlotStatus?.isAvailable || isSlotExpired(selectedDay, selectedTime)}
        disabledHint={
          !selectedTime
            ? 'لطفاً ساعت نوبت را انتخاب کنید'
            : isSlotExpired(selectedDay, selectedTime)
            ? 'ساعت انتخابی سپری شده است؛ لطفاً ساعت آینده را انتخاب نمایید'
            : !currentSlotStatus?.isAvailable
            ? 'ساعت انتخابی تکمیل است؛ لطفاً یکی از ساعت‌های خالی را انتخاب کنید'
            : undefined
        }
      />
    </AtelierShell>
  );
};
