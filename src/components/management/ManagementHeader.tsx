import React, { useState } from 'react';
import { useAtelier } from '../../store/AtelierContext';
import { useLiveClock } from '../../hooks/useLiveClock';
import { 
  Bell, 
  Sparkles, 
  Radio, 
  Armchair, 
  ChevronDown, 
  ExternalLink,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { toPersianDigits } from '../../utils/dateUtils';

interface ManagementHeaderProps {
  onOpenNotifications?: () => void;
}

export const ManagementHeader: React.FC<ManagementHeaderProps> = ({ onOpenNotifications }) => {
  const { 
    studio, 
    chairs, 
    activeChair, 
    setActiveChair, 
    activeBarber, 
    notifications, 
    setPortalMode,
    markNotificationAsRead
  } = useAtelier();

  const liveClock = useLiveClock(1000);
  const [showChairSelector, setShowChairSelector] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#141210]/95 backdrop-blur-md border-b border-[#2d2925]/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
        
        {/* Left / Start Section: Studio Identity & Live Status */}
        <div className="flex items-center justify-between md:justify-start gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#24201c] border border-[#3b352e] flex items-center justify-center text-[#d97706] shadow-inner">
              <Armchair className="w-5 h-5 text-[#fdc4c2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg tracking-wide text-[#f5f2eb] font-medium">
                  {studio.name}
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#a89f91] bg-[#221e1a] px-1.5 py-0.5 rounded border border-[#342f29]">
                  مدیریت آتلیه
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-[#a89f91]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 font-medium">استودیو آنلاین</span>
                <span className="text-[#4a4237]">·</span>
                <span className="text-[#c7bfb1] text-[11px]">{liveClock.solarDate.dateString}</span>
                <span className="text-[#4a4237]">·</span>
                <span className="text-[#fdc4c2] font-mono text-[11px] font-bold bg-[#24201c] px-1.5 py-0.5 rounded border border-[#342f29]/80 flex items-center gap-1" dir="ltr">
                  <Clock className="w-3 h-3 text-[#d88d85]" />
                  <span>{liveClock.fullTimeStringPersian}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center / Chair & Master Identity */}
        <div className="relative">
          <button
            onClick={() => setShowChairSelector(!showChairSelector)}
            className="w-full md:w-auto flex items-center justify-between gap-3 px-3.5 py-2 rounded-lg bg-[#1c1916] hover:bg-[#24201c] border border-[#342f29] transition-all text-right group"
            title="تغییر سوئیت و صندلی فعال"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-[#d97706]"></div>
              <div>
                <p className="text-xs font-semibold text-[#f5f2eb] group-hover:text-[#fdc4c2] transition-colors">
                  {activeChair.name}
                </p>
                <p className="text-[11px] text-[#9e9484]">
                  {activeBarber.name} · {activeChair.floor}
                </p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-[#7d7365] group-hover:text-[#c7bfb1] transition-transform" />
          </button>

          {/* Chair Dropdown Menu */}
          {showChairSelector && (
            <div className="absolute top-full mt-2 left-0 right-0 md:left-auto md:w-72 bg-[#1c1916] border border-[#3b352e] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <p className="text-[11px] text-[#8c8273] font-medium px-2 py-1 border-b border-[#2d2925] mb-1">
                انتخاب سوئیت فعال
              </p>
              {chairs.map((chair) => (
                <button
                  key={chair.id}
                  onClick={() => {
                    setActiveChair(chair);
                    setShowChairSelector(false);
                  }}
                  className={`w-full text-right p-2.5 rounded-lg flex items-center justify-between text-xs transition-colors ${
                    activeChair.id === chair.id
                      ? 'bg-[#2b251f] text-[#fdc4c2] font-semibold border border-[#4a3f33]'
                      : 'text-[#d4ccbe] hover:bg-[#25201b]'
                  }`}
                >
                  <div>
                    <p className="font-medium">{chair.name}</p>
                    <p className="text-[10px] text-[#8c8273]">{chair.assignedBarberName}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right / Quick Actions & Portal Switch */}
        <div className="flex items-center justify-end gap-2.5">
          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotificationsDropdown(!showNotificationsDropdown);
                if (onOpenNotifications) onOpenNotifications();
              }}
              className="relative p-2 rounded-lg bg-[#1c1916] hover:bg-[#24201c] border border-[#342f29] text-[#c7bfb1] hover:text-[#f5f2eb] transition-colors"
              title="اعلان‌ها و رویدادها"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#ef4444] text-[10px] font-bold text-white shadow-md animate-pulse">
                  {toPersianDigits(unreadCount)}
                </span>
              )}
            </button>

            {/* Notifications Quick Preview Popover */}
            {showNotificationsDropdown && (
              <div className="absolute top-full mt-2 left-0 md:left-auto md:right-0 w-80 bg-[#1a1714] border border-[#3b352e] rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-[#2d2925] mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#f5f2eb]">
                    <Bell className="w-3.5 h-3.5 text-[#fdc4c2]" />
                    <span>اعلان‌های استودیو</span>
                  </div>
                  <span className="text-[10px] text-[#8c8273] font-mono">
                    {toPersianDigits(unreadCount)} خوانده‌نشده
                  </span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {notifications.slice(0, 4).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                        notif.isRead
                          ? 'bg-[#151311] border-[#29241f] text-[#8c8273]'
                          : 'bg-[#221e1a] border-[#443a2e] text-[#e8dfd3]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-[#f5f2eb] text-[11px]">{notif.title}</span>
                        <span className="text-[9px] text-[#8c8273] font-mono">{notif.timestamp}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-[#b5ab9d]">{notif.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Switch to Customer Portal Action */}
          <button
            onClick={() => setPortalMode('client')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-[#2a241e] to-[#201c18] hover:from-[#352d25] hover:to-[#2a241e] border border-[#443a2e] text-xs font-medium text-[#fdc4c2] hover:text-[#fff] shadow-sm transition-all group"
            title="مشاهده پورتال رزرو و تجربه مشتری"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#fdc4c2] group-hover:rotate-12 transition-transform" />
            <span>پورتال مشتریان</span>
            <ExternalLink className="w-3 h-3 text-[#a89f91] opacity-70 group-hover:opacity-100" />
          </button>
        </div>

      </div>
    </header>
  );
};
