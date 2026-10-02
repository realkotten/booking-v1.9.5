import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle, ChevronDown, ChevronUp, Clock, GripVertical, Pencil, Plus, Power, Trash2,
} from 'lucide-react';
import { Service, ServiceCategory } from '../../types';
import { useAtelier } from '../../store/AtelierContext';
import { useDragList } from '../../hooks/useDragList';
import { formatDuration, formatPrice } from '../../utils/formatUtils';
import { toPersianDigits } from '../../utils/dateUtils';

interface CategorySectionProps {
  category: ServiceCategory;
  onToast: (msg: string) => void;
  onAddService: (categoryId: string) => void;
  onEditService: (service: Service) => void;
  onEditCategory: (category: ServiceCategory) => void;
  onDeleteCategory: (category: ServiceCategory) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  category, onToast, onAddService, onEditService, onEditCategory, onDeleteCategory,
}) => {
  const { services, moveService, reorderServices, toggleServiceActive, deleteService } = useAtelier();
  const [collapsed, setCollapsed] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Service | null>(null);

  const items = useMemo(
    () =>
      services
        .filter((s) => s.categoryId === category.id)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [services, category.id]
  );

  const drag = useDragList(
    items.map((s) => s.id),
    (ids) => reorderServices(category.id, ids)
  );

  const rows = useMemo(() => {
    const map = new Map(items.map((s) => [s.id, s] as const));
    return drag.displayOrder.map((id) => map.get(id)).filter((s): s is Service => Boolean(s));
  }, [items, drag.displayOrder]);

  return (
    <section className="overflow-hidden rounded-[24px] border border-white/70 bg-white/50 shadow-sm backdrop-blur-xl">
      {/* Category header (drag handle = grip area) */}
      <div
        className="flex items-center gap-2 px-3 py-3"
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', category.id);
          e.stopPropagation();
          // category drag is wired by parent via onDragOver on this same node
        }}
      >
        <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-stone-300" />
        <button type="button" onClick={() => setCollapsed((c) => !c)} className="flex flex-1 items-center gap-2 text-right">
          <ChevronDown className={`h-4 w-4 text-stone-400 transition-transform ${collapsed ? '-rotate-90' : ''}`} />
          <span className="text-sm font-black text-stone-900">{category.name}</span>
          <span className="rounded-full border border-stone-200 bg-white/80 px-2 py-0.5 text-[10px] font-bold text-stone-500">
            {toPersianDigits(items.length)} خدمت
          </span>
        </button>
        <button type="button" title="افزودن خدمت به این دسته" onClick={() => onAddService(category.id)}
          className="rounded-lg p-1.5 text-[#ea5848] transition-colors hover:bg-[#ea5848]/10">
          <Plus className="h-4 w-4" />
        </button>
        <button type="button" title="ویرایش دسته‌بندی" onClick={() => onEditCategory(category)}
          className="rounded-lg p-1.5 text-stone-500 transition-colors hover:bg-stone-100">
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          title={items.length > 0 ? 'ابتدا خدمات این دسته را حذف کنید' : 'حذف دسته‌بندی'}
          disabled={items.length > 0}
          onClick={() => onDeleteCategory(category)}
          className="rounded-lg p-1.5 text-rose-500 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {!collapsed && (
        <div className="space-y-2 border-t border-stone-900/5 px-3 pb-3 pt-3">
          {items.length === 0 && (
            <p className="rounded-xl border border-dashed border-stone-300 px-3 py-4 text-center text-xs text-stone-400">
              هنوز خدمتی در این دسته‌بندی اضافه نشده است
            </p>
          )}
          {rows.map((s, index) => (
            <div
              key={s.id}
              style={{ width: '332px', marginLeft: '0px', paddingLeft: '10px', marginRight: '-10px', height: '86px' }}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', s.id);
                drag.handleDragStart(s.id);
              }}
              onDragOver={(e) => { e.preventDefault(); drag.handleDragOver(s.id); }}
              onDrop={(e) => e.preventDefault()}
              onDragEnd={drag.handleDragEnd}
              className={`flex items-center gap-2 rounded-2xl border bg-white/70 px-2.5 py-2.5 transition-all hover:bg-white ${
                drag.draggingId === s.id
                  ? 'border-[#ea5848] opacity-50 ring-2 ring-[#ea5848]/20'
                  : 'border-white/60'
              }`}
            >
              <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-stone-300" />

              {/* Arrow reorder (works on mobile / keyboard accessible) */}
              <div className="flex shrink-0 flex-col">
                <button
                  type="button" title="انتقال به بالا" disabled={index === 0}
                  onClick={() => moveService(s.id, 'up')}
                  className="rounded p-0.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 disabled:opacity-25"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button" title="انتقال به پایین" disabled={index === rows.length - 1}
                  onClick={() => moveService(s.id, 'down')}
                  className="rounded p-0.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 disabled:opacity-25"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>

              <span className={`h-2 w-2 shrink-0 rounded-full ${s.isActive ? 'bg-emerald-500' : 'bg-stone-300'}`} />
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-bold ${s.isActive ? 'text-stone-900' : 'text-stone-400 line-through'}`}>
                  {s.name}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-stone-500">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDuration(s.durationMinutes)}</span>
                  {s.realPrice && s.realPrice > s.price ? (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="line-through text-stone-400 tabular-nums text-[10px]">
                        {formatPrice(s.realPrice)}
                      </span>
                      <span className="font-black text-emerald-700 tabular-nums">
                        {formatPrice(s.price)}
                      </span>
                      <span className="rounded-md bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800 border border-emerald-200">
                        {toPersianDigits(Math.round(((s.realPrice - s.price) / s.realPrice) * 100))}٪ تخفیف
                      </span>
                    </div>
                  ) : (
                    <span className="font-bold text-[#ea5848]">{formatPrice(s.price)}</span>
                  )}
                </div>
              </div>

              <button type="button" title={s.isActive ? 'پنهان از منوی رزرو' : 'نمایش در منوی رزرو'}
                onClick={() => { toggleServiceActive(s.id); onToast(s.isActive ? 'خدمت از منو پنهان شد' : 'خدمت فعال شد'); }}
                className={`rounded-lg p-1.5 transition-colors ${s.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-stone-400 hover:bg-stone-100'}`}>
                <Power className="h-4 w-4" />
              </button>
              <button type="button" title="ویرایش" onClick={() => onEditService(s)}
                className="rounded-lg p-1.5 text-stone-500 transition-colors hover:bg-stone-100">
                <Pencil className="h-4 w-4" />
              </button>
              <button type="button" title="حذف" onClick={() => setPendingDelete(s)}
                className="rounded-lg p-1.5 text-rose-500 transition-colors hover:bg-rose-50">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <AnimatePresence>
        {pendingDelete && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-4 backdrop-blur-sm"
            onClick={() => setPendingDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              dir="rtl"
              className="w-full max-w-sm rounded-[24px] bg-white p-5 shadow-2xl"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-rose-50 p-2"><AlertTriangle className="h-5 w-5 text-rose-600" /></div>
                <div>
                  <h3 className="text-sm font-black text-stone-900">حذف خدمت</h3>
                  <p className="mt-1.5 text-xs leading-5 text-stone-500">
                    «{pendingDelete.name}» با قیمت {formatPrice(pendingDelete.price)} حذف شود؟
                    نوبت‌های قبلی که با این خدمت ثبت شده‌اند بدون تغییر باقی می‌مانند.
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    deleteService(pendingDelete.id);
                    onToast(`«${pendingDelete.name}» حذف شد`);
                    setPendingDelete(null);
                  }}
                  className="rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-700"
                >
                  حذف قطعی
                </button>
                <button type="button" onClick={() => setPendingDelete(null)}
                  className="rounded-xl border border-stone-200 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50">
                  انصراف
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
