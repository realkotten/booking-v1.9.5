import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  Studio, 
  Chair, 
  Barber, 
  ClientProfile, 
  Service, 
  ServiceCategory,
  ServiceInput,
  AccoutrementInput,
  ActionResult,
  Accoutrement, 
  BeverageOption,
  Appointment, 
  Reservation, 
  Product, 
  Cart, 
  CartItem,
  Order, 
  StudioNotification, 
  AppointmentStatus,
  ManagementTab,
  ManagementSubTab,
  AppPortalMode,
  DeliveryMethodType,
  OrderDeliveryAddress,
  StudioSettings,
  StudioProfileSettings,
  AppointmentPoliciesSettings,
  NotificationPreferencesSettings,
  CommerceSettings,
  StudioOpeningHour,
  AnalyticsPeriod,
  PriceHistoryEntry,
  AnnouncementSettings,
  BarberPresetMessage
} from '../types';
import { DEFAULT_BARBER_PRESET_MESSAGES } from '../utils/presetMessages';
import { useServiceCatalog } from '../hooks/useServiceCatalog';
import { calculateBookingTotal } from '../utils/pricingUtils';
import { 
  STUDIO_DATA, 
  CHAIRS_DATA, 
  BARBERS_DATA, 
  CUSTOMERS_DATA, 
  SERVICES_DATA, 
  ACCOUTREMENTS_DATA, 
  BEVERAGE_OPTIONS,
  INITIAL_RESERVATION, 
  INITIAL_CLIENT_PROFILE,
  TODAY_APPOINTMENTS_DATA, 
  PAST_APPOINTMENTS_DATA, 
  PRODUCTS_DATA, 
  ORDERS_DATA, 
  NOTIFICATIONS_DATA 
} from '../data/mockData';
// Commerce utils removed (boutique excised)

import { checkAppointmentConflict, findCustomerByPhone, calculateAppointmentTotals } from '../utils/appointmentUtils';
import { addMinutesToTime, getPersianDateForDay, getCurrentSolarDateInfo } from '../utils/dateUtils';
import { normalizePhoneNumber, validateFullName } from '../utils/customerUtils';
import { DEFAULT_STUDIO_SETTINGS } from '../utils/settingsDefaults';
import { sendNativeNotification } from '../utils/serviceWorkerRegistration';
import {
  DemandRecord,
  CustomerConstraintRecord,
  DetailedDemandAnalytics,
  getDetailedDemandAnalytics,
  recordTimeDemand,
  recordCustomerAvailabilityConstraint,
  isSlotExpired,
} from '../utils/bookingUtils';
import { 
  fetchServerStore, 
  saveServerStore, 
  createServerAppointment, 
  updateServerAppointmentStatus, 
  deleteServerAppointment,
  saveServerCustomer,
  updateServerCustomerPatch,
  createServerOrder,
  saveServerService,
  deleteServerService,
  saveServerCategory,
  deleteServerCategory,
  saveServerSettings,
  quickPhoneLogin,
  loginWithCredentials,
  loginUser as apiLoginUser,
  registerUser as apiRegisterUser,
  fetchCurrentSessionUser,
  clearStoredSessionToken,
  AtelierUser
} from '../api/atelierApi';
import { getDeterministicAvatar, DEFAULT_CLIENT_AVATAR } from '../data/avatars';
import { 
  loadStoredBrowserProfile, 
  saveStoredBrowserProfile, 
  addStoredUserBookingId,
  getOrCreateBrowserGuestId
} from '../utils/browserStorage';

export type AppUser = AtelierUser;

interface AtelierContextType {
  // Host Server Auth State
  authUser: AppUser | null;
  isUserAuthenticated: boolean;
  isAuthLoading: boolean;
  isClientAuthModalOpen: boolean;
  clientAuthMode: 'login' | 'register' | 'phone';
  openClientAuthModal: (mode?: 'login' | 'register' | 'phone') => void;
  closeClientAuthModal: () => void;
  signOutUser: () => Promise<void>;
  loginUser: (
    credentialsOrIdentifier: { identifier?: string; email?: string; phone?: string; password?: string } | string,
    password?: string
  ) => Promise<{ success: boolean; user?: AppUser; token?: string; error?: string }>;
  registerUser: (data: {
    phone?: string;
    email?: string;
    password?: string;
    displayName?: string;
    role?: 'admin' | 'client';
  }) => Promise<{ success: boolean; user?: AppUser; token?: string; error?: string }>;
  loginClientPhone: (phone: string, displayName?: string, avatarUrl?: string) => Promise<{ success: boolean; error?: string }>;
  loginClientCredentials: (identifier: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  registerClient: (data: { phone?: string; email?: string; password?: string; displayName?: string }) => Promise<{ success: boolean; error?: string }>;

  studio: Studio;
  chairs: Chair[];
  barbers: Barber[];
  activeChair: Chair;
  activeBarber: Barber;
  setActiveChair: (chair: Chair) => void;
  setActiveBarber: (barber: Barber) => void;
  updateBarber: (barberId: string, data: Partial<Barber>) => void;
  updateBarberAvailability: (
    barberId: string,
    workingDays: string[],
    workingHours: StudioOpeningHour[],
    isAvailableToday?: boolean
  ) => void;
  updateBarberPresetMessages: (barberId: string, presets: BarberPresetMessage[]) => void;
  addBarberPresetMessage: (barberId: string, preset: Omit<BarberPresetMessage, 'id'>) => ActionResult;
  deleteBarberPresetMessage: (barberId: string, presetId: string) => ActionResult;
  resetBarberPresetMessages: (barberId: string) => void;
  
  customers: ClientProfile[];
  currentCustomer: ClientProfile;
  setCurrentCustomer: (customer: ClientProfile) => void;
  selectedClientForDossier: ClientProfile | null;
  setSelectedClientForDossier: (client: ClientProfile | null) => void;
  
  services: Service[];
  categories: ServiceCategory[];
  activeServices: Service[];
  servicesByCategory: { category: ServiceCategory; items: Service[] }[];
  addCategory: (name: string) => ActionResult;
  updateCategory: (id: string, patch: Partial<ServiceCategory>) => ActionResult;
  deleteCategory: (id: string) => ActionResult;
  moveCategory: (categoryId: string, direction: 'up' | 'down') => void;
  reorderCategories: (orderedIds: string[]) => void;
  addService: (input: ServiceInput) => ActionResult;
  updateService: (id: string, patch: Partial<ServiceInput>) => ActionResult;
  deleteService: (id: string) => void;
  toggleServiceActive: (id: string) => void;
  moveService: (serviceId: string, direction: 'up' | 'down') => void;
  reorderServices: (categoryId: string, orderedIds: string[]) => void;
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  setCategories: React.Dispatch<React.SetStateAction<ServiceCategory[]>>;
  accoutrements: Accoutrement[];
  setAccoutrements: React.Dispatch<React.SetStateAction<Accoutrement[]>>;
  addAccoutrement: (input: AccoutrementInput) => ActionResult;
  updateAccoutrement: (id: string, patch: Partial<AccoutrementInput>) => ActionResult;
  deleteAccoutrement: (id: string) => ActionResult;
  toggleAccoutrementActive: (id: string) => void;
  moveAccoutrement: (id: string, direction: 'up' | 'down') => void;
  reorderAccoutrements: (orderedIds: string[]) => void;
  toggleAccoutrement: (id: string) => void;
  beverageOptions: BeverageOption[];
  setBeverageOptions: React.Dispatch<React.SetStateAction<BeverageOption[]>>;
  addBeverageOption: (item: Omit<BeverageOption, 'id'>) => { success: boolean; item?: BeverageOption };
  updateBeverageOption: (id: string, partial: Partial<BeverageOption>) => { success: boolean };
  deleteBeverageOption: (id: string) => { success: boolean };
  appointments: Appointment[];
  pastAppointments: Appointment[];
  currentReservation: Reservation;
  
  products: Product[];
  cart: Cart;
  orders: Order[];
  notifications: StudioNotification[];
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  toggleCartDrawer: () => void;
  
  // App Shell & Navigation
  portalMode: AppPortalMode;
  setPortalMode: (mode: AppPortalMode) => void;
  isManagementAuthenticated: boolean;
  isAuthModalOpen: boolean;
  openManagementAuth: () => void;
  closeManagementAuth: () => void;
  loginManagement: (username: string, password: string) => { success: boolean; error?: string };
  logoutManagement: () => void;
  managementTab: ManagementTab;
  setManagementTab: (tab: ManagementTab) => void;
  managementSubTab: ManagementSubTab;
  setManagementSubTab: (subTab: ManagementSubTab) => void;
  selectedAppointmentForDetails: Appointment | null;
  setSelectedAppointmentForDetails: (apt: Appointment | null) => void;

  // Phase 11 — Settings & Tariffs
  settings: StudioSettings;
  updateStudioSettings: (partial: Partial<StudioSettings>) => void;
  updateStudioProfile: (profile: Partial<StudioProfileSettings>) => void;
  updateAnnouncement: (announcement: Partial<AnnouncementSettings>) => void;
  updateOperatingHours: (hours: StudioOpeningHour[]) => void;
  updatePolicies: (policies: Partial<AppointmentPoliciesSettings>) => void;
  updateFinancialTarget: (period: AnalyticsPeriod, amount: number) => void;
  updateNotificationPreferences: (prefs: Partial<NotificationPreferencesSettings>) => void;
  updateCommerceSettings: (commerce: Partial<CommerceSettings>) => void;
  resetSettingsToDefault: () => void;
  updateServiceTariff: (serviceId: string, newPrice: number, effectiveDate?: string, isActive?: boolean) => { success: boolean; error?: string };
  
  // Actions
  setCurrentReservation: (res: Reservation) => void;
  addNewAppointment: (apt: Appointment) => void;
  updateAppointmentStatus: (aptId: string, status: AppointmentStatus) => void;
  startAppointment: (aptId: string) => { success: boolean; message?: string };
  completeAppointment: (aptId: string) => { success: boolean; message?: string };
  cancelAppointment: (aptId: string) => { success: boolean; message?: string };
  createWalkInAppointment: (data: {
    customerName: string;
    customerPhone: string;
    serviceId: string;
    price: number;
    notes?: string;
    startTime?: string;
  }) => { success: boolean; error?: string; appointment?: Appointment };
  createBlockBreak: (data: {
    startTime: string;
    durationMinutes: number;
    reason: string;
  }) => { success: boolean; error?: string; appointment?: Appointment };
  createQuickBooking: (data: {
    customerName: string;
    customerPhone: string;
    serviceId: string;
    price: number;
    startTime: string;
    durationMinutes: number;
    notes?: string;
    dayNumber?: number;
    date?: string;
  }) => { success: boolean; error?: string; appointment?: Appointment };
  rescheduleAppointment: (aptId: string, data: {
    dayNumber: number;
    date: string;
    startTime: string;
    durationMinutes?: number;
  }) => { success: boolean; error?: string; appointment?: Appointment };
  createOnlineBooking: (data: {
    serviceId: string;
    dayNumber: number;
    dateString?: string;
    startTime: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    beverageId?: string;
    isQuietSession?: boolean;
    customerNotes?: string;
    accoutrements?: Accoutrement[];
    tipRateOrAmount?: number | 'custom';
    customTip?: number;
  }) => { success: boolean; error?: string; appointment?: Appointment; reservation?: Reservation };
  updateCustomerFormulaNotes: (notes: string) => void;
  addToCart: (product: Product, quantity?: number) => { success: boolean; error?: string };
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => { success: boolean; error?: string };
  clearCart: () => void;
  placeOrder: (shippingAddress?: string, valetToChair?: boolean) => Order;
  checkoutOrder: (data: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    deliveryAddress: OrderDeliveryAddress | string;
    deliveryMethod: DeliveryMethodType;
    discountCode?: string;
    discountAmount?: number;
    shippingFee?: number;
    paymentMethod?: string;
  }) => { success: boolean; order?: Order; error?: string };
  markNotificationAsRead: (notifId: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotification: (notifId: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notif: Omit<StudioNotification, 'id'>) => void;
  liveAlertNotification: StudioNotification | null;
  dismissLiveAlertNotification: () => void;
  triggerTestNotification: (type?: string) => void;
  
  // Phase 4: Client Dossier & Directory Operations
  updateCustomer: (customerId: string, data: Partial<ClientProfile>) => void;
  createCustomer: (data: {
    name: string;
    phone: string;
    avatarUrl?: string;
    isVip?: boolean;
    email?: string;
    notes?: string;
    hairProfile?: any;
    faceProfile?: any;
    hospitality?: any;
    technicalNotes?: any;
  }) => { success: boolean; error?: string; customer?: ClientProfile };
  archiveCustomer: (customerId: string) => { success: boolean; message?: string };
  toggleProductRecommendation: (customerId: string, productId: string) => void;

  // Auto-Refresh & Database Sync State
  refreshDatabaseData: () => Promise<void>;
  lastRefreshTime: Date | null;
  isRefreshing: boolean;

  // Demand Logging & Analytics State
  demandInsights: DetailedDemandAnalytics;
  logHourDemand: (data: {
    dayNumber: number;
    requestedTime: string;
    serviceId?: string;
    serviceName?: string;
    customerName?: string;
    customerPhone?: string;
    wasReserved?: boolean;
    weekday?: string;
    dateLabel?: string;
  }) => void;
  logCustomerConstraint: (data: Omit<CustomerConstraintRecord, 'id' | 'updatedAt'>) => void;
}

const AtelierContext = createContext<AtelierContextType | undefined>(undefined);

export const AtelierProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [chairs, setChairs] = useState<Chair[]>(CHAIRS_DATA);
  const [barbers, setBarbers] = useState<Barber[]>(() => {
    try {
      const saved = localStorage.getItem('atelier_barbers_v2');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading barbers from localStorage', e);
    }
    return BARBERS_DATA;
  });
  const [activeChair, setActiveChair] = useState<Chair>(CHAIRS_DATA[0]);
  const [activeBarber, setActiveBarber] = useState<Barber>(() => {
    return barbers[0] || BARBERS_DATA[0];
  });

