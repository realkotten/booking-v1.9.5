import React, { useState, useEffect } from 'react';
import { Appointment } from '../../types';
import { useAtelier } from '../../store/AtelierContext';
import { 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Scissors, 
  Coffee, 
  User,
  Play
} from 'lucide-react';
import { toPersianDigits, addMinutesToTime } from '../../utils/dateUtils';
import { QuickContactButtons } from './QuickContactButtons';

interface ActiveSessionCardProps {
  activeAppointment?: Appointment;
  onCompleteAppointment: (aptId: string) => void;
  onOpenCustomerDossier?: (customerId?: string) => void;
  onQuickWalkIn?: () => void;
}

export const ActiveSessionCard: React.FC<ActiveSessionCardProps> = ({
  activeAppointment,
  onCompleteAppointment,
  onOpenCustomerDossier,
  onQuickWalkIn,
}) => {
  const [nowDate, setNowDate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNowDate(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!activeAppointment) {
    return (
      <div className="bg-white/40 backdrop-blur-md rounded-[26px] p-3.5 border border-white/70 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white via-[#fbdcd9] to-[#d88d85] shadow-glow-pink flex items-center justify-center border border-white/60 shrink-0">
              <Scissors className="w-4.5 h-4.5 text-stone-900" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-semibold text-[#7e5352]">
                  سوئیت آماده و آزاد
                </span>
              </div>
              <h3 className="text-xs font-serif font-bold text-stone-900 mt-0.5">
                نوبت فعالی در جریان نیست
              </h3>
            </div>
          </div>

          {onQuickWalkIn && (
            <button
              type="button"
              onClick={onQuickWalkIn}
              className="text-[10px] font-bold text-stone-900 bg-white/90 hover:bg-white px-3 py-1.5 rounded-full border border-stone-300 shadow-2xs transition-all flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-[#d88d85]" />
              <span>پذیرش فوری</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Calculate live countdown
  const totalDuration = activeAppointment.durationMinutes || 45;
  const startTimeStr = activeAppointment.startTime || '14:15';
  const endTimeStr = activeAppointment.endTime || addMinutesToTime(startTimeStr, totalDuration);

  const [startHour, startMin] = startTimeStr.split(':').map((v) => parseInt(v, 10) || 0);
  const startTimeObj = new Date();
  startTimeObj.setHours(startHour, startMin, 0, 0);

  const [endHour, endMin] = endTimeStr.split(':').map((v) => parseInt(v, 10) || 0);
  const endTimeObj = new Date();
  endTimeObj.setHours(endHour, endMin, 0, 0);

  const totalSeconds = totalDuration * 60;
  const elapsedSecondsRaw = Math.max(0, Math.floor((nowDate.getTime() - startTimeObj.getTime()) / 1000));
  const remainingSecondsRaw = Math.max(0, Math.floor((endTimeObj.getTime() - nowDate.getTime()) / 1000));
  const progressPercent = Math.min(100, Math.max(0, (elapsedSecondsRaw / totalSeconds) * 100));

  const remainingMin = Math.floor(remainingSecondsRaw / 60);
  const remainingSec = remainingSecondsRaw % 60;

  return (
    <div className="rounded-[26px] bg-[#151517]/95 text-white shadow-xl border border-stone-700/60 p-3.5 relative overflow-hidden">
      {/* Upper header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[9px] text-[#E9B9B5] font-semibold">
              در حال اجرا (Active Session)
            </span>
          </div>
          <h2
            onClick={() => onOpenCustomerDossier && onOpenCustomerDossier(activeAppointment.customerId)}
            className="text-sm font-serif font-bold text-white mt-0.5 hover:text-[#fbdcd9] cursor-pointer transition-colors"
          >
            {activeAppointment.customerName}
          </h2>
          <p className="text-[10px] text-stone-300">
            {activeAppointment.service?.name} · {toPersianDigits(totalDuration)} دقیقه
          </p>
        </div>

        {/* Rose Glowing Orb Badge */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white via-[#fbdcd9] to-[#d88d85] shadow-glow-pink flex items-center justify-center border border-white/50 shrink-0">
          <Scissors className="w-4 h-4 text-stone-900" />
        </div>
      </div>

      {/* Countdown Timer Display */}
      <div className="mt-3 bg-stone-900/80 rounded-2xl p-2.5 border border-stone-800">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="text-stone-400">زمان باقی‌مانده:</span>
          <span className="font-mono font-bold text-[#fbdcd9] tracking-wider text-xs">
            {toPersianDigits(remainingMin)}:{toPersianDigits(remainingSec < 10 ? `۰${remainingSec}` : remainingSec)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden p-0.5 border border-stone-700/50">
          <div
            className="h-full bg-gradient-to-r from-[#d88d85] to-[#fbdcd9] rounded-full transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Beverage / Technical Notes */}
      {activeAppointment.beverage && (
        <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-stone-300 bg-stone-900/50 px-2.5 py-1.5 rounded-xl border border-stone-800">
          <Coffee className="w-3 h-3 text-[#E9B9B5] shrink-0" />
          <span className="truncate">پذیرایی: {activeAppointment.beverage.name}</span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 pt-2 border-t border-stone-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onOpenCustomerDossier && onOpenCustomerDossier(activeAppointment.customerId)}
            className="text-[9px] font-semibold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 px-2.5 py-1.5 rounded-full transition-colors flex items-center gap-1"
          >
            <User className="w-3 h-3" />
            <span>پرونده</span>
          </button>

          {activeAppointment.customerPhone && (
            <QuickContactButtons
              phone={activeAppointment.customerPhone}
              customerName={activeAppointment.customerName}
              appointmentTime={activeAppointment.startTime}
              serviceName={activeAppointment.service?.name}
              size="xs"
              variant="dark"
            />
          )}
        </div>

        <button
          type="button"
          onClick={() => onCompleteAppointment(activeAppointment.id)}
          className="text-[10px] font-bold text-white bg-stone-900 hover:bg-stone-800 px-3.5 py-1.5 rounded-full shadow-md transition-all flex items-center gap-1 cursor-pointer border border-white/20"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>تکمیل نوبت</span>
        </button>
      </div>
    </div>
  );
};
