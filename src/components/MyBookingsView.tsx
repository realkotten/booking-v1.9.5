import React, { useState, useMemo } from 'react';
import { Appointment, Reservation, Service } from '../types';
import { useAtelier } from '../store/AtelierContext';
import { AtelierShell } from './AtelierShell';
import { DigitalBoardingPassModal } from './DigitalBoardingPassModal';
import { CancelAppointmentModal } from './CancelAppointmentModal';
import { 
  Calendar, 
  Clock, 
  Scissors, 
  User, 
  CheckCircle, 
  RotateCcw, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  CalendarCheck,
  QrCode
} from 'lucide-react';
import { toPersianDigits, formatAppointmentDate } from '../utils/dateUtils';
import { isTodayDayNumber, isTomorrowDayNumber } from '../utils/bookingUtils';
import { formatPrice } from '../utils/formatUtils';
import { isAppointmentForUser, getStoredUserBookingIds } from '../utils/browserStorage';

interface MyBookingsViewProps {
  currentReservation?: Reservation;
  onViewPass?: () => void;
  onRebook: (service?: Service) => void;
  onOpenProfile: () => void;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({
  onRebook,
  onOpenProfile,
}) => {
  const {
    appointments,
    pastAppointments,
    currentCustomer,
    cancelAppointment,
    activeBarber,
    settings,
  } = useAtelier();

  const defaultBarber = settings?.profile?.masterName?.trim() || activeBarber?.name || 'آرایشگر اختصاصی';

  // Modals state
  const [selectedPassAppointment, setSelectedPassAppointment] = useState<Appointment | null>(null);
  const [selectedCancelAppointment, setSelectedCancelAppointment] = useState<Appointment | null>(null);
  const [expandedNotesId, setExpandedNotesId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Separate Active / Upcoming vs History
  const { activeBookings, historyBookings } = useMemo(() => {
    const localBookingIds = getStoredUserBookingIds();

    const userAppointments = appointments.filter((apt) =>
      isAppointmentForUser(apt, currentCustomer, localBookingIds)
    );

    const active = userAppointments
      .filter((apt) => apt.status === 'confirmed' || apt.status === 'in_progress' || apt.status === 'reserved')
      .sort((a, b) => {
        if (a.dayNumber !== b.dayNumber) return a.dayNumber - b.dayNumber;
        return a.startTime.localeCompare(b.startTime);
      });

    const historyFromLive = userAppointments.filter(
      (apt) => apt.status === 'completed' || apt.status === 'cancelled'
    );

    const existingIds = new Set(historyFromLive.map((a) => a.id));
    const historyCombined = [...historyFromLive];

    pastAppointments.forEach((pastApt) => {
      if (!existingIds.has(pastApt.id) && isAppointmentForUser(pastApt, currentCustomer, localBookingIds)) {
        historyCombined.push(pastApt);
        existingIds.add(pastApt.id);
      }
    });

    historyCombined.sort((a, b) => {
      if (a.dayNumber !== b.dayNumber) return b.dayNumber - a.dayNumber;
      return b.startTime.localeCompare(a.startTime);
    });

    return {
      activeBookings: active,
      historyBookings: historyCombined,
    };
  }, [appointments, pastAppointments, currentCustomer]);

  // Handle cancellation execution
  const handleConfirmCancel = (aptId: string) => {
    const result = cancelAppointment(aptId);
    setSelectedCancelAppointment(null);
    if (result.success) {
      triggerToast('نوبت شما لغو شد و ساعت انتخابی در تقویم آزاد گردید.');
    } else {
      triggerToast(result.message || 'خطا در لغو نوبت');
    }
  };

  // Handle rebook execution
  const handleRebookAppointment = (apt: Appointment) => {
    triggerToast(`سرویس «${apt.service?.name || 'پیرایش'}» برای رزرو مجدد انتخاب شد.`);
    setTimeout(() => {
      onRebook(apt.service);
    }, 400);
  };

  return (
    <AtelierShell id="my-bookings-container">
      {/* Toast Feedback */}
      {toastMessage && (
        <div 
          className="fixed top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-[#22262e] text-white shadow-2xl backdrop-blur-xl flex items-center gap-2 border border-white/20 text-xs font-medium animate-fade-in" 
          dir="rtl"
        >
          <CheckCircle className="w-3.5 h-3.5 text-[#fedecb]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header with Customer Identity */}
      <header
        id="my-bookings-header"
        className="relative z-30 px-6 pt-1 flex items-center justify-between shrink-0"
        dir="rtl"
      >
        <div
          className="flex items-center gap-1.5 py-1 px-3 rounded-full clay-pill-3d text-stone-800 text-[11px] font-medium"
        >
          <User className="w-3.5 h-3.5 text-[#0f172a]" />
          <span className="max-w-[100px] truncate">{currentCustomer.name}</span>
        </div>

        <div className="text-center">
          <h1 className="text-sm font-serif font-bold text-stone-900">
            رزروهای من
          </h1>
          <p className="text-[9px] text-stone-600 font-medium">
            مدیریت نوبت‌ها و سوابق مراجعه
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenProfile}
          className="w-8 h-8 rounded-full tactile-tile-3d text-stone-700 flex items-center justify-center cursor-pointer hover:border-slate-300"
          title="پروفایل کاربر"
        >
          <User className="w-3.5 h-3.5 text-[#0f172a]" />
        </button>
      </header>

      {/* Main Glass Shell Container */}
      <section
        id="my-bookings-card"
        className="relative z-20 mx-auto w-[350px] clay-card rounded-[34px] p-3.5 flex flex-col justify-between mt-1 max-h-[660px] overflow-hidden"
        dir="rtl"
      >
        {/* Appointments List */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-0.5 my-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-stone-900">
              سوابق و نوبت‌های ثبت‌شده
            </span>
            <span className="text-[9px] text-stone-600 font-mono font-bold">
              {toPersianDigits(activeBookings.length + historyBookings.length)} رکورد
            </span>
          </div>

          {activeBookings.length === 0 && historyBookings.length === 0 ? (
            <div className="p-5 rounded-2xl clay-card-subtle text-center space-y-2.5">
              <CalendarCheck className="w-8 h-8 text-[#bf5938] mx-auto opacity-70" />
              <p className="text-xs font-bold text-stone-800">هنوز نوبتی ثبت نشده است</p>
              <button
                type="button"
                onClick={() => onRebook()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl clay-button-primary text-xs font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#f3d0c4]" />
                <span>رزرو نوبت جدید</span>
              </button>
            </div>
          ) : (
            [...activeBookings, ...historyBookings].map((apt) => {
              const isCancelled = apt.status === 'cancelled';
              const isCompleted = apt.status === 'completed';
              const isExpanded = expandedNotesId === apt.id;
              const hasNotes = !!(apt.stylingNotes || apt.customerNotes);

              return (
                <div
                  key={apt.id}
                  className={`rounded-2xl p-3 space-y-2 transition-all ${
                    isCancelled
                      ? 'bg-gradient-to-b from-rose-50 to-rose-100/50 border border-white opacity-85 shadow-2xs'
                      : isCompleted
                      ? 'clay-card-subtle'
                      : 'clay-card'
                  }`}
                >
                  {/* Row 1: Service Name & Status Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Scissors className="w-3.5 h-3.5 text-[#bf5938]" />
                      <span className="text-xs font-bold text-stone-900">
                        {apt.service?.name || 'سرویس پیرایش'}
                      </span>
                    </div>

                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      isCancelled
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : isCompleted
                        ? 'clay-pill-3d text-stone-700'
                        : 'bg-gradient-to-b from-emerald-100 to-emerald-200 text-emerald-800 border border-white shadow-2xs'
                    }`}>
                      {isCancelled ? 'لغو شده' : isCompleted ? 'تکمیل شده' : 'رزرو تایید شده'}
                    </span>
                  </div>

                  {/* Row 2: Barber & Suite & Cost */}
                  <div className="flex items-center justify-between text-[10px] text-stone-600 pt-1 border-t border-stone-200/70">
                    <span className="font-medium">
                      {apt.barberName || defaultBarber} · {apt.chairName || 'صندلی اختصاصی'}
                    </span>
                    {(() => {
                      const effectiveServicePrice = apt.service?.price ?? apt.servicePrice ?? 0;
                      const effectiveRealPrice = (apt.service?.realPrice && apt.service.realPrice > 0)
                        ? apt.service.realPrice
                        : (apt.originalServicePrice || effectiveServicePrice);
                      const extrasTotal = (apt.additionalAccoutrements && apt.additionalAccoutrements.length > 0)
                        ? apt.additionalAccoutrements.reduce((sum, a) => sum + (a.price || 0), 0)
                        : (apt.accoutrementsPrice || 0);

                      const hasDiscount = Boolean(effectiveRealPrice > effectiveServicePrice && effectiveServicePrice > 0);
                      const payableTotal = apt.priceSummary?.total ?? (effectiveServicePrice + extrasTotal);
                      const originalTotal = apt.priceSummary?.originalTotal ?? (effectiveRealPrice + extrasTotal);

                      return (
                        <div className="flex items-center gap-1.5 tabular-nums">
                          {hasDiscount && originalTotal > payableTotal && (
                            <span className="line-through text-stone-400 text-[9px] font-normal">
                              {formatPrice(originalTotal)}
                            </span>
                          )}
                          <span className="font-bold text-stone-900">
                            {formatPrice(payableTotal)}
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Optional Technical Styling Notes Accordion */}
                  {hasNotes && (
                    <div className="text-[9px] pt-1 border-t border-stone-200/70">
                      <button
                        type="button"
                        onClick={() => setExpandedNotesId(isExpanded ? null : apt.id)}
                        className="flex items-center gap-1 text-[#bf5938] hover:text-[#a34426] font-bold transition-colors cursor-pointer"
                      >
                        {isExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                        <span>{isExpanded ? 'بستن یادداشت‌های فنی' : 'مشاهده یادداشت‌های فنی'}</span>
                      </button>

                      {isExpanded && (
                        <div className="mt-1 p-2 rounded-xl bg-stone-50 space-y-1 text-stone-700 leading-relaxed">
                          {apt.stylingNotes && (
                            <div>
                              <span className="font-bold text-stone-900">دستور فنی: </span>
                              <span>{apt.stylingNotes}</span>
                            </div>
                          )}
                          {apt.customerNotes && (
                            <div>
                              <span className="font-bold text-stone-900">یادداشت مشتری: </span>
                              <span>{apt.customerNotes}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Row 3: Date, Time & Quick Action Buttons */}
                  <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[10px] text-stone-700">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1" title="تاریخ مراجعه به سالن">
                        <Calendar className="w-3 h-3 text-[#bf5938]" />
                        <span className="font-bold text-stone-900">{formatAppointmentDate(apt)}</span>
                        {isTodayDayNumber(apt.dayNumber) && (
                          <span className="text-[8px] font-bold px-1.5 py-0.2 rounded-full bg-[#fdf2ee] text-[#bf5938] border border-[#f3d0c4]">
                            امروز
                          </span>
                        )}
                        {isTomorrowDayNumber(apt.dayNumber) && (
                          <span className="text-[8px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-[#0f172a] border border-slate-200">
                            فردا
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1" title="ساعت حضور">
                        <Clock className="w-3 h-3 text-[#bf5938]" />
                        <span className="font-bold text-stone-900">{toPersianDigits(apt.startTime)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* View Boarding Pass for upcoming/active */}
                      {!isCancelled && (
                        <button
                          type="button"
                          onClick={() => setSelectedPassAppointment(apt)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white text-[9px] font-bold shadow-2xs border border-white/10 transition-all cursor-pointer"
                        >
                          <QrCode className="w-2.5 h-2.5 text-[#f3d0c4]" />
                          <span>بلیت دیجیتال</span>
                        </button>
                      )}

                      {/* Cancel button for active upcoming */}
                      {!isCancelled && !isCompleted && (
                        <button
                          type="button"
                          onClick={() => setSelectedCancelAppointment(apt)}
                          className="p-1 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors cursor-pointer"
                          title="لغو نوبت"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Rebook for completed / cancelled */}
                      {(isCompleted || isCancelled) && (
                        <button
                          type="button"
                          onClick={() => handleRebookAppointment(apt)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white text-stone-800 border border-stone-200 text-[9px] font-bold shadow-2xs transition-all cursor-pointer hover:bg-stone-50"
                        >
                          <RotateCcw className="w-2.5 h-2.5 text-[#bf5938]" />
                          <span>رزرو مجدد</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom CTA / Action Bar */}
        <div className="shrink-0 pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={() => onRebook()}
            className="clay-button-primary w-full py-3 px-3 rounded-[18px] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.985]"
          >
            <Plus className="w-3.5 h-3.5 text-[#fedecb]" />
            <span>رزرو نوبت جدید در آرایشگاه</span>
          </button>
        </div>
      </section>

      {/* Digital Boarding Pass Modal */}
      <DigitalBoardingPassModal
        appointment={selectedPassAppointment}
        isOpen={!!selectedPassAppointment}
        onClose={() => setSelectedPassAppointment(null)}
      />

      {/* Cancel Confirmation Dialog */}
      <CancelAppointmentModal
        appointment={selectedCancelAppointment}
        isOpen={!!selectedCancelAppointment}
        onClose={() => setSelectedCancelAppointment(null)}
        onConfirmCancel={handleConfirmCancel}
      />
    </AtelierShell>
  );
};
