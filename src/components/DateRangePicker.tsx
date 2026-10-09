import React, { useMemo } from 'react';
import { Calendar, ArrowRight, Clock, X, Sparkles } from 'lucide-react';

export interface DateRangePickerProps {
  startDate: string; // YYYY-MM-DD format
  endDate: string;   // YYYY-MM-DD format
  onChange: (startDate: string, endDate: string, formattedSummary: string) => void;
  minDate?: string;  // Defaults to today
  maxDate?: string;
  theme?: 'light' | 'dark';
  label?: string;
  required?: boolean;
  className?: string;
  showPresets?: boolean;
}

export function formatDateRangeSummary(start: string, end: string): string {
  if (!start && !end) return '';
  
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  if (start && end) {
    try {
      const [y1, m1, d1] = start.split('-').map(Number);
      const [y2, m2, d2] = end.split('-').map(Number);
      const dStart = new Date(y1, m1 - 1, d1);
      const dEnd = new Date(y2, m2 - 1, d2);
      const diffTime = dEnd.getTime() - dStart.getTime();
      const diffNights = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffNights > 0) {
        return `${formatDate(start)} – ${formatDate(end)} (${diffNights} ${diffNights === 1 ? 'night' : 'nights'})`;
      } else if (diffNights === 0) {
        return `${formatDate(start)} (Single day)`;
      }
    } catch {
      // Fallback
    }
    return `${formatDate(start)} – ${formatDate(end)}`;
  }

  if (start) return `Departing ${formatDate(start)}`;
  return `Returning ${formatDate(end)}`;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  minDate,
  maxDate,
  theme = 'light',
  label = 'Travel Dates (Departure – Return)',
  required = false,
  className = '',
  showPresets = true
}) => {
  const isDark = theme === 'dark';

  // Calculate default today YYYY-MM-DD
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const effectiveMin = minDate || todayStr;

  // Compute nights count
  const nightsCount = useMemo(() => {
    if (!startDate || !endDate) return null;
    try {
      const [y1, m1, d1] = startDate.split('-').map(Number);
      const [y2, m2, d2] = endDate.split('-').map(Number);
      const dStart = new Date(y1, m1 - 1, d1);
      const dEnd = new Date(y2, m2 - 1, d2);
      const diffTime = dEnd.getTime() - dStart.getTime();
      const nights = Math.round(diffTime / (1000 * 60 * 60 * 24));
      return nights >= 0 ? nights : null;
    } catch {
      return null;
    }
  }, [startDate, endDate]);

  const handleStartChange = (newStart: string) => {
    let newEnd = endDate;
    // If end date is prior to new start date, adjust end date to be at least start date
    if (newStart && endDate && newStart > endDate) {
      newEnd = newStart;
    }
    const summary = formatDateRangeSummary(newStart, newEnd);
    onChange(newStart, newEnd, summary);
  };

  const handleEndChange = (newEnd: string) => {
    // If start is empty and end is chosen, start can default to today or end
    let newStart = startDate;
    if (!newStart && newEnd) {
      newStart = effectiveMin;
    }
    const summary = formatDateRangeSummary(newStart, newEnd);
    onChange(newStart, newEnd, summary);
  };

  const handlePresetDays = (days: number) => {
    let baseStart = startDate;
    if (!baseStart) {
      // Default start date to 1 month from today for safari planning
      const future = new Date();
      future.setDate(future.getDate() + 30);
      const y = future.getFullYear();
      const m = String(future.getMonth() + 1).padStart(2, '0');
      const d = String(future.getDate()).padStart(2, '0');
      baseStart = `${y}-${m}-${d}`;
    }

    const [y, m, d] = baseStart.split('-').map(Number);
    const startObj = new Date(y, m - 1, d);
    startObj.setDate(startObj.getDate() + days);

    const endY = startObj.getFullYear();
    const endM = String(startObj.getMonth() + 1).padStart(2, '0');
    const endD = String(startObj.getDate()).padStart(2, '0');
    const newEnd = `${endY}-${endM}-${endD}`;

    const summary = formatDateRangeSummary(baseStart, newEnd);
    onChange(baseStart, newEnd, summary);
  };

  const handleClear = () => {
    onChange('', '', '');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className={`block text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-[#C5A880]' : 'text-stone-500'}`}>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-[#C5A880]" />
              {label} {required && <span className="text-amber-500">*</span>}
            </span>
          </label>
          {(startDate || endDate) && (
            <button
              type="button"
              onClick={handleClear}
              className={`text-[10px] flex items-center gap-1 font-medium transition-colors ${
                isDark ? 'text-stone-400 hover:text-white' : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Clear date selection"
            >
              <X className="w-2.5 h-2.5" /> Clear
            </button>
          )}
        </div>
      )}

      {/* Date Pickers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Start Date */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[9px] font-semibold uppercase tracking-wider ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
              Start Date (Departure)
            </span>
          </div>
          <div className="relative">
            <input
              type="date"
              value={startDate}
              min={effectiveMin}
              max={maxDate}
              onChange={(e) => handleStartChange(e.target.value)}
              className={`w-full px-3 py-2 text-xs focus:outline-none focus:border-[#C5A880] transition-colors ${
                isDark
                  ? 'bg-white/5 border border-white/10 text-white scheme-dark'
                  : 'bg-[#FAF7F2] border border-stone-200 text-stone-900 scheme-light'
              }`}
              required={required}
            />
          </div>
        </div>

        {/* End Date */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[9px] font-semibold uppercase tracking-wider ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
              End Date (Return)
            </span>
          </div>
          <div className="relative">
            <input
              type="date"
              value={endDate}
              min={startDate || effectiveMin}
              max={maxDate}
              onChange={(e) => handleEndChange(e.target.value)}
              className={`w-full px-3 py-2 text-xs focus:outline-none focus:border-[#C5A880] transition-colors ${
                isDark
                  ? 'bg-white/5 border border-white/10 text-white scheme-dark'
                  : 'bg-[#FAF7F2] border border-stone-200 text-stone-900 scheme-light'
              }`}
              required={required}
            />
          </div>
        </div>
      </div>

      {/* Duration Calculation & Selection Feedback */}
      {nightsCount !== null && (
        <div
          className={`flex items-center justify-between px-2.5 py-1.5 text-[11px] rounded transition-all ${
            isDark
              ? 'bg-[#C5A880]/15 border border-[#C5A880]/30 text-[#E0C9A6]'
              : 'bg-[#C5A880]/10 border border-[#C5A880]/30 text-stone-800'
          }`}
        >
          <div className="flex items-center gap-1.5 font-medium truncate">
            <Clock className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
            <span className="font-semibold text-[#9D8053] dark:text-[#E0C9A6]">
              {nightsCount === 0 ? 'Same Day Expedition' : `${nightsCount} ${nightsCount === 1 ? 'Night' : 'Nights'} / ${nightsCount + 1} Days`}
            </span>
            <span className="opacity-70 text-[10px] hidden sm:inline">&middot; {formatDateRangeSummary(startDate, endDate)}</span>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#9D8053] dark:text-[#C5A880] shrink-0">
            Selected
          </span>
        </div>
      )}

      {/* Quick Duration Buttons (When start date is set or to quickly plan standard safari length) */}
      {showPresets && (
        <div className="pt-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[9px] uppercase font-bold tracking-wider ${isDark ? 'text-stone-400' : 'text-stone-500'} flex items-center gap-1 mr-1`}>
              <Sparkles className="w-2.5 h-2.5 text-[#C5A880]" /> Quick Duration:
            </span>
            {[
              { label: '5 Days', days: 4 },
              { label: '7 Days (1 Wk)', days: 6 },
              { label: '10 Days', days: 9 },
              { label: '14 Days (2 Wks)', days: 13 }
            ].map((preset) => {
              const isSelected = nightsCount === preset.days;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handlePresetDays(preset.days)}
                  className={`text-[10px] px-2 py-0.5 transition-all border ${
                    isSelected
                      ? 'bg-[#C5A880] text-stone-900 border-[#C5A880] font-bold shadow-xs'
                      : isDark
                      ? 'bg-white/5 text-stone-300 border-white/10 hover:border-[#C5A880] hover:text-[#C5A880]'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-[#C5A880] hover:text-[#C5A880]'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
