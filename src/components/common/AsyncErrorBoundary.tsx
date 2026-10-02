import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AsyncErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Caught asynchronous module/rendering error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex-1 w-full min-h-[300px] flex flex-col items-center justify-center p-6 text-center" dir="rtl">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-3 shadow-xs">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-stone-800 mb-1">
            خطا در بارگذاری بخش مورد نظر
          </h3>
          <p className="text-xs text-stone-500 max-w-xs mb-4 leading-relaxed">
            ارتباط موقتاً با سرور قطع شده است. لطفاً برای بارگذاری مجدد دکمه زیر را لمس فرمایید.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#bf5938] text-white text-xs font-bold hover:bg-[#a34426] transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>بارگذاری مجدد صفحه</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
