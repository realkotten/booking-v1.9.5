import { toPersianDigits } from './dateUtils';

/**
 * Formats monetary price in Iranian Toman with Persian digits and thousands separator.
 */
export const formatPrice = (price: number): string => {
  const formatted = new Intl.NumberFormat('fa-IR').format(price || 0);
  return `${formatted} تومان`;
};

/**
 * Formats duration in minutes to natural Persian text (e.g. «۴۵ دقیقه» or «۱ ساعت و ۳۰ دقیقه»).
 */
export const formatDuration = (minutes: number): string => {
  if (!minutes || minutes < 60) {
    return `${toPersianDigits(minutes || 0)} دقیقه`;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0
    ? `${toPersianDigits(hours)} ساعت`
    : `${toPersianDigits(hours)} ساعت و ${toPersianDigits(rest)} دقیقه`;
};
