import React, { useState, useEffect, useMemo } from 'react';
import { useAtelier } from '../../../store/AtelierContext';
import { TimePickerSelect } from '../../common/TimePickerSelect';
import { 
  StudioOpeningHour, 
  StudioProfileSettings, 
  AppointmentPoliciesSettings, 
  NotificationPreferencesSettings, 
  AnalyticsPeriod,
  AnnouncementSettings
} from '../../../types';
import { 
  Sliders, 
  Building, 
  Clock, 
  ShieldAlert, 
  Target, 
  Bell, 
  Save, 
  RotateCcw, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Check, 
  Phone, 
  Mail, 
  MapPin, 
  Sparkles,
  AlertTriangle,
  X,
  Coffee,
  GlassWater,
  Leaf,
  UtensilsCrossed,
  Edit2,
  Megaphone,
  UserCheck,
  CalendarCheck,
  Calendar,
  Copy,
  Sun,
  Moon,
  Zap,
  Info,
  Layers,
  ChevronLeft,
  CheckCircle2,
  Lock,
  Wallet,
  Settings2,
  MessageSquare,
  Type,
  FileSpreadsheet
} from 'lucide-react';
import { toPersianDigits } from '../../../utils/dateUtils';
import { BarberPresetMessagesSettings } from './BarberPresetMessagesSettings';
import { GoogleSheetsBackupSettings } from './GoogleSheetsBackupSettings';
import { FONTS, getSelectedFont, saveSelectedFont, FontOption } from '../../../utils/fontManager';

