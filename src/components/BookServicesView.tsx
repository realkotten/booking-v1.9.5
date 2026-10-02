import React, { useMemo, useState } from 'react';
import { AtelierShell } from './AtelierShell';
import { useAtelier } from '../store/AtelierContext';
import { Accoutrement, Service } from '../types';
import { PriceSummary } from './booking/PriceSummary';
import { PriceDisplay } from './common/PriceDisplay';
import { formatDuration, formatPrice } from '../utils/formatUtils';
import { toPersianDigits } from '../utils/dateUtils';
import { hapticLight, hapticSelection } from '../utils/hapticUtils';
import { Check, Clock, Gift, Plus, Sparkles, User, ShieldCheck } from 'lucide-react';
import { SpatialTilt } from './common/SpatialTilt';

interface BookServicesViewProps {
  selectedService: Service | null;
  onSelectService: (service: Service) => void;
  accoutrements: Accoutrement[];
  onToggleAccoutrement: (id: string) => void;
  onContinue: () => void;
  onOpenProfile?: () => void;
}

export const BookServicesView: React.FC<BookServicesViewProps> = ({
  selectedService,
  onSelectService,
  accoutrements,
  onToggleAccoutrement,
  onContinue,
  onOpenProfile,
}) => {
  const { servicesByCategory, categories, activeServices, activeChair, activeBarber, settings } = useAtelier();
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const barberName = settings?.profile?.masterName?.trim() || activeBarber?.name || 'استاد پیرایش';

  // Filter categories that have active services
  const populatedCategories = useMemo(() => {
    return categories
      .filter((c) => c.isActive)
      .filter((c) => activeServices.some((s) => s.categoryId === c.id));
  }, [categories, activeServices]);

  const displayedGroups = useMemo(() => {
    if (selectedCatId === 'all') {
      return servicesByCategory
        .map((group) => ({
          ...group,
          items: group.items.filter((s) => s.isActive),
        }))
        .filter((group) => group.items.length > 0);
    }
    return servicesByCategory
      .filter((g) => g.category.id === selectedCatId)
      .map((group) => ({
        ...group,
        items: group.items.filter((s) => s.isActive),
      }))
      .filter((group) => group.items.length > 0);
  }, [servicesByCategory, selectedCatId]);

  // Active accoutrements available for customer booking
  const activeAccoutrements = useMemo(() => {
    return accoutrements.filter((a) => a.isActive !== false);
  }, [accoutrements]);

  const selectedAccoutrementsCount = useMemo(() => {
    return accoutrements.filter((a) => a.selected).length;
  }, [accoutrements]);

  return (
    <AtelierShell id="book-services-container">
      {/* Top Header */}
      <header
        id="services-header"
        className="relative z-30 flex shrink-0 items-center justify-between px-6 pt-1"
        dir="rtl"
      >
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-[10px] font-medium text-stone-600">
            {activeChair?.name || 'سوئیت اختصاصی رویال'}
          </span>
        </div>

        <div className="text-center">
          <span className="block text-[9px] font-bold text-[#bf5938]">مرحله اول</span>
          <h1 className="font-serif text-sm font-bold text-stone-900">
            انتخاب خدمات و مراقبت‌ها
          </h1>
        </div>

        {onOpenProfile ? (
          <button
            type="button"
            onClick={onOpenProfile}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white bg-white/80 shadow-2xs transition-transform active:scale-95"
            title="پروفایل کاربری"
          >
            <User className="h-4 w-4 text-stone-700" />
          </button>
        ) : (
          <div className="h-8 w-8" />
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 pb-36 pt-3" dir="rtl">
        {/* Section 1: Main Services Header & Category Pills */}
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-xs font-black text-stone-900">۱. انتخاب خدمت اصلی</span>
          <span className="text-[10px] text-stone-500">
            {selectedService ? `انتخاب شده: ${selectedService.name}` : 'یک خدمت را انتخاب فرمایید'}
          </span>
        </div>

        {/* Category Pills Filter */}
        <div className="no-scrollbar mb-3.5 flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => {
              hapticLight();
              setSelectedCatId('all');
            }}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              selectedCatId === 'all'
                ? 'tactile-tile-3d-active'
                : 'tactile-tile-3d text-stone-700'
            }`}
          >
            همه خدمات ({toPersianDigits(activeServices.length)})
          </button>
          {populatedCategories.map((c) => {
            const count = activeServices.filter((s) => s.categoryId === c.id).length;
            const isCatActive = selectedCatId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  hapticLight();
                  setSelectedCatId(c.id);
                }}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  isCatActive
                    ? 'tactile-tile-3d-active'
                    : 'tactile-tile-3d text-stone-700'
                }`}
              >
                {c.name} ({toPersianDigits(count)})
              </button>
            );
          })}
        </div>

        {/* Services Grouped by Category */}
        <div className="space-y-4">
          {displayedGroups.length === 0 ? (
            <div className="rounded-2xl clay-card-subtle p-6 text-center">
              <p className="text-xs text-stone-500">خدمت فعالی در این دسته‌بندی وجود ندارد</p>
            </div>
          ) : (
            displayedGroups.map(({ category, items }) => (
              <section key={category.id} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-bold text-stone-700">{category.name}</h2>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {toPersianDigits(items.length)} گزینه
                  </span>
                </div>

                <div className="space-y-2.5">
                  {items.map((s) => {
                    const isSelected = selectedService?.id === s.id;
                    return (
                      <SpatialTilt
                        key={s.id}
                        as="button"
                        maxTilt={7}
                        glareOpacity={0.38}
                        scaleOnHover={1.018}
                        onClick={() => {
                          hapticSelection();
                          onSelectService(s);
                        }}
                        className={`w-full min-h-[92px] shrink-0 rounded-[24px] p-3.5 text-right transition-colors cursor-pointer ${
                          isSelected
                            ? 'apple-glass-card ring-2 ring-[#bf5938] shadow-[0_8px_20px_-4px_rgba(191,89,56,0.2),inset_0_1px_2px_rgba(255,255,255,1)]'
                            : 'apple-glass-card'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 w-full">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-stone-900" style={{ fontFamily: '"Vazirmatn", sans-serif' }}>{s.name}</span>
                              {s.tag && (
                                <span className="shrink-0 rounded-full bg-[#fdf2ee] border border-[#f3d0c4] px-2 py-0.5 text-[9px] font-bold text-[#bf5938] shadow-2xs">
                                  {s.tag}
                                </span>
                              )}
                            </div>
                            {s.description && (
                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-600 font-medium">
                                {s.description}
                              </p>
                            )}
                            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-700 min-h-[22px]">
                              <span className="flex items-center gap-1 font-medium shrink-0">
                                <Clock className="h-3.5 w-3.5 text-stone-500 shrink-0" />
                                {formatDuration(s.durationMinutes)}
                              </span>
                              <PriceDisplay service={s} size="sm" className="shrink-0" />
                            </div>
                          </div>

                          <div
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all mt-0.5 ${
                              isSelected
                                ? 'bg-[#bf5938] text-white shadow-xs'
                                : 'tactile-tile-3d text-transparent'
                            }`}
                          >
                            {isSelected && <Check className="h-3.5 w-3.5" />}
                          </div>
                        </div>
                      </SpatialTilt>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>

        {/* Section 2: Integrated Additional Services (Accoutrements) */}
        {activeAccoutrements.length > 0 && (
          <div className="mt-6 pt-5 border-t border-stone-200/70 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="flex items-center gap-1.5 text-xs font-black text-stone-900">
                  <Sparkles className="h-4 w-4 text-[#bf5938]" />
                  <span>۲. افزودن خدمات تکمیلی و مراقبتی (اختیاری)</span>
                </h3>
                <p className="text-[11px] text-stone-600 mt-0.5 font-medium">
                  می‌توانید هر تعداد خدمت مکمل و اسپا را همزمان به نوبت خود بیفزایید.
                </p>
              </div>
              {selectedAccoutrementsCount > 0 && (
                <span className="shrink-0 rounded-full bg-[#fdf2ee] border border-[#f3d0c4] px-2.5 py-0.5 text-[10px] font-black text-[#bf5938] shadow-2xs">
                  {toPersianDigits(selectedAccoutrementsCount)} مورد انتخاب شد
                </span>
              )}
            </div>

            <div className="space-y-2">
              {activeAccoutrements.map((acc) => {
                const isSelected = Boolean(acc.selected);
                return (
                  <SpatialTilt
                    key={acc.id}
                    as="button"
                    maxTilt={6}
                    glareOpacity={0.3}
                    scaleOnHover={1.015}
                    onClick={() => {
                      hapticSelection();
                      onToggleAccoutrement(acc.id);
                    }}
                    className={`w-full rounded-[22px] p-3 text-right transition-colors cursor-pointer ${
                      isSelected
                        ? 'apple-glass-card ring-2 ring-[#bf5938] shadow-[0_8px_20px_-4px_rgba(191,89,56,0.2),inset_0_1px_2px_rgba(255,255,255,1)]'
                        : 'apple-glass-subtle'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-900">{acc.name}</span>
                          {acc.tag && (
                            <span className="rounded-full bg-[#fdf2ee] border border-[#f3d0c4] px-2 py-0.5 text-[9px] font-bold text-[#bf5938] shadow-2xs">
                              {acc.tag}
                            </span>
                          )}
                          <span className="rounded-full clay-pill-3d px-2 py-0.5 text-[9px] font-bold text-stone-700">
                            +{toPersianDigits(acc.durationMinutes)} دقیقه
                          </span>
                        </div>

                        {acc.description && (
                          <p className="mt-1 line-clamp-1 text-xs text-stone-500">
                            {acc.description}
                          </p>
                        )}

                        <div className="mt-1.5 flex items-center gap-2">
                          {acc.isComplimentary ? (
                            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600">
                              <Gift className="h-3 w-3" />
                              رایگان (هدیه سالن)
                            </span>
                          ) : (
                            <span className="text-xs font-black text-stone-900">
                              {formatPrice(acc.price)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all ${
                          isSelected
                            ? 'border-[#bf5938] bg-[#bf5938] text-white shadow-2xs'
                            : 'border-stone-300 bg-white/80 text-stone-400'
                        }`}
                      >
                        {isSelected ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                      </div>
                    </div>
                  </SpatialTilt>
                );
              })}
            </div>
          </div>
        )}

        {/* Assurance Banner */}
        <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/80 bg-white/60 p-2.5 text-[10px] text-stone-600 backdrop-blur-md shadow-2xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#bf5938]" />
            <span>مدت زمان نوبت بر اساس کلیه خدمات انتخابی به طور هوشمند محاسبه می‌شود</span>
          </div>
        </div>
      </main>

      {/* Floating Live Price Summary */}
      <PriceSummary
        service={selectedService}
        accoutrements={accoutrements}
        ctaLabel={
          selectedService
            ? selectedAccoutrementsCount > 0
              ? 'تأیید و انتخاب زمان نوبت'
              : 'ادامه به انتخاب زمان نوبت'
            : 'انتخاب خدمت اصلی'
        }
        onCta={onContinue}
        ctaDisabled={!selectedService}
        disabledHint="لطفاً ابتدا یک خدمت اصلی را انتخاب کنید"
      />
    </AtelierShell>
  );
};

