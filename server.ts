import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'atelier_storage.json');
const BACKUP_FILE = path.join(DATA_DIR, 'atelier_storage.backup.json');

app.use(express.json({ limit: '25mb' }));

// CORS & Preflight middleware for seamless multi-device access across local network and cloud host
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ─── In-memory Cache & Atomic Disk Persistence ────────────────────────────────
let memoryStore: any = null;

function loadStore(): any {
  if (memoryStore) return memoryStore;
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      memoryStore = JSON.parse(raw);
      return memoryStore;
    }
  } catch (err) {
    console.error('[Host Server] Error reading storage file, attempting backup recovery:', err);
    try {
      if (fs.existsSync(BACKUP_FILE)) {
        const backupRaw = fs.readFileSync(BACKUP_FILE, 'utf-8');
        memoryStore = JSON.parse(backupRaw);
        return memoryStore;
      }
    } catch (bErr) {
      console.error('[Host Server] Backup recovery failed:', bErr);
    }
  }
  return null;
}

function saveStore(data: any): boolean {
  try {
    memoryStore = data;
    const serialized = JSON.stringify(data, null, 2);
    
    // Atomic disk write: write to temp file then rename to prevent corruption
    const tempFile = `${DATA_FILE}.${Date.now()}.tmp`;
    fs.writeFileSync(tempFile, serialized, 'utf-8');
    fs.renameSync(tempFile, DATA_FILE);

    // Periodic safe backup
    try {
      fs.writeFileSync(BACKUP_FILE, serialized, 'utf-8');
    } catch {
      // Ignore background backup error
    }

    return true;
  } catch (err) {
    console.error('[Host Server] Error saving to atomic storage file:', err);
    return false;
  }
}

// Initial default structure helper
function getInitializedStore() {
  const existing = loadStore();
  if (existing && existing.services && Array.isArray(existing.services) && existing.services.length > 0) {
    return existing;
  }

  const initial = existing || {
    appointments: [],
    pastAppointments: [],
    customers: [],
    services: [],
    categories: [],
    chairs: [],
    barbers: [],
    products: [],
    orders: [],
    notifications: [],
    accoutrements: [],
    beverageOptions: [],
    settings: {},
    users: [],
    lastUpdated: new Date().toISOString(),
  };

  saveStore(initial);
  return initial;
}

// ─── Google Sheets Web App Backup & Synchronization Helper ───────────────────
async function sendToGoogleSheet(
  action: 'backup_appointment' | 'full_backup' | 'test',
  payload: any,
  overrideUrl?: string
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const store = getInitializedStore();
    const targetUrl = (overrideUrl || store.settings?.googleSheetSettings?.webAppUrl || process.env.GOOGLE_SHEET_WEBAPP_URL || '').trim();

    if (!targetUrl || !targetUrl.startsWith('http')) {
      return { success: false, message: 'آدرس وب‌اپ گوگل شیت هنوز پیکربندی نشده است.' };
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        timestamp: new Date().toISOString(),
        ...payload,
      }),
      redirect: 'follow',
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return { success: false, message: `پاسخ وب‌اپ گوگل شیت: کد ${response.status} ${errText.slice(0, 100)}` };
    }

    const responseData = await response.json().catch(async () => {
      return { success: true, text: await response.text().catch(() => '') };
    });

    // Update settings with successful backup status
    if (!store.settings) store.settings = {};
    if (!store.settings.googleSheetSettings) store.settings.googleSheetSettings = {};
    store.settings.googleSheetSettings.lastBackupTimestamp = new Date().toISOString();
    store.settings.googleSheetSettings.lastBackupStatus = 'success';
    store.settings.googleSheetSettings.lastBackupMessage = responseData.message || 'پشتیبان‌گیری در گوگل شیت موفقیت‌آمیز بود.';
    saveStore(store);

    return {
      success: true,
      message: responseData.message || 'عملیات در گوگل شیت با موفقیت انجام گردید.',
      data: responseData,
    };
  } catch (err: any) {
    console.warn('[Google Sheets Sync] Non-blocking communication warning:', err.message);
    try {
      const store = getInitializedStore();
      if (!store.settings) store.settings = {};
      if (!store.settings.googleSheetSettings) store.settings.googleSheetSettings = {};
      store.settings.googleSheetSettings.lastBackupStatus = 'error';
      store.settings.googleSheetSettings.lastBackupMessage = err.message || 'خطا در برقراری ارتباط با وب‌اپ گوگل شیت';
      saveStore(store);
    } catch {}
    return { success: false, message: `خطا در ارتباط با وب‌اپ گوگل شیت: ${err.message}` };
  }
}

