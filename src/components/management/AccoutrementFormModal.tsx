import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, Sparkles, Edit3, Gift, Tag } from 'lucide-react';
import { Accoutrement, AccoutrementInput } from '../../types';
import { formatPrice } from '../../utils/formatUtils';
import { toPersianDigits } from '../../utils/dateUtils';

const DURATION_PRESETS = [5, 10, 15, 20, 30, 45, 60];
const TAG_PRESETS = ['اسپا', 'مراقبتی', 'ماساژ', 'VIP', 'ویژه', 'پوست و مو'];

interface AccoutrementFormModalProps {
  isOpen: boolean;
  editing: Accoutrement | null;
  onClose: () => void;
  onSubmit: (input: AccoutrementInput) => { success: boolean; message?: string };
}

export const AccoutrementFormModal: React.FC<AccoutrementFormModalProps> = ({
  isOpen,
  editing,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState<AccoutrementInput>({
    name: '',
    price: 0,
    durationMinutes: 15,
    description: '',
    isComplimentary: false,
    isActive: true,
    tag: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    if (editing) {
      setForm({
        name: editing.name,
        price: editing.price,
        durationMinutes: editing.durationMinutes,
        description: editing.description || '',
        isComplimentary: Boolean(editing.isComplimentary),
        isActive: editing.isActive !== false,
        tag: editing.tag || '',
      });
    } else {
      setForm({
        name: '',
        price: 80000,
        durationMinutes: 15,
        description: '',
        isComplimentary: false,
        isActive: true,
        tag: '',
      });
    }
  }, [isOpen, editing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('لطفاً عنوان خدمت مکمل را وارد کنید.');
      return;
    }

    const result = onSubmit({
      ...form,
      name: form.name.trim(),
      price: form.isComplimentary ? 0 : Math.max(0, Math.round(form.price)),
      durationMinutes: Math.max(0, Math.round(form.durationMinutes)),
      description: form.description?.trim() || '',
      isComplimentary: Boolean(form.isComplimentary),
      isActive: Boolean(form.isActive),
      tag: form.tag?.trim() || '',
    });

    if (!result.success) {
      setError(result.message ?? 'خطایی در ذخیره اطلاعات رخ داد.');
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
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[28px] bg-white p-5 shadow-2xl border border-stone-100"
          >
            {/* Modal Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-[#ea5848]/10 p-2 text-[#ea5848]">
                  {editing ? <Edit3 className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                </div>
                <h3 className="text-base font-black text-stone-900">
                  {editing ? 'ویرایش خدمت مکمل' : 'افزودن خدمت مکمل جدید'}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Name */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-stone-600">عنوان خدمت مکمل *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="مثلاً: ماسک لایه‌بردار ذغال، اسپا حوله گرم، شستشوی سر"
                  className={inputClass}
                  autoFocus
                />
              </div>

              {/* Tag / Badge */}
              <div>
                <label className="mb-1.5 flex items-center justify-between text-xs font-bold text-stone-600">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3 text-[#ea5848]" />
                    برچسب یا نشان ویژه (اختیاری)
                  </span>
                </label>
                <input
                  value={form.tag || ''}
                  onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
                  placeholder="مثلاً: اسپا، مراقبتی، VIP"
                  className={inputClass}
                />
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {TAG_PRESETS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, tag: t }))}
                      className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border transition-colors ${
                        form.tag === t
                          ? 'border-[#ea5848] bg-[#ea5848] text-white'
                          : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Complimentary Checkbox */}
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-rose-200/80 bg-rose-50/50 px-3.5 py-2.5 transition-colors hover:bg-rose-50/70">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-[#ea5848]" />
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">خدمت هدیه و رایگان (Complimentary)</span>
                    <span className="text-[10px] text-stone-500">بدون هزینه اضافی برای مراجعین نمایش داده شود</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={form.isComplimentary}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      isComplimentary: e.target.checked,
                      price: e.target.checked ? 0 : f.price || 80000,
                    }))
                  }
                  className="h-4 w-4 accent-[#ea5848] rounded"
                />
              </label>

              {/* Price */}
              {!form.isComplimentary && (
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-stone-600">تعرفه (تومان) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step="any"
                      value={form.price || ''}
                      onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                      placeholder="0"
                      dir="ltr"
                      className={`${inputClass} pl-16 text-left font-bold font-mono`}
                    />
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-stone-400 font-sans">
                      تومان
                    </span>
                  </div>
                  {form.price > 0 && (
                    <p className="mt-1 text-[11px] font-semibold text-[#ea5848]">
                      معادل: {formatPrice(form.price)}
                    </p>
                  )}
                </div>
              )}

              {/* Duration */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-stone-600">
                  مدت زمان اضافه به نوبت — فعلی: {toPersianDigits(form.durationMinutes)} دقیقه
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={5}
                  value={form.durationMinutes}
                  onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))}
                  dir="ltr"
                  className={`${inputClass} text-left font-mono`}
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {DURATION_PRESETS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, durationMinutes: d }))}
                      className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-colors ${
                        form.durationMinutes === d
                          ? 'border-[#ea5848] bg-[#ea5848] text-white shadow-xs'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {toPersianDigits(d)} دقیقه
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-stone-600">توضیحات و فواید خدمت</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className={`${inputClass} resize-none`}
                  placeholder="مثلاً: پاکسازی عمقی منافذ پوست با ماسک طبیعی و حوله گرم معطر"
                />
              </div>

              {/* Active Toggle */}
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-stone-200 bg-stone-50/60 px-3.5 py-2.5 transition-colors hover:bg-stone-50">
                <span className="text-xs font-bold text-stone-700">نمایش در کاتالوگ رزرو آنلاین مراجعین</span>
                <input
                  type="checkbox"
                  checked={form.isActive !== false}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="h-4 w-4 accent-[#ea5848] rounded"
                />
              </label>

              {error && (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
                  {error}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="submit"
                  className="rounded-xl bg-[#ea5848] py-2.5 text-xs font-black text-white transition-colors hover:bg-[#d64434] shadow-sm cursor-pointer"
                >
                  {editing ? 'ذخیره تغییرات' : 'افزودن خدمت مکمل'}
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

