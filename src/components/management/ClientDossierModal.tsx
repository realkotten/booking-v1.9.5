import React, { useState } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Crown, 
  Edit3, 
  Calendar, 
  Clock, 
  Scissors, 
  Coffee, 
  Music, 
  FileText, 
  DollarSign, 
  CheckCircle2, 
  Sparkles, 
  Play, 
  PlusCircle, 
  Eye, 
  Package, 
  Archive, 
  ShieldCheck,
  ChevronLeft,
  CalendarPlus,
  CalendarClock,
  Volume2
} from 'lucide-react';
import { ClientProfile, Appointment } from '../../types';
import { useAtelier } from '../../store/AtelierContext';
import { 
  getCustomerAppointments, 
  getCustomerStats, 
  CustomerDerivedStats 
} from '../../utils/customerUtils';
import { toPersianDigits } from '../../utils/dateUtils';
import { getAppointmentStatusBadge, getBookingSourceLabel } from '../../utils/statusUtils';
import { EditClientDossierModal } from './EditClientDossierModal';
import { VisitDetailModal } from './VisitDetailModal';
import { QuickBookingModal } from './QuickBookingModal';
import { QuickContactButtons } from './QuickContactButtons';

interface ClientDossierModalProps {
  customer: ClientProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSchedule?: () => void;
}