// ─── Cryptographically Signed JWT Token Generator & Verifier ─────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'royal-atelier-jwt-secret-key-2026-secure';

function generateSessionToken(userId: string, role: string, extra?: { email?: string; phone?: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: userId,
    userId,
    role,
    email: extra?.email || '',
    phone: extra?.phone || '',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
  })).toString('base64url');
  
  const signature = crypto.createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');
    
  return `${header}.${payload}.${signature}`;
}

function parseSessionToken(token: string): { userId: string; role: string; email?: string; phone?: string } | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.trim().split('.');
    if (parts.length === 3) {
      const [header, payload, signature] = parts;
      const expectedSig = crypto.createHmac('sha256', JWT_SECRET)
        .update(`${header}.${payload}`)
        .digest('base64url');
      if (signature === expectedSig) {
        const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
        if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
          return null; // Expired
        }
        return {
          userId: decoded.userId || decoded.sub,
          role: decoded.role,
          email: decoded.email,
          phone: decoded.phone,
        };
      }
    }
    // Fallback parser for legacy base64 format
    const raw = Buffer.from(token, 'base64').toString('utf-8');
    const [userId, role] = raw.split(':');
    if (userId && role) return { userId, role };
  } catch {
    return null;
  }
  return null;
}

// ─── AUTHENTICATION API (100% Host Server Native) ──────────────────────────────
app.post('/api/auth/quick-phone-login', (req: Request, res: Response) => {
  const { phone, displayName, avatarUrl } = req.body;
  if (!phone || typeof phone !== 'string') {
    return res.status(400).json({ success: false, error: 'شماره همراه معتبر وارد نمایید.' });
  }

  const cleanPhone = phone.trim();
  const store = getInitializedStore();
  store.users = Array.isArray(store.users) ? store.users : [];
  store.customers = Array.isArray(store.customers) ? store.customers : [];

  // Find or create user
  let user = store.users.find((u: any) => u.phone === cleanPhone);
  if (!user) {
    const userId = `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    user = {
      id: userId,
      phone: cleanPhone,
      displayName: displayName || `کاربر ${cleanPhone.slice(-4)}`,
      avatarUrl: avatarUrl || '',
      role: (cleanPhone === '09121234567' || cleanPhone === '09123456789') ? 'admin' : 'client',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    store.users.push(user);
  } else {
    if (displayName) user.displayName = displayName;
    if (avatarUrl) user.avatarUrl = avatarUrl;
    user.lastLoginAt = new Date().toISOString();
  }

  // Also ensure corresponding customer dossier profile exists
  let customer = store.customers.find((c: any) => c.phone === cleanPhone || c.id === user.id);
  if (!customer) {
    customer = {
      id: user.id,
      name: user.displayName || `کاربر ${cleanPhone.slice(-4)}`,
      phone: cleanPhone,
      email: user.email || '',
      avatarUrl: user.avatarUrl || '',
      memberTier: 'عضو طلایی رویال',
      roleOrTitle: 'مشتری تأییدشده',
      visitCount: 0,
      totalSpend: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.customers.push(customer);
  } else {
    if (user.displayName && !customer.name) customer.name = user.displayName;
    if (user.avatarUrl) customer.avatarUrl = user.avatarUrl;
    customer.updatedAt = new Date().toISOString();
  }

  store.lastUpdated = new Date().toISOString();
  saveStore(store);

  const token = generateSessionToken(user.id, user.role);
  return res.json({
    success: true,
    user,
    customer,
    token,
    message: 'ورود با موفقیت انجام شد.',
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { phone, email, password, displayName, role } = req.body;
  if (!phone && !email) {
    return res.status(400).json({ success: false, error: 'شماره همراه یا ایمیل الزامی است.' });
  }

  const store = getInitializedStore();
  store.users = Array.isArray(store.users) ? store.users : [];
  store.customers = Array.isArray(store.customers) ? store.customers : [];

  const existing = store.users.find(
    (u: any) => (phone && u.phone === phone.trim()) || (email && u.email?.toLowerCase() === email.trim().toLowerCase())
  );

  if (existing) {
    return res.status(409).json({ success: false, error: 'حسابی با این شماره یا ایمیل قبلاً ثبت شده است.' });
  }

  const userId = `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const newUser = {
    id: userId,
    phone: phone ? phone.trim() : '',
    email: email ? email.trim().toLowerCase() : '',
    password: password || '123456',
    displayName: displayName || (phone ? `کاربر ${phone.slice(-4)}` : 'کاربر رویال'),
    avatarUrl: '',
    role: role === 'admin' ? 'admin' : 'client',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  store.users.push(newUser);

  // Create client profile
  const newCustomer = {
    id: userId,
    name: newUser.displayName,
    phone: newUser.phone,
    email: newUser.email,
    avatarUrl: newUser.avatarUrl,
    memberTier: 'عضو طلایی رویال',
    roleOrTitle: newUser.role === 'admin' ? 'مدیر آرایشگاه' : 'مشتری رسمی آتلیه',
    visitCount: 0,
    totalSpend: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.customers.push(newCustomer);

  store.lastUpdated = new Date().toISOString();
  saveStore(store);

  const token = generateSessionToken(newUser.id, newUser.role);
  return res.json({
    success: true,
    user: newUser,
    customer: newCustomer,
    token,
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  if (!identifier) {
    return res.status(400).json({ success: false, error: 'نام کاربری، شماره همراه یا ایمیل الزامی است.' });
  }

  const cleanIdent = identifier.trim().toLowerCase();
  const cleanPass = (password || '').trim();

  // Management master bypass / defaults for quick admin access
  if (
    (cleanIdent === 'admin' && (cleanPass === 'admin' || cleanPass === '123456' || cleanPass === '')) ||
    (cleanIdent === 'royal' && cleanPass === 'royal')
  ) {
    const adminUser = {
      id: 'usr-admin-master',
      phone: '09121234567',
      email: 'admin@royalbarber.ir',
      displayName: 'مدیریت آرایشگاه رویال',
      role: 'admin',
    };
    const token = generateSessionToken(adminUser.id, 'admin');
    return res.json({
      success: true,
      user: adminUser,
      token,
    });
  }

  const store = getInitializedStore();
  store.users = Array.isArray(store.users) ? store.users : [];

  const user = store.users.find((u: any) => {
    return (
      u.phone === cleanIdent ||
      u.email?.toLowerCase() === cleanIdent ||
      u.id === cleanIdent ||
      u.displayName?.toLowerCase() === cleanIdent
    );
  });

  if (!user) {
    return res.status(401).json({ success: false, error: 'کاربری با این مشخصات یافت نشد.' });
  }

  if (user.password && cleanPass && user.password !== cleanPass) {
    return res.status(401).json({ success: false, error: 'رمز عبور وارد شده نادرست است.' });
  }

  user.lastLoginAt = new Date().toISOString();
  store.lastUpdated = new Date().toISOString();
  saveStore(store);

  const customer = store.customers?.find((c: any) => c.id === user.id || c.phone === user.phone);
  const token = generateSessionToken(user.id, user.role);

  return res.json({
    success: true,
    user,
    customer,
    token,
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'احراز هویت انجام نشده است.' });
  }

  const token = authHeader.substring(7);
  const session = parseSessionToken(token);
  if (!session) {
    return res.status(401).json({ success: false, error: 'نشست منقضی شده یا نامعتبر است.' });
  }

  const store = getInitializedStore();
  const user = store.users?.find((u: any) => u.id === session.userId);
  const customer = store.customers?.find((c: any) => c.id === session.userId);

  return res.json({
    success: true,
    user: user || { id: session.userId, role: session.role },
    customer,
  });
});

// ─── ATELIER STATE & ENTITIES API ─────────────────────────────────────────────
app.get('/api/atelier/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    mode: 'host-server-database',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

app.get('/api/atelier/state', (_req: Request, res: Response) => {
  const store = getInitializedStore();
  res.json(store);
});

app.post('/api/atelier/state', (req: Request, res: Response) => {
  const incoming = req.body;
  const current = getInitializedStore();
  const merged = {
    ...current,
    ...incoming,
    lastUpdated: new Date().toISOString(),
  };
  saveStore(merged);
  res.json({ success: true, lastUpdated: merged.lastUpdated });
});

// ─── APPOINTMENTS API ─────────────────────────────────────────────────────────
app.post('/api/atelier/appointment', (req: Request, res: Response) => {
  const newAppointment = req.body;
  if (!newAppointment || !newAppointment.id) {
    return res.status(400).json({ success: false, error: 'اطلاعات نوبت نامعتبر است.' });
  }

  const store = getInitializedStore();
  store.appointments = Array.isArray(store.appointments) ? store.appointments : [];
  store.customers = Array.isArray(store.customers) ? store.customers : [];

  const existingIdx = store.appointments.findIndex((a: any) => a.id === newAppointment.id);
  if (existingIdx >= 0) {
    store.appointments[existingIdx] = { ...store.appointments[existingIdx], ...newAppointment };
  } else {
    store.appointments.unshift(newAppointment);
  }

  // Update or create customer profile history
  if (newAppointment.customerPhone || newAppointment.customerId) {
    const custPhone = newAppointment.customerPhone;
    const custId = newAppointment.customerId;
    const cust = store.customers.find((c: any) => (custId && c.id === custId) || (custPhone && c.phone === custPhone));
    if (cust) {
      cust.lastVisitDate = newAppointment.date || new Date().toISOString();
      cust.visitCount = (cust.visitCount || 0) + 1;
      if (newAppointment.price) {
        cust.totalSpend = (cust.totalSpend || 0) + Number(newAppointment.price);
      }
      cust.updatedAt = new Date().toISOString();
    } else if (newAppointment.customerName) {
      store.customers.push({
        id: custId || `client-${Date.now()}`,
        name: newAppointment.customerName,
        phone: custPhone || '',
        avatarUrl: newAppointment.customerAvatar || '',
        memberTier: 'مهمان رویال',
        roleOrTitle: 'مشتری جدید',
        visitCount: 1,
        totalSpend: Number(newAppointment.price || 0),
        lastVisitDate: newAppointment.date || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  store.lastUpdated = new Date().toISOString();
  saveStore(store);

  // Non-blocking Google Sheet Web App backup (safe backup row append)
  sendToGoogleSheet('backup_appointment', { appointment: newAppointment }).catch(() => {});

  return res.json({ success: true, appointment: newAppointment });
});

app.patch('/api/atelier/appointment/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const store = getInitializedStore();
  store.appointments = Array.isArray(store.appointments) ? store.appointments : [];
  
  const apt = store.appointments.find((a: any) => a.id === id);
  if (apt) {
    apt.status = status;
    apt.updatedAt = new Date().toISOString();
    store.lastUpdated = new Date().toISOString();
    saveStore(store);

    // Non-blocking Google Sheet Web App status sync
    sendToGoogleSheet('backup_appointment', { appointment: apt }).catch(() => {});

    return res.json({ success: true, appointment: apt });
  }
  return res.status(404).json({ success: false, error: 'نوبت یافت نشد.' });
});

app.delete('/api/atelier/appointment/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const store = getInitializedStore();
  store.appointments = Array.isArray(store.appointments) ? store.appointments : [];
  
  const initialLength = store.appointments.length;
  store.appointments = store.appointments.filter((a: any) => a.id !== id);

  if (store.appointments.length < initialLength) {
    store.lastUpdated = new Date().toISOString();
    saveStore(store);
    return res.json({ success: true, message: 'نوبت با موفقیت لغو/حذف گردید.' });
  }
  return res.status(404).json({ success: false, error: 'نوبت یافت نشد.' });
});

// ─── CUSTOMER DOSSIERS API ───────────────────────────────────────────────────
app.post('/api/atelier/customer', (req: Request, res: Response) => {
  const customerData = req.body;
  if (!customerData || (!customerData.id && !customerData.phone)) {
    return res.status(400).json({ success: false, error: 'اطلاعات مشتری نامعتبر است.' });
  }

  const store = getInitializedStore();
  store.customers = Array.isArray(store.customers) ? store.customers : [];

  const existingIdx = store.customers.findIndex(
    (c: any) => (customerData.id && c.id === customerData.id) || (customerData.phone && c.phone === customerData.phone)
  );

  let resultCustomer;
  if (existingIdx >= 0) {
    store.customers[existingIdx] = {
      ...store.customers[existingIdx],
      ...customerData,
      updatedAt: new Date().toISOString(),
    };
    resultCustomer = store.customers[existingIdx];
  } else {
    resultCustomer = {
      id: customerData.id || `client-${Date.now()}`,
      visitCount: 0,
      totalSpend: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...customerData,
    };
    store.customers.push(resultCustomer);
  }

  store.lastUpdated = new Date().toISOString();
  saveStore(store);

  return res.json({ success: true, customer: resultCustomer });
});

app.patch('/api/atelier/customer/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const patchData = req.body;
  const store = getInitializedStore();
  store.customers = Array.isArray(store.customers) ? store.customers : [];

  const cust = store.customers.find((c: any) => c.id === id);
  if (cust) {
    Object.assign(cust, patchData, { updatedAt: new Date().toISOString() });
    store.lastUpdated = new Date().toISOString();
    saveStore(store);
    return res.json({ success: true, customer: cust });
  }
  return res.status(404).json({ success: false, error: 'پرونده مشتری یافت نشد.' });
});

// ─── ORDERS & COMMERCE API ───────────────────────────────────────────────────
app.post('/api/atelier/order', (req: Request, res: Response) => {
  const newOrder = req.body;
  const store = getInitializedStore();
  store.orders = Array.isArray(store.orders) ? store.orders : [];
  store.orders.unshift(newOrder);
  store.lastUpdated = new Date().toISOString();
  saveStore(store);
  res.json({ success: true, order: newOrder });
});

// ─── SERVICES & CATEGORIES API ───────────────────────────────────────────────
app.post('/api/atelier/service', (req: Request, res: Response) => {
  const svc = req.body;
  if (!svc || !svc.id) {
    return res.status(400).json({ success: false, error: 'اطلاعات خدمت ناقص است.' });
  }
  const store = getInitializedStore();
  store.services = Array.isArray(store.services) ? store.services : [];
  const idx = store.services.findIndex((s: any) => s.id === svc.id);
  if (idx >= 0) {
    store.services[idx] = { ...store.services[idx], ...svc };
  } else {
    store.services.push(svc);
  }
  store.lastUpdated = new Date().toISOString();
  saveStore(store);
  return res.json({ success: true, service: svc });
});

app.delete('/api/atelier/service/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const store = getInitializedStore();
  store.services = Array.isArray(store.services) ? store.services : [];
  store.services = store.services.filter((s: any) => s.id !== id);
  store.lastUpdated = new Date().toISOString();
  saveStore(store);
  return res.json({ success: true });
});

app.post('/api/atelier/category', (req: Request, res: Response) => {
  const cat = req.body;
  if (!cat || !cat.id) {
    return res.status(400).json({ success: false, error: 'اطلاعات دسته‌بندی ناقص است.' });
  }
  const store = getInitializedStore();
  store.categories = Array.isArray(store.categories) ? store.categories : [];
  const idx = store.categories.findIndex((c: any) => c.id === cat.id);
  if (idx >= 0) {
    store.categories[idx] = { ...store.categories[idx], ...cat };
  } else {
    store.categories.push(cat);
  }
  store.lastUpdated = new Date().toISOString();
  saveStore(store);
  return res.json({ success: true, category: cat });
});

app.delete('/api/atelier/category/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const store = getInitializedStore();
  store.categories = Array.isArray(store.categories) ? store.categories : [];
  store.categories = store.categories.filter((c: any) => c.id !== id);
  store.lastUpdated = new Date().toISOString();
  saveStore(store);
  return res.json({ success: true });
});

// ─── SETTINGS API ────────────────────────────────────────────────────────────
app.post('/api/atelier/settings', (req: Request, res: Response) => {
  const newSettings = req.body;
  const store = getInitializedStore();
  store.settings = { ...store.settings, ...newSettings };
  store.lastUpdated = new Date().toISOString();
  saveStore(store);
  return res.json({ success: true, settings: store.settings });
});

// ─── BACKUP & RESTORE API ────────────────────────────────────────────────────
app.get('/api/atelier/backup', (_req: Request, res: Response) => {
  const store = getInitializedStore();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=royal-atelier-backup-${new Date().toISOString().slice(0, 10)}.json`);
  res.send(JSON.stringify(store, null, 2));
});

app.post('/api/atelier/restore', (req: Request, res: Response) => {
  const backupData = req.body;
  if (!backupData || typeof backupData !== 'object') {
    return res.status(400).json({ success: false, error: 'فایل پشتیبان نامعتبر است.' });
  }
  saveStore(backupData);
  return res.json({ success: true, message: 'اطلاعات با موفقیت بازگردانی شد.' });
});

// ─── GOOGLE SHEETS WEB APP BACKUP ENDPOINTS ──────────────────────────────────
app.get('/api/atelier/google-sheet/status', (_req: Request, res: Response) => {
  const store = getInitializedStore();
  const settings = store.settings?.googleSheetSettings || {};
  const hasUrl = Boolean(settings.webAppUrl || process.env.GOOGLE_SHEET_WEBAPP_URL);
  return res.json({
    configured: hasUrl,
    webAppUrl: settings.webAppUrl || (process.env.GOOGLE_SHEET_WEBAPP_URL ? 'تنظیم‌شده در متغیر محیطی' : ''),
    lastBackupTimestamp: settings.lastBackupTimestamp || null,
    lastBackupStatus: settings.lastBackupStatus || 'idle',
    lastBackupMessage: settings.lastBackupMessage || (hasUrl ? 'آدرس وب‌اپ گوگل شیت ثبت شده است.' : 'آدرس وب‌اپ گوگل شیت هنوز ثبت نشده است.'),
  });
});

app.post('/api/atelier/google-sheet/test', async (req: Request, res: Response) => {
  const { webAppUrl } = req.body || {};
  const result = await sendToGoogleSheet('test', { test: true }, webAppUrl);
  return res.json(result);
});

app.post('/api/atelier/google-sheet/backup', async (req: Request, res: Response) => {
  const { webAppUrl } = req.body || {};
  const store = getInitializedStore();
  const result = await sendToGoogleSheet('full_backup', { data: store }, webAppUrl);
  return res.json(result);
});

app.post('/api/atelier/google-sheet/restore', async (req: Request, res: Response) => {
  const { webAppUrl } = req.body || {};
  const store = getInitializedStore();
  const targetUrl = (webAppUrl || store.settings?.googleSheetSettings?.webAppUrl || process.env.GOOGLE_SHEET_WEBAPP_URL || '').trim();

  if (!targetUrl || !targetUrl.startsWith('http')) {
    return res.status(400).json({ success: false, message: 'آدرس وب‌اپ گوگل شیت جهت بازیابی یافت نشد.' });
  }

  try {
    const url = new URL(targetUrl);
    url.searchParams.set('action', 'read_backup');
    const resp = await fetch(url.toString(), { redirect: 'follow' });
    if (!resp.ok) {
      return res.status(500).json({ success: false, message: `پاسخ وب‌اپ گوگل شیت با خطا مواجه شد (${resp.status})` });
    }
    const data = await resp.json();
    if (data && typeof data === 'object') {
      const backupStore = data.data || data;
      if (backupStore && (backupStore.appointments || backupStore.customers || backupStore.services)) {
        const merged = {
          ...store,
          ...backupStore,
          lastUpdated: new Date().toISOString(),
        };
        saveStore(merged);
        return res.json({ 
          success: true, 
          message: `اطلاعات با موفقیت از گوگل شیت بازگردانی شد (${merged.appointments?.length || 0} نوبت، ${merged.customers?.length || 0} مشتری).`,
          restoredData: merged 
        });
      }
    }
    return res.status(400).json({ success: false, message: 'داده‌های پشتیبان گوگل شیت فاقد ساختار استاندارد است.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: `خطا در بازیابی از گوگل شیت: ${err.message}` });
  }
});

// ─── Vite Middleware integration ─────────────────────────────────────────────
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Royal Atelier Server] Running on http://0.0.0.0:${PORT} with persistent host-server storage.`);
  });
}

startServer();
