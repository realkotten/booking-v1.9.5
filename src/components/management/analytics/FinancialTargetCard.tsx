import React, { useState } from 'react';
import { toPersianDigits } from '../../../utils/dateUtils';
import { Target, Trophy, Sparkles, Edit3, Check, ArrowRight } from 'lucide-react';

interface FinancialTargetCardProps {
  currentRevenue: number;
  targetAmount: number;
  achievedPct: number;
  remainingAmount: number;
  isTargetMet: boolean;
  periodLabel: string;
  onUpdateTarget: (newTarget: number) => void;
}

export const FinancialTargetCard: React.FC<FinancialTargetCardProps> = ({
  currentRevenue,
  targetAmount,
  achievedPct,
  remainingAmount,
  isTargetMet,
  periodLabel,
  onUpdateTarget,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [customInput, setCustomInput] = useState(targetAmount.toString());

  const handleSave = () => {
    const val = parseInt(customInput, 10);
    if (!isNaN(val) && val > 0) {
      onUpdateTarget(val);
    }
    setIsEditing(false);
  };

  return (
    <div className="bg-white/75 backdrop-blur-md border border-white/80 rounded-2xl p-3 sm:p-3.5 text-stone-900 shadow-2xs relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 relative z-10 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white via-[#fbdcd9] to-[#d88d85] shadow-glow-pink flex items-center justify-center border border-white/60 text-stone-900 shrink-0">
            {isTargetMet ? <Trophy className="w-4 h-4 text-stone-900" /> : <Target className="w-4 h-4 text-stone-900" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-stone-900 text-xs sm:text-sm">
                هدف مالی {periodLabel} آتلیه
              </h3>
              {isTargetMet && (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                  <Sparkles className="w-2.5 h-2.5" /> هدف محقق شد
                </span>
              )}
            </div>
            <p className="text-[9px] text-stone-500 font-mono mt-0.5">
              میزان درآمد محقق‌شده نسبت به بودجه برنامه‌ریزی‌شده
            </p>
          </div>
        </div>

        {/* Target Amount Edit / Display */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {isEditing ? (
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#ea5848] shadow-2xs">
              <span className="text-stone-400 text-xs px-1">$</span>
              <input
                type="number"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="w-20 bg-transparent text-xs text-stone-900 font-bold font-mono focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleSave}
                className="p-1 bg-[#ea5848] text-white rounded-lg font-bold hover:bg-[#d64434] transition-colors cursor-pointer"
              >
                <Check className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setCustomInput(targetAmount.toString());
                setIsEditing(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1 bg-stone-50/90 hover:bg-white border border-stone-200/80 rounded-xl text-[10px] text-stone-800 font-bold transition-colors shadow-2xs cursor-pointer"
            >
              <span>تارگت: ${toPersianDigits(targetAmount.toLocaleString())}</span>
              <Edit3 className="w-3 h-3 text-stone-400" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar & Indicators */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-2">
            <span className="text-stone-700 font-bold font-mono">
              درآمد تحقق‌یافته: ${toPersianDigits(currentRevenue.toLocaleString())}
            </span>
          </div>
          <div className="text-[10px] font-bold text-[#ea5848] font-mono">
            ٪{toPersianDigits(achievedPct)} پیشرفت
          </div>
        </div>

        {/* Bar */}
        <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200/60">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isTargetMet
                ? 'bg-gradient-to-r from-stone-800 to-emerald-500'
                : 'bg-gradient-to-r from-[#f26655] to-[#ea5848]'
            }`}
            style={{ width: `${Math.min(100, Math.max(3, achievedPct))}%` }}
          />
        </div>

        {/* Footer Sub-stats */}
        <div className="flex items-center justify-between text-[9px] text-stone-500 font-mono pt-0.5">
          <span>
            {isTargetMet ? (
              <span className="text-emerald-700 font-bold">
                فراتر از تارگت: +${toPersianDigits((currentRevenue - targetAmount).toLocaleString())}
              </span>
            ) : (
              <span>
                مانده تا تحقق کامل: <strong className="text-stone-800 font-bold">${toPersianDigits(remainingAmount.toLocaleString())}</strong>
              </span>
            )}
          </span>
          <span>بودجه مصوب: ${toPersianDigits(targetAmount.toLocaleString())}</span>
        </div>
      </div>
    </div>
  );
};