  useEffect(() => {
    try {
      localStorage.setItem('atelier_barbers_v2', JSON.stringify(barbers));
    } catch (e) {
      console.error('Error saving barbers to localStorage', e);
    }
  }, [barbers]);

  const updateBarber = (barberId: string, data: Partial<Barber>) => {
    setBarbers((prev) =>
      prev.map((b) => (b.id === barberId ? { ...b, ...data } : b))
    );
    setActiveBarber((prev) => (prev.id === barberId ? { ...prev, ...data } : prev));
  };

  const updateBarberAvailability = (
    barberId: string,
    workingDays: string[],
    workingHours: StudioOpeningHour[],
    isAvailableToday?: boolean
  ) => {
    const patch: Partial<Barber> = {
      workingDays,
      workingHours,
    };
    if (typeof isAvailableToday === 'boolean') {
      patch.isAvailableToday = isAvailableToday;
    }
    updateBarber(barberId, patch);

    // Also synchronize studio operating hours
    updateOperatingHours(workingHours);
  };

  const updateBarberPresetMessages = (barberId: string, presets: BarberPresetMessage[]) => {
    updateBarber(barberId, { presetMessages: presets });
  };

  const addBarberPresetMessage = (barberId: string, preset: Omit<BarberPresetMessage, 'id'>): ActionResult => {
    if (!preset.title.trim()) {
      return { success: false, error: 'عنوان پیام الزامی است' };
    }
    if (!preset.text.trim()) {
      return { success: false, error: 'متن پیام الزامی است' };
    }
    const newPreset: BarberPresetMessage = {
      id: `preset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: preset.title.trim(),
      text: preset.text.trim(),
      isDefault: false,
    };
    const targetBarber = barbers.find((b) => b.id === barberId);
    const existing = targetBarber?.presetMessages || DEFAULT_BARBER_PRESET_MESSAGES;
    const updated = [...existing, newPreset];
    updateBarberPresetMessages(barberId, updated);
    return { success: true, message: 'پیام آماده با موفقیت افزوده شد' };
  };

  const deleteBarberPresetMessage = (barberId: string, presetId: string): ActionResult => {
    const targetBarber = barbers.find((b) => b.id === barberId);
    const existing = targetBarber?.presetMessages || DEFAULT_BARBER_PRESET_MESSAGES;
    const updated = existing.filter((p) => p.id !== presetId);
    updateBarberPresetMessages(barberId, updated);
    return { success: true, message: 'پیام آماده حذف شد' };
  };

  const resetBarberPresetMessages = (barberId: string) => {
    updateBarberPresetMessages(barberId, DEFAULT_BARBER_PRESET_MESSAGES);
  };

  // Demand tracking & insights reactive state
  const [demandUpdateSeq, setDemandUpdateSeq] = useState<number>(0);
  const demandInsights = useMemo(() => {
    return getDetailedDemandAnalytics();
  }, [demandUpdateSeq]);

  const logHourDemand = (data: {
    dayNumber: number;
    requestedTime: string;
    serviceId?: string;
    serviceName?: string;
    customerName?: string;
    customerPhone?: string;
    wasReserved?: boolean;
    weekday?: string;
    dateLabel?: string;
  }) => {
    recordTimeDemand(data.dayNumber, data.requestedTime, data.serviceId, data);
    setDemandUpdateSeq((prev) => prev + 1);
  };

  const logCustomerConstraint = (data: Omit<CustomerConstraintRecord, 'id' | 'updatedAt'>) => {
    recordCustomerAvailabilityConstraint(data);
    setDemandUpdateSeq((prev) => prev + 1);
  };

  const [customers, setCustomers] = useState<ClientProfile[]>(() => {
    try {
      const saved = localStorage.getItem('atelier_customers_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading customers from localStorage', e);
    }
    return CUSTOMERS_DATA;
  });

  // Host Server Auth Reactive State
  const [authUser, setAuthUser] = useState<AppUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isClientAuthModalOpen, setIsClientAuthModalOpen] = useState<boolean>(false);
  const [clientAuthMode, setClientAuthMode] = useState<'login' | 'register' | 'phone'>('phone');

  const openClientAuthModal = (mode: 'login' | 'register' | 'phone' = 'phone') => {
    setClientAuthMode(mode);
    setIsClientAuthModalOpen(true);
  };

  const closeClientAuthModal = () => {
    setIsClientAuthModalOpen(false);
  };

  const loginUser = async (
    credentialsOrIdentifier: { identifier?: string; email?: string; phone?: string; password?: string } | string,
    password?: string
  ) => {
    try {
      const res = await apiLoginUser(credentialsOrIdentifier, password);
      if (res.success && res.user) {
        setAuthUser(res.user);
        if (res.customer) {
          setCurrentCustomer(res.customer);
          saveStoredBrowserProfile(res.customer);
        }
        return { success: true, user: res.user, token: res.token };
      }
      return { success: false, error: res.error || 'اطلاعات کاربری اشتباه است' };
    } catch (e: any) {
      return { success: false, error: e.message || 'خطا در ارتباط با سرور' };
    }
  };

  const registerUser = async (data: {
    phone?: string;
    email?: string;
    password?: string;
    displayName?: string;
    role?: 'admin' | 'client';
  }) => {
    try {
      const res = await apiRegisterUser(data);
      if (res.success && res.user) {
        setAuthUser(res.user);
        if (res.customer) {
          setCurrentCustomer(res.customer);
          saveStoredBrowserProfile(res.customer);
        }
        return { success: true, user: res.user, token: res.token };
      }
      return { success: false, error: res.error || 'خطا در ایجاد حساب کاربری' };
    } catch (e: any) {
      return { success: false, error: e.message || 'خطا در ثبت‌نام' };
    }
  };

  const loginClientPhone = async (phone: string, displayName?: string, avatarUrl?: string) => {
    try {
      const res = await quickPhoneLogin({ phone, displayName, avatarUrl });
      if (res.success && res.user) {
        setAuthUser(res.user);
        if (res.customer) {
          setCurrentCustomer(res.customer);
          saveStoredBrowserProfile(res.customer);
        }
        return { success: true };
      }
      return { success: false, error: res.error || 'خطا در ورود به حساب' };
    } catch (e: any) {
      return { success: false, error: e.message || 'خطا در ارتباط با سرور' };
    }
  };

  const loginClientCredentials = async (identifier: string, password?: string) => {
    return loginUser(identifier, password);
  };

  const registerClient = async (data: { phone?: string; email?: string; password?: string; displayName?: string }) => {
    return registerUser(data);
  };

  const signOutUser = async () => {
    try {
      clearStoredSessionToken();
      setAuthUser(null);
      // Retain the user's browser-saved profile as guest so their reservations and info are not destroyed
      setCurrentCustomer((prev) => {
        const fallbackGuestId = getOrCreateBrowserGuestId();
        const guestProfile: ClientProfile = {
          ...prev,
          id: prev.id && (prev.id.startsWith('client-') || prev.id.startsWith('guest_')) ? prev.id : fallbackGuestId,
          email: '',
          memberTier: 'مهمان',
          roleOrTitle: 'کاربر مهمان (حافظه مرورگر)',
        };
        saveStoredBrowserProfile(guestProfile);
        return guestProfile;
      });
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  const [currentCustomer, setCurrentCustomer] = useState<ClientProfile>(() => {
    return loadStoredBrowserProfile();
  });

  // Verify and hydrate current session user from host server
  useEffect(() => {
    let isMounted = true;
    async function checkSession() {
      try {
        const sessionRes = await fetchCurrentSessionUser();
        if (!isMounted) return;
        if (sessionRes.success && sessionRes.user) {
          setAuthUser(sessionRes.user);
          if (sessionRes.customer) {
            setCurrentCustomer(sessionRes.customer);
            saveStoredBrowserProfile(sessionRes.customer);
          }
        }
      } catch (e) {
        console.warn('Session check fallback:', e);
      } finally {
        if (isMounted) setIsAuthLoading(false);
      }
    }
    checkSession();
    return () => { isMounted = false; };
  }, []);

  const [selectedClientForDossier, setSelectedClientForDossier] = useState<ClientProfile | null>(null);

  const {
    categories,
    services,
    activeServices,
    servicesByCategory,
    addCategory,
    updateCategory,
    deleteCategory,
    moveCategory,
    reorderCategories,
    addService,
    updateService,
    deleteService,
    toggleServiceActive,
    moveService,
    reorderServices,
    setServices,
    setCategories,
  } = useServiceCatalog();

  const [settings, setSettings] = useState<StudioSettings>(() => {
    try {
      const saved = localStorage.getItem('atelier_studio_settings_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.profile?.neighborhood && /سوهو|soho/i.test(parsed.profile.neighborhood)) {
          parsed.profile.neighborhood = '';
        }
        if (parsed.profile?.city && /نیویورک|new york/i.test(parsed.profile.city)) {
          parsed.profile.city = 'تهران';
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error loading studio settings from localStorage', e);
    }
    return DEFAULT_STUDIO_SETTINGS;
  });

  // Save studio settings changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('atelier_studio_settings_v1', JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving studio settings to localStorage', e);
    }
  }, [settings]);

  // Dynamically compute studio info from settings.profile (set by admin)
  const studio = useMemo<Studio>(() => {
    const rawNeighborhood = settings.profile?.neighborhood !== undefined 
      ? settings.profile.neighborhood 
      : '';
    const cleanNeighborhood = (rawNeighborhood || '').replace(/سوهو|\(SoHo\)|SoHo|soho/gi, '').trim();

    return {
      ...STUDIO_DATA,
      name: settings.profile?.name || STUDIO_DATA.name,
      tagline: settings.profile?.tagline || STUDIO_DATA.tagline,
      phone: settings.profile?.phone || STUDIO_DATA.phone,
      conciergePhone: settings.profile?.conciergePhone || STUDIO_DATA.conciergePhone,
      address: settings.profile?.address || STUDIO_DATA.address,
      neighborhood: cleanNeighborhood,
      city: settings.profile?.city || STUDIO_DATA.city,
      email: settings.profile?.email || STUDIO_DATA.email,
    };
  }, [settings.profile]);

  const [accoutrements, setAccoutrements] = useState<Accoutrement[]>(() => {
    try {
      const saved = localStorage.getItem('atelier_accoutrements_v2');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading accoutrements from localStorage', e);
    }
    return ACCOUTREMENTS_DATA;
  });

  // Save accoutrements changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('atelier_accoutrements_v2', JSON.stringify(accoutrements));
    } catch (e) {
      console.error('Error saving accoutrements to localStorage', e);
    }
  }, [accoutrements]);
  const [beverageOptions, setBeverageOptions] = useState<BeverageOption[]>(() => {
    try {
      const saved = localStorage.getItem('atelier_beverage_options_v2');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading beverage options from localStorage', e);
    }
    return BEVERAGE_OPTIONS;
  });

  // Save beverage options changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('atelier_beverage_options_v2', JSON.stringify(beverageOptions));
    } catch (e) {
      console.error('Error saving beverage options to localStorage', e);
    }
  }, [beverageOptions]);

  // Save customers changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('atelier_customers_v1', JSON.stringify(customers));
    } catch (e) {
      console.error('Error saving customers to localStorage', e);
    }
  }, [customers]);

  // Save currentCustomer changes to localStorage and browser profile storage
  useEffect(() => {
    try {
      saveStoredBrowserProfile(currentCustomer);
    } catch (e) {
      console.error('Error saving current customer to localStorage', e);
    }
  }, [currentCustomer]);
  
  // Appointments state with localStorage persistence
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem('atelier_appointments_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading appointments from localStorage', e);
    }
    return TODAY_APPOINTMENTS_DATA;
  });

  const [pastAppointments, setPastAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem('atelier_past_appointments_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading past appointments from localStorage', e);
    }
    return PAST_APPOINTMENTS_DATA;
  });

  useEffect(() => {
    try {
      localStorage.setItem('atelier_appointments_v1', JSON.stringify(appointments));
    } catch (e) {
      console.error('Error saving appointments to localStorage', e);
    }
  }, [appointments]);

  useEffect(() => {
    try {
      localStorage.setItem('atelier_past_appointments_v1', JSON.stringify(pastAppointments));
    } catch (e) {
      console.error('Error saving past appointments to localStorage', e);
    }
  }, [pastAppointments]);

  const [currentReservation, setCurrentReservation] = useState<Reservation>(INITIAL_RESERVATION);

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('atelier_boutique_products_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading boutique products from localStorage', e);
    }
    return PRODUCTS_DATA;
  });

  const [cartsByCustomer, setCartsByCustomer] = useState<Record<string, Cart>>(() => {
    try {
      const saved = localStorage.getItem('atelier_boutique_carts_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading boutique carts from localStorage', e);
    }
    return {};
  });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('atelier_boutique_orders_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading boutique orders from localStorage', e);
    }
    return ORDERS_DATA;
  });
  const [notifications, setNotifications] = useState<StudioNotification[]>(() => {
    try {
      const saved = localStorage.getItem('atelier_notifications_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading notifications from localStorage', e);
    }
    return NOTIFICATIONS_DATA;
  });
  const [liveAlertNotification, setLiveAlertNotification] = useState<StudioNotification | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('atelier_notifications_v1', JSON.stringify(notifications));
    } catch (e) {
      console.error('Error saving notifications to localStorage', e);
    }
  }, [notifications]);

  // Sync services to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('atelier_services_v1', JSON.stringify(services));
    } catch (e) {
      console.error('Error saving services to localStorage', e);
    }
  }, [services]);

  // Sync settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('atelier_studio_settings_v1', JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving studio settings to localStorage', e);
    }
  }, [settings]);

  // Sync products to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('atelier_boutique_products_v1', JSON.stringify(products));
    } catch (e) {
      console.error('Error saving boutique products to localStorage', e);
    }
  }, [products]);

  // Sync orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('atelier_boutique_orders_v1', JSON.stringify(orders));
    } catch (e) {
      console.error('Error saving boutique orders to localStorage', e);
    }
  }, [orders]);

  // Sync carts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('atelier_boutique_carts_v1', JSON.stringify(cartsByCustomer));
    } catch (e) {
      console.error('Error saving boutique carts to localStorage', e);
    }
  }, [cartsByCustomer]);

  // ─── Real Server Storage Database Synchronization ─────────────────────────
  useEffect(() => {
    let isMounted = true;

    async function initServerSync() {
      const serverData = await fetchServerStore();
      if (!isMounted) return;

      if (serverData) {
        if (serverData.appointments && Array.isArray(serverData.appointments)) {
          // Authoritative server appointments (empty or populated)
          setAppointments(serverData.appointments);
          try {
            localStorage.setItem('atelier_appointments_v1', JSON.stringify(serverData.appointments));
          } catch {}
        }
        if (serverData.customers && Array.isArray(serverData.customers) && serverData.customers.length > 0) setCustomers(serverData.customers);
        if (serverData.pastAppointments && Array.isArray(serverData.pastAppointments)) setPastAppointments(serverData.pastAppointments);
        if (serverData.orders && Array.isArray(serverData.orders)) setOrders(serverData.orders);
        if (serverData.notifications && Array.isArray(serverData.notifications)) setNotifications(serverData.notifications);
        if (serverData.barbers && Array.isArray(serverData.barbers) && serverData.barbers.length > 0) setBarbers(serverData.barbers);
        if (serverData.chairs && Array.isArray(serverData.chairs) && serverData.chairs.length > 0) setChairs(serverData.chairs);
        if (serverData.accoutrements && Array.isArray(serverData.accoutrements) && serverData.accoutrements.length > 0) setAccoutrements(serverData.accoutrements);
        if (serverData.beverageOptions && Array.isArray(serverData.beverageOptions) && serverData.beverageOptions.length > 0) setBeverageOptions(serverData.beverageOptions);
        if (serverData.services && Array.isArray(serverData.services) && serverData.services.length > 0) setServices(serverData.services);
        if (serverData.categories && Array.isArray(serverData.categories) && serverData.categories.length > 0) setCategories(serverData.categories);
        if (serverData.settings && typeof serverData.settings === 'object' && Object.keys(serverData.settings).length > 0) setSettings(serverData.settings);
      } else {
        // Initialize persistent disk store on server
        saveServerStore({
          studio,
          appointments,
          pastAppointments,
          customers,
          services,
          categories,
          chairs,
          barbers,
          products,
          orders,
          notifications,
          accoutrements,
          beverageOptions,
          settings,
        });
      }
    }

    initServerSync();

    // High-performance live multi-device polling: every 2 seconds
    // Guarantees barber's phone updates within 2 seconds when client books on their phone
    const interval = setInterval(async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      
      try {
        const remote = await fetchServerStore();
        if (!isMounted || !remote) return;

        if (remote.appointments && Array.isArray(remote.appointments)) {
          setAppointments((prev) => {
            const currentSignature = prev.map((a) => `${a.id}:${a.status}:${a.date}:${a.startTime}`).join('|');
            const remoteSignature = remote.appointments.map((a) => `${a.id}:${a.status}:${a.date}:${a.startTime}`).join('|');
            if (currentSignature !== remoteSignature) {
              try {
                localStorage.setItem('atelier_appointments_v1', JSON.stringify(remote.appointments));
              } catch {}
              return remote.appointments;
            }
            return prev;
          });
        }
        if (remote.customers && Array.isArray(remote.customers)) {
          setCustomers((prev) => {
            if (prev.length !== remote.customers.length) {
              return remote.customers;
            }
            return prev;
          });
        }
        if (remote.orders && Array.isArray(remote.orders)) {
          setOrders((prev) => {
            if (prev.length !== remote.orders.length) {
              return remote.orders;
            }
            return prev;
          });
        }
        if (remote.services && Array.isArray(remote.services) && remote.services.length > 0) {
          setServices((prev) => {
            if (prev.length !== remote.services.length) {
              return remote.services;
            }
            return prev;
          });
        }
        if (remote.categories && Array.isArray(remote.categories) && remote.categories.length > 0) {
          setCategories((prev) => {
            if (prev.length !== remote.categories.length) {
              return remote.categories;
            }
            return prev;
          });
        }
        if (remote.settings && typeof remote.settings === 'object') {
          setSettings((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(remote.settings)) {
              return remote.settings;
            }
            return prev;
          });
        }
      } catch {
        // Silently skip if network blip occurs during background poll
      }
    }, 2000);

    // Also re-sync immediately on window focus
    const handleWindowFocus = () => {
      fetchServerStore().then((remote) => {
        if (!isMounted || !remote) return;
        if (remote.appointments && Array.isArray(remote.appointments)) {
          setAppointments(remote.appointments);
        }
      }).catch(() => {});
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleWindowFocus);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleWindowFocus);
    };
  }, []);

  // ─── Explicit 5-Minute Auto-Refresh Mechanism ──────────────────────────
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(() => new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const refreshDatabaseData = async () => {
    setIsRefreshing(true);
    try {
      const remote = await fetchServerStore();
      if (remote) {
        if (remote.appointments && Array.isArray(remote.appointments)) {
          setAppointments(remote.appointments);
        }
        if (remote.customers && Array.isArray(remote.customers)) {
          setCustomers(remote.customers);
        }
        if (remote.pastAppointments && Array.isArray(remote.pastAppointments)) {
          setPastAppointments(remote.pastAppointments);
        }
        if (remote.orders && Array.isArray(remote.orders)) {
          setOrders(remote.orders);
        }
        if (remote.notifications && Array.isArray(remote.notifications)) {
          setNotifications(remote.notifications);
        }
        if (remote.barbers && Array.isArray(remote.barbers)) {
          setBarbers(remote.barbers);
        }
      }
      setLastRefreshTime(new Date());
    } catch (e) {
      console.error('Error auto-refreshing database data:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const FIVE_MINUTES_MS = 5 * 60 * 1000;
    const intervalId = setInterval(() => {
      refreshDatabaseData();
    }, FIVE_MINUTES_MS);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshDatabaseData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Derive cart for current active customer
  const cart = useMemo<Cart>(() => {
    const customerId = currentCustomer?.id || 'guest';
    if (cartsByCustomer[customerId]) {
      return cartsByCustomer[customerId];
    }
    return {
      customerId,
      items: [],
      subtotal: 0,
      discount: 0,
      shippingFee: 0,
      total: 0,
    };
  }, [cartsByCustomer, currentCustomer?.id]);

  const toggleCartDrawer = () => {
    setIsCartDrawerOpen((prev) => !prev);
  };

  // Shell & Auth State
  const [isManagementAuthenticated, setIsManagementAuthenticated] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem('royal_mgmt_authenticated') === 'true' ||
        sessionStorage.getItem('royal_mgmt_authenticated') === 'true'
      );
    } catch {
      return false;
    }
  });

  const [portalMode, setPortalModeState] = useState<AppPortalMode>(() => {
    try {
      const savedMode = localStorage.getItem('royal_portal_mode') as AppPortalMode | null;
      const isAuth =
        localStorage.getItem('royal_mgmt_authenticated') === 'true' ||
        sessionStorage.getItem('royal_mgmt_authenticated') === 'true';
      if (savedMode === 'management' && isAuth) {
        return 'management';
      }
      return 'client';
    } catch {
      return 'client';
    }
  });

  const setPortalMode = (mode: AppPortalMode) => {
    setPortalModeState(mode);
    try {
      localStorage.setItem('royal_portal_mode', mode);
    } catch (e) {
      console.error(e);
    }
  };

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const openManagementAuth = () => {
    if (isManagementAuthenticated) {
      setPortalMode('management');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const closeManagementAuth = () => {
    setIsAuthModalOpen(false);
  };

  const loginManagement = (user: string, pass: string): { success: boolean; error?: string } => {
    const cleanUser = user.trim().toLowerCase();
    // Normalize Persian numerals to English numerals in password if present
    const cleanPass = pass
      .trim()
      .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1728));

    if (cleanUser === 'barber' && cleanPass === '12345678') {
      setIsManagementAuthenticated(true);
      try {
        localStorage.setItem('royal_mgmt_authenticated', 'true');
        localStorage.setItem('royal_portal_mode', 'management');
        sessionStorage.setItem('royal_mgmt_authenticated', 'true');
      } catch (e) {
        console.error(e);
      }
      setIsAuthModalOpen(false);
      setPortalMode('management');
      return { success: true };
    }

    return {
      success: false,
      error: 'نام کاربری یا رمز عبور اشتباه است.',
    };
  };

  const logoutManagement = () => {
    setIsManagementAuthenticated(false);
    try {
      localStorage.removeItem('royal_mgmt_authenticated');
      localStorage.setItem('royal_portal_mode', 'client');
      sessionStorage.removeItem('royal_mgmt_authenticated');
    } catch (e) {
      console.error(e);
    }
    setPortalMode('client');
  };

  const [managementTab, setManagementTab] = useState<ManagementTab>('today');
  const [managementSubTab, setManagementSubTab] = useState<ManagementSubTab>('overview');
  const [selectedAppointmentForDetails, setSelectedAppointmentForDetails] = useState<Appointment | null>(null);

  // Phase 11 — Settings & Tariffs Handlers
  const updateStudioSettings = (partial: Partial<StudioSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...partial,
    }));
  };

  const updateStudioProfile = (profile: Partial<StudioProfileSettings>) => {
    setSettings((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...profile,
      },
    }));

    // When barber / master name or title changes, sync across barbers, activeBarber, and chairs
    if (profile.masterName !== undefined && profile.masterName.trim() !== '') {
      const newName = profile.masterName.trim();
      const newTitle = profile.masterTitle ? profile.masterTitle.trim() : undefined;

      setBarbers((prev) =>
        prev.map((b, idx) => {
          if (idx === 0 || b.id === activeBarber.id) {
            return {
              ...b,
              name: newName,
              ...(newTitle ? { title: newTitle } : {}),
            };
          }
          return b;
        })
      );

      setActiveBarber((prev) => ({
        ...prev,
        name: newName,
        ...(newTitle ? { title: newTitle } : {}),
      }));

      setChairs((prev) =>
        prev.map((c) => ({
          ...c,
          assignedBarberName: newName,
        }))
      );

      setActiveChair((prev) => ({
        ...prev,
        assignedBarberName: newName,
      }));
    }
  };

  const updateAnnouncement = (announcement: Partial<AnnouncementSettings>) => {
    setSettings((prev) => ({
      ...prev,
      announcement: {
        ...(prev.announcement || { headline: '', body: '', tag: 'اطلاعیه سالن', isActive: false }),
        ...announcement,
      },
    }));
  };

  const updateOperatingHours = (operatingHours: StudioOpeningHour[]) => {
    setSettings((prev) => ({
      ...prev,
      operatingHours,
    }));
  };

  const updatePolicies = (policies: Partial<AppointmentPoliciesSettings>) => {
    setSettings((prev) => ({
      ...prev,
      policies: {
        ...prev.policies,
        ...policies,
      },
    }));
  };

  const updateFinancialTarget = (period: AnalyticsPeriod, amount: number) => {
    setSettings((prev) => ({
      ...prev,
      financialTargets: {
        ...prev.financialTargets,
        [period]: Math.max(0, amount),
      },
    }));
  };

  const updateNotificationPreferences = (prefs: Partial<NotificationPreferencesSettings>) => {
    setSettings((prev) => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        ...prefs,
      },
    }));
  };

  const updateCommerceSettings = (commerce: Partial<CommerceSettings>) => {
    setSettings((prev) => ({
      ...prev,
      commerce: {
        ...prev.commerce,
        ...commerce,
      },
    }));
  };

  const resetSettingsToDefault = () => {
    setSettings(DEFAULT_STUDIO_SETTINGS);
  };

  // Update Service Tariff with snapshot preservation for historical data integrity
  const updateServiceTariff = (
    serviceId: string, 
    newPrice: number, 
    effectiveDate?: string, 
    isActive?: boolean
  ): { success: boolean; error?: string } => {
    const targetService = services.find((s) => s.id === serviceId);
    if (!targetService) {
      return { success: false, error: 'آیین پیرایش مورد نظر یافت نشد.' };
    }
    if (newPrice < 0 || isNaN(newPrice)) {
      return { success: false, error: 'تعرفه خدمت نامعتبر است.' };
    }

    const todayDate = effectiveDate || getCurrentSolarDateInfo().dateString;
    const historyEntry: PriceHistoryEntry = {
      price: targetService.price,
      effectiveDate: todayDate,
      changedAt: new Date().toISOString(),
      note: `تغییر تعرفه از $${targetService.price} به $${newPrice}`,
    };

    setServices((prev) =>
      prev.map((s) => {
        if (s.id !== serviceId) return s;
        const currentHistory = s.priceHistory || [];
        return {
          ...s,
          price: newPrice,
          isActive: isActive !== undefined ? isActive : s.isActive !== undefined ? s.isActive : true,
          priceHistory: [historyEntry, ...currentHistory],
        };
      })
    );

    // Add broadcast notification
    addNotification({
      type: 'studio_broadcast',
      title: 'بروزرسانی تعرفه آیین پیرایش',
      message: `تعرفه «${targetService.name}» به $${newPrice} بروزرسانی گردید.`,
      timestamp: 'هم‌اکنون',
      isRead: false,
      priority: 'low',
      entityType: 'appointment',
    });

    return { success: true };
  };

  // Toggle Accoutrement Selection
  const toggleAccoutrement = (id: string) => {
    setAccoutrements((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, selected: !acc.selected } : acc))
    );
  };

  // Accoutrements (Additional Services) CRUD Management Handlers
  const addAccoutrement = (input: AccoutrementInput): ActionResult => {
    if (!input.name || !input.name.trim()) {
      return { success: false, message: 'نام خدمت مکمل نمی‌تواند خالی باشد.' };
    }
    const newId = `acc-${Date.now()}`;
    const newAcc: Accoutrement = {
      id: newId,
      name: input.name.trim(),
      price: input.isComplimentary ? 0 : Math.max(0, input.price || 0),
      durationMinutes: Math.max(0, input.durationMinutes || 0),
      description: input.description?.trim() || '',
      isComplimentary: Boolean(input.isComplimentary),
      isActive: input.isActive !== undefined ? Boolean(input.isActive) : true,
      tag: input.tag?.trim() || '',
      sortOrder: accoutrements.length,
      selected: false,
    };
    setAccoutrements((prev) => [...prev, newAcc]);
    addNotification({
      type: 'studio_broadcast',
      title: 'افزودن خدمت مکمل جدید',
      message: `خدمت مکمل «${newAcc.name}» به کاتالوگ افزوده شد.`,
      timestamp: 'هم‌اکنون',
      isRead: false,
      priority: 'low',
    });
    return { success: true, message: 'خدمت مکمل با موفقیت افزوده شد.' };
  };

  const updateAccoutrement = (id: string, patch: Partial<AccoutrementInput>): ActionResult => {
    let found = false;
    setAccoutrements((prev) =>
      prev.map((acc) => {
        if (acc.id === id) {
          found = true;
          const isComp = patch.isComplimentary !== undefined ? Boolean(patch.isComplimentary) : acc.isComplimentary;
          return {
            ...acc,
            ...patch,
            name: patch.name !== undefined ? patch.name.trim() : acc.name,
            price: isComp ? 0 : patch.price !== undefined ? Math.max(0, patch.price) : acc.price,
            durationMinutes: patch.durationMinutes !== undefined ? Math.max(0, patch.durationMinutes) : acc.durationMinutes,
            description: patch.description !== undefined ? patch.description.trim() : acc.description,
            isComplimentary: isComp,
            isActive: patch.isActive !== undefined ? Boolean(patch.isActive) : acc.isActive !== undefined ? acc.isActive : true,
            tag: patch.tag !== undefined ? patch.tag.trim() : (acc.tag || ''),
          };
        }
        return acc;
      })
    );

    if (!found) {
      return { success: false, message: 'خدمت مکمل مورد نظر یافت نشد.' };
    }

    return { success: true, message: 'تغییرات با موفقیت ذخیره شد.' };
  };

  const toggleAccoutrementActive = (id: string) => {
    setAccoutrements((prev) =>
      prev.map((acc) =>
        acc.id === id
          ? { ...acc, isActive: acc.isActive !== undefined ? !acc.isActive : false }
          : acc
      )
    );
  };

  const deleteAccoutrement = (id: string): ActionResult => {
    const target = accoutrements.find((a) => a.id === id);
    if (!target) {
      return { success: false, message: 'خدمت مکمل یافت نشد.' };
    }
    setAccoutrements((prev) => prev.filter((a) => a.id !== id));
    addNotification({
      type: 'studio_broadcast',
      title: 'حذف خدمت مکمل',
      message: `خدمت مکمل «${target.name}» حذف گردید.`,
      timestamp: 'هم‌اکنون',
      isRead: false,
      priority: 'low',
    });
    return { success: true, message: 'خدمت مکمل حذف شد.' };
  };

  const moveAccoutrement = (id: string, direction: 'up' | 'down') => {
    setAccoutrements((prev) => {
      const index = prev.findIndex((a) => a.id === id);
      if (index === -1) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });
  };

  const reorderAccoutrements = (orderedIds: string[]) => {
    setAccoutrements((prev) => {
      const map = new Map(prev.map((a) => [a.id, a]));
      const reordered: Accoutrement[] = [];
      for (const id of orderedIds) {
        const item = map.get(id);
        if (item) {
          reordered.push(item);
          map.delete(id);
        }
      }
      for (const remaining of map.values()) {
        reordered.push(remaining);
      }
      return reordered;
    });
  };

  // Hospitality / Beverage Management Handlers
  const addBeverageOption = (item: Omit<BeverageOption, 'id'>) => {
    const newItem: BeverageOption = {
      ...item,
      id: `bev-${Date.now()}`,
      isAvailable: item.isAvailable ?? true,
    };
    setBeverageOptions((prev) => [...prev, newItem]);
    addNotification({
      type: 'studio_broadcast',
      title: 'افزودن آیتم پذیرایی جدید',
      message: `آیتم پذیرایی «${newItem.name}» با موفقیت به منوی سالن اضافه شد.`,
      timestamp: 'هم‌اکنون',
      isRead: false,
      priority: 'low',
    });
    return { success: true, item: newItem };
  };

  const updateBeverageOption = (id: string, partial: Partial<BeverageOption>) => {
    setBeverageOptions((prev) =>
      prev.map((bev) => (bev.id === id ? { ...bev, ...partial } : bev))
    );
    return { success: true };
  };

  const deleteBeverageOption = (id: string) => {
    setBeverageOptions((prev) => prev.filter((bev) => bev.id !== id));
    return { success: true };
  };

  // Add a newly confirmed appointment
  const addNewAppointment = (apt: Appointment) => {
    setAppointments((prev) => [apt, ...prev]);
    const asReservation: Reservation = {
      ...apt,
      reservationNumber: apt.appointmentNumber || apt.id,
      artisan: apt.barberName || activeBarber.name,
      suite: apt.chairName || activeChair.name,
      location: studio.address ? `${studio.name} · ${studio.address}` : studio.name,
      selectedDate: apt.date,
      selectedTime: apt.startTime,
    };
    setCurrentReservation(asReservation);

    // Create Notification
    addNotification({
      type: 'appointment_new',
      title: `نوبت جدید: ${apt.service?.name || 'سرویس'}`,
      message: `نوبت در ${apt.chairName || 'سوئیت'} برای ساعت ${apt.startTime} ثبت گردید.`,
      timestamp: 'هم‌اکنون',
      isRead: false,
      priority: 'high',
      entityType: 'appointment',
      entityId: apt.id,
    });

    // Persist to host server
    createServerAppointment(apt).catch(() => {});
  };

  // Update appointment status
  const updateAppointmentStatus = (aptId: string, status: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === aptId ? { ...apt, status } : apt))
    );
    if (currentReservation.id === aptId) {
      setCurrentReservation((prev) => ({ ...prev, status }));
    }
    updateServerAppointmentStatus(aptId, status).catch(() => {});
  };

  // 1. Start Appointment Action
  const startAppointment = (aptId: string) => {
    const apt = appointments.find((a) => a.id === aptId);
    if (!apt) {
      return { success: false, message: 'نوبت مورد نظر یافت نشد.' };
    }
    if (apt.status === 'cancelled') {
      return { success: false, message: 'نوبت لغو شده قابل شروع نمی‌باشد.' };
    }

    setAppointments((prev) =>
      prev.map((item) => {
        if (item.id === aptId) {
          return {
            ...item,
            status: 'in_progress',
            startTime: item.startTime, // keep or use actual
            bookingTimestamp: `شروع در ${new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`,
          };
        }
        return item;
      })
    );
    updateServerAppointmentStatus(aptId, 'in_progress');

    addNotification({
      type: 'appointment_new',
      title: `آغاز سرویس: ${apt.customerName}`,
      message: `سرویس ${apt.service?.name} برای مشتری آغاز شد.`,
      timestamp: 'هم‌اکنون',
      isRead: false,
      priority: 'medium',
      entityType: 'appointment',
      entityId: apt.id,
    });

    return { success: true };
  };

  // 2. Complete Appointment Action
  const completeAppointment = (aptId: string) => {
    const apt = appointments.find((a) => a.id === aptId);
    if (!apt) {
      return { success: false, message: 'نوبت یافت نشد.' };
    }
    if (apt.status !== 'in_progress') {
      return { success: false, message: 'تنها نوبت‌های در حال انجام قابل تکمیل هستند.' };
    }

    setAppointments((prev) =>
      prev.map((item) => (item.id === aptId ? { ...item, status: 'completed' } : item))
    );
    updateServerAppointmentStatus(aptId, 'completed');

    addNotification({
      type: 'appointment_new',
      title: `پایان موفقیت‌آمیز سرویس: ${apt.customerName}`,
      message: `سرویس با موفقیت ثبت نهایی گردید. مجموع: ${apt.totalAmount} تومان`,
      timestamp: 'هم‌اکنون',
      isRead: false,
      priority: 'low',
      entityType: 'appointment',
      entityId: apt.id,
    });

    return { success: true };
  };

  // 3. Cancel Appointment Action
  const cancelAppointment = (aptId: string) => {
    const apt = appointments.find((a) => a.id === aptId);
    if (!apt) {
      return { success: false, message: 'نوبت یافت نشد.' };
    }

    setAppointments((prev) =>
      prev.map((item) => (item.id === aptId ? { ...item, status: 'cancelled' } : item))
    );
    updateServerAppointmentStatus(aptId, 'cancelled').catch(() => {});

    setCurrentReservation((prev) => {
      if (prev.id === aptId || prev.appointmentNumber === apt.appointmentNumber) {
        return { ...prev, status: 'cancelled' };
      }
      return prev;
    });

    addNotification({
      type: 'appointment_cancelled',
      title: `لغو نوبت: ${apt.customerName}`,
      message: `نوبت ساعت ${apt.startTime} لغو گردید.`,
      timestamp: 'هم‌اکنون',
      isRead: false,
      priority: 'high',
      entityType: 'appointment',
      entityId: apt.id,
    });

    return { success: true };
  };

  // 4. Create Walk-In Appointment
  const createWalkInAppointment = (data: {
    customerName: string;
    customerPhone: string;
    serviceId: string;
    price: number;
    notes?: string;
    startTime?: string;
  }) => {
    if (!data.customerName.trim()) {
      return { success: false, error: 'لطفاً نام مشتری را وارد نمایید.' };
    }
    if (!data.customerPhone.trim()) {
      return { success: false, error: 'لطفاً شماره تماس معتبر وارد نمایید.' };
    }
    const targetService = services.find((s) => s.id === data.serviceId) || services[0];
    const todaySolar = getCurrentSolarDateInfo();
    const duration = targetService.durationMinutes || 45;
    const startTime = data.startTime || '14:30';

    // Conflict Check
    const conflict = checkAppointmentConflict(
      appointments,
      activeChair.id,
      todaySolar.dayNumber,
      startTime,
      duration
    );
    if (conflict.hasConflict) {
      return { 
        success: false, 
        error: `تداخل زمانی با نوبت دیگر (${conflict.conflictingAppointment?.customerName} ساعت ${conflict.conflictingAppointment?.startTime}) وجود دارد.` 
      };
    }

    // Check / Create Customer
    let customer = findCustomerByPhone(customers, data.customerPhone);
    if (!customer) {
      const newCustomer: ClientProfile = {
        id: `client-${Date.now()}`,
        name: data.customerName,
        phone: data.customerPhone,
        email: `${data.customerName.toLowerCase().replace(/\s+/g, '.')}@client.local`,
        memberId: `#AV-${Math.floor(1000 + Math.random() * 9000)}`,
        memberTier: 'مشتری حضوری (Walk-in)',
        isVip: false,
        isPermanentClient: false,
        joinedDate: `${todaySolar.monthName} ${todaySolar.yearPersian}`,
        totalVisits: 1,
        preferredSuite: activeChair.name,
        preferredBarberId: activeBarber.id,
        privateNotes: data.notes,
      };
      setCustomers((prev) => [newCustomer, ...prev]);
      customer = newCustomer;
    }

    const newApt: Appointment = {
      id: `apt-walkin-${Date.now()}`,
      appointmentNumber: `AV-${Math.floor(8000 + Math.random() * 1000)}`,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      serviceId: targetService.id,
      service: {
        id: targetService.id,
        categoryId: targetService.categoryId,
        name: targetService.name,
        price: data.price || targetService.price,
        realPrice: targetService.realPrice,
        discountedPrice: targetService.discountedPrice,
        durationMinutes: duration,
        description: targetService.description,
        isActive: targetService.isActive,
        sortOrder: targetService.sortOrder,
        tag: targetService.tag,
        isSpecialty: targetService.isSpecialty,
      },
      barberId: activeBarber.id,
      barberName: activeBarber.name,
      chairId: activeChair.id,
      chairName: activeChair.name,
      date: todaySolar.dateString,
      dayNumber: todaySolar.dayNumber,
      startTime,
      endTime: addMinutesToTime(startTime, duration),
      durationMinutes: duration,
      servicePrice: data.price || targetService.price,
      originalServicePrice: targetService.realPrice || targetService.price,
      discountAmount: (targetService.realPrice && targetService.realPrice > (data.price || targetService.price))
        ? targetService.realPrice - (data.price || targetService.price)
        : 0,
      accoutrementsPrice: 0,
      tipPercentage: 15,
      tipAmount: Math.round(((data.price || targetService.price) * 15) / 100),
      totalAmount: (data.price || targetService.price) + Math.round(((data.price || targetService.price) * 15) / 100),
      depositAmount: 0,
      additionalAccoutrements: [],
      beverage: BEVERAGE_OPTIONS[0],
      customerNotes: data.notes,
      stylingNotes: 'مراجعه حضوری مستقیم در آتلیه',
      status: 'confirmed',
      bookingSource: 'walk_in',
      createdAt: todaySolar.dateKey,
      bookingTimestamp: `${todaySolar.dateString} · ${startTime}`,
    };

    setAppointments((prev) => [...prev, newApt]);
    createServerAppointment(newApt);

    addNotification({
      type: 'appointment_new',
      title: `مشتری حضوری جدید: ${customer.name}`,
      message: `نوبت برای ساعت ${startTime} ثبت شد.`,
      timestamp: 'هم‌اکنون',
      isRead: false,
      priority: 'high',
      entityType: 'appointment',
      entityId: newApt.id,
    });

    return { success: true, appointment: newApt };
  };

