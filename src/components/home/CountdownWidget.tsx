import React, { useState, useEffect, useMemo } from 'react';
import { BellRing, Scissors, QrCode } from 'lucide-react';
import countdownBgImage from '../../assets/images/countdown_bg_texture_1789931258000.jpg';
import { Appointment, ClientProfile } from '../../types';
import { useReservationCountdownNotification } from '../../hooks/useReservationCountdownNotification';
import { getCurrentSolarDateInfo } from '../../utils/dateUtils';
import { useAtelier } from '../../store/AtelierContext';

interface CountdownWidgetProps {
  upcomingAppointment: Appointment | null;
  currentCustomer: ClientProfile;
  onBookClick: () => void;
  onPassClick: (apt: Appointment) => void;
  onZeroReached?: (apt: Appointment) => void;
}

export const CountdownWidget: React.FC<CountdownWidgetProps> = ({
  upcomingAppointment,
  currentCustomer,
  onBookClick,
  onPassClick,
  onZeroReached,
}) => {
  const { studio, settings } = useAtelier();

  // Self-contained ticking interval for routine countdown fallback (only re-renders this tiny component)
  const [, setClockTicks] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setClockTicks((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const {
    timeRemaining: reservationCountdown,
    permissionStatus: browserNotifPermission,
    requestBrowserPermission,
  } = useReservationCountdownNotification({
    appointment: upcomingAppointment,
    customerName: currentCustomer.name,
    enabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    browserNotificationsEnabled: true,
    onActionClick: (apt) => onPassClick(apt),
    onZeroReached: (apt) => onZeroReached?.(apt),
  });

  const hasCustomRoutine = useMemo(() => {
    return Boolean(
      currentCustomer && (
        (currentCustomer.routineDays && currentCustomer.routineDays > 0) ||
        (currentCustomer.routineCadence && currentCustomer.routineCadence.trim() !== '') ||
        (currentCustomer.nextRoutineDayNumber && currentCustomer.nextRoutineDayNumber > 0) ||
        (currentCustomer.nextRoutineTargetDate && currentCustomer.nextRoutineTargetDate.trim() !== '') ||
        (currentCustomer.cadence && currentCustomer.cadence.trim() !== '') ||
        (currentCustomer.lastCutDayNumber && currentCustomer.lastCutDayNumber > 0)
      )
    );
  }, [currentCustomer]);

  // When client has no reserved time and no suggestion from barber, the widget itself is a button
  const isWidgetButton = !upcomingAppointment && !hasCustomRoutine;

  const countdownData = useMemo(() => {
    if (upcomingAppointment) {
      const state = reservationCountdown.state;
      const stateTag = reservationCountdown.stateLabel;
      const isPast = state === 'past_due';

      let dynamicLabel = reservationCountdown.label;
      if (state === 'happening_now') {
        dynamicLabel = 'نوبت در حال برگزاری';
      } else if (state === 'almost_time') {
        dynamicLabel = 'موعد بسیار نزدیک است';
      } else if (state === 'past_due') {
        dynamicLabel = 'موعد نوبت سپری شده است';
      } else {
        dynamicLabel = 'نوبت رزرو شده پیش‌رو';
      }

      return {
        hours: reservationCountdown.hours,
        minutes: reservationCountdown.minutes,
        seconds: reservationCountdown.seconds,
        days: reservationCountdown.days,
        label: dynamicLabel,
        stateTag,
        stateType: state,
        sublabel: `${upcomingAppointment.service?.name || 'سرویس اصلاح'} · ${upcomingAppointment.date || 'امروز'} ساعت ${upcomingAppointment.startTime}`,
        isReady: reservationCountdown.isZero,
        isRoutine: false,
        isNegative: isPast,
        displayText: null,
      };
    } else {
      if (!hasCustomRoutine) {
        const shopName = studio?.name || settings?.profile?.name || 'آرایشگاه رویال';
        const shopArea = studio?.neighborhood || settings?.profile?.neighborhood;
        const formattedSublabel = shopArea ? `${shopName} · ${shopArea}` : shopName;

        return {
          hours: '00',
          minutes: '00',
          seconds: '00',
          days: 0,
          label: 'رزرو آنلاین نوبت',
          stateTag: 'آماده پذیرش',
          stateType: 'upcoming' as const,
          sublabel: formattedSublabel,
          isRoutine: true,
          isReady: true,
          isNegative: false,
          displayText: 'رزرو آنلاین',
        };
      }

      const { dayNumber: currentDay } = getCurrentSolarDateInfo();
      const targetRoutineDay =
        currentCustomer.nextRoutineDayNumber ??
        ((currentCustomer.lastCutDayNumber || 8) + (currentCustomer.routineDays || 14));

      const diffDays = targetRoutineDay - currentDay;

      if (diffDays <= 0) {
        return {
          hours: '00',
          minutes: '00',
          seconds: '00',
          days: 0,
          label: 'موعد آیین پیرایش',
          stateTag: 'موعد اصلاح',
          stateType: 'almost_time' as const,
          sublabel: 'موعد پیشنهاد شده طبق دوره پیرایش شما فرا رسیده است.',
          isRoutine: true,
          isReady: true,
          isNegative: true,
          displayText: 'امروز',
        };
      }

      return {
        hours: '00',
        minutes: '00',
        seconds: '00',
        days: diffDays,
        label: 'موعد پیشنهادی بعدی',
        stateTag: 'دوره پیرایش',
        stateType: 'upcoming' as const,
        sublabel: `${diffDays} روز تا پایان دوره ایده‌آل اصلاح شما`,
        isRoutine: true,
        isReady: false,
        isNegative: false,
        displayText: `${diffDays} روز`,
      };
    }
  }, [upcomingAppointment, reservationCountdown, currentCustomer, hasCustomRoutine]);

  // Digital digits structured list for DRY rendering
  const timeUnits = useMemo(() => [
    { label: 'ساعت', value: countdownData.hours, key: 'hrs' },
    { label: 'دقیقه', value: countdownData.minutes, key: 'mins' },
    { label: 'ثانیه', value: countdownData.seconds, key: 'secs', isAccent: true },
  ], [countdownData.hours, countdownData.minutes, countdownData.seconds]);

  const WidgetContainer = isWidgetButton ? 'button' : 'div';

  return (
    <div className="space-y-2.5">
      {/* ─── LIVE CHRONOMETER COUNTDOWN BAR (Brand Dark Theme with Deep Shadows) ─── */}
      <WidgetContainer
        id="home-unified-countdown-widget"
        type={isWidgetButton ? 'button' : undefined}
        onClick={isWidgetButton ? onBookClick : undefined}
        aria-label={isWidgetButton ? 'رزرو نوبت جدید آرایشگاه' : undefined}
        className={`relative w-full overflow-hidden transition-all duration-700 ease-in-out rounded-[22px] p-3.5 sm:p-4 flex items-center justify-between border select-none text-right shadow-[0_24px_50px_-8px_rgba(11,17,30,0.7),0_10px_24px_-4px_rgba(11,17,30,0.45),0_1px_0_1px_rgba(255,255,255,0.12)_inset] ${
          countdownData.isNegative
            ? 'bg-gradient-to-r from-[#3b0d18] via-[#541426] to-[#3b0d18] text-white border-rose-400/40 ring-1 ring-rose-400/30'
            : isWidgetButton
            ? 'bg-gradient-to-r from-[#0b111e] via-[#0f172a] to-[#1e293b] text-white border-[#bf5938]/35 ring-1 ring-[#bf5938]/25 hover:border-[#bf5938]/60 cursor-pointer active:scale-[0.985] group'
            : 'bg-gradient-to-r from-[#0b111e] via-[#0f172a] to-[#1e293b] text-white border-[#bf5938]/30 ring-1 ring-[#bf5938]/20'
        }`}
      >
        {/* Background Texture Image (Hidden when rendered as button) */}
        {!isWidgetButton && (
          <img
            src={countdownBgImage}
            alt="بافت پس‌زمینه نوبت"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity pointer-events-none rounded-[22px] z-0"
          />
        )}

        {/* Metallic Shimmer Ambient Light Layer */}
        {!isWidgetButton && (
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none overflow-hidden rounded-[22px] z-0"
          >
            <div
              className={`absolute -top-1/2 -bottom-1/2 w-3/4 animate-metallic-shimmer ${
                countdownData.isNegative
                  ? 'bg-gradient-to-r from-transparent via-rose-200/20 to-transparent'
                  : 'bg-gradient-to-r from-transparent via-[#bf5938]/15 to-transparent'
              }`}
            />
          </div>
        )}

        <div className="flex items-center min-w-0 pr-1 relative z-10">
          <div className="text-right min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              {!countdownData.isRoutine && browserNotifPermission === 'default' && (
                <button
                  type="button"
                  onClick={() => requestBrowserPermission()}
                  className="px-2 py-0.5 rounded-full bg-white/15 hover:bg-white/25 text-[9px] text-emerald-200 font-bold flex items-center gap-1 border border-emerald-400/40 transition-colors shadow-2xs cursor-pointer"
                  title="فعال‌سازی اعلان مرورگر برای لحظه موعد"
                >
                  <BellRing className="w-3 h-3 text-emerald-300" />
                  <span>فعال‌سازی اعلان</span>
                </button>
              )}
            </div>
            <span
              className={`text-[12px] font-bold font-sans text-right block truncate pt-[2px] pb-0 leading-[16px] transition-colors duration-700 ease-out ${
                countdownData.isNegative ? 'text-rose-100/90' : 'text-[#fedecb]'
              }`}
            >
              {countdownData.sublabel}
            </span>
          </div>
        </div>

        {/* Right-side Countdown Widget */}
        {countdownData.isRoutine ? (
          <div className="flex items-center shrink-0 mr-1 relative z-10" dir="ltr">
            <div
              className={`px-3.5 py-1.5 rounded-xl border font-mono font-black tracking-wide tabular-nums shadow-sm flex items-center gap-1.5 text-sm sm:text-base whitespace-nowrap transition-all duration-700 ease-out ${
                isWidgetButton
                  ? 'bg-[#bf5938] hover:bg-[#a34426] text-white border-[#f3d0c4]/40 ring-1 ring-white/20 shadow-md group-hover:scale-105'
                  : countdownData.isNegative
                  ? 'bg-rose-600/40 border-rose-400 text-white shadow-rose-950/40 animate-ruby-glow ring-2 ring-rose-400/50'
                  : 'bg-[#1e293b]/90 border-[#bf5938]/40 text-[#fedecb] ring-1 ring-[#bf5938]/20 shadow-xs'
              }`}
            >
              <span
                className={`transition-all duration-700 ease-out inline-block ${
                  isWidgetButton
                    ? 'text-white'
                    : countdownData.isNegative
                    ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]'
                    : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]'
                }`}
              >
                {countdownData.displayText}
              </span>
              {isWidgetButton && <Scissors className="w-3.5 h-3.5 text-white" />}
            </div>
          </div>
        ) : (
          /* Digital Countdown Digits (Hours : Mins : Secs) — DRY mapped */
          <div className="flex items-center gap-1.5 shrink-0 mr-1 relative z-10" dir="ltr">
            {countdownData.days > 0 && (
              <>
                <div
                  className={`flex flex-col items-center px-2 py-1 rounded-xl border shadow-sm transition-all duration-700 ease-out ${
                    countdownData.isNegative
                      ? 'bg-rose-600/30 border-rose-400/60 text-white'
                      : 'bg-[#1e293b]/90 border-[#bf5938]/30 text-white'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-black font-mono tabular-nums">
                    {countdownData.days}d
                  </span>
                </div>
                <span className="text-white/60 text-xs font-bold">:</span>
              </>
            )}

            {timeUnits.map((unit, index) => (
              <React.Fragment key={unit.key}>
                {index > 0 && (
                  <span
                    className={`text-xs font-bold transition-colors duration-700 ease-out ${
                      countdownData.isNegative ? 'text-rose-300' : 'text-[#fedecb]'
                    }`}
                  >
                    :
                  </span>
                )}
                <div
                  className={`flex flex-col items-center px-2 py-1 rounded-xl border min-w-[32px] shadow-sm transition-all duration-700 ease-out ${
                    countdownData.isNegative
                      ? unit.isAccent
                        ? 'bg-rose-600/50 border-rose-300 text-white animate-ruby-glow ring-1 ring-rose-400/60'
                        : 'bg-rose-600/30 border-rose-400/60 text-white'
                      : unit.isAccent
                      ? 'bg-[#bf5938]/40 border-[#bf5938]/60 text-[#fedecb] ring-1 ring-[#bf5938]/30'
                      : 'bg-[#1e293b]/90 border-white/15 text-white'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-black font-mono tabular-nums transition-colors duration-700 ease-out">
                    {unit.value}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
      </WidgetContainer>
    </div>
  );
};

