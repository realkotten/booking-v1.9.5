import React, { useMemo, useRef } from 'react';
import { Appointment, Chair } from '../../types';
import { addMinutesToTime } from '../../utils/dateUtils';
import { useAtelier } from '../../store/AtelierContext';

interface VisualMultiDayCalendarViewProps {
  days: {
    dayNumber: number;
    dayName: string;
    dayNumberPersian: string;
    isToday: boolean;
    dateString: string;
  }[];
  selectedDayNumber: number;
  onSelectDay: (dayNumber: number) => void;
  appointments: Appointment[];
  activeChair: Chair;
  onSelectAppointment: (appointment: Appointment) => void;
}

const START_HOUR = 9;
const END_HOUR = 21;
const TOTAL_HOURS = END_HOUR - START_HOUR + 1;
const HOUR_HEIGHT_PX = 58;

export const VisualMultiDayCalendarView: React.FC<VisualMultiDayCalendarViewProps> = ({
  days,
  selectedDayNumber,
  onSelectDay,
  appointments,
  activeChair,
  onSelectAppointment,
}) => {
  const { startAppointment, completeAppointment } = useAtelier();
  const containerRef = useRef<HTMLDivElement>(null);

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) {
      slots.push({
        hour: h,
        label: `${h.toString().padStart(2, '0')}:00`,
      });
    }
    return slots;
  }, []);

  const timeToMinutesFromStart = (timeStr: string) => {
    if (!timeStr || !timeStr.includes(':')) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return Math.max(0, (h - START_HOUR) * 60 + (m || 0));
  };

  return (
    <div className="space-y-2.5 w-full select-none font-sans" dir="rtl">
      {/* Visual Multi-Day Header */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-2.5 border border-white/95 shadow-2xs">
        <div className="grid grid-cols-[3.5rem_repeat(3,1fr)] gap-1.5 text-center items-center">
          <div className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider">Time</div>
          {days.slice(0, 3).map((day) => {
            const isSelected = day.dayNumber === selectedDayNumber;
            const dayApts = appointments.filter(
              (a) => a.status !== 'cancelled' && a.dayNumber === day.dayNumber && (!a.chairId || a.chairId === activeChair.id)
            );
            return (
              <button
                key={day.dayNumber}
                type="button"
                onClick={() => onSelectDay(day.dayNumber)}
                className={`py-2 px-1.5 rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-sm ring-1 ring-stone-900'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/50'
                }`}
              >
                <span className="block text-[10px] font-bold opacity-80">{day.dayName}</span>
                <span className="text-xs font-mono font-bold">{day.dayNumber}</span>
                {dayApts.length > 0 && (
                  <span className={`block text-[9px] font-mono rounded-full mx-auto w-fit px-2 mt-0.5 font-bold ${
                    day.isToday ? 'bg-rose-500 text-white' : isSelected ? 'bg-stone-800 text-stone-200' : 'bg-purple-100 text-[#4e3b6e]'
                  }`}>
                    {dayApts.length} {dayApts.length === 1 ? 'slot' : 'slots'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Canvas */}
      <div
        ref={containerRef}
        className="relative bg-white/95 backdrop-blur-md rounded-3xl border border-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-y-auto max-h-[560px] custom-scrollbar"
      >
        <div 
          className="relative min-h-[812px] w-full"
          style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT_PX}px` }}
        >
          {/* Background Horizontal Guide Lines */}
          {timeSlots.map((slot, index) => {
            const topPx = index * HOUR_HEIGHT_PX;
            return (
              <div
                key={slot.hour}
                className="absolute w-full border-t border-stone-200/50 flex items-start pointer-events-none"
                style={{ top: `${topPx}px`, height: `${HOUR_HEIGHT_PX}px` }}
              >
                <div className="w-14 shrink-0 -mt-2 pr-2 text-right">
                  <span className="text-[10px] font-mono font-bold text-stone-400">
                    {slot.label}
                  </span>
                </div>
                <div className="grid grid-cols-3 flex-1 h-full border-r border-stone-200/40">
                  <div className="border-l border-stone-100 h-full" />
                  <div className="border-l border-stone-100 h-full" />
                  <div className="h-full" />
                </div>
              </div>
            );
          })}

          {/* 3 Day Columns */}
          <div className="absolute inset-0 grid grid-cols-[3.5rem_repeat(3,1fr)] pointer-events-none">
            <div className="w-14 shrink-0" />
            {days.slice(0, 3).map((day) => {
              const dayApts = appointments.filter(
                (a) => a.status !== 'cancelled' && a.dayNumber === day.dayNumber && (!a.chairId || a.chairId === activeChair.id)
              );

              return (
                <div 
                  key={day.dayNumber} 
                  className="relative h-full border-r border-stone-200/40 pointer-events-auto"
                >
                  {dayApts.map((apt) => {
                    const startMin = timeToMinutesFromStart(apt.startTime);
                    const duration = apt.durationMinutes || 45;
                    const topPx = (startMin / 60) * HOUR_HEIGHT_PX;
                    const heightPx = Math.max(34, (duration / 60) * HOUR_HEIGHT_PX - 3);

                    const isInProgress = apt.status === 'in_progress';
                    const isCompleted = apt.status === 'completed';
                    const isBlocked = apt.status === 'blocked';

                    return (
                      <div
                        key={apt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAppointment(apt);
                        }}
                        className={`absolute left-1 right-1 rounded-xl p-1.5 transition-all cursor-pointer overflow-hidden border shadow-2xs hover:shadow-md hover:scale-[1.02] z-10 ${
                          isInProgress
                            ? 'bg-stone-950 text-white border-amber-400'
                            : isCompleted
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                            : isBlocked
                            ? 'bg-stone-100 text-stone-600 border-dashed border-stone-300'
                            : 'bg-white text-stone-900 border-purple-200 hover:border-[#4e3b6e]'
                        }`}
                        style={{
                          top: `${topPx}px`,
                          height: `${heightPx}px`,
                        }}
                      >
                        <div className="flex flex-col justify-between h-full text-[10px] min-w-0">
                          <div className="flex items-center justify-between gap-1 font-bold">
                            <span className="truncate">{apt.customerName || 'Block'}</span>
                            <span className="font-mono text-[9px] opacity-80">{apt.startTime}</span>
                          </div>
                          {heightPx > 38 && (
                            <span className="truncate opacity-75 text-[8px] font-medium">{apt.service?.name}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
