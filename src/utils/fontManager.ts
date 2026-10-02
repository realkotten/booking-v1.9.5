export interface FontOption {
  id: string;
  nameFa: string;
  nameEn: string;
  badge: string;
  category: 'recommended' | 'geometric' | 'clean' | 'rounded' | 'classical' | 'system';
  fontFamily: string;
  sampleFa: string;
  sampleEn: string;
  description: string;
}

export const AVAILABLE_FONTS: FontOption[] = [
  {
    id: 'vazirmatn',
    nameFa: 'وزیرمتن (پیش‌فرض)',
    nameEn: 'Vazirmatn (Default)',
    badge: 'فونت پیش‌فرض سامانه',
    category: 'recommended',
    fontFamily: '"Vazirmatn", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    sampleFa: 'آرایشگاه رویال — نوبت‌دهی لوکس و اصلاح مو ساعت ۱۸:۳۰',
    sampleEn: 'Royal Atelier — Luxury Grooming & Barbershop',
    description: 'فونت پیش‌فرض و استاندارد وب و موبایل فارسی با بیشترین خوانایی، تقارن و وضوح در تمام اندازه‌ها',
  },
  {
    id: 'readex-pro',
    nameFa: 'ریدکس پرو',
    nameEn: 'Readex Pro (Geometric)',
    badge: 'هندسی و لوکس',
    category: 'geometric',
    fontFamily: '"Readex Pro", "Vazirmatn", -apple-system, BlinkMacSystemFont, sans-serif',
    sampleFa: 'تجربه رزرو مدرن، فرم‌های هندسی دقیق و جلوه بصری خاص',
    sampleEn: 'Modern Geometry & Clean Precision Lines',
    description: 'طراحی هندسی مدرن با هماهنگی کامل کاراکترهای فارسی و انگلیسی، مناسب اپلیکیشن‌های لوکس',
  },
  {
    id: 'ibm-plex',
    nameFa: 'آی‌بی‌ام پلکس عربیک',
    nameEn: 'IBM Plex Sans Arabic',
    badge: 'معماری و پرستیژ',
    category: 'clean',
    fontFamily: '"IBM Plex Sans Arabic", "Vazirmatn", -apple-system, BlinkMacSystemFont, sans-serif',
    sampleFa: 'طراحی صنعتی و معمارانه، خطوط استوار و پرستیژ حرفه‌ای',
    sampleEn: 'Engineered for Clarity & Architectural Elegance',
    description: 'تایپ‌فیس مهندسی‌شده با حس صنعتی مدرن، خطوط منظم و خوانایی فوق‌العاده بالا',
  },
  {
    id: 'rubik',
    nameFa: 'روبیک',
    nameEn: 'Rubik (Soft Rounded)',
    badge: 'لبه‌های نرم و دوستانه',
    category: 'rounded',
    fontFamily: '"Rubik", "Vazirmatn", -apple-system, BlinkMacSystemFont, sans-serif',
    sampleFa: 'گوشه‌های نرم و منحنی، حس صمیمی و ارتباط گرم با مشتری',
    sampleEn: 'Soft Curves, Warm Interaction & Casual Elegance',
    description: 'فونت خوش‌تراش با گوشه‌های اندکی گرد، مناسب محیط‌های آرامش‌بخش و سالن‌های زیبایی',
  },
  {
    id: 'noto-sans',
    nameFa: 'نوتو سنس',
    nameEn: 'Noto Sans Arabic',
    badge: 'جهانی و متعادل',
    category: 'clean',
    fontFamily: '"Noto Sans Arabic", "Vazirmatn", -apple-system, BlinkMacSystemFont, sans-serif',
    sampleFa: 'تعادل استاندارد جهانی گوگل، فوق‌العاده دقیق و بدون حاشیه',
    sampleEn: 'Universal Precision & Worldwide Balance',
    description: 'تایپوگرافی رسمی و دقیق گوگل با پوشش بی‌نقص حروف و علائم',
  },
  {
    id: 'noto-naskh',
    nameFa: 'نوتو نسخ',
    nameEn: 'Noto Naskh Arabic',
    badge: 'سنتی و رسمی',
    category: 'classical',
    fontFamily: '"Noto Naskh Arabic", "Amiri", Georgia, serif',
    sampleFa: 'قلم رسمی خط نسخ با وقار، اصالت ایرانی و خطوط کلاسیک',
    sampleEn: 'Refined Formal Naskh Calligraphy',
    description: 'خط سنتی نسخ با اعتدال حروف و حسی سنگین و باوقار',
  },
  {
    id: 'amiri',
    nameFa: 'امیری',
    nameEn: 'Amiri (Classical Heritage)',
    badge: 'کلاسیک و مجلل',
    category: 'classical',
    fontFamily: '"Amiri", "Noto Naskh Arabic", Georgia, serif',
    sampleFa: 'شکوه خوشنویسی اصیل شرقی، حس نوستالژیک سالن‌های سنتی اعیانی',
    sampleEn: 'Heritage Calligraphic Warmth & Prestige',
    description: 'الهام‌گرفته از تایپ کلاسیک مطبعه امیری قاهره، با فرم‌های خوشنویسی زیبا',
  },
  {
    id: 'plus-jakarta',
    nameFa: 'پلاس جاکارتا + وزیر',
    nameEn: 'Plus Jakarta Sans + Vazir',
    badge: 'ترکیب مدرن بین‌المللی',
    category: 'recommended',
    fontFamily: '"Plus Jakarta Sans", "Vazirmatn", system-ui, sans-serif',
    sampleFa: 'ترکیب لوکس تیترهای بین‌المللی با حروف صیقلی فارسی',
    sampleEn: 'Contemporary Luxury App Typography',
    description: 'طراحی شده برای رابط‌های کاربری مدرن نسل جدید با کاراکترهای لاتین لوکس و فارسی روان',
  },
  {
    id: 'system',
    nameFa: 'سیستم عامل (پیش‌فرض)',
    nameEn: 'System Default (San Francisco / Segoe)',
    badge: 'سیستم عامل',
    category: 'system',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    sampleFa: 'استفاده از قلم پیش‌فرض تلفن همراه یا کامپیوتر شما',
    sampleEn: 'Native OS font rendering (Fastest)',
    description: 'رندرینگ مستقیم با موتور متن محلی دستگاه بدون نیاز به بارگذاری فایل وب',
  },
];

