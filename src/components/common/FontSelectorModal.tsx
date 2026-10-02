import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, Type, Check, Sparkles } from 'lucide-react';
import { AVAILABLE_FONTS, FontOption, getSelectedFontId, applyFont } from '../../utils/fontManager';
import { hapticSelection, hapticLight } from '../../utils/hapticUtils';

interface FontSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FontSelectorModal: React.FC<FontSelectorModalProps> = ({ isOpen, onClose }) => {
  const [selectedId, setSelectedId] = useState<string>(() => getSelectedFontId());

  useEffect(() => {
    if (isOpen) {
      setSelectedId(getSelectedFontId());
    }
  }, [isOpen]);

  const handleSelectFont = (font: FontOption) => {
    hapticSelection();
    setSelectedId(font.id);
    applyFont(font.id);
  };

  const handleClose = () => {
    hapticLight();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-950/60 p-0 sm:p-4 backdrop-blur-md"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
            className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-t-[32px] sm:rounded-[32px] bg-white/95 backdrop-blur-2xl border border-white/60 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 pt-5 pb-4 border-b border-stone-100 flex items-center justify-between shrink-0 bg-stone-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#5a4a58] to-[#3d4452] flex items-center justify-center text-white shadow-md shadow-[#5a4a58]/20">
                  <Type className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-stone-900">تایپوگرافی و فونت برنامه</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e4ddf6] text-[#5a4a58]">
                      سفارشی‌سازی
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    فونت دلخواه خود را برای نمایش بهینه متون انتخاب فرمایید
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="بستن"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Font Options List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 overscroll-contain">
              {AVAILABLE_FONTS.map((font) => {
                const isSelected = selectedId === font.id;
                const isDefault = font.id === 'vazirmatn';
                return (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => handleSelectFont(font)}
                    className={`w-full text-right p-4 rounded-2xl border transition-all text-stone-800 relative cursor-pointer group ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#faf7fc] to-[#f4eef9] border-[#5a4a58] shadow-md ring-1 ring-[#5a4a58]/30'
                        : isDefault
                        ? 'bg-white hover:bg-emerald-50/30 border-emerald-300/80 shadow-2xs'
                        : 'bg-white hover:bg-stone-50/80 border-stone-200/80 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-stone-900 group-hover:text-stone-950">
                          {font.nameFa}
                        </span>
                        {isDefault && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            پیش‌فرض
                          </span>
                        )}
                        <span className="text-[10px] text-stone-400 font-sans" dir="ltr">
                          {font.nameEn}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {font.badge && (
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-[#5a4a58] text-white'
                                : isDefault
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-stone-100 text-stone-600 group-hover:bg-stone-200'
                            }`}
                          >
                            {font.badge}
                          </span>
                        )}
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-[#5a4a58] text-white'
                              : 'border border-stone-300 group-hover:border-stone-400'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>

                    {/* Live Preview Sample */}
                    <div
                      style={{ fontFamily: font.fontFamily }}
                      className={`text-sm sm:text-base my-2 p-2.5 rounded-xl transition-colors ${
                        isSelected
                          ? 'bg-white/80 text-stone-900 font-medium'
                          : 'bg-stone-50/60 text-stone-700'
                      }`}
                    >
                      {font.sampleFa}
                    </div>

                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      {font.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/70 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-stone-500">
                <Sparkles className="w-3.5 h-3.5 text-[#5a4a58]" />
                <span>تنظیمات بلافاصله اعمال و ذخیره می‌شوند</span>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 active:scale-95 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                تأیید و بازگشت
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
