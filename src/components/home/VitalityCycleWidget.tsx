import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowLeft, Clock, Scissors, Moon, Sun, Flame, Check } from 'lucide-react';
import { hapticLight, hapticSelection, hapticStepAdvance } from '../../utils/hapticUtils';
import { getCurrentSolarDateInfo, toPersianDigits } from '../../utils/dateUtils';
import { Service } from '../../types';

export type VitalityPhase = 'morning' | 'afternoon' | 'evening';

interface VitalityCycleWidgetProps {
  onSelectSlotTime?: (time: string) => void;
  onBookPhase?: (phase: VitalityPhase, suggestedTime: string) => void;
}

export const VitalityCycleWidget: React.FC<VitalityCycleWidgetProps> = ({
  onBookPhase,
}) => {
  const [selectedPhase, setSelectedPhase] = useState<VitalityPhase>('afternoon');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isDayMode, setIsDayMode] = useState<boolean>(true);

  // Determine current active phase of the day based on real client time
  const currentPhaseOfNow = useMemo<VitalityPhase>(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    return 'evening';
  }, []);

  const phasesData = {
    morning: {
      id: 'morning' as const,
      tag: '08:30 AM',
      enTitle: 'Awaken & Fresh',
      faTitle: 'طراوت صبحگاهی',
      subtitle: 'اصلاح سریع، فرم‌دهی و شادابی اول وقت',
      timeRange: '۰۸:۳۰ الی ۱۲:۰۰',
      suggestedTime: '10:00',
      badgeColor: 'from-amber-400 to-orange-500',
      auraColor: 'rgba(245, 158, 11, 0.45)',
      services: ['پیرایش کلاسیک رویال', 'شستشو و استایل سر'],
      quote: 'شروع پرانرژی روز با ظاهری آراسته و استایل بی‌نقص',
    },
    afternoon: {
      id: 'afternoon' as const,
      tag: '1:00 PM',
      enTitle: 'Energy Fuel',
      faTitle: 'اوج انرژی و استایل',
      subtitle: 'پیرایش کامل، ریش و دیزاین اختصاصی',
      timeRange: '۱۲:۰۰ الی ۱۸:۰۰',
      suggestedTime: '14:30',
      badgeColor: 'from-rose-500 via-pink-500 to-purple-600',
      auraColor: 'rgba(244, 63, 94, 0.55)',
      services: ['پیرایش کامل و فرم‌دهی ریش', 'پاکسازی اکسپرس پوست'],
      quote: 'بالاترین تمرکز، نهایت دقت و اجرای سبک منحصربه‌فرد شما',
    },
    evening: {
      id: 'evening' as const,
      tag: '7:30 PM',
      enTitle: 'Rest & Repair',
      faTitle: 'آرامش و ریکاوری',
      subtitle: 'اسپا سر و صورت، حوله گرم و ماساژ ریلکسی',
      timeRange: '۱۸:۰۰ الی ۲۲:۰۰',
      suggestedTime: '19:00',
      badgeColor: 'from-emerald-400 to-teal-600',
      auraColor: 'rgba(20, 184, 166, 0.45)',
      services: ['آیین کامل VIP رویال', 'اسپا سر و صورت با حوله بخار'],
      quote: 'پایان روز با آرامش محض، رفع خستگی و جوانسازی پوست',
    },
  };

  const activePhaseInfo = phasesData[selectedPhase];

  const handleNodeClick = (phase: VitalityPhase) => {
    hapticSelection();
    if (selectedPhase === phase) {
      setIsExpanded(!isExpanded);
    } else {
      setSelectedPhase(phase);
      setIsExpanded(true);
    }
  };

  const handleStartBooking = () => {
    hapticStepAdvance();
    if (onBookPhase) {
      onBookPhase(selectedPhase, activePhaseInfo.suggestedTime);
    }
  };

  return (
    <div id="vitality-cycle-container" className="relative my-2 select-none" dir="rtl">
      {/* Decorative Ceramic Bird Accent (Sitting on top of the glowing card) */}
      <div className="absolute -top-3.5 right-6 z-30 pointer-events-none drop-shadow-md">
        <svg width="34" height="26" viewBox="0 0 48 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M8 26C14 26 22 28 32 20C38 15 44 14 46 16C47 17 44 20 40 22C34 25 24 32 14 31C10 30.5 7 28 8 26Z"
            fill="url(#birdPorcelain)"
          />
          <path
            d="M32 20C34 16 38 10 42 10C44 10 46 12 45 15C44 18 38 21 32 20Z"
            fill="#e2dad3"
          />
          <circle cx="41" cy="13" r="1.5" fill="#2d2522" />
          {/* Porcelain Speckles */}
          <circle cx="28" cy="22" r="0.8" fill="#524541" opacity="0.6" />
          <circle cx="34" cy="18" r="0.7" fill="#524541" opacity="0.6" />
          <circle cx="20" cy="26" r="0.9" fill="#524541" opacity="0.5" />
          <circle cx="24" cy="24" r="0.6" fill="#524541" opacity="0.6" />
          <circle cx="16" cy="28" r="0.8" fill="#524541" opacity="0.5" />
          <defs>
            <linearGradient id="birdPorcelain" x1="8" y1="14" x2="44" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="0.6" stopColor="#ece2da" />
              <stop offset="1" stopColor="#cfbcaf" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Decorative Peach Blossom Ceramic Accent: Left Bottom */}
      <div className="absolute -bottom-2 left-4 z-30 pointer-events-none drop-shadow-sm">
        <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="14" cy="14" r="11" fill="url(#peachGrad)" />
          <path d="M14 3C15 7 18 8 18 8" stroke="#5d433b" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M18 6C21 5 23 7 23 7" stroke="#68845e" strokeWidth="1.5" strokeLinecap="round" />
          <defs>
            <radialGradient id="peachGrad" cx="0.35" cy="0.35" r="0.75">
              <stop offset="0%" stopColor="#ffdad3" />
              <stop offset="60%" stopColor="#e5988d" />
              <stop offset="100%" stopColor="#b75e53" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Main Luminous Frosted Card */}
      <div className="relative rounded-[32px] p-4 text-stone-800 luminous-halo-card overflow-hidden">
        {/* Ambient Top Timeline Header */}
        <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 pb-3 border-b border-stone-900/10">
          <div className="flex items-center gap-3">
            <span className={`transition-colors ${selectedPhase === 'morning' ? 'text-amber-700 font-bold' : ''}`}>
              08:30 AM
            </span>
            <span className="text-stone-300">·</span>
            <span className={`transition-colors ${selectedPhase === 'afternoon' ? 'text-rose-700 font-bold' : ''}`}>
              1:00 PM
            </span>
            <span className="text-stone-300">·</span>
            <span className={`transition-colors ${selectedPhase === 'evening' ? 'text-teal-700 font-bold' : ''}`}>
              7:30 PM
            </span>
          </div>

          {/* Minimalist Day/Night Toggle from inspiration */}
          <button
            type="button"
            onClick={() => {
              hapticLight();
              setIsDayMode(!isDayMode);
            }}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/70 border border-stone-200/80 shadow-2xs text-[10px] cursor-pointer"
          >
            <div className={`w-2.5 h-2.5 rounded-full transition-colors ${isDayMode ? 'bg-amber-400 shadow-xs' : 'bg-indigo-500'}`} />
            <span className="font-sans font-medium text-stone-600">
              {isDayMode ? 'روز' : 'شب'}
            </span>
          </button>
        </div>

        {/* Section Header */}
        <div className="pt-2.5 pb-1 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#ea5848]" />
              <span className="text-xs font-bold text-stone-900">
                چرخه آراستگی و شادابی روزانه
              </span>
            </div>
            <p className="text-[10px] text-stone-500 font-medium mt-0.5">
              Cycle of Vitality · آیین‌های متناسب با ریتم روز شما
            </p>
          </div>

          <span className="text-[9px] font-bold text-[#ea5848] bg-[#ea5848]/10 border border-[#ea5848]/20 px-2 py-0.5 rounded-full">
            {selectedPhase === currentPhaseOfNow ? 'بازه فعلی روز' : '۳ فاز انتخابی'}
          </span>
        </div>

        {/* 3 Interactive 3D Glyphs Nodes Grid */}
        <div className="grid grid-cols-3 gap-2 pt-3 pb-2">
          {/* 1. MORNING SUN NODE */}
          <button
            type="button"
            onClick={() => handleNodeClick('morning')}
            className={`group relative flex flex-col items-center text-center p-2 rounded-2xl transition-all duration-300 cursor-pointer ${
              selectedPhase === 'morning'
                ? 'bg-white/90 shadow-md ring-2 ring-amber-400/80 scale-[1.03]'
                : 'bg-white/40 hover:bg-white/60'
            }`}
          >
            {/* 3D Radiant Sun */}
            <div className="relative w-14 h-14 flex items-center justify-center my-1 glow-amber-sun transition-transform group-hover:scale-105">
              {/* Concentric layered golden disk */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 opacity-90 shadow-lg" />
              <div className="absolute inset-1.5 rounded-full bg-gradient-to-tr from-amber-100 via-amber-200 to-amber-400 shadow-inner" />
              <div className="absolute inset-3.5 rounded-full bg-gradient-to-br from-white via-amber-300 to-amber-500 shadow-md" />
              <Sun className="relative z-10 w-5 h-5 text-amber-900/80 drop-shadow-xs" />
            </div>

            <span className="text-[10px] font-bold text-stone-800 mt-1 block">
              طراوت صبح
            </span>
            <span className="text-[8px] font-mono text-stone-500 block">
              Awaken & Fresh
            </span>

            <div className="mt-1 flex items-center justify-center text-amber-600 text-[10px]">
              <span className="transform group-hover:translate-x-0.5 transition-transform">▶</span>
            </div>
          </button>

          {/* 2. ENERGY FUEL BLOSSOM-STAR NODE */}
          <button
            type="button"
            onClick={() => handleNodeClick('afternoon')}
            className={`group relative flex flex-col items-center text-center p-2 rounded-2xl transition-all duration-300 cursor-pointer ${
              selectedPhase === 'afternoon'
                ? 'bg-white/90 shadow-md ring-2 ring-rose-400/80 scale-[1.03]'
                : 'bg-white/40 hover:bg-white/60'
            }`}
          >
            {/* 3D Multi-Petal Star with glowing core */}
            <div className="relative w-14 h-14 flex items-center justify-center my-1 glow-coral-star transition-transform group-hover:scale-105">
              {/* Petal Gear Geometry SVG */}
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
                <path
                  d="M28 4C30 4 31 7 32 9C34 10 36 10 38 9C40 8 43 10 43 12C43 14 42 16 43 18C44 20 46 22 46 24C46 26 44 28 43 30C42 32 43 34 43 36C43 38 40 40 38 39C36 38 34 38 32 39C31 41 30 44 28 44C26 44 25 41 24 39C22 38 20 38 18 39C16 40 13 38 13 36C13 34 14 32 13 30C12 28 10 26 10 24C10 22 12 20 13 18C14 16 13 14 13 12C13 10 16 8 18 9C20 10 22 10 24 9C25 7 26 4 28 4Z"
                  fill="url(#coralBlossomGrad)"
                />
                <defs>
                  <linearGradient id="coralBlossomGrad" x1="8" y1="4" x2="48" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#fb7185" />
                    <stop offset="0.5" stopColor="#f43f5e" />
                    <stop offset="1" stopColor="#db2777" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Luminous Deep Blue/Purple Core Sphere */}
              <div className="relative z-10 w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 via-blue-600 to-purple-800 shadow-inner flex items-center justify-center">
                <Flame className="w-3.5 h-3.5 text-white/90" />
              </div>
            </div>

            <span className="text-[10px] font-bold text-stone-800 mt-1 block">
              اوج استایل
            </span>
            <span className="text-[8px] font-mono text-stone-500 block">
              Energy Fuel
            </span>

            <div className="mt-1 flex items-center justify-center text-rose-600 text-[10px]">
              <span className="transform group-hover:translate-x-0.5 transition-transform">▶</span>
            </div>
          </button>

          {/* 3. REST & REPAIR CRESCENT MOON NODE */}
          <button
            type="button"
            onClick={() => handleNodeClick('evening')}
            className={`group relative flex flex-col items-center text-center p-2 rounded-2xl transition-all duration-300 cursor-pointer ${
              selectedPhase === 'evening'
                ? 'bg-white/90 shadow-md ring-2 ring-teal-400/80 scale-[1.03]'
                : 'bg-white/40 hover:bg-white/60'
            }`}
          >
            {/* 3D Gradient Emerald/Teal Crescent Moon */}
            <div className="relative w-14 h-14 flex items-center justify-center my-1 glow-teal-moon transition-transform group-hover:scale-105">
              <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M34 23C34 29.0751 29.0751 34 23 34C16.9249 34 12 29.0751 12 23C12 16.9249 16.9249 12 23 12C24.3164 12 25.5752 12.2317 26.7408 12.6568C22.2536 14.8437 19.5 19.4678 19.5 24.5C19.5 30.8513 24.6487 36 31 36C32.3259 36 33.5937 35.7766 34.7709 35.3644C34.2758 35.7766 34 23 34 23Z"
                  fill="url(#tealCrescentGrad)"
                />
                <defs>
                  <linearGradient id="tealCrescentGrad" x1="12" y1="12" x2="34" y2="36" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#34d399" />
                    <stop offset="0.5" stopColor="#14b8a6" />
                    <stop offset="1" stopColor="#0f766e" />
                  </linearGradient>
                </defs>
              </svg>
              <Moon className="absolute z-10 w-3.5 h-3.5 text-teal-950/70" />
            </div>

            <span className="text-[10px] font-bold text-stone-800 mt-1 block">
              آرامش و اسپا
            </span>
            <span className="text-[8px] font-mono text-stone-500 block">
              Rest & Repair
            </span>

            <div className="mt-1 flex items-center justify-center text-teal-600 text-[10px]">
              <span className="transform group-hover:translate-x-0.5 transition-transform">▶</span>
            </div>
          </button>
        </div>

        {/* Dynamic Detail Card for Selected Phase */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedPhase}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="mt-2 p-3 rounded-2xl bg-white/80 border border-white/95 shadow-xs space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                <span className="text-xs font-bold text-stone-900">
                  {activePhaseInfo.faTitle}
                </span>
                <span className="text-[10px] text-stone-500">
                  ({activePhaseInfo.timeRange})
                </span>
              </div>

              <span className="text-[10px] font-mono font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                پیشنهاد: {toPersianDigits(activePhaseInfo.suggestedTime)}
              </span>
            </div>

            <p className="text-[10px] text-stone-600 leading-relaxed font-medium">
              {activePhaseInfo.quote}
            </p>

            {/* Quick Action Button for this phase */}
            <div className="pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={handleStartBooking}
                className="flex-1 py-2 px-3 rounded-xl bg-[#1a1918] hover:bg-stone-800 active:scale-[0.98] text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Scissors className="w-3 h-3 text-[#fbdcd9]" />
                <span>رزرو نوبت در بازه {activePhaseInfo.faTitle}</span>
                <ArrowLeft className="w-3 h-3 mr-auto text-[#fbdcd9]" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
