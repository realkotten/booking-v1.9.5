import React from 'react';
import { AvailableTimeSlot } from '../../utils/appointmentUtils';
import { CalendarPlus, Clock } from 'lucide-react';
import { toPersianDigits } from '../../utils/dateUtils';

interface EmptySlotsSectionProps {
  slots: AvailableTimeSlot[];
  onSelectSlot: (slot: AvailableTimeSlot) => void;
}

export const EmptySlotsSection: React.FC<EmptySlotsSectionProps> = ({
  slots,
  onSelectSlot,
}) => {
  if (slots.length === 0) return null;

  return (
    <div className="bg-white/30 backdrop-blur-md rounded-[22px] p-2.5 border border-white/60 space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <h4 className="text-[10px] font-bold text-stone-900">
            سانس‌های خالی امروز ({toPersianDigits(slots.length)})
          </h4>
        </div>
        <span className="text-[9px] text-stone-500">کلیک برای رزرو</span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {slots.map((slot, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelectSlot(slot)}
            className="shrink-0 bg-white/70 hover:bg-white px-2.5 py-1.5 rounded-xl border border-white/80 shadow-2xs text-stone-900 transition-all flex items-center gap-1.5"
          >
            <Clock className="w-3 h-3 text-emerald-600" />
            <span className="text-[10px] font-mono font-semibold">
              {toPersianDigits(slot.startTime)}
            </span>
            <span className="text-[9px] text-stone-500">
              ({toPersianDigits(slot.durationMinutes)}د)
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
