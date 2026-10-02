import React, { useState } from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';

interface EnamadBadgeProps {
  className?: string;
  variant?: 'banner' | 'badge';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const EnamadBadge: React.FC<EnamadBadgeProps> = ({
  className = '',
  variant = 'banner',
  size = 'md',
  showText = true,
}) => {
  const [imageError, setImageError] = useState(false);

  const enamadUrl =
    'https://trustseal.enamad.ir/?id=7924701&Code=hF89YEkBi8Ejb8HmLWWdMWqh774YebTK';
  const enamadImgSrc =
    'https://trustseal.enamad.ir/logo.aspx?id=7924701&Code=hF89YEkBi8Ejb8HmLWWdMWqh774YebTK';

  const openEnamadPopup = (e: React.MouseEvent<HTMLAnchorElement>) => {
    try {
      window.open(
        enamadUrl,
        'EnamadPopup',
        'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=450, height=650, top=60, left=120'
      );
      e.preventDefault();
    } catch {
      // fallback to normal link navigation
    }
  };

  // Authentic eNamad SVG logo reproducing the official certificate badge
  const renderEnamadLogo = (imgClassName: string) => {
    if (!imageError) {
      return (
        <img
          referrerPolicy="origin"
          src={enamadImgSrc}
          alt=""
          loading="lazy"
          decoding="async"
          style={{ cursor: 'pointer' }}
          // @ts-expect-error enamad official code attribute
          code="hF89YEkBi8Ejb8HmLWWdMWqh774YebTK"
          className={`${imgClassName} object-contain cursor-pointer transition-transform duration-200 hover:scale-105`}
          onError={() => setImageError(true)}
        />
      );
    }

    return (
      <div className="w-full h-full flex flex-col items-center justify-between p-1 select-none text-center">
        {/* Top curved 'e' monogram in official Enamad blue */}
        <div className="relative flex items-center justify-center pt-0.5">
          <svg
            className="w-8 h-8 text-[#0d47a1]"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M50 10C27.9 10 10 27.9 10 50C10 72.1 27.9 90 50 90C65.5 90 78.9 81.2 85.5 68.5C86.5 66.5 85.2 64 83 64H68C66.5 64 65.2 64.9 64.5 66.2C61.5 72.2 55.2 76 50 76C35.6 76 24 64.4 24 50C24 35.6 35.6 24 50 24C60.5 24 69.5 30.2 73.5 39H42C39.8 39 38 40.8 38 43V47C38 49.2 39.8 51 42 51H86C88.2 51 90 49.2 90 47C90 26.6 72.1 10 50 10Z"
              fill="currentColor"
            />
            <circle cx="50" cy="50" r="11" fill="#1565c0" />
          </svg>
        </div>

        {/* eNAMAD.ir branding */}
        <span className="text-[8px] font-black tracking-tight text-[#0d47a1] leading-none">
          eNAMAD.ir
        </span>

        {/* 1 Golden Star */}
        <div className="flex items-center justify-center gap-0.5 leading-none">
          <span className="text-[9px] text-amber-500 font-bold">★</span>
          <span className="text-[7px] text-stone-300">★</span>
          <span className="text-[7px] text-stone-300">★</span>
          <span className="text-[7px] text-stone-300">★</span>
          <span className="text-[7px] text-stone-300">★</span>
        </div>

        {/* Official caption */}
        <span className="text-[6.5px] font-medium text-stone-400 leading-tight">
          جهت اطمینان کلیک نمایید
        </span>
      </div>
    );
  };

  // BANNER VARIANT — Matches the user's uploaded screenshot exactly
  if (variant === 'banner') {
    return (
      <section
        id="enamad-trust-seal-banner"
        className={`clay-card rounded-[26px] p-3.5 sm:p-4 relative overflow-hidden backdrop-blur-md bg-white/75 border border-white/80 shadow-[0_6px_24px_rgba(0,0,0,0.04)] ${className}`}
        dir="rtl"
      >
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* Right Side: Information, Official status pill, Subtitle and Verification Link */}
          <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100/90 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              {/* Title & Gold Star Pill */}
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-extrabold text-xs sm:text-sm text-stone-900 tracking-tight">
                  نماد اعتماد الکترونیکی (اینماد)
                </h4>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fef3c7] text-[#92400e] border border-amber-300/80 shadow-2xs">
                  <span className="text-amber-500 text-[11px]">★</span>
                  <span>معتبر ۱ ستاره</span>
                </span>
              </div>

              {/* Ministry Description */}
              <p className="text-[10px] sm:text-[11px] text-stone-600 leading-relaxed font-normal">
                دارای تأییدیه رسمی مرکز توسعه تجارت الکترونیکی وزارت صمت برای رزرو آنلاین نوبت.
              </p>

              {/* Inquiry & License Verification Link */}
              <div className="pt-0.5">
                <a
                  referrerPolicy="origin"
                  target="_blank"
                  rel="noreferrer"
                  href={enamadUrl}
                  onClick={openEnamadPopup}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#5c3e8a] hover:text-[#3d275d] transition-colors group cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 text-[#5c3e8a]" />
                  <span>مشاهده و استعلام پروانه کسب الکترونیکی</span>
                </a>
              </div>
            </div>
          </div>

          {/* Left Side: White Emblem Container with Enamad Logo */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="w-[74px] h-[74px] sm:w-20 sm:h-20 bg-white rounded-2xl border border-stone-200/90 shadow-2xs p-1 flex items-center justify-center hover:shadow-md transition-all active:scale-95 group">
              <a
                referrerPolicy="origin"
                target="_blank"
                rel="noreferrer"
                href={enamadUrl}
                onClick={openEnamadPopup}
                title="مشاهده و استعلام نماد اعتماد الکترونیکی (اینماد)"
                className="w-full h-full flex items-center justify-center relative"
              >
                {renderEnamadLogo('w-full h-full')}
              </a>
            </div>
            <span className="text-[9.5px] font-bold text-stone-500 mt-1 tracking-tight">
              تأییدشده
            </span>
          </div>
        </div>
      </section>
    );
  }

  // COMPACT BADGE VARIANT — For Checkout & Profile Views
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  }[size];

  return (
    <div
      className={`flex flex-col items-center justify-center gap-1.5 select-none ${className}`}
      dir="rtl"
    >
      <div className="p-1.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs hover:shadow-md transition-all active:scale-95 inline-flex items-center justify-center">
        <a
          referrerPolicy="origin"
          target="_blank"
          rel="noreferrer"
          href={enamadUrl}
          onClick={openEnamadPopup}
          title="نماد اعتماد الکترونیکی (اینماد)"
          className="inline-block relative"
        >
          <div className={sizeClasses}>{renderEnamadLogo('w-full h-full')}</div>
        </a>
      </div>
      {showText && (
        <a
          referrerPolicy="origin"
          target="_blank"
          rel="noreferrer"
          href={enamadUrl}
          onClick={openEnamadPopup}
          className="text-[10px] font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1 transition-colors"
        >
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>دارای نماد اعتماد الکترونیکی (اینماد)</span>
        </a>
      )}
    </div>
  );
};
