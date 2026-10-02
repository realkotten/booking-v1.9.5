import React, { useState, Suspense, lazy } from 'react';
import { useAtelier } from '../../store/AtelierContext';
import { ManagementTab } from '../../types';
import { AtelierShell } from '../AtelierShell';
import { TodayView } from './TodayView';
import { DynamicIslandNotificationCenter } from '../notifications/DynamicIslandNotificationCenter';
import { 
  Clock, 
  Calendar, 
  Users, 
  TrendingUp, 
  Sparkles,
  Bell,
  ChevronDown,
  Scissors,
  Armchair,
  FileText,
  Sliders,
  BarChart3,
  LogOut,
  Menu,
  X,
  Flame,
  Activity,
  Layers,
  CheckCircle2,
  ChevronLeft,
  Type
} from 'lucide-react';
import { toPersianDigits } from '../../utils/dateUtils';
import { FontSelectorModal } from '../common/FontSelectorModal';
import { getSelectedFont, FontOption } from '../../utils/fontManager';

// Code-split heavy management sub-views
const ScheduleView = lazy(() => import('./ScheduleView').then(m => ({ default: m.ScheduleView })));
const ClientsView = lazy(() => import('./ClientsView').then(m => ({ default: m.ClientsView })));
const AnalyticsView = lazy(() => import('./AnalyticsView').then(m => ({ default: m.AnalyticsView })));
const ServiceManagementView = lazy(() => import('./ServiceManagementView').then(m => ({ default: m.ServiceManagementView })));
const ReportsView = lazy(() => import('./reports/ReportsView').then(m => ({ default: m.ReportsView })));
const StudioSettingsView = lazy(() => import('./settings/StudioSettingsView').then(m => ({ default: m.StudioSettingsView })));
const ClientDossierModal = lazy(() => import('./ClientDossierModal').then(m => ({ default: m.ClientDossierModal })));

const SubViewLoading = () => (
  <div className="flex-1 min-h-[300px] flex items-center justify-center p-8">
    <div className="w-6 h-6 border-2 border-[#5a4a58] border-t-transparent rounded-full animate-spin" />
  </div>
);