export const StudioSettingsView: React.FC = () => {
  const { 
    settings, 
    barbers,
    activeBarber,
    updateBarberAvailability,
    updateStudioSettings, 
    updateStudioProfile, 
    updateAnnouncement,
    updateOperatingHours, 
    updatePolicies, 
    updateFinancialTarget, 
    updateNotificationPreferences, 
    resetSettingsToDefault,
    beverageOptions,
    addBeverageOption,
    updateBeverageOption,
    deleteBeverageOption
  } = useAtelier();

  const [activeTab, setActiveTab] = useState<
    'profile' | 'announcement' | 'hours' | 'policies' | 'targets' | 'notifications' | 'hospitality' | 'messages' | 'typography' | 'googlesheets'
  >('hours');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);
  const [currentFont, setCurrentFont] = useState<FontOption>(() => getSelectedFont());

  useEffect(() => {
    const handleFontChange = (e: any) => {
      if (e.detail?.font) {
        setCurrentFont(e.detail.font);
      }
    };
    window.addEventListener('atelier-font-changed', handleFontChange);
    return () => window.removeEventListener('atelier-font-changed', handleFontChange);
  }, []);

  // Beverage Modal / Inline Form State
  const [newBevName, setNewBevName] = useState('');
  const [newBevDesc, setNewBevDesc] = useState('');
  const [newBevPrice, setNewBevPrice] = useState<number>(35000);
  const [newBevCategory, setNewBevCategory] = useState<'hot' | 'cold' | 'herbal' | 'snack'>('hot');
  const [newBevIcon, setNewBevIcon] = useState<'coffee' | 'tea' | 'juice' | 'water' | 'sparkle' | 'croissant'>('coffee');

  // Edit in-place state
  const [editingBevId, setEditingBevId] = useState<string | null>(null);
  const [editPriceVal, setEditPriceVal] = useState<number>(0);
  const [editNameVal, setEditNameVal] = useState<string>('');
  const [editDescVal, setEditDescVal] = useState<string>('');

  // Barber Availability & Working Hours State
  const [selectedBarberId, setSelectedBarberId] = useState<string>(activeBarber?.id || barbers[0]?.id || 'barber-1');
  const currentBarber = useMemo(() => {
    return barbers.find((b) => b.id === selectedBarberId) || activeBarber || barbers[0];
  }, [barbers, selectedBarberId, activeBarber]);

  const [barberAvailableToday, setBarberAvailableToday] = useState<boolean>(
    currentBarber?.isAvailableToday ?? true
  );

  const ALL_WEEK_DAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];

  const [barberWorkingDays, setBarberWorkingDays] = useState<string[]>(() => {
    if (currentBarber?.workingDays && currentBarber.workingDays.length > 0) {
      return currentBarber.workingDays;
    }
    return ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه'];
  });

  // Local copy of form state for smooth editing
  const [profileForm, setProfileForm] = useState<StudioProfileSettings>(settings.profile);
  const [announcementForm, setAnnouncementForm] = useState<AnnouncementSettings>(
    settings.announcement || { headline: '', body: '', tag: 'طرح ویژه', isActive: false }
  );
  const [hoursForm, setHoursForm] = useState<StudioOpeningHour[]>(
    currentBarber?.workingHours && currentBarber.workingHours.length > 0
      ? currentBarber.workingHours
      : settings.operatingHours
  );
  const [policiesForm, setPoliciesForm] = useState<AppointmentPoliciesSettings>(settings.policies);
  const [targetsForm, setTargetsForm] = useState<Record<AnalyticsPeriod, number>>(settings.financialTargets);
  const [notifsForm, setNotifsForm] = useState<NotificationPreferencesSettings>(settings.notificationPreferences);

  // When selected barber changes, reload schedule state
  useEffect(() => {
    if (currentBarber) {
      setBarberAvailableToday(currentBarber.isAvailableToday ?? true);
      if (currentBarber.workingDays && currentBarber.workingDays.length > 0) {
        setBarberWorkingDays(currentBarber.workingDays);
      } else {
        setBarberWorkingDays(['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه']);
      }

      if (currentBarber.workingHours && currentBarber.workingHours.length > 0) {
        setHoursForm(currentBarber.workingHours);
      } else {
        setHoursForm(settings.operatingHours);
      }
    }
  }, [currentBarber, selectedBarberId]);

  useEffect(() => {
    setProfileForm(settings.profile);
    setAnnouncementForm(settings.announcement || { headline: '', body: '', tag: 'طرح ویژه', isActive: false });
    setPoliciesForm(settings.policies);
    setTargetsForm(settings.financialTargets);
    setNotifsForm(settings.notificationPreferences);
  }, [settings]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Save Handlers
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudioProfile(profileForm);
    showToast('اطلاعات پروفایل و مشخصات آتلیه با موفقیت ذخیره شد.');
  };

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    updateAnnouncement(announcementForm);
    showToast('اطلاعیه و پیام بنر سالن با موفقیت ذخیره شد.');
  };

  const toggleWorkingDay = (dayName: string) => {
    setBarberWorkingDays((prev) => {
      const isCurrentlyActive = prev.includes(dayName);
      let updatedDays: string[];
      if (isCurrentlyActive) {
        updatedDays = prev.filter((d) => d !== dayName);
      } else {
        updatedDays = [...prev, dayName];
      }

      // Also sync isClosed in hoursForm
      setHoursForm((prevHours) =>
        prevHours.map((h) => {
          if (h.dayOfWeek === dayName) {
            return {
              ...h,
              isClosed: isCurrentlyActive, // if was active, now closed
            };
          }
          return h;
        })
      );

      return updatedDays;
    });
  };

  const applyPresetDays = (presetType: 'all' | 'workweek' | 'standard' | 'odd' | 'even' | 'weekend') => {
    let targetDays: string[] = [];
    if (presetType === 'all') {
      targetDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
    } else if (presetType === 'workweek') {
      targetDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه'];
    } else if (presetType === 'standard') {
      targetDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه'];
    } else if (presetType === 'odd') {
      targetDays = ['شنبه', 'دوشنبه', 'چهارشنبه', 'جمعه'];
    } else if (presetType === 'even') {
      targetDays = ['یکشنبه', 'سه‌شنبه', 'پنج‌شنبه'];
    } else if (presetType === 'weekend') {
      targetDays = ['پنج‌شنبه', 'جمعه'];
    }

    setBarberWorkingDays(targetDays);
    setHoursForm((prevHours) =>
      prevHours.map((h) => ({
        ...h,
        isClosed: !targetDays.includes(h.dayOfWeek),
      }))
    );
    showToast(`الگوی روزهای انتخابی بر روی برنامه «${currentBarber.name}» اعمال شد.`);
  };

  const applyHoursToAllActiveDays = (sourceDayIndex: number) => {
    const source = hoursForm[sourceDayIndex];
    if (!source) return;
    const updated = hoursForm.map((h) => {
      if (barberWorkingDays.includes(h.dayOfWeek) && !h.isClosed) {
        return {
          ...h,
          openTime: source.openTime,
          closeTime: source.closeTime,
          breakStart: source.breakStart,
          breakEnd: source.breakEnd,
        };
      }
      return h;
    });
    setHoursForm(updated);
    showToast(`ساعات کاری (${toPersianDigits(source.openTime)} تا ${toPersianDigits(source.closeTime)}) به همه روزهای کاری فعال اعمال شد.`);
  };

  const scheduleMetrics = useMemo(() => {
    let totalMinutes = 0;
    let activeDaysCount = 0;

    hoursForm.forEach((h) => {
      const isDayActive = barberWorkingDays.includes(h.dayOfWeek) && !h.isClosed;
      if (isDayActive) {
        activeDaysCount += 1;
        const [openH, openM] = (h.openTime || '10:00').split(':').map(Number);
        const [closeH, closeM] = (h.closeTime || '20:30').split(':').map(Number);
        let dayMinutes = (closeH * 60 + closeM) - (openH * 60 + openM);

        if (h.breakStart && h.breakEnd) {
          const [bStartH, bStartM] = h.breakStart.split(':').map(Number);
          const [bEndH, bEndM] = h.breakEnd.split(':').map(Number);
          const breakMinutes = (bEndH * 60 + bEndM) - (bStartH * 60 + bStartM);
          if (breakMinutes > 0) {
            dayMinutes = Math.max(0, dayMinutes - breakMinutes);
          }
        }

        if (dayMinutes > 0) {
          totalMinutes += dayMinutes;
        }
      }
    });

    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    return {
      activeDaysCount,
      totalHours,
      totalMinutes,
    };
  }, [hoursForm, barberWorkingDays]);

  const handleSaveHours = (e: React.FormEvent) => {
    e.preventDefault();
    updateBarberAvailability(selectedBarberId, barberWorkingDays, hoursForm, barberAvailableToday);
    showToast(`برنامه روزها و ساعات کاری «${currentBarber.name}» با موفقیت ذخیره و در نوبت‌دهی اعمال شد.`);
  };

  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    updatePolicies(policiesForm);
    showToast('خط‌مشی‌ها و قوانین رزرو نوبت بروزرسانی شد.');
  };

  const handleSaveTargets = (e: React.FormEvent) => {
    e.preventDefault();
    Object.entries(targetsForm).forEach(([period, amount]) => {
      updateFinancialTarget(period as AnalyticsPeriod, Number(amount));
    });
    showToast('اهداف و بودجه مالی دوره‌ای ذخیره گردید.');
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotificationPreferences(notifsForm);
    showToast('ترجیحات ارسال اعلانات بروزرسانی شد.');
  };

  const handleConfirmReset = () => {
    resetSettingsToDefault();
    setShowResetConfirmModal(false);
    showToast('تمام تنظیمات به پیش‌فرض اولیه بازگردانده شد.');
  };

  return (
    <div id="studio-settings-view" className="space-y-5 animate-fade-in w-full max-w-full overflow-x-hidden pb-12" dir="rtl">
      {/* Toast Notification (Unified Glassmorphic Pill) */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 sm:left-8 sm:translate-x-0 z-50 px-4 py-3 rounded-2xl bg-stone-900/95 text-white text-xs font-bold shadow-2xl backdrop-blur-md border border-stone-700/60 flex items-center gap-2.5 transition-all">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner with Tactile Glass Finish */}
      <div className="clay-card rounded-3xl p-4 sm:p-6 bg-white/90 border border-white/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#7e5352]/10 border border-[#7e5352]/20 text-[#7e5352] flex items-center justify-center shadow-xs shrink-0">
            <Sliders className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-serif font-black text-stone-900 flex items-center gap-2">
              <span>تنظیمات و پیکربندی مرکزی آتلیه</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              مدیریت هویت سازمانی، تقویم کاری، خط‌مشی‌های رزرو، تارگت‌های مالی و تشریفات
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowResetConfirmModal(true)}
          className="clay-button-pastel px-3.5 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
          <span>بازنشانی به پیش‌فرض</span>
        </button>
      </div>

      {/* Settings Navigation Tabs (Unified with Responsive Multi-Line Wrap - No Horizontal Scrolling) */}
      <div 
        id="settings-tabs-bar"
        className="clay-card-subtle rounded-2xl p-1.5 flex flex-wrap items-center gap-1.5 backdrop-blur-xl bg-white/80 border border-white/70 shadow-sm w-full"
      >
        {[
          { id: 'hours', label: 'ساعات و روزهای کاری', icon: Clock },
          { id: 'typography', label: 'قلم و تایپوگرافی سامانه', icon: Type },
          { id: 'messages', label: 'پیام‌های آماده (پیامک)', icon: MessageSquare },
          { id: 'profile', label: 'پروفایل آتلیه', icon: Building },
          { id: 'announcement', label: 'اطلاعیه و بنر', icon: Megaphone },
          { id: 'policies', label: 'قوانین و ودیعه', icon: ShieldAlert },
          { id: 'targets', label: 'اهداف مالی', icon: Target },
          { id: 'hospitality', label: 'منوی پذیرایی', icon: UtensilsCrossed },
          { id: 'notifications', label: 'تنظیمات اعلانات', icon: Bell },
          { id: 'googlesheets', label: 'پشتیبان گوگل شیت', icon: FileSpreadsheet },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer grow sm:grow-0 ${
                isActive
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/80'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-stone-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: BARBER WORKING DAYS & HOURS AVAILABILITY ────────── */}
      {activeTab === 'hours' && (
        <form onSubmit={handleSaveHours} className="space-y-4">
          {/* Barber Selection & Profile Header Card */}
          <div className="clay-card rounded-3xl p-5 sm:p-6 bg-white/90 border border-white/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <img
                    src={currentBarber.avatarUrl}
                    alt={currentBarber.name}
                    loading="lazy"
                    decoding="async"
                    className="w-13 h-13 rounded-2xl object-cover border-2 border-white shadow-md"
                  />
                  <div className={`absolute -bottom-1 -left-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-xs ${
                    barberAvailableToday ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}>
                    {barberAvailableToday ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-serif font-black text-stone-900">{currentBarber.name}</h3>
                    <span className="px-2 py-0.5 rounded-md bg-[#7e5352]/10 border border-[#7e5352]/20 text-[#7e5352] text-[10px] font-bold">
                      {currentBarber.title}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    تنظیم روزهای پذیرش نوبت، ساعات شیفت کاری و زمان استراحت در هفته
                  </p>
                </div>
              </div>

              {/* Barber Selector Dropdown if multiple */}
              {barbers.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500">انتخاب استاد:</span>
                  <select
                    value={selectedBarberId}
                    onChange={(e) => setSelectedBarberId(e.target.value)}
                    className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-800 font-bold focus:outline-none focus:border-[#7e5352] cursor-pointer"
                  >
                    {barbers.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.title})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="clay-card-subtle p-3.5 rounded-2xl bg-stone-50/70 border border-stone-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shadow-2xs">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-500 font-medium">روزهای کاری فعال</div>
                    <div className="text-xs font-black text-stone-800">
                      {toPersianDigits(scheduleMetrics.activeDaysCount)} روز در هفته
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-600 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  {scheduleMetrics.activeDaysCount === 7 ? 'تمام هفته' : 'شیفت منظم'}
                </span>
              </div>

              <div className="clay-card-subtle p-3.5 rounded-2xl bg-stone-50/70 border border-stone-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shadow-2xs">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-500 font-medium">مجموع ساعات در دسترس</div>
                    <div className="text-xs font-black text-stone-800 font-mono">
                      {toPersianDigits(scheduleMetrics.totalHours)} ساعت هفتگی
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-amber-700 font-mono font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                  ~{toPersianDigits(Math.round(scheduleMetrics.totalHours / (scheduleMetrics.activeDaysCount || 1)))} س/روز
                </span>
              </div>

              {/* Real-time Attendance Instant Switch */}
              <div className="clay-card-subtle p-3.5 rounded-2xl bg-stone-50/70 border border-stone-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-2xs ${
                    barberAvailableToday 
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600' 
                      : 'bg-rose-500/10 border border-rose-500/20 text-rose-600'
                  }`}>
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-500 font-medium">حضور امروز در استودیو</div>
                    <div className={`text-xs font-bold ${barberAvailableToday ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {barberAvailableToday ? 'حاضر و نوبت‌دهی فعال' : 'مرخصی / عدم حضور'}
                    </div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={barberAvailableToday}
                    onChange={(e) => setBarberAvailableToday(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5.5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full rtl:peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:start-[3px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600 shadow-inner"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Section 1: Days of Week Selection & Quick Presets */}
          <div className="clay-card rounded-3xl p-5 sm:p-6 bg-white/90 border border-white/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#7e5352]" />
                  <span>تعیین روزهای در دسترس برای کار (Working Days)</span>
                </h4>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  روزهایی که مایل به پذیرش نوبت‌های مشتریان هستید را انتخاب نمایید.
                </p>
              </div>

              {/* Fast Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-stone-500 font-medium">الگوهای سریع:</span>
                <button
                  type="button"
                  onClick={() => applyPresetDays('workweek')}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200/80 text-[10px] font-bold text-stone-700 transition-colors cursor-pointer"
                >
                  شنبه تا پنج‌شنبه
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetDays('standard')}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200/80 text-[10px] font-bold text-stone-700 transition-colors cursor-pointer"
                >
                  شنبه تا چهارشنبه
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetDays('all')}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200/80 text-[10px] font-bold text-stone-700 transition-colors cursor-pointer"
                >
                  همه ۷ روز
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetDays('odd')}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200/80 text-[10px] font-bold text-stone-700 transition-colors cursor-pointer"
                >
                  روزهای فرد
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetDays('even')}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200/80 text-[10px] font-bold text-stone-700 transition-colors cursor-pointer"
                >
                  روزهای زوج
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetDays('weekend')}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200/80 text-[10px] font-bold text-stone-700 transition-colors cursor-pointer"
                >
                  فقط آخر هفته
                </button>
              </div>
            </div>

            {/* 7 Days Matrix Grid (Tactile 3D Cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              {ALL_WEEK_DAYS.map((dayName) => {
                const isActive = barberWorkingDays.includes(dayName);
                const hourObj = hoursForm.find((h) => h.dayOfWeek === dayName);
                const isClosed = hourObj?.isClosed || !isActive;

                return (
                  <button
                    key={dayName}
                    type="button"
                    onClick={() => toggleWorkingDay(dayName)}
                    className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between gap-2.5 cursor-pointer ${
                      !isClosed && isActive
                        ? 'tactile-tile-3d-active border-[#7e5352]/30 text-white shadow-md'
                        : 'tactile-tile-3d bg-white/90 border-stone-200/80 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs font-black ${!isClosed && isActive ? 'text-white' : 'text-stone-800'}`}>
                        {dayName}
                      </span>
                      <div className={`w-4.5 h-4.5 rounded-md flex items-center justify-center transition-colors ${
                        !isClosed && isActive ? 'bg-emerald-500 text-stone-950 font-bold' : 'bg-stone-200 text-stone-500'
                      }`}>
                        {!isClosed && isActive ? <Check className="w-3 h-3 stroke-[3]" /> : <X className="w-3 h-3" />}
                      </div>
                    </div>

                    <div className="w-full text-right">
                      {!isClosed && isActive ? (
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-emerald-400 block">روز کاری فعال</span>
                          <span className="text-[10px] text-stone-200 font-mono block">
                            {hourObj?.openTime ? `${toPersianDigits(hourObj.openTime)} - ${toPersianDigits(hourObj.closeTime)}` : '۱۰:۰۰ - ۲۰:۳۰'}
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-medium text-rose-500 block">تعطیل / استراحت</span>
                          <span className="text-[10px] text-stone-400 block">—</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Daily Hours & Shift Breakdown */}
          <div className="clay-card rounded-3xl p-5 sm:p-6 bg-white/90 border border-white/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#7e5352]" />
                  <span>ساعات کاری روزانه و شیفت‌ها (Daily Working Hours)</span>
                </h4>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  ساعت شروع، ساعت پایان و زمان استراحت میان‌روز را برای هر روز هفته به دقت پیکربندی فرمایید.
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {hoursForm.map((h, idx) => {
                const isDayActive = barberWorkingDays.includes(h.dayOfWeek) && !h.isClosed;

                return (
                  <div
                    key={h.dayOfWeek}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isDayActive
                        ? 'bg-stone-50/80 border-stone-200/80 shadow-2xs'
                        : 'bg-stone-100/40 border-stone-200/40 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 min-w-0 w-full">
                      {/* Day Name & Status */}
                      <div className="flex items-center gap-3 w-full lg:w-32 shrink-0">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isDayActive ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-stone-400'}`} />
                        <div>
                          <div className="text-xs font-black text-stone-900">{h.dayOfWeek}</div>
                          <span className={`text-[10px] font-bold ${isDayActive ? 'text-emerald-600' : 'text-stone-400'}`}>
                            {isDayActive ? 'فعال در نوبت‌دهی' : 'تعطیل'}
                          </span>
                        </div>
                      </div>

                      {/* Working Hours (Open to Close) & Break */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 min-w-0 max-w-full flex-1">
                        <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-2 sm:px-2.5 py-1.5 rounded-xl border border-stone-200 shadow-2xs shrink-0">
                          <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="text-[11px] text-stone-500 whitespace-nowrap font-medium">از ساعت:</span>
                          <TimePickerSelect
                            value={h.openTime || '10:00'}
                            disabled={!isDayActive}
                            presets={['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '13:00', '14:00', '15:00']}
                            onChange={(val) => {
                              const updated = [...hoursForm];
                              updated[idx] = { ...h, openTime: val };
                              setHoursForm(updated);
                            }}
                            ariaLabel={`ساعت شروع ${h.dayOfWeek}`}
                          />
                        </div>

                        <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-2 sm:px-2.5 py-1.5 rounded-xl border border-stone-200 shadow-2xs shrink-0">
                          <Moon className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                          <span className="text-[11px] text-stone-500 whitespace-nowrap font-medium">تا ساعت:</span>
                          <TimePickerSelect
                            value={h.closeTime || '20:30'}
                            disabled={!isDayActive}
                            presets={['17:00', '18:00', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30']}
                            onChange={(val) => {
                              const updated = [...hoursForm];
                              updated[idx] = { ...h, closeTime: val };
                              setHoursForm(updated);
                            }}
                            ariaLabel={`ساعت پایان ${h.dayOfWeek}`}
                          />
                        </div>

                        {/* Mid-day Break / Pause */}
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 bg-white px-2 sm:px-2.5 py-1.5 rounded-xl border border-stone-200 shadow-2xs max-w-full">
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Coffee className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="text-[11px] text-stone-500 whitespace-nowrap font-medium">استراحت میان‌روز:</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TimePickerSelect
                              value={h.breakStart || ''}
                              disabled={!isDayActive}
                              placeholder="شروع"
                              allowClear={true}
                              clearLabel="بدون استراحت"
                              presets={['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00']}
                              onChange={(val) => {
                                const updated = [...hoursForm];
                                updated[idx] = { ...h, breakStart: val };
                                setHoursForm(updated);
                              }}
                              ariaLabel={`شروع استراحت ${h.dayOfWeek}`}
                            />
                            <span className="text-stone-400 text-xs font-bold px-0.5">تا</span>
                            <TimePickerSelect
                              value={h.breakEnd || ''}
                              disabled={!isDayActive}
                              placeholder="پایان"
                              allowClear={true}
                              clearLabel="بدون استراحت"
                              presets={['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00']}
                              onChange={(val) => {
                                const updated = [...hoursForm];
                                updated[idx] = { ...h, breakEnd: val };
                                setHoursForm(updated);
                              }}
                              ariaLabel={`پایان استراحت ${h.dayOfWeek}`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Day Action Buttons */}
                      <div className="flex items-center gap-2 justify-end shrink-0 w-full sm:w-auto mt-1 sm:mt-0">
                        {isDayActive && (
                          <button
                            type="button"
                            onClick={() => applyHoursToAllActiveDays(idx)}
                            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-[10px] font-bold text-stone-700 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="اعمال همین ساعت‌ها به همه روزهای کاری دیگر"
                          >
                            <Copy className="w-3 h-3 text-[#7e5352]" />
                            <span>کپی به همه</span>
                          </button>
                        )}

                        <label className="text-xs text-stone-600 flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1.5 rounded-xl border border-stone-200 shadow-2xs">
                          <input
                            type="checkbox"
                            checked={h.isClosed}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              const updated = [...hoursForm];
                              updated[idx] = { ...h, isClosed: isChecked };
                              setHoursForm(updated);

                              if (isChecked) {
                                setBarberWorkingDays((prev) => prev.filter((d) => d !== h.dayOfWeek));
                              } else {
                                setBarberWorkingDays((prev) =>
                                  prev.includes(h.dayOfWeek) ? prev : [...prev, h.dayOfWeek]
                                );
                              }
                            }}
                            className="rounded border-stone-300 text-[#7e5352] focus:ring-0 cursor-pointer"
                          />
                          <span className="text-[11px] font-bold whitespace-nowrap">تعطیل</span>
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="clay-card rounded-3xl p-4 sm:p-5 bg-white/90 border border-white/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                تغییرات ساعات و روزهای کاری به صورت زنده در تقویم رزرو مشتریان و الگوریتم‌های پر کردن فواصل زمانی اعمال می‌گردد.
              </span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => {
                  applyPresetDays('workweek');
                  setHoursForm([
                    { dayOfWeek: 'شنبه', openTime: '10:00', closeTime: '20:30', isClosed: false },
                    { dayOfWeek: 'یکشنبه', openTime: '10:00', closeTime: '20:30', isClosed: false },
                    { dayOfWeek: 'دوشنبه', openTime: '10:00', closeTime: '20:30', isClosed: false },
                    { dayOfWeek: 'سه‌شنبه', openTime: '10:00', closeTime: '20:30', isClosed: false },
                    { dayOfWeek: 'چهارشنبه', openTime: '10:00', closeTime: '20:30', isClosed: false },
                    { dayOfWeek: 'پنج‌شنبه', openTime: '10:00', closeTime: '22:00', isClosed: false },
                    { dayOfWeek: 'جمعه', openTime: '12:00', closeTime: '18:00', isClosed: true },
                  ]);
                  setBarberAvailableToday(true);
                  showToast('ساعات کاری به مقادیر استاندارد آتلیه بازگردانده شد.');
                }}
                className="clay-button-pastel px-3.5 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                بازنشانی ساعات
              </button>

              <button
                type="submit"
                className="clay-button-primary px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4 text-amber-400" />
                <span>ذخیره برنامه کاری</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ─── TAB 2: STUDIO PROFILE ───────────────────────────────────── */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="clay-card rounded-3xl p-5 sm:p-6 bg-white/90 border border-white/80 shadow-sm space-y-4">
            <div className="border-b border-stone-100 pb-3">
              <h3 className="text-sm sm:text-base font-serif font-black text-stone-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-[#7e5352]" />
                <span>مشخصات عمومی و هویت سازمانی آتلیه</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                این اطلاعات در سربرگ فاکتورها، کارت‌های پرواز دیجیتال، پیامک‌ها و هدر پنل مشتریان درج می‌گردد.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  عنوان کامل آتلیه / سالن
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7e5352]/20 focus:border-[#7e5352] shadow-2xs font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  شعار و بیانیه آتلیه
                </label>
                <input
                  type="text"
                  value={profileForm.tagline}
                  onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7e5352]/20 focus:border-[#7e5352] shadow-2xs font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  نام آرایشگر / استاد پیرایش
                </label>
                <input
                  type="text"
                  value={profileForm.masterName || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, masterName: e.target.value })}
                  placeholder="مثال: علی رضایی"
                  className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7e5352]/20 focus:border-[#7e5352] shadow-2xs font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  عنوان شغلی و تخصص آرایشگر
                </label>
                <input
                  type="text"
                  value={profileForm.masterTitle || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, masterTitle: e.target.value })}
                  placeholder="مثال: سرآرایشگر و مدیر آتلیه"
                  className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7e5352]/20 focus:border-[#7e5352] shadow-2xs font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  شماره تماس مستقیم سالن
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-mono text-left focus:outline-none focus:ring-2 focus:ring-[#7e5352]/20 focus:border-[#7e5352] shadow-2xs font-bold"
                  />
                  <Phone className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  شماره خط کانسیرج اختصاصی
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profileForm.conciergePhone || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, conciergePhone: e.target.value })}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-mono text-left focus:outline-none focus:ring-2 focus:ring-[#7e5352]/20 focus:border-[#7e5352] shadow-2xs font-bold"
                  />
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-bold text-stone-800">
                  آدرس و نشانی دقیق سالن
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7e5352]/20 focus:border-[#7e5352] shadow-2xs font-medium"
                  />
                  <MapPin className="w-3.5 h-3.5 text-[#7e5352] absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="clay-button-primary px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>ذخیره تغییرات پروفایل</span>
            </button>
          </div>
        </form>
      )}

      {/* ─── TAB 3: ANNOUNCEMENT & BANNER ─────────────────────────────── */}
      {activeTab === 'announcement' && (
        <form onSubmit={handleSaveAnnouncement} className="space-y-4">
          <div className="clay-card rounded-3xl p-5 sm:p-6 bg-white/90 border border-white/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-serif font-black text-stone-900 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-[#7e5352]" />
                  <span>اطلاعیه و بنر صفحه اصلی مشتریان</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  هنگامی که متن اطلاعیه را فعال نمایید، به صورت هوشمند در بالای صفحه اصلی مشتریان نمایش داده می‌شود.
                </p>
              </div>

              {/* Active Toggle Switch */}
              <label className="flex items-center gap-2 cursor-pointer select-none bg-stone-50 px-3.5 py-2 rounded-xl border border-stone-200 shadow-2xs">
                <input
                  type="checkbox"
                  checked={announcementForm.isActive}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-[#7e5352] focus:ring-0 focus:ring-offset-0 border-stone-300 cursor-pointer"
                />
                <span className={`text-xs font-bold ${announcementForm.isActive ? 'text-emerald-700' : 'text-stone-500'}`}>
                  {announcementForm.isActive ? 'فعال (نمایش در خانه)' : 'غیرفعال (مخفی)'}
                </span>
              </label>
            </div>

            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-stone-800">
                    تیتر یا عنوان اطلاعیه
                  </label>
                  <input
                    type="text"
                    value={announcementForm.headline}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, headline: e.target.value })}
                    placeholder="مثال: اطلاعیه سالن رویال / تخفیف ویژه ساعات صبحگاهی"
                    className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7e5352]/20 focus:border-[#7e5352] shadow-2xs font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-800">
                    برچسب / بج (اختیاری)
                  </label>
                  <input
                    type="text"
                    value={announcementForm.tag || ''}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, tag: e.target.value })}
                    placeholder="مثال: طرح ویژه / مهم / هدیه"
                    className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7e5352]/20 focus:border-[#7e5352] shadow-2xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  متن کامل اطلاعیه
                </label>
                <textarea
                  rows={3}
                  value={announcementForm.body}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, body: e.target.value })}
                  placeholder="متن پیام مدیریت به مشتریان را اینجا بنویسید (مانند تخفیف‌ها، ساعات ویژه یا اطلاع‌رسانی تعطیلی)..."
                  className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#7e5352]/20 focus:border-[#7e5352] shadow-2xs font-medium"
                />
              </div>

              {/* Live Claymorphic Preview Card */}
              <div className="clay-card-subtle p-4 rounded-2xl bg-stone-50/70 border border-stone-200/80">
                <span className="text-[11px] font-bold text-stone-500 block mb-2">
                  پیش‌نمایش اطلاعیه در صفحه اصلی:
                </span>
                {announcementForm.isActive && (announcementForm.headline.trim() || announcementForm.body.trim()) ? (
                  <div className="bg-white border border-stone-200/80 rounded-2xl p-3.5 text-stone-900 shadow-sm flex items-start gap-3 max-w-md">
                    <div className="w-8 h-8 rounded-xl bg-[#7e5352]/10 border border-[#7e5352]/20 flex items-center justify-center text-[#7e5352] shrink-0 mt-0.5">
                      <Megaphone className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-stone-900">
                          {announcementForm.headline || 'اطلاعیه سالن رویال'}
                        </span>
                        {announcementForm.tag && (
                          <span className="text-[9px] font-bold text-[#7e5352] bg-[#7e5352]/10 border border-[#7e5352]/20 px-2 py-0.5 rounded-full">
                            {announcementForm.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                        {announcementForm.body || 'متن اطلاعیه...'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 italic">
                    در حال حاضر متنی تنظیم نشده یا وضعیت غیرفعال است (چیزی در صفحه اصلی نمایش داده نخواهد شد).
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setAnnouncementForm({ headline: '', body: '', tag: '', isActive: false });
                updateAnnouncement({ headline: '', body: '', tag: '', isActive: false });
                showToast('اطلاعیه پاک و از صفحه اصلی حذف شد.');
              }}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 border border-stone-200 text-rose-600 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف و پاکسازی اطلاعیه</span>
            </button>

            <button
              type="submit"
              className="clay-button-primary px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>ذخیره و انتشار اطلاعیه</span>
            </button>
          </div>
        </form>
      )}

      {/* ─── TAB 4: APPOINTMENT POLICIES & DEPOSIT ───────────────────── */}
      {activeTab === 'policies' && (
        <form onSubmit={handleSavePolicies} className="space-y-4">
          <div className="clay-card rounded-3xl p-5 sm:p-6 bg-white/90 border border-white/80 shadow-sm space-y-4">
            <div className="border-b border-stone-100 pb-3">
              <h3 className="text-sm sm:text-base font-serif font-black text-stone-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#7e5352]" />
                <span>خط‌مشی‌ها، لغو و مبلغ ودیعه رزرو</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                پیکربندی زمان‌بندی مجاز لغو، حداقل فاصله نوبت‌گیری و ودیعه ضمانت صندلی
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  مهلت لغو بدون کسر هزینه (ساعت)
                </label>
                <input
                  type="number"
                  min="0"
                  max="168"
                  value={policiesForm.cancellationWindowHours}
                  onChange={(e) => setPoliciesForm({ ...policiesForm, cancellationWindowHours: parseInt(e.target.value) || 24 })}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-mono font-bold text-left focus:outline-none focus:ring-2 focus:ring-[#7e5352]/20 focus:border-[#7e5352] shadow-2xs"
                />
                <span className="text-[11px] text-stone-500 block">
                  لغو تا {toPersianDigits(policiesForm.cancellationWindowHours)} ساعت قبل از نوبت رایگان است.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  حداقل فاصله زمانی رزرو آنلاین (ساعت)
                </label>
                <input
                  type="number"
                  min="0"
                  max="48"
                  value={policiesForm.bookingCutoffHours}
                  onChange={(e) => setPoliciesForm({ ...policiesForm, bookingCutoffHours: parseInt(e.target.value) || 2 })}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-mono font-bold text-left focus:outline-none focus:ring-2 focus:ring-[#7e5352]/20 focus:border-[#7e5352] shadow-2xs"
                />
                <span className="text-[11px] text-stone-500 block">
                  مشتریان باید حداقل {toPersianDigits(policiesForm.bookingCutoffHours)} ساعت قبل نوبت بگیرند.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  حداکثر افق زمانی رزرو آینده (روز)
                </label>
                <input
                  type="number"
                  min="7"
                  max="90"
                  value={policiesForm.maxBookingHorizonDays}
                  onChange={(e) => setPoliciesForm({ ...policiesForm, maxBookingHorizonDays: parseInt(e.target.value) || 30 })}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-mono font-bold text-left focus:outline-none focus:ring-2 focus:ring-[#7e5352]/20 focus:border-[#7e5352] shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  مبلغ ودیعه استاندارد ثبت نوبت (تومان)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={policiesForm.depositAmount}
                  onChange={(e) => setPoliciesForm({ ...policiesForm, depositAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-mono font-bold text-left focus:outline-none focus:ring-2 focus:ring-[#7e5352]/20 focus:border-[#7e5352] shadow-2xs"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-bold text-stone-800">
                  متن رسمی اخطار و خط‌مشی رزرو به مشتریان
                </label>
                <textarea
                  rows={2}
                  value={policiesForm.policyNotice}
                  onChange={(e) => setPoliciesForm({ ...policiesForm, policyNotice: e.target.value })}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#7e5352]/20 focus:border-[#7e5352] shadow-2xs font-medium"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="clay-button-primary px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>ذخیره خط‌مشی‌ها</span>
            </button>
          </div>
        </form>
      )}

      {/* ─── TAB 5: FINANCIAL TARGETS ────────────────────────────────── */}
      {activeTab === 'targets' && (
        <form onSubmit={handleSaveTargets} className="space-y-4">
          <div className="clay-card rounded-3xl p-5 sm:p-6 bg-white/90 border border-white/80 shadow-sm space-y-4">
            <div className="border-b border-stone-100 pb-3">
              <h3 className="text-sm sm:text-base font-serif font-black text-stone-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#7e5352]" />
                <span>تارگت‌ها و بودجه‌بندی درآمدی ادواری آتلیه</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                این مقادیر مستقیماً در نوارهای پیشرفت داشبورد و نمودارهای هوش تجاری گزارش‌ها منعکس می‌گردند.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  تارگت روزانه (تومان)
                </label>
                <input
                  type="number"
                  value={targetsForm.today}
                  onChange={(e) => setTargetsForm({ ...targetsForm, today: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-mono font-bold text-left focus:outline-none focus:ring-2 focus:ring-[#7e5352]/20 focus:border-[#7e5352] shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  تارگت هفتگی (تومان)
                </label>
                <input
                  type="number"
                  value={targetsForm.week}
                  onChange={(e) => setTargetsForm({ ...targetsForm, week: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-mono font-bold text-left focus:outline-none focus:ring-2 focus:ring-[#7e5352]/20 focus:border-[#7e5352] shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  تارگت ماهانه (تومان)
                </label>
                <input
                  type="number"
                  value={targetsForm.month}
                  onChange={(e) => setTargetsForm({ ...targetsForm, month: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-mono font-bold text-left focus:outline-none focus:ring-2 focus:ring-[#7e5352]/20 focus:border-[#7e5352] shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  تارگت سالانه (تومان)
                </label>
                <input
                  type="number"
                  value={targetsForm.year}
                  onChange={(e) => setTargetsForm({ ...targetsForm, year: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-mono font-bold text-left focus:outline-none focus:ring-2 focus:ring-[#7e5352]/20 focus:border-[#7e5352] shadow-2xs"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="clay-button-primary px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>ذخیره اهداف مالی</span>
            </button>
          </div>
        </form>
      )}

      {/* ─── TAB 6: NOTIFICATIONS ────────────────────────────────────── */}
      {activeTab === 'notifications' && (
        <form onSubmit={handleSaveNotifications} className="space-y-4">
          <div className="clay-card rounded-3xl p-5 sm:p-6 bg-white/90 border border-white/80 shadow-sm space-y-4">
            <div className="border-b border-stone-100 pb-3">
              <h3 className="text-sm sm:text-base font-serif font-black text-stone-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#7e5352]" />
                <span>ترجیحات ارسال رویدادها و اعلانات زنده آتلیه</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                انتخاب هشدارهای ناتیفیکیشن روی صفحه و مرکز پیام برای مدیریت آسان‌تر
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                { key: 'newOnlineBooking', label: 'اعلان رزرو نوبت جدید آنلاین', desc: 'ارسال هشدار فوری هنگام رزرو آنلاین توسط مشتری' },
                { key: 'appointmentCancellation', label: 'اعلان لغو نوبت توسط مشتری', desc: 'ارسال هشدار آزادسازی صندلی و نوبت' },
                { key: 'appointmentReschedule', label: 'اعلان تغییر زمان و جابجایی نوبت', desc: 'بروزرسانی تقویم شیفت کاری' },
                { key: 'paymentConfirmation', label: 'اعلان تایید پرداخت و تسویه', desc: 'ثبت واریز مبالغ و بیعانه' },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/70 shadow-2xs"
                >
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">{item.label}</span>
                    <span className="text-[11px] text-stone-500 block">{item.desc}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={(notifsForm as any)[item.key]}
                    onChange={(e) => setNotifsForm({ ...notifsForm, [item.key]: e.target.checked })}
                    className="w-4.5 h-4.5 rounded border-stone-300 text-[#7e5352] focus:ring-0 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="clay-button-primary px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>ذخیره ترجیحات اعلانات</span>
            </button>
          </div>
        </form>
      )}

      {/* ─── TAB 7: HOSPITALITY / BEVERAGE SETTINGS ───────────────────── */}
      {activeTab === 'hospitality' && (
        <div className="space-y-4">
          {/* Header & Quick Stats */}
          <div className="clay-card rounded-3xl p-5 sm:p-6 bg-white/90 border border-white/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm sm:text-base font-serif font-black text-stone-900 flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-[#7e5352]" />
                <span>مدیریت منوی پذیرایی و تشریفات سالن</span>
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                تعریف اقلام پذیرایی، نوشیدنی‌های گرم، آب‌میوه‌های تازه، دمنوش‌ها، قیمت‌گذاری منو و کنترل نمایش در رزرو آنلاین
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-800 text-xs flex items-center gap-2 shadow-2xs">
                <span className="text-stone-500">تعداد اقلام:</span>
                <span className="font-bold text-[#7e5352]">{toPersianDigits(beverageOptions.length)} آیتم</span>
              </div>
            </div>
          </div>

          {/* Master Hospitality Visibility Toggle */}
          <div className="clay-card-subtle p-4 rounded-2xl bg-stone-50/80 border border-stone-200/80 flex items-center justify-between gap-4 shadow-2xs">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-stone-900 block">
                نمایش بخش منوی پذیرایی در فرآیند نوبت‌دهی آنلاین مشتریان
              </span>
              <p className="text-[11px] text-stone-500">
                در صورت غیرفعال کردن، بخش انتخاب پذیرایی در صفحه تسویه‌حساب رزرو نوبت به مراجعین نمایش داده نمی‌شود.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={settings?.hospitalityEnabled !== false}
                onChange={(e) => {
                  updateStudioSettings({ hospitalityEnabled: e.target.checked });
                  showToast(
                    e.target.checked
                      ? 'نمایش بخش پذیرایی در صفحه نوبت‌دهی فعال شد.'
                      : 'بخش پذیرایی در صفحه نوبت‌دهی مخفی (غیرفعال) گردید.'
                  );
                }}
                className="sr-only peer"
              />
              <div className="w-10 h-5.5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full rtl:peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:start-[3px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#7e5352] shadow-inner"></div>
            </label>
          </div>

          {/* Add New Hospitality Item Card */}
          <div className="clay-card rounded-3xl p-5 sm:p-6 bg-white/90 border border-white/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h4 className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#7e5352]" />
                <span>افزودن آیتم جدید به منوی پذیرایی</span>
              </h4>
              <span className="text-[11px] text-stone-500 font-medium">قیمت‌گذاری به تومان</span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newBevName.trim()) {
                  showToast('لطفاً عنوان آیتم پذیرایی را وارد نمایید.');
                  return;
                }
                const result = addBeverageOption({
                  name: newBevName.trim(),
                  description: newBevDesc.trim() || 'تهیه تازه و سرو اختصاصی',
                  price: Number(newBevPrice) || 0,
                  category: newBevCategory,
                  icon: newBevIcon,
                  isAvailable: true,
                });
                if (result.success) {
                  showToast(`آیتم «${newBevName}» با موفقیت به منو اضافه شد.`);
                  setNewBevName('');
                  setNewBevDesc('');
                  setNewBevPrice(35000);
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-800 block">
                    نام آیتم پذیرایی <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newBevName}
                    onChange={(e) => setNewBevName(e.target.value)}
                    placeholder="مثال: لاته ماکیاتو کارامل، چای ماسالا..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-900 placeholder:text-stone-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#7e5352]/20 focus:border-[#7e5352] shadow-2xs font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-800 block">
                    دسته‌بندی
                  </label>
                  <select
                    value={newBevCategory}
                    onChange={(e) => setNewBevCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#7e5352]/20 focus:border-[#7e5352] shadow-2xs font-medium"
                  >
                    <option value="hot">نوشیدنی گرم (اسپرسو، کافه، چای)</option>
                    <option value="cold">نوشیدنی سرد و آب‌میوه تازه</option>
                    <option value="herbal">دمنوش‌های گیاهی و آرام‌بخش</option>
                    <option value="snack">میان‌وعده، شیرینی و کرواسان</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-800 block">
                    قیمت (تومان) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={0}
                      step={5000}
                      value={newBevPrice}
                      onChange={(e) => setNewBevPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#7e5352]/20 focus:border-[#7e5352] shadow-2xs font-mono font-bold"
                    />
                    <span className="absolute left-3.5 top-2.5 text-[10px] text-stone-400 pointer-events-none font-sans">
                      تومان
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-stone-800 block">
                    توضیحات کوتاه و طعم‌شناسی
                  </label>
                  <input
                    type="text"
                    value={newBevDesc}
                    onChange={(e) => setNewBevDesc(e.target.value)}
                    placeholder="مثال: عصاره‌گیری تازه با دانه‌های ۱۰۰٪ عربیکا کلمبیا"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-900 placeholder:text-stone-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#7e5352]/20 focus:border-[#7e5352] shadow-2xs font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-800 block">
                    نوع آیکون نمایشی
                  </label>
                  <select
                    value={newBevIcon}
                    onChange={(e) => setNewBevIcon(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#7e5352]/20 focus:border-[#7e5352] shadow-2xs font-medium"
                  >
                    <option value="coffee">قهوه / اسپرسو</option>
                    <option value="tea">چای / دمنوش</option>
                    <option value="juice">آب‌میوه طبیعی</option>
                    <option value="water">آب معدنی / گازدار</option>
                    <option value="croissant">کرواسان / شیرینی</option>
                    <option value="sparkle">میکس تشریفاتی اختصاصی</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="clay-button-primary px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>ثبت و افزودن به منوی پذیرایی</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of Existing Hospitality Items */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-stone-900">
              اقلام موجود در منوی پذیرایی سالن ({toPersianDigits(beverageOptions.length)})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {beverageOptions.map((bev) => {
                const isEditing = editingBevId === bev.id;

                return (
                  <div
                    key={bev.id}
                    className={`clay-card rounded-2xl p-4 border transition-all ${
                      bev.isAvailable !== false
                        ? 'bg-white/90 border-white/80 shadow-2xs'
                        : 'bg-stone-100/60 border-stone-200 opacity-60'
                    }`}
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                          <span className="text-xs font-bold text-stone-900">ویرایش آیتم</span>
                          <button
                            type="button"
                            onClick={() => setEditingBevId(null)}
                            className="text-stone-400 hover:text-stone-700 text-xs cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div>
                            <label className="text-[10px] text-stone-600 block mb-0.5 font-bold">عنوان:</label>
                            <input
                              type="text"
                              value={editNameVal}
                              onChange={(e) => setEditNameVal(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-900 text-xs focus:outline-none focus:border-[#7e5352]"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-stone-600 block mb-0.5 font-bold">قیمت (تومان):</label>
                            <input
                              type="number"
                              value={editPriceVal}
                              onChange={(e) => setEditPriceVal(Number(e.target.value))}
                              step={5000}
                              className="w-full px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-900 text-xs font-mono font-bold focus:outline-none focus:border-[#7e5352]"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-stone-600 block mb-0.5 font-bold">توضیحات:</label>
                            <input
                              type="text"
                              value={editDescVal}
                              onChange={(e) => setEditDescVal(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-900 text-xs focus:outline-none focus:border-[#7e5352]"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              updateBeverageOption(bev.id, {
                                name: editNameVal.trim() || bev.name,
                                price: Number(editPriceVal) >= 0 ? Number(editPriceVal) : bev.price,
                                description: editDescVal.trim() || bev.description,
                              });
                              setEditingBevId(null);
                              showToast(`قیمت و مشخصات «${bev.name}» با موفقیت بروزرسانی شد.`);
                            }}
                            className="clay-button-primary px-3.5 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5 text-amber-400" />
                            <span>ذخیره تغییرات</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-2xl bg-[#7e5352]/10 border border-[#7e5352]/20 text-[#7e5352] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                            {bev.icon === 'tea' ? (
                              <Leaf className="w-5 h-5" />
                            ) : bev.icon === 'water' ? (
                              <GlassWater className="w-5 h-5" />
                            ) : bev.icon === 'croissant' ? (
                              <UtensilsCrossed className="w-5 h-5" />
                            ) : (
                              <Coffee className="w-5 h-5" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                                {bev.name}
                              </h5>
                              <span className="px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-[9px] text-stone-600 font-bold">
                                {bev.category === 'cold'
                                  ? 'نوشیدنی سرد'
                                  : bev.category === 'herbal'
                                  ? 'دمنوش'
                                  : bev.category === 'snack'
                                  ? 'میان‌وعده'
                                  : 'نوشیدنی گرم'}
                              </span>
                            </div>

                            <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                              {bev.description}
                            </p>

                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs font-black text-[#7e5352] font-mono">
                                {bev.price > 0
                                  ? `${toPersianDigits(bev.price.toLocaleString())} تومان`
                                  : 'رایگان'}
                              </span>

                              <label className="text-[10px] text-stone-600 font-bold flex items-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={bev.isAvailable !== false}
                                  onChange={(e) => {
                                    updateBeverageOption(bev.id, { isAvailable: e.target.checked });
                                    showToast(`وضعیت موجودی «${bev.name}» بروزرسانی شد.`);
                                  }}
                                  className="rounded border-stone-300 text-[#7e5352] focus:ring-0"
                                />
                                <span>موجود در سالن</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBevId(bev.id);
                              setEditNameVal(bev.name);
                              setEditPriceVal(bev.price);
                              setEditDescVal(bev.description);
                            }}
                            className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
                            title="ویرایش قیمت و مشخصات"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              deleteBeverageOption(bev.id);
                              showToast(`آیتم «${bev.name}» حذف گردید.`);
                            }}
                            className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-rose-100 text-stone-500 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                            title="حذف از منو"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 8: BARBER PRESET MESSAGES & SMS TEMPLATES ─────────── */}
      {activeTab === 'messages' && (
        <BarberPresetMessagesSettings onShowToast={showToast} />
      )}

      {/* ─── TAB 9: SYSTEM TYPOGRAPHY & FONT MANAGEMENT ─────────── */}
      {activeTab === 'typography' && (
        <div id="typography-settings-section" className="space-y-4">
          {/* Header Card */}
          <div className="clay-card rounded-3xl p-5 sm:p-6 bg-white/90 border border-white/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#5a4a58]/10 text-[#5a4a58] flex items-center justify-center shrink-0">
                  <Type className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900">
                    مدیریت قلم و تایپوگرافی سامانه
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    انتخاب قلم سراسری برای ظاهر پورتال مشتریان، فرآیند رزرو و پنل مدیریت
                  </p>
                </div>
              </div>

              {/* Current Active Font Indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-stone-100 border border-stone-200/80 self-start sm:self-auto">
                <span className="text-[11px] text-stone-500 font-medium">قلم فعال:</span>
                <span className="text-xs font-bold text-stone-900" style={{ fontFamily: currentFont.fontFamily }}>
                  {currentFont.nameFa}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#5a4a58] text-white">
                  {currentFont.badge}
                </span>
              </div>
            </div>

            {/* Font Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
              {FONTS.map((font) => {
                const isSelected = currentFont.id === font.id;
                return (
                  <div
                    key={font.id}
                    onClick={() => {
                      saveSelectedFont(font.id);
                      showToast(`قلم «${font.nameFa}» با موفقیت برای سامانه تنظیم شد.`);
                    }}
                    className={`relative p-4 rounded-2xl text-right transition-all cursor-pointer select-none flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#5a4a58]/10 to-[#5a4a58]/5 border-2 border-[#5a4a58] shadow-md ring-2 ring-[#5a4a58]/20'
                        : 'bg-white hover:bg-stone-50/80 border border-stone-200/70 hover:border-stone-300 shadow-2xs'
                    }`}
                  >
                    <div>
                      {/* Top Row: Names & Badge */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-sm font-bold text-stone-900"
                            style={{ fontFamily: font.fontFamily }}
                          >
                            {font.nameFa}
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            {font.nameEn}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-[#5a4a58] text-white shadow-xs'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {font.badge}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-stone-500 mb-3 line-clamp-2 leading-relaxed">
                        {font.description}
                      </p>

                      {/* Live Persian Preview Box */}
                      <div
                        className="p-3 rounded-xl bg-stone-50 border border-stone-100 space-y-1.5 mb-3"
                        style={{ fontFamily: font.fontFamily }}
                      >
                        <p className="text-xs font-bold text-stone-800 leading-snug">
                          آرایشگاه رویال · هنر اصلاح و زیبایی مردانه
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-stone-600 font-medium">
                          <span>رزرو نوبت شنبه ساعت ۱۸:۳۰</span>
                          <span className="text-[#5a4a58] font-bold">۴۵۰,۰۰۰ تومان</span>
                        </div>
                        <p className="text-[10px] text-stone-400 font-sans tracking-wide">
                          Royal Barber Atelier · Master Cut & Styling
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        saveSelectedFont(font.id);
                        showToast(`قلم «${font.nameFa}» با موفقیت برای سامانه تنظیم شد.`);
                      }}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#5a4a58] text-white shadow-sm'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>قلم فعال سامانه</span>
                        </>
                      ) : (
                        <span>انتخاب و اعمال این قلم</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 10: GOOGLE SHEETS LIVE BACKUP & CLOUD RESTORE ─────────── */}
      {activeTab === 'googlesheets' && (
        <GoogleSheetsBackupSettings />
      )}

      {/* Reset Settings Confirmation Modal (Unified Glassmorphic Popup) */}
      {showResetConfirmModal && (
        <div
          id="reset-settings-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowResetConfirmModal(false)}
        >
          <div
            id="reset-settings-modal-content"
            className="relative w-full max-w-md clay-card bg-white border border-white/90 rounded-3xl p-6 text-stone-900 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shadow-xs">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-serif font-black text-stone-900">
                    بازنشانی تنظیمات آتلیه
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    بازگشت به مقادیر پیش‌فرض هویت، ساعات و قوانین
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              آیا از بازنشانی تمام بخش‌های تنظیمات (پروفایل، ساعات کاری، قوانین ودیعه، تارگت‌های مالی و اعلانات) به مقادیر پیش‌فرض اولیه اطمینان دارید؟
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmReset}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>بله، بازنشانی شود</span>
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="clay-button-pastel py-2.5 px-4 rounded-xl text-stone-700 text-xs font-bold transition-colors cursor-pointer"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
