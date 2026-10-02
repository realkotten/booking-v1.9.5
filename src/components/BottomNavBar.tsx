import React from 'react';
import { NavigationTab } from '../types';
import { Home, Calendar, CalendarCheck, User } from 'lucide-react';
import { useAtelier } from '../store/AtelierContext';

interface BottomNavBarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { currentCustomer, appointments } = useAtelier();

  const isHomeActive = activeTab === 'atelier';
  const isBookActive = activeTab === 'book';
  const isMyBookingsActive = activeTab === 'my_bookings' || activeTab === 'visits';
  const isProfileActive = activeTab === 'client';

  // Count active upcoming appointments for badge
  const upcomingCount = React.useMemo(() => {
    if (!currentCustomer || !appointments) return 0;
    const clean = (p?: string) => (p ? p.replace(/\D/g, '') : '');
    const userPhone = clean(currentCustomer.phone);
    return appointments.filter((a) => {
      const isMine = 
        a.customerId === currentCustomer.id || 
        (userPhone && clean(a.customerPhone) === userPhone) ||
        a.customerName?.trim().toLowerCase() === currentCustomer.name?.trim().toLowerCase();
      return isMine && (a.status === 'confirmed' || a.status === 'in_progress' || a.status === 'reserved');
    }).length;
  }, [appointments, currentCustomer]);

  return (
    <div
      id="royal-bottom-dock-container"
      className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none pb-3.5 px-3"
    >
      <div className="max-w-[390px] mx-auto w-full">
        {/* Floating dock pill */}
        <nav
          id="soft-vitality-nav-dock"
          aria-label="منوی ناوبری اصلی"
          className="pointer-events-auto w-full nav-dock-3d text-slate-700 rounded-[30px] px-2.5 py-1.5 flex items-center justify-between"
          dir="rtl"
        >
          {/* 1. Home Tab (خانه) */}
          <button
            id="nav-tab-home"
            type="button"
            onClick={() => onTabChange('atelier')}
            className={`group relative flex-1 flex flex-col items-center justify-center min-h-[46px] transition-all duration-200 select-none cursor-pointer ${
              isHomeActive ? 'text-[#0f172a] font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div
              className={`relative flex items-center justify-center px-4 py-1 rounded-full transition-all duration-200 ${
                isHomeActive ? 'bg-[#fdf2ee] border border-[#f3d0c4] scale-105 shadow-xs' : 'bg-transparent'
              }`}
            >
              <Home
                className={`w-[20px] h-[20px] transition-transform duration-200 ${
                  isHomeActive ? 'text-[#bf5938] stroke-[2.3]' : 'text-slate-500 stroke-[1.8] group-hover:scale-110'
                }`}
              />
            </div>
            <span
              className={`text-[11px] mt-0.5 tracking-tight whitespace-nowrap transition-all duration-200 ${
                isHomeActive ? 'font-bold text-[#bf5938]' : 'font-medium text-slate-500'
              }`}
            >
              خانه
            </span>
          </button>

          {/* 2. Book Tab (رزرو نوبت) */}
          <button
            id="nav-tab-book"
            type="button"
            onClick={() => onTabChange('book')}
            className={`group relative flex-1 flex flex-col items-center justify-center min-h-[46px] transition-all duration-200 select-none cursor-pointer ${
              isBookActive ? 'text-[#0f172a] font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div
              className={`relative flex items-center justify-center px-4 py-1 rounded-full transition-all duration-200 ${
                isBookActive ? 'bg-[#fdf2ee] border border-[#f3d0c4] scale-105 shadow-xs' : 'bg-transparent'
              }`}
            >
              <Calendar
                className={`w-[20px] h-[20px] transition-transform duration-200 ${
                  isBookActive ? 'text-[#bf5938] stroke-[2.3]' : 'text-slate-500 stroke-[1.8] group-hover:scale-110'
                }`}
              />
            </div>
            <span
              className={`text-[11px] mt-0.5 tracking-tight whitespace-nowrap transition-all duration-200 ${
                isBookActive ? 'font-bold text-[#bf5938]' : 'font-medium text-slate-500'
              }`}
            >
              رزرو نوبت
            </span>
          </button>

          {/* 3. Appointments Tab (نوبت‌های من) */}
          <button
            id="nav-tab-my-bookings"
            type="button"
            onClick={() => onTabChange('my_bookings')}
            className={`group relative flex-1 flex flex-col items-center justify-center min-h-[46px] transition-all duration-200 select-none cursor-pointer ${
              isMyBookingsActive ? 'text-[#0f172a] font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div
              className={`relative flex items-center justify-center px-4 py-1 rounded-full transition-all duration-200 ${
                isMyBookingsActive ? 'bg-[#fdf2ee] border border-[#f3d0c4] scale-105 shadow-xs' : 'bg-transparent'
              }`}
            >
              <CalendarCheck
                className={`w-[20px] h-[20px] transition-transform duration-200 ${
                  isMyBookingsActive ? 'text-[#bf5938] stroke-[2.3]' : 'text-slate-500 stroke-[1.8] group-hover:scale-110'
                }`}
              />

              {upcomingCount > 0 && (
                <span className="absolute -top-0.5 -right-1 min-w-[17px] h-[17px] px-1 bg-[#bf5938] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs border border-white leading-none animate-in zoom-in-50">
                  {upcomingCount}
                </span>
              )}
            </div>
            <span
              className={`text-[11px] mt-0.5 tracking-tight whitespace-nowrap transition-all duration-200 ${
                isMyBookingsActive ? 'font-bold text-[#bf5938]' : 'font-medium text-slate-500'
              }`}
            >
              نوبت‌های من
            </span>
          </button>

          {/* 4. Profile Tab with Circular Photo Avatar */}
          <button
            id="nav-tab-profile"
            type="button"
            onClick={() => onTabChange('client')}
            className={`group relative flex-1 flex flex-col items-center justify-center min-h-[46px] transition-all duration-200 select-none cursor-pointer ${
              isProfileActive ? 'text-[#0f172a] font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div
              className={`relative flex items-center justify-center px-3.5 py-1 rounded-full transition-all duration-200 ${
                isProfileActive ? 'bg-[#fdf2ee] border border-[#f3d0c4] scale-105 shadow-xs' : 'bg-transparent'
              }`}
            >
              {currentCustomer?.avatarUrl ? (
                <div className="relative">
                  <img
                    src={currentCustomer.avatarUrl}
                    alt={currentCustomer.name}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className={`w-[22px] h-[22px] rounded-full object-cover border transition-all duration-200 ${
                      isProfileActive
                        ? 'border-[#bf5938] ring-2 ring-[#bf5938]/30 shadow-xs'
                        : 'border-white shadow-2xs group-hover:scale-105'
                    }`}
                  />
                </div>
              ) : (
                <User
                  className={`w-[20px] h-[20px] transition-transform duration-200 ${
                    isProfileActive ? 'text-[#bf5938] stroke-[2.3]' : 'text-slate-500 stroke-[1.8] group-hover:scale-110'
                  }`}
                />
              )}
            </div>
            <span
              className={`text-[11px] mt-0.5 tracking-tight whitespace-nowrap transition-all duration-200 ${
                isProfileActive ? 'font-bold text-[#bf5938]' : 'font-medium text-slate-500'
              }`}
            >
              پروفایل
            </span>
          </button>
        </nav>
      </div>
    </div>
  );
};
