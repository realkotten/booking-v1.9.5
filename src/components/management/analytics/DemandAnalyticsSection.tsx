import React, { useState, useMemo } from 'react';
import {
  HourlyDemandDetail,
  DayOfWeekDemandDetail,
  DateDemandDetail,
  TopDemandingUser,
  CustomerConstraintRecord,
} from '../../../utils/bookingUtils';
import { useAtelier } from '../../../store/AtelierContext';
import { toPersianDigits } from '../../../utils/dateUtils';
import {
  Clock,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Flame,
  Search,
  Zap,
  BarChart2,
  GraduationCap,
  Sparkles,
  CalendarDays,
  Activity,
  Layers,
  Phone,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

// Custom Persian Tooltip Component for Recharts
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  unit?: string;
}

const CustomChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, unit = 'درخواست' }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-xl border border-stone-200 bg-white/95 p-2.5 shadow-xl backdrop-blur-md text-right text-[10px]" dir="rtl">
      {label && (
        <p className="font-bold text-stone-900 mb-1 pb-1 border-b border-stone-100">
          {toPersianDigits(label)}
        </p>
      )}
      <div className="space-y-0.5">
        {payload.map((entry, index) => (
          <div key={`tooltip-${index}`} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="text-stone-600 font-medium">{entry.name}:</span>
            </div>
            <span className="font-bold text-stone-900 font-mono">
              {toPersianDigits(entry.value)} {unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DemandAnalyticsSection: React.FC = () => {
  const { demandInsights } = useAtelier();
  const demandData = demandInsights;

  const [expandedHour, setExpandedHour] = useState<string | null>(null);
  const [constraintSearch, setConstraintSearch] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'hours' | 'days' | 'constraints'>('overview');

  const topHour = demandData.mostDemandedHours[0];
  const topWeekday = demandData.mostDemandedWeekdays[0];

  // 1. Prepare Hourly Chart Data (Sorted by chronologic operational hours 09:00 to 22:00)
  const hourlyChartData = useMemo(() => {
    // Sort logically by chronological time
    const sorted = [...demandData.mostDemandedHours].sort((a, b) => {
      const numA = parseFloat(a.hour.replace(':', '.'));
      const numB = parseFloat(b.hour.replace(':', '.'));
      return numA - numB;
    });

    return sorted.map((h) => ({
      hour: h.hour,
      hourLabel: toPersianDigits(h.hour),
      totalDemand: h.totalDemand,
      reservedCount: h.reservedCount,
      missedDemand: h.missedDemandCount,
      uniqueUsers: h.demandingUsers.length,
    }));
  }, [demandData.mostDemandedHours]);

  // 2. Prepare Weekday Chart Data in proper Persian sequence (Saturday to Friday)
  const weekdayChartData = useMemo(() => {
    const persianWeekOrder = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
    const weekdayMap = new Map(demandData.mostDemandedWeekdays.map((w) => [w.weekday, w]));

    return persianWeekOrder.map((day) => {
      const existing = weekdayMap.get(day);
      return {
        weekday: day,
        count: existing ? existing.count : 0,
        percentage: existing ? existing.percentage : 0,
      };
    });
  }, [demandData.mostDemandedWeekdays]);

  // 3. Daypart Peak Demand Windows (Clean Linear Cards & Metrics - No Circles!)
  const daypartsData = useMemo(() => {
    let morning = 0; // 09:00 - 12:00
    let midday = 0;  // 12:00 - 16:30
    let evening = 0; // 16:30 - 21:00
    let night = 0;   // 21:00 - 23:00

    demandData.mostDemandedHours.forEach((h) => {
      const hourNum = parseFloat(h.hour.replace(':', '.'));
      if (hourNum < 12.0) {
        morning += h.totalDemand;
      } else if (hourNum < 16.5) {
        midday += h.totalDemand;
      } else if (hourNum < 21.0) {
        evening += h.totalDemand;
      } else {
        night += h.totalDemand;
      }
    });

    const total = (morning + midday + evening + night) || 1;

    return [
      {
        id: 'evening',
        title: 'عصر و اوج تقاضا',
        timeRange: '۱۶:۳۰ الی ۲۱:۰۰',
        count: evening,
        percentage: Math.round((evening / total) * 100),
        barColor: 'bg-[#ea5848]',
        badgeText: 'بیشترین ترافیک سالن',
        description: 'ساعات خاتمه کار اداری، شرکت‌ها و کلاس‌های دانشگاهی',
      },
      {
        id: 'morning',
        title: 'صبحگاه اختصاصی',
        timeRange: '۰۹:۰۰ الی ۱۲:۰۰',
        count: morning,
        percentage: Math.round((morning / total) * 100),
        barColor: 'bg-amber-500',
        badgeText: 'مشاغل آزاد و پزشکان',
        description: 'مشتریان با ساعات کاری منعطف و قرار ملاقات‌های صبح',
      },
      {
        id: 'midday',
        title: 'میان‌روز آرام',
        timeRange: '۱۲:۰۰ الی ۱۶:۳۰',
        count: midday,
        percentage: Math.round((midday / total) * 100),
        barColor: 'bg-emerald-500',
        badgeText: 'فرصت تخفیف و پر کردن صندلی',
        description: 'بازه مناسب جهت اختصاص تخفیف‌های زمان خلوت',
      },
      {
        id: 'night',
        title: 'پایان شب VIP',
        timeRange: '۲۱:۰۰ الی ۲۳:۰۰',
        count: night,
        percentage: Math.round((night / total) * 100),
        barColor: 'bg-purple-500',
        badgeText: 'خدمات ویژه',
        description: 'رزروهای خاص و خدمات جامع تشریفاتی',
      },
    ];
  }, [demandData.mostDemandedHours]);

  // Dayparts chart data formatted for Recharts Bar / Area display
  const daypartsChartData = useMemo(() => {
    return [
      {
        id: 'morning',
        name: 'صبحگاه',
        timeRange: '۰۹:۰۰ الی ۱۲:۰۰',
        fullTitle: 'صبحگاه اختصاصی',
        count: daypartsData.find((d) => d.id === 'morning')?.count || 0,
        percentage: daypartsData.find((d) => d.id === 'morning')?.percentage || 0,
        fill: '#f59e0b',
        badgeText: 'مشاغل آزاد و پزشکان',
      },
      {
        id: 'midday',
        name: 'میان‌روز',
        timeRange: '۱۲:۰۰ الی ۱۶:۳۰',
        fullTitle: 'میان‌روز آرام',
        count: daypartsData.find((d) => d.id === 'midday')?.count || 0,
        percentage: daypartsData.find((d) => d.id === 'midday')?.percentage || 0,
        fill: '#10b981',
        badgeText: 'فرصت تخفیف',
      },
      {
        id: 'evening',
        name: 'عصر (پیک)',
        timeRange: '۱۶:۳۰ الی ۲۱:۰۰',
        fullTitle: 'عصر و اوج تقاضا',
        count: daypartsData.find((d) => d.id === 'evening')?.count || 0,
        percentage: daypartsData.find((d) => d.id === 'evening')?.percentage || 0,
        fill: '#d88d85',
        badgeText: 'بیشترین ترافیک سالن',
      },
      {
        id: 'night',
        name: 'شب VIP',
        timeRange: '۲۱:۰۰ الی ۲۳:۰۰',
        fullTitle: 'پایان شب VIP',
        count: daypartsData.find((d) => d.id === 'night')?.count || 0,
        percentage: daypartsData.find((d) => d.id === 'night')?.percentage || 0,
        fill: '#a855f7',
        badgeText: 'خدمات ویژه',
      },
    ];
  }, [daypartsData]);

  // 4. Constraint Stats & Clean Linear Bar Data (No Circles!)
  const constraintStats = useMemo(() => {
    const total = demandData.customerConstraints.length || 1;
    const fixedOffice = demandData.customerConstraints.filter((c) => c.workPatternType === 'fixed_office').length;
    const rotationalShift = demandData.customerConstraints.filter((c) => c.workPatternType === 'shift_rotational').length;
    const university = demandData.customerConstraints.filter((c) => c.workPatternType === 'university').length;
    const weekendOnly = demandData.customerConstraints.filter((c) => c.workPatternType === 'weekend_only').length;

    // Day frequency of unavailability
    const dayUnavailableCounts: Record<string, number> = {};
    demandData.customerConstraints.forEach((c) => {
      c.unavailableDays.forEach((d) => {
        dayUnavailableCounts[d] = (dayUnavailableCounts[d] || 0) + 1;
      });
    });

    const persianWeekDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
    const unavailableDaysChart = persianWeekDays.map((day) => ({
      day,
      count: dayUnavailableCounts[day] || 0,
    }));

    const patternMetrics = [
      {
        label: 'ساعات اداری ثابت (۸ تا ۱۷)',
        count: fixedOffice,
        percentage: Math.round((fixedOffice / total) * 100),
        barColor: 'bg-blue-500',
        textColor: 'text-blue-400',
      },
      {
        label: 'شیفت‌های چرخشی و بیمارستان',
        count: rotationalShift,
        percentage: Math.round((rotationalShift / total) * 100),
        barColor: 'bg-amber-500',
        textColor: 'text-amber-400',
      },
      {
        label: 'دانشجو و محصل',
        count: university,
        percentage: Math.round((university / total) * 100),
        barColor: 'bg-emerald-500',
        textColor: 'text-emerald-400',
      },
      {
        label: 'فقط تعطیلات و آخر هفته',
        count: weekendOnly,
        percentage: Math.round((weekendOnly / total) * 100),
        barColor: 'bg-purple-500',
        textColor: 'text-purple-400',
      },
    ];

    return {
      fixedOfficePct: Math.round((fixedOffice / total) * 100),
      rotationalShiftPct: Math.round((rotationalShift / total) * 100),
      universityPct: Math.round((university / total) * 100),
      weekendOnlyPct: Math.round((weekendOnly / total) * 100),
      unavailableDaysChart,
      patternMetrics,
    };
  }, [demandData.customerConstraints]);

  // Filtered Constraints
  const filteredConstraints = useMemo(() => {
    if (!constraintSearch.trim()) return demandData.customerConstraints;
    const query = constraintSearch.toLowerCase();
    return demandData.customerConstraints.filter(
      (c) =>
        c.customerName.toLowerCase().includes(query) ||
        c.customerPhone?.includes(query) ||
        c.patternNote.toLowerCase().includes(query) ||
        c.unavailableDays.some((d) => d.includes(query))
    );
  }, [demandData.customerConstraints, constraintSearch]);

  return (
    <div className="space-y-3 w-full max-w-full text-stone-900" dir="rtl">
      {/* 1. Executive Summary KPI Grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {/* Card 1 */}
        <div className="rounded-2xl border border-white/80 bg-white/75 backdrop-blur-md p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-stone-500">
            <Flame className="h-3.5 w-3.5 text-rose-500 shrink-0" />
            <span className="text-[10px] font-bold truncate">اوج تقاضای ساعتی</span>
          </div>
          <div className="mt-1.5">
            <div className="text-sm sm:text-base font-bold text-stone-900 font-mono">
              {topHour ? `ساعت ${toPersianDigits(topHour.hour)}` : '—'}
            </div>
            <div className="text-[10px] text-rose-600 font-bold mt-0.5 font-mono">
              {topHour ? `${toPersianDigits(topHour.totalDemand)} درخواست نوبت` : ''}
            </div>
          </div>
          <p className="mt-1 pt-1 border-t border-stone-100 text-[9px] text-stone-400 leading-tight font-mono">
            {topHour ? `${toPersianDigits(topHour.missedDemandCount)} تقاضای مازاد` : ''}
          </p>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl border border-white/80 bg-white/75 backdrop-blur-md p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-stone-500">
            <Calendar className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span className="text-[10px] font-bold truncate">پیک تقاضای روز</span>
          </div>
          <div className="mt-1.5">
            <div className="text-sm sm:text-base font-bold text-stone-900">
              {topWeekday ? topWeekday.weekday : '—'}
            </div>
            <div className="text-[10px] text-emerald-700 font-bold mt-0.5 font-mono">
              {topWeekday ? `${toPersianDigits(topWeekday.percentage)}٪ کل درخواست‌ها` : ''}
            </div>
          </div>
          <p className="mt-1 pt-1 border-t border-stone-100 text-[9px] text-stone-400 leading-tight">
            بیشترین تمرکز در پایان هفته
          </p>
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl border border-white/80 bg-white/75 backdrop-blur-md p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-stone-500">
            <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <span className="text-[10px] font-bold truncate">بازه اوج کار</span>
          </div>
          <div className="mt-1.5">
            <div className="text-sm sm:text-base font-bold text-stone-900 font-mono">
              ۱۶:۳۰ الی ۲۱:۰۰
            </div>
            <div className="text-[10px] text-amber-700 font-bold mt-0.5 font-mono">
              {toPersianDigits(daypartsData[0]?.percentage || 0)}٪ حجم مراجعات
            </div>
          </div>
          <p className="mt-1 pt-1 border-t border-stone-100 text-[9px] text-stone-400 leading-tight">
            ساعات بعد از تایم اداری
          </p>
        </div>

        {/* Card 4 */}
        <div className="rounded-2xl border border-white/80 bg-white/75 backdrop-blur-md p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-stone-500">
            <Briefcase className="h-3.5 w-3.5 text-purple-600 shrink-0" />
            <span className="text-[10px] font-bold truncate">الگوی شاغلین</span>
          </div>
          <div className="mt-1.5">
            <div className="text-sm sm:text-base font-bold text-stone-900 font-mono">
              {toPersianDigits(demandData.customerConstraints.length)} پرونده
            </div>
            <div className="text-[10px] text-purple-700 font-bold mt-0.5">
              ثبت ترجیح حضور
            </div>
          </div>
          <p className="mt-1 pt-1 border-t border-stone-100 text-[9px] text-stone-400 leading-tight">
            هماهنگی شیفت با مراجعین
          </p>
        </div>
      </div>

      {/* 2. Sub-tab Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 rounded-2xl border border-white/80 bg-stone-100/90 p-1.5 shadow-2xs w-full">
        <button
          type="button"
          onClick={() => setActiveSubTab('overview')}
          className={`rounded-xl py-2 px-1 text-center text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeSubTab === 'overview'
              ? 'bg-[#ea5848] text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          <Activity className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">نمودارها و بازه‌ها</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('hours')}
          className={`rounded-xl py-2 px-1 text-center text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeSubTab === 'hours'
              ? 'bg-[#ea5848] text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">ساعات و مشتریان</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('days')}
          className={`rounded-xl py-2 px-1 text-center text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeSubTab === 'days'
              ? 'bg-[#ea5848] text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">روزهای هفته</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('constraints')}
          className={`rounded-xl py-2 px-1 text-center text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeSubTab === 'constraints'
              ? 'bg-[#ea5848] text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          <Briefcase className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">ترجیحات مراجعین</span>
        </button>
      </div>

      {/* 3. Tab: Overview */}
      {activeSubTab === 'overview' && (
        <div className="space-y-3">
          {/* Main Composed Chart */}
          <div className="rounded-2xl border border-white/80 bg-white/75 backdrop-blur-md p-3.5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-stone-100 gap-1.5">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-1.5 font-serif">
                  <BarChart2 className="h-4 w-4 text-[#ea5848]" />
                  نمودار تقاضای ساعتی (رزرو در برابر تقاضای مازاد)
                </h3>
                <p className="text-[9px] text-stone-500 font-mono mt-0.5">
                  ساعات کاری از ۰۹:۰۰ تا ۲۲:۰۰
                </p>
              </div>
              <div className="flex items-center gap-2.5 text-[9px] font-mono">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded bg-[#ea5848]" />
                  <span className="text-stone-600">رزرو قطعی</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded bg-amber-500" />
                  <span className="text-stone-600">تقاضای مازاد</span>
                </div>
              </div>
            </div>

            <div className="mt-2.5 h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={hourlyChartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="hourLabel"
                    stroke="#94a3b8"
                    tick={{ fill: '#64748b', fontSize: 9 }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fill: '#64748b', fontSize: 9 }}
                    tickLine={false}
                    tickFormatter={(val) => toPersianDigits(val)}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Bar
                    dataKey="reservedCount"
                    name="نوبت‌های رزروشده"
                    stackId="a"
                    fill="#ea5848"
                    radius={[0, 0, 2, 2]}
                  />
                  <Bar
                    dataKey="missedDemand"
                    name="تقاضای مازاد بر ظرفیت"
                    stackId="a"
                    fill="#f59e0b"
                    radius={[2, 2, 0, 0]}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalDemand"
                    name="کل درخواست‌ها"
                    stroke="#f43f5e"
                    strokeWidth={1.5}
                    dot={{ fill: '#f43f5e', r: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daypart Peak Windows Chart */}
          <div className="rounded-2xl border border-white/80 bg-white/75 backdrop-blur-md p-3.5 shadow-2xs space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-stone-100 gap-1.5">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-1.5 font-serif">
                  <Zap className="h-4 w-4 text-[#ea5848]" />
                  توزیع بازه‌های زمانی تقاضا (Dayparts)
                </h3>
                <p className="text-[9px] text-stone-500 font-mono mt-0.5">
                  سهم مراجعه در بازه‌های مختلف روز
                </p>
              </div>
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 self-start sm:self-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-[9px] font-bold text-amber-800 font-mono">
                  بیشترین تمرکز: عصر (۱۶:۳۰ - ۲۱:۰۰)
                </span>
              </div>
            </div>

            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={daypartsChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fill: '#64748b', fontSize: 9 }}
                    tickLine={false}
                    tickFormatter={(val) => toPersianDigits(val)}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div
                          className="rounded-xl border border-stone-200 bg-white/95 p-2.5 shadow-xl backdrop-blur-md text-right text-[10px]"
                          dir="rtl"
                        >
                          <p className="font-bold text-stone-900 mb-1 border-b border-stone-100 pb-0.5 flex items-center justify-between gap-3">
                            <span>{data.fullTitle}</span>
                            <span className="text-[9px] font-mono text-stone-500">
                              {data.timeRange}
                            </span>
                          </p>
                          <div className="space-y-0.5 mt-1 text-[10px]">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-stone-600">تعداد تقاضا:</span>
                              <span className="font-bold text-stone-900 font-mono">
                                {toPersianDigits(data.count)} تقاضا
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-stone-600">سهم از کل:</span>
                              <span className="font-bold text-[#ea5848] font-mono">
                                {toPersianDigits(data.percentage)}٪
                              </span>
                            </div>
                            <div className="pt-0.5 text-[9px] text-stone-400">
                              {data.badgeText}
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="count" name="تعداد تقاضا" radius={[4, 4, 0, 0]}>
                    {daypartsChartData.map((entry) => (
                      <Cell key={entry.id} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {daypartsChartData.map((part) => (
                <div
                  key={part.id}
                  className="rounded-xl border border-stone-200/80 bg-stone-50/80 p-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[10px] font-bold text-stone-900 truncate">
                        {part.fullTitle}
                      </span>
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: part.fill }}
                      />
                    </div>
                    <p className="text-[8px] font-mono text-stone-500">
                      {part.timeRange}
                    </p>
                  </div>
                  <div className="mt-1.5 pt-1 border-t border-stone-200/60 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-stone-900">
                      {toPersianDigits(part.count)}
                    </span>
                    <span
                      className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded"
                      style={{
                        backgroundColor: `${part.fill}15`,
                        color: part.fill,
                      }}
                    >
                      {toPersianDigits(part.percentage)}٪
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Tab: Requested Hours */}
      {activeSubTab === 'hours' && (
        <div className="rounded-2xl border border-white/80 bg-white/75 backdrop-blur-md p-3.5 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-stone-900 font-serif">
                جزییات تقاضای هر ساعت و اسامی مشتریان متقاضی
              </h3>
              <p className="text-[9px] text-stone-500 font-mono mt-0.5">
                مشاهده لیست مشتریان و شماره تماس
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            {demandData.mostDemandedHours.map((h) => {
              const isExpanded = expandedHour === h.hour;
              return (
                <div
                  key={h.hour}
                  className="rounded-xl border border-stone-100/90 bg-white/70 p-2.5 transition-all hover:border-stone-200 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-11 items-center justify-center rounded-lg bg-stone-900 text-[10px] font-mono font-bold text-white shadow-xs">
                        {toPersianDigits(h.hour)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-900 font-mono">
                            {toPersianDigits(h.totalDemand)} تقاضا
                          </span>
                          {h.missedDemandCount > 0 && (
                            <span className="rounded bg-amber-50 border border-amber-200 px-1 py-0.2 text-[8px] font-bold text-amber-800 font-mono">
                              {toPersianDigits(h.missedDemandCount)} مازاد
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[9px] text-stone-500 font-mono">
                          <span className="text-emerald-700 font-bold">
                            {toPersianDigits(h.reservedCount)} رزرو
                          </span>
                          <span>•</span>
                          <span>{toPersianDigits(h.demandingUsers.length)} مراجع</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedHour(isExpanded ? null : h.hour)}
                      className="flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-[10px] font-bold text-stone-700 hover:bg-white transition-colors"
                    >
                      <span>متقاضیان</span>
                      {isExpanded ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  </div>

                  {/* Expanded Demanding Users List */}
                  {isExpanded && (
                    <div className="mt-2 rounded-lg border border-stone-200/80 bg-stone-50/90 p-2 space-y-1 animate-fadeIn">
                      <span className="block text-[9px] font-bold text-[#ea5848]">
                        مشتریان متقاضی ساعت {toPersianDigits(h.hour)}:
                      </span>
                      <div className="divide-y divide-stone-200/60 text-xs">
                        {h.demandingUsers.map((user, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between py-1 text-[10px]"
                          >
                            <div className="flex items-center gap-1.5">
                              <Users className="h-3 w-3 text-stone-400" />
                              <span className="font-bold text-stone-900">{user.name}</span>
                              {user.phone && (
                                <span className="font-mono text-[9px] text-stone-500 flex items-center gap-0.5">
                                  <Phone className="h-2 w-2" />
                                  {toPersianDigits(user.phone)}
                                </span>
                              )}
                            </div>
                            <span className="rounded bg-white border border-stone-200 px-1.5 py-0.2 text-[8px] font-bold text-stone-800 font-mono">
                              {toPersianDigits(user.count)} درخواست
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Tab: Weekdays */}
      {activeSubTab === 'days' && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-white/80 bg-white/75 backdrop-blur-md p-3.5 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-1.5 font-serif">
                <Calendar className="h-4 w-4 text-emerald-600" />
                توزیع تقاضا در روزهای هفته
              </h3>
              <span className="text-[9px] text-stone-500 font-mono">کل تاریخچه رزروها</span>
            </div>

            <div className="mt-2.5 h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekdayChartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="weekday" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 9 }} tickLine={false} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 9 }} tickLine={false} tickFormatter={(val) => toPersianDigits(val)} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Bar dataKey="count" name="تعداد تقاضا" fill="#10b981" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Calendar Top Dates */}
          <div className="rounded-2xl border border-white/80 bg-white/75 backdrop-blur-md p-3.5 shadow-2xs space-y-2">
            <h3 className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-1.5 pb-2 border-b border-stone-100 font-serif">
              <TrendingUp className="h-4 w-4 text-[#ea5848]" />
              پرازدحام‌ترین تاریخ‌های تقویم
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {demandData.mostDemandedDates.map((d, idx) => (
                <div
                  key={d.dayNumber}
                  className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50/80 p-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-stone-900 text-[9px] font-bold text-white font-mono">
                      {toPersianDigits(idx + 1)}
                    </span>
                    <span className="font-bold text-stone-900 text-[10px]">{d.dateLabel}</span>
                  </div>
                  <span className="rounded-md bg-white border border-stone-200 px-1.5 py-0.5 text-[9px] font-bold text-[#ea5848] font-mono">
                    {toPersianDigits(d.count)} درخواست
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. Tab: Customer Preferences */}
      {activeSubTab === 'constraints' && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-white/80 bg-white/75 backdrop-blur-md p-3.5 shadow-2xs space-y-2.5">
            <h3 className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-1.5 pb-2 border-b border-stone-100 font-serif">
              <Briefcase className="h-4 w-4 text-blue-600" />
              تفکیک الگوهای شغلی و محدودیت‌های مراجعین
            </h3>

            <div className="space-y-2">
              {constraintStats.patternMetrics.map((pattern) => (
                <div key={pattern.label} className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-stone-800">{pattern.label}</span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-stone-500">{toPersianDigits(pattern.count)} پرونده</span>
                      <span className="font-bold text-stone-900">
                        ({toPersianDigits(pattern.percentage)}٪)
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                    <div
                      className={`h-full rounded-full ${pattern.barColor}`}
                      style={{ width: `${pattern.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unavailability by Weekday Bar Chart */}
          <div className="rounded-2xl border border-white/80 bg-white/75 backdrop-blur-md p-3.5 shadow-2xs">
            <h3 className="text-xs sm:text-sm font-bold text-stone-900 mb-0.5 flex items-center gap-1.5 font-serif">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              روزهای عدم امکان حضور مراجعین (تداخل کاری)
            </h3>
            <p className="text-[9px] text-stone-500 mb-2 font-mono">
              تعداد مراجعینی که در روزهای زیر شیفت دارند
            </p>

            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={constraintStats.unavailableDaysChart}
                  margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 9 }} tickLine={false} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 9 }} tickLine={false} tickFormatter={(val) => toPersianDigits(val)} />
                  <Tooltip content={<CustomChartTooltip unit="مراجع" />} />
                  <Bar dataKey="count" name="تعداد مراجعین با تداخل" fill="#f43f5e" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Searchable Client Constraints Dossiers */}
          <div className="rounded-2xl border border-white/80 bg-white/75 backdrop-blur-md p-3.5 shadow-2xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 font-serif">
                  پرونده محدودیت‌های ثبت‌شده
                </h3>
                <p className="text-[9px] text-stone-500 font-mono">
                  جستجو بر اساس نام، شماره یا توضیحات
                </p>
              </div>
              <div className="relative">
                <Search className="absolute right-2 top-2 h-3 w-3 text-stone-400" />
                <input
                  type="text"
                  placeholder="جستجوی مراجع یا شغل..."
                  value={constraintSearch}
                  onChange={(e) => setConstraintSearch(e.target.value)}
                  className="w-full sm:w-44 rounded-xl border border-stone-200 bg-white py-1 pl-2 pr-7 text-[10px] text-stone-900 placeholder-stone-400 outline-none focus:border-[#ea5848] shadow-2xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              {filteredConstraints.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-stone-100 bg-white/80 p-2 text-xs space-y-1 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-stone-900 text-[11px]">{item.customerName}</span>
                      {item.customerPhone && (
                        <span className="font-mono text-[9px] text-stone-500">
                          {toPersianDigits(item.customerPhone)}
                        </span>
                      )}
                    </div>
                    <span className="rounded-md bg-stone-100 border border-stone-200 px-1.5 py-0.2 text-[8px] font-bold text-stone-800">
                      {item.workPatternType === 'fixed_office'
                        ? 'ساعات اداری ثابت'
                        : item.workPatternType === 'shift_rotational'
                        ? 'شیفت چرخشی'
                        : item.workPatternType === 'university'
                        ? 'دانشگاه / مدرسه'
                        : item.workPatternType === 'weekend_only'
                        ? 'فقط آخر هفته'
                        : 'سایر'}
                    </span>
                  </div>

                  {item.unavailableDays.length > 0 && (
                    <div className="flex items-center gap-1 text-[9px]">
                      <span className="text-stone-500">عدم امکان حضور:</span>
                      <div className="flex flex-wrap gap-0.5">
                        {item.unavailableDays.map((d) => (
                          <span
                            key={d}
                            className="rounded bg-rose-50 border border-rose-200 px-1 py-0.2 text-[8px] font-bold text-rose-700"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.patternNote && (
                    <div className="rounded-lg bg-stone-50 p-1.5 text-[9px] leading-relaxed text-stone-600 border border-stone-100">
                      <span className="font-bold text-stone-900 ml-1">توضیح مراجع:</span>
                      {item.patternNote}
                    </div>
                  )}
                </div>
              ))}

              {filteredConstraints.length === 0 && (
                <div className="py-4 text-center text-[10px] text-stone-400">
                  موردی با این مشخصات یافت نشد.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
