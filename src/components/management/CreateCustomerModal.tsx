import React, { useState, useRef } from 'react';
import { 
  X, 
  UserPlus, 
  User, 
  Phone, 
  Crown, 
  Coffee, 
  Music, 
  Scissors, 
  FileText,
  AlertCircle,
  Check,
  Upload,
  Camera,
  Loader2
} from 'lucide-react';
import { useAtelier } from '../../store/AtelierContext';
import { 
  HAIR_TYPES, 
  HAIR_DENSITIES, 
  FACE_SHAPES, 
  FAVORITE_FADES, 
  BEVERAGE_PREFERENCES, 
  AUDIO_PREFERENCES,
  validateFullName
} from '../../utils/customerUtils';
import { ClientProfile } from '../../types';
import { 
  CHROME_AVATARS, 
  DEFAULT_CLIENT_AVATAR 
} from '../../data/avatars';

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated?: (customer: ClientProfile) => void;
}

export const CreateCustomerModal: React.FC<CreateCustomerModalProps> = ({
  isOpen,
  onClose,
  onCustomerCreated,
}) => {
  const { createCustomer } = useAtelier();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isVip, setIsVip] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(DEFAULT_CLIENT_AVATAR);
  const [hairType, setHairType] = useState('Straight');
  const [density, setDensity] = useState('Medium');
  const [faceShape, setFaceShape] = useState('Oval');
  const [favoriteFade, setFavoriteFade] = useState('Mid Fade');
  const [beveragePreference, setBeveragePreference] = useState('Double Espresso');
  const [audioPreference, setAudioPreference] = useState('Jazz');
  const [initialNotes, setInitialNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const nameValidation = validateFullName(name);
    if (!nameValidation.isValid) {
      setErrorMsg(nameValidation.error || 'لطفاً نام و نام خانوادگی کامل مشتری را با فاصله وارد کنید.');
      return;
    }

    if (!phone.trim() || phone.trim().length < 5) {
      setErrorMsg('لطفاً شماره تماس معتبر وارد کنید.');
      return;
    }

    const result = createCustomer({
      name: name.trim(),
      phone: phone.trim(),
      avatarUrl: selectedAvatar,
      isVip,
      notes: initialNotes.trim(),
      hairProfile: {
        hairType,
        density,
        favoriteFade,
        texture: 'معمولی',
        growthPattern: 'طبیعی',
        skinSensitivity: 'نرمال',
      },
      faceProfile: {
        shape: faceShape,
        beardGrowth: 'معمولی',
        targetStyle: 'کوپ مدرن',
      },
      hospitality: {
        beveragePreference,
        audioPreference,
        waterTemperature: 'sparkling',
        ambientMusicVolume: 'ambient',
        conversationLevel: 'customary',
        scentPreference: 'چوب صندل',
      },
      technicalNotes: {
        clipperGuard: 'گارد ۲',
        fadeTechnique: 'فید متناسب با استایل',
        necklinePreference: 'طبیعی محوشده',
        sideburnPreference: 'معمولی',
        stylingPreference: 'کلِی مات ابریشمی',
        generalTechnicalNotes: initialNotes.trim() || 'پرونده جدید مشتری سالن',
      },
    });

    if (!result.success) {
      setErrorMsg(result.error || 'خطا در ثبت مشتری.');
      return;
    }

    if (result.customer && onCustomerCreated) {
      onCustomerCreated(result.customer);
    }
    onClose();
  };

  return (
    <div
      id="create-customer-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-sm animate-in fade-in"
      dir="rtl"
    >
      <div
        id="create-customer-modal-container"
        className="relative w-full max-w-[346px] bg-white/95 backdrop-blur-2xl border border-white/80 rounded-[32px] p-4 shadow-2xl space-y-3 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto no-scrollbar"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white via-[#fbdcd9] to-[#d88d85] shadow-glow-pink flex items-center justify-center border border-white/60">
              <UserPlus className="w-4 h-4 text-stone-900" />
            </div>
            <div>
              <h3 className="text-xs font-serif font-bold text-stone-900">
                افتتاح پرونده مشتری جدید
              </h3>
              <p className="text-[9px] text-stone-500 font-mono">
                ثبت در بایگانی سوئیت اختصاصی
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-create-customer"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-800 text-[10px]">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Identity Fields */}
          <div className="space-y-2">
            <div>
              <label className="block text-[10px] font-bold text-stone-700 mb-1">
                نام و نام خانوادگی <span className="text-[#b2665e]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="input-new-customer-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مانند: آرتین تهرانی"
                  required
                  className="w-full bg-white/80 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-stone-400 pl-8"
                />
                <User className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-700 mb-1">
                شماره تماس <span className="text-[#b2665e]">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  id="input-new-customer-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (212) 555-0199"
                  required
                  dir="ltr"
                  className="w-full bg-white/80 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-stone-400 pl-8 font-mono text-left"
                />
                <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Avatar Selection */}
            <div>
              <label className="block text-[10px] font-bold text-stone-700 mb-1.5">
                انتخاب آواتار اختصاصی (Avatars)
              </label>

              <div className="grid grid-cols-4 gap-2 bg-stone-50/80 p-2 rounded-2xl border border-stone-200/60 max-h-48 overflow-y-auto">
                {CHROME_AVATARS.map((av) => {
                  const isSelected = selectedAvatar === av.url;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setSelectedAvatar(av.url)}
                      className={`flex flex-col items-center p-1.5 rounded-xl transition-all relative ${
                        isSelected
                          ? 'bg-[#ea5848]/15 ring-2 ring-[#ea5848] shadow-2xs'
                          : 'hover:bg-white'
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={av.url}
                          alt={av.name}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className={`w-10 h-10 rounded-xl object-cover border ${
                            isSelected ? 'border-[#ea5848]' : 'border-transparent'
                          }`}
                        />
                        <span className="absolute -top-1 -left-1 text-[8px] bg-white rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-xs border border-stone-200">
                          {av.symbol}
                        </span>
                      </div>
                      <span className="text-[8px] font-bold text-stone-800 mt-1 truncate max-w-[60px] text-center">
                        {av.englishName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Architecture Details Accordion/Section */}
          <div className="p-3 rounded-2xl bg-white/80 border border-stone-200/60 space-y-2.5">
            <span className="text-[10px] font-bold text-stone-800 block">
              ویژگی‌های پایه مو و چهره
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] text-stone-500 mb-0.5">نوع مو</label>
                <select
                  value={hairType}
                  onChange={(e) => setHairType(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-1.5 text-[10px] text-stone-800 focus:outline-hidden"
                >
                  {HAIR_TYPES.map((h) => (
                    <option key={h.value} value={h.value}>
                      {h.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] text-stone-500 mb-0.5">تراکم مو</label>
                <select
                  value={density}
                  onChange={(e) => setDensity(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-1.5 text-[10px] text-stone-800 focus:outline-hidden"
                >
                  {HAIR_DENSITIES.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] text-stone-500 mb-0.5">فرم هندسی چهره</label>
                <select
                  value={faceShape}
                  onChange={(e) => setFaceShape(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-1.5 text-[10px] text-stone-800 focus:outline-hidden"
                >
                  {FACE_SHAPES.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] text-stone-500 mb-0.5">فید مورد علاقه</label>
                <select
                  value={favoriteFade}
                  onChange={(e) => setFavoriteFade(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-1.5 text-[10px] text-stone-800 focus:outline-hidden"
                >
                  {FAVORITE_FADES.map((fade) => (
                    <option key={fade.value} value={fade.value}>
                      {fade.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Hospitality Preferences */}
          <div className="p-3 rounded-2xl bg-white/80 border border-stone-200/60 space-y-2">
            <span className="text-[10px] font-bold text-stone-800 block">
              ترجیحات پذیرایی و فضا
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] text-stone-500 mb-0.5">نوشیدنی خوش‌آمد</label>
                <select
                  value={beveragePreference}
                  onChange={(e) => setBeveragePreference(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-1.5 text-[10px] text-stone-800 focus:outline-hidden"
                >
                  {BEVERAGE_PREFERENCES.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] text-stone-500 mb-0.5">موسیقی سوئیت</label>
                <select
                  value={audioPreference}
                  onChange={(e) => setAudioPreference(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-1.5 text-[10px] text-stone-800 focus:outline-hidden"
                >
                  {AUDIO_PREFERENCES.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Initial Notes */}
          <div>
            <label className="block text-[10px] font-bold text-stone-700 mb-1">
              یادداشت‌های اختصاصی و فرمول اولیه
            </label>
            <textarea
              id="textarea-initial-notes"
              value={initialNotes}
              onChange={(e) => setInitialNotes(e.target.value)}
              rows={2}
              placeholder="نکات خاص حساسیت، عادات پیرایش، جزئیات خط گردن..."
              className="w-full bg-white/80 border border-stone-200 rounded-xl p-2.5 text-[10px] text-stone-900 focus:outline-hidden focus:border-stone-400 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-1">
            <button
              type="submit"
              id="btn-submit-create-customer"
              className="w-full py-2.5 rounded-xl bg-[#ea5848] hover:bg-[#d64434] text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-[#ffebe6]" />
              <span>ثبت و گشایش پرونده در آتلیه</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
