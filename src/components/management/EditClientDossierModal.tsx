import React, { useState, useRef } from 'react';
import { 
  X, 
  Save, 
  User, 
  Phone, 
  Crown, 
  Scissors, 
  Coffee, 
  Music, 
  FileText, 
  Sparkles,
  AlertCircle,
  Package,
  CalendarClock,
  Clock,
  Calendar,
  Upload,
  Camera,
  Loader2
} from 'lucide-react';
import { ClientProfile } from '../../types';
import { useAtelier } from '../../store/AtelierContext';
import { 
  HAIR_TYPES, 
  HAIR_DENSITIES, 
  FACE_SHAPES, 
  FAVORITE_FADES, 
  BEVERAGE_PREFERENCES, 
  AUDIO_PREFERENCES 
} from '../../utils/customerUtils';
import { toPersianDigits } from '../../utils/dateUtils';
import { formatPrice } from '../../utils/formatUtils';
import { CHROME_AVATARS } from '../../data/avatars';

interface EditClientDossierModalProps {
  customer: ClientProfile | null;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'identity' | 'routine' | 'architecture' | 'hospitality' | 'technical';
}

export const EditClientDossierModal: React.FC<EditClientDossierModalProps> = ({
  customer,
  isOpen,
  onClose,
  initialTab = 'identity',
}) => {
  const { updateCustomer } = useAtelier();

  if (!isOpen || !customer) return null;

  const [activeTab, setActiveTab] = useState<'identity' | 'routine' | 'architecture' | 'hospitality' | 'technical'>(initialTab);

  // Form State
  const [name, setName] = useState(customer.name || '');
  const [phone, setPhone] = useState(customer.phone || '');
  const [isVip, setIsVip] = useState(!!customer.isVip);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(customer.avatarUrl || '');

  // Suggested Routine by Barber
  const [routineDays, setRoutineDays] = useState<number>(customer.routineDays || 21);
  const [routineCadence, setRoutineCadence] = useState<string>(customer.routineCadence || customer.cadence || 'هر ۳ هفته (۲۱ روز)');
  const [routineServiceTitle, setRoutineServiceTitle] = useState<string>(customer.routineServiceTitle || 'اصلاح مو و پیرایش کلاسیک');
  const [routineBarberNote, setRoutineBarberNote] = useState<string>(customer.routineBarberNote || '');
  const [nextRoutineDayNumber, setNextRoutineDayNumber] = useState<number>(customer.nextRoutineDayNumber || 25);
  const [nextRoutineTargetDate, setNextRoutineTargetDate] = useState<string>(customer.nextRoutineTargetDate || '۲۵ مهر');
  const [nextRoutineTargetTime, setNextRoutineTargetTime] = useState<string>(customer.nextRoutineTargetTime || '۱۷:۰۰');

  // Hair Profile
  const [hairType, setHairType] = useState(customer.hairProfile?.hairType || 'Straight');
  const [density, setDensity] = useState(customer.hairProfile?.density || 'Medium');
  const [texture, setTexture] = useState(customer.hairProfile?.texture || '');
  const [growthPattern, setGrowthPattern] = useState(customer.hairProfile?.growthPattern || '');
  const [favoriteFade, setFavoriteFade] = useState(customer.hairProfile?.favoriteFade || 'Low Fade');
  const [skinSensitivity, setSkinSensitivity] = useState(customer.hairProfile?.skinSensitivity || '');

  // Face Profile
  const [faceShape, setFaceShape] = useState(customer.faceProfile?.shape || 'Oval');
  const [beardGrowth, setBeardGrowth] = useState(customer.faceProfile?.beardGrowth || '');
  const [targetStyle, setTargetStyle] = useState(customer.faceProfile?.targetStyle || '');

  // Hospitality Profile
  const [beveragePreference, setBeveragePreference] = useState(customer.hospitality?.beveragePreference || 'Double Espresso');
  const [audioPreference, setAudioPreference] = useState(customer.hospitality?.audioPreference || 'Jazz');
  const [scentPreference, setScentPreference] = useState(customer.hospitality?.scentPreference || '');
  const [waterTemperature, setWaterTemperature] = useState(customer.hospitality?.waterTemperature || 'sparkling');
  const [conversationLevel, setConversationLevel] = useState(customer.hospitality?.conversationLevel || 'customary');

  // Technical Grooming Notes
  const [clipperGuard, setClipperGuard] = useState(customer.technicalNotes?.clipperGuard || '');
  const [fadeTechnique, setFadeTechnique] = useState(customer.technicalNotes?.fadeTechnique || '');
  const [fadeAngles, setFadeAngles] = useState(customer.technicalNotes?.fadeAngles || '');
  const [necklinePreference, setNecklinePreference] = useState(customer.technicalNotes?.necklinePreference || '');
  const [sideburnPreference, setSideburnPreference] = useState(customer.technicalNotes?.sideburnPreference || '');
  const [beardLength, setBeardLength] = useState(customer.technicalNotes?.beardLength || '');
  const [beardShaping, setBeardShaping] = useState(customer.technicalNotes?.beardShaping || '');
  const [scissorPreference, setScissorPreference] = useState(customer.technicalNotes?.scissorPreference || '');
  const [stylingPreference, setStylingPreference] = useState(customer.technicalNotes?.stylingPreference || '');
  const [productsCommonlyUsed, setProductsCommonlyUsed] = useState(customer.technicalNotes?.productsCommonlyUsed || '');
  const [generalTechnicalNotes, setGeneralTechnicalNotes] = useState(customer.technicalNotes?.generalTechnicalNotes || '');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectRoutinePreset = (days: number, title: string) => {
    setRoutineDays(days);
    setRoutineCadence(title);
    // Auto-calculate target date simulation (current baseline is day 22)
    const targetDay = 22 + Math.min(days, 14);
    setNextRoutineDayNumber(targetDay);
    setNextRoutineTargetDate(`${toPersianDigits(targetDay)} مهر`);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('نام مشتری نمی‌تواند خالی باشد.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('شماره تماس مشتری الزامی است.');
      return;
    }

    updateCustomer(customer.id, {
      name: name.trim(),
      phone: phone.trim(),
      isVip,
      avatarUrl: selectedAvatar,
      cadence: routineCadence,
      routineDays,
      routineCadence,
      routineServiceTitle: routineServiceTitle.trim(),
      routineBarberNote: routineBarberNote.trim(),
      nextRoutineDayNumber,
      nextRoutineTargetDate,
      nextRoutineTargetTime,
      hairProfile: {
        hairType,
        density,
        texture: texture.trim(),
        growthPattern: growthPattern.trim(),
        favoriteFade,
        skinSensitivity: skinSensitivity.trim(),
      },
      faceProfile: {
        shape: faceShape,
        beardGrowth: beardGrowth.trim(),
        targetStyle: targetStyle.trim(),
      },
      hospitality: {
        beveragePreference,
        audioPreference,
        scentPreference: scentPreference.trim(),
        waterTemperature: waterTemperature as any,
        conversationLevel: conversationLevel as any,
      },
      technicalNotes: {
        clipperGuard: clipperGuard.trim(),
        fadeTechnique: fadeTechnique.trim(),
        fadeAngles: fadeAngles.trim(),
        necklinePreference: necklinePreference.trim(),
        sideburnPreference: sideburnPreference.trim(),
        beardLength: beardLength.trim(),
        beardShaping: beardShaping.trim(),
        scissorPreference: scissorPreference.trim(),
        stylingPreference: stylingPreference.trim(),
        productsCommonlyUsed: productsCommonlyUsed.trim(),
        generalTechnicalNotes: generalTechnicalNotes.trim(),
      },
    });

    onClose();
  };

  return (
    <div
      id="edit-client-dossier-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-sm animate-in fade-in"
      dir="rtl"
    >
      <div
        id="edit-client-dossier-container"
        className="relative w-full max-w-[346px] bg-white/95 backdrop-blur-2xl border border-white/80 rounded-[32px] p-4 shadow-2xl space-y-3 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto no-scrollbar"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white via-[#fbdcd9] to-[#d88d85] shadow-glow-pink flex items-center justify-center border border-white/60">
              <FileText className="w-4 h-4 text-stone-900" />
            </div>
            <div>
              <h3 className="text-xs font-serif font-bold text-stone-900">
                ویرایش پرونده مشتری
              </h3>
              <p className="text-[9px] text-stone-500 font-mono">
                {customer.name} · {customer.memberId}
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-edit-dossier"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-2 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-800 text-[9px]">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Section Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-stone-100/90 overflow-x-auto no-scrollbar text-[9px] font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('identity')}
            className={`px-2 py-1 rounded-lg transition-all shrink-0 ${
              activeTab === 'identity'
                ? 'bg-white text-stone-900 shadow-2xs font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            مشخصات
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('routine')}
            className={`px-2 py-1 rounded-lg transition-all shrink-0 flex items-center gap-1 ${
              activeTab === 'routine'
                ? 'bg-[#ea5848] text-white shadow-2xs font-bold'
                : 'text-[#ea5848] bg-[#ea5848]/10 hover:bg-[#ea5848]/20 font-bold'
            }`}
          >
            <CalendarClock className="w-3 h-3" />
            <span>روتین پیشنهادی</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('architecture')}
            className={`px-2 py-1 rounded-lg transition-all shrink-0 ${
              activeTab === 'architecture'
                ? 'bg-white text-stone-900 shadow-2xs font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            معماری مو
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hospitality')}
            className={`px-2 py-1 rounded-lg transition-all shrink-0 ${
              activeTab === 'hospitality'
                ? 'bg-white text-stone-900 shadow-2xs font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            پذیرایی
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('technical')}
            className={`px-2 py-1 rounded-lg transition-all shrink-0 ${
              activeTab === 'technical'
                ? 'bg-white text-stone-900 shadow-2xs font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            نکات فنی
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          {/* Tab 1: Identity */}
          {activeTab === 'identity' && (
            <div className="space-y-2.5 animate-in fade-in duration-150">
              <div>
                <label className="block text-[10px] font-bold text-stone-700 mb-1">
                  نام و نام خانوادگی
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/80 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-stone-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-700 mb-1">
                  شماره تماس
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  dir="ltr"
                  className="w-full bg-white/80 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-stone-400 font-mono text-left"
                  required
                />
              </div>

              {/* Avatar Picker */}
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
          )}

          {/* Tab: Barber Suggested Routine */}
          {activeTab === 'routine' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="p-2.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-[#ea5848] font-bold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>تنظیم روتین و تایمر هوشمند مشتری</span>
                </div>
                <p className="text-[10px] text-stone-600 leading-relaxed">
                  این روتین، در صفحه اصلی مشتری به صورت روزشمار اختصاصی نمایش داده می‌شود تا قبل از به هم ریختن استایل، نوبت خود را تمدید کند.
                </p>
              </div>

              {/* Cadence Presets */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-stone-700">
                  دوره تکرار پیشنهادی آرایشگر
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { days: 10, title: 'هر ۱۰ روز (فید کوتاه)' },
                    { days: 14, title: 'هر ۲ هفته (۱۴ روز)' },
                    { days: 21, title: 'هر ۳ هفته (۲۱ روز)' },
                    { days: 28, title: 'هر ۴ هفته (۲۸ روز)' },
                  ].map((preset) => (
                    <button
                      key={preset.days}
                      type="button"
                      onClick={() => handleSelectRoutinePreset(preset.days, preset.title)}
                      className={`p-2 rounded-xl text-[10px] font-bold border transition-all text-right ${
                        routineDays === preset.days
                          ? 'bg-[#ea5848] text-white border-[#ea5848] shadow-xs'
                          : 'bg-white/90 text-stone-700 border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Cadence & Target Title */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-stone-600 mb-0.5">تعداد روز دوره (فاصله اصلاح)</label>
                  <input
                    type="number"
                    min="3"
                    max="90"
                    value={routineDays}
                    onChange={(e) => {
                      const d = Number(e.target.value) || 14;
                      setRoutineDays(d);
                      setRoutineCadence(`هر ${d} روز`);
                      const targetDay = 22 + Math.min(d, 14);
                      setNextRoutineDayNumber(targetDay);
                      setNextRoutineTargetDate(`${toPersianDigits(targetDay)} مهر`);
                    }}
                    className="w-full bg-white/80 border border-stone-200 rounded-xl p-2 text-xs text-stone-900 font-bold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-stone-600 mb-0.5">ساعت بهینه موعد</label>
                  <input
                    type="text"
                    value={nextRoutineTargetTime}
                    onChange={(e) => setNextRoutineTargetTime(e.target.value)}
                    placeholder="۱۷:۰۰"
                    className="w-full bg-white/80 border border-stone-200 rounded-xl p-2 text-xs text-stone-900 font-mono text-center focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-stone-600 mb-0.5">عنوان خدمت پیشنهادی روتین</label>
                <input
                  type="text"
                  value={routineServiceTitle}
                  onChange={(e) => setRoutineServiceTitle(e.target.value)}
                  placeholder="اصلاح مو، سایه فید و خط ریش..."
                  className="w-full bg-white/80 border border-stone-200 rounded-xl p-2 text-xs text-stone-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-stone-600 mb-0.5">توصیه و یادداشت اختصاصی آرایشگر برای مشتری</label>
                <textarea
                  rows={2}
                  value={routineBarberNote}
                  onChange={(e) => setRoutineBarberNote(e.target.value)}
                  placeholder="پیشنهاد آرایشگر: تجدید فید بغل گوش‌ها قبل از پر شدن دور گوش..."
                  className="w-full bg-white/80 border border-stone-200 rounded-xl p-2 text-[10px] text-stone-900 focus:outline-hidden resize-none"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Hair & Face Architecture */}
          {activeTab === 'architecture' && (
            <div className="space-y-2.5 animate-in fade-in duration-150">
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
                  <label className="block text-[9px] text-stone-500 mb-0.5">فرم چهره</label>
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

              <div>
                <label className="block text-[9px] text-stone-600 mb-0.5">جهت رشد و خواب مو (تاج سر / انحرافات)</label>
                <textarea
                  rows={2}
                  value={growthPattern}
                  onChange={(e) => setGrowthPattern(e.target.value)}
                  placeholder="چرخش ساعت‌گرد، انحراف در شقیقه راست..."
                  className="w-full bg-white/80 border border-stone-200 rounded-xl p-2 text-[10px] text-stone-900 focus:outline-hidden resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] text-stone-600 mb-0.5">حساسیت پوست</label>
                  <input
                    type="text"
                    value={skinSensitivity}
                    onChange={(e) => setSkinSensitivity(e.target.value)}
                    placeholder="پوست گردن حساس..."
                    className="w-full bg-white/80 border border-stone-200 rounded-lg p-1.5 text-[10px] text-stone-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-stone-600 mb-0.5">استایل هدف</label>
                  <input
                    type="text"
                    value={targetStyle}
                    onChange={(e) => setTargetStyle(e.target.value)}
                    placeholder="کوپ کلاسیک مدیریتی..."
                    className="w-full bg-white/80 border border-stone-200 rounded-lg p-1.5 text-[10px] text-stone-900 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Hospitality Profile */}
          {activeTab === 'hospitality' && (
            <div className="space-y-2.5 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] text-stone-500 mb-0.5">نوشیدنی اختصاصی</label>
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
                  <label className="block text-[9px] text-stone-500 mb-0.5">موسیقی ترجیحی</label>
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

              <div>
                <label className="block text-[9px] text-stone-600 mb-0.5">رایحه اختصاصی سوئیت</label>
                <input
                  type="text"
                  value={scentPreference}
                  onChange={(e) => setScentPreference(e.target.value)}
                  placeholder="چوب صندل، اسطوخودوس، ترنج..."
                  className="w-full bg-white/80 border border-stone-200 rounded-lg p-1.5 text-[10px] text-stone-900 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] text-stone-500 mb-0.5">دمای آب سرو</label>
                  <select
                    value={waterTemperature}
                    onChange={(e) => setWaterTemperature(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-1.5 text-[10px] text-stone-800 focus:outline-hidden"
                  >
                    <option value="sparkling">گازدار با لیمو (Sparkling)</option>
                    <option value="cold">خنک یخچالی (Cold)</option>
                    <option value="room">دمای اتاق (Room)</option>
                    <option value="still">آب چشمه طبیعی (Still)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] text-stone-500 mb-0.5">سطح مکالمه</label>
                  <select
                    value={conversationLevel}
                    onChange={(e) => setConversationLevel(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-1.5 text-[10px] text-stone-800 focus:outline-hidden"
                  >
                    <option value="minimal">حداقلی و آرامش‌بخش (Minimal)</option>
                    <option value="customary">معمول و حرفه‌ای (Customary)</option>
                    <option value="engaging">گفت‌وگوی گرم و پویا (Engaging)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Technical Grooming Notes */}
          {activeTab === 'technical' && (
            <div className="space-y-2.5 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] text-stone-600 mb-0.5">گارد ماشین (Clipper)</label>
                  <input
                    type="text"
                    value={clipperGuard}
                    onChange={(e) => setClipperGuard(e.target.value)}
                    placeholder="شانه ۱.۵ روی شقیقه‌ها..."
                    className="w-full bg-white/80 border border-stone-200 rounded-lg p-1.5 text-[10px] text-stone-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-stone-600 mb-0.5">تکنیک فید (Fade)</label>
                  <input
                    type="text"
                    value={fadeTechnique}
                    onChange={(e) => setFadeTechnique(e.target.value)}
                    placeholder="فید مخملی نرم..."
                    className="w-full bg-white/80 border border-stone-200 rounded-lg p-1.5 text-[10px] text-stone-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] text-stone-600 mb-0.5">خط گردن (Neckline)</label>
                  <input
                    type="text"
                    value={necklinePreference}
                    onChange={(e) => setNecklinePreference(e.target.value)}
                    placeholder="طبیعی محوشده (Taper)..."
                    className="w-full bg-white/80 border border-stone-200 rounded-lg p-1.5 text-[10px] text-stone-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-stone-600 mb-0.5">خط ریش و آنکارد</label>
                  <input
                    type="text"
                    value={beardShaping}
                    onChange={(e) => setBeardShaping(e.target.value)}
                    placeholder="آنکارد زاویه‌دار با تیغ ژاپنی..."
                    className="w-full bg-white/80 border border-stone-200 rounded-lg p-1.5 text-[10px] text-stone-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] text-stone-600 mb-0.5">قیچی ترجیحی</label>
                  <input
                    type="text"
                    value={scissorPreference}
                    onChange={(e) => setScissorPreference(e.target.value)}
                    placeholder="قیچی ۶ اینچی سکی..."
                    className="w-full bg-white/80 border border-stone-200 rounded-lg p-1.5 text-[10px] text-stone-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-stone-600 mb-0.5">حالت‌دهی و فینیش</label>
                  <input
                    type="text"
                    value={stylingPreference}
                    onChange={(e) => setStylingPreference(e.target.value)}
                    placeholder="فینیش مات با کلِی..."
                    className="w-full bg-white/80 border border-stone-200 rounded-lg p-1.5 text-[10px] text-stone-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] text-stone-600 mb-0.5">ملاحظات و یادداشت‌های کلی فنی</label>
                <textarea
                  rows={2}
                  value={generalTechnicalNotes}
                  onChange={(e) => setGeneralTechnicalNotes(e.target.value)}
                  placeholder="نکات مهم و حیاتی استاد هنگام پیرایش..."
                  className="w-full bg-white/80 border border-stone-200 rounded-xl p-2 text-[10px] text-stone-900 focus:outline-hidden resize-none"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="submit"
              id="btn-save-dossier"
              className="flex-1 py-2.5 rounded-xl bg-[#ea5848] hover:bg-[#d64434] text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-[#ffebe6]" />
              <span>ذخیره تغییرات پرونده</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
