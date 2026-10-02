import React, { useState, useMemo } from 'react';
import { useAtelier } from '../../store/AtelierContext';
import { 
  AnalyticsPeriod, 
  AnalyticsCustomRange, 
  ServicePerformanceMetric, 
} from '../../types';
import { 
  calculateAnalyticsSummary, 
  DEFAULT_FINANCIAL_TARGETS 
} from '../../utils/analyticsUtils';

// Modular Analytics Components
import { AnalyticsHeader } from './analytics/AnalyticsHeader';
import { FinancialKpiCards } from './analytics/FinancialKpiCards';
import { FinancialTargetCard } from './analytics/FinancialTargetCard';
import { AppointmentKpisSection } from './analytics/AppointmentKpisSection';
import { AnalyticsTrendsSection } from './analytics/AnalyticsTrendsSection';
import { ServicePerformanceSection } from './analytics/ServicePerformanceSection';
import { CustomerMetricsSection } from './analytics/CustomerMetricsSection';
import { DemandAnalyticsSection } from './analytics/DemandAnalyticsSection';
import { AnalyticsDetailModal, InspectionModalType } from './analytics/AnalyticsDetailModal';
import { Flame, DollarSign, Clock, Users, BarChart3, Sparkles } from 'lucide-react';

interface AnalyticsViewProps {
  onOpenDossier?: (customerId: string) => void;
  defaultMode?: 'demand' | 'financial';
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ 
  onOpenDossier,
  defaultMode = 'demand'
}) => {
  const {
    appointments,
    pastAppointments,
    customers,
    services,
    setSelectedClientForDossier,
  } = useAtelier();

  // Mode state: 'demand' (focused on requested hours, days & constraints) vs 'financial' (KPIs & revenue)
  const [analyticsMode, setAnalyticsMode] = useState<'demand' | 'financial'>(defaultMode);

  // State
  const [period, setPeriod] = useState<AnalyticsPeriod>('today');
  const [customRange, setCustomRange] = useState<AnalyticsCustomRange>({
    startDay: 19,
    endDay: 25,
  });
  const [customTargets, setCustomTargets] = useState<Record<AnalyticsPeriod, number>>(DEFAULT_FINANCIAL_TARGETS);

  // Inspection Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [inspectionType, setInspectionType] = useState<InspectionModalType>('total');

  // Derive Analytics Summary with memoization
  const summary = useMemo(() => {
    return calculateAnalyticsSummary(
      appointments,
      pastAppointments,
      [],
      customers,
      services,
      [],
      period,
      customRange,
      customTargets[period]
    );
  }, [appointments, pastAppointments, customers, services, period, customRange, customTargets]);

  const handleUpdateTarget = (newTarget: number) => {
    setCustomTargets((prev) => ({
      ...prev,
      [period]: newTarget,
    }));
  };

  const handleOpenInspection = (type: InspectionModalType) => {
    setInspectionType(type);
    setIsDetailModalOpen(true);
  };

  const handleOpenClientDossier = (customerId: string) => {
    const client = customers.find((c) => c.id === customerId);
    if (client) {
      setSelectedClientForDossier(client);
    }
    if (onOpenDossier) {
      onOpenDossier(customerId);
    }
  };

  return (
    <div id="analytics-view-container" className="space-y-3 pb-3 text-stone-900 w-full max-w-full overflow-x-hidden" dir="rtl">
      {/* 1. Main Analytics Mode Selector */}
      <div className="flex gap-1.5 rounded-2xl border border-white/80 bg-white/70 p-1 shadow-2xs backdrop-blur-md w-full">
        <button
          type="button"
          onClick={() => setAnalyticsMode('demand')}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2.5 text-xs font-bold transition-all cursor-pointer ${
            analyticsMode === 'demand'
              ? 'bg-[#ea5848] text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          <Flame className={`h-3.5 w-3.5 ${analyticsMode === 'demand' ? 'text-amber-200' : 'text-stone-500'}`} />
          <span>تحلیل تقاضای ساعات و روزها</span>
        </button>

        <button
          type="button"
          onClick={() => setAnalyticsMode('financial')}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2.5 text-xs font-bold transition-all cursor-pointer ${
            analyticsMode === 'financial'
              ? 'bg-[#ea5848] text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          <BarChart3 className={`h-3.5 w-3.5 ${analyticsMode === 'financial' ? 'text-white' : 'text-stone-500'}`} />
          <span>شاخص‌های مالی و درآمدی</span>
        </button>
      </div>

      {/* 2. Content based on active mode */}
      {analyticsMode === 'demand' ? (
        <div className="space-y-3">
          <DemandAnalyticsSection />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Header & Period Filter */}
          <AnalyticsHeader
            period={period}
            onPeriodChange={(p) => setPeriod(p)}
            customRange={customRange}
            onCustomRangeChange={(r) => setCustomRange(r)}
            dateRangeDescription={summary.dateRangeDescription}
            isTargetMet={summary.financialTarget.isTargetMet}
            achievedPct={summary.financialTarget.achievedPct}
            onOpenTargetModal={() => handleOpenInspection('total')}
          />

          {/* Core Financial KPI Cards */}
          <FinancialKpiCards
            summary={summary}
            onSelectInspection={(type) => handleOpenInspection(type)}
          />

          {/* Financial Target & Budget Progress Card */}
          <FinancialTargetCard
            currentRevenue={summary.financialTarget.currentRevenue}
            targetAmount={summary.financialTarget.targetAmount}
            achievedPct={summary.financialTarget.achievedPct}
            remainingAmount={summary.financialTarget.remainingAmount}
            isTargetMet={summary.financialTarget.isTargetMet}
            periodLabel={summary.periodLabel}
            onUpdateTarget={handleUpdateTarget}
          />

          {/* Appointment & Capacity KPIs */}
          <AppointmentKpisSection
            summary={summary}
            onInspectAppointments={(filter) => handleOpenInspection('appointments')}
          />

          {/* Interactive Visual Trends (Revenue & Appointment curves) */}
          <AnalyticsTrendsSection
            revenueTrend={summary.revenueTrend}
            appointmentTrend={summary.appointmentTrend}
            period={period}
          />

          {/* Service Rituals Ranking */}
          <ServicePerformanceSection
            services={summary.servicePerformance}
            onSelectService={(serviceId) => handleOpenInspection('service')}
          />

          {/* Customer Loyalty & VIP Ranking */}
          <CustomerMetricsSection
            summary={summary}
            onOpenCustomerDossier={handleOpenClientDossier}
          />
        </div>
      )}

      {/* Deep Drill-down Detail Modal */}
      <AnalyticsDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        inspectionType={inspectionType}
        summary={summary}
        onOpenCustomerDossier={handleOpenClientDossier}
      />
    </div>
  );
};
