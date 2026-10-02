import React, { useState, useMemo } from 'react';
import { useAtelier } from '../../store/AtelierContext';
import { BarberPresetMessage } from '../../types';
import { DEFAULT_BARBER_PRESET_MESSAGES, formatPresetMessage } from '../../utils/presetMessages';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  RotateCcw, 
  Sparkles, 
  Smartphone,
  ChevronDown,
  ChevronUp,
  Copy,
  Info
} from 'lucide-react';
import { toPersianDigits } from '../../utils/dateUtils';
import { hapticLight, hapticSuccess, hapticWarning } from '../../utils/hapticUtils';

interface BarberPresetMessagesSectionProps {
  onShowToast?: (msg: string) => void;
  className?: string;
  defaultExpanded?: boolean;
}

export const BarberPresetMessagesSection: React.FC<BarberPresetMessagesSectionProps> = ({
  onShowToast,
  className = '',
  defaultExpanded = true,
}) => {
  const { 
    barbers, 
    activeBarber, 
    studio, 
    addBarberPresetMessage, 
    deleteBarberPresetMessage, 
    updateBarberPresetMessages, 
    resetBarberPresetMessages 
  } = useAtelier();

  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
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

  // Form states
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newText, setNewText] = useState<string>('');

  // Edit states
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editText, setEditText] = useState<string>('');

  // Selected for preview
  const [selectedPreviewId, setSelectedPreviewId] = useState<string>(presetMessages[0]?.id || 'preset-reminder');
  const [showPhonePreview, setShowPhonePreview] = useState<boolean>(false);

  const activePreviewMessage = useMemo(() => {
    return presetMessages.find((p) => p.id === selectedPreviewId) || presetMessages[0];
  }, [presetMessages, selectedPreviewId]);

  const triggerToast = (msg: string) => {
    if (onShowToast) {
      onShowToast(msg);
    }
  };

  const placeholderTags = [
    { label: 'نام مشتری', tag: '{نام مشتری}' },
    { label: 'ساعت نوبت', tag: '{ساعت نوبت}' },
    { label: 'تاریخ نوبت', tag: '{تاریخ نوبت}' },
    { label: 'نام آرایشگر', tag: '{نام آرایشگر}' },
    { label: 'نام آرایشگاه', tag: '{نام آرایشگاه}' },
    { label: 'نام خدمت', tag: '{خدمت}' },
  ];

  const handleInsertTagToNew = (tag: string) => {
    hapticLight();
    setNewText((prev) => (prev ? `${prev} ${tag}` : tag));
  };

  const handleInsertTagToEdit = (tag: string) => {
    hapticLight();
    setEditText((prev) => (prev ? `${prev} ${tag}` : tag));
  };

  const handleCreatePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newText.trim()) {
      hapticWarning();
      triggerToast('لطفاً عنوان و متن پیام آماده را بنویسید.');
      return;
    }
    const res = addBarberPresetMessage(currentBarber.id, {
      title: newTitle.trim(),
      text: newText.trim(),
      isDefault: false,
    });
    if (res.success) {
      hapticSuccess();
      setNewTitle('');
      setNewText('');
      setIsAddingNew(false);
      triggerToast('پیام آماده جدید با موفقیت اضافه شد ✨');
    } else {
      hapticWarning();
      triggerToast(res.error || 'خطا در ثبت پیام آماده');
    }
  };

  const handleStartEdit = (preset: BarberPresetMessage) => {
    hapticLight();
    setEditingPresetId(preset.id);
    setEditTitle(preset.title);
    setEditText(preset.text);
  };

  const handleSaveEdit = (presetId: string) => {
    if (!editTitle.trim() || !editText.trim()) {
      hapticWarning();
      triggerToast('عنوان و متن پیام نمی‌تواند خالی باشد.');
      return;
    }
    const updated = presetMessages.map((p) =>
      p.id === presetId ? { ...p, title: editTitle.trim(), text: editText.trim() } : p
    );
    updateBarberPresetMessages(currentBarber.id, updated);
    setEditingPresetId(null);
    hapticSuccess();
    triggerToast('تغییرات پیام آماده با موفقیت ذخیره گردید.');
  };

  const handleDeletePreset = (presetId: string) => {
    hapticLight();
    const res = deleteBarberPresetMessage(currentBarber.id, presetId);
    if (res.success) {
      hapticSuccess();
      triggerToast('پیام آماده با موفقیت حذف شد.');
    }
  };

  const handleResetDefaults = () => {
    hapticLight();
    if (window.confirm('آیا مایلید تمام پیام‌های آماده به الگوهای پیش‌فرض بازگردند؟')) {
      resetBarberPresetMessages(currentBarber.id);
      hapticSuccess();
      triggerToast('قالب‌های پیام آماده به تنظیمات اولیه بازنشانی شدند.');
    }
  };

  const previewFormattedText = useMemo(() => {
    if (!activePreviewMessage) return '';
    return formatPresetMessage(activePreviewMessage.text, {
      customerName: 'سهراب سپهری',
      appointmentTime: '۱۶:۳۰',
      appointmentDate: 'امروز، ۲۶ شهریور',
      barberName: currentBarber?.name || 'علی رضایی',
      studioName: studio?.name || 'آرایشگاه رویال',
      serviceName: 'کوتاهی کلاسیک و استایل مو',
    });
  }, [activePreviewMessage, currentBarber, studio]);

  return (
    <div className={`p-3.5 sm:p-4 rounded-3xl clay-card bg-white/90 border border-white/80 shadow-xs space-y-3 text-right ${className}`} dir="rtl">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div 
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="w-8 h-8 rounded-xl bg-[#4e3b6e]/10 text-[#4e3b6e] flex items-center justify-center shadow-2xs shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                پیام‌های آماده و ارتباطات آرایشگر
              </h4>
              <span className="px-2 py-0.2 rounded-full bg-[#4e3b6e]/10 text-[#4e3b6e] text-[9px] font-bold font-mono">
                {toPersianDigits(presetMessages.length)} پیام
              </span>
            </div>
            <p className="text-[10px] text-stone-500 mt-0.5">
              تنظیم و ویرایش الگوهای پیامک (یادآوری، تاخیر، صندلی آماده)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
            title={isExpanded ? 'بستن بخش' : 'باز کردن بخش'}
            aria-label={isExpanded ? 'بستن بخش پیام‌های آماده' : 'باز کردن بخش پیام‌های آماده'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="space-y-3 pt-2 border-t border-stone-200/60 animate-in fade-in">
          {/* Barber Picker & Action Buttons */}
          <div className="flex items-center justify-between gap-2 flex-wrap bg-stone-50/80 p-2 rounded-2xl border border-stone-200/60">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-stone-600">آرایشگر:</span>
              <select
                value={selectedBarberId}
                onChange={(e) => setSelectedBarberId(e.target.value)}
                aria-label="انتخاب آرایشگر برای مدیریت پیام‌های آماده"
                className="px-2.5 py-1 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-800 cursor-pointer shadow-2xs"
              >
                {barbers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.title})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowPhonePreview((prev) => !prev)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                  showPhonePreview
                    ? 'bg-[#4e3b6e] text-white border-[#4e3b6e]'
                    : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
                title="نمایش شبیه‌ساز پیامک گوشی"
              >
                <Smartphone className="w-3 h-3" />
                <span>{showPhonePreview ? 'بستن پیش‌نمایش' : 'پیش‌نمایش گوشی'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-2 py-1 rounded-xl bg-white hover:bg-stone-100 text-stone-600 border border-stone-200 text-[10px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                title="بازنشانی به پیش‌فرض"
              >
                <RotateCcw className="w-3 h-3 text-stone-400" />
                <span>پیش‌فرض</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  hapticLight();
                  setIsAddingNew((prev) => !prev);
                }}
                className="px-3 py-1 rounded-xl bg-[#4e3b6e] hover:bg-[#3d2e57] active:scale-95 text-white text-[11px] font-bold shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{isAddingNew ? 'انصراف' : 'پیام جدید'}</span>
              </button>
            </div>
          </div>

          {/* New Preset Message Form */}
          {isAddingNew && (
            <form onSubmit={handleCreatePreset} className="p-3.5 bg-purple-50/70 rounded-2xl border border-purple-200/80 space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4e3b6e] flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  تعریف پیام آماده جدید برای {currentBarber.name}
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-[10px] text-stone-500 hover:text-stone-800"
                >
                  بستن
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-700 mb-1">
                  عنوان پیام:
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: یادآوری ۳ ساعت قبل، هماهنگی تاخیر..."
                  className="w-full p-2 text-xs bg-white border border-purple-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#4e3b6e]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold text-stone-700">
                    متن پیام (با امکان درج متغیر پویا):
                  </label>
                  <span className="text-[9px] text-stone-400">کلیک روی تگ برای درج در متن</span>
                </div>

                {/* Quick dynamic tags buttons */}
                <div className="flex items-center gap-1 flex-wrap mb-1.5">
                  {placeholderTags.map((pt) => (
                    <button
                      key={pt.tag}
                      type="button"
                      onClick={() => handleInsertTagToNew(pt.tag)}
                      className="px-1.5 py-0.5 rounded-md bg-white hover:bg-purple-100 text-[#4e3b6e] text-[9px] font-bold border border-purple-200 transition-colors cursor-pointer"
                    >
                      + {pt.label}
                    </button>
                  ))}
                </div>

                <textarea
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  rows={3}
                  placeholder="سلام {نام مشتری} عزیز، نوبت شما در {نام آرایشگاه} ساعت {ساعت نوبت} آماده است..."
                  className="w-full p-2.5 text-xs bg-white border border-purple-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#4e3b6e] leading-relaxed resize-none font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-600 text-xs font-medium cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-[#4e3b6e] hover:bg-[#3d2e57] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  ذخیره پیام
                </button>
              </div>
            </form>
          )}

          {/* Live Phone Mockup Preview Drawer (if toggled) */}
          {showPhonePreview && (
            <div className="bg-stone-900 rounded-2xl p-3 text-white shadow-md border border-stone-800 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-[#4e3b6e] text-[9px] flex items-center justify-center font-bold">
                    SMS
                  </div>
                  <span className="text-[11px] font-bold text-stone-200">
                    پیش‌نمایش پیامک: {activePreviewMessage?.title}
                  </span>
                </div>
                <span className="text-[9px] text-stone-400 font-mono">امروز، ۱۶:۳۰</span>
              </div>
              <div className="p-2.5 bg-[#0b84fe] text-white rounded-xl text-xs leading-relaxed font-sans shadow-xs">
                {previewFormattedText}
              </div>
              <p className="text-[9px] text-stone-400 text-left font-mono">
                ✓ Delivered · ارسال شبیه‌سازی‌شده
              </p>
            </div>
          )}

          {/* Preset Messages List */}
          <div className="space-y-2 max-h-[360px] overflow-y-auto custom-scrollbar p-0.5">
            {presetMessages.map((preset) => {
              const isSelected = selectedPreviewId === preset.id;
              const isEditing = editingPresetId === preset.id;

              return (
                <div
                  key={preset.id}
                  onClick={() => {
                    setSelectedPreviewId(preset.id);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#4e3b6e] shadow-xs ring-1 ring-[#4e3b6e]/20'
                      : 'bg-white/70 hover:bg-white border-stone-200/70 shadow-2xs'
                  }`}
                >
                  {isEditing ? (
                    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
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
                        className="w-full p-2 text-xs text-stone-900 border border-stone-200 rounded-xl leading-relaxed resize-none font-sans"
                      />

                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingPresetId(null)}
                          className="px-2.5 py-1 rounded-lg text-xs text-stone-600 bg-stone-100"
                        >
                          لغو
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(preset.id)}
                          className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>ذخیره</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#4e3b6e]" />
                          <h5 className="text-xs font-bold text-stone-900">{preset.title}</h5>
                          {preset.isDefault && (
                            <span className="px-1.5 py-0.2 rounded bg-stone-100 text-stone-500 text-[8px] font-mono">
                              پیش‌فرض
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(preset)}
                            className="p-1 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                            title="ویرایش پیام"
                            aria-label={`ویرایش پیام ${preset.title}`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePreset(preset.id)}
                            className="p-1 rounded-lg text-rose-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            title="حذف پیام"
                            aria-label={`حذف پیام ${preset.title}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-stone-600 leading-relaxed font-sans bg-stone-50/80 p-2 rounded-xl border border-stone-100/80">
                        {preset.text}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
