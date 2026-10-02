import React, { useState } from 'react';
import { Appointment } from '../../types';
import { useAtelier } from '../../store/AtelierContext';
import { 
  X, 
  User, 
  Phone, 
  Clock, 
  Scissors, 
  Coffee, 
  CheckCircle2, 
  Play,
  Sparkles,
  AlertCircle,
  CalendarClock
} from 'lucide-react';
import { toPersianDigits } from '../../utils/dateUtils';
import { formatPrice } from '../../utils/formatUtils';
import { getAppointmentStatusBadge, getBookingSourceLabel } from '../../utils/statusUtils';
import { PriceDisplay } from '../common/PriceDisplay';
import { RescheduleModal } from './RescheduleModal';
import { QuickContactButtons } from './QuickContactButtons';

interface AppointmentDetailsModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenDossier: (customerId?: string) => void;
}

export const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onOpenDossier,
}) => {
  const { startAppointment, completeAppointment, cancelAppointment } = useAtelier();
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  if (!isOpen || !appointment) return null;

  const statusBadge = getAppointmentStatusBadge(appointment.status);
  const sourceLabel = getBookingSourceLabel(appointment.bookingSource);
  const duration = appointment.durationMinutes || 45;

  const handleStart = () => {
    startAppointment(appointment.id);
    onClose();
  };

  const handleComplete = () => {
    completeAppointment(appointment.id);
    onClose();
  };

  const handleCancel = () => {
    cancelAppointment(appointment.id);
    setIsConfirmingCancel(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in" dir="rtl">
        <div className="relative w-full max-w-[346px] bg-white/90 backdrop-blur-2xl border border-white/80 rounded-[32px] p-4 shadow-2xl space-y-3.5 animate-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white via-[#fbdcd9] to-[#d88d85] shadow-glow-pink flex items-center justify-center border border-white/60">
                <Scissors className="w-4 h-4 text-stone-900" />
              </div>
              <div>
                <h3 className="text-xs font-serif font-bold text-stone-900">
                  جزئیات نوبت پیرایش
                </h3>
                <p className="text-[9px] text-stone-500 font-mono">
                  {appointment.date} · ساعت {toPersianDigits(appointment.startTime)} · {sourceLabel.label}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Customer Identity Card */}
          <div className="p-3 rounded-2xl bg-white/70 border border-white/80 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-xs text-stone-900">{appointment.customerName}</h4>
                {appointment.isVip && (
                  <span className="text-[8px] bg-amber-100 text-amber-900 border border-amber-300/60 px-1.5 py-0.2 rounded-full font-bold">
                    VIP
                  </span>
                )}
              </div>
              <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold ${
                appointment.status === 'in_progress' ? 'bg-amber-100 text-amber-800' :
                appointment.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                'bg-stone-200 text-stone-700'
              }`}>
                {statusBadge.label}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-stone-600">
              <span className="font-mono">{appointment.customerPhone || 'بدون شماره ثبت‌شده'}</span>
              <div className="flex items-center gap-1.5 tabular-nums">
                {((appointment.priceSummary?.hasDiscount && appointment.priceSummary.originalTotal) ||
                  (appointment.originalServicePrice && appointment.originalServicePrice > (appointment.servicePrice || 0)) ||
                  (appointment.service?.realPrice && appointment.service.realPrice > (appointment.service.price || 0))) && (
                  <span className="line-through text-stone-400 text-[9px] font-normal">
                    {formatPrice(
                      appointment.priceSummary?.originalTotal ||
                      (appointment.originalServicePrice ? appointment.originalServicePrice + (appointment.accoutrementsPrice || 0) : null) ||
                      (appointment.service?.realPrice ? appointment.service.realPrice + (appointment.accoutrementsPrice || 0) : null) ||
                      0
                    )}
                  </span>
                )}
                <span className="font-bold text-stone-900">
                  {formatPrice(appointment.totalAmount || appointment.servicePrice || 85000)}
                </span>
              </div>
            </div>

            {/* Barber Call and SMS quick action buttons */}
            {appointment.customerPhone && (
              <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between gap-2">
                <span className="text-[9px] font-bold text-stone-500">ارتباط با مراجع:</span>
                <QuickContactButtons
                  phone={appointment.customerPhone}
                  customerName={appointment.customerName}
                  appointmentTime={appointment.startTime}
                  appointmentDate={appointment.date}
                  serviceName={appointment.service?.name}
                  size="sm"
                  showLabels={true}
                />
              </div>
            )}
          </div>

          {/* Service & Beverage Info */}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="p-2 rounded-xl bg-white/60 border border-white/70">
              <span className="text-[8px] text-stone-500 block">خدمت انتخاب‌شده:</span>
              <span className="font-bold text-stone-800 truncate block mt-0.5">{appointment.service?.name}</span>
              <div className="mt-1">
                <PriceDisplay service={appointment.service} size="xs" />
              </div>
            </div>
            <div className="p-2 rounded-xl bg-white/60 border border-white/70">
              <span className="text-[8px] text-stone-500 block">پذیرایی بدو ورود:</span>
              <span className="font-bold text-stone-800 truncate block mt-0.5">{appointment.beverage?.name || 'آب معدنی'}</span>
            </div>
          </div>

          {/* Quiet Session or Customer Notes */}
          {(appointment.isQuietSession || appointment.customerNotes) && (
            <div className="space-y-1 text-[10px]">
              {appointment.isQuietSession && (
                <div className="p-2 rounded-xl bg-[#151517] text-white flex items-center justify-between shadow-2xs">
                  <span className="font-bold text-[#fbdcd9]">درخواست آیین سکوت (Quiet Session)</span>
                  <span className="text-[8px] text-stone-300">بدون مکالمه غیرضروری</span>
                </div>
              )}
              {appointment.customerNotes && (
                <div className="p-2 rounded-xl bg-amber-50/90 border border-amber-200/80 text-amber-900">
                  <span className="text-[8px] font-bold block text-amber-700">یادداشت ثبت‌شده توسط مراجع:</span>
                  <p className="text-[10px] mt-0.5">{appointment.customerNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-1 border-t border-stone-200/60">
            {appointment.status === 'in_progress' && (
              <button
                type="button"
                onClick={handleComplete}
                className="w-full py-2 rounded-full bg-gradient-to-r from-[#fbdcd9] to-[#d88d85] hover:from-white hover:to-[#fbdcd9] text-stone-950 text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>تکمیل و پایان این نوبت</span>
              </button>
            )}

            {(appointment.status === 'confirmed' || appointment.status === 'reserved') && (
              <button
                type="button"
                onClick={handleStart}
                className="w-full py-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current text-stone-200" />
                <span>شروع این نوبت در سوئیت</span>
              </button>
            )}

            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onOpenDossier(appointment.customerId);
                  onClose();
                }}
                className="py-1.5 rounded-full bg-white hover:bg-stone-50 border border-stone-300 text-[9px] font-semibold text-stone-800 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <User className="w-3 h-3" />
                <span>پرونده</span>
              </button>

              {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(true)}
                  className="py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-[9px] font-semibold transition-all flex items-center justify-center gap-1 border border-stone-200 cursor-pointer"
                >
                  <CalendarClock className="w-3 h-3 text-stone-600" />
                  <span>انتقال زمان</span>
                </button>
              )}

              {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                <button
                  type="button"
                  onClick={() => setIsConfirmingCancel(true)}
                  className="py-1.5 px-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-[9px] font-semibold transition-colors border border-rose-200/60"
                >
                  لغو نوبت
                </button>
              )}
            </div>
          </div>

          {/* Cancel Confirmation */}
          {isConfirmingCancel && (
            <div className="p-2.5 rounded-xl bg-rose-100/90 border border-rose-200 text-center space-y-2">
              <p className="text-[10px] text-rose-900 font-bold">آیا از لغو این نوبت اطمینان دارید؟</p>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-3 py-1 bg-rose-600 text-white text-[9px] font-bold rounded-full"
                >
                  بله، لغو شود
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingCancel(false)}
                  className="px-3 py-1 bg-white text-stone-700 text-[9px] rounded-full"
                >
                  انصراف
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <RescheduleModal
          isOpen={showRescheduleModal}
          onClose={() => {
            setShowRescheduleModal(false);
            onClose();
          }}
          appointment={appointment}
        />
      )}
    </>
  );
};
