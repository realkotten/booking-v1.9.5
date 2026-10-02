import React from 'react';
import { Appointment } from '../types';
import { AlertCircle, Calendar, Clock, Scissors, X } from 'lucide-react';
import { toPersianDigits, formatAppointmentDate } from '../utils/dateUtils';
import { useAtelier } from '../store/AtelierContext';

interface CancelAppointmentModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: (aptId: string) => void;
}

export const CancelAppointmentModal: React.FC<CancelAppointmentModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onConfirmCancel,
}) => {
  const { activeBarber, settings } = useAtelier();
  const defaultBarber = settings?.profile?.masterName?.trim() || activeBarber?.name || 'آرایشگر اختصاصی';

  if (!isOpen || !appointment) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[340px] clay-card rounded-[32px] border border-white p-5 text-stone-900 shadow-2xl space-y-4 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon */}
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-2xl bg-[#fadfe8] border border-rose-200/80 text-[#8a3350] flex items-center justify-center shadow-2xs">
            <AlertCircle className="w-5 h-5" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/80 hover:bg-white text-stone-500 flex items-center justify-center transition-colors shadow-2xs"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Title and message */}
        <div className="space-y-1 text-right">
          <h2 className="text-base font-serif font-bold text-stone-900">
            لغو نوبت آرایشگاه
          </h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            آیا از لغو این نوبت اطمینان دارید؟ با لغو نوبت، ساعت انتخابی برای سایر مراجعین آزاد می‌گردد.
          </p>
        </div>

        {/* Appointment Card Preview */}
        <div className="p-3.5 rounded-2xl clay-card-subtle border border-white space-y-2 text-right">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-900">
              {appointment.service?.name}
            </span>
            <span className="text-[10px] font-mono text-stone-500" dir="ltr">
              #{appointment.appointmentNumber || appointment.id.slice(-6)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-[#bf5938]" />
              <span>{formatAppointmentDate(appointment)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-[#bf5938]" />
              <span>ساعت {toPersianDigits(appointment.startTime)}</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-stone-200/60 flex items-center justify-between text-[10px] text-stone-500">
            <span>آرایشگر: {appointment.barberName || defaultBarber}</span>
            <span>{appointment.chairName || 'صندلی اختصاصی'}</span>
          </div>
        </div>

        {/* Cancellation Policy Note */}
        <div className="p-2.5 rounded-xl bg-[#fdf2ee] border border-[#f3d0c4] text-[10px] text-[#8c351b] leading-normal">
          <span className="font-bold block mb-0.5">خط‌مشی سالن رویال:</span>
          لغو نوبت بدون جریمه انجام می‌شود و ساعت بلافاصله در تقویم آرایشگاه آزاد خواهد شد.
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => onConfirmCancel(appointment.id)}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>تایید و لغو نوبت</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl clay-card-subtle hover:bg-white text-stone-800 text-xs font-medium transition-all border border-white cursor-pointer"
          >
            انصراف و حفظ نوبت
          </button>
        </div>
      </div>
    </div>
  );
};
