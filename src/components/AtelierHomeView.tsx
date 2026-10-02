import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ATELIER_IMAGES } from '../data/mockData';
import { Reservation, Appointment } from '../types';
import { AtelierShell } from './AtelierShell';
import { useAtelier } from '../store/AtelierContext';
import { CancelAppointmentModal } from './CancelAppointmentModal';
import { DigitalBoardingPassModal } from './DigitalBoardingPassModal';
import { RescheduleModal } from './management/RescheduleModal';
import { ShopHeader } from './home/ShopHeader';
import { CountdownWidget } from './home/CountdownWidget';
import { UpcomingAppointmentCard } from './home/UpcomingAppointmentCard';
import { RoutineCard } from './home/RoutineCard';
import { useUpcomingAppointment } from '../hooks/useUpcomingAppointment';
import { 
  Calendar, 
  ArrowLeft, 
  Megaphone, 
  MapPin, 
  PhoneCall, 
  CheckCircle2 
} from 'lucide-react';
import { toPersianDigits, getCurrentSolarDateInfo, formatAppointmentDate } from '../utils/dateUtils';
import { hapticLight, hapticStepAdvance } from '../utils/hapticUtils';
import { SpatialTilt } from './common/SpatialTilt';
import { Button } from '@/components/ui/button';
import { EnamadBadge } from './common/EnamadBadge';

interface AtelierHomeViewProps {
  currentReservation: Reservation;
  onBookClick: () => void;
  onViewReservation: () => void;
  onOpenConcierge?: () => void;
}

