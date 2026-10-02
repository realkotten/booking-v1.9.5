import React from 'react';
import { ATELIER_IMAGES } from '../data/mockData';
import { AtelierShell } from './AtelierShell';
import { ArrowLeft, Zap, CheckCircle2 } from 'lucide-react';

interface OnboardingStep1Props {
  onNext: () => void;
  onSkip: () => void;
  onSignIn?: () => void;
}

export const OnboardingStep1: React.FC<OnboardingStep1Props> = ({
  onNext,
  onSkip,
}) => {
  return (
    <AtelierShell id="onboarding-step1-container" bottomPadding="pb-8">
      {/* Top Header */}
      <header
        id="onboarding1-header"
        className="relative z-30 px-6 pt-2 flex items-center justify-between shrink-0"
        dir="rtl"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-900">
            آرایشگاه رویال
          </span>
        </div>

        <button
          id="onboarding1-skip-btn"
          type="button"
          onClick={onSkip}
          className="text-xs text-stone-700 hover:text-stone-950 font-medium py-1 px-3 rounded-full bg-white/50 hover:bg-white/80 backdrop-blur-sm border border-white/60 transition-all"
        >
          رد کردن
        </button>
      </header>

      {/* Main Floating Glass Container */}
      <section
        id="onboarding1-glass-card"
        className="relative z-20 mx-auto w-full max-w-sm sm:max-w-md clay-card rounded-[30px] border border-white p-3.5 pt-3 pb-3.5 flex flex-col justify-between mt-1 flex-1 min-h-0 overflow-y-auto"
        dir="rtl"
      >
        {/* Upper Image Card */}
        <div className="relative w-full h-[220px] rounded-[26px] overflow-hidden shadow-sm shrink-0">
          <img
            src={ATELIER_IMAGES.barberSuite}
            alt="رزرو آسان آرایشگاه رویال"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-center filter brightness-95 contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 pointer-events-none" />

          {/* Upper Badges */}
          <div className="absolute top-3.5 right-4 left-4 flex justify-between items-center">
            <span className="px-3 py-1 rounded-full bg-[#fedecb] text-[#6d3e26] text-[10px] font-bold shadow-xs">
              گام ۱ از ۳
            </span>
            <span className="px-3 py-1 rounded-full bg-black/60 text-[#fedecb] text-[10px] font-medium backdrop-blur-md border border-white/20">
              رزرو سریع
            </span>
          </div>

          {/* Lower Title Overlay */}
          <div className="absolute bottom-3 right-4 left-4 text-white">
            <h2 className="text-xl font-bold tracking-tight leading-snug">
              رزرو بدون معطلی
            </h2>
            <p className="text-[11px] text-stone-200 font-light mt-1 leading-relaxed">
              به‌جای تماس تلفنی، نوبت خود را آنلاین و در هر ساعت از شبانه‌روز ثبت کنید.
            </p>
          </div>
        </div>

        {/* Bullet Points */}
        <div className="py-3 px-1 space-y-2">
          <div className="flex items-start gap-2.5 p-2.5 rounded-2xl clay-card-subtle border border-white">
            <CheckCircle2 className="w-4 h-4 text-[#bf5938] shrink-0 mt-0.5" />
            <p className="text-xs text-stone-800 leading-relaxed font-medium">
              مشاهده ساعت‌های خالی همه آرایشگرها به‌صورت لحظه‌ای
            </p>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-2xl clay-card-subtle border border-white">
            <CheckCircle2 className="w-4 h-4 text-[#bf5938] shrink-0 mt-0.5" />
            <p className="text-xs text-stone-800 leading-relaxed font-medium">
              تایید فوری نوبت بدون نیاز به تماس با آرایشگاه
            </p>
          </div>
        </div>

        {/* Lower Step Controller */}
        <div className="w-full clay-card-subtle rounded-[26px] p-3.5 text-stone-900 border border-white shrink-0">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 flex-row-reverse">
              <span className="w-6 h-2 rounded-full bg-[#0f172a]" />
              <span className="w-2 h-2 rounded-full bg-stone-300" />
              <span className="w-2 h-2 rounded-full bg-stone-300" />
            </div>
            <span className="text-[10px] text-stone-500 font-medium">گام بعد: خدمات و آرایشگر</span>
          </div>

          <button
            id="onboarding1-next-btn"
            type="button"
            onClick={onNext}
            className="clay-button-primary w-full py-3 px-4 rounded-[18px] text-xs font-black tracking-normal flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.985]"
          >
            <span>گام بعدی: خدمات و آرایشگر</span>
            <ArrowLeft className="w-4 h-4 text-[#0f172a]" />
          </button>
        </div>
      </section>

      {/* Bottom Info Strip */}
      <section className="relative z-20 px-6 mt-2 shrink-0" dir="rtl">
        <div className="p-2.5 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-2xs flex items-center justify-center text-[11px] text-stone-700 font-medium">
          <span>آرایشگاه رویال · کیفیت کار و وقت‌شناسی</span>
        </div>
      </section>
    </AtelierShell>
  );
};
