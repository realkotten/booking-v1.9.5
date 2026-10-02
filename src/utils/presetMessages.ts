import { BarberPresetMessage } from '../types';

export const DEFAULT_BARBER_PRESET_MESSAGES: BarberPresetMessage[] = [
  {
    id: 'preset-reminder',
    title: 'یادآوری نوبت',
    text: 'سلام {نام مشتری} عزیز، یادآوری نوبت پیرایش شما در {نام آرایشگاه} برای {تاریخ نوبت} ساعت {ساعت نوبت}. منتظر حضور گرمتان هستیم.',
    isDefault: true,
  },
  {
    id: 'preset-chair-ready',
    title: 'صندلی آماده است',
    text: 'سلام {نام مشتری} عزیز، صندلی و تجهیزات اختصاصی شما در {نام آرایشگاه} آماده است. لطفاً تشریف بیاورید.',
    isDefault: true,
  },
  {
    id: 'preset-delay',
    title: 'اطلاع تاخیر جزئی',
    text: 'سلام {نام مشتری} عزیز، با پوزش به دلیل دقت بالای خدمات قبلی، نوبت شما با حدود ۱۰ دقیقه تاخیر آغاز خواهد شد. سپاس از شکیبایی شما.',
    isDefault: true,
  },
  {
    id: 'preset-thank-you',
    title: 'تشکر پس از پذیرش',
    text: 'با سپاس از حضور شما {نام مشتری} گرامی در {نام آرایشگاه}. امیدواریم از تجربه اصلاح و خدمات رضایت کامل داشته باشید.',
    isDefault: true,
  },
  {
    id: 'preset-reschedule',
    title: 'پیشنهاد جابجایی زمان',
    text: 'سلام {نام مشتری} عزیز، در صورت نیاز به جابجایی زمان نوبت در {نام آرایشگاه}، لطفاً با ما تماس بگیرید یا اطلاع دهید.',
    isDefault: true,
  },
];

export interface FormatPresetParams {
  customerName?: string;
  appointmentTime?: string;
  appointmentDate?: string;
  barberName?: string;
  studioName?: string;
  serviceName?: string;
}

export function formatPresetMessage(
  template: string,
  params: FormatPresetParams = {}
): string {
  if (!template) return '';
  let result = template;
  result = result.replace(/\{نام مشتری\}|\{customerName\}/g, params.customerName || 'عزیز');
  result = result.replace(/\{ساعت نوبت\}|\{ساعت\}|\{appointmentTime\}/g, params.appointmentTime || '');
  result = result.replace(/\{تاریخ نوبت\}|\{تاریخ\}|\{appointmentDate\}/g, params.appointmentDate || 'امروز');
  result = result.replace(/\{نام آرایشگر\}|\{barberName\}/g, params.barberName || 'آرایشگر شما');
  result = result.replace(/\{نام آرایشگاه\}|\{studioName\}/g, params.studioName || 'آرایشگاه رویال');
  result = result.replace(/\{خدمت\}|\{نام خدمت\}|\{serviceName\}/g, params.serviceName || 'خدمات پیرایش');
  return result;
}
