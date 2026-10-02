import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActionResult, Service, ServiceCategory, ServiceInput } from '../types';
import { toPersianDigits } from '../utils/dateUtils';
import { uid } from '../utils/bookingUtils';

const SERVICES_KEY = 'royal:services:v1';
const CATEGORIES_KEY = 'royal:categories:v1';

const SEED_CATEGORIES: ServiceCategory[] = [
  { id: 'cat-hair',  name: 'اصلاح مو',       sortOrder: 0, isActive: true },
  { id: 'cat-beard', name: 'اصلاح صورت',     sortOrder: 1, isActive: true },
  { id: 'cat-color', name: 'رنگ و لایت',     sortOrder: 2, isActive: true },
  { id: 'cat-skin',  name: 'پوست و درمان',   sortOrder: 3, isActive: true },
  { id: 'cat-combo', name: 'پکیج‌های ترکیبی', sortOrder: 4, isActive: true },
];

const SEED_SERVICES: Service[] = [
  { id: 'svc-1', categoryId: 'cat-hair',  name: 'اصلاح موی کلاسیک',      price: 220000, realPrice: 260000, discountedPrice: 220000, durationMinutes: 45,  isActive: true, sortOrder: 0 },
  { id: 'svc-2', categoryId: 'cat-hair',  name: 'کوتاهی فید / اسکین‌فید', price: 300000, realPrice: 300000, durationMinutes: 45,  isActive: true, sortOrder: 1 },
  { id: 'svc-3', categoryId: 'cat-beard', name: 'اصلاح ریش و خط ریش',    price: 130000, realPrice: 160000, discountedPrice: 130000, durationMinutes: 30,  isActive: true, sortOrder: 0 },
  { id: 'svc-4', categoryId: 'cat-beard', name: 'اصلاح صورت با تیغ داغ', price: 200000, realPrice: 200000, durationMinutes: 30,  isActive: true, sortOrder: 1 },
  { id: 'svc-5', categoryId: 'cat-color', name: 'رنگ موی کامل',          price: 1200000, realPrice: 1200000, durationMinutes: 120, isActive: true, sortOrder: 0 },
  { id: 'svc-6', categoryId: 'cat-color', name: 'لایت و دکلره',          price: 1800000, realPrice: 1800000, durationMinutes: 180, isActive: true, sortOrder: 1 },
  { id: 'svc-7', categoryId: 'cat-skin',  name: 'پاکسازی پوست صورت',     price: 800000, realPrice: 800000, durationMinutes: 60,  isActive: true, sortOrder: 0 },
  { id: 'svc-8', categoryId: 'cat-combo', name: 'پکیج VIP دامادی رویال',  price: 3800000, realPrice: 4500000, discountedPrice: 3800000, durationMinutes: 240, isActive: true, sortOrder: 0 },
];

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export function useServiceCatalog() {
  const [categories, setCategories] = useState<ServiceCategory[]>(() =>
    readJson(CATEGORIES_KEY, SEED_CATEGORIES)
  );
  const [services, setServices] = useState<Service[]>(() =>
    readJson(SERVICES_KEY, SEED_SERVICES)
  );

  useEffect(() => {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
  }, [services]);

  // ── Categories ────────────────────────────────────────────────
  const addCategory = useCallback((name: string): ActionResult => {
    const trimmed = name.trim();
    if (trimmed.length < 2) return { success: false, message: 'نام دسته‌بندی باید حداقل ۲ حرف باشد' };
    if (categories.some((c) => c.name === trimmed))
      return { success: false, message: 'دسته‌بندی با این نام وجود دارد' };
    setCategories((prev) => [...prev, { id: uid(), name: trimmed, sortOrder: prev.length, isActive: true }]);
    return { success: true };
  }, [categories]);

  const updateCategory = useCallback((id: string, patch: Partial<ServiceCategory>): ActionResult => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    return { success: true };
  }, []);

  const deleteCategory = useCallback((id: string): ActionResult => {
    const count = services.filter((s) => s.categoryId === id).length;
    if (count > 0) {
      return {
        success: false,
        message: `این دسته‌بندی ${toPersianDigits(count)} خدمت دارد. ابتدا آن‌ها را حذف یا جابه‌جا کنید.`,
      };
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    return { success: true };
  }, [services]);

  // ── Reorder: categories ───────────────────────────────────────
  const moveCategory = useCallback((id: string, direction: 'up' | 'down') => {
    setCategories((prev) => {
      const sorted = [...prev].sort((a, b) => a.sortOrder - b.sortOrder);
      const idx = sorted.findIndex((c) => c.id === id);
      const swapWith = direction === 'up' ? idx - 1 : idx + 1;
      if (idx === -1 || swapWith < 0 || swapWith >= sorted.length) return prev;
      [sorted[idx], sorted[swapWith]] = [sorted[swapWith], sorted[idx]];
      return sorted.map((c, i) => ({ ...c, sortOrder: i }));
    });
  }, []);

  const reorderCategories = useCallback((orderedIds: string[]) => {
    setCategories((prev) => {
      const map = new Map(orderedIds.map((id, i) => [id, i] as const));
      return prev.map((c) => (map.has(c.id) ? { ...c, sortOrder: map.get(c.id)! } : c));
    });
  }, []);

  // ── Services ──────────────────────────────────────────────────
  const validate = (input: ServiceInput, all: Service[], editingId?: string): ActionResult => {
    const name = input.name.trim();
    if (name.length < 2) return { success: false, message: 'نام خدمت باید حداقل ۲ حرف باشد' };
    if (!input.categoryId) return { success: false, message: 'انتخاب دسته‌بندی الزامی است' };
    
    const realPrice = input.realPrice ?? input.price;
    if (!Number.isFinite(realPrice) || realPrice <= 0) {
      return { success: false, message: 'قیمت اصلی خدمت باید عددی بزرگتر از صفر باشد' };
    }

    if (input.discountedPrice !== undefined && input.discountedPrice > 0) {
      if (input.discountedPrice >= realPrice) {
        return { success: false, message: 'قیمت با تخفیف باید کمتر از قیمت اصلی باشد' };
      }
    }

    if (!Number.isFinite(input.durationMinutes) || input.durationMinutes < 5)
      return { success: false, message: 'مدت زمان باید حداقل ۵ دقیقه باشد' };
    if (all.some((s) => s.id !== editingId && s.name === name && s.categoryId === input.categoryId))
      return { success: false, message: 'خدمتی با این نام در این دسته‌بندی وجود دارد' };
    return { success: true };
  };

  const normalizeServiceInput = (input: ServiceInput): ServiceInput => {
    const realPrice = Math.round(input.realPrice ?? input.price);
    const hasValidDiscount =
      input.discountedPrice !== undefined &&
      input.discountedPrice > 0 &&
      input.discountedPrice < realPrice;

    const discountedPrice = hasValidDiscount ? Math.round(input.discountedPrice!) : undefined;
    const effectivePrice = hasValidDiscount ? discountedPrice! : realPrice;

    return {
      ...input,
      name: input.name.trim(),
      price: effectivePrice,
      realPrice,
      discountedPrice,
      durationMinutes: Math.round(input.durationMinutes),
      description: input.description?.trim(),
    };
  };

  const addService = useCallback((input: ServiceInput): ActionResult => {
    const result = validate(input, services);
    if (!result.success) return result;
    const normalized = normalizeServiceInput(input);
    setServices((prev) => {
      const siblingCount = prev.filter((s) => s.categoryId === input.categoryId).length;
      return [...prev, { ...normalized, id: uid(), sortOrder: siblingCount }];
    });
    return { success: true };
  }, [services]);

  const updateService = useCallback((id: string, patch: Partial<ServiceInput>): ActionResult => {
    const target = services.find((s) => s.id === id);
    if (!target) return { success: false, message: 'خدمت یافت نشد' };
    const merged = { ...target, ...patch } as Service;
    const result = validate(merged as ServiceInput, services, id);
    if (!result.success) return result;
    const normalized = normalizeServiceInput(merged as ServiceInput);
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...normalized } : s)));
    return { success: true };
  }, [services]);

  const deleteService = useCallback((id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const toggleServiceActive = useCallback((id: string) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s)));
  }, []);

  // ── Reorder: services (within their own category) ─────────────
  const moveService = useCallback((id: string, direction: 'up' | 'down') => {
    setServices((prev) => {
      const svc = prev.find((s) => s.id === id);
      if (!svc) return prev;
      const siblings = prev
        .filter((s) => s.categoryId === svc.categoryId)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      const idx = siblings.findIndex((s) => s.id === id);
      const swapWith = direction === 'up' ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= siblings.length) return prev;
      [siblings[idx], siblings[swapWith]] = [siblings[swapWith], siblings[idx]];
      const orderMap = new Map(siblings.map((s, i) => [s.id, i] as const));
      return prev.map((s) => (orderMap.has(s.id) ? { ...s, sortOrder: orderMap.get(s.id)! } : s));
    });
  }, []);

  const reorderServices = useCallback((categoryId: string, orderedIds: string[]) => {
    setServices((prev) => {
      const map = new Map(orderedIds.map((id, i) => [id, i] as const));
      return prev.map((s) =>
        s.categoryId === categoryId && map.has(s.id) ? { ...s, sortOrder: map.get(s.id)! } : s
      );
    });
  }, []);

  // ── Derived ───────────────────────────────────────────────────
  const activeServices = useMemo(() => services.filter((s) => s.isActive), [services]);

  const servicesByCategory = useMemo(
    () =>
      categories
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((category) => ({
          category,
          items: services
            .filter((s) => s.categoryId === category.id)
            .sort((a, b) => a.sortOrder - b.sortOrder),
        })),
    [categories, services]
  );

  return {
    categories, services, activeServices, servicesByCategory,
    addCategory, updateCategory, deleteCategory, moveCategory, reorderCategories,
    addService, updateService, deleteService, toggleServiceActive, moveService, reorderServices,
    setServices, setCategories,
  };
}
