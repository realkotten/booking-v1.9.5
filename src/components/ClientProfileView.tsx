import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScreenMode, BookingStep } from '../types';
import { AtelierShell } from './AtelierShell';
import { useAtelier } from '../store/AtelierContext';
import {
  User,
  Edit3,
  Check,
  CheckCircle2,
  SlidersHorizontal,
  Sparkles,
  Phone,
  Bell,
  BellRing,
  Clock,
  ShieldCheck,
  AlertCircle,
  X,
  LogOut,
  LogIn,
  Mail,
  KeyRound,
  Globe,
  Loader2,
  Smartphone,
  Upload,
  Camera,
  Image as ImageIcon,
  Flame,
  Droplets,
  Wind,
  Mountain,
  Trash2,
  Compass,
  Type,
} from 'lucide-react';
import { toPersianDigits } from '../utils/dateUtils';
import { validateFullName } from '../utils/customerUtils';
import { hapticLight, hapticSuccess, hapticWarning } from '../utils/hapticUtils';
import { playNotificationChime } from '../utils/soundUtils';
import { sendNativeNotification, requestPushPermission } from '../utils/serviceWorkerRegistration';

import { 
  CHROME_AVATARS, 
  ChromeAvatarItem, 
  DEFAULT_CLIENT_AVATAR,
  processUploadedProfileImage
} from '../data/avatars';
import { FontSelectorModal } from './common/FontSelectorModal';
import { EnamadBadge } from './common/EnamadBadge';
import { getSelectedFont, FontOption } from '../utils/fontManager';

interface ClientProfileViewProps {
  onNavigateScreen: (mode: ScreenMode, step?: BookingStep) => void;
  onOpenConcierge?: () => void;
}

export const PRESET_AVATARS = CHROME_AVATARS;

