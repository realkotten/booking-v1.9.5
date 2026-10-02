import React from 'react';
import { AnalyticsSummary } from '../../../types';
import { toPersianDigits } from '../../../utils/dateUtils';
import { 
  CalendarCheck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  UserX, 
  Percent,
  Armchair,
  Gauge
} from 'lucide-react';

interface AppointmentKpisSectionProps {
  summary: AnalyticsSummary;
  onInspectAppointments: (filterType?: string) => void;
}

export const AppointmentKpisSection: React.FC<AppointmentKpisSectionProps> = ({
  summary,
  onInspectAppointments,
}) => {
  const {
    totalAppointments,
    completedAppointments,
    cancelledAppointments,
    noShowAppointments,
    inProgressOrConfirmedAppointments,
    completionRate,
    cancellationRate,
    noShowRate,
    occupancyRate,
    bookedMinutes,
    availableMinutes,
  } = summary;

  const bookedHours = (bookedMinutes / 60).toFixed(1);
  const totalHours = (availableMinutes / 60).toFixed(0);

  return (
    <div className="bg-white/75 backdrop-blur-md border border-white/80 rounded-2xl p-3 sm:p-3.5 text-stone-900 shadow-2xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white via-[#fbdcd9] to-[#d88d85] shadow-glow-pink flex items-center justify-center border border-white/60 text-stone-900 shrink-0">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-xs sm:text-sm">
              شاخص‌های بهره‌وری و نوبت‌دهی
            </h3>
            <p className="text-[9px] text-stone-500 font-mono">توزیع وضعیت نوبت‌ها و نرخ اشغال صندلی‌ها</p>
          </div>
        </div>

        <button
          onClick={() => onInspectAppointments('all')}
          className="text-[10px] text-[#ea5848] hover:underline font-bold cursor-pointer"
        >
          مشاهده لیست کامل
        </button>
      </div>

      {/* KPI Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {/* 1. Total Appointments */}
        <div 
          onClick={() => onInspectAppointments('all')}
          className="bg-stone-50/80 hover:bg-white border border-stone-100/80 hover:border-stone-200 rounded-xl p-2.5 cursor-pointer transition-all flex flex-col justify-between shadow-2xs"
        >
          <div className="flex items-center justify-between text-stone-500 text-[10px] mb-1">
            <span>کل نوبت‌ها</span>
            <CalendarCheck className="w-3 h-3 text-stone-400" />
          </div>
          <div className="text-lg font-bold font-mono text-stone-900">
            {toPersianDigits(totalAppointments)}
          </div>
          <div className="text-[8px] text-stone-400 font-mono mt-0.5">
            رزرو ثبت‌شده
          </div>
        </div>

        {/* 2. Completed Appointments */}
        <div 
          onClick={() => onInspectAppointments('completed')}
          className="bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 hover:border-emerald-200 rounded-xl p-2.5 cursor-pointer transition-all flex flex-col justify-between shadow-2xs"
        >
          <div className="flex items-center justify-between text-stone-600 text-[10px] mb-1">
            <span>تکمیل‌شده</span>
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          </div>
          <div className="text-lg font-bold font-mono text-emerald-700">
            {toPersianDigits(completedAppointments)}
          </div>
          <div className="text-[8px] text-emerald-700 font-bold font-mono mt-0.5">
            ٪{toPersianDigits(completionRate)} موفقیت
          </div>
        </div>

        {/* 3. In Progress / Confirmed */}
        <div 
          onClick={() => onInspectAppointments('active')}
          className="bg-amber-50/50 hover:bg-amber-50 border border-amber-100 hover:border-amber-200 rounded-xl p-2.5 cursor-pointer transition-all flex flex-col justify-between shadow-2xs"
        >
          <div className="flex items-center justify-between text-stone-600 text-[10px] mb-1">
            <span>جاری / تایید</span>
            <Clock className="w-3 h-3 text-amber-600" />
          </div>
          <div className="text-lg font-bold font-mono text-amber-700">
            {toPersianDigits(inProgressOrConfirmedAppointments)}
          </div>
          <div className="text-[8px] text-amber-700 font-mono mt-0.5">
            در انتظار / اجرا
          </div>
        </div>

        {/* 4. Cancelled */}
        <div 
          onClick={() => onInspectAppointments('cancelled')}
          className="bg-rose-50/50 hover:bg-rose-50 border border-rose-100 hover:border-rose-200 rounded-xl p-2.5 cursor-pointer transition-all flex flex-col justify-between shadow-2xs"
        >
          <div className="flex items-center justify-between text-stone-600 text-[10px] mb-1">
            <span>لغوشده</span>
            <XCircle className="w-3 h-3 text-rose-600" />
          </div>
          <div className="text-lg font-bold font-mono text-rose-700">
            {toPersianDigits(cancelledAppointments)}
          </div>
          <div className="text-[8px] text-rose-700 font-bold font-mono mt-0.5">
            ٪{toPersianDigits(cancellationRate)} کنسلی
          </div>
        </div>

        {/* 5. No Show */}
        <div 
          onClick={() => onInspectAppointments('no_show')}
          className="bg-stone-50/80 hover:bg-white border border-stone-100/80 hover:border-stone-200 rounded-xl p-2.5 cursor-pointer transition-all flex flex-col justify-between shadow-2xs"
        >
          <div className="flex items-center justify-between text-stone-600 text-[10px] mb-1">
            <span>عدم حضور</span>
            <UserX className="w-3 h-3 text-stone-500" />
          </div>
          <div className="text-lg font-bold font-mono text-stone-700">
            {toPersianDigits(noShowAppointments)}
          </div>
          <div className="text-[8px] text-stone-500 font-bold font-mono mt-0.5">
            ٪{toPersianDigits(noShowRate)} غیبت
          </div>
        </div>

        {/* 6. Studio Occupancy Rate */}
        <div 
          onClick={() => onInspectAppointments('occupancy')}
          className="bg-[#fbdcd9]/20 hover:bg-[#fbdcd9]/30 border border-[#fbdcd9] rounded-xl p-2.5 cursor-pointer transition-all flex flex-col justify-between shadow-2xs"
        >
          <div className="flex items-center justify-between text-[#853e36] text-[10px] mb-1 font-bold">
            <span>نرخ اشغال</span>
            <Gauge className="w-3 h-3 text-[#ea5848]" />
          </div>
          <div className="text-lg font-bold font-mono text-[#ea5848]">
            ٪{toPersianDigits(occupancyRate)}
          </div>
          <div className="text-[8px] text-[#853e36] font-mono mt-0.5">
            {toPersianDigits(bookedHours)} از {toPersianDigits(totalHours)} ساعت
          </div>
        </div>
      </div>
    </div>
  );
};
