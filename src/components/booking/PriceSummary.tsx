import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, ChevronUp, Clock, Sparkles } from 'lucide-react';
import { Accoutrement, Service } from '../../types';
import { calculateBookingTotals } from '../../utils/bookingUtils';
import { formatPrice } from '../../utils/formatUtils';
import { toPersianDigits } from '../../utils/dateUtils';
import { hapticLight, hapticStepAdvance } from '../../utils/hapticUtils';
import { Button } from '@/components/ui/button';

interface PriceSummaryProps {
  service: Service | null;
  accoutrements: Accoutrement[];
  beverage?: { name: string; price: number } | null;
  ctaLabel: string;
  onCta: () => void;
  ctaDisabled?: boolean;
  disabledHint?: string;
}

export const PriceSummary: React.FC<PriceSummaryProps> = ({
  service, accoutrements, beverage, ctaLabel, onCta, ctaDisabled = false, disabledHint,
}) => {
  const [expanded, setExpanded] = useState(false);
  const totals = useMemo(() => calculateBookingTotals(service, accoutrements), [service, accoutrements]);

  const beveragePrice = beverage?.price || 0;
  const grandTotal = totals.total + beveragePrice;
  const grandOriginalTotal = totals.originalTotal + beveragePrice;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-30 flex justify-center px-4">
      <div className="pointer-events-auto w-full max-w-md overflow-hidden rounded-[26px] nav-dock-3d shadow-xl">
        {/* Breakdown toggle */}
        <button
          type="button"
          onClick={() => {
            hapticLight();
            setExpanded((e) => !e);
          }}
          className="flex w-full items-center justify-between px-4 py-2 text-[11px] font-bold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#bf5938]" />
              مدت کل: {toPersianDigits(totals.totalDuration)} دقیقه
            </span>
            {totals.hasDiscount && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.2 font-black border border-emerald-300/60 shadow-2xs">
                <Sparkles className="w-2.5 h-2.5 text-emerald-700" />
                {toPersianDigits(totals.discountPercent)}٪ تخفیف
              </span>
            )}
          </div>
          <span className="flex items-center gap-1">
            {expanded ? 'بستن جزئیات' : 'مشاهده جزئیات'}
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </span>
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-stone-200/70"
            >
              <div className="space-y-1.5 px-4 py-3 text-xs bg-stone-50/70">
                <div className="flex items-center justify-between">
                  <span className="text-stone-700">{service?.name ?? 'خدمتی انتخاب نشده'}</span>
                  <div className="flex items-center gap-1.5">
                    {totals.hasDiscount && (
                      <span className="line-through text-stone-400 text-[10px] tabular-nums">
                        {formatPrice(totals.serviceRealPrice)}
                      </span>
                    )}
                    <span className={`font-bold tabular-nums ${totals.hasDiscount ? 'text-emerald-800' : 'text-stone-900'}`}>
                      {formatPrice(totals.servicePrice)}
                    </span>
                  </div>
                </div>

                {/* Dedicated Discount Savings Row */}
                {totals.hasDiscount && (
                  <div className="flex items-center justify-between text-emerald-700 font-bold bg-emerald-50/80 px-2 py-1 rounded-lg border border-emerald-200/60">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      تخفیف ویژه اعمال‌شده ({toPersianDigits(totals.discountPercent)}٪)
                    </span>
                    <span className="tabular-nums">- {formatPrice(totals.discountAmount)}</span>
                  </div>
                )}

                {totals.selectedExtras.map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-stone-600">
                    <span>+ {a.name}</span>
                    <span className="font-medium text-stone-800 tabular-nums">{formatPrice(a.price)}</span>
                  </div>
                ))}
                {beverage && beverage.name && beverage.name !== 'بدون پذیرایی' && (
                  <div className="flex items-center justify-between text-stone-600">
                    <span>+ پذیرایی: {beverage.name}</span>
                    <span className={beverage.price > 0 ? 'font-bold text-stone-800 tabular-nums' : 'text-emerald-700 font-bold'}>
                      {beverage.price > 0 ? formatPrice(beverage.price) : 'رایگان'}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Total + CTA */}
        <div className="flex items-center justify-between gap-3 border-t border-stone-200/70 px-4 py-3">
          <div className="shrink-0 text-right min-w-[90px]">
            <div className="flex items-center gap-1">
              <p className="text-[10px] font-bold text-stone-500 whitespace-nowrap">مبلغ قابل پرداخت</p>
              {totals.hasDiscount && (
                <span className="text-[8px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-full whitespace-nowrap">
                  {toPersianDigits(totals.discountPercent)}٪-
                </span>
              )}
            </div>
            <div className="flex flex-col items-start mt-0.5 leading-tight">
              {totals.hasDiscount && (
                <span className="line-through text-stone-500 decoration-stone-400 text-[11px] font-medium tabular-nums whitespace-nowrap leading-tight">
                  {formatPrice(grandOriginalTotal)}
                </span>
              )}
              <p className={`text-sm font-black tabular-nums whitespace-nowrap leading-tight ${totals.hasDiscount ? 'text-emerald-900' : 'text-stone-950'}`}>
                {formatPrice(grandTotal)}
              </p>
            </div>
          </div>
          <Button
            variant="accent"
            size="lg"
            onClick={() => {
              hapticStepAdvance();
              onCta();
            }}
            disabled={ctaDisabled}
            title={ctaDisabled ? disabledHint : undefined}
            className="flex-1 min-w-[160px] rounded-[16px] py-3.5 px-3 text-xs font-black transition-all cursor-pointer whitespace-nowrap text-center shadow-md"
          >
            {ctaLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
