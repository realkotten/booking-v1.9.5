import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import {
  Bell,
  BellRing,
  Calendar,
  ShoppingBag,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCheck,
  Trash2,
  X,
  Maximize2,
  Coffee,
  Car,
  Scissors,
  Phone,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import { useAtelier } from '../../store/AtelierContext';
import { StudioNotification } from '../../types';
import { toPersianDigits, getCurrentSolarDateInfo } from '../../utils/dateUtils';
import { playNotificationChime } from '../../utils/soundUtils';
import { useUpcomingAppointment } from '../../hooks/useUpcomingAppointment';
import { hapticLight, hapticStepAdvance } from '../../utils/hapticUtils';

interface DynamicIslandNotificationCenterProps {
  onNavigateToTab?: (tab: string) => void;
}

export const DynamicIslandNotificationCenter: React.FC<DynamicIslandNotificationCenterProps> = ({
  onNavigateToTab,
}) => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotification,
    clearAllNotifications,
    liveAlertNotification,
    dismissLiveAlertNotification,
    portalMode,
    studio,
    appointments,
    currentCustomer,
  } = useAtelier();

  // Mode state: 'compact' | 'alert' | 'expanded' | 'fullscreen'
  const [mode, setMode] = useState<'compact' | 'alert' | 'expanded' | 'fullscreen'>('compact');
  const [activeIslandTab, setActiveIslandTab] = useState<'status' | 'actions' | 'notifications'>('status');
  const [filter, setFilter] = useState<'all' | 'appointment' | 'order' | 'broadcast'>('all');
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  const alertTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Retrieve current active or nearest upcoming appointment
  const upcomingAppointment = useUpcomingAppointment(appointments, currentCustomer);

  // Keep live time updated every second in English digits
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(currentTime.getHours()).padStart(2, '0');
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');
  const seconds = String(currentTime.getSeconds()).padStart(2, '0');
  const liveClockEn = `${hours}:${minutes}:${seconds}`;

  // Unread count
  const unreadCount = notifications.filter((n) => !n.read && !n.isRead).length;

  // React to incoming live alert (Dynamic Island in-place morph banner)
  useEffect(() => {
    if (liveAlertNotification) {
      playNotificationChime();
      setMode('alert');
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
      alertTimerRef.current = setTimeout(() => {
        dismissLiveAlertNotification();
        setMode((prev) => (prev === 'alert' ? 'compact' : prev));
      }, 5000);
    }
    return () => {
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    };
  }, [liveAlertNotification, dismissLiveAlertNotification]);

  // Filtered notifications
  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'appointment') return n.type.includes('appointment');
    if (filter === 'order') return n.type.includes('order');
    if (filter === 'broadcast') return !n.type.includes('appointment') && !n.type.includes('order');
    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_confirmed':
      case 'appointment_new':
        return <Calendar className="w-4 h-4 text-emerald-400" />;
      case 'order_update':
        return <ShoppingBag className="w-4 h-4 text-emerald-300" />;
      case 'concierge_message':
        return <Coffee className="w-4 h-4 text-emerald-400" />;
      case 'valet_ready':
        return <Car className="w-4 h-4 text-emerald-300" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'appointment_confirmed':
      case 'appointment_new':
        return 'نوبت آتلیه';
      case 'order_update':
        return 'سفارش بوتیک';
      case 'concierge_message':
        return 'کانسیرج رویال';
      default:
        return 'اطلاعیه استودیو';
    }
  };

  const handleNotificationAction = (notif: StudioNotification) => {
    markNotificationAsRead(notif.id);
    if (notif.link && onNavigateToTab) {
      onNavigateToTab(notif.link);
      setMode('compact');
    }
  };

  const handleSwipeDismiss = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, notifId: string) => {
    if (Math.abs(info.offset.x) > 75 || Math.abs(info.velocity.x) > 400) {
      clearNotification(notifId);
    }
  };

  const handleQuickAction = (tabKey: string) => {
    hapticStepAdvance();
    if (onNavigateToTab) {
      onNavigateToTab(tabKey);
    }
    setMode('compact');
  };

  return (
    <div className="relative flex justify-center items-center z-50">
      {/* Click outside to collapse */}
      {mode === 'expanded' && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity"
          onClick={() => {
            hapticLight();
            setMode('compact');
          }}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          APPLE DYNAMIC ISLAND IN-PLACE EXPANDING CAPSULE
          Strictly respects viewport-fit=cover & safe-area-inset-top
         ───────────────────────────────────────────────────────────── */}
      <motion.div
        id="ios-dynamic-island-clock"
        role="button"
        tabIndex={0}
        aria-label="مرکز وضعیت، رزرو و اعلان‌های رویال آتلیه"
        style={{
          fontFamily: 'var(--app-font)',
          transformOrigin: 'top center',
        }}
        animate={{
          width: mode === 'compact' ? 150 : mode === 'alert' ? 320 : 360,
          borderRadius: mode === 'compact' ? 9999 : mode === 'alert' ? 24 : 28,
        }}
        transition={{
          type: 'spring',
          stiffness: 340,
          damping: 28,
          mass: 0.8,
        }}
        title="ساعت زنده، وضعیت رزرو و مرکز اعلان‌ها"
        className={`select-none backdrop-blur-2xl transition-colors duration-200 ${
          mode === 'compact'
            ? 'h-[33px] w-[150px] overflow-hidden bg-white/50 dark:bg-white/20 border border-white/60 shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:border-white/80 flex items-center justify-center gap-1.5 cursor-pointer hover:bg-white/60 active:scale-[0.98] px-2 mb-1.5'
            : mode === 'alert'
            ? 'fixed top-[max(0.5rem,calc(env(safe-area-inset-top,0px)+4px))] left-0 right-0 mx-auto z-50 h-[44px] overflow-hidden w-[320px] max-w-[calc(100vw-32px)] bg-stone-950/95 border border-emerald-400/40 shadow-[0_12px_36px_rgba(16,185,129,0.3)] flex items-center justify-between px-3 cursor-pointer'
            : mode === 'expanded'
            ? 'fixed top-[max(0.5rem,calc(env(safe-area-inset-top,0px)+4px))] left-0 right-0 mx-auto z-50 w-[360px] max-w-[calc(100vw-32px)] max-h-[85vh] overflow-y-auto bg-stone-950/95 border border-white/20 shadow-[0_24px_70px_rgba(0,0,0,0.75)] p-4 flex flex-col text-white'
            : 'h-0 w-0 opacity-0 pointer-events-none'
        }`}
        onClick={() => {
          if (mode === 'compact' || mode === 'alert') {
            hapticLight();
            setMode('expanded');
          }
        }}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && (mode === 'compact' || mode === 'alert')) {
            e.preventDefault();
            hapticLight();
            setMode('expanded');
          }
        }}
      >
        <AnimatePresence mode="wait">
          {/* ─── 1. COMPACT STATE CONTENT (Live Digital Clock + Status Indicator) ─── */}
          {mode === 'compact' && (
            <motion.div
              key="compact-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="flex items-center justify-center gap-1.5 w-full h-full px-1 pointer-events-none"
            >
              {/* Emerald Green Notification Indicator / Live Salon Pulse */}
              {unreadCount > 0 ? (
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-80" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)]" />
                </span>
              ) : upcomingAppointment ? (
                <span className="w-2 h-2 rounded-full bg-[#bf5938] shadow-[0_0_6px_rgba(191,89,56,0.9)] animate-pulse shrink-0" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.7)] shrink-0" />
              )}

              {/* Black Font Live Digital Time */}
              <span
                style={{
                  fontFamily: 'Arial, sans-serif',
                }}
                className="font-bold tracking-tight text-stone-900 tabular-nums text-[16px] text-center not-italic"
                dir="ltr"
              >
                {liveClockEn}
              </span>

              {/* Status Badge: Unread Counter or Quick Icon */}
              {unreadCount > 0 ? (
                <span className="px-1.5 py-0.2 bg-emerald-500 text-white font-black text-[9px] rounded-full leading-none shadow-xs">
                  {unreadCount}
                </span>
              ) : upcomingAppointment ? (
                <Scissors className="w-3.5 h-3.5 text-[#bf5938]" />
              ) : (
                <Bell className="w-4 h-4 text-stone-700 opacity-75" />
              )}
            </motion.div>
          )}

          {/* ─── 2. LIVE ALERT STATE CONTENT (Apple Dynamic Island Live Notification) ─── */}
          {mode === 'alert' && (
            <motion.div
              key="alert-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-between w-full h-full"
              dir="rtl"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 text-emerald-400">
                  {liveAlertNotification ? (
                    getNotificationIcon(liveAlertNotification.type)
                  ) : (
                    <BellRing className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="text-right truncate flex flex-col">
                  <span className="text-[11px] font-bold text-white truncate">
                    {liveAlertNotification?.title || 'اعلان زنده آتلیه'}
                  </span>
                  <span className="text-[9px] text-emerald-200/90 truncate">
                    {liveAlertNotification?.message || 'برای باز کردن ضربه بزنید'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 pl-1" dir="ltr">
                <span className="text-[11px] font-mono text-white font-bold tabular-nums">
                  {liveClockEn.slice(0, 5)}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissLiveAlertNotification();
                    setMode('compact');
                  }}
                  className="w-5 h-5 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white/80 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── 3. EXPANDED NATIVE ISLAND CONTENT (Status, Booking Progress & Quick Actions) ─── */}
          {mode === 'expanded' && (
            <motion.div
              key="expanded-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col w-full text-white space-y-3"
              dir="rtl"
            >
              {/* Top Navigation & Status Bar */}
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{studio?.name || 'رویال آتلیه'}</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-400/30">
                        فعال
                      </span>
                    </h3>
                    <p className="text-[9px] text-stone-300">داینامیک آیلند هوشمند استودیو</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5" dir="ltr">
                  <span className="text-xs font-mono font-bold text-white tabular-nums px-2 py-0.5 bg-white/10 rounded-lg border border-white/20 shadow-xs">
                    {liveClockEn}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMode('fullscreen')}
                    title="تمام صفحه (Full Screen)"
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('compact')}
                    title="جمع کردن"
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Mode Segmented Switcher: Status | Quick Actions | Notifications */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-white/10 rounded-xl text-center text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => {
                    hapticLight();
                    setActiveIslandTab('status');
                  }}
                  className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeIslandTab === 'status'
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  وضعیت نوبت
                </button>
                <button
                  type="button"
                  onClick={() => {
                    hapticLight();
                    setActiveIslandTab('actions');
                  }}
                  className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeIslandTab === 'actions'
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  اقدامات سریع
                </button>
                <button
                  type="button"
                  onClick={() => {
                    hapticLight();
                    setActiveIslandTab('notifications');
                  }}
                  className={`py-1.5 rounded-lg transition-colors cursor-pointer relative ${
                    activeIslandTab === 'notifications'
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  اعلان‌ها
                  {unreadCount > 0 && (
                    <span className="inline-block mr-1 w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                </button>
              </div>

              {/* TAB 1: CURRENT STATUS & BOOKING PROGRESS */}
              {activeIslandTab === 'status' && (
                <div className="space-y-2.5 animate-fadeIn">
                  {upcomingAppointment ? (
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-stone-900 to-stone-800 border border-emerald-400/30 space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          نوبت رزرو شده شما
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                          {upcomingAppointment.date || 'امروز'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold">
                        <span>{upcomingAppointment.service?.name || 'سرویس اصلاح مو'}</span>
                        <span className="text-stone-300 font-mono" dir="ltr">
                          {upcomingAppointment.startTime}
                        </span>
                      </div>

                      <p className="text-[10px] text-stone-300">
                        آرایشگر انتخابی: {upcomingAppointment.barberName}
                      </p>

                      <div className="pt-1 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuickAction('my_bookings')}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-stone-950 font-black text-[10px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>مشاهده کارت ورود دیجیتال</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-stone-900/90 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-xs font-bold text-white">سالن رویال · آماده پذیرش</span>
                        </div>
                        <span className="text-[10px] text-emerald-300">نوبت‌دهی آنلاین ۲۴h</span>
                      </div>
                      <p className="text-[10px] text-stone-300 leading-relaxed">
                        برای اصلاح امروز یا روزهای آتی می‌توانید در کمتر از ۱ دقیقه زمان دلخواه خود را رزرو کنید.
                      </p>

                      {/* 4-Step Booking Progression Trail */}
                      <div className="pt-1">
                        <div className="text-[9px] text-stone-400 mb-1 font-semibold">مراحل رزرو نوبت هوشمند:</div>
                        <div className="grid grid-cols-4 gap-1 text-[8px] text-center font-bold">
                          <span className="py-1 rounded-md bg-white/20 text-emerald-300">۱. سرویس</span>
                          <span className="py-1 rounded-md bg-white/10 text-stone-300">۲. آرایشگر</span>
                          <span className="py-1 rounded-md bg-white/10 text-stone-300">۳. زمان</span>
                          <span className="py-1 rounded-md bg-white/10 text-stone-300">۴. تایید</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleQuickAction('book')}
                        className="w-full mt-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#bf5938] to-[#a34426] hover:brightness-110 text-white font-black text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                      >
                        <Scissors className="w-3.5 h-3.5" />
                        <span>شروع رزرو نوبت جدید</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: NATIVE QUICK ACTIONS HUB */}
              {activeIslandTab === 'actions' && (
                <div className="grid grid-cols-2 gap-2 pt-1 animate-fadeIn">
                  <button
                    type="button"
                    onClick={() => handleQuickAction('book')}
                    className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 flex flex-col items-start gap-1.5 text-right transition-all hover:scale-[1.02] cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-xl bg-[#bf5938]/30 text-[#fedecb] flex items-center justify-center">
                      <Scissors className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white group-hover:text-amber-200">
                      رزرو نوبت جدید
                    </span>
                    <span className="text-[9px] text-stone-300">انتخاب سرویس و ساعت</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickAction('my_bookings')}
                    className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 flex flex-col items-start gap-1.5 text-right transition-all hover:scale-[1.02] cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white group-hover:text-blue-200">
                      پیگیری نوبت‌ها
                    </span>
                    <span className="text-[9px] text-stone-300">نوبت‌های رزرو شده شما</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickAction('concierge')}
                    className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 flex flex-col items-start gap-1.5 text-right transition-all hover:scale-[1.02] cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                      <Coffee className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white group-hover:text-emerald-200">
                      کانسیرج و پذیرایی
                    </span>
                    <span className="text-[9px] text-stone-300">درخواست قهوه و ولت</span>
                  </button>

                  <a
                    href={`tel:${studio?.phone || '02122000000'}`}
                    onClick={() => setMode('compact')}
                    className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 flex flex-col items-start gap-1.5 text-right transition-all hover:scale-[1.02] cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white group-hover:text-purple-200">
                      تماس تلفنی با سالن
                    </span>
                    <span className="text-[9px] text-stone-300">{studio?.phone || 'پشتیبانی مستقیم'}</span>
                  </a>
                </div>
              )}

              {/* TAB 3: NOTIFICATIONS FEED & HISTORY */}
              {activeIslandTab === 'notifications' && (
                <div className="space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1">
                      {(['all', 'appointment', 'order'] as const).map((filterType) => (
                        <button
                          key={filterType}
                          type="button"
                          onClick={() => setFilter(filterType)}
                          className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                            filter === filterType
                              ? 'bg-emerald-500 text-stone-950 font-bold'
                              : 'bg-white/10 text-stone-300 hover:text-white'
                          }`}
                        >
                          {filterType === 'all'
                            ? 'همه'
                            : filterType === 'appointment'
                            ? 'نوبت‌ها'
                            : 'سفارش‌ها'}
                        </button>
                      ))}
                    </div>

                    {notifications.length > 0 && (
                      <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={markAllNotificationsAsRead}
                            className="flex items-center gap-0.5 text-emerald-400 hover:underline cursor-pointer"
                          >
                            <CheckCheck className="w-3 h-3" />
                            <span>خوانده شد</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={clearAllNotifications}
                          className="text-stone-400 hover:text-rose-400 p-0.5 cursor-pointer"
                          title="حذف همه"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
                    {filteredNotifications.length === 0 ? (
                      <div className="py-6 text-center text-stone-400 text-xs">
                        <Bell className="w-6 h-6 mx-auto mb-1.5 opacity-40 text-emerald-400" />
                        <p>هیچ اعلانی در این بخش وجود ندارد</p>
                      </div>
                    ) : (
                      <AnimatePresence initial={false}>
                        {filteredNotifications.slice(0, 4).map((notif) => {
                          const isUnread = !notif.read && !notif.isRead;
                          return (
                            <motion.div
                              key={notif.id}
                              drag="x"
                              dragConstraints={{ left: 0, right: 0 }}
                              dragElastic={0.6}
                              onDragEnd={(e, info) => handleSwipeDismiss(e, info, notif.id)}
                              onClick={() => handleNotificationAction(notif)}
                              className={`p-2.5 rounded-xl border transition-colors cursor-pointer flex items-start gap-2 ${
                                isUnread
                                  ? 'bg-stone-900 border-emerald-400/40 shadow-sm'
                                  : 'bg-stone-900/80 border-white/10 hover:bg-stone-800'
                              }`}
                            >
                              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                                {getNotificationIcon(notif.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[11px] font-bold text-white truncate">
                                    {notif.title}
                                  </span>
                                  <span className="text-[8px] text-stone-400 shrink-0">
                                    {notif.timestamp}
                                  </span>
                                </div>
                                <p className="text-[10px] text-stone-300 mt-0.5 line-clamp-1">
                                  {notif.message}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    )}
                  </div>
                </div>
              )}

              {/* Apple Dynamic Island Pull Down Handle to Full Screen */}
              <motion.div
                onClick={() => {
                  hapticLight();
                  setMode('fullscreen');
                }}
                className="pt-1.5 flex flex-col items-center justify-center gap-1 cursor-pointer group/pulldown hover:bg-white/5 rounded-xl py-1 transition-colors"
                whileHover={{ y: 2 }}
                whileTap={{ y: 4 }}
              >
                <div className="w-10 h-1 bg-stone-500 group-hover/pulldown:bg-emerald-400 rounded-full transition-colors" />
                <div className="flex items-center gap-1 text-[9px] text-stone-400 group-hover/pulldown:text-emerald-300 font-medium">
                  <ChevronDown className="w-3 h-3 animate-bounce" />
                  <span>برای پنل کامل به پایین بکشید</span>
                  <ChevronDown className="w-3 h-3 animate-bounce" />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ─────────────────────────────────────────────────────────────
          4. FULL SCREEN NOTIFICATION CENTER HUB (When Pulled Down)
         ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mode === 'fullscreen' && (
          <motion.div
            id="ios-notification-center-fullscreen"
            className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-2xl text-white flex flex-col justify-between p-5 overflow-hidden"
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            dir="rtl"
            style={{
              paddingTop: 'max(1.25rem, calc(env(safe-area-inset-top, 0px) + 0.5rem))',
            }}
          >
            {/* Top Navigation Bar */}
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">مرکز اعلان‌های رویال آتلیه</h2>
                    <p className="text-[10px] text-stone-400">Royal Barber Notification Center</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      hapticLight();
                      setMode('expanded');
                    }}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer"
                    title="بازگشت به Dynamic Island"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      hapticLight();
                      setMode('compact');
                    }}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer"
                    title="بستن"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Large Digital Clock */}
              <div className="bg-black/30 backdrop-blur-xl border border-white/15 rounded-3xl p-4 text-center shadow-lg">
                <div
                  className="text-3xl font-extrabold tracking-tight text-white font-mono tabular-nums drop-shadow-sm"
                  dir="ltr"
                  style={{ fontFamily: 'Arial, sans-serif' }}
                >
                  {liveClockEn}
                </div>
                <div className="text-xs text-emerald-300/90 font-medium mt-1">
                  امروز · ساعت رسمی هماهنگ استودیو
                </div>
              </div>

              {/* Quick Hub Navigation Cards */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleQuickAction('book')}
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-right cursor-pointer"
                >
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <Scissors className="w-4 h-4 text-amber-300" />
                    <span>رزرو نوبت پیرایش</span>
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1 block">انتخاب ساعت و استایل</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAction('my_bookings')}
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-right cursor-pointer"
                >
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <Calendar className="w-4 h-4 text-emerald-300" />
                    <span>پیگیری نوبت‌ها</span>
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1 block">کارت ورود و جزییات</span>
                </button>
              </div>

              {/* Notifications List Header */}
              <div className="flex items-center justify-between pt-2">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>تمام پیام‌ها و اعلان‌ها</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-stone-950 text-[10px] font-black">
                      {toPersianDigits(unreadCount)} جدید
                    </span>
                  )}
                </h3>
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>خوانده شد همه</span>
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Notifications List */}
            <div className="relative z-10 flex-1 overflow-y-auto my-3 space-y-2 pr-1">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-stone-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-emerald-400" />
                  <p className="text-xs">هیچ اعلانی در سیستم ثبت نشده است</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const isUnread = !notif.read && !notif.isRead;
                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationAction(notif)}
                      className={`p-3 rounded-2xl border transition-colors cursor-pointer flex items-start gap-3 ${
                        isUnread
                          ? 'bg-stone-900 border-emerald-400/40 shadow-sm'
                          : 'bg-stone-900/80 border-white/10 hover:bg-stone-800'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-white truncate">
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-stone-400 shrink-0">
                            {notif.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-200 mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Actions */}
            <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  hapticLight();
                  setMode('compact');
                }}
                className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                بستن و بازگشت
              </button>
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllNotifications}
                  className="py-2.5 px-4 rounded-xl text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 text-xs font-bold transition-colors cursor-pointer"
                >
                  حذف تاریخچه
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
