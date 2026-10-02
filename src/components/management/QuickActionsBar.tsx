import React from 'react';
import { Sparkles, UserPlus } from 'lucide-react';

interface QuickActionsBarProps {
  onOpenWalkIn: () => void;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  onOpenWalkIn,
}) => {
  return (
    <div className="w-full" dir="rtl">
      {/* Primary Walk-in Client Admission */}
      <button
        type="button"
        onClick={onOpenWalkIn}
        className="w-full flex items-center justify-between p-3 rounded-[20px] bg-gradient-to-r from-[#ea5848] via-[#e04b3a] to-[#c43627] text-white shadow-md border border-white/20 hover:border-[#ffebe6]/60 transition-all group cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white via-[#fbdcd9] to-[#d88d85] shadow-glow-pink flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Sparkles className="w-4 h-4 text-stone-900" />
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-serif font-bold text-white group-hover:text-[#fdc4c2] transition-colors">
                پذیرش و ثبت مشتری حضوری (Walk-in)
              </span>
              <span className="text-[9px] bg-emerald-950/80 text-emerald-400 font-mono px-1.5 py-0.5 rounded border border-emerald-800/50">
                سریع
              </span>
            </div>
            <p className="text-[10px] text-stone-400 mt-0.5">
              ثبت فوری مراجعین بدون رزرو قبلی مستقیم روی صندلی فعال
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-[#fdc4c2] bg-stone-800/80 group-hover:bg-[#382f2d] px-3 py-1.5 rounded-xl border border-stone-700/60 transition-all font-medium">
          <UserPlus className="w-3.5 h-3.5" />
          <span>ثبت پذیرش</span>
        </div>
      </button>
    </div>
  );
};
