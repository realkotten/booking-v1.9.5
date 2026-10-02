// ══════════════════════════════════════════════════════════════════
// ROYAL BARBER TYPES & MODELS
// ══════════════════════════════════════════════════════════════════

export type NavigationTab = 'atelier' | 'book' | 'my_bookings' | 'client' | 'visits';

export type ManagementTab = 'today' | 'schedule' | 'clients' | 'analytics' | 'settings';

export type ManagementSubTab =
  | 'today'
  | 'schedule'
  | 'clients'
  | 'analytics'
  | 'demand'
  | 'settings'
  | 'boutique'
  | 'overview'
  | 'reports'
  | 'services';

export type AppPortalMode = 'client' | 'management';

export type ScreenMode = 'welcome' | 'onboarding-1' | 'onboarding-2' | 'onboarding-3' | 'app';

export type BookingStep = 'services' | 'addons' | 'preference' | 'datetime' | 'checkout' | 'confirmed';

export interface ServiceCategory {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export type LegacyServiceCategory = 'haircut' | 'beard' | 'rituals' | 'coloring' | 'treatment';

export type AppointmentStatus =
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'reserved'
  | 'available'
  | 'blocked';

export type ChairStatus =
  | 'available'
  | 'occupied'
  | 'reserved'
  | 'cleaning'
  | 'normal'
  | 'vip'
  | 'service'
  | 'maintenance';

export type BookingSource = 'online' | 'phone' | 'walk_in' | 'concierge' | 'studio_manual';

export type PaymentStatus = 'paid' | 'pending' | 'refunded' | 'unpaid' | 'failed';

export type FulfillmentStatus =
  | 'pending'
  | 'preparing'
  | 'ready_at_chair'
  | 'delivered'
  | 'shipped'
  | 'confirmed'
  | 'cancelled';

export type OrderShippingStatus = 'pending' | 'preparing' | 'processing' | 'shipped' | 'delivered';

export type ProductCategory =
  | 'hair_care'
  | 'beard_care'
  | 'styling'
  | 'fragrance'
  | 'tools'
  | 'accessories'
  | 'scalp_care'
  | 'shaving'
  | string;

export type ProductAvailability = 'in_stock' | 'low_stock' | 'out_of_stock';

export type DeliveryMethodType =
  | 'courier'
  | 'post'
  | 'valet_suite'
  | 'chairside'
  | 'pickup'
  | 'express_courier'
  | 'standard_courier'
  | string;

export type AnalyticsPeriod = 'today' | 'week' | 'month' | 'year' | 'custom';

export interface AnalyticsCustomRange {
  startDate?: string;
  endDate?: string;
  startDay?: number;
  endDay?: number;
}

export interface TrendDataPoint {
  label: string;
  sublabel?: string;
  value?: number;
  secondaryValue?: number;
  serviceRevenue?: number;
  boutiqueRevenue?: number;
  totalRevenue?: number;
  totalAppointments?: number;
  completedAppointments?: number;
  cancelledAppointments?: number;
  noShowAppointments?: number;
  date?: string;
}

export interface PriceHistoryEntry {
  id?: string;
  serviceId?: string;
  oldPrice?: number;
  newPrice?: number;
  price?: number;
  changeDate?: string;
  changedAt?: string;
  effectiveDate?: string;
  reason?: string;
  note?: string;
  author?: string;
}

export interface StatusMeta {
  key?: string;
  label: string;
  persianLabel?: string;
  badgeClass?: string;
  indicatorClass?: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  dotClass?: string;
}

export interface StudioOpeningHour {
  dayOfWeek: string;
  dayIndex?: number;
  openTime: string;
  closeTime: string;
  breakStart?: string;
  breakEnd?: string;
  isClosed?: boolean;
  isOpen?: boolean;
}

export interface DeliveryMethodOption {
  id: string;
  type?: DeliveryMethodType;
  title: string;
  subtitle?: string;
  description?: string;
  cost: number;
  estimatedDelivery?: string;
  estimatedMinutes?: number;
  estimatedDays?: string;
  iconName?: string;
  isComplimentaryForVip?: boolean;
}

export interface StudioProfileSettings {
  name: string;
  tagline: string;
  masterName?: string;
  masterTitle?: string;
  phone: string;
  conciergePhone?: string;
  email: string;
  address: string;
  neighborhood: string;
  city: string;
  operationalStatus?: string;
  privateCourtyardCode?: string;
  valetServiceAvailable?: boolean;
  valetInstructions?: string;
  amenities: string[];
}

export interface AppointmentPoliciesSettings {
  cancellationWindowHours: number;
  bookingCutoffHours: number;
  maxBookingHorizonDays: number;
  depositAmount: number;
  policyNotice: string;
}

export interface NotificationPreferencesSettings {
  newOnlineBooking: boolean;
  appointmentCancellation: boolean;
  appointmentReschedule: boolean;
  newBoutiqueOrder: boolean;
  paymentConfirmation: boolean;
  lowInventoryAlerts: boolean;
}

export interface CommercePromoCode {
  code: string;
  discountPercentage: number;
  description: string;
  isActive: boolean;
}

export interface AnnouncementSettings {
  headline: string;
  body: string;
  tag?: string;
  isActive: boolean;
}

export interface CommerceSettings {
  deliveryMethods: DeliveryMethodOption[];
  promoCodes: CommercePromoCode[];
}

export interface StudioSettings {
  id?: string;
  name?: string;
  studioName?: string;
  tagline?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  phone?: string;
  conciergePhone?: string;
  email?: string;
  operationalStatus?: string;
  privateCourtyardCode?: string;
  valetServiceAvailable?: boolean;
  valetInstructions?: string;
  amenities?: string[];
  profile?: StudioProfileSettings;
  announcement?: AnnouncementSettings;
  operatingHours?: StudioOpeningHour[];
  openingHours?: StudioOpeningHour[];
  deliveryMethods?: DeliveryMethodOption[];
  policies?: AppointmentPoliciesSettings;
  financialTargets?: {
    today: number;
    week: number;
    month: number;
    year: number;
    custom: number;
  };
  notificationPreferences?: NotificationPreferencesSettings;
  commerce?: CommerceSettings;
  valetEnabled?: boolean;
  hospitalityEnabled?: boolean;
  smsReminderHoursBefore?: number;
  currencySymbol?: string;
  googleSheetSettings?: GoogleSheetSettings;
}

export interface GoogleSheetSettings {
  webAppUrl?: string;
  autoBackupOnBooking?: boolean;
  lastBackupTimestamp?: string;
  lastBackupStatus?: 'success' | 'error' | 'idle';
  lastBackupMessage?: string;
}

export type Studio = StudioSettings;

// ─── Chair / Barber Station Model ─────────────────────────────────
export interface Chair {
  id: string;
  chairNumber: string;
  name: string;
  floor: string;
  assignedBarberId: string;
  assignedBarberName: string;
  status: ChairStatus;
  isVip: boolean;
  mirrorType: string;
  notes: string;
  amenities: string[];
}

// ─── Barber / Artisan Model ──────────────────────────────────────
export interface BarberPresetMessage {
  id: string;
  title: string;
  text: string;
  isDefault?: boolean;
}

export interface Barber {
  id: string;
  name: string;
  title: string;
  bio: string;
  experienceYears: number;
  certifications: string[];
  specialties: string[];
  assignedChairId: string;
  avatarUrl: string;
  rating: number;
  totalClientsServed: number;
  phone?: string;
  email?: string;
  isAvailableToday: boolean;
  workingDays?: string[];
  workingHours?: StudioOpeningHour[];
  presetMessages?: BarberPresetMessage[];
}

// ─── Service & Accoutrement Models ───────────────────────────────
export interface PriceLine {
  id: string;
  label: string;
  amount: number;
  originalAmount?: number;
  discountAmount?: number;
  kind: 'service' | 'addon' | 'discount';
}

export interface PriceSummarySnapshot {
  total: number;
  originalTotal?: number;
  discountAmount?: number;
  hasDiscount?: boolean;
  lines: PriceLine[];
}

export interface Service {
  id: string;
  categoryId?: string;
  name: string;
  price: number; // in Toman - Effective payable price (equal to discountedPrice if discounted)
  realPrice?: number; // in Toman - Original real price before discount (قیمت اصلی / واقعی)
  discountedPrice?: number; // in Toman - Optional discounted price (قیمت با تخفیف)
  durationMinutes: number;
  description?: string;
  isActive: boolean;
  sortOrder?: number;
  category?: string | ServiceCategory;
  tag?: string;
  isSpecialty?: boolean;
  priceHistory?: PriceHistoryEntry[];
}

export type ServiceInput = Omit<Service, 'id' | 'sortOrder'>;
export type AccoutrementInput = Omit<Accoutrement, 'id' | 'selected'>;
export type ActionResult = { success: boolean; message?: string; error?: string; service?: Service };

export interface Accoutrement {
  id: string;
  name: string;
  price: number; // in Toman
  durationMinutes: number;
  description: string;
  isComplimentary?: boolean;
  selected?: boolean;
  isActive?: boolean;
  tag?: string;
  sortOrder?: number;
  priceHistory?: PriceHistoryEntry[];
}

export interface BeverageOption {
  id: string;
  name: string;
  icon: string;
  price: number; // in Toman
  description: string;
  category?: 'hot' | 'cold' | 'herbal' | 'snack' | 'other' | string;
  isAvailable?: boolean;
}

// ─── Client Profile & Hair Formula ────────────────────────────────
export interface ClientHairProfile {
  hairType?: 'Straight' | 'Wavy' | 'Curly' | 'Coily' | 'Thinning' | string;
  texture?: string;
  density?: 'Low' | 'Medium' | 'High' | string;
  growthPattern?: string;
  favoriteFade?: 'Skin Fade' | 'Low Fade' | 'Mid Fade' | 'High Fade' | 'Taper' | 'Scissor Classic' | string;
  skinSensitivity?: string;
}

export interface ClientFaceProfile {
  shape?: 'Oval' | 'Square' | 'Round' | 'Oblong' | 'Heart' | 'Diamond' | string;
  beardGrowth?: string;
  targetStyle?: string;
}

export interface ClientHospitalityPreferences {
  beveragePreference?: string;
  audioPreference?: string;
  waterTemperature?: 'cold' | 'room' | 'warm' | 'sparkling' | 'still' | string;
  ambientMusicVolume?: 'quiet' | 'low' | 'ambient' | 'silent' | string;
  conversationLevel?: 'minimal' | 'customary' | 'engaging' | string;
  scentPreference?: string;
}

export interface ClientTechnicalNotes {
  clipperGuard?: string;
  fadeTechnique?: string;
  fadeAngles?: string;
  necklinePreference?: string;
  sideburnPreference?: string;
  beardLength?: string;
  beardShaping?: string;
  scissorPreference?: string;
  stylingPreference?: string;
  productsCommonlyUsed?: string;
  generalTechnicalNotes?: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  roleOrTitle?: string;
  email?: string;
  phone?: string;
  memberId?: string;
  memberTier?: string;
  isVip?: boolean;
  isPermanentClient?: boolean;
  isArchived?: boolean;
  joinedDate?: string;
  totalVisits?: number;
  preferredSuite?: string;
  preferredBarberId?: string;
  cadence?: string;
  routineDays?: number;
  routineCadence?: string;
  routineServiceTitle?: string;
  routineBarberNote?: string;
  lastCutDate?: string;
  lastCutDayNumber?: number;
  nextRoutineDayNumber?: number;
  nextRoutineTargetDate?: string;
  nextRoutineTargetTime?: string;
  valetLicensePlate?: string;
  formulaNotes?: string;
  arrivalPreference?: string;
  privateNotes?: string;
  hairProfile?: ClientHairProfile;
  faceProfile?: ClientFaceProfile;
  hospitality?: ClientHospitalityPreferences;
  technicalNotes?: ClientTechnicalNotes;
  recommendedProductIds?: string[];
  purchasedProductIds?: string[];
}

// ─── Appointment & Reservation Models ─────────────────────────────
export interface Appointment {
  id: string;
  appointmentNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  service: Service;
  barberId: string;
  barberName: string;
  chairId: string;
  chairName: string;
  date: string;
  dayNumber: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  servicePrice: number;
  originalServicePrice?: number;
  discountAmount?: number;
  discountPercent?: number;
  accoutrementsPrice: number;
  tipPercentage: number;
  tipAmount: number;
  totalAmount: number;
  depositAmount: number;
  additionalAccoutrements: Accoutrement[];
  beverage?: BeverageOption;
  customerNotes?: string;
  stylingNotes?: string;
  status: AppointmentStatus;
  bookingSource: BookingSource;
  createdAt: string;
  bookingTimestamp: string;
  isVip?: boolean;
  isQuietSession?: boolean;
  priceSummary?: PriceSummarySnapshot;
}

export interface Reservation extends Appointment {
  reservationNumber?: string;
  artisan?: string;
  suite?: string;
  location?: string;
  selectedDate?: string;
  selectedTime?: string;
  priceSummary?: PriceSummarySnapshot;
}

// ─── Boutique Product & Order Models ──────────────────────────────
export interface Product {
  id: string;
  name: string;
  persianName?: string;
  brand?: string;
  shortDescription?: string;
  price: number;
  category: string;
  description: string;
  volume?: string;
  volumeOrWeight?: string;
  imageUrl?: string;
  ingredients?: string | string[];
  inStock: boolean;
  isActive?: boolean;
  availability?: ProductAvailability;
  stockQuantity?: number;
  recommended?: boolean;
  featured?: boolean;
  tags?: string[];
  isComplimentaryForVip?: boolean;
  rating?: number;
  atelierNotes?: string;
  details?: Record<string, string> | any;
  usageInstructions?: string | string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  customerId?: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  discount?: number;
  shippingFee?: number;
}

export interface OrderItem {
  productId?: string;
  name?: string;
  persianName?: string;
  imageUrl?: string;
  volumeOrWeight?: string;
  product?: Product;
  quantity: number;
  unitPrice?: number;
  price?: number;
}

export interface OrderDeliveryAddress {
  fullName?: string;
  recipientName?: string;
  phone?: string;
  street?: string;
  address?: string;
  unit?: string;
  city?: string;
  postalCode?: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  items: OrderItem[];
  subtotal?: number;
  total?: number;
  totalPrice?: number;
  status?: any;
  paymentStatus?: PaymentStatus;
  paymentMethod?: string;
  fulfillmentStatus?: FulfillmentStatus;
  shippingStatus?: OrderShippingStatus;
  deliveryMethod?: DeliveryMethodType;
  deliveryMethodTitle?: string;
  deliveryAddress?: OrderDeliveryAddress | string;
  shippingAddress?: string;
  trackingNumber?: string;
  discount?: number;
  discountCode?: string;
  shippingFee?: number;
  shippingCost?: number;
  valetDeliveryToChair?: boolean;
  chairId?: string;
  orderStatus?: string;
  orderDate?: string;
  createdAt?: string;
  updatedAt?: string;
  associatedAppointmentId?: string;
}

// ─── Analytics Metrics Models ─────────────────────────────────────
export interface ServicePerformanceMetric {
  serviceId?: string;
  name?: string;
  serviceName?: string;
  category?: string;
  totalBookings?: number;
  bookingsCount?: number;
  completedCount?: number;
  revenue?: number;
  totalRevenue?: number;
  avgRevenue?: number;
  sharePercentage?: number;
  revenuePct?: number;
}

export interface BoutiquePerformanceMetric {
  productId?: string;
  name?: string;
  persianName?: string;
  productName?: string;
  category?: string;
  unitsSold?: number;
  revenue?: number;
  totalRevenue?: number;
  avgPrice?: number;
  revenuePct?: number;
  imageUrl?: string;
}

export interface TopCustomerMetric {
  customerId?: string;
  customerName: string;
  memberId?: string;
  isVip?: boolean;
  visitsCount?: number;
  ordersCount?: number;
  totalSpend?: number;
  totalSpent?: number;
  appointmentsCount?: number;
  lastVisitDate?: string;
}

export interface AnalyticsSummary {
  period?: any;
  periodLabel?: string;
  dateRangeDescription?: string;
  totalRevenue: number;
  servicesRevenue?: number;
  serviceRevenue?: number;
  servicePct?: number;
  boutiqueRevenue: number;
  boutiquePct?: number;
  revenueTrend?: TrendDataPoint[];
  appointmentTrend?: TrendDataPoint[];
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments?: number;
  inProgressOrConfirmedAppointments?: number;
  completionRate?: number;
  cancellationRate?: number;
  noShowRate?: number;
  bookedMinutes?: number;
  availableMinutes?: number;
  totalOrders?: number;
  avgTransactionValue?: number;
  averageTicketSize?: number;
  transactionCount?: number;
  serviceTransactionCount?: number;
  boutiqueTransactionCount?: number;
  revenueGrowthPct?: number;
  revenueGrowthDiff?: number;
  isGrowthPositive?: boolean;
  vipClientsCount?: number;
  occupancyRate: number;
  financialTarget?: {
    targetAmount: number;
    achievedPct: number;
    isTargetMet: boolean;
    currentRevenue?: number;
    remainingAmount?: number;
  };
  servicePerformance?: ServicePerformanceMetric[];
  boutiquePerformance?: BoutiquePerformanceMetric[];
  filteredAppointments?: any[];
  filteredOrders?: any[];
  customerMetrics?: {
    activeCustomersCount?: number;
    newCustomersCount?: number;
    returningCustomersCount?: number;
    avgCustomerValue?: number;
    topCustomers: TopCustomerMetric[];
  };
}

// ─── Studio Notifications ────────────────────────────────────────
export interface StudioNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type:
    | 'appointment_confirmed'
    | 'appointment_new'
    | 'appointment_cancelled'
    | 'studio_broadcast'
    | 'concierge_message'
    | 'order_update'
    | 'valet_ready'
    | 'suite_prepared'
    | 'general';
  entityType?: string;
  entityId?: string;
  read?: boolean;
  isRead?: boolean;
  priority?: 'low' | 'normal' | 'high' | 'urgent' | string;
  link?: string;
}
