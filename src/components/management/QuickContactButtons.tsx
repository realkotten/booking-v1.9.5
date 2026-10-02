import React, { useState, useMemo } from 'react';
import { Phone, MessageSquare, Copy, Check, Send, X, Settings2, Plus } from 'lucide-react';
import { normalizePhoneNumber } from '../../utils/customerUtils';
import { toPersianDigits } from '../../utils/dateUtils';
import { useAtelier } from '../../store/AtelierContext';
import { DEFAULT_BARBER_PRESET_MESSAGES, formatPresetMessage } from '../../utils/presetMessages';

interface QuickContactButtonsProps {
  phone?: string;
  customerName?: string;
  appointmentTime?: string;
  appointmentDate?: string;
  serviceName?: string;
  size?: 'xs' | 'sm' | 'md' | 'full';
  showLabels?: boolean;
  className?: string;
  variant?: 'light' | 'dark' | 'glass';
}

export const QuickContactButtons: React.FC<QuickContactButtonsProps> = ({
  phone,
  customerName,
  appointmentTime,
  appointmentDate,
  serviceName,
  size = 'sm',
  showLabels = false,
  className = '',
  variant = 'light',
}) => {
  const { activeBarber, studio, setManagementTab } = useAtelier();
  const [copied, setCopied] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');

  if (!phone || phone.trim() === '' || phone === 'بدون شماره ثبت‌شده') {
    return null;
  }

  const cleanDigits = normalizePhoneNumber(phone);
  const formattedTel = cleanDigits.startsWith('0') ? cleanDigits : `0${cleanDigits}`;
  const displayPhone = toPersianDigits(phone);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(formattedTel);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDirectCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${formattedTel}`;
  };

  // Get barber's configured preset messages
  const barberPresets = useMemo(() => {
    if (activeBarber?.presetMessages && activeBarber.presetMessages.length > 0) {
      return activeBarber.presetMessages;
    }
    return DEFAULT_BARBER_PRESET_MESSAGES;
  }, [activeBarber]);

  // Formatted templates for this specific client & appointment
  const dynamicTemplates = useMemo(() => {
    return barberPresets.map((tpl) => ({
      id: tpl.id,
      title: tpl.title,
      text: formatPresetMessage(tpl.text, {
        customerName: customerName || 'عزیز',
        appointmentTime: appointmentTime ? toPersianDigits(appointmentTime) : '',
        appointmentDate: appointmentDate || 'امروز',
        barberName: activeBarber?.name || 'آرایشگر شما',
        studioName: studio?.name || 'آرایشگاه رویال',
        serviceName: serviceName || 'خدمات پیرایش',
      }),
    }));
  }, [barberPresets, customerName, appointmentTime, appointmentDate, activeBarber, studio, serviceName]);

  const handleOpenSms = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSmsModal(true);
    if (!customMessage && dynamicTemplates.length > 0) {
      setSelectedPresetId(dynamicTemplates[0].id);
      setCustomMessage(dynamicTemplates[0].text);
    }
  };

  const handleSelectTemplate = (templateId: string, text: string) => {
    setSelectedPresetId(templateId);
    setCustomMessage(text);
  };

  const handleSendSms = (textToSend: string) => {
    // Standard SMS URI scheme supported on iOS and Android
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const separator = isIOS ? '&' : '?';
    const smsUrl = `sms:${formattedTel}${separator}body=${encodeURIComponent(textToSend)}`;
    window.location.href = smsUrl;
    setShowSmsModal(false);
  };

  const handleGoToPresetSettings = () => {
    setShowSmsModal(false);
    setManagementTab('settings');
  };

  // Sizing and styling
  const sizeClasses = {
    xs: 'px-2 py-1 text-[9px] gap-1 rounded-lg',
    sm: 'px-2.5 py-1 text-[10px] gap-1.5 rounded-xl',
    md: 'px-3 py-1.5 text-xs gap-1.5 rounded-xl',
    full: 'flex-1 py-2 px-3 text-xs gap-2 rounded-xl justify-center',
  };

  const variantCallClasses = {
    light: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80',
    dark: 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60',
    glass: 'bg-white/80 hover:bg-white text-emerald-800 border border-emerald-300/60 backdrop-blur-sm',
  };

  const variantSmsClasses = {
    light: 'bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200/80',
    dark: 'bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-700/60',
    glass: 'bg-white/80 hover:bg-white text-sky-800 border border-sky-300/60 backdrop-blur-sm',
  };

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    full: 'w-3.5 h-3.5',
  };

  return (
    <>
      <div className={`flex items-center gap-1.5 shrink-0 ${className}`} onClick={(e) => e.stopPropagation()}>
        {/* Direct Call Button */}
        <button
          type="button"
          onClick={handleDirectCall}
          className={`flex items-center font-bold shadow-2xs transition-all active:scale-95 cursor-pointer ${sizeClasses[size]} ${variantCallClasses[variant]}`}
          title={`تماس تلفنی با ${customerName || phone} (${displayPhone})`}
        >
          <Phone className={`${iconSizes[size]} text-emerald-600 fill-emerald-600/20`} />
          {showLabels && <span>تماس</span>}
        </button>

        {/* SMS Button */}
        <button
          type="button"
          onClick={handleOpenSms}
          className={`flex items-center font-bold shadow-2xs transition-all active:scale-95 cursor-pointer ${sizeClasses[size]} ${variantSmsClasses[variant]}`}
          title={`ارسال پیامک به ${customerName || phone}`}
        >
          <MessageSquare className={`${iconSizes[size]} text-sky-600 fill-sky-600/20`} />
          {showLabels && <span>پیامک</span>}
        </button>

        {/* Quick Copy Phone Button */}
        {showLabels && (
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
            title="کپی شماره تماس"
          >
            {copied ? (
              <>
                <Check className="w-2.5 h-2.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">کپی شد</span>
              </>
            ) : (
              <>
                <Copy className="w-2.5 h-2.5 text-stone-500" />
                <span>کپی</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Quick SMS Dialog */}
      {showSmsModal && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 bg-black/50 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowSmsModal(false)}
          dir="rtl"
        >
          <div
            className="relative w-full max-w-[360px] bg-white rounded-[26px] p-4 shadow-2xl border border-stone-200 space-y-3.5 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">
                    ارسال پیامک به {customerName || 'مشتری'}
                  </h4>
                  <p className="text-[10px] text-stone-500 font-mono" dir="ltr">
                    {formattedTel}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSmsModal(false)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Template Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-bold text-stone-700">
                  پیام‌های آماده آرایشگر:
                </label>
                <button
                  type="button"
                  onClick={handleGoToPresetSettings}
                  className="text-[9px] text-[#4e3b6e] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  title="مدیریت و ویرایش پیام‌های آماده در تنظیمات"
                >
                  <Settings2 className="w-2.5 h-2.5" />
                  <span>شخصی‌سازی پیام‌ها</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5 max-h-[120px] overflow-y-auto custom-scrollbar p-0.5">
                {dynamicTemplates.map((tpl) => {
                  const isSelected = selectedPresetId === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleSelectTemplate(tpl.id, tpl.text)}
                      className={`p-2 text-right rounded-xl border text-[10px] font-bold transition-all cursor-pointer truncate ${
                        isSelected
                          ? 'bg-sky-50 text-sky-900 border-sky-300 ring-1 ring-sky-200 shadow-2xs'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                      title={tpl.text}
                    >
                      {tpl.title}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Message Input */}
            <div>
              <label className="block text-[10px] font-bold text-stone-700 mb-1">
                متن نهایی پیامک:
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={4}
                placeholder="متن پیامک را اینجا بنویسید..."
                className="w-full p-2.5 text-xs text-stone-900 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-sky-500 transition-all font-sans leading-relaxed resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleSendSms(customMessage)}
                disabled={!customMessage.trim()}
                className="flex-1 py-2.5 px-3 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>باز کردن در پیامک‌رسان</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSmsModal(false)}
                className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-xl transition-colors cursor-pointer"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