const FONT_STORAGE_KEY = 'atelier_selected_font_id';
const DEFAULT_FONT_ID = 'vazirmatn';

export function getSelectedFontId(): string {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(FONT_STORAGE_KEY);
      if (stored && AVAILABLE_FONTS.some((f) => f.id === stored)) {
        return stored;
      }
    }
  } catch (e) {
    // Ignore localStorage errors
  }
  return DEFAULT_FONT_ID;
}

export function getSelectedFont(): FontOption {
  const currentId = getSelectedFontId();
  return AVAILABLE_FONTS.find((f) => f.id === currentId) || AVAILABLE_FONTS[0];
}

export function applyFont(fontId: string): FontOption {
  const targetFont = AVAILABLE_FONTS.find((f) => f.id === fontId) || AVAILABLE_FONTS[0];

  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(FONT_STORAGE_KEY, targetFont.id);

      // Inject onto CSS root variables
      const root = document.documentElement;
      root.style.setProperty('--app-font', targetFont.fontFamily);
      root.style.setProperty('--font-sans', targetFont.fontFamily);
      
      if (targetFont.category === 'classical') {
        root.style.setProperty('--font-serif', targetFont.fontFamily);
      } else {
        root.style.setProperty('--font-serif', targetFont.fontFamily);
      }

      // Add a data-font attribute for styling hooks
      root.setAttribute('data-app-font', targetFont.id);

      // Dispatch custom event for reactive UI updates
      window.dispatchEvent(
        new CustomEvent('atelier-font-changed', {
          detail: { font: targetFont },
        })
      );
    }
  } catch (e) {
    console.error('Failed to save font:', e);
  }

  return targetFont;
}

export const FONTS = AVAILABLE_FONTS;
export const saveSelectedFont = applyFont;

// Initialize font on first script load
export function initFontManager(): FontOption {
  const font = getSelectedFont();
  return applyFont(font.id);
}
