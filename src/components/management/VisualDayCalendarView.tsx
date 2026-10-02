import React, { useMemo, useRef, useEffect } from 'react';
import { Appointment, Chair } from '../../types';
import { 
  Clock, 
  User, 
  Scissors, 
  Play, 
  CheckCircle2, 
  Coffee, 
  VolumeX, 
  ShieldCheck,
  CalendarDays,
  RefreshCw
} from 'lucide-react';
import { addMinutesToTime, getCurrentSolarDateInfo } from '../../utils/dateUtils';
import { formatPrice } from '../../utils/formatUtils';
import { getAppointmentStatusBadge, getBookingSourceLabel } from '../../utils/statusUtils';
import { useAtelier } from '../../store/AtelierContext';
import { useLiveClock } from '../../hooks/useLiveClock';

interface VisualDayCalendarViewProps {
  dayNumber: number;
  dateString: string;
  appointments: Appointment[];
  activeChair: Chair;
  onSelectAppointment: (appointment: Appointment) => void;
  onRescheduleAppointment?: (appointment: Appointment) => void;
}

// Operating Hours configuration for the visual grid
const START_HOUR = 9; // 09:00
const END_HOUR = 22; // 22:00
const TOTAL_HOURS = END_HOUR - START_HOUR + 1; // 14 hours total
const HOUR_HEIGHT_PX = 72; // Height in px per hour slot

