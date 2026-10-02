import React from 'react';
import { ATELIER_IMAGES } from '../data/mockData';
import { AtelierShell } from './AtelierShell';
import { ArrowLeft, ArrowRight, UserCheck, CheckCircle2 } from 'lucide-react';

interface OnboardingStep2Props {
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
  onSignIn?: () => void;
}

export const OnboardingStep2: React.FC<OnboardingStep2Props> = ({
  onNext,
  onSkip,
  onBack,
}) => {
  return (
    <AtelierShell id="onboarding-step2-container" bottomPadding="pb-8">
      {/* Top Header */}
      <header
        id="onboarding2-topbar"
        className="relative z-30 px-6 pt-2 flex items-center justify-between shrink-0"
        dir="rtl"
      >
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 py-1 px-3 rounded-full bg-white/50 hover:bg-white/80 backdrop-blur-md border border-white/60 text-stone-800 text-xs font-medium transition-all"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>بازگشت</span>
        </button>

        <span className="text-xs font-semibold text-stone-900">
          آرایشگاه رویال
        </span>

        <button
          id="onboarding2-skip-btn"
          type="button"
          onClick={onSkip}
          className="text-xs text-stone-700 hover:text-stone-950 font-medium py-1 px-3 rounded-full bg-white/50 hover:bg-white/80 backdrop-blur-sm border border-white/60 transition-all"
        >
          رد کردن
        </button>
      </header>

      {/* Main Floating Glass Container */}
      <section
        id="onboarding2-glass-card"
        className="relative z-20 mx-auto w-full max-w-sm sm:max-w-md clay-card rounded-[30px] border border-white p-3.5 pt-3 pb-3.5 flex flex-col justify-between mt-1 flex-1 min-h-0 overflow-y-auto"
        dir="rtl"
      >
        {/* Upper Image Card */}
        <div className="relative w-full h-[220px] rounded-[26px] overflow-hidden shadow-sm shrink-0">
          <img
            src={ATELIER_IMAGES.darkStudio}
            alt="آرایشگر مورد اعتماد شما"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-center filter brightness-95 contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 pointer-events-none" />

          {/* Upper Badges */}
          <div className="absolute top-3.5 right-4 left-4 flex justify-between items-center">
            <span className="px-3 py-1 rounded-full bg-[#fedecb] text-[#6d3e26] text-[10px] font-bold shadow-xs">
              گام ۲ از ۳
            </span>
            <span className="px-3 py-1 rounded-full bg-black/60 text-[#fedecb] text-[10px] font-medium backdrop-blur-md border border-white/20">
              آرایشگر مورد اعتماد
            </span>
          </div>

          {/* Lower Title Overlay */}
          <div className="absolute bottom-3 right-4 left-4 text-white">
            <h2 className="text-xl font-bold tracking-tight leading-snug">
              دقیقاً همان مدلی که می‌پسندید
            </h2>
            <p className="text-[11px] text-stone-200 font-light mt-1 leading-relaxed">
              سلیقه، مدل قبلی و فرمول‌های اصلاح شما در سامانه ثبت می‌شود تا همیشه خروجی دلخواهتان باشد.
            </p>
          </div>
        </div>

        {/* Bullet Points */}
        <div className="py-3 px-1 space-y-2">
          <div className="flex items-start gap-2.5 p-2.5 rounded-2xl clay-card-subtle border border-white">
            <UserCheck className="w-4 h-4 text-[#bf5938] shrink-0 mt-0.5" />
            <p className="text-xs text-stone-800 leading-relaxed font-medium">
              یادداشت اختصاصی هر مشتری برای آرایشگر (فید، ریش، مدل مو)
            </p>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-2xl clay-card-subtle border border-white">
            <CheckCircle2 className="w-4 h-4 text-[#bf5938] shrink-0 mt-0.5" />
            <p className="text-xs text-stone-800 leading-relaxed font-medium">
              امکان انتخاب آرایشگر و صندلی اختصاصی مورد علاقه‌تان
            </p>
          </div>
        </div>

        {/* Lower Step Controller */}
        <div className="w-full clay-card-subtle rounded-[26px] p-3.5 text-stone-900 border border-white shrink-0">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 flex-row-reverse">
              <span className="w-2 h-2 rounded-full bg-stone-300" />
              <span className="w-6 h-2 rounded-full bg-[#0f172a]" />
              <span className="w-2 h-2 rounded-full bg-stone-300" />
            </div>
            <span className="text-[10px] text-stone-500 font-medium">گام بعد: یادآوری و مدیریت</span>
          </div>

          <button
            id="onboarding2-next-btn"
            type="button"
            onClick={onNext}
            className="clay-button-primary w-full py-3 px-4 rounded-[18px] text-xs font-black tracking-normal flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.985]"
          >
            <span>گام بعدی: یادآوری و مدیریت نوبت</span>
            <ArrowLeft className="w-4 h-4 text-[#0f172a]" />
          </button>
        </div>
      </section>

      {/* Bottom Info Strip */}
      <section className="relative z-20 px-6 mt-2 shrink-0" dir="rtl">
        <div className="p-2.5 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-2xs flex items-center justify-center text-[11px] text-stone-700 font-medium">
          <span>آرایشگاه رویال · ثبت دقیق سلیقه مشتریان</span>
        </div>
      </section>
    </AtelierShell>
  );
};
