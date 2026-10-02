import React, { useState } from 'react';
import { Appointment } from '../../types';
import { 
  Clock, 
  User, 
  Scissors, 
  Sparkles, 
  CheckCircle2, 
  Play, 
  ChevronLeft, 
  VolumeX, 
  Armchair,
  CalendarClock,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { toPersianDigits, addMinutesToTime } from '../../utils/dateUtils';
import { formatPrice } from '../../utils/formatUtils';
import { getAppointmentStatusBadge, getBookingSourceLabel } from '../../utils/statusUtils';
import { PriceDisplay } from '../common/PriceDisplay';
import { QuickContactButtons } from './QuickContactButtons';
import { RescheduleModal } from './RescheduleModal';
import { useAtelier } from '../../store/AtelierContext';

interface TodayTimelineProps {
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
  onStartAppointment: (aptId: string) => void;
  onCompleteAppointment: (aptId: string) => void;
}

export const TodayTimeline: React.FC<TodayTimelineProps> = ({
  appointments,
  onSelectAppointment,
  onStartAppointment,
  onCompleteAppointment,
}) => {
  const { cancelAppointment } = useAtelier();
  const [rescheduleTargetApt, setRescheduleTargetApt] = useState<Appointment | null>(null);
  const [cancelTargetApt, setCancelTargetApt] = useState<Appointment | null>(null);

  if (appointments.length === 0) {
    return (
      <div className="clay-card rounded-[28px] p-8 text-center border border-white/60 bg-white/40 backdrop-blur-md">
        <Clock className="w-8 h-8 text-stone-400 mx-auto mb-2 opacity-70" />
        <p className="text-sm font-bold text-stone-800">نوبتی برای امروز ثبت نشده است</p>
        <p className="text-xs text-stone-500 mt-1">از طریق دکمه «پذیرش فوری» می‌توانید مراجعین حضوری جدید را ثبت نمایید.</p>
      </div>
    );
  }

  const handleConfirmCancel = () => {
    if (cancelTargetApt) {
      cancelAppointment(cancelTargetApt.id);
      setCancelTargetApt(null);
    }
  };

  return (
    <div className="space-y-3 w-full" dir="rtl">
      {appointments.map((apt, index) => {
        const isBlocked = apt.status === 'blocked';
        const isCancelled = apt.status === 'cancelled';
        const isInProgress = apt.status === 'in_progress';
        const isCompleted = apt.status === 'completed';
        const duration = apt.durationMinutes || 45;
        const endTimeStr = apt.endTime || addMinutesToTime(apt.startTime, duration);
        const statusMeta = getAppointmentStatusBadge(apt.status);
        const sourceMeta = getBookingSourceLabel(apt.bookingSource);
        const canManageBooking = !isCompleted && !isCancelled && !isBlocked;

        return (
          <div
            key={apt.id || index}
            onClick={() => onSelectAppointment(apt)}
            className={`group rounded-[24px] sm:rounded-[28px] p-3.5 sm:p-4.5 border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:shadow-md ${
              isInProgress
                ? 'bg-stone-900 text-white border-stone-800 shadow-lg ring-2 ring-[#7e5352]/30'
                : isCompleted
                ? 'clay-card-subtle bg-white/45 backdrop-blur-md border-white/60 text-stone-700 opacity-90'
                : isBlocked
                ? 'bg-stone-100/70 backdrop-blur-md border-stone-300/80 border-dashed text-stone-600'
                : isCancelled
                ? 'bg-stone-100/50 border-stone-200 text-stone-400 opacity-60'
                : 'clay-card bg-white/70 backdrop-blur-md border-white/90 hover:bg-white/90 text-stone-900'
            }`}
          >
            {/* Left/Main Information */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Time Block Badge */}
              <div
                className={`px-3 py-2 rounded-2xl text-center shrink-0 flex flex-col items-center justify-center min-w-[70px] ${
                  isInProgress
                    ? 'bg-stone-800/90 text-[#fbdcd9] border border-stone-700'
                    : isCompleted
                    ? 'bg-stone-100 text-stone-600'
                    : 'bg-white/90 text-stone-900 border border-stone-200/60 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-1 font-mono text-xs font-black">
                  <Clock className="w-3 h-3 text-stone-600" />
                  <span style={{ fontFamily: 'var(--app-font)', fontSize: '13px' }}>
                    {toPersianDigits(apt.startTime)}
                  </span>
                </div>
                <span className="text-[10px] opacity-75 font-mono mt-0.5">
                  تا {toPersianDigits(endTimeStr)}
                </span>
              </div>

              {/* Customer & Service Info */}
              <div className="text-right min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-black truncate ${isInProgress ? 'text-white' : 'text-stone-900'}`}>
                    {apt.customerName}
                  </span>

                  {apt.isQuietSession && (
                    <span className="inline-flex items-center gap-1 text-[9px] bg-stone-100 text-stone-800 px-2 py-0.5 rounded-full font-bold">
                      <VolumeX className="w-2.5 h-2.5" />
                      <span>سکوت</span>
                    </span>
                  )}

                  {sourceMeta?.label && (
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                      isInProgress ? 'bg-stone-800 text-stone-300' : 'bg-stone-100 text-stone-600'
                    }`}>
                      {sourceMeta.label}
                    </span>
                  )}
                </div>

                {/* Service Details & Pricing */}
                <div className="flex items-center gap-2.5 flex-wrap text-xs">
                  <span className={`flex items-center gap-1 font-medium ${isInProgress ? 'text-stone-300' : 'text-stone-700'}`}>
                    <Scissors className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                    <span className="truncate">{apt.service?.name || 'سرویس اصلاح و پیرایش'}</span>
                  </span>

                  {/* Price display with discount support */}
                  <div className="mr-auto sm:mr-0">
                    <PriceDisplay
                      service={apt.service}
                      price={apt.servicePrice}
                      realPrice={apt.originalServicePrice}
                      size="xs"
                      showBadge={true}
                    />
                  </div>
                </div>

                {/* Barber and Chair Note */}
                <div className={`text-[10px] flex items-center gap-2 ${isInProgress ? 'text-stone-400' : 'text-stone-500'}`}>
                  <span>{apt.barberName || 'آرایشگر شیفت'}</span>
                  {apt.chairName && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <Armchair className="w-3 h-3 opacity-70" />
                        <span>{apt.chairName}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right/Action Buttons & Status Badge */}
            <div
              className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200/40 flex-wrap"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Quick Contact Buttons */}
              {apt.customerPhone && !isBlocked && (
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

              {/* Status Badge */}
              <span
                className={`text-[10px] px-2.5 py-1 rounded-full font-bold shadow-2xs ${
                  isInProgress
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                    : isCompleted
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : isBlocked
                    ? 'bg-stone-200 text-stone-700'
                    : isCancelled
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-white text-stone-800 border border-stone-200/80'
                }`}
              >
                {statusMeta.label}
              </span>

              {/* Direct Barber Actions: Reschedule & Cancel */}
              {canManageBooking && (
                <div className="flex items-center gap-1">
                  {/* Reschedule Button */}
                  <button
                    type="button"
                    onClick={() => setRescheduleTargetApt(apt)}
                    className={`px-2 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer ${
                      isInProgress
                        ? 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
                        : 'bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 shadow-2xs'
                    }`}
                    title="تغییر زمان نوبت"
                  >
                    <CalendarClock className="w-3 h-3 text-stone-600" />
                    <span className="hidden sm:inline">انتقال</span>
                  </button>

                  {/* Cancel Button */}
                  <button
                    type="button"
                    onClick={() => setCancelTargetApt(apt)}
                    className="px-2 py-1 rounded-xl text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/70 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                    title="لغو نوبت"
                  >
                    <XCircle className="w-3 h-3 text-rose-600" />
                    <span className="hidden sm:inline">لغو</span>
                  </button>
                </div>
              )}

              {/* Interactive Lifecycle Actions */}
              {isInProgress ? (
                <button
                  type="button"
                  onClick={() => onCompleteAppointment(apt.id)}
                  className="text-xs font-black bg-stone-900 hover:bg-stone-800 text-white px-3.5 py-1.5 rounded-2xl shadow-sm hover:shadow transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تکمیل نوبت</span>
                </button>
              ) : apt.status === 'confirmed' || apt.status === 'reserved' ? (
                <button
                  type="button"
                  onClick={() => onStartAppointment(apt.id)}
                  className="text-xs font-black bg-stone-900 hover:bg-stone-800 text-white px-3 py-1.5 rounded-2xl shadow-sm hover:shadow transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current text-stone-200" />
                  <span>شروع سرویس</span>
                </button>
              ) : null}

              {/* Detail Open Chevron */}
              <div
                onClick={() => onSelectAppointment(apt)}
                className="w-7 h-7 rounded-xl flex items-center justify-center bg-stone-100/70 hover:bg-stone-200/80 text-stone-500 transition-colors cursor-pointer"
                title="مشاهده جزئیات کامل نوبت"
              >
                <ChevronLeft className="w-4 h-4 text-stone-600" />
              </div>
            </div>
          </div>
        );
      })}

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={!!rescheduleTargetApt}
        onClose={() => setRescheduleTargetApt(null)}
        appointment={rescheduleTargetApt}
      />

      {/* Cancel Confirmation Dialog */}
      {cancelTargetApt && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in"
          onClick={() => setCancelTargetApt(null)}
          dir="rtl"
        >
          <div
            className="w-full max-w-[320px] bg-white rounded-[26px] p-4 shadow-2xl border border-stone-200 space-y-3 animate-in zoom-in-95 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-900">
                لغو نوبت {cancelTargetApt.customerName}
              </h4>
              <p className="text-[10px] text-stone-500 mt-1">
                ساعت {toPersianDigits(cancelTargetApt.startTime)} · {cancelTargetApt.service?.name}
              </p>
              <p className="text-[11px] text-rose-700 font-semibold mt-2">
                آیا از لغو این نوبت اطمینان دارید؟
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                بله، نوبت لغو شود
              </button>
              <button
                type="button"
                onClick={() => setCancelTargetApt(null)}
                className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-xl transition-colors cursor-pointer"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
