import React, { useState } from 'react';
import { TrendDataPoint, AnalyticsPeriod } from '../../../types';
import { toPersianDigits } from '../../../utils/dateUtils';
import { formatPrice } from '../../../utils/formatUtils';
import { BarChart3, LineChart, DollarSign, CalendarCheck } from 'lucide-react';

interface AnalyticsTrendsSectionProps {
  revenueTrend: TrendDataPoint[];
  appointmentTrend: TrendDataPoint[];
  period: AnalyticsPeriod;
}

export const AnalyticsTrendsSection: React.FC<AnalyticsTrendsSectionProps> = ({
  revenueTrend,
  appointmentTrend,
  period,
}) => {
  const [activeTab, setActiveTab] = useState<'revenue' | 'appointments'>('revenue');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Determine max values for relative bar height scaling
  const maxRevenue = Math.max(...revenueTrend.map((p) => p.totalRevenue), 100);
  const maxAppointments = Math.max(...appointmentTrend.map((p) => p.totalAppointments), 5);

  return (
    <div className="bg-white/75 backdrop-blur-md border border-white/80 rounded-2xl p-3 sm:p-3.5 text-stone-900 shadow-2xs">
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white via-[#fbdcd9] to-[#d88d85] shadow-glow-pink flex items-center justify-center border border-white/60 text-stone-900 shrink-0">
            {activeTab === 'revenue' ? <DollarSign className="w-4 h-4" /> : <CalendarCheck className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-xs sm:text-sm">
              {activeTab === 'revenue' ? 'نمودار روند درآمدی آتلیه' : 'نمودار توزیع زمانی نوبت‌ها'}
            </h3>
            <p className="text-[9px] text-stone-500 font-mono">
              {activeTab === 'revenue' 
                ? 'تفکیک جریان نقدینگی به تفکیک زمان' 
                : 'بررسی حجم مراجعات و نوبت‌های تکمیل‌شده'}
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center bg-stone-100/90 border border-stone-200/80 p-0.5 rounded-xl">
            <button
              onClick={() => setActiveTab('revenue')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                activeTab === 'revenue'
                  ? 'bg-[#ea5848] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              روند درآمد
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                activeTab === 'appointments'
                  ? 'bg-[#ea5848] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              تعداد نوبت‌ها
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-[9px] text-stone-500 mb-3 pb-2 border-b border-stone-100">
        {activeTab === 'revenue' ? (
          <>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#ea5848] inline-block" />
              <span>درآمد خدمات آتلیه</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" />
              <span>تکمیل‌شده</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-stone-700 inline-block" />
              <span>کل نوبت‌ها</span>
            </div>
          </>
        )}
      </div>

      {/* Chart Canvas / Visual Bars */}
      <div className="h-44 sm:h-52 flex items-end justify-between gap-1.5 sm:gap-3 pt-4 px-2 relative border-b border-stone-100">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
          <div className="border-b border-stone-100 w-full" />
          <div className="border-b border-stone-100 w-full" />
          <div className="border-b border-stone-100 w-full" />
        </div>

        {activeTab === 'revenue' ? (
          revenueTrend.map((point, idx) => {
            const totalHeight = Math.max(8, (point.totalRevenue / maxRevenue) * 100);
            const isHovered = hoveredPointIndex === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredPointIndex(idx)}
                onMouseLeave={() => setHoveredPointIndex(null)}
                className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
              >
                {/* Tooltip on Hover */}
                {isHovered && (
                  <div className="absolute -top-10 z-20 bg-stone-900 border border-stone-700 text-white rounded-lg px-2 py-1 text-[10px] shadow-xl whitespace-nowrap animate-in fade-in">
                    <div className="font-bold text-[#fbdcd9]">{point.label} {point.sublabel ? `(${point.sublabel})` : ''}</div>
                    <div>درآمد: {formatPrice(point.totalRevenue)}</div>
                  </div>
                )}

                {/* Amount Label above bar */}
                <span className="text-[8px] text-stone-500 mb-1 font-mono group-hover:text-stone-900 transition-colors">
                  {formatPrice(point.totalRevenue)}
                </span>

                {/* Bar */}
                <div
                  className="w-full max-w-[36px] bg-stone-100 rounded-t-lg overflow-hidden flex flex-col justify-end transition-all duration-300 border border-stone-200/80 group-hover:border-[#ea5848]"
                  style={{ height: `${totalHeight}%` }}
                >
                  <div
                    className="w-full h-full bg-gradient-to-t from-[#853e36] to-[#d88d85] transition-all"
                  />
                </div>
              </div>
            );
          })
        ) : (
          appointmentTrend.map((point, idx) => {
            const totalHeight = Math.max(8, (point.totalAppointments / maxAppointments) * 100);
            const isHovered = hoveredPointIndex === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredPointIndex(idx)}
                onMouseLeave={() => setHoveredPointIndex(null)}
                className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
              >
                {/* Tooltip on Hover */}
                {isHovered && (
                  <div className="absolute -top-10 z-20 bg-stone-900 border border-stone-700 text-white rounded-lg px-2 py-1 text-[10px] shadow-xl whitespace-nowrap animate-in fade-in">
                    <div className="font-bold text-[#fbdcd9]">{point.label} {point.sublabel ? `(${point.sublabel})` : ''}</div>
                    <div>کل نوبت‌ها: {toPersianDigits(point.totalAppointments)}</div>
                    <div className="text-emerald-400 text-[9px]">تکمیل‌شده: {toPersianDigits(point.completedAppointments)}</div>
                  </div>
                )}

                {/* Count Label */}
                <span className="text-[8px] text-stone-500 mb-1 font-mono group-hover:text-stone-900 transition-colors">
                  {toPersianDigits(point.totalAppointments)}
                </span>

                {/* Bar */}
                <div
                  className="w-full max-w-[36px] bg-stone-800 rounded-t-lg transition-all duration-300 border border-stone-300"
                  style={{ height: `${totalHeight}%` }}
                >
                  <div
                    className="w-full bg-emerald-500 rounded-t-lg"
                    style={{ height: `${point.totalAppointments > 0 ? (point.completedAppointments / point.totalAppointments) * 100 : 0}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* X-Axis Labels */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-3 pt-2 px-2 text-[9px] text-stone-500 font-mono">
        {revenueTrend.map((point, idx) => (
          <div key={idx} className="flex-1 text-center font-bold">
            <div>{point.label}</div>
            {point.sublabel && (
              <div className="text-[8px] text-stone-400 font-normal">{point.sublabel}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
