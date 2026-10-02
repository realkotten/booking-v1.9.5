import React from 'react';
import { Appointment } from '../../types';
import { 
  X, 
  Scissors, 
  Clock, 
  Calendar, 
  User, 
  Coffee, 
  DollarSign, 
  FileText, 
  CheckCircle2, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { toPersianDigits } from '../../utils/dateUtils';
import { formatPrice } from '../../utils/formatUtils';
import { getAppointmentStatusBadge, getBookingSourceLabel } from '../../utils/statusUtils';
import { useAtelier } from '../../store/AtelierContext';

interface VisitDetailModalProps {
  visit: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VisitDetailModal: React.FC<VisitDetailModalProps> = ({
  visit,
  isOpen,
  onClose,
}) => {
  const { activeBarber, settings } = useAtelier();
  const defaultBarber = settings?.profile?.masterName?.trim() || activeBarber?.name || 'آرایشگر اختصاصی';

  if (!isOpen || !visit) return null;

  const statusBadge = getAppointmentStatusBadge(visit.status);
  const sourceLabel = getBookingSourceLabel(visit.bookingSource);

  return (
    <div
      id="visit-detail-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-sm animate-in fade-in"
      dir="rtl"
    >
      <div
        id="visit-detail-modal-container"
        className="relative w-full max-w-[340px] bg-white/95 backdrop-blur-2xl border border-white/80 rounded-[32px] p-4 shadow-2xl space-y-3 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white via-[#fbdcd9] to-[#d88d85] shadow-glow-pink flex items-center justify-center border border-white/60">
              <Calendar className="w-4 h-4 text-stone-900" />
            </div>
            <div>
              <h3 className="text-xs font-serif font-bold text-stone-900">
                گزارش جزئیات نوبت و مراجعه
              </h3>
              <p className="text-[9px] text-stone-500 font-mono">
                {visit.appointmentNumber || 'AV-HIST'} · {sourceLabel.label}
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-visit-detail"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Status & Date banner */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-stone-50/80 border border-stone-200/70">
          <div>
            <p className="text-[10px] font-bold text-stone-900">{visit.date}</p>
            <p className="text-[9px] text-stone-500 font-mono">
              ساعت {toPersianDigits(visit.startTime)} تا {toPersianDigits(visit.endTime)} ({toPersianDigits(visit.durationMinutes || 45)} دقیقه)
            </p>
          </div>
          <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold ${statusBadge.badgeClass}`}>
            {statusBadge.label}
          </span>
        </div>

        {/* Service Details */}
        <div className="p-3 rounded-2xl bg-white/80 border border-white/90 shadow-2xs space-y-2">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center shrink-0 mt-0.5">
              <Scissors className="w-3 h-3 text-stone-700" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-xs text-stone-900">{visit.service?.name || 'خدمت پیرایش آتلیه'}</h4>
              <p className="text-[9px] text-stone-500 leading-relaxed mt-0.5">
                {visit.service?.description || `آیین اختصاصی پیرایش ${defaultBarber} در سوئیت خصوصی`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-stone-100 text-[9px] text-stone-600">
            <div>
              <span className="text-stone-400">صندلی:</span>{' '}
              <span className="font-medium text-stone-800">{visit.chairName || 'صندلی اصلی'}</span>
            </div>
            <div>
              <span className="text-stone-400">آرایشگر:</span>{' '}
              <span className="font-medium text-stone-800">{visit.barberName || defaultBarber}</span>
            </div>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="p-3 rounded-2xl bg-white/80 border border-white/90 shadow-2xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-stone-800 text-[10px] font-bold">
            <DollarSign className="w-3.5 h-3.5 text-[#b2665e]" />
            <span>محاسبه مالی مراجعه</span>
          </div>

          <div className="space-y-1 text-[9px]">
            <div className="flex justify-between text-stone-500">
              <span>هزینه آیین اصلی خدمت:</span>
              <div className="flex items-center gap-1.5 font-mono">
                {((visit.originalServicePrice && visit.originalServicePrice > (visit.servicePrice || 0)) ||
                  (visit.service?.realPrice && visit.service.realPrice > (visit.service.price || 0))) && (
                  <span className="line-through text-stone-400 text-[8px]">
                    {formatPrice(visit.originalServicePrice || visit.service?.realPrice || 0)}
                  </span>
                )}
                <span className="text-stone-800 font-bold">{formatPrice(visit.servicePrice || 0)}</span>
              </div>
            </div>
            {((visit.discountAmount && visit.discountAmount > 0) ||
              (visit.service?.realPrice && visit.service.realPrice > (visit.service.price || 0))) && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>تخفیف ویژه اعمال‌شده:</span>
                <span className="font-mono">
                  - {formatPrice(visit.discountAmount || ((visit.service?.realPrice || 0) - (visit.service?.price || 0)))}
                </span>
              </div>
            )}
            {(visit.tipAmount || 0) > 0 && (
              <div className="flex justify-between text-stone-500">
                <span>انعام و قدردانی:</span>
                <span className="font-mono text-stone-800">{formatPrice(visit.tipAmount || 0)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-stone-900 pt-1.5 border-t border-stone-200/60">
              <span>مجموع پرداختی:</span>
              <span className="font-mono text-sm text-[#b2665e]">
                {formatPrice(visit.totalAmount || visit.servicePrice || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Technical & Styling Notes */}
        <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/50 space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-900 text-[10px] font-bold">
            <FileText className="w-3.5 h-3.5 text-amber-700" />
            <span>یادداشت‌های فنی استاد در این نوبت</span>
          </div>
          <p className="text-[9px] text-stone-700 leading-relaxed">
            {visit.stylingNotes || 'نوبت با استاندارد کامل اجرا شد و یادداشت تکمیلی ثبت نشده است.'}
          </p>
        </div>

        {/* Beverage / Hospitality if available */}
        {visit.beverage && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-100/70 text-[9px] text-stone-600">
            <Coffee className="w-3.5 h-3.5 text-[#b2665e]" />
            <span>نوشیدنی سرو شده:</span>
            <span className="font-bold text-stone-800">{visit.beverage.name}</span>
          </div>
        )}

        {/* Footer */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2 rounded-xl bg-stone-900 text-white font-medium text-xs hover:bg-black transition-colors"
        >
          بستن جزئیات
        </button>
      </div>
    </div>
  );
};