export const ClientDossierModal: React.FC<ClientDossierModalProps> = ({
  customer,
  isOpen,
  onClose,
  onNavigateToSchedule,
}) => {
  const { 
    appointments, 
    pastAppointments, 
    startAppointment,
    archiveCustomer,
    activeBarber,
    settings,
  } = useAtelier();

  const defaultBarber = settings?.profile?.masterName?.trim() || activeBarber?.name || 'آرایشگر اختصاصی';

  const [activeSection, setActiveSection] = useState<'routine' | 'architecture' | 'hospitality' | 'technical' | 'history'>('routine');
  const [editInitialTab, setEditInitialTab] = useState<'identity' | 'routine' | 'architecture' | 'hospitality' | 'technical'>('identity');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedVisitForDetail, setSelectedVisitForDetail] = useState<Appointment | null>(null);
  const [isQuickBookingOpen, setIsQuickBookingOpen] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);

  if (!isOpen || !customer) return null;

  // Derived stats from shared data models
  const stats: CustomerDerivedStats = getCustomerStats(
    customer, 
    appointments, 
    pastAppointments
  );
  const customerApts = getCustomerAppointments(customer.id, appointments, pastAppointments);

  // Check today's appointment for quick start action
  const todayApt = appointments.find(
    (a) => a.customerId === customer.id && a.dayNumber === 22
  );

  const handleStartTodayApt = () => {
    if (todayApt) {
      startAppointment(todayApt.id);
    }
  };

  const handleArchive = () => {
    archiveCustomer(customer.id);
    setConfirmArchive(false);
    onClose();
  };

  return (
    <>
      <div
        id="client-dossier-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 bg-black/45 backdrop-blur-md animate-in fade-in"
        dir="rtl"
      >
        <div
          id="client-dossier-modal-container"
          className="relative w-full max-w-[346px] bg-white/95 backdrop-blur-2xl border border-white/80 rounded-[34px] p-3.5 shadow-2xl space-y-3 animate-in zoom-in-95 max-h-[92vh] flex flex-col justify-between overflow-hidden"
        >
          {/* Top Bar with Actions */}
          <div className="flex items-center justify-between pb-2 border-b border-stone-200/80 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white via-[#fbdcd9] to-[#d88d85] shadow-glow-pink flex items-center justify-center border border-white/60">
                <Scissors className="w-4 h-4 text-stone-900" />
              </div>
              <div>
                <h3 className="text-xs font-serif font-bold text-stone-900">
                  پرونده اختصاصی مشتری
                </h3>
                <p className="text-[9px] text-stone-500 font-mono">
                  {customer.memberId} · {customer.joinedDate || 'عضو استودیو'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                id="btn-open-edit-dossier"
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-[10px] font-bold transition-colors"
                title="ویرایش پرونده"
              >
                <Edit3 className="w-3 h-3 text-[#b2665e]" />
                <span>ویرایش</span>
              </button>
              <button
                type="button"
                id="btn-close-dossier"
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content Container */}
          <div className="flex-1 overflow-y-auto pr-0.5 no-scrollbar space-y-3">
            {/* Identity Card */}
            <div className="p-3 rounded-2xl bg-gradient-to-b from-stone-50/90 to-white/70 border border-stone-200/80 shadow-2xs space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-stone-900">{customer.name}</h2>
                  </div>
                  <p className="text-[10px] text-stone-500 mt-0.5 font-mono" dir="ltr">
                    {customer.phone}
                  </p>
                  <p className="text-[9px] text-[#b2665e] font-medium mt-0.5">
                    {customer.memberId ? `کد پرونده: ${customer.memberId}` : 'مشتری سالن'}
                  </p>
                </div>

                {customer.avatarUrl ? (
                  <img
                    src={customer.avatarUrl}
                    alt={customer.name}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-amber-400 shadow-sm bg-stone-900"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-stone-900 text-[#fbdcd9] flex items-center justify-center text-sm font-bold shadow-sm">
                    {customer.name.slice(0, 1)}
                  </div>
                )}
              </div>

              {/* Call & Text message quick action buttons for barber */}
              <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between gap-2">
                <span className="text-[9px] font-bold text-stone-500">ارتباط سریع:</span>
                <QuickContactButtons
                  phone={customer.phone}
                  customerName={customer.name}
                  size="sm"
                  showLabels={true}
                />
              </div>

              {/* Quick Operational Status (Today appointment or Next appointment) */}
              {todayApt && (
                <div className="p-2 rounded-xl bg-amber-50/90 border border-amber-200/70 flex items-center justify-between text-[9px]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-amber-700" />
                    <span className="font-bold text-amber-900">
                      نوبت امروز: ساعت {toPersianDigits(todayApt.startTime)}
                    </span>
                  </div>
                  {todayApt.status === 'confirmed' ? (
                    <button
                      type="button"
                      id="btn-dossier-start-today"
                      onClick={handleStartTodayApt}
                      className="px-2.5 py-0.5 rounded-lg bg-[#7e5352] hover:bg-[#6c4443] text-white text-[9px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Play className="w-2.5 h-2.5 text-[#fedecb]" />
                      <span>شروع نوبت</span>
                    </button>
                  ) : todayApt.status === 'in_progress' ? (
                    <span className="px-2 py-0.5 rounded-lg bg-amber-200 text-amber-900 font-bold text-[8px] animate-pulse">
                      در حال پیرایش
                    </span>
                  ) : (
                    <span className="text-stone-500 font-medium text-[8px]">
                      {todayApt.status === 'completed' ? 'تکمیل شده' : 'لغو شده'}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* KPI Metrics Strip */}
            <div className="grid grid-cols-4 gap-1.5 text-center">
              <div className="p-2 rounded-xl bg-white/80 border border-stone-200/60 shadow-2xs">
                <p className="text-[8px] text-stone-500">تعداد مراجعات</p>
                <p className="text-xs font-bold text-stone-900 font-mono mt-0.5">
                  {toPersianDigits(stats.totalVisits)}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-white/80 border border-stone-200/60 shadow-2xs">
                <p className="text-[8px] text-stone-500">آخرین مراجعه</p>
                <p className="text-[9px] font-bold text-stone-800 mt-0.5 truncate">
                  {stats.lastVisit ? stats.lastVisit.date.split('،')[1]?.trim() || stats.lastVisit.date : '—'}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-white/80 border border-stone-200/60 shadow-2xs">
                <p className="text-[8px] text-stone-500">نوبت آتی</p>
                <p className="text-[9px] font-bold text-[#b2665e] mt-0.5 truncate">
                  {stats.nextAppointment ? `${toPersianDigits(stats.nextAppointment.startTime)}` : 'ندارد'}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-white/80 border border-stone-200/60 shadow-2xs">
                <p className="text-[8px] text-stone-500">مجموع خرید</p>
                <p className="text-xs font-bold text-stone-900 font-mono mt-0.5">
                  ${toPersianDigits(stats.totalSpending)}
                </p>
              </div>
            </div>

            {/* Operational Actions Strip */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                id="btn-dossier-quick-booking"
                onClick={() => setIsQuickBookingOpen(true)}
                className="flex-1 py-1.5 px-2 rounded-xl bg-[#7e5352] hover:bg-[#6c4443] text-white text-[10px] font-bold transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer"
              >
                <CalendarPlus className="w-3 h-3 text-[#fedecb]" />
                <span>رزرو نوبت جدید</span>
              </button>

              {onNavigateToSchedule && (
                <button
                  type="button"
                  id="btn-dossier-view-schedule"
                  onClick={() => {
                    onNavigateToSchedule();
                    onClose();
                  }}
                  className="py-1.5 px-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-[10px] font-medium transition-colors flex items-center gap-1"
                >
                  <Calendar className="w-3 h-3 text-stone-600" />
                  <span>تقویم هفتگی</span>
                </button>
              )}
            </div>

            {/* Navigation Tabs for Dossier Sections (Multi-line wrap without horizontal scrolling) */}
            <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-stone-100/90 text-[9px] font-medium w-full">
              <button
                type="button"
                onClick={() => setActiveSection('routine')}
                className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  activeSection === 'routine'
                    ? 'bg-[#7e5352] text-white shadow-2xs font-bold'
                    : 'text-[#7e5352] bg-[#7e5352]/10 hover:bg-[#7e5352]/20 font-bold'
                }`}
              >
                <CalendarClock className="w-3 h-3 shrink-0" />
                <span>روتین پیشنهادی</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('architecture')}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  activeSection === 'architecture'
                    ? 'bg-[#7e5352] text-white shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-stone-900 bg-white/60'
                }`}
              >
                معماری مو
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('hospitality')}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  activeSection === 'hospitality'
                    ? 'bg-[#7e5352] text-white shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-stone-900 bg-white/60'
                }`}
              >
                پذیرایی
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('technical')}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  activeSection === 'technical'
                    ? 'bg-[#7e5352] text-white shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-stone-900 bg-white/60'
                }`}
              >
                نکات فنی
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('history')}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  activeSection === 'history'
                    ? 'bg-[#7e5352] text-white shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-stone-900 bg-white/60'
                }`}
              >
                سوابق ({toPersianDigits(customerApts.length)})
              </button>
            </div>

            {/* SECTION 0: Suggested Routine by Barber */}
            {activeSection === 'routine' && (
              <div className="space-y-2 animate-in fade-in duration-150">
                <div className="p-3 rounded-2xl bg-white/80 border border-stone-200/70 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-stone-900 text-[10px] font-bold">
                      <CalendarClock className="w-3.5 h-3.5 text-[#7e5352]" />
                      <span>برنامه زمانی روتین و تایمر مشتری</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditInitialTab('routine');
                        setIsEditModalOpen(true);
                      }}
                      className="text-[9px] text-[#7e5352] hover:text-stone-900 font-bold flex items-center gap-1 bg-[#7e5352]/10 hover:bg-[#7e5352]/20 px-2 py-0.5 rounded-full transition-all"
                    >
                      <Edit3 className="w-2.5 h-2.5" />
                      <span>تغییر روتین</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[9px]">
                    <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-200/60 space-y-0.5">
                      <span className="text-stone-500 block text-[8px]">دوره تکرار اصلاح:</span>
                      <span className="font-bold text-stone-900 text-xs">
                        {customer.routineCadence || customer.cadence || 'هر ۳ هفته (۲۱ روز)'}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-200/60 space-y-0.5">
                      <span className="text-stone-500 block text-[8px]">موعد طلایی بعدی:</span>
                      <span className="font-bold text-[#7e5352] text-xs">
                        {customer.nextRoutineTargetDate || '۲۵ مهر'} · ساعت {toPersianDigits(customer.nextRoutineTargetTime || '۱۷:۰۰')}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/60 text-[9px] space-y-1">
                    <div className="flex items-center justify-between text-stone-500 text-[8px]">
                      <span>خدمت پیشنهادی روتین:</span>
                      <span className="font-mono text-stone-400">Routine Service</span>
                    </div>
                    <p className="font-bold text-stone-900 text-[10px]">
                      {customer.routineServiceTitle || 'اصلاح مو و پیرایش کلاسیک'}
                    </p>
                  </div>

                  {customer.routineBarberNote ? (
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 text-[9px] space-y-1">
                      <span className="text-stone-500 text-[8px] font-bold block">
                        یادداشت و توصیه اختصاصی آرایشگر:
                      </span>
                      <p className="text-stone-800 leading-relaxed">
                        {customer.routineBarberNote}
                      </p>
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl bg-stone-50 border border-dashed border-stone-300 text-center text-[9px] text-stone-500">
                      یادداشت خاصی برای روتین ثبت نشده است. می‌توانید با زدن دکمه «تغییر روتین» توصیه شخصی خود را اضافه کنید.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECTION 1: Hair & Face Architecture */}
            {activeSection === 'architecture' && (
              <div className="space-y-2 animate-in fade-in duration-150">
                <div className="p-3 rounded-2xl bg-white/80 border border-stone-200/70 shadow-2xs space-y-2">
                  <div className="flex items-center gap-1.5 text-stone-900 text-[10px] font-bold">
                    <Scissors className="w-3.5 h-3.5 text-[#b2665e]" />
                    <span>مشخصات هندسی و معماری تار مو</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[9px]">
                    <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/50">
                      <span className="text-stone-400 block text-[8px]">نوع مو (Hair Type):</span>
                      <span className="font-bold text-stone-900">
                        {customer.hairProfile?.hairType || 'صاف'}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/50">
                      <span className="text-stone-400 block text-[8px]">تراکم مو (Density):</span>
                      <span className="font-bold text-stone-900">
                        {customer.hairProfile?.density || 'متوسط'}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/50">
                      <span className="text-stone-400 block text-[8px]">فرم چهره (Face Shape):</span>
                      <span className="font-bold text-stone-900">
                        {customer.faceProfile?.shape || 'بیضی'}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/50">
                      <span className="text-stone-400 block text-[8px]">فید دلخواه (Favorite Fade):</span>
                      <span className="font-bold text-[#b2665e]">
                        {customer.hairProfile?.favoriteFade || 'لو فید'}
                      </span>
                    </div>
                  </div>

                  {/* Growth Pattern & Cowlicks */}
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 space-y-1">
                    <span className="text-[8px] font-bold text-stone-500 block">
                      جهت خواب، چرخش تاج سر و خط رویش:
                    </span>
                    <p className="text-[9px] text-stone-800 leading-relaxed">
                      {customer.hairProfile?.growthPattern || 'خواب طبیعی بدون انحراف غیرمعمول.'}
                    </p>
                  </div>

                  {/* Skin Sensitivity */}
                  {customer.hairProfile?.skinSensitivity && (
                    <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200/50 flex items-start gap-1.5 text-[9px] text-amber-900">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">ملاحظات حساسیت پوست:</span>
                        <p className="text-stone-700 mt-0.5">{customer.hairProfile.skinSensitivity}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECTION 2: Hospitality Profile */}
            {activeSection === 'hospitality' && (
              <div className="space-y-2 animate-in fade-in duration-150">
                <div className="p-3 rounded-2xl bg-white/80 border border-stone-200/70 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-stone-900 text-[10px] font-bold">
                      <Coffee className="w-3.5 h-3.5 text-[#b2665e]" />
                      <span>پروتکل پذیرایی و اقامت در سوئیت</span>
                    </div>
                    <span className="text-[8px] bg-[#fbdcd9]/50 text-[#853e36] px-2 py-0.5 rounded-full font-bold">
                      آماده در بدو ورود
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[9px]">
                    <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Coffee className="w-3.5 h-3.5 text-stone-500" />
                        <span className="text-stone-600">نوشیدنی اختصاصی:</span>
                      </div>
                      <span className="font-bold text-stone-900">
                        {customer.hospitality?.beveragePreference || 'اسپرسو دوبل'}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Music className="w-3.5 h-3.5 text-stone-500" />
                        <span className="text-stone-600">موسیقی سوئیت:</span>
                      </div>
                      <span className="font-bold text-stone-900">
                        {customer.hospitality?.audioPreference || 'جاز کلاسیک'}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-stone-500" />
                        <span className="text-stone-600">رایحه سوئیت:</span>
                      </div>
                      <span className="font-bold text-stone-900">
                        {customer.hospitality?.scentPreference || 'چوب صندل'}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-3.5 h-3.5 text-stone-500" />
                        <span className="text-stone-600">سطح مکالمه:</span>
                      </div>
                      <span className="font-bold text-stone-900">
                        {customer.hospitality?.conversationLevel === 'minimal'
                          ? 'حداقلی و آرامش‌بخش'
                          : customer.hospitality?.conversationLevel === 'engaging'
                          ? 'گفت‌وگوی گرم و پویا'
                          : 'معمول و حرفه‌ای'}
                      </span>
                    </div>
                  </div>

                  {customer.arrivalPreference && (
                    <div className="p-2 rounded-xl bg-stone-100/70 text-[9px] text-stone-600 space-y-0.5">
                      <span className="font-bold text-stone-700 block">پذیرش و رختکن:</span>
                      <p>{customer.arrivalPreference}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECTION 3: Technical Grooming Notes */}
            {activeSection === 'technical' && (
              <div className="space-y-2 animate-in fade-in duration-150">
                <div className="p-3 rounded-2xl bg-white/80 border border-stone-200/70 shadow-2xs space-y-2">
                  <div className="flex items-center gap-1.5 text-stone-900 text-[10px] font-bold">
                    <FileText className="w-3.5 h-3.5 text-[#b2665e]" />
                    <span>یادداشت‌ها و فرمول‌های فنی استاد</span>
                  </div>

                  <div className="space-y-1.5 text-[9px]">
                    {customer.technicalNotes?.clipperGuard && (
                      <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/50">
                        <span className="text-stone-400 block text-[8px]">گارد و شماره ماشین (Clipper):</span>
                        <p className="font-medium text-stone-800">{customer.technicalNotes.clipperGuard}</p>
                      </div>
                    )}

                    {customer.technicalNotes?.fadeTechnique && (
                      <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/50">
                        <span className="text-stone-400 block text-[8px]">تکنیک فید و زاویه‌بندی:</span>
                        <p className="font-medium text-stone-800">{customer.technicalNotes.fadeTechnique}</p>
                      </div>
                    )}

                    {customer.technicalNotes?.necklinePreference && (
                      <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/50">
                        <span className="text-stone-400 block text-[8px]">خط گردن و خط ریش:</span>
                        <p className="font-medium text-stone-800">
                          {customer.technicalNotes.necklinePreference}
                          {customer.technicalNotes.sideburnPreference ? ` · ${customer.technicalNotes.sideburnPreference}` : ''}
                        </p>
                      </div>
                    )}

                    {customer.technicalNotes?.beardLength && (
                      <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/50">
                        <span className="text-stone-400 block text-[8px]">اصلاح و آنکارد محاسن:</span>
                        <p className="font-medium text-stone-800">
                          طول {customer.technicalNotes.beardLength} · {customer.technicalNotes.beardShaping || 'طبیعی'}
                        </p>
                      </div>
                    )}

                    {customer.technicalNotes?.stylingPreference && (
                      <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/50">
                        <span className="text-stone-400 block text-[8px]">حالت‌دهی و فینیشینگ:</span>
                        <p className="font-medium text-stone-800">{customer.technicalNotes.stylingPreference}</p>
                      </div>
                    )}

                    {customer.technicalNotes?.generalTechnicalNotes && (
                      <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/50 text-[9px] text-stone-800 space-y-0.5">
                        <span className="font-bold text-amber-900 block">ملاحظات ویژه استاد:</span>
                        <p className="leading-relaxed">{customer.technicalNotes.generalTechnicalNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 4: Visit History */}
            {activeSection === 'history' && (
              <div className="space-y-1.5 animate-in fade-in duration-150">
                {customerApts.length === 0 ? (
                  <div className="p-6 text-center text-stone-400 space-y-1 bg-white/60 rounded-2xl border border-stone-200/60">
                    <Calendar className="w-6 h-6 mx-auto text-stone-300" />
                    <p className="text-xs font-bold text-stone-600">هنوز مراجعه‌ای ثبت نشده است</p>
                    <p className="text-[9px]">با ثبت اولین نوبت، سوابق در اینجا ذخیره می‌شوند.</p>
                  </div>
                ) : (
                  customerApts.map((apt) => {
                    const badge = getAppointmentStatusBadge(apt.status);
                    const source = getBookingSourceLabel(apt.bookingSource);

                    return (
                      <div
                        key={apt.id}
                        onClick={() => setSelectedVisitForDetail(apt)}
                        className="p-2.5 rounded-2xl bg-white/80 border border-stone-200/70 hover:border-stone-400/80 cursor-pointer shadow-2xs transition-all space-y-1 group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-stone-900">
                              {apt.date.split('،')[1]?.trim() || apt.date}
                            </span>
                            <span className="text-[8px] text-stone-400 font-mono">
                              ساعت {toPersianDigits(apt.startTime)}
                            </span>
                          </div>
                          <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold ${badge.badgeClass}`}>
                            {badge.label}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[9px]">
                          <span className="text-stone-700 truncate max-w-[180px]">
                            {apt.service?.name || 'خدمت پیرایش آتلیه'}
                          </span>
                          <span className="font-mono font-bold text-stone-900">
                            ${toPersianDigits(apt.totalAmount || apt.servicePrice || 0)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[8px] text-stone-400">
                          <span>{source.label} · {apt.barberName || defaultBarber}</span>
                          <span className="text-[#b2665e] flex items-center gap-0.5 font-medium group-hover:underline">
                            مشاهده جزئیات
                            <ChevronLeft className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Archive / Safe deletion notice */}
            <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[9px]">
              {!confirmArchive ? (
                <button
                  type="button"
                  onClick={() => setConfirmArchive(true)}
                  className="text-stone-400 hover:text-stone-700 text-[8px] flex items-center gap-1 transition-colors"
                >
                  <Archive className="w-2.5 h-2.5" />
                  <span>بایگانی امن پرونده</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 bg-amber-50 p-1.5 rounded-xl border border-amber-200 w-full justify-between">
                  <span className="text-[8px] text-amber-900">پرونده با حفظ سوابق بایگانی شود؟</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleArchive}
                      className="px-2 py-0.5 rounded-lg bg-[#7e5352] hover:bg-[#6c4443] text-white text-[8px] font-bold cursor-pointer"
                    >
                      بله، بایگانی
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmArchive(false)}
                      className="px-1.5 py-0.5 rounded-lg bg-stone-200 text-stone-700 text-[8px]"
                    >
                      انصراف
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Nested Edit Modal */}
      <EditClientDossierModal
        customer={customer}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialTab={editInitialTab}
      />

      {/* Nested Visit Detail Modal */}
      <VisitDetailModal
        visit={selectedVisitForDetail}
        isOpen={!!selectedVisitForDetail}
        onClose={() => setSelectedVisitForDetail(null)}
      />

      {/* Nested Quick Booking Modal with prefilled customer */}
      <QuickBookingModal
        isOpen={isQuickBookingOpen}
        onClose={() => setIsQuickBookingOpen(false)}
        initialCustomerName={customer.name}
        initialCustomerPhone={customer.phone}
      />
    </>
  );
};
