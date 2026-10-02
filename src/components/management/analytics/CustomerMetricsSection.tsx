import React from 'react';
import { AnalyticsSummary } from '../../../types';
import { toPersianDigits } from '../../../utils/dateUtils';
import { formatPrice } from '../../../utils/formatUtils';
import { Users, Crown, Sparkles, ChevronLeft, ArrowUpRight } from 'lucide-react';

interface CustomerMetricsSectionProps {
  summary: AnalyticsSummary;
  onOpenCustomerDossier: (customerId: string) => void;
}

export const CustomerMetricsSection: React.FC<CustomerMetricsSectionProps> = ({
  summary,
  onOpenCustomerDossier,
}) => {
  const { customerMetrics } = summary;
  const {
    activeCustomersCount,
    newCustomersCount,
    returningCustomersCount,
    avgCustomerValue,
    topCustomers,
  } = customerMetrics;

  return (
    <div className="bg-white/75 backdrop-blur-md border border-white/80 rounded-2xl p-3 sm:p-3.5 text-stone-900 shadow-2xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white via-[#fbdcd9] to-[#d88d85] shadow-glow-pink flex items-center justify-center border border-white/60 text-stone-900 shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-xs sm:text-sm">
              تحلیل و هوش مراجعین
            </h3>
            <p className="text-[9px] text-stone-500 font-mono">تحلیل وفاداری، مراجعین جدید و مراجعین برتر</p>
          </div>
        </div>

        <div className="text-[10px] text-stone-500 font-mono">
          میانگین ارزش هر مشتری: <strong className="text-stone-900 font-bold">{formatPrice(avgCustomerValue)}</strong>
        </div>
      </div>

      {/* Customer Quick Stats Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <div className="bg-stone-50/80 border border-stone-100/80 rounded-xl p-2 text-center">
          <span className="text-[9px] text-stone-500 font-mono block mb-0.5">مراجعین فعال دوره</span>
          <span className="text-base font-bold font-mono text-stone-900">{toPersianDigits(activeCustomersCount)} نفر</span>
        </div>
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-2 text-center">
          <span className="text-[9px] text-stone-600 font-mono block mb-0.5">مراجعین وفادار</span>
          <span className="text-base font-bold font-mono text-emerald-700">{toPersianDigits(returningCustomersCount)} نفر</span>
        </div>
        <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-2 text-center">
          <span className="text-[9px] text-stone-600 font-mono block mb-0.5">مشتریان جدید</span>
          <span className="text-base font-bold font-mono text-amber-700">{toPersianDigits(newCustomersCount)} نفر</span>
        </div>
        <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-2 text-center">
          <span className="text-[9px] text-stone-600 font-mono block mb-0.5">نرخ وفاداری</span>
          <span className="text-base font-bold font-mono text-purple-700">
            ٪{toPersianDigits(activeCustomersCount > 0 ? Math.round((returningCustomersCount / activeCustomersCount) * 100) : 0)}
          </span>
        </div>
      </div>

      {/* Top Clients Table */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold text-stone-700 mb-1 flex items-center justify-between">
          <span>۱۰ مشتری با بالاترین میزان حضور و خرید:</span>
        </div>

        {topCustomers.length === 0 ? (
          <div className="p-6 text-center text-stone-400 text-xs bg-stone-50 rounded-xl border border-stone-200/60">
            اطلاعات مشتریان برای این بازه موجود نیست.
          </div>
        ) : (
          topCustomers.map((client, idx) => (
            <div
              key={client.customerId || idx}
              onClick={() => onOpenCustomerDossier(client.customerId)}
              className="group p-2.5 sm:p-3 bg-white/70 hover:bg-white/95 border border-white/90 hover:border-stone-300/80 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-2 shadow-2xs hover:shadow-xs"
            >
              {/* Left Info */}
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-bold font-mono flex items-center justify-center shrink-0">
                  {toPersianDigits(idx + 1)}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-stone-900 text-xs group-hover:text-[#b2665e] transition-colors">
                      {client.customerName}
                    </span>
                    {client.memberId && (
                      <span className="text-[9px] text-stone-400 font-mono">{client.memberId}</span>
                    )}
                  </div>
                  <div className="text-[9px] text-stone-500 font-mono mt-0.5 flex items-center gap-1.5">
                    <span>{toPersianDigits(client.visitsCount)} نوبت خدمات</span>
                    {client.ordersCount > 0 && (
                      <>
                        <span>·</span>
                        <span>{toPersianDigits(client.ordersCount)} سفارش</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Spend */}
              <div className="text-left flex items-center gap-2">
                <div>
                  <div className="text-xs sm:text-sm font-bold font-mono text-stone-900">
                    {formatPrice(client.totalSpend)}
                  </div>
                  <span className="text-[9px] text-[#b2665e] flex items-center gap-0.5 justify-end group-hover:underline">
                    پرونده <ChevronLeft className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
