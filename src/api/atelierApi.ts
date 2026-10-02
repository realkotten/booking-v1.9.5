import { 
  Appointment, 
  ClientProfile, 
  Service, 
  ServiceCategory, 
  Chair, 
  Barber, 
  Order, 
  StudioNotification, 
  Product, 
  Accoutrement, 
  BeverageOption,
  Studio,
  StudioSettings
} from '../types';
import { DetailedDemandAnalytics } from '../utils/bookingUtils';

export interface AtelierUser {
  id: string;
  phone?: string;
  email?: string;
  displayName: string;
  avatarUrl?: string;
  role: 'admin' | 'client' | 'barber';
  createdAt?: string;
  lastLoginAt?: string;
}

export interface AtelierServerStore {
  studio?: Studio;
  appointments: Appointment[];
  pastAppointments: Appointment[];
  customers: ClientProfile[];
  services: Service[];
  categories: ServiceCategory[];
  chairs: Chair[];
  barbers: Barber[];
  products: Product[];
  orders: Order[];
  notifications: StudioNotification[];
  accoutrements: Accoutrement[];
  beverageOptions: BeverageOption[];
  settings?: StudioSettings;
  users?: AtelierUser[];
  demandInsights?: DetailedDemandAnalytics;
  lastUpdated?: string;
}

const API_BASE = '/api/atelier';
const AUTH_BASE = '/api/auth';

const TOKEN_KEYS = ['jwt_token', 'auth_token', 'royal_host_session_token_v1'];

export function getStoredSessionToken(): string | null {
  try {
    for (const key of TOKEN_KEYS) {
      const val = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (val) return val;
    }
    return null;
  } catch {
    return null;
  }
}

export function setStoredSessionToken(token: string, persist: boolean = true) {
  try {
    TOKEN_KEYS.forEach((k) => {
      if (persist) {
        localStorage.setItem(k, token);
      } else {
        sessionStorage.setItem(k, token);
      }
    });
  } catch (e) {
    console.warn('Could not store JWT session token in localStorage', e);
  }
}

export function clearStoredSessionToken() {
  try {
    TOKEN_KEYS.forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
  } catch (e) {
    console.warn('Could not clear session token', e);
  }
}

