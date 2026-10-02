import { AppointmentStatus, ChairStatus, FulfillmentStatus, PaymentStatus, StatusMeta } from '../types';

// ─── 1. Appointment Status Definitions ────────────────────────────
export const APPOINTMENT_STATUS_MAP: Record<AppointmentStatus, StatusMeta> = {
  available: {
    key: 'available',
    label: 'در دسترس',
    badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
    indicatorClass: 'bg-emerald-400',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-300',
    borderClass: 'border-emerald-500/30',
  },
  reserved: {
    key: 'reserved',
    label: 'رزرو اولیه',
    badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
    indicatorClass: 'bg-amber-400',
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-300',
    borderClass: 'border-amber-500/30',
  },
  confirmed: {
    key: 'confirmed',
    label: 'تایید شده',
    badgeClass: 'bg-[#0f172a] text-[#f3d0c4] border-slate-700/60',
    indicatorClass: 'bg-[#bf5938]',
    bgClass: 'bg-[#bf5938]/10',
    textClass: 'text-[#bf5938]',
    borderClass: 'border-[#bf5938]/30',
  },
  in_progress: {
    key: 'in_progress',
    label: 'در حال انجام',
    badgeClass: 'bg-blue-950/80 text-blue-300 border-blue-800/60 animate-pulse',
    indicatorClass: 'bg-blue-400 animate-ping',
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-300',
    borderClass: 'border-blue-500/30',
  },
  completed: {
    key: 'completed',
    label: 'تکمیل شده',
    badgeClass: 'bg-stone-800/80 text-stone-300 border-stone-700/60',
    indicatorClass: 'bg-stone-400',
    bgClass: 'bg-stone-800/20',
    textClass: 'text-stone-300',
    borderClass: 'border-stone-700/40',
  },
  cancelled: {
    key: 'cancelled',
    label: 'لغو شده',
    badgeClass: 'bg-red-950/80 text-red-300 border-red-800/60',
    indicatorClass: 'bg-red-400',
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-300',
    borderClass: 'border-red-500/30',
  },
  blocked: {
    key: 'blocked',
    label: 'مسدود / رزرو داخلی',
    badgeClass: 'bg-stone-950 text-stone-500 border-stone-800',
    indicatorClass: 'bg-stone-600',
    bgClass: 'bg-stone-900',
    textClass: 'text-stone-500',
    borderClass: 'border-stone-800',
  },
  no_show: {
    key: 'no_show',
    label: 'عدم حضور',
    badgeClass: 'bg-orange-950/80 text-orange-300 border-orange-800/60',
    indicatorClass: 'bg-orange-400',
    bgClass: 'bg-orange-500/10',
    textClass: 'text-orange-300',
    borderClass: 'border-orange-500/30',
  },
};

export function getAppointmentStatusMeta(status: string): StatusMeta {
  const normalized = (status || '').toLowerCase().replace('-', '_') as AppointmentStatus;
  return APPOINTMENT_STATUS_MAP[normalized] || APPOINTMENT_STATUS_MAP.confirmed;
}

export const getAppointmentStatusBadge = getAppointmentStatusMeta;

