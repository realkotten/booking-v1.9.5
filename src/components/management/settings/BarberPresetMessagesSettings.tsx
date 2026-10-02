import React, { useState, useMemo } from 'react';
import { useAtelier } from '../../../store/AtelierContext';
import { BarberPresetMessage } from '../../../types';
import { DEFAULT_BARBER_PRESET_MESSAGES, formatPresetMessage } from '../../../utils/presetMessages';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  RotateCcw, 
  Send, 
  Sparkles, 
  Info,
  Smartphone,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { toPersianDigits } from '../../../utils/dateUtils';

interface BarberPresetMessagesSettingsProps {
  onShowToast: (message: string) => void;
}

export const BarberPresetMessagesSettings: React.FC<BarberPresetMessagesSettingsProps> = ({ onShowToast }) => {
  const { 
    barbers, 
    activeBarber, 
    studio, 
    addBarberPresetMessage, 
    deleteBarberPresetMessage, 
    updateBarberPresetMessages, 
    resetBarberPresetMessages 
  } = useAtelier();

  const [selectedBarberId, setSelectedBarberId] = useState<string>(activeBarber?.id || barbers[0]?.id || 'barber-1');
  const currentBarber = useMemo(() => {
    return barbers.find((b) => b.id === selectedBarberId) || activeBarber || barbers[0];
  }, [barbers, selectedBarberId, activeBarber]);

  const presetMessages: BarberPresetMessage[] = useMemo(() => {
    if (currentBarber?.presetMessages && currentBarber.presetMessages.length > 0) {
      return currentBarber.presetMessages;
    }
    return DEFAULT_BARBER_PRESET_MESSAGES;
  }, [currentBarber]);

  // New Preset Form State
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newText, setNewText] = useState<string>('');

  // Edit Existing Preset State
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editText, setEditText] = useState<string>('');

  // Live Preview Selected Template
  const [selectedPreviewId, setSelectedPreviewId] = useState<string>(presetMessages[0]?.id || 'preset-reminder');
  const activePreviewMessage = useMemo(() => {
    return presetMessages.find((p) => p.id === selectedPreviewId) || presetMessages[0];
  }, [presetMessages, selectedPreviewId]);

  // Available dynamic placeholder tags
  const placeholderTags = [
    { label: 'نام مشتری', tag: '{نام مشتری}', example: 'سهراب سپهری' },
    { label: 'ساعت نوبت', tag: '{ساعت نوبت}', example: '۱۶:۳۰' },
    { label: 'تاریخ نوبت', tag: '{تاریخ نوبت}', example: 'امروز، ۲۶ شهریور' },
    { label: 'نام آرایشگر', tag: '{نام آرایشگر}', example: currentBarber?.name || 'علی رضایی' },
    { label: 'نام آرایشگاه', tag: '{نام آرایشگاه}', example: studio?.name || 'آرایشگاه رویال' },
    { label: 'خدمت', tag: '{خدمت}', example: 'کوتاهی مو و استایل' },
  ];

  const handleInsertTagToNew = (tag: string) => {
    setNewText((prev) => (prev ? `${prev} ${tag}` : tag));
  };

  const handleInsertTagToEdit = (tag: string) => {
    setEditText((prev) => (prev ? `${prev} ${tag}` : tag));
  };

  const handleCreatePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newText.trim()) {
      onShowToast('لطفاً عنوان و متن پیام آماده را وارد نمایید.');
      return;
    }
    const res = addBarberPresetMessage(currentBarber.id, {
      title: newTitle.trim(),
      text: newText.trim(),
      isDefault: false,
    });
    if (res.success) {
      setNewTitle('');
      setNewText('');
      setIsAddingNew(false);
      onShowToast('پیام آماده جدید با موفقیت اضافه شد.');
    } else {
      onShowToast(res.error || 'خطا در ثبت پیام آماده.');
    }
  };

  const handleStartEdit = (preset: BarberPresetMessage) => {
    setEditingPresetId(preset.id);
    setEditTitle(preset.title);
    setEditText(preset.text);
  };

  const handleSaveEdit = (presetId: string) => {
    if (!editTitle.trim() || !editText.trim()) {
      onShowToast('عنوان و متن پیام نمی‌تواند خالی باشد.');
      return;
    }
    const updated = presetMessages.map((p) =>
      p.id === presetId ? { ...p, title: editTitle.trim(), text: editText.trim() } : p
    );
    updateBarberPresetMessages(currentBarber.id, updated);
    setEditingPresetId(null);
    onShowToast('پیام آماده ویرایش گردید.');
  };

  const handleDeletePreset = (presetId: string) => {
    const res = deleteBarberPresetMessage(currentBarber.id, presetId);
    if (res.success) {
      onShowToast('پیام آماده با موفقیت حذف شد.');
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('آیا مایلید تمام پیام‌های آماده به قالب‌های پیش‌فرض اولیه بازنشانی شوند؟')) {
      resetBarberPresetMessages(currentBarber.id);
      onShowToast('قالب‌های پیامک آماده به حالت پیش‌فرض بازگشتند.');
    }
  };

  // Sample formatted output for preview
  const previewFormattedText = useMemo(() => {
    if (!activePreviewMessage) return '';
    return formatPresetMessage(activePreviewMessage.text, {
      customerName: 'سهراب سپهری',
      appointmentTime: '۱۶:۳۰',
      appointmentDate: 'امروز، ۲۶ شهریور',
      barberName: currentBarber?.name || 'علی رضایی',
      studioName: studio?.name || 'آرایشگاه رویال',
      serviceName: 'کوتاهی کلاسیک و فرم‌دهی ریش',
    });
  }, [activePreviewMessage, currentBarber, studio]);

  return (
    <div className="space-y-5" dir="rtl">
      {/* ─── Header & Barber Switcher Card ────────────────────────── */}
      <div className="clay-card rounded-3xl p-5 sm:p-6 bg-white/90 border border-white/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#4e3b6e]/10 border border-[#4e3b6e]/20 text-[#4e3b6e] flex items-center justify-center shadow-xs shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-serif font-black text-stone-900">
                  پیام‌های آماده و ارتباط هوشمند آرایشگر
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#4e3b6e]/10 text-[#4e3b6e] text-[10px] font-bold">
                  {toPersianDigits(presetMessages.length)} قالب فعال
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                شخصی‌سازی پیامک‌های یادآوری، اعلام آمادگی صندلی، تاخیر و قدردانی با جایگذاری خودکار اطلاعات نوبت
              </p>
            </div>
          </div>

          {/* Actions & Barber Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            {barbers.length > 1 && (
              <select
                value={selectedBarberId}
                onChange={(e) => setSelectedBarberId(e.target.value)}
                aria-label="انتخاب آرایشگر جهت مدیریت پیام‌های آماده"
                className="px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-xs font-bold text-stone-800 cursor-pointer"
              >
                {barbers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.title})
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={handleResetDefaults}
              className="clay-button-pastel px-3 py-1.5 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 transition-all flex items-center gap-1 cursor-pointer"
              title="بازنشانی به قالب‌های پیش‌فرض"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
              <span>بازنشانی پیش‌فرض</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddingNew((prev) => !prev)}
              className="px-3.5 py-1.5 rounded-xl bg-[#4e3b6e] hover:bg-[#3d2e57] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingNew ? 'بستن فرم' : 'افزودن پیام جدید'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Tags Guide Banner */}
        <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-3.5 text-xs text-stone-700 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-[#4e3b6e] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-[#4e3b6e] block">متغیرهای پویا برای پیامک‌ها:</span>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              با قرار دادن تگ‌هایی مانند <code className="bg-white px-1.5 py-0.5 rounded text-[#4e3b6e] font-mono font-bold text-[10px]">{`{نام مشتری}`}</code> یا <code className="bg-white px-1.5 py-0.5 rounded text-[#4e3b6e] font-mono font-bold text-[10px]">{`{ساعت نوبت}`}</code>، هنگام ارسال پیامک به هر مشتری این فیلدها به‌طور خودکار با اطلاعات دقیق نوبت جایگزین می‌شوند.
            </p>
          </div>
        </div>
      </div>

      {/* ─── New Preset Form (Collapsible) ─────────────────────────── */}
      {isAddingNew && (
        <form onSubmit={handleCreatePreset} className="clay-card rounded-3xl p-5 bg-white border border-[#4e3b6e]/20 shadow-md space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#4e3b6e]" />
              <h4 className="text-xs font-bold text-stone-900">افزودن پیام آماده جدید برای {currentBarber.name}</h4>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-xs text-stone-400 hover:text-stone-700"
            >
              انصراف
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                عنوان و موضوع پیام:
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="مثال: یادآوری ۳ ساعت قبل از نوبت، راهنمایی پارکینگ، مراقبت مو"
                className="w-full p-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:border-[#4e3b6e]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-700">
                  متن پیامک (همراه با تگ‌های متغیر):
                </label>
                <span className="text-[10px] text-stone-400">
                  برای درج متغیر روی دکمه‌های زیر کلیک کنید:
                </span>
              </div>

              {/* Tag Insertion Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap mb-2">
                {placeholderTags.map((pt) => (
                  <button
                    key={pt.tag}
                    type="button"
                    onClick={() => handleInsertTagToNew(pt.tag)}
                    className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-purple-100 text-[#4e3b6e] text-[10px] font-bold border border-stone-200 transition-colors cursor-pointer"
                  >
                    + {pt.label}
                  </button>
                ))}
              </div>

              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                rows={3}
                placeholder="سلام {نام مشتری} عزیز، یادآوری نوبت شما در {نام آرایشگاه} ساعت {ساعت نوبت}..."
                className="w-full p-3 rounded-xl border border-stone-200 text-xs text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:border-[#4e3b6e] leading-relaxed resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="clay-button-pastel px-4 py-2 rounded-xl text-xs font-bold text-stone-600"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#4e3b6e] hover:bg-[#3d2e57] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              ذخیره پیام آماده
            </button>
          </div>
        </form>
      )}

      {/* ─── Grid: Preset Messages List + Live Phone Preview ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Preset Messages Cards (8 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <span>فهرست قالب‌های آماده ذخیره‌شده</span>
            </h4>
            <span className="text-[10px] text-stone-500">
              کلیک روی هر پیام برای پیش‌نمایش در شبیه‌ساز گوشی
            </span>
          </div>

          <div className="space-y-3">
            {presetMessages.map((preset, index) => {
              const isSelected = selectedPreviewId === preset.id;
              const isEditing = editingPresetId === preset.id;

              return (
                <div
                  key={preset.id}
                  onClick={() => !isEditing && setSelectedPreviewId(preset.id)}
                  className={`clay-card rounded-2xl p-4 transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#4e3b6e] shadow-md ring-1 ring-[#4e3b6e]/30'
                      : 'bg-white/80 hover:bg-white border-stone-200/80 shadow-2xs'
                  }`}
                >
                  {isEditing ? (
                    <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                        <span className="text-xs font-bold text-stone-800">ویرایش پیام آماده</span>
                        <button
                          type="button"
                          onClick={() => setEditingPresetId(null)}
                          className="text-[10px] text-stone-500 hover:text-stone-800"
                        >
                          انصراف
                        </button>
                      </div>

                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full p-2 text-xs font-bold text-stone-900 border border-stone-200 rounded-xl"
                      />

                      <div className="flex items-center gap-1 flex-wrap">
                        {placeholderTags.map((pt) => (
                          <button
                            key={pt.tag}
                            type="button"
                            onClick={() => handleInsertTagToEdit(pt.tag)}
                            className="px-1.5 py-0.5 rounded bg-stone-100 hover:bg-purple-100 text-[#4e3b6e] text-[9px] font-bold"
                          >
                            + {pt.label}
                          </button>
                        ))}
                      </div>

                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={3}
                        className="w-full p-2.5 text-xs text-stone-900 border border-stone-200 rounded-xl leading-relaxed resize-none"
                      />

                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingPresetId(null)}
                          className="px-3 py-1.5 rounded-lg text-xs text-stone-600 bg-stone-100"
                        >
                          لغو
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(preset.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>ذخیره تغییرات</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#4e3b6e]" />
                          <h5 className="text-xs font-bold text-stone-900">{preset.title}</h5>
                          {preset.isDefault && (
                            <span className="px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 text-[9px] font-mono">
                              پیش‌فرض
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(preset)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                            title="ویرایش قالب"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePreset(preset.id)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            title="حذف قالب"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-stone-600 leading-relaxed font-sans bg-stone-50/70 p-2.5 rounded-xl border border-stone-100">
                        {preset.text}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Phone Mockup Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-[#7e5352]" />
            <span>پیش‌نمایش پیامک در گوشی مشتری</span>
          </h4>

          <div className="bg-stone-900 rounded-[32px] p-4 text-white shadow-xl border-4 border-stone-800 space-y-3">
            {/* Phone Top Speaker & Camera Notch */}
            <div className="flex items-center justify-center">
              <div className="w-16 h-3 bg-stone-800 rounded-full flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-700" />
                <span className="w-4 h-1 bg-stone-700 rounded-full" />
              </div>
            </div>

            {/* Simulated SMS App Bar */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-2.5 pt-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7e5352] to-[#4e3b6e] flex items-center justify-center font-bold text-xs">
                  ROYAL
                </div>
                <div>
                  <span className="text-xs font-bold block">{studio?.name || 'آرایشگاه رویال'}</span>
                  <span className="text-[9px] text-stone-400">{currentBarber.name} (آرایشگر)</span>
                </div>
              </div>
              <span className="text-[9px] text-stone-400 font-mono">امروز، ۱۶:۳۰</span>
            </div>

            {/* Chat Bubble Container */}
            <div className="min-h-[160px] flex flex-col justify-end space-y-2 p-1">
              <div className="self-end max-w-[90%] bg-[#0b84fe] text-white rounded-2xl rounded-bl-sm p-3 text-xs leading-relaxed shadow-sm font-sans">
                {previewFormattedText}
              </div>
              <div className="text-left text-[9px] text-stone-500 font-mono px-1">
                تحویل داده شد · Delivered
              </div>
            </div>

            {/* Active Template Title Tag */}
            <div className="bg-stone-800/80 rounded-xl p-2 text-center text-[10px] text-stone-300 border border-stone-700">
              قالب در حال مشاهده: <strong className="text-amber-300">{activePreviewMessage?.title}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
