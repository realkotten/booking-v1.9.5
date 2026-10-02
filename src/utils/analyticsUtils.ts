// ══════════════════════════════════════════════════════════════════
// ATELIER ANALYTICS & FINANCIALS CALCULATION ENGINE
// Pure, Read-Only Intelligence Layer over Shared Atelier State
// ══════════════════════════════════════════════════════════════════

import { 
  Appointment, 
  Order, 
  ClientProfile, 
  Service, 
  Product, 
  AnalyticsPeriod, 
  AnalyticsCustomRange, 
  AnalyticsSummary,
  ServicePerformanceMetric,
  BoutiquePerformanceMetric,
  TopCustomerMetric,
  TrendDataPoint
} from '../types';
import { toPersianDigits } from './dateUtils';
import { normalizePhoneNumber } from './customerUtils';

// ─── Constants & Targets ──────────────────────────────────────────
export const DEFAULT_FINANCIAL_TARGETS: Record<AnalyticsPeriod, number> = {
  today: 1200,
  week: 7500,
  month: 28000,
  year: 120000,
  custom: 5000,
};

// Studio daily operating capacity in minutes (09:00 to 21:00 = 12h = 720 mins)
export const STUDIO_DAILY_CAPACITY_MINUTES = 720;

/**
 * Extracts a numeric day number from appointment or date string.
 */
export function extractDayNumber(apt: Appointment): number {
  if (typeof apt.dayNumber === 'number' && apt.dayNumber > 0) {
    return apt.dayNumber;
  }
  // Try parsing from date field e.g. "سه‌شنبه، ۲۲ مهر ۱۴۰۳" or "1403-07-22"
  if (apt.date) {
    const match = apt.date.match(/(\d{1,2})\s+مهر/);
    if (match) return parseInt(match[1], 10);
    const isoMatch = apt.date.match(/1403-07-(\d{2})/);
    if (isoMatch) return parseInt(isoMatch[1], 10);
  }
  return 22; // default fallback to today
}

/**
 * Parses Persian or ISO date string into year, month, and day.
 */
export function parseDateRecord(dateStr?: string): { year: number; month: number; day: number } | null {
  if (!dateStr) return null;
  
  // Persian standard date matching: e.g. "۱۴۰۳-۰۷-۲۲" or "1403-07-22" or "۲۸ شهریور ۱۴۰۳"
  const isoMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return {
      year: parseInt(isoMatch[1], 10),
      month: parseInt(isoMatch[2], 10),
      day: parseInt(isoMatch[3], 10),
    };
  }

  const monthNames = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
  for (let i = 0; i < monthNames.length; i++) {
    if (dateStr.includes(monthNames[i])) {
      const dayMatch = dateStr.match(/(\d{1,2})/);
      const day = dayMatch ? parseInt(dayMatch[1], 10) : 1;
      return {
        year: 1403,
        month: i + 1,
        day,
      };
    }
  }

  return null;
}

/**
 * Filters appointments according to selected period.
 */
export function filterAppointmentsByPeriod(
  allAppointments: Appointment[],
  pastAppointments: Appointment[],
  period: AnalyticsPeriod,
  customRange?: AnalyticsCustomRange
): Appointment[] {
  // Combine all appointments into a single deduplicated array by ID
  const mergedMap = new Map<string, Appointment>();
  [...allAppointments, ...pastAppointments].forEach((apt) => {
    mergedMap.set(apt.id, apt);
  });
  const unified = Array.from(mergedMap.values());

  switch (period) {
    case 'today':
      // Day 22 Mehr 1403
      return unified.filter((a) => extractDayNumber(a) === 22 && (!a.date || a.date.includes('مهر') || a.date.includes('07')));

    case 'week':
      // Week of Mehr 1403: Days 19 to 25
      return unified.filter((a) => {
        const day = extractDayNumber(a);
        const isMehr = !a.date || a.date.includes('مهر') || a.date.includes('07');
        return isMehr && day >= 19 && day <= 25;
      });

    case 'month':
      // Current active month: Mehr (07) 1403
      return unified.filter((a) => {
        if (!a.date) return true;
        return a.date.includes('مهر') || a.date.includes('1403-07');
      });

    case 'year':
      // Year 1403 (includes Tir, Mordad, Shahrivar, Mehr, etc.)
      return unified.filter((a) => {
        if (!a.date) return true;
        return a.date.includes('۱۴۰۳') || a.date.includes('1403');
      });

    case 'custom':
      if (!customRange) return unified;
      return unified.filter((a) => {
        const day = extractDayNumber(a);
        return day >= customRange.startDay && day <= customRange.endDay;
      });

    default:
      return unified;
  }
}

