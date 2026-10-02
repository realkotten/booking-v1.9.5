import React from 'react';
import { CalendarClock, Scissors } from 'lucide-react';
import { ClientProfile } from '../../types';

interface RoutineCardProps {
  currentCustomer: ClientProfile;
}

export const RoutineCard: React.FC<RoutineCardProps> = ({ currentCustomer }) => {
  const hasRoutine = Boolean(
    currentCustomer && (
      (currentCustomer.routineDays && currentCustomer.routineDays > 0) ||
      (currentCustomer.routineCadence && currentCustomer.routineCadence.trim() !== '') ||
      (currentCustomer.nextRoutineDayNumber && currentCustomer.nextRoutineDayNumber > 0) ||
      (currentCustomer.nextRoutineTargetDate && currentCustomer.nextRoutineTargetDate.trim() !== '') ||
      (currentCustomer.cadence && currentCustomer.cadence.trim() !== '') ||
      (currentCustomer.lastCutDayNumber && currentCustomer.lastCutDayNumber > 0)
    )
  );

  if (!hasRoutine) {
    return (
      <div className="space-y-2 text-right">
        <div className="p-3.5 rounded-2xl clay-card-subtle flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-stone-900 block">
              نوبت فعالی ندارید
            </span>
            <p className="text-[10px] text-stone-600 font-medium">
              برای دریافت خدمات تخصصی، نوبت دلخواه خود را آنلاین رزرو نمایید.
            </p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-[#fdf2ee] border border-[#f3d0c4] text-[#bf5938] flex items-center justify-center shrink-0 shadow-2xs">
            <Scissors className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between pb-2 border-b border-stone-200/70">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#fdf2ee] border border-[#f3d0c4] text-[#bf5938] flex items-center justify-center shadow-2xs">
            <CalendarClock className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#bf5938] block">
              روتین پیشنهادی آرایشگر شما
            </span>
            <h3 className="text-xs font-bold text-stone-900">
              {currentCustomer.routineCadence || currentCustomer.cadence}
            </h3>
          </div>
        </div>

        {currentCustomer.nextRoutineTargetDate && (
          <span className="text-[10px] font-bold text-[#0f172a] bg-[#f8fafc] border border-slate-200 px-2.5 py-0.5 rounded-lg">
            موعد: {currentCustomer.nextRoutineTargetDate}
          </span>
        )}
      </div>

      {/* Routine Recommended Service and Barber Note */}
      <div className="clay-card-subtle p-3 rounded-2xl space-y-1.5 text-right">
        {currentCustomer.routineServiceTitle && (
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-stone-500 text-[10px]">خدمت پیشنهادی آرایشگر:</span>
            <span className="font-bold text-stone-900">
              {currentCustomer.routineServiceTitle}
            </span>
          </div>
        )}

        {currentCustomer.routineBarberNote && (
          <div className="p-2.5 rounded-xl bg-[#fdf2ee] border border-[#f3d0c4] text-[10px] text-slate-800 leading-relaxed">
            <span className="font-bold text-[#bf5938] block mb-0.5">توصیه آرایشگر:</span>
            <p>{currentCustomer.routineBarberNote}</p>
          </div>
        )}
      </div>
    </div>
  );
};
