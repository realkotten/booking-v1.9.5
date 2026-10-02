import React, { useState } from 'react';
import { ServicePerformanceMetric } from '../../../types';
import { toPersianDigits } from '../../../utils/dateUtils';
import { formatPrice } from '../../../utils/formatUtils';
import { Scissors, ArrowUpDown, Sparkles, CheckCircle2, ChevronLeft } from 'lucide-react';

interface ServicePerformanceSectionProps {
  services: ServicePerformanceMetric[];
  onSelectService: (serviceId: string) => void;
}

export const ServicePerformanceSection: React.FC<ServicePerformanceSectionProps> = ({
  services,
  onSelectService,
}) => {
  const [sortBy, setSortBy] = useState<'revenue' | 'bookings' | 'avg'>('revenue');

  const sortedServices = [...services].sort((a, b) => {
    if (sortBy === 'revenue') return b.revenue - a.revenue;
    if (sortBy === 'bookings') return b.totalBookings - a.totalBookings;
    if (sortBy === 'avg') return b.avgRevenue - a.avgRevenue;
    return 0;
  });

  return (
    <div className="bg-white/75 backdrop-blur-md border border-white/80 rounded-2xl p-3 sm:p-3.5 text-stone-900 shadow-2xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white via-[#fbdcd9] to-[#d88d85] shadow-glow-pink flex items-center justify-center border border-white/60 text-stone-900 shrink-0">
            <Scissors className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-xs sm:text-sm">
              عملکرد آیین‌ها و خدمات
            </h3>
            <p className="text-[9px] text-stone-500 font-mono">تحلیل سودآوری، تعداد رزرو و میانگین درآمد هر خدمت</p>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-1 self-end sm:self-auto bg-stone-100/90 border border-stone-200/80 p-0.5 rounded-xl text-[10px]">
          <span className="text-stone-500 px-1 text-[9px] font-mono">مرتب‌سازی:</span>
          <button
            onClick={() => setSortBy('revenue')}
            className={`px-2 py-0.5 rounded-lg transition-colors font-bold ${
              sortBy === 'revenue' ? 'bg-stone-900 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            بیشترین درآمد
          </button>
          <button
            onClick={() => setSortBy('bookings')}
            className={`px-2 py-0.5 rounded-lg transition-colors font-bold ${
              sortBy === 'bookings' ? 'bg-stone-900 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            تعداد رزرو
          </button>
          <button
            onClick={() => setSortBy('avg')}
            className={`px-2 py-0.5 rounded-lg transition-colors font-bold ${
              sortBy === 'avg' ? 'bg-stone-900 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            میانگین فاکتور
          </button>
        </div>
      </div>

      {/* Services List / Table */}
      <div className="space-y-1.5">
        {sortedServices.length === 0 ? (
          <div className="p-6 text-center text-stone-400 text-xs bg-stone-50 rounded-xl border border-stone-200/60">
            در این بازه زمانی خدمتی ثبت نشده است.
          </div>
        ) : (
          sortedServices.map((service, idx) => (
            <div
              key={service.serviceId || idx}
              onClick={() => onSelectService(service.serviceId)}
              className="group p-2.5 sm:p-3 bg-white/70 hover:bg-white/95 border border-white/90 hover:border-stone-300/80 rounded-xl cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs hover:shadow-xs"
            >
              {/* Service Info */}
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-bold font-mono flex items-center justify-center shrink-0">
                  {toPersianDigits(idx + 1)}
                </span>
                <div>
                  <div className="font-bold text-stone-900 text-xs group-hover:text-[#b2665e] transition-colors">
                    {service.name}
                  </div>
                  <div className="text-[9px] text-stone-500 font-mono mt-0.5 flex items-center gap-1.5">
                    <span>{toPersianDigits(service.completedCount)} تکمیل از {toPersianDigits(service.totalBookings)} رزرو</span>
                    <span>·</span>
                    <span>میانگین: {formatPrice(service.avgRevenue)}</span>
                  </div>
                </div>
              </div>

              {/* Revenue & Share Bar */}
              <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-1.5 sm:pt-0 border-stone-100">
                <div className="w-20 sm:w-28 hidden md:block">
                  <div className="flex justify-between text-[9px] text-stone-500 font-mono mb-0.5">
                    <span>سهم درآمد</span>
                    <span className="text-emerald-700 font-bold">٪{toPersianDigits(service.revenuePct)}</span>
                  </div>
                  <div className="w-full h-1 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${service.revenuePct}%` }}
                    />
                  </div>
                </div>

                <div className="text-left">
                  <div className="text-xs sm:text-sm font-bold font-mono text-stone-900">
                    {formatPrice(service.revenue)}
                  </div>
                  <div className="text-[9px] text-[#b2665e] flex items-center gap-0.5 justify-end group-hover:underline">
                    نوبت‌ها <ChevronLeft className="w-2.5 h-2.5" />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
