import { 
  Studio, 
  Chair, 
  Barber, 
  ClientProfile, 
  Service, 
  Accoutrement, 
  BeverageOption, 
  Appointment, 
  Product, 
  Order, 
  StudioNotification 
} from '../types';
import { DEFAULT_BARBER_AVATAR, DEFAULT_CLIENT_AVATAR } from './avatars';

// ─── 1. Studio Seed ───────────────────────────────────────────────
export const STUDIO_SEED: Studio = {
  id: 'royal-barber-tehran',
  name: 'آرایشگاه رویال',
  tagline: 'رزرو آنلاین نوبت آرایشگاه، بدون تماس تلفنی',
  address: 'تهران، سعادت‌آباد، خیابان سرو غربی، پلاک ۲۴',
  neighborhood: 'سعادت‌آباد',
  city: 'تهران',
  phone: '۰۲۱-۲۲۳۳۴۴۵۵',
  conciergePhone: '۰۲۱-۲۲۳۳۴۴۵۵',
  email: 'info@royalbarber.ir',
  openingHours: [
    { dayOfWeek: 'شنبه تا چهارشنبه', openTime: '۱۰:۰۰', closeTime: '۲۰:۰۰' },
    { dayOfWeek: 'پنجشنبه و جمعه', openTime: '۱۰:۰۰', closeTime: '۲۲:۰۰' },
  ],
  operationalStatus: 'open',
  valetServiceAvailable: false,
  valetInstructions: '',
  privateCourtyardCode: '',
  amenities: [
    'رزرو آنلاین ۲۴ ساعته',
    'یادآوری خودکار پیامکی',
    'ثبت سوابق و سلیقه مشتری',
    'نظافت و استریل کامل ابزارها',
    'پذیرایی چای و قهوه',
  ],
};

// ─── 2. Chairs Seed ───────────────────────────────────────────────
export const CHAIRS_SEED: Chair[] = [
  {
    id: 'chair-01',
    chairNumber: '۰۱',
    name: 'صندلی اصلی',
    floor: 'سالن اصلی',
    assignedBarberId: 'barber-ali-rezaei',
    assignedBarberName: 'علی رضایی',
    status: 'normal',
    isVip: false,
    mirrorType: 'آینه کلاسیک با نورپردازی استاندارد',
    notes: 'سرآرایشگر',
    amenities: ['صندلی برقی هیدرولیک', 'حوضچه شستشو'],
  },
];

// ─── 3. Barbers Seed ──────────────────────────────────────────────
export const BARBERS_SEED: Barber[] = [
  {
    id: 'barber-ali-rezaei',
    name: 'علی رضایی',
    title: 'سرآرایشگر · ۸ سال سابقه',
    bio: 'سرآرایشگر و متخصص فرم‌دهی مو و اصلاح کلاسیک و مدرن با بیش از ۸ سال سابقه حرفه‌ای.',
    experienceYears: 8,
    certifications: ['مدرک بین‌المللی پیرایش مردانه', 'متخصص فید و استایلینگ'],
    specialties: ['کوتاهی کلاسیک و مدرن', 'اصلاح با تیغ سنتی', 'فرم‌دهی تخصصی ریش'],
    assignedChairId: 'chair-01',
    avatarUrl: DEFAULT_BARBER_AVATAR,
    rating: 5.0,
    totalClientsServed: 1850,
    phone: '۰۹۱۲۱۱۱۱۱۱۱',
    email: 'ali@royalbarber.ir',
    isAvailableToday: true,
    workingDays: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'],
    workingHours: [
      { dayOfWeek: 'شنبه', openTime: '10:00', closeTime: '20:30', isClosed: false },
      { dayOfWeek: 'یکشنبه', openTime: '10:00', closeTime: '20:30', isClosed: false },
      { dayOfWeek: 'دوشنبه', openTime: '10:00', closeTime: '20:30', isClosed: false },
      { dayOfWeek: 'سه‌شنبه', openTime: '10:00', closeTime: '20:30', isClosed: false },
      { dayOfWeek: 'چهارشنبه', openTime: '10:00', closeTime: '20:30', isClosed: false },
      { dayOfWeek: 'پنج‌شنبه', openTime: '10:00', closeTime: '22:00', isClosed: false },
      { dayOfWeek: 'جمعه', openTime: '12:00', closeTime: '18:00', isClosed: false },
    ],
  },
];

// ─── 4. Customer & Profile Seed (Empty by default for production) ──
export const CUSTOMERS_SEED: ClientProfile[] = [];

export const DEFAULT_CLIENT_PROFILE: ClientProfile = {
  id: 'guest',
  name: '',
  roleOrTitle: 'کاربر مهمان',
  avatarUrl: DEFAULT_CLIENT_AVATAR,
  email: '',
  phone: '',
  memberId: '',
  memberTier: 'مهمان',
  isVip: false,
  isPermanentClient: false,
  joinedDate: '',
  totalVisits: 0,
  preferredSuite: '',
  preferredBarberId: '',
  cadence: '',
  formulaNotes: '',
  arrivalPreference: '',
  privateNotes: '',
  technicalNotes: {},
  recommendedProductIds: [],
  purchasedProductIds: [],
};

