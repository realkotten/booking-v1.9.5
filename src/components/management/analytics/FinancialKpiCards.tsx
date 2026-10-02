import React from 'react';
import { AnalyticsSummary } from '../../../types';
import { toPersianDigits } from '../../../utils/dateUtils';
import { formatPrice } from '../../../utils/formatUtils';
import { 
  DollarSign, 
  Scissors, 
  ReceiptText, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  CalendarCheck,
  Percent
} from 'lucide-react';

interface FinancialKpiCardsProps {
  summary: AnalyticsSummary;
  onSelectInspection: (type: 'total' | 'service' | 'transactions' | 'appointments') => void;
}

export const FinancialKpiCards: React.FC<FinancialKpiCardsProps> = ({
  summary,
  onSelectInspection,
}) => {
  const {
    totalRevenue,
    serviceRevenue,
    avgTransactionValue,
    transactionCount,
    serviceTransactionCount,
    revenueGrowthPct,
    isGrowthPositive,
    occupancyRate,
  } = summary;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
      {/* 1. Total Revenue Card */}
      <div 
        onClick={() => onSelectInspection('total')}
        className="group p-3 rounded-2xl bg-white/75 hover:bg-white/95 backdrop-blur-md border border-white/80 hover:border-stone-300/80 cursor-pointer shadow-2xs hover:shadow-md transition-all space-y-2 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-stone-600 group-hover:text-stone-900 transition-colors">
            درآمد کل آتلیه
          </span>
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-white via-[#fbdcd9] to-[#d88d85] shadow-glow-pink flex items-center justify-center text-stone-900 border border-white/60">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
        </div>

        <div>
          <span className="text-xl sm:text-2xl font-bold font-mono text-stone-900 tracking-tight block">
            {formatPrice(totalRevenue)}
          </span>
        </div>

        <div className="flex items-center justify-between text-[9px] pt-1.5 border-t border-stone-100">
          <div className="flex items-center gap-1">
            {revenueGrowthPct !== null ? (
              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-bold text-[9px] ${
                isGrowthPositive 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                  : 'bg-rose-50 text-rose-700 border border-rose-200/60'
              }`}>
                {isGrowthPositive ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                ٪{toPersianDigits(Math.abs(revenueGrowthPct))}
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] bg-stone-100 text-stone-500">
                <Minus className="w-2.5 h-2.5" /> پایه
              </span>
            )}
            <span className="text-stone-500">نسبت به قبل</span>
          </div>

          <span className="text-[#b2665e] font-medium flex items-center gap-0.5 group-hover:underline">
            جزئیات <ArrowUpRight className="w-2.5 h-2.5" />
          </span>
        </div>
      </div>

      {/* 2. Service Revenue Card */}
      <div 
        onClick={() => onSelectInspection('service')}
        className="group p-3 rounded-2xl bg-white/75 hover:bg-white/95 backdrop-blur-md border border-white/80 hover:border-stone-300/80 cursor-pointer shadow-2xs hover:shadow-md transition-all space-y-2 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-stone-600 group-hover:text-stone-900 transition-colors">
            درآمد خدمات و آیین‌ها
          </span>
          <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700 shadow-2xs">
            <Scissors className="w-3.5 h-3.5" />
          </div>
        </div>

        <div>
          <span className="text-xl sm:text-2xl font-bold font-mono text-stone-900 tracking-tight block">
            {formatPrice(serviceRevenue)}
          </span>
        </div>

        <div className="flex items-center justify-between text-[9px] pt-1.5 border-t border-stone-100">
          <span className="text-stone-500 font-mono">
            {toPersianDigits(serviceTransactionCount)} نوبت تکمیل‌شده
          </span>
          <span className="text-emerald-700 font-medium flex items-center gap-0.5 group-hover:underline">
            آیین‌ها <ArrowUpRight className="w-2.5 h-2.5" />
          </span>
        </div>
      </div>

      {/* 3. Occupancy Rate Card */}
      <div 
        onClick={() => onSelectInspection('appointments')}
        className="group p-3 rounded-2xl bg-white/75 hover:bg-white/95 backdrop-blur-md border border-white/80 hover:border-stone-300/80 cursor-pointer shadow-2xs hover:shadow-md transition-all space-y-2 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-stone-600 group-hover:text-stone-900 transition-colors">
            ضریب اشغال و بهره‌وری
          </span>
          <div className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-700 shadow-2xs">
            <CalendarCheck className="w-3.5 h-3.5" />
          </div>
        </div>

        <div>
          <span className="text-xl sm:text-2xl font-bold font-mono text-stone-900 tracking-tight block">
            ٪{toPersianDigits(occupancyRate || 0)}
          </span>
        </div>

        <div className="flex items-center justify-between text-[9px] pt-1.5 border-t border-stone-100">
          <span className="text-stone-500 font-mono">
            {toPersianDigits(serviceTransactionCount)} نوبت ثبت‌شده
          </span>
          <span className="text-blue-700 font-medium flex items-center gap-0.5 group-hover:underline">
            تقویم <ArrowUpRight className="w-2.5 h-2.5" />
          </span>
        </div>
      </div>

      {/* 4. Average Transaction Value Card */}
      <div 
        onClick={() => onSelectInspection('transactions')}
        className="group p-3 rounded-2xl bg-white/75 hover:bg-white/95 backdrop-blur-md border border-white/80 hover:border-stone-300/80 cursor-pointer shadow-2xs hover:shadow-md transition-all space-y-2 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-stone-600 group-hover:text-stone-900 transition-colors">
            میانگین ارزش هر نوبت (ATV)
          </span>
          <div className="w-7 h-7 rounded-xl bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-700 shadow-2xs">
            <ReceiptText className="w-3.5 h-3.5" />
          </div>
        </div>

        <div>
          <span className="text-xl sm:text-2xl font-bold font-mono text-stone-900 tracking-tight block">
            {formatPrice(avgTransactionValue)}
          </span>
        </div>

        <div className="flex items-center justify-between text-[9px] pt-1.5 border-t border-stone-100">
          <span className="text-stone-500 font-mono">
            {toPersianDigits(transactionCount)} تراکنش معتبر
          </span>
          <span className="text-purple-700 font-medium flex items-center gap-0.5 group-hover:underline">
            تراکنش‌ها <ArrowUpRight className="w-2.5 h-2.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
