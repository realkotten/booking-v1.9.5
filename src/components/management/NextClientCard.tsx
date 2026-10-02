import React from 'react';
import { Appointment } from '../../types';
import { 
  Play, 
  User, 
  Clock, 
  Sparkles, 
  Coffee, 
  CheckCircle 
} from 'lucide-react';
import { toPersianDigits } from '../../utils/dateUtils';
import { getBookingSourceLabel } from '../../utils/statusUtils';
import { QuickContactButtons } from './QuickContactButtons';

interface NextClientCardProps {
  nextAppointment?: Appointment;
  onStartAppointment: (aptId: string) => void;
  onOpenDossier: (customerId?: string) => void;
}

export const NextClientCard: React.FC<NextClientCardProps> = ({
  nextAppointment,
  onStartAppointment,
  onOpenDossier,
}) => {
  if (!nextAppointment) {
    return (
      <div className="bg-white/30 backdrop-blur-md rounded-[22px] p-3 border border-white/60 text-center">
        <p className="text-[11px] text-stone-700 font-medium">
          نوبت برنامه‌ریزی‌شده دیگری برای امروز نیست
        </p>
      </div>
    );
  }

  const duration = nextAppointment.durationMinutes || 45;
  const sourceInfo = getBookingSourceLabel(nextAppointment.bookingSource);

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-[24px] p-3 border border-white/70 shadow-sm relative overflow-hidden">
      {/* Upper header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[9px] font-semibold text-[#7e5352] block">
            نوبت بعدی (ساعت {toPersianDigits(nextAppointment.startTime)})
          </span>
          <h3
            onClick={() => onOpenDossier(nextAppointment.customerId)}
            className="text-xs font-serif font-bold text-stone-900 mt-0.5 hover:text-[#7e5352] cursor-pointer transition-colors"
          >
            {nextAppointment.customerName}
          </h3>
          <p className="text-[10px] text-stone-600">
            {nextAppointment.service?.name} · {toPersianDigits(duration)} دقیقه
          </p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            {nextAppointment.isQuietSession && (
              <span className="text-[8px] bg-[#151517] text-[#fbdcd9] px-1.5 py-0.5 rounded-full font-bold">
                سکوت
              </span>
            )}
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/70 border border-white/80 text-stone-700 font-medium">
              {sourceInfo.label}
            </span>
          </div>
          {nextAppointment.beverage && (
            <div className="flex items-center gap-1 text-[9px] text-stone-600 bg-white/50 px-1.5 py-0.5 rounded-md">
              <Coffee className="w-2.5 h-2.5 text-stone-600" />
              <span className="truncate max-w-[80px]">{nextAppointment.beverage.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Row */}
      <div className="mt-2.5 pt-2 border-t border-stone-200/60 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onOpenDossier(nextAppointment.customerId)}
            className="text-[9px] font-semibold text-stone-700 hover:text-stone-900 flex items-center gap-1"
          >
            <User className="w-3 h-3 text-stone-500" />
            <span>پرونده</span>
          </button>

          {nextAppointment.customerPhone && (
            <QuickContactButtons
              phone={nextAppointment.customerPhone}
              customerName={nextAppointment.customerName}
              appointmentTime={nextAppointment.startTime}
              serviceName={nextAppointment.service?.name}
              size="xs"
              variant="glass"
            />
          )}
        </div>

        <button
          type="button"
          onClick={() => onStartAppointment(nextAppointment.id)}
          className="text-[10px] font-bold text-white bg-stone-900 hover:bg-stone-800 px-3 py-1 rounded-full shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
        >
          <Play className="w-3 h-3 fill-current text-[#fbdcd9]" />
          <span>شروع نوبت</span>
        </button>
      </div>
    </div>
  );
};
