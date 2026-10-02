/**
 * Service Worker & Web Push Notification Client Manager
 * Handles Service Worker registration, Native Web Push subscriptions,
 * and dispatching appointment & concierge reminders.
 */

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{ action: string; title: string }>;
}

let swRegistration: ServiceWorkerRegistration | null = null;

/**
 * Register Service Worker for PWA and Web Push
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('[SW] Service Workers not supported in this environment');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    swRegistration = registration;
    console.log('[SW] Service Worker registered with scope:', registration.scope);

    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const installingWorker = registration.installing;
      if (installingWorker) {
        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[SW] New version available, reloading controller');
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.warn('[SW] Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Get active Service Worker registration
 */
export async function getSWRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (swRegistration) return swRegistration;
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      swRegistration = await navigator.serviceWorker.ready;
      return swRegistration;
    } catch (e) {
      console.warn('[SW] ready check failed:', e);
    }
  }
  return null;
}

/**
 * Request notification permission from browser
 */
export async function requestPushPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.warn('[SW] Error requesting notification permission:', error);
    return Notification.permission;
  }
}

/**
 * Trigger a native Web Push or Service Worker notification
 */
export async function sendNativeNotification(payload: NotificationPayload): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    const perm = await requestPushPermission();
    if (perm !== 'granted') return false;
  }

  const reg = await getSWRegistration();

  if (reg && 'showNotification' in reg) {
    try {
      const options = {
        body: payload.body,
        icon: payload.icon || '/icon.svg',
        badge: payload.badge || '/icon.svg',
        vibrate: [150, 75, 150],
        tag: payload.tag || 'royal-alert',
        renotify: true,
        data: payload.data || { url: '/' },
        dir: 'rtl' as NotificationDirection,
        lang: 'fa',
        actions: payload.actions || [
          { action: 'view', title: 'مشاهده' },
          { action: 'close', title: 'بستن' },
        ],
      } as NotificationOptions;

      await reg.showNotification(payload.title, options);
      return true;
    } catch (err) {
      console.warn('[SW] Registration showNotification fallback:', err);
    }
  }

  // Fallback to Window Notification API
  try {
    new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icon.svg',
      tag: payload.tag || 'royal-alert',
    });
    return true;
  } catch (e) {
    console.warn('[SW] Window Notification fallback failed:', e);
    return false;
  }
}

/**
 * Schedule native appointment reminder via Service Worker
 */
export async function scheduleNativeAppointmentReminder(
  minutesBefore: number,
  clientName: string,
  timeString: string
): Promise<void> {
  const reg = await getSWRegistration();
  const payload = {
    title: 'یادآور نوبت آرایشگاه رویال',
    body: `جناب ${clientName}، ۱ ساعت تا شروع آیین اصلاح و پیرایش شما در ساعت ${timeString} باقی مانده است.`,
    tag: `appointment-reminder-${Date.now()}`,
    data: {
      type: 'appointment_reminder',
      time: timeString,
    },
  };

  if (reg && reg.active) {
    reg.active.postMessage({
      type: 'SHOW_NATIVE_NOTIFICATION',
      payload,
    });
  } else {
    sendNativeNotification(payload);
  }
}

/**
 * Listen for messages sent from Service Worker when notifications are clicked
 */
export function setupServiceWorkerMessageListener(
  onNotificationClicked: (data: { action: string; targetUrl: string; notificationType: string; data?: unknown }) => void
): () => void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return () => {};
  }

  const handler = (event: MessageEvent) => {
    if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
      onNotificationClicked(event.data.payload);
    }
  };

  navigator.serviceWorker.addEventListener('message', handler);
  return () => {
    navigator.serviceWorker.removeEventListener('message', handler);
  };
}
