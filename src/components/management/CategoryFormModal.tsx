import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, FolderPlus, FolderEdit } from 'lucide-react';
import { ServiceCategory } from '../../types';

interface CategoryFormModalProps {
  isOpen: boolean;
  editing: ServiceCategory | null;
  onClose: () => void;
  onSubmit: (name: string) => { success: boolean; message?: string };
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  editing,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setName(editing ? editing.name : '');
  }, [isOpen, editing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('لطفاً نام دسته‌بندی را وارد کنید');
      return;
    }
    const result = onSubmit(name.trim());
    if (!result.success) {
      setError(result.message ?? 'خطای نامشخص');
    }
  };

  const inputClass =
    'w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition-colors focus:border-[#ea5848] focus:ring-2 focus:ring-[#ea5848]/20';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.form
            onSubmit={handleSubmit}
            initial={{ scale: 0.95, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 16 }}
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
            className="w-full max-w-sm rounded-[28px] bg-white p-5 shadow-2xl border border-stone-100"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-[#ea5848]/10 p-2 text-[#ea5848]">
                  {editing ? <FolderEdit className="h-4 w-4" /> : <FolderPlus className="h-4 w-4" />}
                </div>
                <h3 className="text-sm font-black text-stone-900">
                  {editing ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی جدید'}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-stone-600">نام دسته‌بندی *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثلاً: اصلاح مو، مراقبت پوست"
                  className={inputClass}
                  autoFocus
                />
              </div>

              {error && (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
                  {error}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="submit"
                  className="rounded-xl bg-[#ea5848] py-2.5 text-xs font-black text-white transition-colors hover:bg-[#d64434]"
                >
                  {editing ? 'ذخیره تغییرات' : 'ساخت دسته‌بندی'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-stone-200 py-2.5 text-xs font-bold text-stone-700 transition-colors hover:bg-stone-50"
                >
                  انصراف
                </button>
              </div>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