// ─── 5. Services Seed ─────────────────────────────────────────────
export const SERVICES_SEED: Service[] = [
  {
    id: 'service-haircut',
    name: 'کوتاهی مو',
    category: 'haircut',
    durationMinutes: 40,
    price: 150000,
    realPrice: 180000,
    discountedPrice: 150000,
    description: 'کوتاهی و فرم‌دهی با مشاوره مدل متناسب با فرم صورت شما',
    tag: 'محبوب‌ترین',
    isSpecialty: true,
    isActive: true,
  },
  {
    id: 'service-haircut-beard',
    name: 'کوتاهی مو + اصلاح ریش',
    category: 'haircut',
    durationMinutes: 60,
    price: 220000,
    realPrice: 260000,
    discountedPrice: 220000,
    description: 'ترکیب کوتاهی مو و اصلاح و فرم‌دهی ریش با شستشو و استایل کامل',
    tag: 'پکیج ویژه',
    isActive: true,
  },
  {
    id: 'service-shave',
    name: 'اصلاح با تیغ سنتی',
    category: 'beard',
    durationMinutes: 30,
    price: 130000,
    realPrice: 130000,
    description: 'اصلاح صورت با حوله گرم و تیغ سنتی همراه با لوسیون آرامش‌بخش پوست',
    tag: 'کلاسیک',
    isActive: true,
  },
  {
    id: 'service-full-package',
    name: 'پکیج کامل آرایشگاه',
    category: 'rituals',
    durationMinutes: 90,
    price: 350000,
    realPrice: 420000,
    discountedPrice: 350000,
    description: 'کوتاهی مو، اصلاح ریش، ماساژ سر و مراقبت پوست صورت با حوله گرم',
    tag: 'کامل‌ترین سرویس',
    isActive: true,
  },
];

// ─── 6. Accoutrements Seed ────────────────────────────────────────
export const ACCOUTREMENTS_SEED: Accoutrement[] = [
  {
    id: 'acc-wash',
    name: 'شستشو و ویتامینه',
    price: 80000,
    durationMinutes: 15,
    description: 'شستشوی حرفه‌ای با شامپوی تقویتی',
    selected: false,
  },
  {
    id: 'acc-beard',
    name: 'فرم‌دهی و روغن ریش',
    price: 100000,
    durationMinutes: 15,
    description: 'مرتب‌سازی و تغذیه ریش',
    selected: false,
  },
  {
    id: 'acc-peel',
    name: 'ماسک لایه‌بردار',
    price: 120000,
    durationMinutes: 20,
    description: 'پاکسازی عمیق پوست صورت',
    selected: false,
  },
  {
    id: 'acc-scalp',
    name: 'ماساژ سر با اسطوخودوس',
    price: 90000,
    durationMinutes: 15,
    description: 'کاهش استرس و تقویت ریشه مو',
    selected: false,
  },
];

// ─── 7. Beverage & Hospitality Options Seed ───────────────────────
export const BEVERAGE_OPTIONS_SEED: BeverageOption[] = [
  {
    id: 'tea',
    name: 'چای اعلا لاهیجان و هل',
    icon: 'coffee',
    price: 35000,
    description: 'چای دمی درجه یک همراه با نبات زعفرانی و هل تازه',
    category: 'hot',
    isAvailable: true,
  },
  {
    id: 'espresso',
    name: 'قهوه اسپرسو دوبل',
    icon: 'coffee',
    price: 55000,
    description: 'اسپرسوی تازه رست با دانه ۱۰۰٪ عربیکا تک‌خاستگاه',
    category: 'hot',
    isAvailable: true,
  },
  {
    id: 'latte',
    name: 'کافه لاته و کارامل',
    icon: 'coffee',
    price: 65000,
    description: 'شیر بخارداده‌شده با اسپرسو تازه و سیروپ کارامل',
    category: 'hot',
    isAvailable: true,
  },
  {
    id: 'fresh-juice',
    name: 'آبمیوه طبیعی فصل',
    icon: 'glass-water',
    price: 60000,
    description: 'آب پرتقال یا انار طبیعی تازه فشرده‌شده',
    category: 'cold',
    isAvailable: true,
  },
  {
    id: 'croissant',
    name: 'کروسان فرانسوی و کوکی گرم',
    icon: 'utensils',
    price: 45000,
    description: 'کروسان تازه پخت کره‌ای با شکلات یا کوکی بادام',
    category: 'snack',
    isAvailable: true,
  },
  {
    id: 'water',
    name: 'آب معدنی خنک',
    icon: 'glass-water',
    price: 15000,
    description: 'آب معدنی کوهستان به همراه برش لیموی تازه',
    category: 'cold',
    isAvailable: true,
  },
];

// ─── 8. Today & Schedule Appointments Seed (Empty by default) ───────
export const TODAY_APPOINTMENTS_SEED: Appointment[] = [];

export const INITIAL_APPOINTMENT: Appointment = {
  id: '',
  appointmentNumber: '',
  customerId: 'client-user',
  customerName: 'مشتری گرامی',
  customerPhone: '',
  serviceId: 'service-haircut',
  service: SERVICES_SEED[0],
  barberId: 'barber-ali-rezaei',
  barberName: 'علی رضایی',
  chairId: 'chair-01',
  chairName: 'صندلی اصلی (علی رضایی)',
  date: '',
  dayNumber: 22,
  startTime: '',
  endTime: '',
  durationMinutes: 40,
  servicePrice: 150000,
  accoutrementsPrice: 0,
  tipPercentage: 0,
  tipAmount: 0,
  totalAmount: 150000,
  depositAmount: 0,
  additionalAccoutrements: [],
  beverage: BEVERAGE_OPTIONS_SEED[0],
  stylingNotes: '',
  status: 'confirmed',
  bookingSource: 'online',
  createdAt: '',
  bookingTimestamp: '',
};

export const PAST_APPOINTMENTS_SEED: Appointment[] = [];

// Empty products & orders to keep backward type compatibility without any shop UI
export const PRODUCTS_SEED: Product[] = [];
export const ORDERS_SEED: Order[] = [];

export const NOTIFICATIONS_SEED: StudioNotification[] = [];
