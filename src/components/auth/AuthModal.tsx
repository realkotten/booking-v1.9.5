import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShieldCheck, 
  Sparkles, 
  CalendarCheck, 
  Award, 
  Loader2, 
  AlertCircle,
  Phone,
  User,
  KeyRound,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useAtelier } from '../../store/AtelierContext';
import { hapticSuccess, hapticError, hapticLight } from '../../utils/hapticUtils';
import { toEnglishDigits } from '../../utils/dateUtils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register' | 'phone';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'phone',
  onSuccess
}) => {
  const { currentCustomer, loginClientPhone, loginClientCredentials, registerClient } = useAtelier();
  const [authMode, setAuthMode] = useState<'phone' | 'credentials' | 'register'>(defaultMode === 'register' ? 'register' : defaultMode === 'login' ? 'credentials' : 'phone');
  
  // Form states
  const [phoneNumber, setPhoneNumber] = useState(currentCustomer?.phone && currentCustomer.phone !== '۰۹۱۲۳۴۵۶۷۸۹' ? currentCustomer.phone : '');
  const [fullName, setFullName] = useState(currentCustomer?.name && currentCustomer.name !== 'مهمان آتلیه' ? currentCustomer.name : '');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanPhone = toEnglishDigits(phoneNumber).trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage('لطفاً شماره همراه ۱۱ رقمی معتبر را وارد نمایید (مانند ۰۹۱۲۳۴۵۶۷۸۹).');
      hapticError();
      return;
    }

    setIsLoading(true);
    hapticLight();

    const res = await loginClientPhone(cleanPhone, fullName.trim() || undefined);
    setIsLoading(false);

    if (res.success) {
      hapticSuccess();
      setSuccessMessage('ورود به حساب با موفقیت انجام شد!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 600);
    } else {
      hapticError();
      setErrorMessage(res.error || 'خطا در برقراری ارتباط با سرور.');
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanIdent = toEnglishDigits(identifier).trim();
    const cleanPass = toEnglishDigits(password).trim();

    if (!cleanIdent) {
      setErrorMessage('شماره همراه، ایمیل یا نام کاربری را وارد نمایید.');
      hapticError();
      return;
    }

    setIsLoading(true);
    hapticLight();

    const res = await loginClientCredentials(cleanIdent, cleanPass || undefined);
    setIsLoading(false);

    if (res.success) {
      hapticSuccess();
      setSuccessMessage('خوش آمدید!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 600);
    } else {
      hapticError();
      setErrorMessage(res.error || 'اطلاعات کاربری نامعتبر است.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanPhone = toEnglishDigits(phoneNumber).trim();
    const cleanEmail = identifier.includes('@') ? identifier.trim() : email.trim();
    const cleanPass = toEnglishDigits(password).trim();

    if (!cleanPhone && !cleanEmail) {
      setErrorMessage('شماره همراه یا ایمیل برای ایجاد حساب الزامی است.');
      hapticError();
      return;
    }

    setIsLoading(true);
    hapticLight();

    const res = await registerClient({
      phone: cleanPhone || undefined,
      email: cleanEmail || undefined,
      password: cleanPass || '123456',
      displayName: fullName.trim() || undefined,
    });
    setIsLoading(false);

    if (res.success) {
      hapticSuccess();
      setSuccessMessage('حساب کاربری شما با موفقیت ایجاد گردید!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 600);
    } else {
      hapticError();
      setErrorMessage(res.error || 'خطا در ثبت‌نام.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
    >
      <div 
        className="relative w-full max-w-[420px] bg-white/95 backdrop-blur-2xl border border-white/90 rounded-[36px] p-6 sm:p-7 shadow-2xl text-stone-900 overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:text-stone-900 hover:bg-stone-200 flex items-center justify-center transition-colors cursor-pointer"
          title="بستن"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Crest Header */}
        <div className="text-center pt-2 pb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3b333a] to-[#211c20] text-white mx-auto flex items-center justify-center mb-3 shadow-lg shadow-stone-900/15">
            <Sparkles className="w-7 h-7 text-[#e4ddf6]" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4f2f9] border border-[#e4ddf6] text-[#453743] text-xs font-semibold mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>سامانه یکپارچه سرور میزبان</span>
          </div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">
            {authMode === 'register' ? 'عضویت در باشگاه رویال' : 'ورود به حساب کاربری'}
          </h2>
          <p className="text-xs text-stone-600 mt-1 max-w-[290px] mx-auto leading-relaxed">
            ذخیره‌سازی و همگام‌سازی دائمی نوبت‌ها، پرونده و سوابق در سرور اختصاصی
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-stone-100/90 p-1 rounded-2xl mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setAuthMode('phone'); setErrorMessage(null); }}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              authMode === 'phone' 
                ? 'bg-white text-stone-900 shadow-sm font-bold' 
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            ورود سریع با موبایل
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('credentials'); setErrorMessage(null); }}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              authMode === 'credentials' 
                ? 'bg-white text-stone-900 shadow-sm font-bold' 
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            رمز عبور / ایمیل
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('register'); setErrorMessage(null); }}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              authMode === 'register' 
                ? 'bg-white text-stone-900 shadow-sm font-bold' 
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            ثبت‌نام جدید
          </button>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="font-semibold">{successMessage}</p>
          </div>
        )}

        {/* ─── Mode 1: Quick Phone Login ───────────────────────────────────────── */}
        {authMode === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                شماره تلفن همراه
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  dir="ltr"
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3 px-3.5 text-left font-mono text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#5a4a58]/30 focus:border-[#5a4a58] transition-all"
                  required
                />
                <Phone className="w-4 h-4 text-stone-400 absolute right-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                نام و نام خانوادگی (اختیاری)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="نام شما"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3 px-3.5 text-right text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#5a4a58]/30 focus:border-[#5a4a58] transition-all"
                />
                <User className="w-4 h-4 text-stone-400 absolute right-3 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-b from-white to-[#f1f5f9] hover:from-white hover:to-[#e2e8f0] text-[#0f172a] border border-white ring-1 ring-white/80 rounded-2xl font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#0f172a]" />
                  <span>در حال ذخیره و ورود...</span>
                </>
              ) : (
                <>
                  <span>ورود فوری به حساب</span>
                  <ArrowRight className="w-4 h-4 rotate-180 text-[#0f172a]" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ─── Mode 2: Password / Credentials ─────────────────────────────────── */}
        {authMode === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                نام کاربری، شماره همراه یا ایمیل
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="0912... یا info@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  dir="ltr"
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3 px-3.5 text-left text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#5a4a58]/30 focus:border-[#5a4a58] transition-all"
                  required
                />
                <User className="w-4 h-4 text-stone-400 absolute right-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                رمز عبور
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  dir="ltr"
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3 px-3.5 text-left text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#5a4a58]/30 focus:border-[#5a4a58] transition-all"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute right-3 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-b from-white to-[#f1f5f9] hover:from-white hover:to-[#e2e8f0] text-[#0f172a] border border-white ring-1 ring-white/80 rounded-2xl font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#0f172a]" />
                  <span>در حال اعتبارسنجی...</span>
                </>
              ) : (
                <>
                  <span>ورود با رمز عبور</span>
                  <KeyRound className="w-4 h-4 text-[#0f172a]" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ─── Mode 3: Register ──────────────────────────────────────────────── */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                نام و نام خانوادگی
              </label>
              <input
                type="text"
                placeholder="مثلاً: محمد کریمی"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-2.5 px-3.5 text-right text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#5a4a58]/30 focus:border-[#5a4a58] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                شماره تلفن همراه
              </label>
              <input
                type="tel"
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                dir="ltr"
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-2.5 px-3.5 text-left font-mono text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#5a4a58]/30 focus:border-[#5a4a58] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                رمز عبور (دلخواه)
              </label>
              <input
                type="password"
                placeholder="حداقل ۶ کاراکتر"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                dir="ltr"
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-2.5 px-3.5 text-left text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#5a4a58]/30 focus:border-[#5a4a58] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-b from-white to-[#f1f5f9] hover:from-white hover:to-[#e2e8f0] text-[#0f172a] border border-white ring-1 ring-white/80 rounded-2xl font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#0f172a]" />
                  <span>در حال ایجاد حساب...</span>
                </>
              ) : (
                <>
                  <span>ایجاد حساب و عضویت</span>
                  <Award className="w-4 h-4 text-[#0f172a]" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Feature badges footer */}
        <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-medium">
          <div className="flex items-center gap-1">
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>نوبت‌دهی خودکار</span>
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>دیتابیس میزبان امن</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>سوابق و استایل</span>
          </div>
        </div>
      </div>
    </div>
  );
};
