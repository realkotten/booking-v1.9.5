import React from 'react';
import { Plus, Receipt, Sparkles } from 'lucide-react';
import { PriceSummary } from '../utils/pricingUtils';
import { formatPrice } from '../utils/formatUtils';
import { toPersianDigits } from '../utils/dateUtils';

interface Props {
  summary: PriceSummary;
  variant?: 'compact' | 'full';
  className?: string;
}

export const PriceSummaryCard: React.FC<Props> = ({ summary, variant = 'full', className = '' }) => {
  if (variant === 'compact') {
    // Sticky bar / inline total (BookDateTimeView)
    return (
      <div
        dir="rtl"
        className={`flex items-center justify-between rounded-2xl edge-light-subtle px-4 py-2.5 ${className}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-600">مبلغ قابل پرداخت</span>
          {summary.hasDiscount && (
            <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 font-bold border border-emerald-300/60">
              {toPersianDigits(summary.discountPercent)}٪ تخفیف
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {summary.hasDiscount && (
            <span className="line-through text-stone-400 text-xs tabular-nums">
              {formatPrice(summary.originalTotal)}
            </span>
          )}
          <span className={`text-sm font-black tabular-nums ${summary.hasDiscount ? 'text-emerald-800' : 'text-stone-900'}`}>
            {summary.total > 0 ? formatPrice(summary.total) : '—'}
          </span>
        </div>
      </div>
    );
  }

  // Itemized receipt (BookCheckoutView)
  return (
    <div
      dir="rtl"
      className={`rounded-[24px] edge-light-card p-4 ${className}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-xs font-black text-stone-700">
          <Receipt className="h-4 w-4 text-stone-700" />
          ریز صورتحساب
        </h3>
        {summary.hasDiscount && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
            تخفیف ویژه اعمال شد
          </span>
        )}
      </div>

      {summary.lines.length === 0 ? (
        <p className="py-3 text-center text-xs text-stone-400">هنوز سرویسی انتخاب نشده است</p>
      ) : (
        <ul className="space-y-2">
          {summary.lines.map((line) => {
            const isDiscountLine = line.kind === 'discount';
            return (
              <li
                key={line.id}
                className={`flex items-baseline justify-between gap-2 text-xs ${
                  isDiscountLine ? 'text-emerald-700 font-bold bg-emerald-50/60 p-1.5 rounded-xl border border-emerald-200/50' : ''
                }`}
              >
                <span className={`flex items-center gap-1.5 ${isDiscountLine ? 'font-black text-emerald-800' : 'font-semibold text-stone-700'}`}>
                  {line.kind === 'addon' && <Plus className="h-3 w-3 shrink-0 text-stone-400" />}
                  {isDiscountLine && <Sparkles className="h-3 w-3 shrink-0 text-emerald-600" />}
                  {line.label}
                </span>
                <span className="flex-1 border-b border-dotted border-stone-300/80" aria-hidden="true" />
                <div className="shrink-0 flex items-center gap-1.5 tabular-nums">
                  {line.originalAmount && (
                    <span className="line-through text-stone-400 text-[10px] font-normal">
                      {formatPrice(line.originalAmount)}
                    </span>
                  )}
                  <span className={`font-bold ${isDiscountLine ? 'text-emerald-800' : 'text-stone-800'}`}>
                    {isDiscountLine ? `- ${formatPrice(line.discountAmount || Math.abs(line.amount))}` : formatPrice(line.amount)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Total Section */}
      <div className="mt-3 border-t border-stone-900/10 pt-3 space-y-1.5">
        {summary.hasDiscount && (
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>مبلغ قبل از تخفیف</span>
            <span className="line-through tabular-nums">{formatPrice(summary.originalTotal)}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-stone-900 block">مبلغ نهایی قابل پرداخت</span>
            {summary.hasDiscount && (
              <span className="text-[10px] font-bold text-emerald-700">
                سود شما از این رزرو: {formatPrice(summary.discountAmount)}
              </span>
            )}
          </div>
          <span className={`text-base font-black tabular-nums ${summary.hasDiscount ? 'text-emerald-800' : 'text-stone-900'}`}>
            {formatPrice(summary.total)}
          </span>
        </div>
      </div>

      <p className="mt-2 text-[10px] leading-4 text-stone-400">
        بر اساس تعرفه لحظه‌ای سالن؛ مبلغ پس از تأیید نوبت قطعی می‌شود.
      </p>
    </div>
  );
};
