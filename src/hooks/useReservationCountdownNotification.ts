import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Appointment } from '../types';
import { playNotificationChime } from '../utils/soundUtils';
import { toPersianDigits, getCurrentSolarDateInfo } from '../utils/dateUtils';

export type CountdownStatusState = 'upcoming' | 'almost_time' | 'happening_now' | 'past_due';

export interface CountdownTimeRemaining {
  days: number;
  hours: string;
  minutes: string;
  seconds: string;
  totalSeconds: number;
  isZero: boolean;
  isExpired: boolean;
  label: string;
  state: CountdownStatusState;
  stateLabel: string;
}

export interface CountdownToastNotification {
  id: string;
  title: string;
  body: string;
  appointment: Appointment | null;
  timestamp: number;
  actionLabel?: string;
  onAction?: () => void;
}

export interface UseReservationCountdownOptions {
  appointment?: Appointment | null;
  customerName?: string;
  enabled?: boolean;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
  browserNotificationsEnabled?: boolean;
  onZeroReached?: (appointment: Appointment) => void;
  onActionClick?: (appointment: Appointment) => void;
}

export interface UseReservationCountdownReturn {
  timeRemaining: CountdownTimeRemaining;
  activeToast: CountdownToastNotification | null;
  permissionStatus: NotificationPermission | 'unsupported';
  isPermissionGranted: boolean;
  requestBrowserPermission: () => Promise<boolean>;
  dismissToast: () => void;
  triggerManualZeroAlert: (customAppointment?: Appointment) => void;
}

// Global registry of triggered appointment IDs in the current session to avoid repeat spam
const globalTriggeredAlertSet = new Set<string>();

