import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  RotateCw, 
  Copy, 
  ExternalLink, 
  Download, 
  Upload, 
  ShieldCheck, 
  HelpCircle,
  Check,
  Sparkles
} from 'lucide-react';
import { useAtelier } from '../../../store/AtelierContext';
import { 
  getGoogleSheetStatus, 
  testGoogleSheetConnection, 
  backupToGoogleSheet, 
  restoreFromGoogleSheet 
} from '../../../api/atelierApi';
import { toPersianDigits } from '../../../utils/dateUtils';

export const GoogleSheetsBackupSettings: React.FC = () => {
  const { settings, updateStudioSettings, refreshDatabaseData } = useAtelier();

  const [webAppUrl, setWebAppUrl] = useState<string>(() => {
    return settings.googleSheetSettings?.webAppUrl || '';
  });

  const [statusInfo, setStatusInfo] = useState<{
    configured: boolean;
    webAppUrl?: string;
    lastBackupTimestamp?: string;
    lastBackupStatus?: 'success' | 'error' | 'idle';
    lastBackupMessage?: string;
  }>({
    configured: false,
    lastBackupStatus: 'idle',
  });

  const [isTesting, setIsTesting] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync initial URL if settings update
  useEffect(() => {
    if (settings.googleSheetSettings?.webAppUrl && !webAppUrl) {
      setWebAppUrl(settings.googleSheetSettings.webAppUrl);
    }
  }, [settings.googleSheetSettings?.webAppUrl]);

  // Fetch status on mount
  useEffect(() => {
    getGoogleSheetStatus().then((res) => {
      setStatusInfo(res);
      if (res.webAppUrl && !webAppUrl) {
        setWebAppUrl(res.webAppUrl);
      }
    });
  }, []);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleSaveUrl = () => {
    const clean = webAppUrl.trim();
    if (clean && !clean.startsWith('http')) {
      showFeedback('error', 'آدرس وب‌اپ گوگل شیت باید با https:// آغاز شود.');
      return;
    }

    const updated = {
      ...(settings.googleSheetSettings || {}),
      webAppUrl: clean,
    };

    updateStudioSettings({
      googleSheetSettings: updated,
    });

    showFeedback('success', 'آدرس وب‌اپ گوگل شیت با موفقیت ذخیره گردید.');
  };

  const handleTestConnection = async () => {
    const clean = webAppUrl.trim();
    if (!clean) {
      showFeedback('error', 'لطفاً ابتدا آدرس وب‌اپ گوگل شیت را وارد نمایید.');
      return;
    }

    setIsTesting(true);
    try {
      const res = await testGoogleSheetConnection(clean);
      if (res.success) {
        showFeedback('success', res.message || 'ارتباط با گوگل شیت با موفقیت تأیید شد!');
        // Update local status
        setStatusInfo((prev) => ({
          ...prev,
          configured: true,
          lastBackupStatus: 'success',
          lastBackupMessage: 'اتصال به گوگل شیت برقرار است.',
        }));
      } else {
        showFeedback('error', res.message || 'خطا در برقراری ارتباط با وب‌اپ گوگل شیت.');
      }
    } catch {
      showFeedback('error', 'خطا در ارسال درخواست تست به سرور.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleBackupNow = async () => {
    setIsBackingUp(true);
    try {
      const res = await backupToGoogleSheet(webAppUrl.trim() || undefined);
      if (res.success) {
        showFeedback('success', res.message || 'پشتیبان‌گیری کامل در گوگل شیت انجام شد.');
        setStatusInfo((prev) => ({
          ...prev,
          lastBackupTimestamp: new Date().toISOString(),
          lastBackupStatus: 'success',
          lastBackupMessage: 'پشتیبان‌گیری موفق',
        }));
      } else {
        showFeedback('error', res.message || 'خطا در پشتیبان‌گیری گوگل شیت.');
      }
    } catch {
      showFeedback('error', 'خطا در ارتباط با سرور.');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreNow = async () => {
    if (!confirm('آیا از بازگردانی اطلاعات از آخرین نسخه پشتیبان گوگل شیت اطمینان دارید؟')) {
      return;
    }

    setIsRestoring(true);
    try {
      const res = await restoreFromGoogleSheet(webAppUrl.trim() || undefined);
      if (res.success) {
        showFeedback('success', res.message || 'اطلاعات با موفقیت از گوگل شیت بازگردانی شد.');
        await refreshDatabaseData();
      } else {
        showFeedback('error', res.message || 'خطا در بازیابی اطلاعات از گوگل شیت.');
      }
    } catch {
      showFeedback('error', 'خطا در ارتباط با سرور.');
    } finally {
      setIsRestoring(false);
    }
  };

  const APPS_SCRIPT_CODE = `function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var action = contents.action || 'test';
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. ثبت یا به‌روزرسانی نوبت دریافتی
    if (action === 'backup_appointment' || action === 'appointment') {
      var sheet = ss.getSheetByName('نوبت‌ها') || ss.insertSheet('نوبت‌ها');
      if (sheet.getLastRow() === 0) {
        sheet.appendRow([
          'شناسه نوبت', 'کد پیگیری', 'نام مشتری', 'شماره همراه', 
          'سرویس', 'تاریخ', 'ساعت شروع', 'ساعت پایان', 
          'مبلغ کل (تومان)', 'وضعیت', 'نام آرایشگر', 'صندلی / سوئیت', 'یادداشت مشتری', 'زمان ثبت'
        ]);
        sheet.getRange(1, 1, 1, 14).setFontWeight('bold').setBackground('#f1f5f9');
      }
      var apt = contents.appointment;
      sheet.appendRow([
        apt.id, 
        apt.appointmentNumber || '', 
        apt.customerName || 'مشتری', 
        apt.customerPhone || '',
        apt.service ? apt.service.name : (apt.serviceName || 'اصلاح مو'), 
        apt.date || '', 
        apt.startTime || '', 
        apt.endTime || '',
        apt.totalAmount || apt.servicePrice || 0, 
        apt.status || 'confirmed', 
        apt.barberName || '', 
        apt.chairName || '',
        apt.customerNotes || '', 
        new Date().toLocaleString('fa-IR')
      ]);
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'نوبت با موفقیت در گوگل شیت ذخیره شد.' 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. نسخه کامل پشتیبان از دیتابیس
    if (action === 'full_backup') {
      var backupSheet = ss.getSheetByName('پشتیبان_کامل') || ss.insertSheet('پشتیبان_کامل');
      backupSheet.clear();
      backupSheet.appendRow(['کلید', 'مقدار']);
      backupSheet.appendRow(['backup_json', JSON.stringify(contents.data)]);
      backupSheet.appendRow(['updated_at', new Date().toISOString()]);
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'نسخه پشتیبان کامل پایگاه داده در گوگل شیت ذخیره گردید.' 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. تست اتصال
    if (action === 'test') {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'اتصال به وب‌اپ گوگل شیت با موفقیت برقرار است!' 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'status';
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === 'read_backup') {
    var backupSheet = ss.getSheetByName('پشتیبان_کامل');
    if (backupSheet && backupSheet.getLastRow() >= 2) {
      var raw = backupSheet.getRange(2, 2).getValue();
      return ContentService.createTextOutput(raw).setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ 
    status: 'online', 
    title: 'Royal Barber Google Sheet Backup WebApp',
    timestamp: new Date().toISOString() 
  })).setMimeType(ContentService.MimeType.JSON);
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  return (
    <div className="space-y-5 animate-fade-in text-right" dir="rtl">
      {/* Toast Feedback */}
      {feedback && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold shadow-md transition-all ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Status & Configuration Card */}
      <div className="clay-card rounded-3xl p-5 sm:p-6 bg-white/95 border border-white/80 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center shadow-xs shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-serif font-black text-stone-900">
                  پشتیبان‌گیری امن در گوگل شیت (Google Sheets)
                </h3>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                  statusInfo.configured
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {statusInfo.configured ? 'همگام‌سازی فعال' : 'در انتظار تنظیم وب‌اپ'}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                داده‌های رزرو نوبت در لوکال‌هاست و هاست پردازش شده و هم‌زمان بدون نیاز به فایربیس در جدول اکسل گوگل شیت شما ثبت و ذخیره می‌گردد.
              </p>
            </div>
          </div>

          <a
            href="https://sheets.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="clay-button-pastel px-3.5 py-2 rounded-xl text-xs font-bold text-stone-700 hover:text-stone-900 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>ورود به گوگل شیت</span>
            <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
          </a>
        </div>

        {/* Status Indicators Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="clay-card-subtle p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/70">
            <div className="text-[11px] text-stone-500 font-medium">وضعیت همگام‌سازی خودکار</div>
            <div className="text-xs font-bold text-stone-800 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>پشتیبان‌گیری همزمان هنگام هر رزرو</span>
            </div>
          </div>

          <div className="clay-card-subtle p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/70">
            <div className="text-[11px] text-stone-500 font-medium">آخرین پشتیبان ثبت‌شده</div>
            <div className="text-xs font-bold text-stone-800 mt-1">
              {statusInfo.lastBackupTimestamp
                ? new Date(statusInfo.lastBackupTimestamp).toLocaleDateString('fa-IR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'هنوز ثبت نشده است'}
            </div>
          </div>

          <div className="clay-card-subtle p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/70">
            <div className="text-[11px] text-stone-500 font-medium">نوع ذخیره‌سازی داده</div>
            <div className="text-xs font-bold text-stone-800 mt-1 flex items-center gap-1.5 text-stone-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>سرور محلی + پشتیبان دائمی شیت</span>
            </div>
          </div>
        </div>

        {/* URL Input Form */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-stone-800">
            آدرس وب‌اپ گوگل اسکریپت (Google Apps Script Web App URL):
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="url"
              dir="ltr"
              value={webAppUrl}
              onChange={(e) => setWebAppUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-mono focus:outline-none focus:border-stone-900 focus:bg-white transition-all shadow-inner"
            />
            <button
              type="button"
              onClick={handleSaveUrl}
              className="clay-button-primary px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap"
            >
              ذخیره نشانی
            </button>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="clay-button-pastel px-4 py-2.5 rounded-xl text-xs font-bold text-stone-700 hover:text-stone-900 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'در حال آزمایش...' : 'تست اتصال'}</span>
            </button>
          </div>
          <p className="text-[11px] text-stone-500">
            این آدرس وب‌اپ با یک کلیک از بخش Deploy گوگل اسکریپت شیت شما تولید می‌شود و بدون نیاز به API Key یا احراز هویت پیچیده عمل می‌کند.
          </p>
        </div>

        {/* Action Buttons: Instant Backup & Restore */}
        <div className="pt-2 flex flex-wrap items-center gap-2.5 border-t border-stone-100">
          <button
            type="button"
            onClick={handleBackupNow}
            disabled={isBackingUp}
            className="clay-button-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Upload className={`w-3.5 h-3.5 ${isBackingUp ? 'animate-bounce' : ''}`} />
            <span>{isBackingUp ? 'در حال ارسال پشتیبان...' : 'پشتیبان‌گیری فوری در گوگل شیت'}</span>
          </button>

          <button
            type="button"
            onClick={handleRestoreNow}
            disabled={isRestoring}
            className="clay-button-pastel px-4 py-2.5 rounded-xl text-xs font-bold text-stone-700 hover:text-stone-900 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className={`w-3.5 h-3.5 ${isRestoring ? 'animate-spin' : ''}`} />
            <span>{isRestoring ? 'در حال بازگردانی...' : 'بازیابی داده‌ها از گوگل شیت'}</span>
          </button>
        </div>
      </div>

      {/* 3-Step Setup Guide & Apps Script Code Box */}
      <div className="clay-card rounded-3xl p-5 sm:p-6 bg-white/95 border border-white/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h4 className="text-sm font-bold text-stone-900">
              راهنمای راه‌اندازی ۱ دقیقه‌ای (بدون هزینه و بدون نیاز به کلید API)
            </h4>
          </div>

          <button
            type="button"
            onClick={handleCopyCode}
            className="clay-button-pastel px-3 py-1.5 rounded-xl text-xs font-bold text-stone-700 hover:text-stone-900 flex items-center gap-1.5 cursor-pointer"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
            <span>{copiedCode ? 'کپی شد!' : 'کپی کد اسکریپت'}</span>
          </button>
        </div>

        <ol className="text-xs text-stone-600 space-y-2 list-decimal list-inside leading-relaxed bg-stone-50/70 p-4 rounded-2xl border border-stone-200/60">
          <li>
            وارد سایت <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="font-bold text-[#7e5352] underline">sheets.new</a> شوید و یک جدول اکسل جدید ایجاد کنید.
          </li>
          <li>
            از منوی بالا به مسیر <strong>Extensions (افزونه‌ها)</strong> &gt; <strong>Apps Script</strong> بروید.
          </li>
          <li>
            کد زیر را کپی کرده و به جای تمام محتویات فایل Code.gs قرار دهید و دکمه ذخیره (آیکون فلاپی‌دیسک) را بزنید.
          </li>
          <li>
            روی دکمه آبی‌رنگ بالای صفحه بنام <strong>Deploy (استقرار)</strong> &gt; <strong>New deployment (استقرار جدید)</strong> کلیک کنید.
          </li>
          <li>
            نوع را <strong>Web app</strong> بگذارید و گزینه <strong>Who has access</strong> را روی <strong>Anyone</strong> (هرکس) تنظیم کنید و Deploy را بزنید.
          </li>
          <li>
            آدرس وب‌اپ تولیدشده (Web App URL) را کپی کرده و در کادر بالای همین صفحه قرار دهید و دکمه «ذخیره نشانی» را بزنید!
          </li>
        </ol>

        {/* Code Snippet Viewer */}
        <div className="relative rounded-2xl overflow-hidden border border-stone-800 bg-[#0f172a] shadow-inner" dir="ltr">
          <div className="flex items-center justify-between px-4 py-2 bg-stone-900/90 border-b border-stone-800 text-[11px] text-stone-400 font-mono">
            <span>Google Apps Script (Code.gs)</span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="text-stone-300 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'کپی شد' : 'کپی'}</span>
            </button>
          </div>
          <pre className="p-4 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-60 leading-relaxed scrollbar-thin">
            {APPS_SCRIPT_CODE}
          </pre>
        </div>
      </div>
    </div>
  );
};
