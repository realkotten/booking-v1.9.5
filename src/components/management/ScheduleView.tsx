import React, { useState, useMemo } from 'react';
import { useAtelier } from '../../store/AtelierContext';
import { Appointment, ClientProfile } from '../../types';
import { 
  Calendar as CalendarIcon, 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  User, 
  Plus, 
  Play, 
  CheckCircle2, 
  Coffee, 
  ShieldAlert, 
  CalendarClock, 
  Filter, 
  Sparkles, 
  CalendarPlus, 
  UserPlus, 
  Ban,
  Scissors,
  Armchair,
  LayoutGrid,
  Columns3,
  ListFilter,
  RefreshCw
} from 'lucide-react';
import { 
  toPersianDigits, 
  getScheduleWeekDays, 
  getPersianDateForDay, 
  getCurrentSolarDateInfo,
  ATELIER_ACTIVE_MONTH,
  formatTimeSpan
} from '../../utils/dateUtils';
import { getAvailableTimeSlots } from '../../utils/appointmentUtils';
import { getAppointmentStatusBadge, getBookingSourceLabel } from '../../utils/statusUtils';
import { formatPrice } from '../../utils/formatUtils';
import { AppointmentDetailsModal } from './AppointmentDetailsModal';
import { WalkInModal } from './WalkInModal';
import { BlockBreakModal } from './BlockBreakModal';
import { QuickBookingModal } from './QuickBookingModal';
import { RescheduleModal } from './RescheduleModal';
import { QuickContactButtons } from './QuickContactButtons';
import { VisualDayCalendarView } from './VisualDayCalendarView';
import { VisualMultiDayCalendarView } from './VisualMultiDayCalendarView';

interface ScheduleViewProps {
  onOpenDossier?: (customerId?: string) => void;
}

type ScheduleFilter = 'all' | 'online' | 'walk_in';
type ScheduleViewMode = 'calendar' | 'multiday' | 'agenda';

