import React, { useState, useMemo } from 'react';
import { AtelierShell } from './AtelierShell';
import { useAtelier } from '../store/AtelierContext';
import { Accoutrement, BeverageOption, Reservation, Service } from '../types';
import { PriceSummary } from './booking/PriceSummary';
import { PriceDisplay } from './common/PriceDisplay';
import { addMinutes, calculateBookingTotals, generateUpcomingDays, isSlotExpired } from '../utils/bookingUtils';
import { formatPrice } from '../utils/formatUtils';
import { toPersianDigits, getPersianDateForDay } from '../utils/dateUtils';
import { validateFullName } from '../utils/customerUtils';
import { hapticLight, hapticSelection, hapticSuccess, hapticWarning, triggerHaptic } from '../utils/hapticUtils';
import { ArrowRight, Check, Coffee, Phone, ShieldCheck, User, VolumeX, Sparkles, CreditCard, Store, Lock, LogOut, Ban, Leaf, GlassWater, UtensilsCrossed } from 'lucide-react';
import { EnamadBadge } from './common/EnamadBadge';

interface BookCheckoutViewProps {
  service: Service | null;
  selectedDay: number;
  selectedTime: string;
  accoutrements: Accoutrement[];
  onBack: () => void;
  onConfirmBooking: (confirmedRes: Reservation) => void;
  onOpenProfile?: () => void;
}

