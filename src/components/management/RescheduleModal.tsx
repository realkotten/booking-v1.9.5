import React, { useState, useEffect } from 'react';
import { useAtelier } from '../../store/AtelierContext';
import { Appointment } from '../../types';
import { 
  X, 
  CalendarClock, 
  User, 
  Clock, 
  AlertCircle, 
  Check, 
  ArrowRight,
  Calendar,
  Sparkles
} from 'lucide-react';
import { 
  toPersianDigits, 
  addMinutesToTime, 
  getScheduleWeekDays, 
  getPersianDateForDay 
} from '../../utils/dateUtils';
import { checkAppointmentConflict } from '../../utils/appointmentUtils';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  appointment,
}) => {
  const { appointments, activeChair, rescheduleAppointment } = useAtelier();

  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(appointment?.dayNumber || 22);
  const [selectedStartTime, setSelectedStartTime] = useState<string>(appointment?.startTime || '15:30');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const weekDays = getScheduleWeekDays(0);

  useEffect(() => {
    if (appointment) {
      setSelectedDayNumber(appointment.dayNumber || 22);
      setSelectedStartTime(appointment.startTime || '15:30');
      setErrorMessage(null);
      setConflictWarning(null);
    }
  }, [appointment, isOpen]);

  // Live conflict checking whenever day or time changes
  useEffect(() => {
    if (!appointment || !isOpen) return;
    const duration = appointment.durationMinutes || 45;
    const conflict = checkAppointmentConflict(
      appointments,
      appointment.chairId || activeChair.id,
      selectedDayNumber,
      selectedStartTime,
      duration,
      appointment.id
    );

    if (conflict.hasConflict) {
      setConflictWarning(
        `تداخل با: ${conflict.conflictingAppointment?.customerName} (ساعت ${toPersianDigits(conflict.conflictingAppointment?.startTime || '')})`
      );
    } else {
      setConflictWarning(null);
    }
  }, [selectedDayNumber, selectedStartTime, appointment, appointments, activeChair, isOpen]);

  if (!isOpen || !appointment) return null;

  const duration = appointment.durationMinutes || 45;
  const calculatedEndTime = addMinutesToTime(selectedStartTime, duration);
  const targetDateString = getPersianDateForDay(selectedDayNumber);

  const presetTimes = ['10:00', '11:15', '12:30', '14:15', '15:30', '16:45', '17:30', '18:15'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const res = rescheduleAppointment(appointment.id, {
      dayNumber: selectedDayNumber,
      date: targetDateString,
      startTime: selectedStartTime,
      durationMinutes: duration,
    });

    if (!res.success) {
      setErrorMessage(res.error || 'خطا در تغییر زمان نوبت');
      return;
    }

    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in" 
      dir="rtl"
    >
      <div className="relative w-full max-w-[346px] bg-white/95 backdrop-blur-2xl border border-white/80 rounded-[32px] p-4 shadow-2xl space-y-3.5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white via-[#fbdcd9] to-[#d88d85] shadow-glow-pink flex items-center justify-center border border-white/60">
              <CalendarClock className="w-4 h-4 text-stone-900" />
            </div>
            <div>
              <h3 className="text-xs font-serif font-bold text-stone-900">
                تغییر زمان نوبت (Reschedule)
              </h3>
              <p className="text-[9px] text-stone-500 font-mono">
                {appointment.customerName} · {toPersianDigits(appointment.appointmentNumber || appointment.id)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Current Time Summary Badge */}
        <div className="bg-stone-50 rounded-2xl p-2.5 border border-stone-200/80 flex items-center justify-between text-[10px]">
          <div className="space-y-0.5">
            <span className="text-stone-500 block text-[9px]">زمان فعلی نوبت:</span>
            <span className="font-semibold text-stone-800">
              {appointment.date} · ساعت {toPersianDigits(appointment.startTime)}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-stone-200/80 text-stone-700 text-[9px] font-mono">
            {toPersianDigits(duration)} دقیقه
          </span>
        </div>

        {/* Error / Conflict Alert */}
        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-rose-100/90 border border-rose-200 text-rose-800 text-[10px] flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {conflictWarning && (
          <div className="p-2.5 rounded-xl bg-amber-100/90 border border-amber-200 text-amber-900 text-[10px] flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{conflictWarning}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* 1. Date Selector (Week Strip) */}
          <div>
            <label className="text-[10px] font-semibold text-stone-700 block mb-1.5 flex items-center justify-between">
              <span>انتخاب روز جدید:</span>
              <span className="text-[9px] text-stone-500 font-normal">
                {targetDateString}
              </span>
            </label>
            <div className="grid grid-cols-7 gap-1 bg-stone-100/80 p-1.5 rounded-2xl border border-stone-200">
              {weekDays.map((day) => {
                const isSelected = selectedDayNumber === day.dayNumber;
                return (
                  <button
                    key={day.dayNumber}
                    type="button"
                    onClick={() => setSelectedDayNumber(day.dayNumber)}
                    className={`flex flex-col items-center py-1.5 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-stone-900 text-white font-bold shadow-sm scale-105'
                        : 'text-stone-600 hover:bg-white/80'
                    }`}
                  >
                    <span className="text-[8px] opacity-80">{day.dayShortName}</span>
                    <span className="text-[11px] font-mono mt-0.5">{day.dayNumberPersian}</span>
                    {day.isToday && (
                      <span className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? 'bg-rose-400' : 'bg-stone-400'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Preset Time Slots */}
          <div>
            <label className="text-[10px] font-semibold text-stone-700 block mb-1.5">
              ساعت شروع نوبت:
            </label>
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {presetTimes.map((time) => {
                const isSelected = selectedStartTime === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedStartTime(time)}
                    className={`py-1 rounded-xl text-[11px] font-mono transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-stone-900 text-white border-stone-900 font-bold shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {toPersianDigits(time)}
                  </button>
                );
              })}
            </div>

            {/* Custom Time Input */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-stone-500 shrink-0">یا ساعت دلخواه:</span>
              <input
                type="text"
                value={selectedStartTime}
                onChange={(e) => setSelectedStartTime(e.target.value)}
                placeholder="15:30"
                className="flex-1 px-2.5 py-1 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-mono focus:ring-1 focus:ring-stone-600 outline-none text-center"
                required
              />
            </div>
          </div>

          {/* 3. New Schedule Preview Box */}
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-2.5 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-emerald-900">
              <span className="font-semibold">بازه زمانی جدید:</span>
              <span className="font-mono font-bold">
                {toPersianDigits(selectedStartTime)} الی {toPersianDigits(calculatedEndTime)}
              </span>
            </div>
            <p className="text-[9px] text-emerald-700">
              {targetDateString} · {appointment.service?.name}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-stone-200/70 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-semibold cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={!!conflictWarning}
              className={`flex-1 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all cursor-pointer ${
                conflictWarning
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-stone-900 hover:bg-stone-800 text-white'
              }`}
            >
              ثبت انتقال نوبت
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