export function useReservationCountdownNotification({
  appointment = null,
  customerName = 'مشتری گرامی',
  enabled = true,
  soundEnabled = true,
  vibrationEnabled = true,
  browserNotificationsEnabled = true,
  onZeroReached,
  onActionClick,
}: UseReservationCountdownOptions = {}): UseReservationCountdownReturn {
  const [ticks, setTicks] = useState<number>(0);
  const [activeToast, setActiveToast] = useState<CountdownToastNotification | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');

  const onZeroReachedRef = useRef(onZeroReached);
  onZeroReachedRef.current = onZeroReached;

  const onActionClickRef = useRef(onActionClick);
  onActionClickRef.current = onActionClick;

  // Initialize browser notification permission status safely (SSR & iFrame safe)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        setPermissionStatus(Notification.permission);
      } catch (err) {
        console.debug('Notification permission check not accessible:', err);
        setPermissionStatus('unsupported');
      }
    } else {
      setPermissionStatus('unsupported');
    }
  }, []);

  // Request browser notification permission
  const requestBrowserPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermissionStatus('unsupported');
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      return permission === 'granted';
    } catch (err) {
      console.warn('Failed to request browser notification permission:', err);
      return false;
    }
  }, []);

  // Internal dispatcher for triggering zero notifications (Browser, Toast, Audio, Haptics)
  const fireZeroAlert = useCallback(
    (targetApt: Appointment | null) => {
      const aptTitle = targetApt?.service?.name || 'اصلاح و پیرایش اختصاصی';
      const barber = targetApt?.barberName || 'آرایشگر اختصاصی شما';
      const time = targetApt?.startTime ? toPersianDigits(targetApt.startTime) : 'اکنون';
      const client = targetApt?.customerName || customerName;

      const notifTitle = '✂️ نوبت پیرایش شما فرا رسید!';
      const notifBody = `${client} عزیز، نوبت «${aptTitle}» با ${barber} هم‌اکنون (ساعت ${time}) آغاز شده است. به سالن رویال خوش آمدید.`;

      // 1. Play harmonic audio chime
      if (soundEnabled) {
        playNotificationChime();
      }

      // 2. Physical device vibration (if supported)
      if (vibrationEnabled && typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
        try {
          navigator.vibrate([200, 100, 200, 100, 300]);
        } catch {
          // ignore if vibration policy rejects
        }
      }

      // 3. Native Browser Notification (if granted & supported)
      if (browserNotificationsEnabled && typeof window !== 'undefined' && 'Notification' in window) {
        try {
          if (Notification.permission === 'granted') {
            const browserNotif = new Notification(notifTitle, {
              body: notifBody,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              tag: `reservation-zero-${targetApt?.id || Date.now()}`,
              requireInteraction: true,
              lang: 'fa-IR',
              dir: 'rtl',
            });

            browserNotif.onclick = () => {
              window.focus();
              browserNotif.close();
              if (targetApt && onActionClickRef.current) {
                onActionClickRef.current(targetApt);
              }
            };
          }
        } catch (e) {
          console.debug('Browser native notification dispatch failed (handled gracefully with UI Toast):', e);
        }
      }

      // 4. In-App UI Toast Message
      const newToast: CountdownToastNotification = {
        id: `toast-zero-${targetApt?.id || Date.now()}`,
        title: notifTitle,
        body: notifBody,
        appointment: targetApt,
        timestamp: Date.now(),
        actionLabel: 'مشاهده کارت پرواز و ورود به سالن',
        onAction: () => {
          if (targetApt && onActionClickRef.current) {
            onActionClickRef.current(targetApt);
          }
          setActiveToast(null);
        },
      };

      setActiveToast(newToast);

      // Call consumer callback
      if (targetApt && onZeroReachedRef.current) {
        onZeroReachedRef.current(targetApt);
      }
    },
    [browserNotificationsEnabled, customerName, soundEnabled, vibrationEnabled]
  );

  // Manual trigger for testing / demo
  const triggerManualZeroAlert = useCallback(
    (customAppointment?: Appointment) => {
      const apt = customAppointment || appointment || {
        id: `mock-demo-apt-${Date.now()}`,
        appointmentNumber: 'ROYAL-901',
        customerName,
        service: {
          id: 'serv-demo',
          name: 'اصلاح مو و پیرایش سر (VIP)',
          durationMinutes: 45,
          price: 450000,
        },
        barberName: 'علی رضایی',
        chairName: 'صندلی رویال ۱',
        startTime: '16:00',
        endTime: '16:45',
        status: 'in_progress',
        dayNumber: 22,
        date: '۲۲ مهر',
      } as unknown as Appointment;

      fireZeroAlert(apt);
    },
    [appointment, customerName, fireZeroAlert]
  );

  // Interval timer ticking every second
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      setTicks((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled]);

  // Compute countdown and evaluate zero arrival
  const timeRemaining = useMemo<CountdownTimeRemaining>(() => {
    if (!appointment) {
      return {
        days: 0,
        hours: '00',
        minutes: '00',
        seconds: '00',
        totalSeconds: 0,
        isZero: true,
        isExpired: false,
        label: 'نوبت فعالی وجود ندارد',
        state: 'upcoming',
        stateLabel: 'پیش‌رو',
      };
    }

    const now = new Date();
    const currentSolar = getCurrentSolarDateInfo(now);
    const [aptHours, aptMinutes] = (appointment.startTime || '15:30').split(':').map(Number);
    const target = new Date();
    const targetDay = appointment.dayNumber || currentSolar.dayNumber;
    const diffDays = Math.max(0, targetDay - currentSolar.dayNumber);
    target.setDate(target.getDate() + diffDays);
    target.setHours(aptHours || 15, aptMinutes || 30, 0, 0);

    const diffMs = target.getTime() - now.getTime();
    const totalSecs = Math.floor(diffMs / 1000);

    // If appointment is marked in_progress or started within normal session duration
    if (appointment.status === 'in_progress') {
      return {
        days: 0,
        hours: '00',
        minutes: '00',
        seconds: '00',
        totalSeconds: 0,
        isZero: true,
        isExpired: true,
        label: 'هم‌اکنون در حال برگزاری',
        state: 'happening_now',
        stateLabel: 'الان وقتشه',
      };
    }

    if (totalSecs <= 0) {
      const isStillHappening = totalSecs > -3600; // Within 1 hr of scheduled start
      return {
        days: 0,
        hours: '00',
        minutes: '00',
        seconds: '00',
        totalSeconds: 0,
        isZero: true,
        isExpired: true,
        label: isStillHappening ? 'هم‌اکنون در حال برگزاری' : 'موعد سپری‌شده',
        state: isStillHappening ? 'happening_now' : 'past_due',
        stateLabel: isStillHappening ? 'الان وقتشه' : 'گذشته از موعد',
      };
    }

    const days = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;

    let dynamicState: CountdownStatusState = 'upcoming';
    let dynamicStateLabel = 'پیش‌رو';
    let dynamicLabel = 'نوبت پیش‌رو';

    if (totalSecs <= 1800) {
      // Under 30 minutes
      dynamicState = 'almost_time';
      dynamicStateLabel = 'نزدیک به موعد';
      dynamicLabel = 'موعد نزدیک (کمتر از ۳۰ دقیقه)';
    } else if (totalSecs <= 7200) {
      // Under 2 hours
      dynamicState = 'almost_time';
      dynamicStateLabel = 'نزدیک به موعد';
      dynamicLabel = 'موعد بسیار نزدیک';
    } else {
      dynamicState = 'upcoming';
      dynamicStateLabel = 'پیش‌رو';
      dynamicLabel = 'نوبت پیش‌رو';
    }

    return {
      days,
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
      totalSeconds: totalSecs,
      isZero: false,
      isExpired: false,
      label: dynamicLabel,
      state: dynamicState,
      stateLabel: dynamicStateLabel,
    };
  }, [appointment, ticks]);

  // Watch for the moment countdown reaches 0
  useEffect(() => {
    if (!enabled || !appointment) return;

    // Trigger only when appointment is confirmed/reserved and countdown just reached 0
    if (timeRemaining.totalSeconds === 0) {
      const aptKey = `apt-${appointment.id}-${appointment.startTime}-${appointment.dayNumber || 22}`;
      
      if (!globalTriggeredAlertSet.has(aptKey)) {
        globalTriggeredAlertSet.add(aptKey);
        fireZeroAlert(appointment);
      }
    }
  }, [enabled, appointment, timeRemaining.totalSeconds, fireZeroAlert]);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  return {
    timeRemaining,
    activeToast,
    permissionStatus,
    isPermissionGranted: permissionStatus === 'granted',
    requestBrowserPermission,
    dismissToast,
    triggerManualZeroAlert,
  };
}
