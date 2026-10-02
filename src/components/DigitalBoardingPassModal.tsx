import React, { useState } from 'react';
import { Appointment } from '../types';
import { 
  X, 
  Scissors, 
  MapPin, 
  QrCode, 
  Check, 
  Clock, 
  Coffee, 
  CheckCircle,
  Sparkles,
  VolumeX,
  Share2,
  Bookmark
} from 'lucide-react';
import { toPersianDigits, formatAppointmentDate } from '../utils/dateUtils';
import { formatPrice } from '../utils/formatUtils';
import { getAppointmentStatusBadge } from '../utils/statusUtils';
import { useAtelier } from '../store/AtelierContext';

interface DigitalBoardingPassModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalBoardingPassModal: React.FC<DigitalBoardingPassModalProps> = ({
  appointment,
  isOpen,
  onClose,
}) => {
  const { activeBarber, settings } = useAtelier();
  const defaultBarber = settings?.profile?.masterName?.trim() || activeBarber?.name || 'استاد پیرایش';
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen || !appointment) return null;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const statusBadge = getAppointmentStatusBadge(appointment.status);
  const isCancelled = appointment.status === 'cancelled';
  const isCompleted = appointment.status === 'completed';

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/60 backdrop-blur-md animate-fade-in" 
      dir="rtl"
      onClick={onClose}
    >
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-60 px-4 py-2 rounded-full bg-[#151517] text-white shadow-2xl backdrop-blur-xl flex items-center gap-2 border border-white/20 text-xs font-medium animate-fade-in">
          <CheckCircle className="w-3.5 h-3.5 text-[#fbdcd9]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div 
        className="relative w-full max-w-[356px] bg-[#14161d]/90 backdrop-blur-3xl border border-white/20 rounded-[34px] p-4 text-white shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8),inset_0_1.5px_2px_rgba(255,255,255,0.2)] space-y-3 max-h-[92vh] overflow-y-auto no-scrollbar animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[#fedecb] border border-white/20">
              <Scissors className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[9px] text-[#fedecb] font-semibold">آرایشگاه رویال · شعبه سعادت‌آباد</p>
              <h2 className="text-xs font-serif font-bold text-white">کارت دیجیتال ورود به سالن</h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Boarding Pass Card - Morphic Frosted Glass */}
        <div className="bg-gradient-to-br from-[#222733]/85 to-[#161a22]/90 backdrop-blur-2xl rounded-[26px] p-3.5 border border-white/20 relative overflow-hidden space-y-3 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),0_12px_24px_-4px_rgba(0,0,0,0.4)]">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-[#e4ddf6]/10 blur-2xl pointer-events-none" />

          {/* Ticket Header */}
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[8px] font-mono tracking-widest text-[#fedecb] block uppercase">
                BOARDING PASS · {appointment.appointmentNumber || appointment.id}
              </span>
              <h3 className="text-sm font-serif font-bold text-white mt-0.5 leading-snug">
                {appointment.service?.name}
              </h3>
            </div>
            <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border ${
              isCancelled 
                ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                : isCompleted 
                ? 'bg-stone-800 text-stone-300 border-stone-700'
                : 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
            }`}>
              {statusBadge.label}
            </span>
          </div>

          {/* Key Info Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-black/40 rounded-2xl p-2.5 border border-white/5">
            <div>
              <p className="text-[9px] text-stone-400">تاریخ و زمان نوبت</p>
              <p className="text-white font-medium text-[11px] mt-0.5">
                {formatAppointmentDate(appointment)}
              </p>
              <p className="text-[#fedecb] font-mono text-[11px]">
                ساعت {toPersianDigits(appointment.startTime)} ({toPersianDigits(appointment.durationMinutes || 45)} دقیقه)
              </p>
            </div>
            <div>
              <p className="text-[9px] text-stone-400">آرایشگر و جایگاه</p>
              <p className="text-white font-medium text-[11px] mt-0.5">
                {appointment.barberName || defaultBarber}
              </p>
              <p className="text-stone-300 text-[10px]">
                {appointment.chairName || 'صندلی اختصاصی ۰۱'}
              </p>
            </div>
          </div>

          {/* Hospitality & Quiet Session */}
          <div className="space-y-1.5 text-[10px]">
            {appointment.isQuietSession && (
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white/5 border border-white/10 text-[#fedecb]">
                <VolumeX className="w-3.5 h-3.5 text-[#fedecb] shrink-0" />
                <span>درخواست آیین سکوت و تمرکز ذهن (Quiet Session فعال)</span>
              </div>
            )}

            {appointment.beverage && (
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white/5 border border-white/10 text-stone-300">
                <Coffee className="w-3.5 h-3.5 text-[#fedecb] shrink-0" />
                <span>پذیرایی اختصاصی: {appointment.beverage.name}</span>
              </div>
            )}

            {appointment.additionalAccoutrements && appointment.additionalAccoutrements.length > 0 && (
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-stone-300">
                <span className="text-stone-400 block text-[9px] mb-0.5">خدمات تکمیلی:</span>
                <div className="flex flex-wrap gap-1">
                  {appointment.additionalAccoutrements.map((acc, i) => (
                    <span key={i} className="text-[9px] bg-white/10 text-[#fedecb] px-1.5 py-0.5 rounded">
                      {acc.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {appointment.customerNotes && (
              <div className="p-2 rounded-xl bg-black/40 border border-stone-800 text-[10px] text-stone-300 italic">
                یادداشت مراجع: «{appointment.customerNotes}»
              </div>
            )}
          </div>

          {/* Financials Breakdown */}
          <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-[11px]">
            <div>
              <span className="text-stone-400 text-[9px] block">مجموع هزینه نوبت</span>
              <div className="flex items-center gap-2 flex-wrap mt-0.5">
                {((appointment.priceSummary?.hasDiscount && appointment.priceSummary.originalTotal) ||
                  (appointment.originalServicePrice && appointment.originalServicePrice > (appointment.servicePrice || 0)) ||
                  (appointment.service?.realPrice && appointment.service.realPrice > (appointment.service.price || 0))) && (
                  <span className="line-through text-stone-500 text-[10px] tabular-nums">
                    {formatPrice(
                      appointment.priceSummary?.originalTotal ||
                      (appointment.originalServicePrice ? appointment.originalServicePrice + (appointment.accoutrementsPrice || 0) : null) ||
                      (appointment.service?.realPrice ? appointment.service.realPrice + (appointment.accoutrementsPrice || 0) : null) ||
                      0
                    )}
                  </span>
                )}
                <span className="font-bold text-white tabular-nums">
                  {appointment.totalAmount ? formatPrice(appointment.totalAmount) : 'طبق فاکتور'}
                </span>
                {appointment.priceSummary?.hasDiscount && appointment.priceSummary.discountAmount && (
                  <span className="text-[9px] bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 px-2 py-0.2 rounded-full font-bold">
                    سود شما: {formatPrice(appointment.priceSummary.discountAmount)}
                  </span>
                )}
              </div>
            </div>
            <div className="text-left" dir="ltr">
              <span className="text-[9px] text-emerald-300 font-bold bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/40">
                تأییدشده و فعال
              </span>
            </div>
          </div>

          {/* Digital Signature & Barcode for Suite NFC */}
          <div className="pt-2.5 border-t border-dashed border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="w-9 h-9 text-white/90" />
              <div>
                <p className="text-[8px] text-stone-400 uppercase tracking-wider">کلید دیجیتال ورود سالن</p>
                <p className="text-[10px] font-mono text-[#fedecb]">ROYAL-{appointment.id.slice(-6).toUpperCase()}-PASS</p>
              </div>
            </div>
            <div className="text-left">
              <span className="text-[8px] font-mono text-stone-500 block">ENCRYPTED</span>
              <span className="text-[9px] text-stone-400 font-mono">NFC · BLUETOOTH</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => triggerToast('کارت دیجیتال نوبت با موفقیت در دستگاه شما ذخیره شد')}
            className="py-2.5 px-3 bg-[#22262e] hover:bg-[#1a1d23] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs border border-white/10 cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-300" />
            <span>ذخیره کارت</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-3 bg-white/10 hover:bg-white/15 text-stone-200 rounded-xl text-xs font-medium transition-all cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
