import { AnalyticsSummary, ServicePerformanceMetric, TopCustomerMetric } from '../types';

/**
 * Downloads a string content as a CSV file with proper UTF-8 BOM encoding for Persian/RTL characters.
 */
export function downloadCSV(filename: string, csvContent: string) {
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates CSV for the Full Atelier Financial Report
 */
export function generateFinancialReportCSV(summary: AnalyticsSummary): string {
  const lines: string[] = [];

  // Header Metadata
  lines.push(`گزارش جامع مالی و عملکرد آتلیه`);
  lines.push(`دوره زمانی:,${summary.periodLabel} (${summary.dateRangeDescription})`);
  lines.push(`تاریخ صدور گزارش:,${new Date().toLocaleDateString('fa-IR')}`);
  lines.push(``);

  // Financial KPIs
  lines.push(`شاخص‌های کلیدی مالی,مقدار (تومان),توضیحات`);
  lines.push(`درآمد کل آتلیه,${summary.totalRevenue},مجموع عایدی خدمات`);
  lines.push(`درآمد آیین‌های پیرایش,${summary.serviceRevenue},سهم ${summary.servicePct}٪ از کل درآمد`);
  lines.push(`میانگین ارزش فاکتور (ATV),${summary.avgTransactionValue},میانگین هر خدمت ثبت‌شده`);
  lines.push(`تعداد کل تراکنش‌های مالی,${summary.transactionCount},مجموع نوبت‌های تکمیل‌شده`);
  lines.push(`تارگت و هدف مالی دوره,${summary.financialTarget.targetAmount},مبلغ تعیین‌شده در بودجه آتلیه`);
  lines.push(`درصد تحقق هدف مالی,${summary.financialTarget.achievedPct}٪,${summary.financialTarget.isTargetMet ? 'تحقق یافته' : 'در حال پیشرفت'}`);
  lines.push(``);

  // Appointment KPIs
  lines.push(`شاخص‌های نوبت‌دهی و بهره‌وری,تعداد / درصد`);
  lines.push(`کل نوبت‌های ثبت‌شده,${summary.totalAppointments}`);
  lines.push(`نوبت‌های تکمیل‌شده,${summary.completedAppointments}`);
  lines.push(`نوبت‌های لغوشده,${summary.cancelledAppointments}`);
  lines.push(`عدم حضور (No-Show),${summary.noShowAppointments}`);
  lines.push(`نرخ موفقیت تکمیل نوبت,${summary.completionRate}٪`);
  lines.push(`نرخ اشغال تقویم پیرایش,${summary.occupancyRate}٪`);
  lines.push(``);

  // Service Performance
  lines.push(`عملکرد آیین‌ها و خدمات پیرایش`);
  lines.push(`ردیف,نام خدمت,تعداد رزرو,تعداد تکمیل‌شده,درآمد کل (تومان),میانگین فاکتور (تومان),سهم از درآمد خدمات`);
  summary.servicePerformance.forEach((s, idx) => {
    lines.push(`${idx + 1},${s.name},${s.totalBookings},${s.completedCount},${s.revenue},${s.avgRevenue},${s.revenuePct}٪`);
  });
  lines.push(``);

  // Top Clients
  lines.push(`مشتریان برتر دوره`);
  lines.push(`ردیف,نام مشتری,کد عضویت,تعداد نوبت خدمات,مجموع پرداخت (تومان)`);
  summary.customerMetrics.topCustomers.forEach((c, idx) => {
    lines.push(`${idx + 1},${c.customerName || (c as any).name},${c.memberId || '-'},${c.visitsCount},${c.totalSpend}`);
  });

  return lines.join('\n');
}