export const AtelierHomeView: React.FC<AtelierHomeViewProps> = ({
  onBookClick,
}) => {
  const { 
    appointments, 
    currentCustomer, 
    cancelAppointment, 
    openManagementAuth,
    studio,
    settings,
    addNotification
  } = useAtelier();

  // Modal states for Quick Actions on Home
  const [selectedCancelApt, setSelectedCancelApt] = useState<Appointment | null>(null);
  const [selectedRescheduleApt, setSelectedRescheduleApt] = useState<Appointment | null>(null);
  const [selectedPassApt, setSelectedPassApt] = useState<Appointment | null>(null);
  const [showMapModal, setShowMapModal] = useState<boolean>(false);
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Safe toast timer ref with memory leak prevention
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (message: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setActionToast(message);
    toastTimerRef.current = setTimeout(() => {
      setActionToast(null);
    }, 3000);
  };

  // Robust query for nearest upcoming appointment
  const upcomingAppointment = useUpcomingAppointment(appointments, currentCustomer);

  // Handle Cancellation confirmation from home
  const handleConfirmCancel = (aptId: string) => {
    const res = cancelAppointment(aptId);
    setSelectedCancelApt(null);
    if (res.success) {
      showToast('نوبت با موفقیت لغو شد و ساعت در تقویم آزاد گردید.');
    } else {
      showToast(res.message || 'خطا در لغو نوبت');
    }
  };

  // Human-readable relative date text for appointment
  const relativeTimingText = useMemo(() => {
    if (!upcomingAppointment) return null;

    if (upcomingAppointment.status === 'in_progress') {
      return 'هم‌اکنون در حال انجام در سالن';
    }

    const { dayNumber: currentDay } = getCurrentSolarDateInfo();
    const targetDay = upcomingAppointment.dayNumber;

    if (targetDay === currentDay) {
      return 'امروز · نوبت فعال';
    } else if (targetDay === currentDay + 1) {
      return 'فردا · نوبت رزرو شده';
    } else if (targetDay > currentDay) {
      const diff = targetDay - currentDay;
      return `${toPersianDigits(diff)} روز مانده (${formatAppointmentDate(upcomingAppointment)})`;
    }
    return formatAppointmentDate(upcomingAppointment);
  }, [upcomingAppointment]);

  const shopPhone = studio?.phone || '۰۲۱-۲۲۳۳۴۴۵۵';
  const shopAddress = studio?.address || 'تهران، سعادت‌آباد، خیابان سرو غربی، پلاک ۲۴';

  const announcement = settings?.announcement;
  const hasAnnouncement = Boolean(
    announcement?.isActive && 
    (announcement?.headline?.trim() || announcement?.body?.trim())
  );

  return (
    <AtelierShell id="atelier-home-container" bottomPadding="pb-0">
      {/* Toast Notification */}
      {actionToast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-stone-900/95 text-white border border-white/20 text-xs font-bold shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionToast}</span>
        </div>
      )}

      <div 
        className="relative z-20 px-4 pt-2 space-y-3.5 flex-1 min-h-0 overflow-y-auto pb-24" 
        dir="rtl"
      >
        {/* ─── 1. SHOP PRESENCE & BRAND HEADER ───────────────────────── */}
        <ShopHeader
          studio={studio}
          onOpenManagement={openManagementAuth}
          onOpenMap={() => setShowMapModal(true)}
        />

        {/* ─── 2. UNIFIED HERO PHOTO + FUNCTIONALITY CARD ───────────── */}
        <section id="home-unified-status-section" className="relative">
          <SpatialTilt
            id="home-unified-card"
            maxTilt={5}
            glareOpacity={0.25}
            scaleOnHover={1.01}
            className="apple-glass-card rounded-[30px] overflow-hidden text-stone-900"
          >
            {/* Clean Photo on Top */}
            <div className="relative h-44 w-full overflow-hidden">
              <img
                src={ATELIER_IMAGES.yourNextCut}
                alt="سالن آرایشگاه رویال"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Functional Content Under Photo */}
            <div className="p-4 space-y-3">
              {/* Isolated Chronometer Countdown Widget */}
              <CountdownWidget
                upcomingAppointment={upcomingAppointment}
                currentCustomer={currentCustomer}
                onBookClick={onBookClick}
                onPassClick={(apt) => setSelectedPassApt(apt)}
                onZeroReached={(apt) => {
                  addNotification({
                    title: 'شروع سرویس پیرایش',
                    message: `نوبت «${apt.service?.name || 'اصلاح'}» شما با ${apt.barberName} آغاز شد. به سالن خوش آمدید.`,
                    type: 'appointment_confirmed',
                    isRead: false,
                    timestamp: 'هم‌اکنون',
                  });
                }}
              />

              {upcomingAppointment ? (
                /* STATE A: Upcoming or In-Progress Appointment */
                <UpcomingAppointmentCard
                  appointment={upcomingAppointment}
                  relativeTimingText={relativeTimingText}
                  onReschedule={(apt) => setSelectedRescheduleApt(apt)}
                  onCancel={(apt) => setSelectedCancelApt(apt)}
                  onOpenPass={(apt) => setSelectedPassApt(apt)}
                />
              ) : (
                /* STATE B: Routine Suggestion or Welcome */
                <RoutineCard currentCustomer={currentCustomer} />
              )}
            </div>
          </SpatialTilt>
        </section>

        {/* ─── 3. PRIMARY ACTION: BOOK NOW ────────── */}
        <section id="primary-booking-action">
          <Button
            id="home-primary-book-btn"
            variant="accent"
            size="lg"
            onClick={() => {
              hapticStepAdvance();
              onBookClick();
            }}
            className="w-full py-4 px-4.5 rounded-[22px] text-xs flex items-center justify-between transition-colors group cursor-pointer select-none shadow-[0_18px_42px_-6px_rgba(191,89,56,0.38),0_6px_16px_-2px_rgba(191,89,56,0.22)] text-[#8c351b]"
          >
            <div className="flex items-center gap-3">
              <div 
                style={{ color: '#8c351b' }}
                className="w-8 h-8 rounded-xl bg-white/20 text-[#8c351b] flex items-center justify-center shadow-2xs border border-white/30"
              >
                <Calendar className="w-4 h-4 text-[#8c351b]" />
              </div>
              <div className="text-right">
                <span 
                  style={{ color: '#ffffff' }}
                  className="text-xs font-black block leading-tight text-white"
                >
                  رزرو نوبت جدید آرایشگاه
                </span>
                <span 
                  style={{ color: '#ffffff' }}
                  className="text-[10px] text-white/80 font-semibold block mt-0.5"
                >
                  انتخاب آرایشگر، تاریخ و ساعت دلخواه
                </span>
              </div>
            </div>

            <div 
              style={{ color: '#8c351b' }}
              className="flex items-center gap-1 text-[11px] font-bold bg-white/20 px-3 py-1.5 rounded-xl group-hover:-translate-x-1 transition-transform text-[#8c351b] shadow-2xs border border-white/30"
            >
              <span>شروع رزرو</span>
              <ArrowLeft className="w-3.5 h-3.5 text-[#8c351b]" />
            </div>
          </Button>
        </section>

        {/* ─── 4. ENGAGEMENT & ANNOUNCEMENT LAYER ───────────────────────── */}
        {hasAnnouncement && announcement && (
          <section id="engagement-layer" className="space-y-2.5">
            <SpatialTilt
              id="shop-announcement-card"
              maxTilt={5}
              glareOpacity={0.2}
              scaleOnHover={1.01}
              className="apple-glass-subtle rounded-[24px] p-3.5 text-stone-900 flex items-start gap-2.5"
            >
              <div className="w-7 h-7 rounded-xl bg-[#fdf2ee] border border-[#f3d0c4] flex items-center justify-center text-[#bf5938] shrink-0 mt-0.5 shadow-2xs">
                <Megaphone className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-stone-900">
                    {announcement.headline || 'اطلاعیه سالن رویال'}
                  </span>
                  {announcement.tag && (
                    <span className="text-[9px] font-bold text-[#bf5938] bg-[#fdf2ee] border border-[#f3d0c4] px-2 py-0.5 rounded-md">
                      {announcement.tag}
                    </span>
                  )}
                </div>
                {announcement.body && (
                  <p className="text-[10px] text-stone-600 mt-1 leading-relaxed">
                    {announcement.body}
                  </p>
                )}
              </div>
            </SpatialTilt>
          </section>
        )}

        {/* ─── 5. OFFICIAL ENAMAD TRUST BANNER ───────────────── */}
        <EnamadBadge variant="banner" />

        {/* ─── 6. FOOTER ───────────────────────────────────────── */}
        <footer className="pt-1 pb-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-2.5 text-[11px] text-stone-700">
            <span>تلفن: {shopPhone}</span>
            <span>·</span>
            <button
              type="button"
              onClick={() => setShowMapModal(true)}
              className="text-stone-800 hover:text-stone-950 font-medium cursor-pointer px-2 py-0.5 rounded-lg border border-stone-300/90 bg-white/70 shadow-2xs text-[10px] transition-all hover:bg-white active:scale-95"
            >
              آدرس سالن
            </button>
          </div>
        </footer>
      </div>

      {/* ─── MODALS ─────────────────────────────────────────────────── */}
      <RescheduleModal
        isOpen={Boolean(selectedRescheduleApt)}
        onClose={() => setSelectedRescheduleApt(null)}
        appointment={selectedRescheduleApt}
      />

      <CancelAppointmentModal
        isOpen={Boolean(selectedCancelApt)}
        onClose={() => setSelectedCancelApt(null)}
        appointment={selectedCancelApt}
        onConfirmCancel={handleConfirmCancel}
      />

      <DigitalBoardingPassModal
        isOpen={Boolean(selectedPassApt)}
        onClose={() => setSelectedPassApt(null)}
        appointment={selectedPassApt}
      />

      {/* Map & Address Modal */}
      {showMapModal && (
        <div
          id="home-map-modal-backdrop"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in"
          dir="rtl"
          onClick={() => setShowMapModal(false)}
        >
          <div
            className="relative w-full max-w-[340px] bg-white/95 backdrop-blur-2xl border border-white/90 rounded-[32px] p-5 text-stone-900 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#fdf2ee] text-[#bf5938] flex items-center justify-center border border-[#f3d0c4]">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-stone-900">
                  موقعیت و آدرس آرایشگاه
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="w-7 h-7 rounded-full bg-stone-100 text-stone-500 hover:text-stone-900 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-stone-200 relative h-36">
              <img
                src={ATELIER_IMAGES.mapPreview}
                alt="نقشه دسترسی سالن"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2.5">
                <span className="text-[10px] text-white font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#f3d0c4]" />
                  سعادت‌آباد، خیابان سرو غربی
                </span>
              </div>
            </div>

            <div className="text-xs text-stone-700 space-y-1">
              <p className="font-bold text-stone-900">{shopAddress}</p>
              <p className="text-[10px] text-stone-600 leading-relaxed">
                دسترسی آسان، نبش کوچه غربی، پلاک ۲۴.
              </p>
            </div>

            <div className="pt-2 flex gap-2">
              <a
                href={`tel:${shopPhone.replace(/\D/g, '')}`}
                className="flex-1 py-2.5 px-3 bg-[#bf5938] hover:bg-[#a34426] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-white" />
                <span>تماس با سالن</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setShowMapModal(false);
                  showToast('مسیریابی در نقشه فعال شد');
                }}
                className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-medium transition-colors cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </AtelierShell>
  );
};