export const BookCheckoutView: React.FC<BookCheckoutViewProps> = ({
  service,
  selectedDay,
  selectedTime,
  accoutrements,
  onBack,
  onConfirmBooking,
  onOpenProfile,
}) => {
  const { 
    currentCustomer, 
    beverageOptions, 
    activeBarber, 
    activeChair, 
    createOnlineBooking, 
    settings,
    authUser,
    isUserAuthenticated,
    openClientAuthModal,
    signOutUser
  } = useAtelier();
  const defaultBarber = settings?.profile?.masterName?.trim() || activeBarber?.name || 'آرایشگر اختصاصی';

  const mainScrollRef = React.useRef<HTMLElement>(null);
  const nameInputRef = React.useRef<HTMLInputElement>(null);
  const phoneInputRef = React.useRef<HTMLInputElement>(null);

  const [customerName, setCustomerName] = useState(currentCustomer?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentCustomer?.phone || '');
  const [customerNotes, setCustomerNotes] = useState('');
  const [selectedBeverageId, setSelectedBeverageId] = useState<string>('none');
  const [isQuietSession, setIsQuietSession] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'onsite'>('online');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [highlightMissingInfo, setHighlightMissingInfo] = useState(false);

  // Sync inputs if customer profile or auth updates
  React.useEffect(() => {
    if (currentCustomer?.name && customerName === '') {
      setCustomerName(currentCustomer.name);
    }
    if (currentCustomer?.phone && customerPhone === '') {
      setCustomerPhone(currentCustomer.phone);
    }
  }, [currentCustomer]);

  const days = useMemo(() => generateUpcomingDays(14), []);
  const activeDay = days.find((d) => d.dayNumber === selectedDay) ?? days[0];
  const totals = useMemo(() => calculateBookingTotals(service, accoutrements), [service, accoutrements]);

  const isHospitalityEnabled = settings?.hospitalityEnabled !== false;

  const availableBeverages = useMemo(
    () => beverageOptions.filter((b) => b.isAvailable !== false),
    [beverageOptions]
  );

  const selectedBeverage = useMemo(() => {
    if (selectedBeverageId === 'none') return null;
    return availableBeverages.find((b) => b.id === selectedBeverageId) || null;
  }, [selectedBeverageId, availableBeverages]);

  const endTime = useMemo(() => {
    if (!selectedTime) return '';
    return addMinutes(selectedTime, totals.totalDuration);
  }, [selectedTime, totals.totalDuration]);

  if (!service) return null;

  const isSelectedSlotExpired = useMemo(
    () => isSlotExpired(selectedDay, selectedTime),
    [selectedDay, selectedTime]
  );

  const handleSubmit = () => {
    if (isSelectedSlotExpired) {
      hapticWarning();
      setErrorMessage('تاریخ یا ساعت انتخابی شما سپری شده است و امکان رزرو ندارد. لطفاً بازگردید و ساعت آینده را انتخاب فرمایید.');
      mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const nameValidation = validateFullName(customerName);
    if (!nameValidation.isValid) {
      hapticWarning();
      setErrorMessage(nameValidation.error || 'لطفاً نام و نام‌خانوادگی کامل خود را وارد کنید (شامل نام و نام خانوادگی با فاصله بین آن‌ها).');
      setHighlightMissingInfo(true);
      mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 200);
      return;
    }
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 10) {
      hapticWarning();
      setErrorMessage('لطفاً شماره تماس معتبر (حداقل ۱۰ رقم) وارد کنید');
      setHighlightMissingInfo(true);
      mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        phoneInputRef.current?.focus();
      }, 200);
      return;
    }

    setErrorMessage(null);
    setHighlightMissingInfo(false);
    setIsSubmitting(true);

    try {
      const selectedBeverage = beverageOptions.find((b) => b.id === selectedBeverageId);
      const selectedDayOption = days.find((d) => d.dayNumber === selectedDay) ?? days[0];
      const targetDateStr = selectedDayOption
        ? `${selectedDayOption.weekday}، ${toPersianDigits(selectedDayOption.dayNumber)} ${selectedDayOption.label.split(' ')[1] || ''}`
        : getPersianDateForDay(selectedDay);

      const res = createOnlineBooking({
        serviceId: service.id,
        dayNumber: selectedDay,
        dateString: targetDateStr,
        startTime: selectedTime,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        beverageId: selectedBeverageId,
        isQuietSession,
        customerNotes,
        accoutrements: totals.selectedExtras,
      });

      if (!res.success) {
        hapticWarning();
        setErrorMessage(res.error || 'خطا در ثبت نوبت. امکان رزرو این ساعت وجود ندارد.');
        return;
      }

      hapticSuccess();

      if (res.reservation) {
        onConfirmBooking(res.reservation);
      }
    } catch (e: any) {
      hapticWarning();
      setErrorMessage(e?.message || 'خطا در ثبت نوبت. لطفاً دوباره تلاش فرمایید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AtelierShell id="book-checkout-container">
      {/* Top Header */}
      <header id="checkout-header" className="relative z-30 flex shrink-0 items-center justify-between px-6 pt-1" dir="rtl">
        <button
          type="button"
          onClick={() => {
            hapticLight();
            onBack();
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white bg-white/80 shadow-2xs transition-transform active:scale-95 cursor-pointer"
          title="بازگشت به انتخاب زمان"
        >
          <ArrowRight className="h-4 w-4 text-stone-700" />
        </button>

        <div className="text-center">
          <span className="block text-[9px] font-bold text-[#bf5938]">مرحله نهایی</span>
          <h1 className="font-serif text-sm font-bold text-stone-900">تأیید و صدور کارت ورود</h1>
        </div>

        {onOpenProfile ? (
          <button
            type="button"
            onClick={() => {
              hapticLight();
              onOpenProfile();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white bg-white/80 shadow-2xs transition-transform active:scale-95 cursor-pointer"
            title="پروفایل کاربری"
          >
            <User className="h-4 w-4 text-stone-700" />
          </button>
        ) : (
          <div className="h-8 w-8" />
        )}
      </header>

      {/* Main Content Area */}
      <main ref={mainScrollRef} className="flex-1 overflow-y-auto px-4 pb-36 pt-3 scroll-smooth" dir="rtl">
        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-3 rounded-2xl border border-rose-300 bg-[#fadfe8]/95 p-3 text-xs font-bold text-[#8a3350] shadow-sm animate-shake">
            {errorMessage}
          </div>
        )}

        {/* 1st Section: Customer Information Inputs */}
        <section
          id="checkout-customer-section"
          className={`mb-3 space-y-2.5 clay-card rounded-[26px] p-4 transition-all duration-300 ${
            highlightMissingInfo ? 'ring-2 ring-rose-400 bg-rose-50/20 shadow-md' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-xs font-black text-stone-900">
              <User className="h-4 w-4 text-[#bf5938]" />
              مشخصات مراجع (الزامی)
            </h3>
            {isUserAuthenticated && authUser ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-emerald-800 font-bold max-w-[120px] truncate">
                  {authUser.displayName || 'متصل به حساب'}
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    hapticLight();
                    await signOutUser();
                  }}
                  title="خروج از حساب"
                  className="text-[10px] text-rose-600 hover:text-rose-700 font-bold hover:underline flex items-center gap-0.5 bg-gradient-to-b from-[#fadfe8] to-[#f6cfdc] px-2 py-0.5 rounded-lg shadow-2xs border border-white/80 cursor-pointer"
                >
                  <LogOut className="w-2.5 h-2.5" />
                  <span>خروج</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openClientAuthModal('login')}
                className="text-[10px] text-[#bf5938] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>ورود به حساب</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-bold text-stone-700">نام و نام‌خانوادگی کامل <span className="text-rose-500">*</span></label>
                <span className="text-[9px] text-stone-500">حداقل ۲ کلمه با فاصله</span>
              </div>
              <input
                ref={nameInputRef}
                type="text"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                  if (highlightMissingInfo) setHighlightMissingInfo(false);
                }}
                placeholder="مثال: آرش کیانی"
                className={`w-full rounded-2xl input-3d px-3.5 py-2.5 text-xs text-stone-900 transition-all ${
                  (customerName.trim() && !validateFullName(customerName).isValid) || (highlightMissingInfo && !customerName.trim())
                    ? 'border-rose-400 bg-rose-50/30'
                    : ''
                }`}
              />
              {customerName.trim() && !validateFullName(customerName).isValid && (
                <p className="mt-1 text-[10px] text-amber-700 flex items-center gap-1 font-medium">
                  <span>* لطفاً نام و نام‌خانوادگی کامل را با فاصله وارد فرمایید (مثال: آرش کیانی)</span>
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold text-stone-700">شماره موبایل (جهت ارسال پیامک نوبت) <span className="text-rose-500">*</span></label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  ref={phoneInputRef}
                  type="tel"
                  dir="ltr"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                    if (highlightMissingInfo) setHighlightMissingInfo(false);
                  }}
                  placeholder="09123456789"
                  className={`w-full rounded-2xl input-3d py-2.5 pl-9 pr-3.5 text-left text-xs font-mono text-stone-900 placeholder:text-stone-400 transition-all ${
                    highlightMissingInfo && (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 10)
                      ? 'border-rose-400 bg-rose-50/30'
                      : ''
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold text-stone-700">یادداشت یا درخواست ویژه (اختیاری)</label>
              <textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                rows={2}
                placeholder="توضیحات مدل مو، حساسیت یا زمان‌بندی..."
                className="w-full resize-none rounded-2xl input-3d px-3.5 py-2 text-xs text-stone-900"
              />
            </div>
          </div>
        </section>

        {/* 2nd Section: Appointment Recap Card */}
        <section className="mb-3 overflow-hidden clay-card rounded-[26px] p-4">
          <div className="flex items-center justify-between border-b border-stone-200/70 pb-3">
            <div>
              <span className="text-[10px] font-bold text-[#4e3b6e]">خدمت اصلی</span>
              <h2 className="text-sm font-black text-stone-900">{service.name}</h2>
              <div className="mt-1">
                <PriceDisplay service={service} size="xs" />
              </div>
            </div>
            <div className="text-left">
              <span className="text-[10px] text-stone-500 block font-medium">{activeBarber?.name}</span>
              <span className="text-xs font-bold text-stone-900">{activeChair?.name}</span>
            </div>
          </div>

          {totals.hasDiscount && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50/90 border border-emerald-200 flex items-center justify-between text-[11px] shadow-2xs">
              <span className="flex items-center gap-1.5 font-bold text-emerald-900">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>تخفیف ویژه اعمال‌شده ({toPersianDigits(totals.discountPercent)}٪):</span>
              </span>
              <span className="font-bold text-emerald-800 tabular-nums">
                سود شما: {formatPrice(totals.discountAmount)}
              </span>
            </div>
          )}

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-2xl clay-card-subtle p-2.5">
              <span className="block text-[10px] text-stone-500 font-medium">تاریخ حضور</span>
              <span className="font-bold text-stone-900">{activeDay.weekday}، {activeDay.label}</span>
            </div>
            <div className="rounded-2xl clay-card-subtle p-2.5">
              <span className="block text-[10px] text-stone-500 font-medium">ساعت و مدت زمان</span>
              <span className="font-bold text-stone-900">
                {toPersianDigits(selectedTime)} ({toPersianDigits(totals.totalDuration)} دقیقه)
              </span>
            </div>
          </div>

          {totals.selectedExtras.length > 0 && (
            <div className="mt-3 border-t border-stone-200/70 pt-2.5">
              <span className="text-[10px] font-bold text-stone-600 block mb-1">خدمات تکمیلی:</span>
              <div className="flex flex-wrap gap-1.5">
                {totals.selectedExtras.map((a) => (
                  <span
                    key={a.id}
                    className="inline-flex items-center gap-1 rounded-xl clay-pill-3d px-2.5 py-1 text-[11px] font-medium text-stone-800"
                  >
                    <Check className="h-3 w-3 text-[#4e3b6e]" />
                    {a.name} ({formatPrice(a.price)})
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Hospitality & Quiet Session Preferences */}
        {isHospitalityEnabled ? (
          <section className="mb-3 space-y-3 clay-card rounded-[26px] p-4">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-xs font-black text-stone-800">
                <Coffee className="h-4 w-4 text-[#4e3b6e]" />
                سفارشی‌سازی میزبانی و منوی پذیرایی
              </h3>
              <span className="text-[10px] font-semibold text-stone-500">اختیاری</span>
            </div>

            <div className="space-y-2.5">
              <div>
                <span className="mb-1.5 block text-[10px] font-bold text-stone-700">
                  انتخاب نوشیدنی یا میان‌وعده بدو ورود:
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Always Available "Nothing / No Refreshment" Option */}
                  <button
                    type="button"
                    onClick={() => {
                      hapticSelection();
                      setSelectedBeverageId('none');
                    }}
                    className={`flex items-center justify-between rounded-2xl p-2.5 text-right transition-all cursor-pointer ${
                      selectedBeverageId === 'none'
                        ? 'clay-card ring-2 ring-[#4e3b6e] shadow-md font-bold text-stone-900'
                        : 'tactile-tile-3d text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-xl ${
                        selectedBeverageId === 'none' ? 'bg-stone-200 text-stone-800' : 'bg-stone-100 text-stone-500'
                      }`}>
                        <Ban className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="block text-[11px] font-bold">هیچ‌کدام (میل ندارم)</span>
                        <span className="text-[9px] text-stone-500">بدون سفارش پذیرایی</span>
                      </div>
                    </div>
                    <span className="rounded-lg clay-pill-3d px-2 py-0.5 text-[10px] font-bold text-stone-700">
                      رایگان
                    </span>
                  </button>

                  {/* Configured Beverage / Hospitality Items */}
                  {availableBeverages.map((b) => {
                    const isSelected = selectedBeverageId === b.id;
                    const isPriced = b.price > 0;

                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          hapticSelection();
                          setSelectedBeverageId(b.id);
                        }}
                        className={`flex items-center justify-between rounded-2xl p-2.5 text-right transition-all cursor-pointer ${
                          isSelected
                            ? 'clay-card ring-2 ring-[#bf5938] shadow-md font-bold text-stone-900'
                            : 'tactile-tile-3d text-stone-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${
                            isSelected ? 'bg-[#bf5938] text-white shadow-2xs' : 'bg-[#fdf2ee] text-[#bf5938]'
                          }`}>
                            {b.icon === 'tea' ? (
                              <Leaf className="h-4 w-4" />
                            ) : b.icon === 'water' || b.icon === 'juice' ? (
                              <GlassWater className="h-4 w-4" />
                            ) : b.icon === 'croissant' ? (
                              <UtensilsCrossed className="h-4 w-4" />
                            ) : (
                              <Coffee className="h-4 w-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="block text-[11px] font-bold truncate">{b.name}</span>
                            {b.description && (
                              <span className="block text-[9px] text-stone-500 truncate max-w-[140px]">
                                {b.description}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 text-left">
                          {isPriced ? (
                            <span className={`rounded-lg px-2 py-0.5 text-[10px] font-mono font-bold ${
                              isSelected ? 'bg-[#fdf2ee] border border-[#f3d0c4] text-[#bf5938]' : 'clay-pill-3d text-stone-800'
                            }`}>
                              +{toPersianDigits(b.price.toLocaleString())}
                            </span>
                          ) : (
                            <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              رایگان
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quiet Session Toggle */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('toggle');
                  setIsQuietSession((q) => !q);
                }}
                className={`flex w-full items-center justify-between rounded-2xl p-3 transition-all cursor-pointer ${
                  isQuietSession
                    ? 'clay-card ring-2 ring-[#bf5938] bg-[#fdf2ee]/50 text-stone-900'
                    : 'tactile-tile-3d text-stone-700'
                }`}
              >
                <span className="flex items-center gap-2 text-xs font-bold">
                  <VolumeX className="h-4 w-4 text-[#bf5938]" />
                  سشن سکوت (عدم مکالمه غیرضروری برای تمرکز و آرامش)
                </span>
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-lg transition-all ${
                    isQuietSession ? 'bg-[#bf5938] text-white shadow-2xs' : 'border border-stone-300 bg-white'
                  }`}
                >
                  {isQuietSession && <Check className="h-3 w-3" />}
                </div>
              </button>
            </div>
          </section>
        ) : (
          /* Quiet Session Only if Hospitality is disabled */
          <section className="mb-3 clay-card rounded-[26px] p-3.5">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('toggle');
                setIsQuietSession((q) => !q);
              }}
              className={`flex w-full items-center justify-between rounded-2xl p-3 transition-all cursor-pointer ${
                isQuietSession
                  ? 'clay-card ring-2 ring-[#bf5938] bg-[#fdf2ee]/50 text-stone-900'
                  : 'tactile-tile-3d text-stone-700'
              }`}
            >
              <span className="flex items-center gap-2 text-xs font-bold">
                <VolumeX className="h-4 w-4 text-[#bf5938]" />
                سشن سکوت (عدم مکالمه غیرضروری برای تمرکز و آرامش)
              </span>
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-lg transition-all ${
                  isQuietSession ? 'bg-[#bf5938] text-white shadow-2xs' : 'border border-stone-300 bg-white'
                }`}
              >
                {isQuietSession && <Check className="h-3 w-3" />}
              </div>
            </button>
          </section>
        )}

        {/* Security and Guarantee */}
        <div className="clay-card-subtle flex items-center justify-between rounded-2xl p-3 text-[11px] text-stone-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#0f172a]" />
            <span>تضمین رضایت و حریم خصوصی مراجعین رویال</span>
          </div>
          <span className="font-bold text-[#bf5938]">تأیید آنی</span>
        </div>

        {/* Official Electronic Trust Seal */}
        <div className="pt-1 pb-2 flex justify-center">
          <EnamadBadge variant="badge" size="sm" />
        </div>
      </main>

      {/* Floating Price Summary & Confirm Button */}
      <PriceSummary
        service={service}
        accoutrements={accoutrements}
        beverage={isHospitalityEnabled ? selectedBeverage : null}
        ctaLabel={
          isSelectedSlotExpired
            ? 'ساعت انتخابی گذشته است'
            : isSubmitting
            ? 'در حال صدور کارت ورود...'
            : 'تأیید نهایی و صدور نوبت'
        }
        onCta={handleSubmit}
        ctaDisabled={isSubmitting || isSelectedSlotExpired}
        disabledHint={
          isSelectedSlotExpired
            ? 'ساعت انتخابی سپری شده است؛ لطفاً بازگردید و ساعت آینده را انتخاب کنید'
            : undefined
        }
      />
    </AtelierShell>
  );
};
