import { StudioSettings, StudioOpeningHour } from '../types';

export const DEFAULT_OPERATING_HOURS: StudioOpeningHour[] = [
  { dayOfWeek: 'شنبه', openTime: '10:00', closeTime: '20:30', isClosed: false },
  { dayOfWeek: 'یکشنبه', openTime: '10:00', closeTime: '20:30', isClosed: false },
  { dayOfWeek: 'دوشنبه', openTime: '10:00', closeTime: '20:30', isClosed: false },
  { dayOfWeek: 'سه‌شنبه', openTime: '10:00', closeTime: '20:30', isClosed: false },
  { dayOfWeek: 'چهارشنبه', openTime: '10:00', closeTime: '20:30', isClosed: false },
  { dayOfWeek: 'پنج‌شنبه', openTime: '10:00', closeTime: '22:00', isClosed: false },
  { dayOfWeek: 'جمعه', openTime: '12:00', closeTime: '18:00', isClosed: false },
];

export const DEFAULT_STUDIO_SETTINGS: StudioSettings = {
  profile: {
    name: 'آرایشگاه رویال',
    tagline: 'رزرو آنلاین نوبت آرایشگاه، بدون تماس تلفنی',
    masterName: 'علی رضایی',
    masterTitle: 'سرآرایشگر و مدیر آتلیه',
    phone: '۰۲۱-۲۲۳۳۴۴۵۵',
    conciergePhone: '۰۲۱-۲۲۳۳۴۴۵۵',
    email: 'info@royalbarber.ir',
    address: 'تهران، سعادت‌آباد، خیابان سرو غربی، پلاک ۲۴',
    neighborhood: 'سعادت‌آباد',
    city: 'تهران',
    operationalStatus: 'open',
    privateCourtyardCode: '',
    valetServiceAvailable: false,
    valetInstructions: '',
    amenities: [
      'رزرو آنلاین ۲۴ ساعته',
      'یادآوری خودکار پیامکی',
      'ثبت سوابق و سلیقه مشتری',
      'نظافت و استریل کامل ابزارها',
      'پذیرایی چای و قهوه',
    ],
  },
  announcement: {
    headline: '',
    body: '',
    tag: 'اطلاعیه سالن',
    isActive: false,
  },
  operatingHours: DEFAULT_OPERATING_HOURS,
  policies: {
    cancellationWindowHours: 24,
    bookingCutoffHours: 2,
    maxBookingHorizonDays: 30,
    depositAmount: 20,
    policyNotice: 'لغو یا جابجایی نوبت تا ۲۴ ساعت پیش از زمان رزرو شده بدون کسر ودیعه انجام می‌پذیرد.',
  },
  financialTargets: {
    today: 850,
    week: 4200,
    month: 18000,
    year: 220000,
    custom: 5000,
  },
  notificationPreferences: {
    newOnlineBooking: true,
    appointmentCancellation: true,
    appointmentReschedule: true,
    newBoutiqueOrder: false,
    paymentConfirmation: true,
    lowInventoryAlerts: false,
  },
  hospitalityEnabled: true,
};

/**
 * Validates tariff pricing inputs
 */
export function validateTariffInput(price: number, effectiveDate?: string): {
  isValid: boolean;
  error?: string;
} {
  if (isNaN(price) || price === null || price === undefined) {
    return { isValid: false, error: 'لطفاً یک مبلغ عددی معتبر وارد نمایید.' };
  }
  if (price < 0) {
    return { isValid: false, error: 'تعرفه خدمت نمی‌تواند منفی باشد.' };
  }
  if (price > 10000) {
    return { isValid: false, error: 'مبلغ وارد شده بیش از حد مجاز است.' };
  }
  return { isValid: true };
}
