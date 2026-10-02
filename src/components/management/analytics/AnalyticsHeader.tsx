import React, { useState } from 'react';
import { AnalyticsPeriod, AnalyticsCustomRange } from '../../../types';
import { toPersianDigits } from '../../../utils/dateUtils';
import { 
  TrendingUp, 
  Calendar, 
  ChevronDown, 
  Check, 
  Target, 
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';

interface AnalyticsHeaderProps {
  period: AnalyticsPeriod;
  onPeriodChange: (period: AnalyticsPeriod) => void;
  customRange: AnalyticsCustomRange;
  onCustomRangeChange: (range: AnalyticsCustomRange) => void;
  dateRangeDescription: string;
  isTargetMet: boolean;
  achievedPct: number;
  onOpenTargetModal: () => void;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  period,
  onPeriodChange,
  customRange,
  onCustomRangeChange,
  dateRangeDescription,
  isTargetMet,
  achievedPct,
  onOpenTargetModal,
}) => {
  const [isCustomDropdownOpen, setIsCustomDropdownOpen] = useState(false);
  const [startDayInput, setStartDayInput] = useState(customRange.startDay);
  const [endDayInput, setEndDayInput] = useState(customRange.endDay);

  const periods: { key: AnalyticsPeriod; label: string }[] = [
    { key: 'today', label: 'امروز' },
    { key: 'week', label: 'این هفته' },
    { key: 'month', label: 'این ماه' },
    { key: 'year', label: 'این سال' },
    { key: 'custom', label: 'سفارشی' },
  ];

  const handleApplyCustomRange = () => {
    const s = Math.min(startDayInput, endDayInput);
    const e = Math.max(startDayInput, endDayInput);
    onCustomRangeChange({ startDay: s, endDay: e });
    onPeriodChange('custom');
    setIsCustomDropdownOpen(false);
  };

  return (
    <div className="bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl p-3.5 sm:p-4 text-stone-900 shadow-2xs relative overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 relative z-10">
        {/* Title & Date Info */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white via-[#fbdcd9] to-[#d88d85] shadow-glow-pink flex items-center justify-center border border-white/60 text-stone-900 shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-serif font-bold text-stone-900">
                گزارش عملکرد و هوش مالی آتلیه
              </h1>
              <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                محاسبه لحظه‌ای
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-stone-500 font-mono mt-0.5">
              <Calendar className="w-3 h-3 text-stone-400" />
              <span>دوره انتخابی:</span>
              <span className="font-bold text-stone-800">{dateRangeDescription}</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Period Selector Tabs */}
          <div className="flex items-center bg-stone-100/90 border border-stone-200/80 p-0.5 rounded-xl">
            {periods.map((p) => {
              const isActive = period === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => {
                    if (p.key === 'custom') {
                      setIsCustomDropdownOpen(!isCustomDropdownOpen);
                    } else {
                      setIsCustomDropdownOpen(false);
                      onPeriodChange(p.key);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    isActive
                      ? 'bg-[#ea5848] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {p.label}
                  {p.key === 'custom' && (
                    <ChevronDown className={`w-3 h-3 transition-transform ${isCustomDropdownOpen ? 'rotate-180' : ''}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Target Quick Gauge Button */}
          <button
            onClick={onOpenTargetModal}
            className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-stone-50 border border-stone-200/80 text-stone-700 hover:text-stone-900 rounded-xl text-[10px] font-bold transition-colors shadow-2xs"
            title="مشاهده و تغییر تارگت درآمد"
          >
            <Target className="w-3 h-3 text-[#ea5848]" />
            <span>تارگت:</span>
            <span className={`font-mono font-bold ${isTargetMet ? 'text-emerald-600' : 'text-[#ea5848]'}`}>
              ٪{toPersianDigits(achievedPct)}
            </span>
          </button>
        </div>
      </div>

      {/* Custom Date Range Popover */}
      {isCustomDropdownOpen && (
        <div className="mt-2.5 p-3 bg-white/90 border border-stone-200/90 rounded-xl text-xs text-stone-700 shadow-sm animate-in fade-in duration-150">
          <div className="font-bold text-stone-900 mb-2 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#ea5848]" />
              انتخاب روزهای مهرماه ۱۴۰۳ برای تحلیل
            </span>
            <span className="text-[10px] text-stone-500 font-mono">تقویم فعال استودیو</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2.5">
            <div>
              <label className="block text-stone-500 text-[10px] mb-1">از روز (مهر ۱۴۰۳):</label>
              <input
                type="number"
                min={1}
                max={30}
                value={startDayInput}
                onChange={(e) => setStartDayInput(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-900 text-xs focus:outline-none focus:border-stone-400"
              />
            </div>
            <div>
              <label className="block text-stone-500 text-[10px] mb-1">تا روز (مهر ۱۴۰۳):</label>
              <input
                type="number"
                min={1}
                max={30}
                value={endDayInput}
                onChange={(e) => setEndDayInput(parseInt(e.target.value, 10) || 30)}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-900 text-xs focus:outline-none focus:border-stone-400"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 text-[10px]">
            <button
              onClick={() => setIsCustomDropdownOpen(false)}
              className="px-2.5 py-1 text-stone-500 hover:text-stone-800"
            >
              انصراف
            </button>
            <button
              onClick={handleApplyCustomRange}
              className="px-3 py-1 bg-stone-900 text-white font-bold rounded-lg hover:bg-black transition-colors flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              اعمال فیلتر سفارشی
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