  // 5. Create Block / Break
  const createBlockBreak = (data: {
    startTime: string;
    durationMinutes: number;
    reason: string;
  }) => {
    if (!data.startTime) {
      return { success: false, error: 'لطفاً زمان شروع بازه را انتخاب نمایید.' };
    }
    if (!data.durationMinutes || data.durationMinutes <= 0) {
      return { success: false, error: 'مدت زمان بازه نامعتبر است.' };
    }

    const todaySolar = getCurrentSolarDateInfo();

    const conflict = checkAppointmentConflict(
      appointments,
      activeChair.id,
      todaySolar.dayNumber,
      data.startTime,
      data.durationMinutes
    );
    if (conflict.hasConflict) {
      return { 
        success: false, 
        error: `این بازه با نوبت (${conflict.conflictingAppointment?.customerName} ساعت ${conflict.conflictingAppointment?.startTime}) هم‌پوشانی دارد.` 
      };
    }

    const blockedApt: Appointment = {
      id: `block-${Date.now()}`,
      appointmentNumber: `BLK-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: 'studio-internal',
      customerName: data.reason || 'استراحت و ضدعفونی',
      customerPhone: studio.phone,
      serviceId: 'internal-block',
      service: {
        id: 'internal-block',
        name: data.reason || 'بازه مسدودشده',
        category: 'rituals',
        durationMinutes: data.durationMinutes,
        price: 0,
        description: data.reason,
        isActive: true,
      },
      barberId: activeBarber.id,
      barberName: activeBarber.name,
      chairId: activeChair.id,
      chairName: activeChair.name,
      date: todaySolar.dateString,
      dayNumber: todaySolar.dayNumber,
      startTime: data.startTime,
      endTime: addMinutesToTime(data.startTime, data.durationMinutes),
      durationMinutes: data.durationMinutes,
      servicePrice: 0,
      accoutrementsPrice: 0,
      tipPercentage: 0,
      tipAmount: 0,
      totalAmount: 0,
      depositAmount: 0,
      additionalAccoutrements: [],
      beverage: BEVERAGE_OPTIONS[0],
      stylingNotes: data.reason,
      status: 'blocked',
      bookingSource: 'studio_manual',
      createdAt: todaySolar.dateKey,
      bookingTimestamp: `${todaySolar.dateString} · ${data.startTime}`,
    };

    setAppointments((prev) => [...prev, blockedApt]);
    createServerAppointment(blockedApt).catch(() => {});

    return { success: true, appointment: blockedApt };
  };

  // 6. Create Quick Booking from Available Slot
  const createQuickBooking = (data: {
    customerName: string;
    customerPhone: string;
    serviceId: string;
    price: number;
    startTime: string;
    durationMinutes: number;
    notes?: string;
    dayNumber?: number;
    date?: string;
  }) => {
    if (!data.customerName.trim()) {
      return { success: false, error: 'لطفاً نام مشتری را وارد نمایید.' };
    }
    if (!data.customerPhone.trim()) {
      return { success: false, error: 'لطفاً شماره تماس را وارد نمایید.' };
    }

    const todaySolar = getCurrentSolarDateInfo();
    const targetDayNumber = data.dayNumber ?? todaySolar.dayNumber;
    const targetDate = data.date ?? todaySolar.dateString;

    if (isSlotExpired(targetDayNumber, data.startTime)) {
      return {
        success: false,
        error: 'امکان ثبت نوبت برای تاریخ یا ساعت سپری‌شده وجود ندارد.',
      };
    }

    const conflict = checkAppointmentConflict(
      appointments,
      activeChair.id,
      targetDayNumber,
      data.startTime,
      data.durationMinutes
    );
    if (conflict.hasConflict) {
      return { 
        success: false, 
        error: `تداخل زمانی با نوبت (${conflict.conflictingAppointment?.customerName}) وجود دارد.` 
      };
    }

    let customer = findCustomerByPhone(customers, data.customerPhone);
    if (!customer) {
      const newCustomer: ClientProfile = {
        id: `client-${Date.now()}`,
        name: data.customerName,
        phone: data.customerPhone,
        email: `${data.customerName.toLowerCase().replace(/\s+/g, '.')}@client.local`,
        memberId: `#AV-${Math.floor(1000 + Math.random() * 9000)}`,
        memberTier: 'مشتری آتلیه',
        isVip: false,
        isPermanentClient: false,
        joinedDate: `${todaySolar.monthName} ${todaySolar.yearPersian}`,
        totalVisits: 1,
        preferredSuite: activeChair.name,
        preferredBarberId: activeBarber.id,
        privateNotes: data.notes,
      };
      setCustomers((prev) => [newCustomer, ...prev]);
      customer = newCustomer;
    }

