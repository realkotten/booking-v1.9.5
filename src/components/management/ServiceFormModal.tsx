import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, Scissors, Edit3, Tag, Sparkles, AlertCircle, Percent } from 'lucide-react';
import { Service, ServiceCategory, ServiceInput } from '../../types';
import { formatPrice } from '../../utils/formatUtils';
import { toPersianDigits } from '../../utils/dateUtils';

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120, 180, 240];
const DISCOUNT_PRESETS = [10, 15, 20, 25, 30];

interface ServiceFormModalProps {
  isOpen: boolean;
  editing: Service | null;
  presetCategoryId?: string;
  categories: ServiceCategory[];
  onClose: () => void;
  onSubmit: (input: ServiceInput) => { success: boolean; message?: string };
}

export const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  isOpen,
  editing,
  presetCategoryId,
  categories,
  onClose,
  onSubmit,
}) => {
  const [categoryId, setCategoryId] = useState('');
  const [name, setName] = useState('');
  const [realPrice, setRealPrice] = useState<number | ''>(250000);
  const [discountedPrice, setDiscountedPrice] = useState<number | ''>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    if (editing) {
      setCategoryId(editing.categoryId || presetCategoryId || categories[0]?.id || '');
      setName(editing.name);
      
      const effectiveRealPrice = editing.realPrice ?? editing.price;
      setRealPrice(effectiveRealPrice);
      
      // Determine if editing service had an active discount
      if (editing.discountedPrice && editing.discountedPrice > 0 && editing.discountedPrice < effectiveRealPrice) {
        setDiscountedPrice(editing.discountedPrice);
      } else if (editing.realPrice && editing.price < editing.realPrice) {
        setDiscountedPrice(editing.price);
      } else {
        setDiscountedPrice('');
      }

      setDurationMinutes(editing.durationMinutes || 45);
      setDescription(editing.description ?? '');
      setTag(editing.tag ?? '');
      setIsActive(editing.isActive);
    } else {
      setCategoryId(presetCategoryId ?? categories[0]?.id ?? '');
      setName('');
      setRealPrice(250000);
      setDiscountedPrice('');
      setDurationMinutes(45);
      setDescription('');
      setTag('');
      setIsActive(true);
    }
  }, [isOpen, editing, presetCategoryId, categories]);

  // Derived discount calculations
  const parsedRealPrice = typeof realPrice === 'number' ? realPrice : 0;
  const parsedDiscountedPrice = typeof discountedPrice === 'number' && discountedPrice > 0 ? discountedPrice : null;

  const hasDiscount = useMemo(() => {
    return parsedDiscountedPrice !== null && parsedDiscountedPrice > 0 && parsedDiscountedPrice < parsedRealPrice;
  }, [parsedDiscountedPrice, parsedRealPrice]);

  const discountAmount = hasDiscount && parsedDiscountedPrice !== null ? parsedRealPrice - parsedDiscountedPrice : 0;
  const discountPercent = hasDiscount && parsedRealPrice > 0
    ? Math.round((discountAmount / parsedRealPrice) * 100)
    : 0;

  const handleApplyPresetDiscount = (percent: number) => {
    if (parsedRealPrice <= 0) return;
    const discounted = Math.round((parsedRealPrice * (100 - percent)) / 100 / 1000) * 1000;
    setDiscountedPrice(discounted);
  };

  const handleClearDiscount = () => {
    setDiscountedPrice('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalName = name.trim();
    if (finalName.length < 2) {
      setError('نام خدمت باید حداقل ۲ حرف باشد.');
      return;
    }
    if (!categoryId) {
      setError('لطفاً یک دسته‌بندی برای خدمت انتخاب فرمایید.');
      return;
    }

    if (!parsedRealPrice || parsedRealPrice <= 0) {
      setError('لطفاً قیمت واقعی (اصلی) معتبر وارد فرمایید.');
      return;
    }

    if (parsedDiscountedPrice !== null) {
      if (parsedDiscountedPrice <= 0) {
        setError('قیمت با تخفیف باید بزرگتر از صفر باشد.');
        return;
      }
      if (parsedDiscountedPrice >= parsedRealPrice) {
        setError('قیمت با تخفیف باید کمتر از قیمت اصلی (واقعی) باشد.');
        return;
      }
    }

    const effectivePayablePrice = hasDiscount && parsedDiscountedPrice !== null
      ? parsedDiscountedPrice
      : parsedRealPrice;

    const result = onSubmit({
      categoryId,
      name: finalName,
      price: effectivePayablePrice,
      realPrice: parsedRealPrice,
      discountedPrice: hasDiscount && parsedDiscountedPrice !== null ? parsedDiscountedPrice : undefined,
      durationMinutes: Math.round(durationMinutes),
      description: description.trim(),
      tag: tag.trim() || undefined,
      isActive,
    });

    if (!result.success) {
      setError(result.message ?? 'خطای نامشخص در ثبت اطلاعات خدمت');
    }
  };

  const inputClass =
    'w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition-colors focus:border-[#ea5848] focus:ring-2 focus:ring-[#ea5848]/20';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.form
            onSubmit={handleSubmit}
            initial={{ scale: 0.95, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 16 }}
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
            className="h-[532px] max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white p-5 pt-[20px] ml-0 -mt-[15px] shadow-2xl border border-stone-100"
          >
            {/* Modal Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-[#ea5848]/10 p-2 text-[#ea5848]">
                  {editing ? <Edit3 className="h-4 w-4" /> : <Scissors className="h-4 w-4" />}
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">
                    {editing ? 'ویرایش خدمت و تعرفه' : 'افزودن خدمت جدید'}
                  </h3>
                  <span className="text-[10px] text-stone-500 font-medium">
                    تنظیم قیمت اصلی، تخفیف ویژه و نمایش در کاتالوگ مراجعین
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Service Name */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-stone-700">نام خدمت *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثلاً: اصلاح موی کلاسیک، فید ژورنالی، پاکسازی پوست"
                  className={inputClass}
                  autoFocus
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-stone-700">دسته‌بندی *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">— انتخاب دسته‌بندی —</option>
                  {categories
                    .filter((c) => c.isActive)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* ─── DUAL PRICING: REAL PRICE & DISCOUNTED PRICE ─── */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                    <Tag className="h-3.5 w-3.5 text-[#ea5848]" />
                    تعیین قیمت اصلی و قیمت با تخفیف
                  </span>
                  <span className="text-[10px] text-stone-500">واحد: تومان</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Field 1: Real / Original Price */}
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-stone-700">
                      قیمت واقعی (اصلی) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step="any"
                        value={realPrice}
                        onChange={(e) => setRealPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="مثال: ۳۰۰,۰۰۰"
                        dir="ltr"
                        className={`${inputClass} pl-14 text-left font-bold font-mono text-stone-900`}
                      />
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-stone-400 font-sans">
                        تومان
                      </span>
                    </div>
                    {parsedRealPrice > 0 && (
                      <p className="mt-1 text-[10px] text-stone-500 font-medium">
                        معادل: {formatPrice(parsedRealPrice)}
                      </p>
                    )}
                  </div>

                  {/* Field 2: Discounted Price */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-stone-700">
                        قیمت با تخفیف (اختیاری)
                      </label>
                      {discountedPrice !== '' && (
                        <button
                          type="button"
                          onClick={handleClearDiscount}
                          className="text-[10px] text-rose-600 hover:underline font-bold"
                        >
                          حذف تخفیف
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step="any"
                        value={discountedPrice}
                        onChange={(e) => setDiscountedPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="در صورت داشتن تخفیف"
                        dir="ltr"
                        className={`${inputClass} pl-14 text-left font-bold font-mono ${
                          hasDiscount
                            ? 'border-emerald-400 bg-emerald-50/40 text-emerald-900 focus:border-emerald-600 focus:ring-emerald-200'
                            : 'text-stone-900'
                        }`}
                      />
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-stone-400 font-sans">
                        تومان
                      </span>
                    </div>
                    {parsedDiscountedPrice !== null && (
                      <p className="mt-1 text-[10px] font-medium text-emerald-700">
                        پرداختی مشتری: {formatPrice(parsedDiscountedPrice)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Discount Percentages */}
                <div>
                  <span className="mb-1.5 block text-[10px] font-bold text-stone-600">
                    محاسبه سریع تخفیف درصدی بر اساس قیمت اصلی:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {DISCOUNT_PRESETS.map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => handleApplyPresetDiscount(pct)}
                        disabled={parsedRealPrice <= 0}
                        className={`rounded-lg border px-2 py-1 text-[10px] font-bold transition-all cursor-pointer ${
                          discountPercent === pct
                            ? 'border-emerald-500 bg-emerald-600 text-white shadow-2xs'
                            : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100 disabled:opacity-30'
                        }`}
                      >
                        {toPersianDigits(pct)}٪ تخفیف
                      </button>
                    ))}
                    {discountedPrice !== '' && (
                      <button
                        type="button"
                        onClick={handleClearDiscount}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-700 hover:bg-rose-100 transition-colors"
                      >
                        بدون تخفیف
                      </button>
                    )}
                  </div>
                </div>

                {/* Live Discount Preview Box */}
                {hasDiscount && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs space-y-1.5 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 font-bold text-emerald-900">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                        پیش‌نمایش نمایش به مشتری:
                      </span>
                      <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-[10px] font-black text-emerald-900">
                        {toPersianDigits(discountPercent)}٪ تخفیف ویژه
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-emerald-200/60">
                      <span className="text-stone-400 line-through tabular-nums text-xs">
                        {formatPrice(parsedRealPrice)}
                      </span>
                      <span className="font-black text-emerald-900 tabular-nums text-sm">
                        {formatPrice(parsedDiscountedPrice!)}
                      </span>
                      <span className="text-stone-600 text-[11px] mr-auto">
                        (سود مراجع: {formatPrice(discountAmount)})
                      </span>
                    </div>
                  </div>
                )}

                {/* Validation hint if discounted >= real */}
                {parsedDiscountedPrice !== null && parsedDiscountedPrice >= parsedRealPrice && parsedRealPrice > 0 && (
                  <div className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 p-2.5 text-[11px] text-amber-800">
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                    <span>قیمت با تخفیف باید کمتر از قیمت اصلی ({formatPrice(parsedRealPrice)}) باشد.</span>
                  </div>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-stone-700">
                  مدت زمان انجام خدمت * — فعلی: {toPersianDigits(durationMinutes)} دقیقه
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={5}
                  step={5}
                  value={durationMinutes || ''}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  dir="ltr"
                  className={`${inputClass} text-left font-mono`}
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {DURATION_PRESETS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDurationMinutes(d)}
                      className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                        durationMinutes === d
                          ? 'border-[#ea5848] bg-[#ea5848] text-white shadow-xs'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {toPersianDigits(d)} دقیقه
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag / Badge */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-stone-700">برچسب اختصاصی (اختیاری)</label>
                <input
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="مثلاً: محبوب‌ترین، پکیج ویژه، تخفیف فصلی"
                  className={inputClass}
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-stone-700">توضیحات و جزئیات (اختیاری)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className={`${inputClass} resize-none`}
                  placeholder="مثلاً: شامل شستشو با شامپوی مخصوص و ماساژ سر با حوله گرم"
                />
              </div>

              {/* Active Toggle */}
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-stone-200 bg-stone-50/60 px-3.5 py-2.5 transition-colors hover:bg-stone-50">
                <span className="text-xs font-bold text-stone-700">نمایش در کاتالوگ رزرو آنلاین مراجعین</span>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 accent-[#ea5848] rounded cursor-pointer"
                />
              </label>

              {/* Error Message */}
              {error && (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
                  {error}
                </p>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="submit"
                  className="rounded-xl bg-[#ea5848] py-2.5 text-xs font-black text-white transition-colors hover:bg-[#d64434] shadow-sm cursor-pointer"
                >
                  {editing ? 'ذخیره تغییرات' : 'افزودن خدمت'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-stone-200 py-2.5 text-xs font-bold text-stone-700 transition-colors hover:bg-stone-50 cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