export const VisualDayCalendarView: React.FC<VisualDayCalendarViewProps> = ({
  dayNumber,
  dateString,
  appointments,
  activeChair,
  onSelectAppointment,
}) => {
  const { startAppointment, completeAppointment, refreshDatabaseData, lastRefreshTime, isRefreshing } = useAtelier();
  const liveClock = useLiveClock(10000);
  const containerRef = useRef<HTMLDivElement>(null);

  const todayInfo = useMemo(() => getCurrentSolarDateInfo(), []);
  const isToday = dayNumber === todayInfo.dayNumber;

  // Format digital current time string in English (HH:MM)
  const currentNowString = useMemo(() => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  }, [liveClock]);

  // Calculate current time position in minutes from START_HOUR
  const currentTimeMinutes = useMemo(() => {
    if (!isToday) return null;
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    if (hours < START_HOUR || hours > END_HOUR) return null;
    return (hours - START_HOUR) * 60 + minutes;
  }, [isToday, liveClock]);

  // Generate hourly time marks in English (09:00, 10:00, ..., 22:00)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) {
      slots.push({
        hour: h,
        label: `${h.toString().padStart(2, '0')}:00`,
      });
    }
    return slots;
  }, []);

  // Helper to convert "HH:MM" string to minutes from START_HOUR
  const timeToMinutesFromStart = (timeStr: string) => {
    if (!timeStr || !timeStr.includes(':')) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    const totalMins = (h - START_HOUR) * 60 + (m || 0);
    return Math.max(0, totalMins);
  };

  // Filter out cancelled appointments - visual calendar shows only active slots
  const activeAppointments = useMemo(() => {
    return appointments.filter((a) => a.status !== 'cancelled');
  }, [appointments]);

  // Layout algorithm: Calculate overlapping columns for simultaneous / close events
  const laidOutAppointments = useMemo(() => {
    // Sort appointments chronologically
    const sorted = [...activeAppointments].sort((a, b) => {
      const diff = a.startTime.localeCompare(b.startTime);
      if (diff !== 0) return diff;
      return (b.durationMinutes || 45) - (a.durationMinutes || 45);
    });

    // Compute start and end minutes
    const mapped = sorted.map((apt) => {
      const startMin = timeToMinutesFromStart(apt.startTime);
      const duration = apt.durationMinutes || 45;
      const endMin = startMin + duration;
      const computedEndTime = apt.endTime || addMinutesToTime(apt.startTime, duration);
      return {
        apt,
        startMin,
        duration,
        endMin,
        computedEndTime,
        colIndex: 0,
        totalCols: 1,
      };
    });

    // Check overlaps and assign columns
    for (let i = 0; i < mapped.length; i++) {
      const current = mapped[i];
      const overlapping = mapped.filter(
        (other, j) =>
          i !== j &&
          Math.max(current.startMin, other.startMin) < Math.min(current.endMin, other.endMin)
      );

      if (overlapping.length > 0) {
        const group = [current, ...overlapping].sort((a, b) => a.startMin - b.startMin);
        const groupCols = Math.min(group.length, 3);
        group.forEach((item, idx) => {
          item.colIndex = idx % groupCols;
          item.totalCols = groupCols;
        });
      }
    }

    return mapped;
  }, [activeAppointments]);

  // Statistics & Capacity with English numbers
  const stats = useMemo(() => {
    const totalWorkingMinutes = (END_HOUR - START_HOUR + 1) * 60;
    const bookedMinutes = activeAppointments.reduce(
      (sum, a) => sum + (a.durationMinutes || 45),
      0
    );
    const capacityPercent = Math.min(100, Math.round((bookedMinutes / totalWorkingMinutes) * 100));

    const inProgressCount = activeAppointments.filter((a) => a.status === 'in_progress').length;
    const completedCount = activeAppointments.filter((a) => a.status === 'completed').length;
    const confirmedCount = activeAppointments.filter((a) => a.status === 'confirmed' || a.status === 'reserved').length;
    const blockedCount = activeAppointments.filter((a) => a.status === 'blocked').length;

    return {
      bookedMinutes,
      bookedHours: (bookedMinutes / 60).toFixed(1),
      capacityPercent,
      inProgressCount,
      completedCount,
      confirmedCount,
      blockedCount,
      totalCount: activeAppointments.length,
    };
  }, [activeAppointments]);

  // Auto-scroll near current time on load
  useEffect(() => {
    if (isToday && currentTimeMinutes !== null && containerRef.current) {
      const scrollPos = (currentTimeMinutes / 60) * HOUR_HEIGHT_PX - 120;
      containerRef.current.scrollTop = Math.max(0, scrollPos);
    }
  }, [isToday]);

  return (
    <div className="space-y-3 w-full select-none font-sans" dir="rtl">
      {/* 1. Header Capacity & Stats Bar (English Numbers & Modern Glass) */}
      <div className="bg-gradient-to-r from-white/95 via-white/90 to-[#fbf9fc]/90 backdrop-blur-md rounded-2xl p-3.5 border border-white/95 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <span className="text-xs font-bold text-stone-900 font-mono tracking-tight">
                {stats.bookedHours}h Booked ({stats.capacityPercent}% Capacity)
              </span>
              <span className="text-[10px] text-stone-500 block font-normal">
                برنامه کاری روزانه صندلی {activeChair.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* 5-Min Auto-Sync Indicator & Manual Refresh */}
            <button
              type="button"
              onClick={() => refreshDatabaseData()}
              disabled={isRefreshing}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition-all cursor-pointer border shadow-2xs ${
                isRefreshing
                  ? 'bg-purple-50 text-[#4e3b6e] border-purple-200 animate-pulse'
                  : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200/80 hover:border-stone-300'
              }`}
              title="Auto-refreshes every 5 mins. Click to refresh now."
            >
              <RefreshCw className={`w-3 h-3 text-[#4e3b6e] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Auto-sync 5m'}</span>
            </button>

            <span className="w-[60px] text-center inline-flex items-center justify-center px-2.5 py-1 rounded-xl bg-stone-900 text-white font-mono text-[11px] font-bold shadow-xs">
              {stats.totalCount} {stats.totalCount === 1 ? 'Slot' : 'Slots'}
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden flex">
          <div 
            className="h-full bg-gradient-to-r from-[#4e3b6e] via-[#6d4c82] to-[#c7867f] rounded-full transition-all duration-500 shadow-xs"
            style={{ width: `${stats.capacityPercent}%` }}
          />
        </div>

        {/* Badges Breakdown */}
        <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-stone-100/80 text-[10px] text-stone-600 flex-wrap">
          {stats.inProgressCount > 0 && (
            <span className="inline-flex items-center gap-1.5 bg-amber-100/90 text-amber-950 px-2 py-0.5 rounded-lg font-mono font-bold border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              <span>{stats.inProgressCount} In Progress</span>
            </span>
          )}
          <span className="bg-purple-50 text-[#4e3b6e] px-2 py-0.5 rounded-lg font-mono font-bold border border-purple-100">
            {stats.confirmedCount} Confirmed
          </span>
          <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-lg font-mono font-bold border border-emerald-100">
            {stats.completedCount} Completed
          </span>
          {stats.blockedCount > 0 && (
            <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded-lg font-mono font-bold border border-stone-200">
              {stats.blockedCount} Break
            </span>
          )}
        </div>
      </div>

      {/* 2. Visual Time Grid Canvas (Clean Timeline Schedule) */}
      <div 
        ref={containerRef}
        className="relative bg-white/95 backdrop-blur-md rounded-3xl border border-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-y-auto max-h-[580px] custom-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div 
          className="relative min-h-[1008px] w-full"
          style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT_PX}px` }}
        >
          {/* Background Hour Rows & Guide Lines */}
          {timeSlots.map((slot, index) => {
            const topPx = index * HOUR_HEIGHT_PX;
            return (
              <div
                key={slot.hour}
                className="absolute w-full border-t border-stone-200/50 flex items-start pointer-events-none"
                style={{ top: `${topPx}px`, height: `${HOUR_HEIGHT_PX}px` }}
              >
                {/* Time Gutter Column with English Numbers */}
                <div className="w-14 shrink-0 -mt-2.5 pr-2.5 text-right select-none">
                  <span className="text-[11px] font-mono font-bold text-stone-500 bg-white/90 px-1 py-0.5 rounded tracking-tight">
                    {slot.label}
                  </span>
                </div>

                {/* Grid Hour Track & 30-min Sub-division */}
                <div className="flex-1 h-full border-r border-stone-200/40 relative">
                  {/* Subtle 30-min midline */}
                  <div className="absolute top-1/2 w-full border-b border-dashed border-stone-100" />
                </div>
              </div>
            );
          })}

          {/* Real-time "NOW" Red Line indicator (for Today) */}
          {isToday && currentTimeMinutes !== null && (
            <div
              className="absolute left-0 right-0 z-20 flex items-center pointer-events-none transition-all duration-1000"
              style={{
                top: `${(currentTimeMinutes / 60) * HOUR_HEIGHT_PX}px`,
              }}
            >
              <div className="w-14 shrink-0 flex items-center justify-end pl-1.5">
                <span className="text-[9px] font-mono font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded-md shadow-xs tracking-tight">
                  {currentNowString}
                </span>
              </div>
              <div className="flex-1 h-[2px] bg-rose-500 shadow-xs relative">
                <span className="absolute right-0 -top-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
              </div>
            </div>
          )}

          {/* 3. Appointment Event Blocks (Stylized Visual Cards) */}
          {laidOutAppointments.map(({ apt, startMin, duration, endMin, computedEndTime, colIndex, totalCols }) => {
            const topPx = (startMin / 60) * HOUR_HEIGHT_PX;
            const heightPx = Math.max(42, (duration / 60) * HOUR_HEIGHT_PX - 4);

            const isInProgress = apt.status === 'in_progress';
            const isCompleted = apt.status === 'completed';
            const isBlocked = apt.status === 'blocked';
            const isCancelled = apt.status === 'cancelled';
            const statusBadge = getAppointmentStatusBadge(apt.status);
            const sourceBadge = getBookingSourceLabel(apt.bookingSource);

            // Responsive Column Widths for overlaps
            const colWidthPercent = 100 / totalCols;
            const leftOffsetPercent = colIndex * colWidthPercent;

            const formattedPriceEng = apt.priceSummary?.total 
              ? `${apt.priceSummary.total.toLocaleString()} T`
              : apt.totalAmount
              ? `${apt.totalAmount.toLocaleString()} T`
              : apt.servicePrice
              ? `${apt.servicePrice.toLocaleString()} T`
              : '0 T';

            return (
              <div
                key={apt.id}
                onClick={() => onSelectAppointment(apt)}
                className={`absolute z-10 rounded-2xl p-2.5 transition-all duration-200 cursor-pointer overflow-hidden border shadow-xs hover:shadow-md hover:z-30 hover:scale-[1.01] ${
                  isInProgress
                    ? 'bg-stone-950 text-white border-amber-400/80 ring-2 ring-amber-400/40 shadow-lg'
                    : isCompleted
                    ? 'bg-emerald-50/90 text-emerald-950 border-emerald-300/80'
                    : isBlocked
                    ? 'bg-stone-100 text-stone-700 border-dashed border-stone-300'
                    : isCancelled
                    ? 'bg-rose-50 text-rose-800 border-rose-200 opacity-60'
                    : 'bg-white text-stone-900 border-[#4e3b6e]/25 shadow-2xs hover:border-[#4e3b6e]'
                }`}
                style={{
                  top: `${topPx}px`,
                  height: `${heightPx}px`,
                  right: `calc(3.5rem + ${leftOffsetPercent}%)`,
                  width: `calc(${colWidthPercent}% - 3.8rem)`,
                }}
              >
                {/* Event Inner Layout */}
                <div className="flex flex-col justify-between h-full min-w-0">
                  {/* Top Bar: Time Range, Client Name, Badges */}
                  <div className="flex items-start justify-between gap-1.5 min-w-0">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isBlocked ? (
                          <Coffee className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                        ) : (
                          <div className={`w-2 h-2 rounded-full shrink-0 ${
                            isInProgress ? 'bg-amber-400 animate-ping' : isCompleted ? 'bg-emerald-500' : 'bg-[#4e3b6e]'
                          }`} />
                        )}

                        <span className={`text-xs font-black truncate ${
                          isInProgress ? 'text-white' : 'text-stone-900'
                        }`}>
                          {apt.customerName || (isBlocked ? 'استراحت پرسنلی' : 'مراجع')}
                        </span>

                        {apt.isQuietSession && (
                          <span className="text-[8px] font-mono bg-[#fbdcd9] text-[#7e5352] px-1.5 py-0.2 rounded font-bold shrink-0">
                            Quiet
                          </span>
                        )}
                      </div>

                      {/* Service Name */}
                      <p className={`text-[10px] font-medium truncate mt-0.5 ${
                        isInProgress ? 'text-stone-300' : 'text-stone-600'
                      }`}>
                        {apt.service?.name || (isBlocked ? 'بازه زمانی مسدود' : 'خدمت آرایشگاه')}
                      </p>
                    </div>

                    {/* Time Range Capsule Badge in English Numbers */}
                    <div className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold shrink-0 text-left tracking-tight ${
                      isInProgress 
                        ? 'bg-amber-400 text-stone-950' 
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : isBlocked
                        ? 'bg-stone-200 text-stone-700'
                        : 'bg-purple-100/90 text-[#4e3b6e]'
                    }`}>
                      {apt.startTime} - {computedEndTime}
                    </div>
                  </div>

                  {/* Bottom details (if slot height allows) */}
                  {heightPx >= 52 && (
                    <div className={`flex items-center justify-between pt-1 border-t text-[9px] font-mono mt-auto ${
                      isInProgress ? 'border-stone-800/80 text-stone-400' : 'border-stone-100 text-stone-500'
                    }`}>
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-semibold">{duration}m</span>
                        <span>•</span>
                        <span className={`font-bold ${isInProgress ? 'text-stone-200' : 'text-stone-800'}`}>
                          {formattedPriceEng}
                        </span>
                      </div>

                      {/* Action trigger button */}
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {isInProgress ? (
                          <button
                            type="button"
                            onClick={() => completeAppointment(apt.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold text-[9px] flex items-center gap-0.5 shadow-2xs cursor-pointer"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Complete</span>
                          </button>
                        ) : (apt.status === 'confirmed' || apt.status === 'reserved') ? (
                          <button
                            type="button"
                            onClick={() => startAppointment(apt.id)}
                            className="bg-stone-900 hover:bg-stone-800 text-white px-2 py-0.5 rounded-full font-bold text-[9px] flex items-center gap-0.5 shadow-2xs cursor-pointer"
                          >
                            <Play className="w-2 h-2 fill-current" />
                            <span>Start</span>
                          </button>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
