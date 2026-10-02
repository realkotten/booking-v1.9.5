import React, { useState, useMemo } from 'react';
import { useAtelier } from '../../../store/AtelierContext';
import { AnalyticsPeriod, AnalyticsSummary, Appointment } from '../../../types';
import { calculateAnalyticsSummary } from '../../../utils/analyticsUtils';
import { downloadCSV, generateFinancialReportCSV } from '../../../utils/reportExportUtils';
import { toPersianDigits } from '../../../utils/dateUtils';
import { formatPrice } from '../../../utils/formatUtils';
import { 
  FileText, 
  Printer, 
  Download, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Scissors, 
  Users, 
  CheckCircle, 
  Clock, 
  Award,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { AnalyticsDetailModal } from '../analytics/AnalyticsDetailModal';

export const ReportsView: React.FC = () => {
  const { 
    appointments, 
    pastAppointments, 
    customers, 
    services, 
    settings, 
    setSelectedClientForDossier, 
    setSelectedAppointmentForDetails 
  } = useAtelier();

  // Period Selection
  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>('month');
  const [customRange, setCustomRange] = useState<{ startDay: number; endDay: number }>({
    startDay: 1,
    endDay: 22,
  });

  // Active Report Tab
  const [activeReportTab, setActiveReportTab] = useState<'financial' | 'services' | 'customers'>('financial');

  // Detail Modal State
  const [drillDownModal, setDrillDownModal] = useState<{
    isOpen: boolean;
    inspectionType: 'total' | 'service' | 'transactions' | 'appointments';
  }>({
    isOpen: false,
    inspectionType: 'total',
  });

  // Calculate dynamic analytics summary with target from settings
  const targetRevenue = settings.financialTargets[selectedPeriod] || 18000;
  const summary: AnalyticsSummary = useMemo(() => {
    return calculateAnalyticsSummary(
      appointments,
      pastAppointments,
      [],
      customers,
      services,
      [],
      selectedPeriod,
      selectedPeriod === 'custom' ? customRange : undefined,
      targetRevenue
    );
  }, [appointments, pastAppointments, customers, services, selectedPeriod, targetRevenue, customRange]);

  // Export CSV Handler
  const handleExportCSV = () => {
    const csvContent = generateFinancialReportCSV(summary);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `Atelier_Report_${summary.period}_${dateStr}.csv`;
    downloadCSV(filename, csvContent);
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="reports-view-container" className="space-y-4 animate-fade-in w-full max-w-full overflow-x-hidden" dir="rtl">
      {/* Top Header & Export Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl clay-card bg-white/90 border border-white/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#ea5848]/10 border border-[#ea5848]/20 text-[#ea5848] flex items-center justify-center shadow-xs shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-serif font-black text-stone-900 flex items-center gap-2">
              <span>گزارش‌ها و صورت‌های تفکیکی آتلیه</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              استخراج، تجزیه و تحلیل شاخص‌های مالی و عملکرد آتلیه
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 text-xs font-bold border border-stone-200 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-[#ea5848]" />
            <span>خروجی CSV</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-[#ea5848] hover:bg-[#d64434] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-[#ea5848]/20 cursor-pointer active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>چاپ گزارش</span>
          </button>
        </div>
      </div>

      {/* Period Filter Bar */}
      <div className="p-3 sm:p-3.5 rounded-2xl clay-card-subtle bg-white/80 border border-white/70 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-stone-100/90 p-1 rounded-xl border border-stone-200/80">
          {[
            { id: 'today', label: 'امروز' },
            { id: 'week', label: 'هفته جاری' },
            { id: 'month', label: 'ماه جاری' },
            { id: 'year', label: 'سال ۱۴۰۳' },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPeriod(p.id as AnalyticsPeriod)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedPeriod === p.id
                  ? 'bg-[#ea5848] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-stone-500 flex items-center gap-1.5 font-mono">
          <Calendar className="w-3.5 h-3.5 text-stone-400" />
          <span>محدوده:</span>
          <strong className="text-stone-800">{summary.dateRangeDescription}</strong>
        </div>
      </div>

      {/* Report Type Tabs (Multi-line wrap without horizontal scrolling) */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl clay-card-subtle bg-white/80 border border-white/70 shadow-sm w-full">
        {[
          { id: 'financial', label: 'گزارش مالی و تراز کل', icon: DollarSign },
          { id: 'services', label: 'عملکرد آیین‌های پیرایش', icon: Scissors },
          { id: 'customers', label: 'فعالیت و وفاداری مشتریان', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReportTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveReportTab(tab.id as any)}
              className={`py-2 px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer grow sm:grow-0 ${
                isActive
                  ? 'bg-[#ea5848] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/80'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#ffebe6]' : 'text-stone-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: FINANCIAL SUMMARY REPORT ────────────────────────── */}
      {activeReportTab === 'financial' && (
        <div className="space-y-4 animate-fade-in">
          {/* Top High-level Financial KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div 
              onClick={() => setDrillDownModal({
                isOpen: true,
                inspectionType: 'total'
              })}
              className="p-3.5 rounded-2xl clay-card bg-white/80 border border-white/80 hover:border-stone-300 transition-colors cursor-pointer space-y-1.5 shadow-2xs"
            >
              <span className="text-[10px] text-stone-500 font-bold block">درآمد کل آتلیه</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-mono font-bold text-stone-900">
                  {formatPrice(summary.totalRevenue)}
                </span>
              </div>
              <div className="text-[10px] text-stone-500 font-mono">
                {toPersianDigits(summary.transactionCount)} تراکنش موفق
              </div>
            </div>

            <div 
              onClick={() => setDrillDownModal({
                isOpen: true,
                inspectionType: 'service'
              })}
              className="p-3.5 rounded-2xl clay-card bg-white/80 border border-white/80 hover:border-stone-300 transition-colors cursor-pointer space-y-1.5 shadow-2xs"
            >
              <span className="text-[10px] text-stone-500 font-bold block">درآمد آیین‌های پیرایش</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-mono font-bold text-[#ea5848]">
                  {formatPrice(summary.serviceRevenue)}
                </span>
              </div>
              <div className="text-[10px] text-emerald-700 font-bold font-mono">
                {toPersianDigits(summary.servicePct)}٪ از کل درآمد
              </div>
            </div>

            <div 
              onClick={() => setDrillDownModal({
                isOpen: true,
                inspectionType: 'appointments'
              })}
              className="p-3.5 rounded-2xl clay-card bg-white/80 border border-white/80 hover:border-stone-300 transition-colors cursor-pointer space-y-1.5 shadow-2xs"
            >
              <span className="text-[10px] text-stone-500 font-bold block">ضریب اشغال تقویم</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-mono font-bold text-amber-700">
                  ٪{toPersianDigits(summary.occupancyRate || 0)}
                </span>
              </div>
              <div className="text-[10px] text-amber-700 font-bold">
                بهره‌وری صندلی
              </div>
            </div>

            <div className="p-3.5 rounded-2xl clay-card bg-white/80 border border-white/80 space-y-1.5 shadow-2xs">
              <span className="text-[10px] text-stone-500 font-bold block">میانگین فاکتور (ATV)</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-mono font-bold text-stone-900">
                  {formatPrice(summary.avgTransactionValue)}
                </span>
              </div>
              <div className="text-[10px] text-stone-500">
                شاخص بهره‌وری به ازای هر مراجعه
              </div>
            </div>
          </div>

          {/* Target & Budget Progress */}
          <div className="p-4 sm:p-5 rounded-3xl clay-card bg-white/90 border border-white/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 font-serif">
                  تحقق هدف و بودجه مالی دوره
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-stone-700">
                {formatPrice(summary.financialTarget.currentRevenue)} / {formatPrice(summary.financialTarget.targetAmount)}
              </span>
            </div>

            <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#ea5848] to-amber-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, summary.financialTarget.achievedPct)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-stone-600 pt-1">
              <span>
                درصد تحقق: <strong className="text-emerald-700 font-mono font-bold">{toPersianDigits(summary.financialTarget.achievedPct)}٪</strong>
              </span>
              <span>
                باقیمانده تا تارگت: <strong className="text-stone-800 font-mono font-bold">{formatPrice(summary.financialTarget.remainingAmount)}</strong>
              </span>
            </div>
          </div>

          {/* Operational Appointment Metrics Table */}
          <div className="p-4 sm:p-5 rounded-3xl clay-card bg-white/90 border border-white/80 shadow-sm space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-stone-900 font-serif">
              جدول شاخص‌های بهره‌وری و نوبت‌دهی آتلیه
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 text-right">
                <span className="text-[10px] text-stone-500 block">نوبت‌های رزروشده</span>
                <span className="text-base font-mono font-bold text-stone-900">
                  {toPersianDigits(summary.totalAppointments)}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-right">
                <span className="text-[10px] text-emerald-800 block">نوبت‌های تکمیل‌شده</span>
                <span className="text-base font-mono font-bold text-emerald-700">
                  {toPersianDigits(summary.completedAppointments)}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200/80 text-right">
                <span className="text-[10px] text-rose-800 block">لغوشده / کنسلی</span>
                <span className="text-base font-mono font-bold text-rose-700">
                  {toPersianDigits(summary.cancelledAppointments)}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-right">
                <span className="text-[10px] text-amber-800 block">عدم حضور (No-Show)</span>
                <span className="text-base font-mono font-bold text-amber-700">
                  {toPersianDigits(summary.noShowAppointments)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: SERVICE PERFORMANCE REPORT ────────────────────────── */}
      {activeReportTab === 'services' && (
        <div className="space-y-3 animate-fade-in">
          <div className="rounded-3xl clay-card bg-white/90 border border-white/80 p-4 shadow-sm space-y-2">
            <h3 className="text-xs sm:text-sm font-bold text-stone-900 font-serif pb-2 border-b border-stone-100">
              عملکرد و درآمد به تفکیک آیین‌های پیرایش
            </h3>
            <div className="space-y-2">
              {summary.servicePerformance.map((service, idx) => (
                <div key={service.serviceId} className="p-3 rounded-2xl bg-white/80 border border-stone-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#ea5848]/10 text-[#ea5848] flex items-center justify-center text-xs font-mono font-bold shrink-0">
                      {toPersianDigits(idx + 1)}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900">{service.name}</h4>
                      <span className="text-[10px] text-stone-500">
                        {service.category === 'haircut' ? 'پیرایش مو' : service.category === 'beard' ? 'طراحی ریش' : 'آیین جامع'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 text-xs pt-1 sm:pt-0 border-t sm:border-t-0 border-stone-100 font-mono">
                    <div className="text-right sm:text-left">
                      <span className="text-[9px] text-stone-400 block sm:hidden">رزرو / تکمیل</span>
                      <span className="text-stone-700 font-bold">{toPersianDigits(service.completedCount)}</span>
                      <span className="text-stone-400 text-[10px]"> / {toPersianDigits(service.totalBookings)}</span>
                    </div>
                    <div className="text-left">
                      <span className="text-[9px] text-stone-400 block sm:hidden">درآمد</span>
                      <span className="font-bold text-[#ea5848]">{formatPrice(service.revenue)}</span>
                    </div>
                    <div className="w-12 text-left">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                        ٪{toPersianDigits(service.revenuePct)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: CUSTOMER ACTIVITY REPORT ────────────────────────── */}
      {activeReportTab === 'customers' && (
        <div className="space-y-3 animate-fade-in">
          {/* Customer Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl clay-card bg-white/80 border border-white/80 shadow-2xs">
              <span className="text-[10px] text-stone-500 font-bold block">مشتریان فعال دوره</span>
              <span className="text-lg sm:text-xl font-mono font-bold text-stone-900">
                {toPersianDigits(summary.customerMetrics.activeCustomersCount)}
              </span>
            </div>
            <div className="p-3 rounded-2xl clay-card bg-white/80 border border-white/80 shadow-2xs">
              <span className="text-[10px] text-emerald-700 font-bold block">مشتریان جدید آتلیه</span>
              <span className="text-lg sm:text-xl font-mono font-bold text-emerald-700">
                {toPersianDigits(summary.customerMetrics.newCustomersCount)}
              </span>
            </div>
            <div className="p-3 rounded-2xl clay-card bg-white/80 border border-white/80 shadow-2xs">
              <span className="text-[10px] text-[#ea5848] font-bold block">مشتریان وفادار / بازگشتی</span>
              <span className="text-lg sm:text-xl font-mono font-bold text-[#ea5848]">
                {toPersianDigits(summary.customerMetrics.returningCustomersCount)}
              </span>
            </div>
            <div className="p-3 rounded-2xl clay-card bg-white/80 border border-white/80 shadow-2xs">
              <span className="text-[10px] text-stone-500 font-bold block">میانگین ارزش مشتری (CLV)</span>
              <span className="text-lg sm:text-xl font-mono font-bold text-stone-900">
                {formatPrice(summary.customerMetrics.avgCustomerValue)}
              </span>
            </div>
          </div>

          {/* Top VIP Clients List */}
          <div className="rounded-3xl clay-card bg-white/90 border border-white/80 p-4 shadow-sm space-y-2">
            <h3 className="text-xs sm:text-sm font-bold text-stone-900 font-serif pb-2 border-b border-stone-100">
              برترین مراجعین و اعضای وفادار
            </h3>
            <div className="space-y-2">
              {summary.customerMetrics.topCustomers.map((cust, idx) => {
                const clientObj = customers.find(c => c.id === cust.customerId);
                return (
                  <div key={cust.customerId} className="p-3 rounded-2xl bg-white/80 border border-stone-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#ea5848]/10 text-[#ea5848] flex items-center justify-center text-xs font-mono font-bold shrink-0">
                        {toPersianDigits(idx + 1)}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-stone-900">{cust.customerName}</h4>
                        <span className="text-[10px] text-stone-500 font-mono" dir="ltr">
                          {cust.memberId || '-'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 text-xs pt-1 sm:pt-0 border-t sm:border-t-0 border-stone-100 font-mono">
                      <div className="text-stone-700 font-bold">
                        {toPersianDigits(cust.visitsCount)} نوبت
                      </div>
                      <div className="font-bold text-stone-900">
                        {formatPrice(cust.totalSpend)}
                      </div>
                      {clientObj && (
                        <button
                          type="button"
                          onClick={() => setSelectedClientForDossier(clientObj)}
                          className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-[#ea5848] text-stone-700 hover:text-white text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          پرونده
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Drill-down Modal */}
      <AnalyticsDetailModal
        isOpen={drillDownModal.isOpen}
        onClose={() => setDrillDownModal({ ...drillDownModal, isOpen: false })}
        inspectionType={drillDownModal.inspectionType}
        summary={summary}
        onOpenCustomerDossier={(customerId) => {
          setDrillDownModal({ ...drillDownModal, isOpen: false });
          const client = customers.find((c) => c.id === customerId);
          if (client) {
            setSelectedClientForDossier(client);
          }
        }}
      />
    </div>
  );
};
