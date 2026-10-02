import React from 'react';
import { formatPrice } from '../../utils/formatUtils';
import { toPersianDigits } from '../../utils/dateUtils';
import { getDiscountInfo, DiscountInfo } from '../../utils/pricingUtils';
import { Service } from '../../types';

interface PriceDisplayProps {
  service?: Service | null;
  price?: number;
  realPrice?: number;
  discountedPrice?: number;
  showBadge?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  layout?: 'row' | 'col';
  className?: string;
  badgeLabel?: string;
  muted?: boolean;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  service,
  price,
  realPrice: explicitRealPrice,
  discountedPrice: explicitDiscountedPrice,
  showBadge = true,
  size = 'sm',
  layout = 'row',
  className = '',
  badgeLabel,
  muted = false,
}) => {
  let discount: DiscountInfo;

  if (service) {
    discount = getDiscountInfo(service);
  } else {
    const finalPrice = explicitDiscountedPrice ?? price ?? 0;
    const originalPrice = explicitRealPrice ?? finalPrice;
    const hasDiscount = originalPrice > finalPrice && finalPrice > 0;
    const discountAmount = hasDiscount ? originalPrice - finalPrice : 0;
    const discountPercent = hasDiscount && originalPrice > 0
      ? Math.round((discountAmount / originalPrice) * 100)
      : 0;

    discount = {
      hasDiscount,
      realPrice: originalPrice,
      discountedPrice: finalPrice,
      discountAmount,
      discountPercent,
    };
  }

  // Size styling maps
  const sizeStyles = {
    xs: {
      current: 'text-xs font-bold',
      real: 'text-[10px]',
      badge: 'text-[9px] px-1.5 py-0.5',
    },
    sm: {
      current: 'text-sm font-black',
      real: 'text-xs',
      badge: 'text-[10px] px-2 py-0.5',
    },
    md: {
      current: 'text-base font-black',
      real: 'text-xs',
      badge: 'text-[11px] px-2.5 py-0.5',
    },
    lg: {
      current: 'text-lg font-black',
      real: 'text-sm',
      badge: 'text-xs px-2.5 py-1',
    },
  }[size];

  if (!discount.hasDiscount) {
    return (
      <span className={`${sizeStyles.current} ${muted ? 'text-stone-600' : 'text-stone-900'} ${className}`}>
        {formatPrice(discount.discountedPrice)}
      </span>
    );
  }

  return (
    <div
      className={`inline-flex ${
        layout === 'col' ? 'flex-col items-start gap-0.5' : 'items-center gap-2 flex-wrap'
      } ${className}`}
      dir="rtl"
    >
      {/* Real / Original Struck-through Price */}
      <span
        className={`line-through font-normal tabular-nums text-stone-400 ${sizeStyles.real}`}
        title={`قیمت اصلی بدون تخفیف: ${formatPrice(discount.realPrice)}`}
      >
        {formatPrice(discount.realPrice)}
      </span>

      {/* Discounted Payable Price */}
      <span
        className={`${sizeStyles.current} text-emerald-800 tabular-nums`}
        title={`قیمت با تخفیف ویژه: ${formatPrice(discount.discountedPrice)}`}
      >
        {formatPrice(discount.discountedPrice)}
      </span>

      {/* Discount Badge */}
      {showBadge && (
        <span
          className={`inline-flex items-center gap-0.5 font-bold rounded-full bg-emerald-100/90 text-emerald-800 border border-emerald-300/60 shadow-2xs ${sizeStyles.badge}`}
        >
          <span>{badgeLabel || `${toPersianDigits(discount.discountPercent)}٪ تخفیف`}</span>
        </span>
      )}
    </div>
  );
};
