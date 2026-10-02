import React, { useState } from 'react';
import { useAtelier } from '../../store/AtelierContext';
import { 
  X, 
  Coffee, 
  Clock, 
  AlertCircle, 
  Sparkles,
  Scissors
} from 'lucide-react';
import { toPersianDigits, addMinutesToTime } from '../../utils/dateUtils';

interface BlockBreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStartTime?: string;
}

const REASON_PRESETS = [
  'استراحت پرسنلی و قهوه',
  'ناهار و تجدید قوا',
  'ضدعفونی و تهویه هوای سوئیت',
  'استریل ابزار و تیغ دمشقی',
  'امور شخصی و اداری',
];

const DURATION_PRESETS = [15, 30, 45, 60];

export const BlockBreakModal: React.FC<BlockBreakModalProps> = ({
  isOpen,
  onClose,
  defaultStartTime = '13:00',
}) => {
  const { createBlockBreak, activeChair } = useAtelier();

  const [startTime, setStartTime] = useState(defaultStartTime);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [selectedReason, setSelectedReason] = useState(REASON_PRESETS[0]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const endTime = addMinutesToTime(startTime, durationMinutes);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = createBlockBreak({
      startTime,
      durationMinutes,
      reason: selectedReason,
    });

    if (!result.success) {
      setErrorMessage(result.error || 'خطا در ثبت بازه استراحت');
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
              <Coffee className="w-4 h-4 text-stone-200" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-900">
                ثبت استراحت / مسدودسازی صندلی
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
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-stone-700 block mb-1">
                ساعت شروع:
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="13:00"
                className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-mono focus:ring-1 focus:ring-stone-700 outline-none text-center"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-stone-700 block mb-1">
                پایان بازه:
              </label>
              <div className="w-full px-3 py-2 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 text-xs font-mono text-center">
                {toPersianDigits(endTime)}
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-stone-700 block mb-1">
              مدت زمان:
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {DURATION_PRESETS.map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setDurationMinutes(dur)}
                  className={`py-1.5 rounded-xl text-[10px] font-mono font-semibold border transition-all cursor-pointer ${
                    durationMinutes === dur
                      ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                      : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {toPersianDigits(dur)} دقیقه
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-stone-700 block mb-1">
              علت مسدودسازی:
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs focus:ring-1 focus:ring-stone-700 outline-none cursor-pointer"
            >
              {REASON_PRESETS.map((r, i) => (
                <option key={i} value={r}>
                  {r}
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
              ثبت بازه استراحت
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