export const ScheduleView: React.FC<ScheduleViewProps> = ({ onOpenDossier }) => {
  const { 
    appointments, 
    activeChair, 
    customers, 
    startAppointment, 
    completeAppointment,
    refreshDatabaseData,
    isRefreshing
  } = useAtelier();

  // Dynamic real-time today
  const todaySolar = useMemo(() => getCurrentSolarDateInfo(), []);

  // Selected date state (defaults to real-time Today)
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(() => todaySolar.dayNumber);
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<ScheduleFilter>('all');
  const [viewMode, setViewMode] = useState<ScheduleViewMode>('calendar');

  // Modals state
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showWalkInModal, setShowWalkInModal] = useState<boolean>(false);
  const [showBlockModal, setShowBlockModal] = useState<boolean>(false);
  const [showQuickBookingModal, setShowQuickBookingModal] = useState<boolean>(false);
  const [quickBookingStartTime, setQuickBookingStartTime] = useState<string>('15:30');
  const [quickBookingDate, setQuickBookingDate] = useState<string>('');
  const [rescheduleTargetApt, setRescheduleTargetApt] = useState<Appointment | null>(null);

  // 7-day week strip for current offset
  const weekDays = useMemo(() => getScheduleWeekDays(weekOffset), [weekOffset]);
  const selectedDayInfo = weekDays.find((d) => d.dayNumber === selectedDayNumber) || weekDays[0] || {
    dayNumber: todaySolar.dayNumber,
    dayNumberPersian: todaySolar.dayNumberPersian,
    dayName: todaySolar.dayName,
    dateString: todaySolar.dateString,
    monthName: todaySolar.monthName,
    year: todaySolar.year,
    isToday: true
  };
  const currentDateString = selectedDayInfo?.dateString || getPersianDateForDay(selectedDayNumber);
  const displayedMonthYear = `${selectedDayInfo.monthName} ${toPersianDigits(selectedDayInfo.year)}`;

  // Filter appointments for the selected day and active chair
  const dayAppointments = useMemo(() => {
    return appointments
      .filter((apt) => {
        const matchesDay = apt.dayNumber === selectedDayNumber;
        const matchesChair = !apt.chairId || apt.chairId === activeChair.id;
        return matchesDay && matchesChair;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [appointments, selectedDayNumber, activeChair.id]);

  // Apply category filter (All, Online, Walk-in)
  const filteredAppointments = useMemo(() => {
    if (activeFilter === 'all') return dayAppointments;
    if (activeFilter === 'online') {
      return dayAppointments.filter((apt) => apt.bookingSource === 'online');
    }
    if (activeFilter === 'walk_in') {
      return dayAppointments.filter((apt) => apt.bookingSource === 'walk_in' || apt.bookingSource === 'studio_manual');
    }
    return dayAppointments;
  }, [dayAppointments, activeFilter]);

  // Open / Empty slots calculation
  const availableSlots = useMemo(() => {
    return getAvailableTimeSlots(appointments, activeChair.id, selectedDayNumber);
  }, [appointments, activeChair.id, selectedDayNumber]);

  // Handler for jumping directly to today
  const handleJumpToToday = () => {
    const current = getCurrentSolarDateInfo();
    setWeekOffset(0);
    setSelectedDayNumber(current.dayNumber);
  };

  // Open quick booking for an empty slot on calendar grid
  const handleBookEmptySlot = (slotStartTime: string, customDayNumber?: number, customDate?: string) => {
    setQuickBookingStartTime(slotStartTime);
    if (customDayNumber) setSelectedDayNumber(customDayNumber);
    setQuickBookingDate(customDate || currentDateString);
    setShowQuickBookingModal(true);
  };

  return (
    <div className="space-y-3.5 pb-16" dir="rtl">
      {/* ─── 1. Top Calendar Navigation Header ────────────────────── */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl p-3 border border-white/80 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#7e5352] text-white flex items-center justify-center shadow-xs">
              <CalendarIcon className="w-4 h-4 text-[#fedecb]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-serif font-bold text-stone-900">
                  {displayedMonthYear}
                </h2>
                {selectedDayInfo.isToday && (
                  <span className="text-[8px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded-full border border-rose-200">
                    امروز
                  </span>
                )}
              </div>
              <p
                className="text-[9px] text-stone-500 font-mono font-bold"
                style={{ fontFamily: 'var(--app-font)', fontStyle: 'normal', fontWeight: 'bold' }}
              >
                {currentDateString}
              </p>
            </div>
          </div>

          {/* Jump to Today & Week Shift Controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleJumpToToday}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-[9px] font-bold text-stone-800 transition-colors shadow-2xs cursor-pointer"
            >
              امروز
            </button>
            <div 
              className="flex items-center bg-stone-100/90 rounded-full p-0.5 border border-stone-200"
              style={{ width: '77px', height: '34px' }}
            >
              <button
                type="button"
                onClick={() => setWeekOffset((prev) => prev - 1)}
                className="rounded-full flex items-center justify-center text-stone-600 hover:text-stone-950 hover:bg-white transition-all cursor-pointer shrink-0"
                style={{ width: '30px', height: '30px', marginRight: '4px' }}
                title="هفته قبل"
                aria-label="هفته قبل"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setWeekOffset((prev) => prev + 1)}
                className="rounded-full flex items-center justify-center text-stone-600 hover:text-stone-950 hover:bg-white transition-all cursor-pointer shrink-0"
                style={{ width: '30px', height: '29px', marginRight: '9px' }}
                title="هفته بعد"
                aria-label="هفته بعد"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ─── 2. 7-Day Date Strip ─────────────────────────────────── */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => {
            const isSelected = selectedDayNumber === day.dayNumber;
            const count = appointments.filter(
              (a) => a.dayNumber === day.dayNumber && (!a.chairId || a.chairId === activeChair.id)
            ).length;

            return (
              <button
                key={day.dayNumber}
                type="button"
                onClick={() => setSelectedDayNumber(day.dayNumber)}
                className={`flex flex-col items-center py-2 px-1 rounded-2xl transition-all relative cursor-pointer ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-md scale-105 border border-white/20'
                    : 'bg-white/50 hover:bg-white/80 text-stone-700 border border-stone-200/50'
                }`}
              >
                <span 
                  className={`font-bold ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}
                  style={{ fontSize: '9px', fontFamily: 'system-ui', fontWeight: 'bold' }}
                >
                  {day.dayName}
                </span>
                <span
                  className={`font-mono font-bold my-0.5 ${isSelected ? 'text-white' : 'text-stone-800'}`}
                  style={{ fontSize: '16px', fontStyle: 'normal' }}
                >
                  {day.dayNumber}
                </span>

                {/* Appointment Count Tag */}
                {count > 0 ? (
                  <span className={`text-[7px] font-mono px-1.5 py-0.5 rounded-full mt-0.5 ${
                    day.isToday
                      ? 'bg-rose-500 text-white font-bold'
                      : isSelected ? 'bg-stone-800 text-stone-200' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {toPersianDigits(count)}
                  </span>
                ) : (
                  <span className={`w-1 h-1 rounded-full mt-1 ${
                    day.isToday ? 'bg-rose-500' : 'bg-stone-300'
                  }`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 3. View Mode Switcher & Quick Action Buttons Bar ────────── */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Google Calendar View Mode Switcher */}
        <div className="flex items-center bg-stone-200/70 p-1 rounded-2xl border border-stone-300/40">
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
              viewMode === 'calendar'
                ? 'bg-white text-stone-900 shadow-xs ring-1 ring-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-[#4e3b6e]" />
            <span>تقویم روزانه (بصری)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('multiday')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
              viewMode === 'multiday'
                ? 'bg-white text-stone-900 shadow-xs ring-1 ring-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Columns3 className="w-3.5 h-3.5 text-[#7e5352]" />
            <span>نمای ۳ روزه</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('agenda')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
              viewMode === 'agenda'
                ? 'bg-white text-stone-900 shadow-xs ring-1 ring-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5 text-stone-700" />
            <span>لیست برنامه</span>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => refreshDatabaseData()}
            disabled={isRefreshing}
            className={`flex items-center gap-1 py-1.5 px-2.5 rounded-xl border text-[10px] font-bold transition-all shadow-2xs cursor-pointer ${
              isRefreshing
                ? 'bg-purple-50 text-[#4e3b6e] border-purple-200'
                : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200/80'
            }`}
            title="به‌روزرسانی خودکار هر ۵ دقیقه. کلیک برای همگام‌سازی فوری"
          >
            <RefreshCw className={`w-3 h-3 text-[#4e3b6e] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'در حال همگام‌سازی...' : 'همگام‌سازی'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowWalkInModal(true)}
            className="flex items-center gap-1 py-1.5 px-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-200/80 shadow-2xs text-stone-900 transition-all active:scale-98 cursor-pointer"
          >
            <UserPlus className="w-3 h-3 text-stone-700" />
            <span className="text-[10px] font-bold">پذیرش حضوری</span>
          </button>

          <button
            type="button"
            onClick={() => setShowBlockModal(true)}
            className="flex items-center gap-1 py-1.5 px-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-200/80 shadow-2xs text-stone-900 transition-all active:scale-98 cursor-pointer"
          >
            <Ban className="w-3 h-3 text-stone-500" />
            <span className="text-[10px] font-bold">استراحت</span>
          </button>
        </div>
      </div>

      {/* ─── 4. Visual View Renderers ───────────────────────────────── */}
      {viewMode === 'calendar' && (
        <VisualDayCalendarView
          dayNumber={selectedDayNumber}
          dateString={currentDateString}
          appointments={filteredAppointments}
          activeChair={activeChair}
          onSelectAppointment={(apt) => setSelectedAppointment(apt)}
          onRescheduleAppointment={(apt) => setRescheduleTargetApt(apt)}
        />
      )}

      {viewMode === 'multiday' && (
        <VisualMultiDayCalendarView
          days={weekDays}
          selectedDayNumber={selectedDayNumber}
          onSelectDay={(d) => setSelectedDayNumber(d)}
          appointments={appointments}
          activeChair={activeChair}
          onSelectAppointment={(apt) => setSelectedAppointment(apt)}
        />
      )}

      {viewMode === 'agenda' && (
        <div className="space-y-2">
          {/* Filter Pills */}
          <div className="flex items-center justify-between gap-1.5 px-1 pb-1">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-2.5 py-1 rounded-full text-[9px] font-bold transition-all cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'bg-white/60 text-stone-600 hover:bg-white border border-stone-200/60'
                }`}
              >
                همه ({toPersianDigits(dayAppointments.length)})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('online')}
                className={`px-2.5 py-1 rounded-full text-[9px] font-bold transition-all cursor-pointer ${
                  activeFilter === 'online'
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'bg-white/60 text-stone-600 hover:bg-white border border-stone-200/60'
                }`}
              >
                آنلاین
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('walk_in')}
                className={`px-2.5 py-1 rounded-full text-[9px] font-bold transition-all cursor-pointer ${
                  activeFilter === 'walk_in'
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'bg-white/60 text-stone-600 hover:bg-white border border-stone-200/60'
                }`}
              >
                حضوری
              </button>
            </div>
          </div>

          {/* Agenda List Items */}
          {filteredAppointments.length === 0 ? (
            <div className="p-6 rounded-3xl bg-white/40 border border-dashed border-stone-300 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <Clock className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-stone-700">
                نوبتی برای این روز یا فیلتر ثبت نشده است
              </p>
              <p className="text-[10px] text-stone-500">
                ظرفیت زمانی سوئیت در این تاریخ کاملاً آزاد است.
              </p>
              <button
                type="button"
                onClick={() => handleBookEmptySlot('10:00')}
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-[10px] font-bold shadow-sm cursor-pointer"
              >
                <Plus className="w-3 h-3 text-stone-300" />
                <span>ثبت اولین نوبت</span>
              </button>
            </div>
          ) : (
            filteredAppointments.map((apt) => {
              const statusBadge = getAppointmentStatusBadge(apt.status);
              const sourceLabel = getBookingSourceLabel(apt.bookingSource);
              const isBlocked = apt.status === 'blocked';
              const isInProgress = apt.status === 'in_progress';
              const isCompleted = apt.status === 'completed';

              if (isBlocked) {
                return (
                  <div
                    key={apt.id}
                    className="p-3 rounded-2xl bg-stone-100/80 border border-dashed border-stone-300 flex items-center justify-between text-stone-600 transition-all hover:bg-stone-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-stone-200 flex items-center justify-center text-stone-500 shrink-0">
                        <Coffee className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-stone-800">
                            {apt.customerName || 'استراحت پرسنلی'}
                          </span>
                          <span className="text-[8px] bg-stone-200 text-stone-600 px-1.5 py-0.2 rounded font-mono">
                            مسدود
                          </span>
                        </div>
                        <span className="text-[9px] text-stone-500 font-mono">
                          {toPersianDigits(apt.startTime)} الی {toPersianDigits(apt.endTime || '')} ({toPersianDigits(apt.durationMinutes || 45)} دقیقه)
                        </span>
                      </div>
                    </div>

                    <span className="text-[9px] text-stone-400 font-mono">
                      {apt.appointmentNumber || 'بازه بسته'}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={apt.id}
                  onClick={() => setSelectedAppointment(apt)}
                  className={`p-3 rounded-2xl transition-all cursor-pointer border relative ${
                    isInProgress
                      ? 'bg-[#151517] text-white border-stone-800 shadow-md ring-1 ring-[#d88d85]/30'
                      : isCompleted
                      ? 'bg-white/50 text-stone-600 border-white/60 hover:bg-white/80 opacity-85'
                      : 'bg-white/80 text-stone-900 border-white shadow-2xs hover:bg-white hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded-xl font-mono text-[10px] font-bold shrink-0 ${
                        isInProgress 
                          ? 'bg-stone-800 text-[#fbdcd9] border border-stone-700' 
                          : 'bg-stone-100 text-stone-800'
                      }`}>
                        {toPersianDigits(apt.startTime)}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className={`text-xs font-bold ${isInProgress ? 'text-white' : 'text-stone-900'}`}>
                            {apt.customerName}
                          </h4>
                          {apt.isQuietSession && (
                            <span className="text-[8px] bg-[#fbdcd9] text-[#7e5352] px-1.5 py-0.2 rounded-full font-bold">
                              سکوت
                            </span>
                          )}
                        </div>
                        <p className={`text-[10px] truncate max-w-[170px] ${isInProgress ? 'text-stone-300' : 'text-stone-600'}`}>
                          {apt.service?.name}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                      isInProgress 
                        ? 'bg-amber-400 text-amber-950 animate-pulse' 
                        : isCompleted 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-stone-200/80 text-stone-700'
                    }`}>
                      {statusBadge.label}
                    </span>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-stone-200/30 flex items-center justify-between text-[9px]">
                    <div className="flex items-center gap-2 text-stone-500 font-mono">
                      <span>{toPersianDigits(apt.durationMinutes || 45)} دقیقه</span>
                      <span>•</span>
                      <span className="font-bold text-stone-700">
                        {formatPrice(apt.priceSummary?.total || apt.totalAmount || apt.servicePrice || 0)}
                      </span>
                      <span>•</span>
                      <span>{sourceLabel.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {apt.customerPhone && (
                        <QuickContactButtons
                          phone={apt.customerPhone}
                          customerName={apt.customerName}
                          appointmentTime={apt.startTime}
                          appointmentDate={apt.date}
                          serviceName={apt.service?.name}
                          size="xs"
                          variant={isInProgress ? 'dark' : 'light'}
                        />
                      )}

                      {isInProgress && (
                        <button
                          type="button"
                          onClick={() => completeAppointment(apt.id)}
                          className="px-2 py-0.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-[8px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>پایان نوبت</span>
                        </button>
                      )}

                      {(apt.status === 'confirmed' || apt.status === 'reserved') && (
                        <>
                          <button
                            type="button"
                            onClick={() => setRescheduleTargetApt(apt)}
                            className="px-2 py-0.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-[8px] font-semibold flex items-center gap-1 border border-stone-200 cursor-pointer"
                            title="تغییر زمان"
                          >
                            <CalendarClock className="w-2.5 h-2.5 text-stone-600" />
                            <span>انتقال</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => startAppointment(apt.id)}
                            className="px-2 py-0.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-[8px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <Play className="w-2 h-2 fill-current text-stone-200" />
                            <span>شروع</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ─── 5. Modals Integration ─────────────────────────────────── */}
      <AppointmentDetailsModal
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        appointment={selectedAppointment}
        onOpenDossier={onOpenDossier || (() => {})}
      />

      <WalkInModal
        isOpen={showWalkInModal}
        onClose={() => setShowWalkInModal(false)}
      />

      <BlockBreakModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
      />

      <QuickBookingModal
        isOpen={showQuickBookingModal}
        onClose={() => setShowQuickBookingModal(false)}
        initialStartTime={quickBookingStartTime}
        initialDayNumber={selectedDayNumber}
        initialDate={quickBookingDate || currentDateString}
      />

      <RescheduleModal
        isOpen={!!rescheduleTargetApt}
        onClose={() => setRescheduleTargetApt(null)}
        appointment={rescheduleTargetApt}
      />
    </div>
  );
};

