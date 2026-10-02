import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Clock, ChevronDown, Check, X } from 'lucide-react';

interface TimePickerSelectProps {
  value: string;
  onChange: (time: string) => void;
  disabled?: boolean;
  placeholder?: string;
  allowClear?: boolean;
  clearLabel?: string;
  presets?: string[];
  className?: string;
  ariaLabel?: string;
}

const DEFAULT_PRESETS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'
];

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

export const TimePickerSelect: React.FC<TimePickerSelectProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = 'انتخاب',
  allowClear = false,
  clearLabel = 'بدون ساعت',
  presets = DEFAULT_PRESETS,
  className = '',
  ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Parse current hour and minute from value (e.g. "14:30")
  const [currentHour, currentMinute] = value && value.includes(':') 
    ? value.split(':') 
    : ['10', '00'];

  const [selectedHour, setSelectedHour] = useState<string>(currentHour || '10');
  const [selectedMinute, setSelectedMinute] = useState<string>(currentMinute || '00');
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');

  // Keep local state in sync when value changes
  useEffect(() => {
    if (value && value.includes(':')) {
      const [h, m] = value.split(':');
      setSelectedHour(h || '10');
      setSelectedMinute(m || '00');
    }
  }, [value]);

  // Lock body scroll when modal is open and handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectPreset = (time: string) => {
    onChange(time);
    setIsOpen(false);
  };

  const handleApplyCustom = () => {
    const formatted = `${selectedHour}:${selectedMinute}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button inside form layout */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(true)}
        aria-label={ariaLabel}
        className={`inline-flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all select-none ${
          disabled
            ? 'bg-stone-100/60 border-stone-200/50 text-stone-400 cursor-not-allowed'
            : isOpen
            ? 'bg-white border-[#7e5352] text-[#7e5352] ring-2 ring-[#7e5352]/15 shadow-xs'
            : value
            ? 'bg-white hover:bg-stone-50 border-stone-200 text-stone-900 cursor-pointer shadow-2xs hover:border-stone-300'
            : 'bg-white hover:bg-stone-50 border-dashed border-stone-300 text-stone-400 cursor-pointer shadow-2xs'
        } ${className}`}
      >
        <span className="truncate">
          {value ? value : placeholder}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
            disabled ? 'text-stone-300' : 'text-stone-400'
          } ${isOpen ? 'rotate-180 text-[#7e5352]' : ''}`}
        />
      </button>

      {/* Centered Modal Popup rendered via Portal to prevent any screen clipping */}
      {isOpen && !disabled && typeof document !== 'undefined' && createPortal(
        <div
          dir="rtl"
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-[320px] bg-white rounded-3xl shadow-2xl border border-stone-200/80 p-4 sm:p-5 flex flex-col space-y-3.5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#7e5352]/10 text-[#7e5352] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">انتخاب ساعت</h4>
                  {value ? (
                    <p className="text-[10px] font-mono text-[#7e5352]">فعلی: {value}</p>
                  ) : (
                    <p className="text-[10px] text-stone-400">یک ساعت انتخاب کنید</p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 bg-stone-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className={`py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                  activeTab === 'presets'
                    ? 'bg-white text-[#7e5352] shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                ساعت‌های رایج
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('custom')}
                className={`py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                  activeTab === 'custom'
                    ? 'bg-white text-[#7e5352] shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                ساعت دلخواه
              </button>
            </div>

            {/* Presets Tab View */}
            {activeTab === 'presets' && (
              <div className="max-h-56 overflow-y-auto pr-0.5 space-y-1 scrollbar-thin">
                <div className="grid grid-cols-3 gap-2">
                  {presets.map((timePreset) => {
                    const isSelected = value === timePreset;
                    return (
                      <button
                        key={timePreset}
                        type="button"
                        onClick={() => handleSelectPreset(timePreset)}
                        className={`py-2 px-2 rounded-xl text-xs font-mono font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-[#7e5352] text-white shadow-xs scale-[1.02]'
                            : 'bg-stone-50 hover:bg-[#7e5352]/10 hover:text-[#7e5352] text-stone-700 border border-stone-200/70 active:scale-95'
                        }`}
                      >
                        {timePreset}
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Time Selector View */}
            {activeTab === 'custom' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-center">
                  {/* Hours column */}
                  <div>
                    <div className="text-[11px] font-bold text-stone-600 mb-1.5">ساعت (00 - 23)</div>
                    <div className="h-44 overflow-y-auto border border-stone-200 rounded-2xl p-1.5 bg-stone-50/70 space-y-1 scrollbar-thin">
                      {HOURS.map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setSelectedHour(h)}
                          className={`w-full py-1.5 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer ${
                            selectedHour === h
                              ? 'bg-[#7e5352] text-white shadow-xs'
                              : 'text-stone-700 hover:bg-stone-200/60'
                          }`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Minutes column */}
                  <div>
                    <div className="text-[11px] font-bold text-stone-600 mb-1.5">دقیقه</div>
                    <div className="h-44 overflow-y-auto border border-stone-200 rounded-2xl p-1.5 bg-stone-50/70 space-y-1 scrollbar-thin">
                      {MINUTES.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setSelectedMinute(m)}
                          className={`w-full py-2 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer ${
                            selectedMinute === m
                              ? 'bg-[#7e5352] text-white shadow-xs'
                              : 'text-stone-700 hover:bg-stone-200/60'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Confirm custom button */}
                <button
                  type="button"
                  onClick={handleApplyCustom}
                  className="w-full py-2.5 bg-[#7e5352] hover:bg-[#684342] text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <Check className="w-4 h-4" />
                  <span>ثبت ساعت {selectedHour}:{selectedMinute}</span>
                </button>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
              {allowClear ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{clearLabel}</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