export const ManagementShell: React.FC = () => {
  const { 
    managementTab, 
    setManagementTab, 
    managementSubTab,
    setManagementSubTab,
    logoutManagement,
    activeChair,
    activeBarber,
    customers,
    selectedClientForDossier,
    setSelectedClientForDossier,
  } = useAtelier();

  const [isFontModalOpen, setIsFontModalOpen] = useState(false);
  const [currentFont, setCurrentFont] = useState<FontOption>(() => getSelectedFont());

  React.useEffect(() => {
    const handleFontChange = (e: any) => {
      if (e.detail?.font) {
        setCurrentFont(e.detail.font);
      }
    };
    window.addEventListener('atelier-font-changed', handleFontChange);
    return () => window.removeEventListener('atelier-font-changed', handleFontChange);
  }, []);

  const handleOpenDossier = (customerId?: string) => {
    if (customerId) {
      const client = customers.find((c) => c.id === customerId);
      if (client) {
        setSelectedClientForDossier(client);
        return;
      }
    }
    setManagementTab('analytics');
    setManagementSubTab('clients');
  };

  return (
    <AtelierShell
      id="management-shell-container"
      isWideLayout={true}
      headerContent={
        <div className="w-full flex items-center justify-between gap-1 sm:gap-3" dir="rtl">
          {/* Right side: Studio Management Text & Barber Info */}
          <div className="text-right shrink-0 min-w-0">
            <h1 className="text-xs sm:text-sm font-serif font-black text-stone-900 leading-tight truncate">
              مدیریت رویال
            </h1>
            <p className="text-[9px] text-stone-600 font-mono mt-0.5 truncate hidden xs:block sm:block">
              {activeBarber?.name || 'آرایشگر'} · {activeChair?.name || 'صندلی'}
            </p>
          </div>

          {/* Center: Dynamic Island Notification Center */}
          <div className="flex-1 flex justify-center items-center min-w-0 px-1">
            <DynamicIslandNotificationCenter onNavigateToTab={setManagementTab as any} />
          </div>

          {/* Left side: Font selector button & Short Exit Button ("نمای مشتری") */}
          <div className="shrink-0 flex items-center gap-1.5">
            {/* Admin Font & Typography Switcher */}
            <button
              id="admin-font-selector-button"
              type="button"
              onClick={() => setIsFontModalOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-b from-white to-[#f1f5f9] hover:from-white hover:to-[#e2e8f0] text-stone-800 text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-1.5 rounded-full transition-all shadow-sm border border-white ring-1 ring-white/80 cursor-pointer active:scale-95 whitespace-nowrap"
              title="تغییر قلم و فونت سامانه"
            >
              <Type className="w-3 h-3 text-[#5a4a58]" />
              <span className="hidden sm:inline">{currentFont.nameFa}</span>
              <span className="sm:hidden">قلم</span>
            </button>

            <button
              type="button"
              onClick={logoutManagement}
              className="flex items-center gap-1 bg-gradient-to-b from-white to-[#f1f5f9] hover:from-white hover:to-[#e2e8f0] text-[#0f172a] text-[10px] sm:text-[11px] font-black px-2.5 sm:px-3 py-1.5 rounded-full transition-all shadow-sm border border-white ring-1 ring-white/80 cursor-pointer active:scale-95 whitespace-nowrap"
              title="خروج از پنل مدیریت و بازگشت به نمای مشتری"
            >
              <LogOut className="w-3 h-3 text-[#0f172a] shrink-0" />
              <span>نمای مشتری</span>
            </button>
          </div>
        </div>
      }
    >
      {/* 2. Main Dashboard Canvas (Fluid Flow Across Full Screen, Matching Client Portal) */}
      <section
        id="management-main-card"
        className="relative z-20 w-full max-w-full px-2.5 sm:px-6 pt-1 sm:pt-2 pb-24 sm:pb-32 flex-1 min-h-0 overflow-y-auto overflow-x-hidden scroll-smooth overscroll-contain space-y-3 sm:space-y-4"
        dir="rtl"
      >
        <Suspense fallback={<SubViewLoading />}>
          {managementTab === 'today' && <TodayView onOpenDossier={handleOpenDossier} />}
          {managementTab === 'schedule' && <ScheduleView onOpenDossier={handleOpenDossier} />}
          {managementTab === 'clients' && (
            <ClientsView
              onOpenDossier={(cId) => {
                const client = customers.find((c) => c.id === cId);
                if (client) setSelectedClientForDossier(client);
              }}
            />
          )}
          {managementTab === 'analytics' && (
            <div className="space-y-3 sm:space-y-4 w-full max-w-full overflow-x-hidden">
              {/* Analytics & Configuration Hub Sub-Navigation Bar */}
              <div 
                id="management-subtabs-bar"
                className="sticky top-0 z-20 grid grid-cols-2 sm:grid-cols-4 p-1 clay-card-subtle rounded-xl gap-1 bg-white/95 border border-white/70 shadow-sm w-full"
              >
                {[
                  { id: 'overview', label: 'آمار و تقاضا', icon: BarChart3 },
                  { id: 'clients', label: 'مشتریان', icon: Users },
                  { id: 'reports', label: 'گزارش‌ها', icon: FileText },
                  { id: 'services', label: 'خدمات', icon: Scissors },
                ].map((st) => {
                  const Icon = st.icon;
                  const isSelected = managementSubTab === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setManagementSubTab(st.id as any)}
                      className={`py-1.5 px-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-b from-white to-[#f1f5f9] text-[#0f172a] font-black shadow-xs border border-white ring-1 ring-white/80'
                          : 'text-stone-700 hover:text-stone-900 hover:bg-white/80'
                      }`}
                    >
                      <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${isSelected ? 'text-[#0f172a]' : 'text-stone-500'}`} />
                      <span className="truncate">{st.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Render Subtab View */}
              {managementSubTab === 'overview' && <AnalyticsView onOpenDossier={handleOpenDossier} />}
              {managementSubTab === 'clients' && (
                <ClientsView
                  onOpenDossier={(cId) => {
                    const client = customers.find((c) => c.id === cId);
                    if (client) setSelectedClientForDossier(client);
                  }}
                />
              )}
              {managementSubTab === 'reports' && <ReportsView />}
              {managementSubTab === 'services' && <ServiceManagementView />}
              {managementSubTab === 'settings' && <StudioSettingsView />}
            </div>
          )}
          {managementTab === 'settings' && <StudioSettingsView />}
        </Suspense>
      </section>

      {/* Client Dossier Detail & History Modal */}
      <Suspense fallback={null}>
        <ClientDossierModal
          customer={selectedClientForDossier}
          isOpen={!!selectedClientForDossier}
          onClose={() => setSelectedClientForDossier(null)}
          onNavigateToSchedule={() => setManagementTab('schedule')}
        />
      </Suspense>

      {/* 3. Bottom Floating Navigation Dock */}
      <div
        id="management-bottom-dock-container"
        className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-2 sm:pb-3"
      >
        <div className="px-3 max-w-sm sm:max-w-md mx-auto">
          <nav
            id="management-bottom-dock"
            aria-label="منوی ناوبری مدیریت آتلیه"
            className="pointer-events-auto nav-dock-3d rounded-full px-2.5 sm:px-3 py-1 flex items-center justify-between"
            dir="rtl"
          >
            {/* Today Tab */}
            <button
              id="mgmt-tab-today"
              type="button"
              onClick={() => setManagementTab('today')}
              className={`flex flex-col items-center justify-center flex-1 min-h-[38px] sm:min-h-[44px] py-0.5 transition-all cursor-pointer ${
                managementTab === 'today'
                  ? 'text-stone-950 font-bold scale-105'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {managementTab === 'today' && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-stone-900" />
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] font-medium tracking-normal mt-0.5">
                امروز
              </span>
            </button>

            {/* Schedule Tab */}
            <button
              id="mgmt-tab-schedule"
              type="button"
              onClick={() => setManagementTab('schedule')}
              className={`flex flex-col items-center justify-center flex-1 min-h-[38px] sm:min-h-[44px] py-0.5 transition-all cursor-pointer ${
                managementTab === 'schedule'
                  ? 'text-stone-950 font-bold scale-105'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {managementTab === 'schedule' && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-stone-900" />
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] font-medium tracking-normal mt-0.5">
                برنامه
              </span>
            </button>

            {/* Analytics & Stats Tab */}
            <button
              id="mgmt-tab-analytics"
              type="button"
              onClick={() => setManagementTab('analytics')}
              className={`flex flex-col items-center justify-center flex-1 min-h-[38px] sm:min-h-[44px] py-0.5 transition-all cursor-pointer ${
                managementTab === 'analytics'
                  ? 'text-stone-950 font-bold scale-105'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {managementTab === 'analytics' && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-stone-900" />
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] font-medium tracking-normal mt-0.5">
                آمار
              </span>
            </button>

            {/* Settings Tab */}
            <button
              id="mgmt-tab-settings"
              type="button"
              onClick={() => setManagementTab('settings')}
              className={`flex flex-col items-center justify-center flex-1 min-h-[44px] py-1 transition-all cursor-pointer ${
                managementTab === 'settings'
                  ? 'text-stone-950 font-bold scale-105'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Sliders className="w-4 h-4" />
                {managementTab === 'settings' && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-stone-900" />
                )}
              </div>
              <span className="text-[10px] font-medium tracking-normal mt-0.5">
                تنظیمات
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Font & Typography Selector Modal */}
      <FontSelectorModal
        isOpen={isFontModalOpen}
        onClose={() => setIsFontModalOpen(false)}
      />
    </AtelierShell>
  );
};