    const targetService = services.find((s) => s.id === data.serviceId) || services[0];
    const newApt: Appointment = {
      id: `apt-quick-${Date.now()}`,
      appointmentNumber: `AV-${Math.floor(8000 + Math.random() * 1000)}`,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      isVip: customer.isVip,
      serviceId: targetService.id,
      service: targetService,
      barberId: activeBarber.id,
      barberName: activeBarber.name,
      chairId: activeChair.id,
      chairName: activeChair.name,
      date: targetDate,
      dayNumber: targetDayNumber,
      startTime: data.startTime,
      endTime: addMinutesToTime(data.startTime, data.durationMinutes),
      durationMinutes: data.durationMinutes,
      servicePrice: data.price || targetService.price,
      originalServicePrice: targetService.realPrice || targetService.price,
      discountAmount: (targetService.realPrice && targetService.realPrice > (data.price || targetService.price))
        ? targetService.realPrice - (data.price || targetService.price)
        : 0,
      accoutrementsPrice: 0,
      tipPercentage: 20,
      tipAmount: Math.round(((data.price || targetService.price) * 20) / 100),
      totalAmount: (data.price || targetService.price) + Math.round(((data.price || targetService.price) * 20) / 100),
      depositAmount: 20,
      additionalAccoutrements: [],
      beverage: BEVERAGE_OPTIONS[0],
      customerNotes: data.notes,
      stylingNotes: 'رزرو سریع از طریق پنل مدیریت استودیو',
      status: 'confirmed',
      bookingSource: 'studio_manual',
      createdAt: todaySolar.dateKey,
      bookingTimestamp: `${targetDate} · ${data.startTime}`,
    };

