import { Accoutrement, PriceLine, PriceSummarySnapshot, Service } from '../types';
import { toPersianDigits } from './dateUtils';

export type { PriceLine, PriceSummarySnapshot };

export interface DiscountInfo {
  hasDiscount: boolean;
  realPrice: number;
  discountedPrice: number;
  discountAmount: number;
  discountPercent: number;
}

/**
 * Returns clean discount metrics for any service.
 * Supports services where realPrice > price, or discountedPrice is set.
 */
export function getDiscountInfo(service: Service | null | undefined): DiscountInfo {
  if (!service) {
    return {
      hasDiscount: false,
      realPrice: 0,
      discountedPrice: 0,
      discountAmount: 0,
      discountPercent: 0,
    };
  }

  const rawPrice = Number.isFinite(service.price) ? service.price : 0;
  const rawRealPrice = Number.isFinite(service.realPrice) && (service.realPrice ?? 0) > 0
    ? (service.realPrice as number)
    : 0;
  const rawDiscountedPrice = Number.isFinite(service.discountedPrice) && (service.discountedPrice ?? 0) > 0
    ? (service.discountedPrice as number)
    : 0;

  let realPrice = rawRealPrice || rawPrice;
  let payablePrice = rawPrice;

  if (rawDiscountedPrice > 0 && rawDiscountedPrice < realPrice) {
    payablePrice = rawDiscountedPrice;
  } else if (rawRealPrice > 0 && rawPrice > 0 && rawPrice < rawRealPrice) {
    payablePrice = rawPrice;
    realPrice = rawRealPrice;
  }

  const hasDiscount = Boolean(realPrice > payablePrice && payablePrice > 0);
  const discountAmount = hasDiscount ? realPrice - payablePrice : 0;
  const discountPercent = hasDiscount && realPrice > 0
    ? Math.round((discountAmount / realPrice) * 100)
    : 0;

  return {
    hasDiscount,
    realPrice,
    discountedPrice: payablePrice,
    discountAmount,
    discountPercent,
  };
}

export interface PriceSummary {
  lines: PriceLine[];
  serviceBase: number;
  serviceRealPrice: number;
  discountAmount: number;
  discountPercent: number;
  hasDiscount: boolean;
  addOnsTotal: number;
  total: number;
  originalTotal: number;
}

/**
 * Single source of truth for booking totals with itemized discount lines.
 * Live during the flow — the caller freezes a snapshot at confirmation.
 */
export const calculateBookingTotal = (
  service: Service | null | undefined,
  accoutrements: Accoutrement[] | undefined
): PriceSummary => {
  const lines: PriceLine[] = [];
  const discountInfo = getDiscountInfo(service);
  const serviceBase = discountInfo.discountedPrice;
  const serviceRealPrice = discountInfo.realPrice;

  if (service) {
    lines.push({
      id: `svc-${service.id}`,
      label: service.name,
      amount: serviceBase,
      originalAmount: discountInfo.hasDiscount ? serviceRealPrice : undefined,
      discountAmount: discountInfo.hasDiscount ? discountInfo.discountAmount : undefined,
      kind: 'service',
    });
  }

  let addOnsTotal = 0;
  for (const a of accoutrements ?? []) {
    if (!a.selected) continue;
    const amount = a.price ?? 0;
    addOnsTotal += amount;
    lines.push({
      id: `add-${a.id}`,
      label: a.name,
      amount,
      kind: 'addon',
    });
  }

  if (discountInfo.hasDiscount && discountInfo.discountAmount > 0) {
    lines.push({
      id: `disc-${service?.id}`,
      label: `تخفیف ویژه سالن (${toPersianDigits(discountInfo.discountPercent)}٪)`,
      amount: -discountInfo.discountAmount,
      discountAmount: discountInfo.discountAmount,
      kind: 'discount',
    });
  }

  const total = serviceBase + addOnsTotal;
  const originalTotal = serviceRealPrice + addOnsTotal;

  return {
    lines,
    serviceBase,
    serviceRealPrice,
    discountAmount: discountInfo.discountAmount,
    discountPercent: discountInfo.discountPercent,
    hasDiscount: discountInfo.hasDiscount,
    addOnsTotal,
    total,
    originalTotal,
  };
};