// ─── AUTHENTICATION CALLS ──────────────────────────────────────────────────────
export async function quickPhoneLogin(data: {
  phone: string;
  displayName?: string;
  avatarUrl?: string;
}): Promise<{ success: boolean; user?: AtelierUser; customer?: ClientProfile; token?: string; error?: string }> {
  try {
    const res = await fetch(`${AUTH_BASE}/quick-phone-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success && result.token) {
      setStoredSessionToken(result.token, true);
    }
    return result;
  } catch (err: any) {
    console.warn('Quick phone login error:', err);
    return { success: false, error: 'خطا در برقراری ارتباط با سرور میزبان' };
  }
}

export async function loginWithCredentials(
  identifier: string,
  password?: string
): Promise<{ success: boolean; user?: AtelierUser; customer?: ClientProfile; token?: string; error?: string }> {
  try {
    const res = await fetch(`${AUTH_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    const result = await res.json();
    if (result.success && result.token) {
      setStoredSessionToken(result.token, true);
    }
    return result;
  } catch (err: any) {
    console.warn('Login error:', err);
    return { success: false, error: 'خطا در ارتباط با سرور' };
  }
}

export async function loginUser(
  credentialsOrIdentifier: { identifier?: string; email?: string; phone?: string; password?: string } | string,
  password?: string
): Promise<{ success: boolean; user?: AtelierUser; customer?: ClientProfile; token?: string; error?: string }> {
  if (typeof credentialsOrIdentifier === 'string') {
    return loginWithCredentials(credentialsOrIdentifier, password);
  }
  const ident = credentialsOrIdentifier.identifier || credentialsOrIdentifier.email || credentialsOrIdentifier.phone || '';
  const pass = credentialsOrIdentifier.password || password || '';
  return loginWithCredentials(ident, pass);
}

export async function registerUser(data: {
  phone?: string;
  email?: string;
  password?: string;
  displayName?: string;
  role?: 'admin' | 'client';
}): Promise<{ success: boolean; user?: AtelierUser; customer?: ClientProfile; token?: string; error?: string }> {
  try {
    const res = await fetch(`${AUTH_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success && result.token) {
      setStoredSessionToken(result.token, true);
    }
    return result;
  } catch (err: any) {
    return { success: false, error: 'خطا در ثبت‌نام کاربر' };
  }
}

export async function fetchCurrentSessionUser(): Promise<{ success: boolean; user?: AtelierUser; customer?: ClientProfile }> {
  const token = getStoredSessionToken();
  if (!token) return { success: false };

  try {
    const res = await fetch(`${AUTH_BASE}/me`, {
      headers: { 
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
    });
    if (!res.ok) {
      clearStoredSessionToken();
      return { success: false };
    }
    return await res.json();
  } catch {
    return { success: false };
  }
}

// ─── STATE & DATA SYNC CALLS ───────────────────────────────────────────────────
export async function fetchServerStore(): Promise<AtelierServerStore | null> {
  try {
    const res = await fetch(`${API_BASE}/state?_t=${Date.now()}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Could not fetch server store, fallback active:', err);
    return null;
  }
}

export async function saveServerStore(store: Partial<AtelierServerStore>): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/state`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(store),
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not save to server storage:', err);
    return false;
  }
}

// ─── ENTITY CRUD HELPERS ───────────────────────────────────────────────────────
export async function createServerAppointment(appointment: Appointment): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/appointment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointment),
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not create appointment on server storage:', err);
    return false;
  }
}

export async function updateServerAppointmentStatus(
  appointmentId: string, 
  status: Appointment['status']
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/appointment/${appointmentId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not update appointment on server storage:', err);
    return false;
  }
}

export async function deleteServerAppointment(appointmentId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/appointment/${appointmentId}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not delete appointment on server storage:', err);
    return false;
  }
}

export async function saveServerCustomer(customer: ClientProfile): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/customer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer),
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not save customer on server storage:', err);
    return false;
  }
}

export async function updateServerCustomerPatch(
  customerId: string, 
  patch: Partial<ClientProfile>
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/customer/${customerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not patch customer on server storage:', err);
    return false;
  }
}

export async function createServerOrder(order: Order): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not save order on server storage:', err);
    return false;
  }
}

export async function saveServerService(service: Service): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/service`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(service),
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function deleteServerService(serviceId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/service/${serviceId}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function saveServerCategory(category: ServiceCategory): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/category`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteServerCategory(categoryId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/category/${categoryId}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function saveServerSettings(settings: Partial<StudioSettings>): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── GOOGLE SHEETS BACKUP CALLS ───────────────────────────────────────────────
export async function getGoogleSheetStatus(): Promise<{
  configured: boolean;
  webAppUrl?: string;
  lastBackupTimestamp?: string;
  lastBackupStatus?: 'success' | 'error' | 'idle';
  lastBackupMessage?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/google-sheet/status`);
    if (!res.ok) throw new Error('Status fetch failed');
    return await res.json();
  } catch {
    return { configured: false, lastBackupStatus: 'idle' };
  }
}

export async function testGoogleSheetConnection(webAppUrl?: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/google-sheet/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webAppUrl }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: 'خطا در ارتباط با سرور میزبان' };
  }
}

export async function backupToGoogleSheet(webAppUrl?: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/google-sheet/backup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webAppUrl }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: 'خطا در درخواست پشتیبان‌گیری به سرور' };
  }
}

export async function restoreFromGoogleSheet(webAppUrl?: string): Promise<{ success: boolean; message: string; restoredData?: any }> {
  try {
    const res = await fetch(`${API_BASE}/google-sheet/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webAppUrl }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: 'خطا در درخواست بازیابی از سرور' };
  }
}