    setAppointments((prev) => [...prev, newApt]);
    createServerAppointment(newApt).catch(() => {});

    if (customer.id === currentCustomer.id || (customer.phone && currentCustomer.phone && customer.phone === currentCustomer.phone)) {
      addStoredUserBookingId(newApt.id);
    }

    addNotification({
      type: 'appointment_new',
      title: `رزرو سریع: ${customer.name}`,
      message: `نوبت تاریخ ${targetDate} ساعت ${data.startTime} با موفقیت ثبت شد.`,
      timestamp: 'هم‌اکنون',
      isRead: false,
      priority: 'high',
      entityType: 'appointment',
      entityId: newApt.id,
    });

    return { success: true, appointment: newApt };
  };

  // 7. Reschedule Appointment Action
  const rescheduleAppointment = (aptId: string, data: {
    dayNumber: number;
    date: string;
    startTime: string;
    durationMinutes?: number;
  }) => {
    const apt = appointments.find((a) => a.id === aptId);
    if (!apt) {
      return { success: false, error: 'نوبت مورد نظر یافت نشد.' };
    }
    const duration = data.durationMinutes || apt.durationMinutes || 45;
    const targetChairId = apt.chairId || activeChair.id;

    // Check conflict excluding current appointment id
    const conflict = checkAppointmentConflict(
      appointments,
      targetChairId,
      data.dayNumber,
      data.startTime,
      duration,
      aptId
    );

    if (conflict.hasConflict) {
      return {
        success: false,
        error: `تداخل زمانی با نوبت (${conflict.conflictingAppointment?.customerName} ساعت ${conflict.conflictingAppointment?.startTime}) وجود دارد.`
      };
    }

    const newEndTime = addMinutesToTime(data.startTime, duration);
    let updatedApt: Appointment | null = null;

    setAppointments((prev) =>
      prev.map((item) => {
        if (item.id === aptId) {
          updatedApt = {
            ...item,
            dayNumber: data.dayNumber,
            date: data.date,
            startTime: data.startTime,
            endTime: newEndTime,
            durationMinutes: duration,
            bookingTimestamp: `${data.date} · ${data.startTime}`,
            status: item.status === 'in_progress' ? 'confirmed' : item.status,
          };
          return updatedApt;
        }
        return item;
      })
    );

    if (updatedApt) {
      createServerAppointment(updatedApt).catch(() => {});
    }

    addNotification({
      type: 'appointment_new',
      title: `تغییر زمان نوبت: ${apt.customerName}`,
      message: `نوبت به ${data.date} ساعت ${data.startTime} منتقل شد.`,
      timestamp: 'هم‌اکنون',
      isRead: false,
      priority: 'medium',
      entityType: 'appointment',
      entityId: apt.id,
    });

    return { success: true, appointment: updatedApt || undefined };
  };

  // Customer Online Booking with Race/Conflict Prevention & Real Synchronization
  const createOnlineBooking = (data: {
    serviceId: string;
    dayNumber: number;
    dateString?: string;
    startTime: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    beverageId?: string;
    isQuietSession?: boolean;
    customerNotes?: string;
    accoutrements?: Accoutrement[];
    tipRateOrAmount?: number | 'custom';
    customTip?: number;
  }): { success: boolean; error?: string; appointment?: Appointment; reservation?: Reservation } => {
    const trimmedName = data.customerName.trim();
    const nameValidation = validateFullName(trimmedName);
    if (!nameValidation.isValid) {
      return {
        success: false,
        error: nameValidation.error || 'لطفاً نام و نام خانوادگی خود را کامل (شامل دو بخش با فاصله) وارد فرمایید.',
      };
    }
    const cleanPhone = normalizePhoneNumber(data.customerPhone);
    if (!cleanPhone || cleanPhone.length < 7) {
      return { success: false, error: 'لطفاً شماره تماس معتبر جهت هماهنگی کانسیرج وارد نمایید.' };
    }

    const targetService = services.find((s) => s.id === data.serviceId);
    if (!targetService) {
      return { success: false, error: 'سرویس انتخابی در کاتالوگ آتلیه یافت نشد.' };
    }

    const selectedAccs = data.accoutrements?.filter((a) => a.selected) || [];
    const accsDuration = selectedAccs.reduce((sum, a) => sum + (a.durationMinutes || 0), 0);
    const totalDuration = (targetService.durationMinutes || 45) + accsDuration;

    // 0. Live Expired Validation (Strictly prohibit booking expired dates and hours)
    if (isSlotExpired(data.dayNumber, data.startTime)) {
      return {
        success: false,
        error: 'امکان رزرو برای تاریخ یا ساعت سپری‌شده وجود ندارد. لطفاً ساعت آینده را انتخاب فرمایید.',
      };
    }

    // 1. Live Conflict Validation immediately before booking (Protecting from race conditions / stale slots)
    const conflict = checkAppointmentConflict(
      appointments,
      activeChair.id,
      data.dayNumber,
      data.startTime,
      totalDuration
    );

    if (conflict.hasConflict) {
      return {
        success: false,
        error: 'این زمان به‌تازگی رزرو شده است. لطفاً زمان دیگری را انتخاب نمایید.',
      };
    }

    // 2. Customer Lookup & Reuse by normalized phone to strictly prevent duplicates
    let customer = customers.find((c) => {
      const cPhone = normalizePhoneNumber(c.phone);
      return cPhone === cleanPhone || cPhone.endsWith(cleanPhone) || cleanPhone.endsWith(cPhone);
    });

    const NONE_BEVERAGE: BeverageOption = {
      id: 'none',
      name: 'بدون پذیرایی',
      icon: 'ban',
      price: 0,
      description: 'بدون پذیرایی',
      category: 'other',
      isAvailable: true,
    };

    const targetBeverage =
      data.beverageId === 'none'
        ? NONE_BEVERAGE
        : beverageOptions.find((b) => b.id === data.beverageId) ||
          beverageOptions[0] ||
          NONE_BEVERAGE;

    if (!customer) {
      // Create brand-new customer profile
      const newCustomer: ClientProfile = {
        id: `client-${Date.now()}`,
        name: trimmedName,
        avatarUrl: getDeterministicAvatar(trimmedName),
        phone: data.customerPhone.trim(),
        email: data.customerEmail?.trim() || `${trimmedName.toLowerCase().replace(/\s+/g, '.')}@client.atelier`,
        memberId: `#AV-${Math.floor(1000 + Math.random() * 9000)}`,
        memberTier: 'عضو آنلاین آتلیه',
        isVip: false,
        isPermanentClient: false,
        joinedDate: 'مهر ۱۴۰۳',
        totalVisits: 0,
        preferredSuite: activeChair.name,
        preferredBarberId: activeBarber.id,
        hospitality: {
          beveragePreference: targetBeverage.name,
          conversationLevel: data.isQuietSession ? 'minimal' : 'customary',
        },
      };
      setCustomers((prev) => [newCustomer, ...prev]);
      customer = newCustomer;
    } else {
      // Update existing customer profile if quiet session was requested
      if (data.isQuietSession && customer.hospitality) {
        customer.hospitality.conversationLevel = 'minimal';
      }
    }

    // 3. Financial calculations
    const totals = calculateAppointmentTotals(
      targetService,
      selectedAccs,
      data.tipRateOrAmount ?? 0,
      data.customTip ?? 0,
      targetBeverage
    );

    const pricingSummary = calculateBookingTotal(targetService, selectedAccs);
    const todaySolar = getCurrentSolarDateInfo();
    const targetDateString = data.dateString || getPersianDateForDay(data.dayNumber);

    // 4. Create real Appointment with bookingSource: 'online'
    const newApt: Appointment = {
      id: `apt-online-${Date.now()}`,
      appointmentNumber: `AV-${Math.floor(8000 + Math.random() * 1999)}`,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      isVip: customer.isVip,
      serviceId: targetService.id,
      service: {
        id: targetService.id,
        categoryId: targetService.categoryId,
        name: targetService.name,
        price: targetService.price,
        realPrice: targetService.realPrice,
        discountedPrice: targetService.discountedPrice,
        durationMinutes: targetService.durationMinutes,
        description: targetService.description,
        isActive: targetService.isActive,
        sortOrder: targetService.sortOrder,
        tag: targetService.tag,
        isSpecialty: targetService.isSpecialty,
      },
      barberId: activeBarber.id,
      barberName: activeBarber.name,
      chairId: activeChair.id,
      chairName: activeChair.name,
      date: targetDateString,
      dayNumber: data.dayNumber,
      startTime: data.startTime,
      endTime: addMinutesToTime(data.startTime, totalDuration),
      durationMinutes: totalDuration,
      servicePrice: totals.servicePrice,
      originalServicePrice: totals.serviceRealPrice,
      discountAmount: totals.discountAmount,
      discountPercent: totals.discountPercent,
      accoutrementsPrice: totals.accoutrementsPrice,
      tipPercentage: typeof data.tipRateOrAmount === 'number' ? data.tipRateOrAmount : 0,
      tipAmount: totals.tipAmount,
      totalAmount: pricingSummary.total,
      depositAmount: totals.depositAmount,
      additionalAccoutrements: selectedAccs,
      beverage: targetBeverage,
      customerNotes: data.customerNotes?.trim() || '',
      isQuietSession: !!data.isQuietSession,
      stylingNotes: data.isQuietSession 
        ? 'درخواست آیین سکوت و آرامش ذهن (Quiet Session)' 
        : 'رزرو آنلاین مراجع',
      status: 'confirmed',
      bookingSource: 'online',
      createdAt: todaySolar.dateString,
      bookingTimestamp: `${targetDateString} · ساعت ${data.startTime}`,
      priceSummary: {
        total: pricingSummary.total,
        originalTotal: pricingSummary.originalTotal,
        discountAmount: pricingSummary.discountAmount,
        hasDiscount: pricingSummary.hasDiscount,
        lines: pricingSummary.lines,
      },
    };

    // Update shared appointments
    setAppointments((prev) => [newApt, ...prev]);

    // Persist immediately to Host Server database
    createServerAppointment(newApt).catch((err) => {
      console.warn('[Host Server] Error saving appointment:', err);
    });

    // Also persist customer profile to Host Server
    if (customer) {
      saveServerCustomer(customer).catch(() => {});
    }

    // Persist appointment ID to local browser storage so it is guaranteed to show on return
    addStoredUserBookingId(newApt.id);
    if (newApt.appointmentNumber) {
      addStoredUserBookingId(newApt.appointmentNumber);
    }

    // Ensure current customer session is set to the booker and saved to browser storage
    if (customer) {
      setCurrentCustomer(customer);
      saveStoredBrowserProfile(customer);
    }

    // Create Reservation object for customer boarding pass view
    const newReservation: Reservation = {
      ...newApt,
      reservationNumber: newApt.appointmentNumber || newApt.id,
      artisan: activeBarber.name,
      suite: activeChair.name,
      location: studio.address ? `${studio.name} · ${studio.address}` : studio.name,
      selectedDate: targetDateString,
      selectedTime: data.startTime,
      priceSummary: {
        total: pricingSummary.total,
        originalTotal: pricingSummary.originalTotal,
        discountAmount: pricingSummary.discountAmount,
        hasDiscount: pricingSummary.hasDiscount,
        lines: pricingSummary.lines,
      },
    };
    setCurrentReservation(newReservation);

    // Studio Notification for online booking
    addNotification({
      type: 'appointment_new',
      title: `رزرو آنلاین جدید: ${customer.name}`,
      message: `نوبت ${targetService.name} برای ${targetDateString} ساعت ${data.startTime} در ${activeChair.name} ثبت گردید.`,
      timestamp: 'هم‌اکنون',
      isRead: false,
      priority: 'high',
      entityType: 'appointment',
      entityId: newApt.id,
    });

    return { success: true, appointment: newApt, reservation: newReservation };
  };

  // Update Formula Notes on Customer Dossier
  const updateCustomerFormulaNotes = (notes: string) => {
    setCurrentCustomer((prev) => ({ ...prev, formulaNotes: notes }));
    setCustomers((prev) =>
      prev.map((c) => (c.id === currentCustomer.id ? { ...c, formulaNotes: notes } : c))
    );
    if (currentCustomer && currentCustomer.id) {
      updateServerCustomerPatch(currentCustomer.id, { formulaNotes: notes });
    }
  };

  // Phase 4: Full Customer Dossier & Directory Operations
  const updateCustomer = (customerId: string, updatedData: Partial<ClientProfile>) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          return {
            ...c,
            ...updatedData,
            hairProfile: updatedData.hairProfile
              ? { ...c.hairProfile, ...updatedData.hairProfile }
              : c.hairProfile,
            faceProfile: updatedData.faceProfile
              ? { ...c.faceProfile, ...updatedData.faceProfile }
              : c.faceProfile,
            technicalNotes: updatedData.technicalNotes
              ? { ...c.technicalNotes, ...updatedData.technicalNotes }
              : c.technicalNotes,
            hospitality: updatedData.hospitality
              ? { ...c.hospitality, ...updatedData.hospitality }
              : c.hospitality,
          };
        }
        return c;
      })
    );

    // Propagate changes to appointment records referencing this customer
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.customerId === customerId) {
          return {
            ...a,
            customerName: updatedData.name !== undefined ? updatedData.name : a.customerName,
            customerPhone: updatedData.phone !== undefined ? updatedData.phone : a.customerPhone,
            isVip: updatedData.isVip !== undefined ? updatedData.isVip : a.isVip,
          };
        }
        return a;
      })
    );

    // Also update selectedClientForDossier if open
    setSelectedClientForDossier((prev) => {
      if (prev && prev.id === customerId) {
        return {
          ...prev,
          ...updatedData,
          hairProfile: updatedData.hairProfile
            ? { ...prev.hairProfile, ...updatedData.hairProfile }
            : prev.hairProfile,
          faceProfile: updatedData.faceProfile
            ? { ...prev.faceProfile, ...updatedData.faceProfile }
            : prev.faceProfile,
          technicalNotes: updatedData.technicalNotes
            ? { ...prev.technicalNotes, ...updatedData.technicalNotes }
            : prev.technicalNotes,
          hospitality: updatedData.hospitality
            ? { ...prev.hospitality, ...updatedData.hospitality }
            : prev.hospitality,
        };
      }
      return prev;
    });

    // Also update currentCustomer if matching
    setCurrentCustomer((prev) => {
      if (prev.id === customerId) {
        return {
          ...prev,
          ...updatedData,
          hairProfile: updatedData.hairProfile
            ? { ...prev.hairProfile, ...updatedData.hairProfile }
            : prev.hairProfile,
          faceProfile: updatedData.faceProfile
            ? { ...prev.faceProfile, ...updatedData.faceProfile }
            : prev.faceProfile,
          technicalNotes: updatedData.technicalNotes
            ? { ...prev.technicalNotes, ...updatedData.technicalNotes }
            : prev.technicalNotes,
          hospitality: updatedData.hospitality
            ? { ...prev.hospitality, ...updatedData.hospitality }
            : prev.hospitality,
        };
      }
      return prev;
    });

    // Persist patch on host server
    updateServerCustomerPatch(customerId, updatedData);
  };

  const createCustomer = (data: {
    name: string;
    phone: string;
    avatarUrl?: string;
    isVip?: boolean;
    email?: string;
    notes?: string;
    hairProfile?: any;
    faceProfile?: any;
    hospitality?: any;
    technicalNotes?: any;
  }) => {
    const trimmedName = (data.name || '').trim();
    const rawPhone = (data.phone || '').trim();
    if (!trimmedName) {
      return { success: false, error: 'نام و نام خانوادگی مشتری الزامی است.' };
    }
    if (!rawPhone || rawPhone.length < 5) {
      return { success: false, error: 'شماره تماس معتبر الزامی است.' };
    }

    const normPhone = normalizePhoneNumber(rawPhone);
    const existing = customers.find((c) => normalizePhoneNumber(c.phone) === normPhone);
    if (existing) {
      return {
        success: false,
        error: `مشتری با این شماره تماس قبلاً در سیستم ثبت شده است (${existing.name}).`,
        customer: existing,
      };
    }

    const newCustomer: ClientProfile = {
      id: `client-${Date.now()}`,
      name: trimmedName,
      avatarUrl: data.avatarUrl || getDeterministicAvatar(trimmedName),
      email: data.email || `${normPhone}@client.atelier`,
      phone: rawPhone,
      memberId: `#AV-${Math.floor(1000 + Math.random() * 9000)}`,
      memberTier: 'مشتری سالن',
      isVip: false,
      isPermanentClient: true,
      joinedDate: 'مهر ۱۴۰۳',
      totalVisits: 0,
      preferredSuite: 'سوئیت اختصاصی ۰۱',
      preferredBarberId: activeBarber.id,
      formulaNotes: data.notes || '',
      hairProfile: data.hairProfile || {
        hairType: 'Straight',
        density: 'Medium',
        texture: 'معمولی',
        growthPattern: 'طبیعی',
        favoriteFade: 'Mid Fade',
        skinSensitivity: 'نرمال',
      },
      faceProfile: data.faceProfile || {
        shape: 'Oval',
        beardGrowth: 'معمولی',
        targetStyle: 'کوپ مدرن',
      },
      hospitality: data.hospitality || {
        beveragePreference: 'Double Espresso',
        audioPreference: 'Jazz',
        waterTemperature: 'sparkling',
        ambientMusicVolume: 'ambient',
        conversationLevel: 'customary',
        scentPreference: 'چوب صندل',
      },
      technicalNotes: data.technicalNotes || {
        clipperGuard: 'گارد ۲',
        fadeTechnique: 'مید فید با سایه طبیعی',
        fadeAngles: 'طبیعی',
        necklinePreference: 'طبیعی محوشده',
        sideburnPreference: 'معمولی',
        beardLength: 'مرتب',
        beardShaping: 'طبیعی',
        scissorPreference: 'قیچی استاندارد',
        stylingPreference: 'کلِی مات',
        productsCommonlyUsed: 'کِلِی مات ابریشمی آتلیه',
        generalTechnicalNotes: data.notes || 'پرونده تازه تأسیس',
      },
      recommendedProductIds: ['prod-matte-clay'],
      purchasedProductIds: [],
    };

    setCustomers((prev) => [newCustomer, ...prev]);

    // Persist new customer on host server
    saveServerCustomer(newCustomer);

    addNotification({
      type: 'concierge_message',
      title: 'پرونده مشتری جدید ایجاد شد',
      message: `پرونده برای ${newCustomer.name} (${newCustomer.memberId}) در بایگانی آتلیه گشوده شد.`,
      timestamp: 'هم‌اکنون',
      isRead: false,
      priority: 'medium',
      entityType: 'customer',
      entityId: newCustomer.id,
    });

    return { success: true, customer: newCustomer };
  };

  const archiveCustomer = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) {
      return { success: false, message: 'مشتری مورد نظر یافت نشد.' };
    }

    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, isArchived: true } : c))
    );

    return { success: true, message: `پرونده ${customer.name} با حفظ سوابق بایگانی شد.` };
  };

  const toggleProductRecommendation = (customerId: string, productId: string) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const current = c.recommendedProductIds || [];
          const exists = current.includes(productId);
          const updated = exists ? current.filter((id) => id !== productId) : [...current, productId];
          return { ...c, recommendedProductIds: updated };
        }
        return c;
      })
    );

    setSelectedClientForDossier((prev) => {
      if (prev && prev.id === customerId) {
        const current = prev.recommendedProductIds || [];
        const exists = current.includes(productId);
        const updated = exists ? current.filter((id) => id !== productId) : [...current, productId];
        return { ...prev, recommendedProductIds: updated };
      }
      return prev;
    });
  };

  // Cart & Order operations (Boutique excised)
  const addToCart = (_product: Product, _quantity = 1): { success: boolean; error?: string } => {
    return { success: true };
  };

  const removeFromCart = (_productId: string) => {};

  const updateCartQuantity = (_productId: string, _quantity: number): { success: boolean; error?: string } => {
    return { success: true };
  };

  const clearCart = () => {};

  const checkoutOrder = (_data: any): { success: boolean; order?: Order; error?: string } => {
    return { success: true };
  };

  const placeOrder = (_shippingAddress = '', _valetToChair = false): Order => {
    return {
      id: `ord-${Date.now()}`,
      orderNumber: `AVO-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: currentCustomer?.id || 'guest',
      customerName: currentCustomer?.name || 'مشتری',
      customerPhone: currentCustomer?.phone || '',
      items: [],
      subtotal: 0,
      total: 0,
    };
  };

  // Notification operations
  const markNotificationAsRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, isRead: true, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true, read: true }))
    );
  };

  const clearNotification = (notifId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const dismissLiveAlertNotification = () => {
    setLiveAlertNotification(null);
  };

  const addNotification = (notif: Omit<StudioNotification, 'id'>) => {
    const newNotif: StudioNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      isRead: notif.isRead ?? false,
      read: notif.read ?? false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    // Pop up in dynamic island alert mode
    setLiveAlertNotification(newNotif);

    // Also dispatch to native Service Worker Web Push notification if enabled
    try {
      sendNativeNotification({
        title: newNotif.title,
        body: newNotif.message,
        tag: newNotif.id,
        data: {
          entityType: newNotif.entityType,
          entityId: newNotif.entityId,
        },
      });
    } catch (e) {
      console.log('[SW Notification Dispatch]', e);
    }
  };

  const triggerTestNotification = (_customType?: string) => {
    // Clean production no-op
  };

  return (
    <AtelierContext.Provider
      value={{
        studio,
        chairs,
        barbers,
        activeChair,
        activeBarber,
        setActiveChair,
        setActiveBarber,
        updateBarber,
        updateBarberAvailability,
        updateBarberPresetMessages,
        addBarberPresetMessage,
        deleteBarberPresetMessage,
        resetBarberPresetMessages,
        customers,
        currentCustomer,
        setCurrentCustomer,
        selectedClientForDossier,
        setSelectedClientForDossier,
        services,
        categories,
        activeServices,
        servicesByCategory,
        addCategory,
        updateCategory,
        deleteCategory,
        moveCategory,
        reorderCategories,
        addService,
        updateService,
        deleteService,
        toggleServiceActive,
        moveService,
        reorderServices,
        setServices,
        setCategories,
        accoutrements,
        setAccoutrements,
        addAccoutrement,
        updateAccoutrement,
        deleteAccoutrement,
        toggleAccoutrementActive,
        moveAccoutrement,
        reorderAccoutrements,
        toggleAccoutrement,
        beverageOptions,
        setBeverageOptions,
        addBeverageOption,
        updateBeverageOption,
        deleteBeverageOption,
        appointments,
        pastAppointments,
        currentReservation,
        products,
        cart,
        orders,
        notifications,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        toggleCartDrawer,
        portalMode,
        setPortalMode,
        isManagementAuthenticated,
        isAuthModalOpen,
        openManagementAuth,
        closeManagementAuth,
        loginManagement,
        logoutManagement,
        managementTab,
        setManagementTab,
        managementSubTab,
        setManagementSubTab,
        selectedAppointmentForDetails,
        setSelectedAppointmentForDetails,
        settings,
        updateStudioSettings,
        updateStudioProfile,
        updateAnnouncement,
        updateOperatingHours,
        updatePolicies,
        updateFinancialTarget,
        updateNotificationPreferences,
        updateCommerceSettings,
        resetSettingsToDefault,
        updateServiceTariff,
        setCurrentReservation,
        addNewAppointment,
        updateAppointmentStatus,
        startAppointment,
        completeAppointment,
        cancelAppointment,
        createWalkInAppointment,
        createBlockBreak,
        createQuickBooking,
        rescheduleAppointment,
        createOnlineBooking,
        updateCustomerFormulaNotes,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        placeOrder,
        checkoutOrder,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotification,
        clearAllNotifications,
        addNotification,
        liveAlertNotification,
        dismissLiveAlertNotification,
        triggerTestNotification,
        updateCustomer,
        createCustomer,
        archiveCustomer,
        toggleProductRecommendation,
        authUser,
        isUserAuthenticated: !!authUser,
        isAuthLoading,
        isClientAuthModalOpen,
        clientAuthMode,
        openClientAuthModal,
        closeClientAuthModal,
        signOutUser,
        loginUser,
        registerUser,
        loginClientPhone,
        loginClientCredentials,
        registerClient,
        refreshDatabaseData,
        lastRefreshTime,
        isRefreshing,
        demandInsights,
        logHourDemand,
        logCustomerConstraint,
      }}
    >
      {children}
    </AtelierContext.Provider>
  );
};

export const useAtelier = (): AtelierContextType => {
  const context = useContext(AtelierContext);
  if (!context) {
    throw new Error('useAtelier must be used within an AtelierProvider');
  }
  return context;
};
