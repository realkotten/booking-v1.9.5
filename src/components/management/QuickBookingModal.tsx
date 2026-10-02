import React, { useState, useEffect } from 'react';
import { useAtelier } from '../../store/AtelierContext';
import { 
  X, 
  CalendarPlus, 
  User, 
  Phone, 
  Clock, 
  Scissors, 
  AlertCircle
} from 'lucide-react';
import { toPersianDigits, addMinutesToTime } from '../../utils/dateUtils';
import { validateFullName } from '../../utils/customerUtils';

interface QuickBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStartTime?: string;
  initialDurationMinutes?: number;
  initialDayNumber?: number;
  initialDate?: string;
  initialCustomerName?: string;
  initialCustomerPhone?: string;
}

export const QuickBookingModal: React.FC<QuickBookingModalProps> = ({
  isOpen,
  onClose,
  initialStartTime = '16:15',
  initialDurationMinutes = 45,
  initialDayNumber = 22,
  initialDate = 'سه‌شنبه، ۲۲ مهر ۱۴۰۳',
  initialCustomerName = '',
  initialCustomerPhone = '',
}) => {
  const { services, createQuickBooking, activeChair } = useAtelier();

  const [customerName, setCustomerName] = useState(initialCustomerName);
  const [customerPhone, setCustomerPhone] = useState(initialCustomerPhone);
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [price, setPrice] = useState<number>(services[0]?.price || 85);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [durationMinutes, setDurationMinutes] = useState(initialDurationMinutes);
  const [dayNumber, setDayNumber] = useState(initialDayNumber);
  const [dateStr, setDateStr] = useState(initialDate);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialStartTime) setStartTime(initialStartTime);
    if (initialDurationMinutes) setDurationMinutes(initialDurationMinutes);
    if (initialDayNumber) setDayNumber(initialDayNumber);
    if (initialDate) setDateStr(initialDate);
    if (initialCustomerName) setCustomerName(initialCustomerName);
    if (initialCustomerPhone) setCustomerPhone(initialCustomerPhone);
  }, [initialStartTime, initialDurationMinutes, initialDayNumber, initialDate, initialCustomerName, initialCustomerPhone]);

  if (!isOpen) return null;

  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const s = services.find((srv) => srv.id === serviceId);
    if (s) {
      setPrice(s.price);
      setDurationMinutes(s.durationMinutes || 45);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const nameValidation = validateFullName(customerName);
    if (!nameValidation.isValid) {
      setErrorMessage(nameValidation.error || 'لطفاً نام و نام خانوادگی مراجع را با فاصله وارد فرمایید.');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMessage('لطفاً شماره تماس را وارد فرمایید.');
      return;
    }

    const res = createQuickBooking({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      serviceId: selectedServiceId,
      price,
      startTime,
      durationMinutes,
      dayNumber,
      date: dateStr,
      notes: '',
    });

    if (!res.success) {
      setErrorMessage(res.error || 'خطا در ثبت رزرو سریع');
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in" dir="rtl">
      <div className="relative w-full max-w-[360px] max-h-[88vh] flex flex-col bg-white/95 backdrop-blur-2xl border border-white/80 rounded-[32px] p-4 sm:p-5 shadow-2xl animate-in zoom-in-95 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-stone-200 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-stone-900 text-white shadow-sm flex items-center justify-center border border-white/60">
              <CalendarPlus className="w-4 h-4 text-stone-200" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-900">
                رزرو سریع نوبت (Quick Booking)
              </h3>
              <p className="text-[9px] text-stone-500 font-mono">
                {activeChair.name} · سه‌شنبه ۲۲ مهر
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-2 p-2.5 rounded-xl bg-rose-100/90 border border-rose-200 text-rose-800 text-[10px] flex items-center gap-1.5 shrink-0">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-3 space-y-3 overflow-y-auto overscroll-contain pr-0.5 no-scrollbar flex-1 pb-1">
          <div>
            <label className="text-[10px] font-semibold text-stone-700 block mb-1">
              نام و نام خانوادگی مراجع:
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="مثال: بردیا شایان"
              className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs focus:ring-1 focus:ring-stone-700 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-stone-700 block mb-1">
              شماره تماس:
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="09121112233"
              className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-mono focus:ring-1 focus:ring-stone-700 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-stone-700 block mb-1">
                ساعت شروع:
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="16:15"
                className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-mono focus:ring-1 focus:ring-stone-700 outline-none text-center"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-stone-700 block mb-1">
                تعرفه (تومان):
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-mono focus:ring-1 focus:ring-stone-700 outline-none text-center"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-stone-700 block mb-1">
              انتخاب خدمت:
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs focus:ring-1 focus:ring-stone-700 outline-none cursor-pointer"
            >
              {services.map((srv) => (
                <option key={srv.id} value={srv.id}>
                  {srv.name} ({toPersianDigits(srv.durationMinutes)} دقیقه) - {toPersianDigits(srv.price.toLocaleString())} تومان
                  {srv.realPrice && srv.realPrice > srv.price ? ` (تخفیف‌دار از ${toPersianDigits(srv.realPrice.toLocaleString())})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 border-t border-stone-200/70 flex items-center justify-between gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
            >
              تایید و ثبت رزرو
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