export function getBookingSourceLabel(source?: string): { label: string; badgeClass: string } {
  switch (source) {
    case 'walk_in':
      return { label: 'حضوری (Walk-in)', badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-800/60' };
    case 'online':
      return { label: 'پورتال آنلاین', badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60' };
    case 'concierge':
      return { label: 'کانسیرج VIP', badgeClass: 'bg-rose-950/80 text-[#fdc4c2] border-rose-800/60' };
    case 'phone':
      return { label: 'تماس تلفنی', badgeClass: 'bg-stone-800 text-stone-300 border-stone-700' };
    case 'admin':
      return { label: 'ثبت مدیریت', badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-800/60' };
    default:
      return { label: 'سیستم آتلیه', badgeClass: 'bg-stone-800 text-stone-400 border-stone-700' };
  }
}

// ─── 2. Chair Status Definitions ──────────────────────────────────
export const CHAIR_STATUS_MAP: Record<ChairStatus, StatusMeta> = {
  available: {
    key: 'available',
    label: 'خالی و آماده',
    badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    indicatorClass: 'bg-emerald-400',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-300',
    borderClass: 'border-emerald-500/30',
  },
  occupied: {
    key: 'occupied',
    label: 'مشغول / در حال کار',
    badgeClass: 'bg-blue-950 text-blue-300 border-blue-800',
    indicatorClass: 'bg-blue-400',
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-300',
    borderClass: 'border-blue-500/30',
  },
  reserved: {
    key: 'reserved',
    label: 'رزرو شده',
    badgeClass: 'bg-amber-950 text-amber-300 border-amber-800',
    indicatorClass: 'bg-amber-400',
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-300',
    borderClass: 'border-amber-500/30',
  },
  cleaning: {
    key: 'cleaning',
    label: 'ضدعفونی و نظافت',
    badgeClass: 'bg-stone-800 text-stone-300 border-stone-700',
    indicatorClass: 'bg-stone-400',
    bgClass: 'bg-stone-800/20',
    textClass: 'text-stone-300',
    borderClass: 'border-stone-700/40',
  },
  normal: {
    key: 'normal',
    label: 'عادی / استاندارد',
    badgeClass: 'bg-stone-800 text-stone-200 border-stone-700',
    indicatorClass: 'bg-stone-400',
    bgClass: 'bg-stone-800/30',
    textClass: 'text-stone-200',
    borderClass: 'border-stone-700',
  },
  vip: {
    key: 'vip',
    label: 'سوئیت VIP اختصاصی',
    badgeClass: 'bg-[#0b111e] text-[#f3d0c4] border-[#bf5938]/40',
    indicatorClass: 'bg-[#bf5938]',
    bgClass: 'bg-[#bf5938]/10',
    textClass: 'text-[#bf5938]',
    borderClass: 'border-[#bf5938]/30',
  },
  service: {
    key: 'service',
    label: 'در حال سرویس‌دهی',
    badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    indicatorClass: 'bg-emerald-400',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-300',
    borderClass: 'border-emerald-500/30',
  },
  maintenance: {
    key: 'maintenance',
    label: 'نظافت / تعمیرات',
    badgeClass: 'bg-amber-950 text-amber-300 border-amber-800',
    indicatorClass: 'bg-amber-400',
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-300',
    borderClass: 'border-amber-500/30',
  },
};

export function getChairStatusMeta(status: ChairStatus): StatusMeta {
  return CHAIR_STATUS_MAP[status] || CHAIR_STATUS_MAP.vip;
}

// ─── 3. Commerce Order Status Definitions ─────────────────────────
export const PAYMENT_STATUS_MAP: Record<PaymentStatus, StatusMeta> = {
  unpaid: {
    key: 'unpaid',
    label: 'پرداخت نشده',
    badgeClass: 'bg-stone-800 text-stone-400 border-stone-700',
    indicatorClass: 'bg-stone-500',
    bgClass: 'bg-stone-900',
    textClass: 'text-stone-400',
    borderClass: 'border-stone-800',
  },
  pending: {
    key: 'pending',
    label: 'در انتظار پرداخت',
    badgeClass: 'bg-amber-950 text-amber-300 border-amber-800',
    indicatorClass: 'bg-amber-400',
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-300',
    borderClass: 'border-amber-500/30',
  },
  paid: {
    key: 'paid',
    label: 'پرداخت موفق',
    badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    indicatorClass: 'bg-emerald-400',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-300',
    borderClass: 'border-emerald-500/30',
  },
  refunded: {
    key: 'refunded',
    label: 'مسترد شده',
    badgeClass: 'bg-purple-950 text-purple-300 border-purple-800',
    indicatorClass: 'bg-purple-400',
    bgClass: 'bg-purple-500/10',
    textClass: 'text-purple-300',
    borderClass: 'border-purple-500/30',
  },
  failed: {
    key: 'failed',
    label: 'پرداخت ناموفق',
    badgeClass: 'bg-red-950 text-red-300 border-red-800',
    indicatorClass: 'bg-red-400',
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-300',
    borderClass: 'border-red-500/30',
  },
};

export const FULFILLMENT_STATUS_MAP: Record<FulfillmentStatus, StatusMeta> = {
  pending: {
    key: 'pending',
    label: 'در صف پردازش',
    badgeClass: 'bg-stone-800 text-stone-300 border-stone-700',
    indicatorClass: 'bg-stone-400',
    bgClass: 'bg-stone-800/30',
    textClass: 'text-stone-300',
    borderClass: 'border-stone-700',
  },
  confirmed: {
    key: 'confirmed',
    label: 'تایید سفارش',
    badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    indicatorClass: 'bg-emerald-400',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-300',
    borderClass: 'border-emerald-500/30',
  },
  preparing: {
    key: 'preparing',
    label: 'آماده‌سازی تشریفاتی',
    badgeClass: 'bg-amber-950 text-amber-300 border-amber-800',
    indicatorClass: 'bg-amber-400',
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-300',
    borderClass: 'border-amber-500/30',
  },
  ready_at_chair: {
    key: 'ready_at_chair',
    label: 'آماده روی صندلی',
    badgeClass: 'bg-blue-950 text-blue-300 border-blue-800',
    indicatorClass: 'bg-blue-400',
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-300',
    borderClass: 'border-blue-500/30',
  },
  shipped: {
    key: 'shipped',
    label: 'تحویل به پیک ویژه',
    badgeClass: 'bg-blue-950 text-blue-300 border-blue-800',
    indicatorClass: 'bg-blue-400',
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-300',
    borderClass: 'border-blue-500/30',
  },
  delivered: {
    key: 'delivered',
    label: 'تحویل داده شده',
    badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    indicatorClass: 'bg-emerald-400',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-300',
    borderClass: 'border-emerald-500/30',
  },
  cancelled: {
    key: 'cancelled',
    label: 'لغو شده',
    badgeClass: 'bg-red-950 text-red-300 border-red-800',
    indicatorClass: 'bg-red-400',
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-300',
    borderClass: 'border-red-500/30',
  },
};