/**
 * Filters boutique orders according to selected period.
 */
export function filterOrdersByPeriod(
  allOrders: Order[],
  period: AnalyticsPeriod,
  customRange?: AnalyticsCustomRange
): Order[] {
  // Valid orders must be paid or active fulfillment (not cancelled/failed)
  const validOrders = allOrders.filter(
    (o) => o.paymentStatus !== 'failed' && o.fulfillmentStatus !== 'cancelled'
  );

  switch (period) {
    case 'today':
      // Orders created today (22 Mehr / today timestamp)
      return validOrders.filter((o) => {
        if (!o.createdAt) return true;
        return o.createdAt.includes('۲۲') || o.createdAt.includes('22') || o.createdAt.includes('1403-07-22');
      });

    case 'week':
      // Orders created in current week (19 to 25 Mehr)
      return validOrders.filter((o) => {
        const parsed = parseDateRecord(o.createdAt);
        if (!parsed) return true;
        return parsed.month === 7 && parsed.day >= 19 && parsed.day <= 25;
      });

    case 'month':
      // Orders created in current month (Mehr 1403)
      return validOrders.filter((o) => {
        if (!o.createdAt) return true;
        return o.createdAt.includes('مهر') || o.createdAt.includes('1403-07') || o.createdAt.includes('۱۴۰۳-۰۷');
      });

    case 'year':
      // Orders created in 1403
      return validOrders.filter((o) => {
        if (!o.createdAt) return true;
        return o.createdAt.includes('۱۴۰۳') || o.createdAt.includes('1403') || o.createdAt.includes('۱۴۰۳-۰۶') || o.createdAt.includes('1403-06');
      });

    case 'custom':
      if (!customRange) return validOrders;
      return validOrders.filter((o) => {
        const parsed = parseDateRecord(o.createdAt);
        if (!parsed) return true;
        return parsed.day >= customRange.startDay && parsed.day <= customRange.endDay;
      });

    default:
      return validOrders;
  }
}

/**
 * Calculates service revenue strictly from realized/completed appointments.
 */
export function calculateServiceRevenue(appointments: Appointment[]): number {
  return appointments
    .filter((a) => a.status === 'completed')
    .reduce((sum, a) => {
      const amount = a.totalAmount || (a.servicePrice || 0) + (a.accoutrementsPrice || 0) + (a.tipAmount || 0);
      return sum + amount;
    }, 0);
}

/**
 * Calculates boutique revenue strictly from valid paid orders.
 */
export function calculateBoutiqueRevenue(orders: Order[]): number {
  return orders.reduce((sum, o) => sum + (o.total || o.subtotal || 0), 0);
}

/**
 * Calculates Service Performance metrics.
 */
export function calculateServicePerformance(
  appointments: Appointment[],
  servicesList: Service[]
): ServicePerformanceMetric[] {
  const serviceStatsMap = new Map<string, {
    serviceId: string;
    name: string;
    category?: string;
    completedCount: number;
    totalBookings: number;
    revenue: number;
  }>();

  // Initialize with known services from registry
  servicesList.forEach((s) => {
    const catStr = typeof s.category === 'object' && s.category ? (s.category as any).name : (s.category || s.categoryId || 'خدمات');
    serviceStatsMap.set(s.id, {
      serviceId: s.id,
      name: s.name,
      category: catStr,
      completedCount: 0,
      totalBookings: 0,
      revenue: 0,
    });
  });

  // Populate from appointments
  appointments.forEach((apt) => {
    if (apt.status === 'blocked') return; // Skip internal staff breaks
    const sId = apt.serviceId || apt.service?.id || 'other-service';
    const sName = apt.service?.name || 'سایر خدمات آتلیه';
    const rawCat = apt.service?.category;
    const catStr = typeof rawCat === 'object' && rawCat ? (rawCat as any).name : (rawCat || apt.service?.categoryId || 'خدمات');
    
    if (!serviceStatsMap.has(sId)) {
      serviceStatsMap.set(sId, {
        serviceId: sId,
        name: sName,
        category: catStr,
        completedCount: 0,
        totalBookings: 0,
        revenue: 0,
      });
    }

    const stat = serviceStatsMap.get(sId)!;
    stat.totalBookings += 1;

    if (apt.status === 'completed') {
      stat.completedCount += 1;
      const aptTotal = apt.totalAmount || (apt.servicePrice || 0) + (apt.accoutrementsPrice || 0) + (apt.tipAmount || 0);
      stat.revenue += aptTotal;
    }
  });

  const totalServiceRev = Array.from(serviceStatsMap.values()).reduce((sum, s) => sum + s.revenue, 0);

  return Array.from(serviceStatsMap.values())
    .map((stat) => ({
      ...stat,
      avgRevenue: stat.completedCount > 0 ? Math.round(stat.revenue / stat.completedCount) : 0,
      revenuePct: totalServiceRev > 0 ? Math.round((stat.revenue / totalServiceRev) * 100) : 0,
    }))
    .filter((s) => s.totalBookings > 0 || s.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue);
}

