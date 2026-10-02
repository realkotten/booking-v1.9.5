import React, { useState } from 'react';
import { Appointment, AnalyticsSummary } from '../../../types';
import { toPersianDigits } from '../../../utils/dateUtils';
import { formatPrice } from '../../../utils/formatUtils';
import { 
  X, 
  DollarSign, 
  Scissors, 
  Receipt, 
  Search, 
  Calendar, 
  CheckCircle2, 
  Clock, 
} from 'lucide-react';

export type InspectionModalType = 'total' | 'service' | 'transactions' | 'appointments' | string;

interface AnalyticsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspectionType: InspectionModalType;
  summary: AnalyticsSummary;
  onOpenCustomerDossier: (customerId: string) => void;
}

export const AnalyticsDetailModal: React.FC<AnalyticsDetailModalProps> = ({
  isOpen,
  onClose,
  inspectionType,
  summary,
  onOpenCustomerDossier,
}) => {
  if (!isOpen) return null;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { filteredAppointments, totalRevenue, serviceRevenue, dateRangeDescription } = summary;

  // Filter appointments
  const matchingAppointments = filteredAppointments.filter((apt) => {
    if (apt.status === 'blocked') return false;
    const matchesSearch = 
      (apt.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apt.service?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apt.appointmentNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getModalTitle = () => {
    switch (inspectionType) {
      case 'total':
        return 'گزارش جامع تراکنش‌ها و درآمدهای آتلیه';
      case 'service':
        return 'ریز درآمد و نوبت‌های آیین‌های پیرایش';
      case 'transactions':
        return 'دفتر کل تراکنش‌های مالی دوره';
      default:
        return 'جزئیات عملکرد و ریز داده‌های مالی';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/40 backdrop-blur-md animate-in fade-in duration-200" dir="rtl">
      <div 
        className="bg-white/90 border border-white/80 w-full max-w-4xl rounded-2xl max-h-[90vh] flex flex-col shadow-2xl backdrop-blur-md overflow-hidden text-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 border-b border-stone-100 flex items-center justify-between bg-white/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-[#ea5848]">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-stone-900 font-serif">
                {getModalTitle()}
              </h2>
              <div className="flex items-center gap-1.5 text-[10px] text-stone-500 font-mono mt-0.5">
                <Calendar className="w-3 h-3 text-stone-400" />
                <span>دوره: {dateRangeDescription}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Top Summary Bar in Modal */}
        <div className="grid grid-cols-2 gap-2 p-2.5 sm:p-3 bg-stone-50/70 border-b border-stone-100 text-center text-xs">
          <div className="p-2 bg-white/80 rounded-xl border border-stone-200/80 shadow-2xs">
            <span className="text-stone-500 text-[10px] block">درآمد کل دوره</span>
            <span className="text-sm sm:text-base font-bold text-[#ea5848] font-mono">
              {formatPrice(totalRevenue)}
            </span>
          </div>
          <div className="p-2 bg-white/80 rounded-xl border border-stone-200/80 shadow-2xs">
            <span className="text-stone-500 text-[10px] block">خدمات پیرایش</span>
            <span className="text-sm sm:text-base font-bold text-emerald-700 font-mono">
              {formatPrice(serviceRevenue)}
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-2.5 sm:p-3 border-b border-stone-100 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between bg-white/40">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجو بر اساس نام مشتری، خدمت یا شماره نوبت..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-xl pr-8 pl-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#ea5848] shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs text-stone-700 focus:outline-none focus:border-[#ea5848] shadow-2xs"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="completed">تکمیل‌شده (درآمد محقق)</option>
              <option value="confirmed">تایید شده</option>
              <option value="cancelled">لغوشده</option>
              <option value="no_show">عدم حضور</option>
            </select>
          </div>
        </div>

        {/* Records Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-[#ea5848]" />
                نوبت‌ها و آیین‌های دوره ({toPersianDigits(matchingAppointments.length)})
              </span>
            </div>

            {matchingAppointments.length === 0 ? (
              <div className="p-4 text-center text-xs text-stone-400 bg-stone-50 rounded-xl border border-stone-100">
                موردی یافت نشد.
              </div>
            ) : (
              <div className="space-y-1.5">
                {matchingAppointments.map((apt) => {
                  const isCompleted = apt.status === 'completed';
                  const aptTotal = apt.totalAmount || (apt.servicePrice || 0) + (apt.accoutrementsPrice || 0) + (apt.tipAmount || 0);

                  return (
                    <div
                      key={apt.id}
                      className="p-2.5 bg-white/80 hover:bg-white border border-stone-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors text-xs shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-stone-100 text-stone-500'
                        }`}>
                          {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span 
                              onClick={() => apt.customerId && onOpenCustomerDossier(apt.customerId)}
                              className="font-bold text-stone-900 hover:text-[#ea5848] cursor-pointer"
                            >
                              {apt.customerName}
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono">({apt.appointmentNumber})</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                              isCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-600'
                            }`}>
                              {isCompleted ? 'تکمیل‌شده' : apt.status}
                            </span>
                          </div>
                          <div className="text-[10px] text-stone-500 font-mono mt-0.5">
                            {apt.service?.name} · {apt.date} ساعت {apt.startTime}
                          </div>
                        </div>
                      </div>

                      <div className="text-left flex items-center justify-between sm:justify-end gap-3 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                        <div>
                          <div className="font-bold text-emerald-700 text-xs font-mono">
                            {formatPrice(aptTotal)}
                          </div>
                          {apt.tipAmount ? (
                            <div className="text-[9px] text-stone-400 font-mono">انعام: {formatPrice(apt.tipAmount)}</div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between text-xs">
          <span className="text-[10px] text-stone-400 font-mono">
            محاسبه مستقیم بر اساس داده‌های آتلیه
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl transition-colors text-xs"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
