import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scissors, Bell, BellRing, Check, X, Sparkles, Volume2, ShieldAlert } from 'lucide-react';
import { CountdownToastNotification } from '../../hooks/useReservationCountdownNotification';

interface ReservationCountdownToastProps {
  toast: CountdownToastNotification | null;
  onDismiss: () => void;
  permissionStatus?: NotificationPermission | 'unsupported';
  onRequestPermission?: () => Promise<boolean>;
  autoDismissSeconds?: number;
}

export const ReservationCountdownToast: React.FC<ReservationCountdownToastProps> = ({
  toast,
  onDismiss,
  permissionStatus = 'default',
  onRequestPermission,
  autoDismissSeconds = 12,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toast) {
      setProgress(100);
      return;
    }

    const interval = 100;
    const step = (100 / (autoDismissSeconds * 1000)) * interval;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return Math.max(0, prev - step);
      });
    }, interval);

    return () => clearInterval(timer);
  }, [toast, autoDismissSeconds, onDismiss]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          id="reservation-countdown-zero-toast"
          initial={{ opacity: 0, y: -40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="fixed top-4 inset-x-3 sm:inset-x-auto sm:right-6 sm:w-[420px] z-[120] pointer-events-auto select-none"
          dir="rtl"
        >
          <div className="relative overflow-hidden bg-white/95 backdrop-blur-2xl border border-white/90 rounded-3xl p-4 shadow-2xl text-stone-900 space-y-3">
            {/* Top Bar Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative w-9 h-9 rounded-2xl bg-[#ea5848] text-white flex items-center justify-center shadow-md shadow-[#ea5848]/20">
                  <Scissors className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-stone-900">
                      {toast.title}
                    </h4>
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                      شروع سرویس
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-500 font-medium flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-[#ea5848]" />
                    <span>آلارم صوتی و نوتیفیکیشن همزمان</span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onDismiss}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-900 flex items-center justify-center transition-colors"
                title="بستن اعلان"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Notification Body Text */}
            <p className="text-xs text-stone-700 leading-relaxed font-normal bg-stone-50/80 p-2.5 rounded-2xl border border-stone-200/60">
              {toast.body}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-0.5">
              {toast.onAction && (
                <button
                  type="button"
                  onClick={toast.onAction}
                  className="flex-1 py-2 px-3.5 bg-[#ea5848] hover:bg-[#d64434] active:scale-[0.98] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{toast.actionLabel || 'مشاهده جزئیات نوبت'}</span>
                </button>
              )}

              {permissionStatus === 'default' && onRequestPermission && (
                <button
                  type="button"
                  onClick={() => onRequestPermission()}
                  className="py-2 px-3 bg-stone-100 hover:bg-stone-200 active:scale-[0.98] text-stone-800 rounded-xl text-xs font-medium flex items-center gap-1 transition-all"
                  title="فعال‌سازی نوتیفیکیشن مرورگر برای نوبت‌های بعدی"
                >
                  <BellRing className="w-3.5 h-3.5 text-[#ea5848]" />
                  <span>مجوز مرورگر</span>
                </button>
              )}
            </div>

            {/* Progress Bar (Auto-Dismiss) */}
            <div className="absolute bottom-0 inset-x-0 h-1 bg-stone-100 overflow-hidden">
              <div
                className="h-full bg-[#ea5848] transition-all ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