export const ClientProfileView: React.FC<ClientProfileViewProps> = ({
  onNavigateScreen,
}) => {
  const { 
    currentCustomer, 
    setCurrentCustomer, 
    authUser, 
    isUserAuthenticated, 
    openClientAuthModal, 
    signOutUser 
  } = useAtelier();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isFontModalOpen, setIsFontModalOpen] = useState(false);
  const [currentFont, setCurrentFont] = useState<FontOption>(() => getSelectedFont());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleFontChange = (e: any) => {
      if (e.detail?.font) {
        setCurrentFont(e.detail.font);
      }
    };
    window.addEventListener('atelier-font-changed', handleFontChange);
    return () => window.removeEventListener('atelier-font-changed', handleFontChange);
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setToastMessage('حجم فایل تصویر نباید بیشتر از ۲۰ مگابایت باشد');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setIsUploadingPhoto(true);
    hapticLight();
    try {
      const processedDataUrl = await processUploadedProfileImage(file, 480, 0.88);
      if (currentCustomer) {
        const updated = {
          ...currentCustomer,
          avatarUrl: processedDataUrl,
        };
        setCurrentCustomer(updated);
        hapticSuccess();
        setToastMessage('عکس پروفایل با موفقیت بارگذاری شد ✨');
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err: any) {
      console.error('Photo upload error:', err);
      setToastMessage('خطا در بارگذاری تصویر. لطفاً تصویر دیگری انتخاب نمایید.');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDirectGoogleSignIn = () => {
    hapticLight();
    openClientAuthModal('phone');
  };
  
  // Browser notification permission tracking
  const [permissionState, setPermissionState] = useState<NotificationPermission | 'unsupported'>('default');
  const [enableAppointmentReminder, setEnableAppointmentReminder] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('royal_reminder_notifications_enabled');
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  });
  
  const [showPermissionModal, setShowPermissionModal] = useState<boolean>(false);
  const [reminderToast, setReminderToast] = useState<{ title: string; message: string; time: string } | null>(null);

  // Sync browser notification permission status on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission);
      // If permission was granted previously and reminder was enabled, keep in sync
      if (Notification.permission === 'granted') {
        const saved = localStorage.getItem('royal_reminder_notifications_enabled');
        if (saved !== null) {
          setEnableAppointmentReminder(JSON.parse(saved));
        }
      }
    } else {
      setPermissionState('unsupported');
    }
  }, []);

  // Direct 1-tap Allow handler for the on-screen prompt
  const handleAllowNotifications = async () => {
    setShowPermissionModal(false);
    hapticSuccess();

    if (typeof window === 'undefined' || !('Notification' in window)) {
      setEnableAppointmentReminder(true);
      localStorage.setItem('royal_reminder_notifications_enabled', JSON.stringify(true));
      playNotificationChime();
      setToastMessage('اعلان درون‌برنامه‌ای با موفقیت فعال شد');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    try {
      const result = await requestPushPermission();
      if (result !== 'unsupported') {
        setPermissionState(result);
      }
      
      if (result === 'granted') {
        setEnableAppointmentReminder(true);
        localStorage.setItem('royal_reminder_notifications_enabled', JSON.stringify(true));
        playNotificationChime();
        
        await sendNativeNotification({
          title: 'آرایشگاه رویال — یادآور فعال شد',
          body: `جناب ${currentCustomer?.name?.split(' ')[0] || 'گرامی'}، یادآور ۱ ساعت قبل با موفقیت روی دستگاه شما فعال گردید.`,
          tag: 'royal-reminder-enabled',
          actions: [
            { action: 'view', title: 'مشاهده نوبت' },
            { action: 'close', title: 'متوجه شدم' },
          ],
        });

        setReminderToast({
          title: 'دسترسی اعلان فعال شد',
          message: `جناب ${currentCustomer?.name?.split(' ')[0] || 'گرامی'}، پیام یادآوری ۱ ساعت پیش از نوبت پیرایش شما ارسال خواهد شد.`,
          time: '۱ ساعت قبل',
        });
        setTimeout(() => setReminderToast(null), 5000);
      } else {
        // Fallback: still enable in-app reminder
        setEnableAppointmentReminder(true);
        localStorage.setItem('royal_reminder_notifications_enabled', JSON.stringify(true));
        setToastMessage('یادآور درون‌برنامه‌ای فعال گردید');
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.warn('Notification permission error', err);
      setEnableAppointmentReminder(true);
      localStorage.setItem('royal_reminder_notifications_enabled', JSON.stringify(true));
    }
  };

  const toggleAppointmentReminder = async () => {
    if (enableAppointmentReminder) {
      // User is disabling the reminder
      setEnableAppointmentReminder(false);
      localStorage.setItem('royal_reminder_notifications_enabled', JSON.stringify(false));
      hapticLight();
      setToastMessage('یادآور ۱ ساعت پیش از نوبت غیرفعال شد');
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }

    // User wants to turn it ON -> Show interactive on-screen allow prompt
    hapticLight();

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      setEnableAppointmentReminder(true);
      localStorage.setItem('royal_reminder_notifications_enabled', JSON.stringify(true));
      playNotificationChime();
      setReminderToast({
        title: 'یادآور ۱ ساعت قبل فعال شد',
        message: 'پیام یادآوری ۱ ساعت پیش از شروع نوبت برای شما ارسال خواهد شد.',
        time: '۱ ساعت قبل',
      });
      setTimeout(() => setReminderToast(null), 4000);
      return;
    }

    // Show on-screen popup for instant 1-tap "Allow"
    setShowPermissionModal(true);
  };

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [tempNotes, setTempNotes] = useState(currentCustomer?.formulaNotes || '');
  const [tempName, setTempName] = useState(currentCustomer?.name || '');
  const [tempPhone, setTempPhone] = useState(currentCustomer?.phone || '');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentCustomer) {
      setTempNotes(currentCustomer.formulaNotes || '');
      setTempName(currentCustomer.name || '');
      setTempPhone(currentCustomer.phone || '');
    }
  }, [currentCustomer]);

  // Handle Preset Avatar Selection (Chrome-style)
  const handleSelectAvatar = (avatarUrl: string, avatarTitle: string) => {
    if (!currentCustomer) return;
    const updated = {
      ...currentCustomer,
      avatarUrl,
    };
    setCurrentCustomer(updated);
    setToastMessage(`تصویر پروفایل «${avatarTitle}» انتخاب شد`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const saveNotes = () => {
    if (currentCustomer) {
      setCurrentCustomer({ ...currentCustomer, formulaNotes: tempNotes });
    }
    setIsEditingNotes(false);
    setToastMessage('ترجیحات و فرمول اصلاح ذخیره شد');
    setTimeout(() => setToastMessage(null), 2000);
  };

  const saveInfo = () => {
    const nameValidation = validateFullName(tempName);
    if (!nameValidation.isValid) {
      hapticWarning();
      setToastMessage(nameValidation.error || 'لطفاً نام و نام‌خانوادگی کامل را با فاصله وارد فرمایید');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    if (currentCustomer) {
      setCurrentCustomer({
        ...currentCustomer,
        name: tempName.trim(),
        phone: tempPhone.trim(),
      });
    }
    setIsEditingInfo(false);
    setToastMessage('اطلاعات کاربری با موفقیت ویرایش شد');
    setTimeout(() => setToastMessage(null), 2000);
  };

  const currentAvatarUrl = currentCustomer?.avatarUrl || PRESET_AVATARS[0].url;

  return (
    <AtelierShell id="client-profile-container">
      {/* Top Header */}
      <header
        id="profile-header"
        className="relative z-30 px-6 pt-2 flex items-center justify-between shrink-0"
        dir="rtl"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-stone-900">
            آرایشگاه رویال · پروفایل کاربری شما
          </span>
        </div>
      </header>

      {/* Floating Toast when selecting avatar or saving */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-stone-900/90 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl border border-white/20 animate-in fade-in zoom-in-90 flex items-center gap-2 max-w-[90%] text-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* On-Screen Notification Permission Prompt (1-Tap Allow) */}
      <AnimatePresence>
        {showPermissionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-[320px] bg-stone-900/95 text-white rounded-[28px] border border-white/20 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-center space-y-4"
              dir="rtl"
            >
              {/* Pulsing Icon */}
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-inner">
                <BellRing className="w-7 h-7 animate-bounce" />
              </div>

              {/* Text info */}
              <div className="space-y-1.5">
                <h3 className="text-sm font-extrabold text-white">
                  فعال‌سازی یادآور نوبت
                </h3>
                <p className="text-xs text-stone-300 leading-relaxed font-normal">
                  «آرایشگاه رویال» می‌خواهد ۱ ساعت پیش از شروع نوبت، پیام یادآوری برای شما ارسال کند.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAllowNotifications}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-stone-950 text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>اجازه می‌دهم (Allow)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPermissionModal(false)}
                  className="w-full py-2 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-stone-400 hover:text-white text-xs font-medium transition-all"
                >
                  فعلاً نه (Don't Allow)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 1-Hour Reminder Toast Notification */}
      <AnimatePresence>
        {reminderToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-14 left-4 right-4 z-50 mx-auto max-w-sm rounded-2xl bg-stone-950/95 backdrop-blur-xl border border-emerald-400/40 p-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.5)] text-right text-white space-y-1.5"
            dir="rtl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                  <BellRing className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{reminderToast.title}</h4>
                  <span className="text-[9px] text-emerald-300 font-medium">{reminderToast.time}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReminderToast(null)}
                className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone-300"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[11px] text-stone-200 leading-relaxed pr-9">
              {reminderToast.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Glass Scrollable Card */}
      <section
        id="profile-glass-card"
        className="relative z-20 mx-auto w-[350px] clay-card rounded-[34px] p-3.5 pt-3 pb-6 flex flex-col mt-1 max-h-[700px] overflow-y-auto no-scrollbar space-y-3"
        dir="rtl"
      >
        {/* Firebase Account Status / Quick Sign-In Banner */}
        {isUserAuthenticated && authUser ? (
          <div className="p-3.5 rounded-2xl bg-[#22262e] text-white shadow-md flex items-center justify-between border-t border-white/20">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0 border border-white/20">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-white truncate">
                    {authUser.displayName || 'کاربر متصل به Google'}
                  </span>
                  <span className="text-[8px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-md font-semibold">
                    متصل
                  </span>
                </div>
                <p className="text-[10px] text-stone-400 truncate" dir="ltr">
                  {authUser.email || 'حساب Google همگام‌سازی‌شده'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                hapticLight();
                await signOutUser();
                setToastMessage('با موفقیت از حساب کاربری خارج شدید');
                setTimeout(() => setToastMessage(null), 2500);
              }}
              title="خروج از حساب گوگل"
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-rose-500/20 text-stone-200 hover:text-rose-300 transition-colors flex items-center gap-1 text-[10px] shrink-0 border border-white/10 active:scale-95 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>خروج</span>
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#22262e] text-white shadow-md border-t border-white/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#fedecb]" />
                <span className="text-xs font-bold text-white">ورود به حساب کاربری رویال</span>
              </div>
              <span className="text-[10px] text-emerald-300 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full font-medium">همگام‌سازی ابری</span>
            </div>
            <p className="text-[11px] text-stone-300 leading-relaxed mb-3">
              برای ذخیره و دسترسی به تاریخچه نوبت‌ها، کاتالوگ مدل‌ها و امتیازات باشگاه، با حساب Google وارد شوید.
            </p>

            <button
              type="button"
              onClick={handleDirectGoogleSignIn}
              disabled={isGoogleSigningIn}
              className="w-full py-2.5 px-4 rounded-xl clay-button-pastel text-stone-900 text-xs font-bold flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isGoogleSigningIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-stone-700" />
                  <span>در حال اتصال به حساب گوگل...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>ورود سریع با حساب گوگل (Google)</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Hidden File Input for Profile Image Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Upper Section: Current User Profile Card */}
        <div className="p-3.5 rounded-[26px] clay-card text-stone-900 relative overflow-hidden shrink-0 text-right">
          <div className="flex items-start gap-3">
            {/* Active Avatar Photo Display with direct camera trigger */}
            <div className="relative shrink-0 group">
              <img
                src={currentAvatarUrl}
                alt={currentCustomer?.name || 'پروفایل'}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover shadow-md ring-2 ring-[#4e3b6e]/30 bg-stone-900"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                title="بارگذاری عکس پروفایل از دستگاه"
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#22262e] hover:bg-[#343a46] text-white flex items-center justify-center shadow-md border-2 border-white transition-all active:scale-90"
              >
                {isUploadingPhoto ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Camera className="w-3 h-3 stroke-[2.5]" />
                )}
              </button>
            </div>

            {/* User Meta & Editing */}
            <div className="flex-1 min-w-0">
              {isEditingInfo ? (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="نام و نام خانوادگی"
                    className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-1 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#4e3b6e]"
                  />
                  <input
                    type="tel"
                    value={tempPhone}
                    onChange={(e) => setTempPhone(e.target.value)}
                    placeholder="شماره همراه"
                    className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-1 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#4e3b6e]"
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={saveInfo}
                      className="px-3 py-1 rounded-xl bg-[#22262e] text-white text-[10px] font-bold"
                    >
                      ذخیره
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingInfo(false)}
                      className="px-2.5 py-1 rounded-xl bg-stone-200 text-stone-700 text-[10px]"
                    >
                      انصراف
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-stone-900 truncate">
                        {currentCustomer?.name || 'کاربر گرامی'}
                      </h2>
                      {!isUserAuthenticated && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-[9px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          مرورگر
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditingInfo(true)}
                      className="text-[10px] text-stone-500 hover:text-stone-900 flex items-center gap-0.5 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3 text-[#4e3b6e]" />
                      <span>{currentCustomer?.name ? 'ویرایش' : 'ثبت نام'}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-stone-600 mt-1 flex items-center gap-1 font-medium">
                    <Phone className="w-3 h-3 text-stone-400" />
                    <span>{currentCustomer?.phone || 'شماره‌ای ثبت نشده است'}</span>
                  </p>

                  <div className="flex items-center justify-between mt-1 pt-1 border-t border-stone-200/60">
                    <p className="text-[10px] text-stone-500">
                      {isUserAuthenticated
                        ? 'همگام‌سازی ابری حساب گوگل فعال است'
                        : 'اطلاعات در حافظه این مرورگر ذخیره است'}
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[10px] font-bold text-[#4e3b6e] hover:underline flex items-center gap-1"
                    >
                      <Upload className="w-2.5 h-2.5" />
                      <span>تغییر عکس</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-stone-200/80 text-[10px]">
            <div className="clay-card-subtle p-2 rounded-xl">
              <span className="text-stone-500 block">سوابق رزرو نوبت</span>
              <p className="font-bold text-stone-900 mt-0.5">
                {toPersianDigits(currentCustomer?.totalVisits || 0)} نوبت ثبت‌شده
              </p>
            </div>
            <div className="clay-card-subtle p-2 rounded-xl">
              <span className="text-stone-500 block">پذیرش سالن</span>
              <p className="font-bold text-stone-900 mt-0.5">صندلی اختصاصی (فعال)</p>
            </div>
          </div>
        </div>

        {/* ─── PROFILE AVATARS SELECTION (4x5) ─── */}
        <div className="mt-3.5 space-y-2.5 text-right">
          {/* Header */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#4e3b6e]" />
              آواتارهای اختصاصی پروفایل
            </span>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5">
            {[
              { key: 'all', label: 'همه آواتارها' },
              { key: 'animals', label: 'حیوانات' },
              { key: 'food', label: 'کافه و خوراکی' },
              { key: 'objects', label: 'اشیاء و فضا' },
              { key: 'nature', label: 'طبیعت' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedCategory(tab.key)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === tab.key
                    ? 'bg-[#22262e] text-white shadow-2xs'
                    : 'tactile-tile-3d text-stone-600 hover:text-stone-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Avatar Grid (4x5) */}
          <div className="clay-card-subtle rounded-2xl p-2.5 sm:p-3">
            <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
              {PRESET_AVATARS.filter(
                (avatar) =>
                  selectedCategory === 'all' || avatar.category === selectedCategory
              ).map((avatar) => {
                const isSelected = currentAvatarUrl === avatar.url;

                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => handleSelectAvatar(avatar.url, avatar.name)}
                    className={`group relative flex flex-col items-center p-1.5 sm:p-2 rounded-xl sm:rounded-2xl transition-all duration-200 text-center cursor-pointer ${
                      isSelected
                        ? 'clay-card ring-2 ring-[#4e3b6e]'
                        : 'tactile-tile-3d hover:bg-white/80 active:scale-95'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={avatar.url}
                        alt={avatar.name}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl object-cover transition-transform duration-200 ${
                          isSelected
                            ? 'scale-105 shadow-md ring-2 ring-[#4e3b6e]/30'
                            : 'group-hover:scale-105 shadow-2xs'
                        }`}
                      />
                      {/* Emoji Badge */}
                      <span className="absolute -top-1 -left-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white text-stone-800 text-[9px] sm:text-xs flex items-center justify-center shadow-2xs border border-white">
                        {avatar.symbol}
                      </span>
                      {/* Selection Checkmark */}
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#4e3b6e] text-white flex items-center justify-center shadow-2xs">
                          <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    {/* Persian Name */}
                    <span
                      className={`text-[10px] sm:text-[11px] mt-1.5 truncate max-w-full font-bold ${
                        isSelected ? 'text-[#4e3b6e]' : 'text-stone-900'
                      }`}
                    >
                      {avatar.name}
                    </span>

                    {/* Category / English label */}
                    <span className="text-[8px] sm:text-[9px] text-stone-500 truncate max-w-full mt-0.5 font-medium">
                      {avatar.englishName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Middle Section: Formula Notes & Preferences */}
        <div className="space-y-2.5 mt-3.5">
          {/* Formula Notes */}
          <div className="p-3 rounded-2xl clay-card-subtle space-y-1.5 text-right">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#4e3b6e]" />
                فرمول اصلاح و ترجیحات نزد آرایشگر
              </span>
              {isEditingNotes ? (
                <button
                  type="button"
                  onClick={saveNotes}
                  className="text-[10px] text-emerald-800 font-bold flex items-center gap-1 bg-emerald-100 px-2.5 py-0.5 rounded-full"
                >
                  <Check className="w-3 h-3" /> ذخیره
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingNotes(true)}
                  className="text-[10px] text-stone-600 font-bold flex items-center gap-1 hover:text-stone-900"
                >
                  <Edit3 className="w-3 h-3 text-[#4e3b6e]" /> ویرایش
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <textarea
                value={tempNotes}
                onChange={(e) => setTempNotes(e.target.value)}
                rows={3}
                className="w-full text-xs text-stone-900 bg-white p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#4e3b6e] font-sans"
              />
            ) : (
              <p className="text-xs text-stone-800 leading-relaxed font-medium bg-white/70 p-2.5 rounded-xl border border-white">
                {currentCustomer?.formulaNotes || 'سایه بغل شماره ۱.۵، بالای سر کار با قیچی، دور مو تمیز و آنکارد دقیق.'}
              </p>
            )}
          </div>

          {/* Notification & Reminder Preferences */}
          <div className="p-3 rounded-2xl clay-card-subtle space-y-2.5 text-right">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-[#4e3b6e]" />
                تنظیمات پیام و یادآورهای نوبت
              </span>
              <span className="text-[9px] text-stone-500 font-medium">سرویس هوشمند رویال</span>
            </div>

            <div className="space-y-2 pt-1 border-t border-stone-200/60">
              {/* 1-Hour Reminder Toggle (with Web Notification Permission Request) */}
              <div 
                onClick={toggleAppointmentReminder}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-stone-50 border border-white shadow-2xs cursor-pointer select-none transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h5 className="text-xs font-bold text-stone-900">یادآور ۱ ساعت پیش از نوبت</h5>
                      {permissionState === 'granted' && enableAppointmentReminder && (
                        <span className="text-[9px] text-emerald-800 bg-emerald-100 font-bold px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          فعال
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-stone-500 mt-0.5">
                      ارسال پیام یادآوری ۱ ساعت پیش از شروع زمان رزرو نوبت
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAppointmentReminder();
                  }}
                  aria-label="فعال یا غیرفعال کردن یادآور نوبت"
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 pointer-events-auto ${
                    enableAppointmentReminder ? 'bg-emerald-500' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                      enableAppointmentReminder ? 'translate-x-0' : '-translate-x-5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* ─── TYPOGRAPHY & FONT SETTINGS ─── */}
          <div className="p-3 rounded-2xl clay-card-subtle space-y-2.5 text-right">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-[#5a4a58]" />
                قلم و تایپوگرافی سامانه
              </span>
              <span className="text-[10px] text-stone-500 font-medium">سفارشی‌سازی ظاهر</span>
            </div>

            <div 
              onClick={() => setIsFontModalOpen(true)}
              className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-stone-50 border border-white shadow-2xs cursor-pointer select-none transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#5a4a58] flex items-center justify-center shrink-0">
                  <Type className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900" style={{ fontFamily: currentFont.fontFamily }}>
                      {currentFont.nameFa}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#5a4a58] text-white">
                      {currentFont.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">
                    {currentFont.description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFontModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold shrink-0 transition-colors cursor-pointer"
              >
                تغییر قلم
              </button>
            </div>
          </div>

          {/* Account & Session Management Section */}
          <div className="p-3 rounded-2xl clay-card-subtle border border-white space-y-2.5 shadow-2xs text-right">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#4e3b6e]" />
                مدیریت حساب و نشست کاربری
              </span>
              <span className="text-[9px] text-stone-500 font-medium">پروتکل امن Google</span>
            </div>

            {isUserAuthenticated && authUser ? (
              <div className="pt-1 border-t border-stone-200/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-stone-900">
                    {authUser.displayName || 'کاربر گرامی رویال'}
                  </p>
                  <p className="text-[10px] text-stone-500 font-mono mt-0.5" dir="ltr">
                    {authUser.email || 'متصل به حساب گوگل'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    hapticLight();
                    await signOutUser();
                    setToastMessage('از حساب ابری خارج شدید؛ مشخصات و نوبت‌های شما روی حافظه مرورگر حفظ شد');
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>خروج از حساب</span>
                </button>
              </div>
            ) : (
              <div className="pt-1 border-t border-stone-200/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-stone-900">حساب محلی روی این مرورگر</p>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    سوابق و نوبت‌ها روی مرورگر شما امن است.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => openClientAuthModal()}
                  className="px-3.5 py-2 rounded-xl bg-[#22262e] hover:bg-[#343a46] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0"
                >
                  <LogIn className="w-4 h-4 text-[#fedecb]" />
                  <span>اتصال به Google</span>
                </button>
              </div>
            )}
          </div>

          {/* Enamad Electronic Trust Seal */}
          <div className="pt-2 pb-1 flex justify-center">
            <EnamadBadge variant="badge" size="sm" />
          </div>
        </div>
      </section>

      {/* Font & Typography Selector Modal */}
      <FontSelectorModal
        isOpen={isFontModalOpen}
        onClose={() => setIsFontModalOpen(false)}
      />
    </AtelierShell>
  );
};