/**
 * Calculates Boutique Performance metrics from orders.
 */
export function calculateBoutiquePerformance(
  orders: Order[],
  productsList: Product[]
): BoutiquePerformanceMetric[] {
  const productStatsMap = new Map<string, {
    productId: string;
    name: string;
    persianName: string;
    category?: string;
    imageUrl?: string;
    unitsSold: number;
    revenue: number;
  }>();

  // Create product lookup map
  const productLookup = new Map<string, Product>();
  productsList.forEach((p) => productLookup.set(p.id, p));

  orders.forEach((order) => {
    if (order.paymentStatus === 'failed' || order.fulfillmentStatus === 'cancelled') return;

    order.items?.forEach((item) => {
      const pId = item.productId;
      const refProd = productLookup.get(pId);
      const name = item.name || refProd?.name || 'محصول بوتیک';
      const persianName = item.persianName || refProd?.persianName || name;
      const imageUrl = item.imageUrl || refProd?.imageUrl;
      const category = refProd?.category;

      if (!productStatsMap.has(pId)) {
        productStatsMap.set(pId, {
          productId: pId,
          name,
          persianName,
          category,
          imageUrl,
          unitsSold: 0,
          revenue: 0,
        });
      }

      const stat = productStatsMap.get(pId)!;
      stat.unitsSold += item.quantity || 1;
      stat.revenue += (item.price || 0) * (item.quantity || 1);
    });
  });

  const totalBoutiqueRev = Array.from(productStatsMap.values()).reduce((sum, p) => sum + p.revenue, 0);

  return Array.from(productStatsMap.values())
    .map((stat) => ({
      ...stat,
      avgPrice: stat.unitsSold > 0 ? Math.round(stat.revenue / stat.unitsSold) : 0,
      revenuePct: totalBoutiqueRev > 0 ? Math.round((stat.revenue / totalBoutiqueRev) * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

/**
 * Calculates Customer Metrics.
 */
export function calculateCustomerMetrics(
  filteredAppointments: Appointment[],
  filteredOrders: Order[],
  allCustomers: ClientProfile[],
  allAppointments: Appointment[],
  allOrders: Order[]
): {
  activeCustomersCount: number;
  newCustomersCount: number;
  returningCustomersCount: number;
  avgCustomerValue: number;
  topCustomers: TopCustomerMetric[];
} {
  const activeCustomerIds = new Set<string>();
  const customerSpendMap = new Map<string, {
    customerId: string;
    customerName: string;
    memberId?: string;
    phone?: string;
    isVip?: boolean;
    totalSpend: number;
    visitsCount: number;
    ordersCount: number;
    lastActivity?: string;
  }>();

  // Helper to get or init customer record in spend map
  const getCustomerEntry = (cId: string, defaultName: string, defaultPhone?: string) => {
    if (!customerSpendMap.has(cId)) {
      const client = allCustomers.find((c) => c.id === cId || (defaultPhone && normalizePhoneNumber(c.phone) === normalizePhoneNumber(defaultPhone)));
      customerSpendMap.set(cId, {
        customerId: cId,
        customerName: client?.name || defaultName || 'مشتری آتلیه',
        memberId: client?.memberId,
        phone: client?.phone || defaultPhone,
        isVip: client?.isVip,
        totalSpend: 0,
        visitsCount: 0,
        ordersCount: 0,
        lastActivity: undefined,
      });
    }
    return customerSpendMap.get(cId)!;
  };

  // Process filtered appointments
  filteredAppointments.forEach((apt) => {
    if (apt.status === 'blocked') return;
    const cId = apt.customerId || apt.customerPhone || 'unknown-client';
    activeCustomerIds.add(cId);

    const entry = getCustomerEntry(cId, apt.customerName || 'مراجع آتلیه', apt.customerPhone);
    entry.visitsCount += 1;
    entry.lastActivity = apt.date;
    if (apt.status === 'completed') {
      const aptTotal = apt.totalAmount || (apt.servicePrice || 0) + (apt.accoutrementsPrice || 0) + (apt.tipAmount || 0);
      entry.totalSpend += aptTotal;
    }
  });

  // Process filtered orders
  filteredOrders.forEach((order) => {
    const cId = order.customerId || order.customerPhone || 'unknown-buyer';
    activeCustomerIds.add(cId);

    const entry = getCustomerEntry(cId, order.customerName || 'خریدار بوتیک', order.customerPhone);
    entry.ordersCount += 1;
    entry.totalSpend += order.total || order.subtotal || 0;
    if (!entry.lastActivity) {
      entry.lastActivity = order.createdAt;
    }
  });

  // Calculate New vs Returning Customers
  let newCount = 0;
  let returningCount = 0;

  activeCustomerIds.forEach((cId) => {
    // Check historical activity of this customer in allAppointments / allOrders
    const customer = allCustomers.find((c) => c.id === cId);
    const priorAppointments = allAppointments.filter((a) => {
      const isSameCust = a.customerId === cId || (customer && a.customerPhone === customer.phone);
      return isSameCust && !filteredAppointments.some((fa) => fa.id === a.id);
    });
    const priorOrders = allOrders.filter((o) => {
      const isSameCust = o.customerId === cId || (customer && o.customerPhone === customer.phone);
      return isSameCust && !filteredOrders.some((fo) => fo.id === o.id);
    });

    if (priorAppointments.length > 0 || priorOrders.length > 0 || (customer && (customer.totalVisits || 0) > 1)) {
      returningCount += 1;
    } else {
      newCount += 1;
    }
  });

  const topCustomers = Array.from(customerSpendMap.values())
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .slice(0, 10);

  const totalRevenueInPeriod = Array.from(customerSpendMap.values()).reduce((sum, c) => sum + c.totalSpend, 0);
  const avgCustomerValue = activeCustomerIds.size > 0 ? Math.round(totalRevenueInPeriod / activeCustomerIds.size) : 0;

  return {
    activeCustomersCount: activeCustomerIds.size,
    newCustomersCount: newCount,
    returningCustomersCount: returningCount,
    avgCustomerValue,
    topCustomers,
  };
}

/**
 * Calculates Revenue and Appointment trends for visualizations.
 */
export function calculateTrends(
  filteredAppointments: Appointment[],
  filteredOrders: Order[],
  period: AnalyticsPeriod
): { revenueTrend: TrendDataPoint[]; appointmentTrend: TrendDataPoint[] } {
  const points: TrendDataPoint[] = [];

  if (period === 'today') {
    // Break into time blocks: 10:00, 12:00, 14:00, 16:00, 18:00, 20:00
    const timeBlocks = [
      { label: '۱۰:۰۰', startM: 600, endM: 719 },
      { label: '۱۲:۰۰', startM: 720, endM: 839 },
      { label: '۱۴:۰۰', startM: 840, endM: 959 },
      { label: '۱۶:۰۰', startM: 960, endM: 1079 },
      { label: '۱۸:۰۰', startM: 1080, endM: 1199 },
      { label: '۲۰:۰۰', startM: 1200, endM: 1320 },
    ];

    timeBlocks.forEach((tb) => {
      const aptsInBlock = filteredAppointments.filter((a) => {
        if (!a.startTime) return false;
        const [h, m] = a.startTime.split(':').map((v) => parseInt(v, 10) || 0);
        const mins = h * 60 + m;
        return mins >= tb.startM && mins <= tb.endM;
      });

      const sRev = calculateServiceRevenue(aptsInBlock);
      // Allocate today's boutique orders across mid-day
      const bRev = tb.label === '۱۴:۰۰' ? calculateBoutiqueRevenue(filteredOrders) : 0;

      const completed = aptsInBlock.filter((a) => a.status === 'completed').length;
      const cancelled = aptsInBlock.filter((a) => a.status === 'cancelled').length;
      const noShow = aptsInBlock.filter((a) => a.status === 'no_show').length;

      points.push({
        label: tb.label,
        serviceRevenue: sRev,
        boutiqueRevenue: bRev,
        totalRevenue: sRev + bRev,
        totalAppointments: aptsInBlock.length,
        completedAppointments: completed,
        cancelledAppointments: cancelled,
        noShowAppointments: noShow,
      });
    });
  } else if (period === 'week') {
    // 7 Days of Week (19 to 25 Mehr)
    const weekDays = [
      { label: 'شنبه', day: 19 },
      { label: 'یک‌شنبه', day: 20 },
      { label: 'دوشنبه', day: 21 },
      { label: 'سه‌شنبه', day: 22 },
      { label: 'چهارشنبه', day: 23 },
      { label: 'پنج‌شنبه', day: 24 },
      { label: 'جمعه', day: 25 },
    ];

    weekDays.forEach((wd) => {
      const aptsOnDay = filteredAppointments.filter((a) => extractDayNumber(a) === wd.day);
      const ordersOnDay = filteredOrders.filter((o) => {
        const p = parseDateRecord(o.createdAt);
        return p?.day === wd.day;
      });

      const sRev = calculateServiceRevenue(aptsOnDay);
      const bRev = calculateBoutiqueRevenue(ordersOnDay);
      const completed = aptsOnDay.filter((a) => a.status === 'completed').length;
      const cancelled = aptsOnDay.filter((a) => a.status === 'cancelled').length;
      const noShow = aptsOnDay.filter((a) => a.status === 'no_show').length;

      points.push({
        label: wd.label,
        sublabel: `${toPersianDigits(wd.day)} مهر`,
        serviceRevenue: sRev,
        boutiqueRevenue: bRev,
        totalRevenue: sRev + bRev,
        totalAppointments: aptsOnDay.length,
        completedAppointments: completed,
        cancelledAppointments: cancelled,
        noShowAppointments: noShow,
      });
    });
  } else if (period === 'month') {
    // 4 Weeks of Mehr
    const weeks = [
      { label: 'هفته اول', start: 1, end: 7 },
      { label: 'هفته دوم', start: 8, end: 14 },
      { label: 'هفته سوم (جاری)', start: 15, end: 22 },
      { label: 'هفته چهارم', start: 23, end: 30 },
    ];

    weeks.forEach((w) => {
      const aptsInWeek = filteredAppointments.filter((a) => {
        const d = extractDayNumber(a);
        return d >= w.start && d <= w.end;
      });
      const ordersInWeek = filteredOrders.filter((o) => {
        const p = parseDateRecord(o.createdAt);
        return p && p.day >= w.start && p.day <= w.end;
      });

      const sRev = calculateServiceRevenue(aptsInWeek);
      const bRev = calculateBoutiqueRevenue(ordersInWeek);
      const completed = aptsInWeek.filter((a) => a.status === 'completed').length;
      const cancelled = aptsInWeek.filter((a) => a.status === 'cancelled').length;
      const noShow = aptsInWeek.filter((a) => a.status === 'no_show').length;

      points.push({
        label: w.label,
        serviceRevenue: sRev,
        boutiqueRevenue: bRev,
        totalRevenue: sRev + bRev,
        totalAppointments: aptsInWeek.length,
        completedAppointments: completed,
        cancelledAppointments: cancelled,
        noShowAppointments: noShow,
      });
    });
  } else {
    // Year 1403: Monthly aggregates (تیر، مرداد، شهریور، مهر)
    const months = [
      { label: 'تیر', month: 4 },
      { label: 'مرداد', month: 5 },
      { label: 'شهریور', month: 6 },
      { label: 'مهر', month: 7 },
    ];

    months.forEach((m) => {
      const aptsInMonth = filteredAppointments.filter((a) => {
        const p = parseDateRecord(a.date);
        return p?.month === m.month || (m.month === 7 && a.date?.includes('مهر'));
      });
      const ordersInMonth = filteredOrders.filter((o) => {
        const p = parseDateRecord(o.createdAt);
        return p?.month === m.month || (m.month === 7 && o.createdAt?.includes('مهر'));
      });

      const sRev = calculateServiceRevenue(aptsInMonth);
      const bRev = calculateBoutiqueRevenue(ordersInMonth);
      const completed = aptsInMonth.filter((a) => a.status === 'completed').length;
      const cancelled = aptsInMonth.filter((a) => a.status === 'cancelled').length;
      const noShow = aptsInMonth.filter((a) => a.status === 'no_show').length;

      points.push({
        label: m.label,
        serviceRevenue: sRev,
        boutiqueRevenue: bRev,
        totalRevenue: sRev + bRev,
        totalAppointments: aptsInMonth.length,
        completedAppointments: completed,
        cancelledAppointments: cancelled,
        noShowAppointments: noShow,
      });
    });
  }

  return {
    revenueTrend: points,
    appointmentTrend: points,
  };
}

/**
 * Calculates prior period comparison for growth percentage.
 */
export function calculatePriorPeriodComparison(
  allAppointments: Appointment[],
  pastAppointments: Appointment[],
  allOrders: Order[],
  period: AnalyticsPeriod
): { growthPct: number | null; growthDiff: number; isPositive: boolean | null } {
  let priorAppointments: Appointment[] = [];
  let priorOrders: Order[] = [];

  const combined = [...allAppointments, ...pastAppointments];

  if (period === 'today') {
    // Compare today (22 Mehr) with yesterday (21 Mehr)
    priorAppointments = combined.filter((a) => extractDayNumber(a) === 21);
    priorOrders = allOrders.filter((o) => parseDateRecord(o.createdAt)?.day === 21);
  } else if (period === 'week') {
    // Compare this week with past appointments in late Shahrivar / early Mehr
    priorAppointments = pastAppointments.filter((a) => {
      const p = parseDateRecord(a.date);
      return p?.month === 6 || (p?.month === 7 && p.day < 19);
    });
  } else if (period === 'month') {
    // Compare Mehr with Shahrivar (month 6)
    priorAppointments = pastAppointments.filter((a) => parseDateRecord(a.date)?.month === 6);
  } else if (period === 'year') {
    // No prior year data in seed
    return { growthPct: null, growthDiff: 0, isPositive: null };
  }

  const priorRev = calculateServiceRevenue(priorAppointments) + calculateBoutiqueRevenue(priorOrders);
  const currentAppointments = filterAppointmentsByPeriod(allAppointments, pastAppointments, period);
  const currentOrders = filterOrdersByPeriod(allOrders, period);
  const currentRev = calculateServiceRevenue(currentAppointments) + calculateBoutiqueRevenue(currentOrders);

  if (priorRev <= 0) {
    return { growthPct: null, growthDiff: currentRev, isPositive: currentRev > 0 ? true : null };
  }

  const diff = currentRev - priorRev;
  const growthPct = Math.round((diff / priorRev) * 100);

  return {
    growthPct,
    growthDiff: diff,
    isPositive: diff >= 0,
  };
}

/**
 * Main Centralized Selector: Generates the full AnalyticsSummary model.
 */
export function calculateAnalyticsSummary(
  appointments: Appointment[],
  pastAppointments: Appointment[],
  orders: Order[],
  customers: ClientProfile[],
  services: Service[],
  products: Product[],
  period: AnalyticsPeriod = 'today',
  customRange?: AnalyticsCustomRange,
  customTargetAmount?: number
): AnalyticsSummary {
  const filteredAppointments = filterAppointmentsByPeriod(appointments, pastAppointments, period, customRange);
  const filteredOrders = filterOrdersByPeriod(orders, period, customRange);

  // Financials
  const serviceRevenue = calculateServiceRevenue(filteredAppointments);
  const boutiqueRevenue = calculateBoutiqueRevenue(filteredOrders);
  const totalRevenue = serviceRevenue + boutiqueRevenue;

  const completedAptsCount = filteredAppointments.filter((a) => a.status === 'completed').length;
  const validOrdersCount = filteredOrders.length;
  const transactionCount = completedAptsCount + validOrdersCount;
  const avgTransactionValue = transactionCount > 0 ? Math.round(totalRevenue / transactionCount) : 0;

  const priorComparison = calculatePriorPeriodComparison(appointments, pastAppointments, orders, period);

  // Appointments KPIs
  const customerApts = filteredAppointments.filter((a) => a.status !== 'blocked');
  const totalAppointments = customerApts.length;
  const completedAppointments = completedAptsCount;
  const cancelledAppointments = customerApts.filter((a) => a.status === 'cancelled').length;
  const noShowAppointments = customerApts.filter((a) => a.status === 'no_show').length;
  const inProgressOrConfirmedAppointments = customerApts.filter(
    (a) => a.status === 'confirmed' || a.status === 'in_progress' || a.status === 'reserved'
  ).length;

  const completionRate = totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0;
  const cancellationRate = totalAppointments > 0 ? Math.round((cancelledAppointments / totalAppointments) * 100) : 0;
  const noShowRate = totalAppointments > 0 ? Math.round((noShowAppointments / totalAppointments) * 100) : 0;

  // Occupancy / Capacity Calculation
  let daysInPeriod = 1;
  if (period === 'today') daysInPeriod = 1;
  else if (period === 'week') daysInPeriod = 7;
  else if (period === 'month') daysInPeriod = 30;
  else if (period === 'year') daysInPeriod = 365;
  else if (customRange) daysInPeriod = Math.max(1, customRange.endDay - customRange.startDay + 1);

  const availableMinutes = daysInPeriod * STUDIO_DAILY_CAPACITY_MINUTES;
  const bookedMinutes = customerApts
    .filter((a) => a.status !== 'cancelled')
    .reduce((sum, a) => sum + (a.durationMinutes || a.service?.durationMinutes || 45), 0);

  const occupancyRate = availableMinutes > 0 ? Math.min(100, Math.round((bookedMinutes / availableMinutes) * 100)) : 0;

  // Revenue Mix
  const servicePct = totalRevenue > 0 ? Math.round((serviceRevenue / totalRevenue) * 100) : 0;
  const boutiquePct = totalRevenue > 0 ? Math.round((boutiqueRevenue / totalRevenue) * 100) : 0;

  // Trends
  const { revenueTrend, appointmentTrend } = calculateTrends(filteredAppointments, filteredOrders, period);

  // Performance Rankings
  const servicePerformance = calculateServicePerformance(filteredAppointments, services);
  const boutiquePerformance = calculateBoutiquePerformance(filteredOrders, products);
  const customerMetrics = calculateCustomerMetrics(filteredAppointments, filteredOrders, customers, appointments, orders);

  // Financial Target
  const targetAmount = customTargetAmount || DEFAULT_FINANCIAL_TARGETS[period] || 5000;
  const achievedPct = targetAmount > 0 ? Math.min(100, Math.round((totalRevenue / targetAmount) * 100)) : 0;
  const remainingAmount = Math.max(0, targetAmount - totalRevenue);
  const isTargetMet = totalRevenue >= targetAmount;

  // Period Labels
  const periodLabels: Record<AnalyticsPeriod, { title: string; desc: string }> = {
    today: { title: 'امروز', desc: 'سه‌شنبه، ۲۲ مهر ۱۴۰۳' },
    week: { title: 'این هفته', desc: '۱۹ الی ۲۵ مهر ۱۴۰۳' },
    month: { title: 'این ماه', desc: 'مهر ۱۴۰۳' },
    year: { title: 'این سال', desc: 'سال ۱۴۰۳' },
    custom: {
      title: 'بازه سفارشی',
      desc: customRange
        ? `${toPersianDigits(customRange.startDay)} الی ${toPersianDigits(customRange.endDay)} مهر ۱۴۰۳`
        : 'انتخاب بازه دلخواه',
    },
  };

  return {
    period,
    periodLabel: periodLabels[period].title,
    dateRangeDescription: periodLabels[period].desc,
    serviceRevenue,
    boutiqueRevenue,
    totalRevenue,
    avgTransactionValue,
    transactionCount,
    serviceTransactionCount: completedAptsCount,
    boutiqueTransactionCount: validOrdersCount,
    revenueGrowthPct: priorComparison.growthPct,
    revenueGrowthDiff: priorComparison.growthDiff,
    isGrowthPositive: priorComparison.isPositive,
    totalAppointments,
    completedAppointments,
    cancelledAppointments,
    noShowAppointments,
    inProgressOrConfirmedAppointments,
    completionRate,
    cancellationRate,
    noShowRate,
    occupancyRate,
    bookedMinutes,
    availableMinutes,
    servicePct,
    boutiquePct,
    revenueTrend,
    appointmentTrend,
    servicePerformance,
    boutiquePerformance,
    customerMetrics,
    financialTarget: {
      targetAmount,
      currentRevenue: totalRevenue,
      achievedPct,
      remainingAmount,
      isTargetMet,
    },
    filteredAppointments,
    filteredOrders,
  };
}
