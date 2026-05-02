import { ChevronLeft, ChevronRight, CalendarDays, X } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { createBrowserSupabase } from '../../lib/supabase';
import { $dateFilter, clearDateFilter, setDateFilter } from '../../stores/dateFilter';

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

export function ArchiveCalendar() {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [postDates, setPostDates] = useState<Set<string>>(new Set());
  const dateFilter = useStore($dateFilter);

  useEffect(() => {
    const supabase = createBrowserSupabase();
    const startOfMonth = new Date(year, month, 1).toISOString();
    const startOfNext = new Date(year, month + 1, 1).toISOString();

    supabase
      .from('tweets')
      .select('created_at')
      .gte('created_at', startOfMonth)
      .lt('created_at', startOfNext)
      .then(({ data }) => {
        if (data) {
          const dates = new Set(
            data.map((row) => new Date(row.created_at).getDate().toString())
          );
          setPostDates(dates);
        }
      });
  }, [year, month]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;

  const isFutureMonth = year > today.getFullYear() ||
    (year === today.getFullYear() && month > today.getMonth());

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else { setMonth(m => m - 1); }
  };

  const nextMonth = () => {
    if (isFutureMonth) return;
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else { setMonth(m => m + 1); }
  };

  const monthName = `${year} 年 ${month + 1} 月`;

  return (
    <div className="rounded-2xl border border-border-default bg-surface-secondary p-4">
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays size={16} className="text-cyan-400" />
        <h3 className="text-sm font-semibold text-primary">归档</h3>
      </div>

      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="h-7 w-7 rounded-full flex items-center justify-center text-secondary hover:text-white hover:bg-white/5 transition-colors">
          <ChevronLeft size={15} />
        </button>
        <span className="text-sm font-medium text-primary">{monthName}</span>
        <button
          onClick={nextMonth}
          disabled={isFutureMonth}
          className="h-7 w-7 rounded-full flex items-center justify-center text-secondary hover:text-white hover:bg-white/5 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {dateFilter && (
        <div className="mb-2 flex items-center gap-1.5 rounded-lg bg-cyan-500/10 px-2.5 py-1.5">
          <span className="text-xs text-cyan-400 font-medium">
            筛选: {dateFilter.year}年{dateFilter.month}月{dateFilter.day}日
          </span>
          <button onClick={clearDateFilter} className="ml-auto text-cyan-400/60 hover:text-cyan-300 transition-colors">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[11px] text-tertiary h-6 flex items-center justify-center">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayKey = day.toString();
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const hasPost = postDates.has(dayKey);
          const dayStyle = `relative h-8 text-xs rounded-full flex items-center justify-center
            ${isToday ? 'bg-cyan-500 text-black font-bold' : hasPost ? 'text-secondary hover:bg-white/5 hover:text-white transition-colors' : 'text-tertiary'}
          `;

          if (hasPost) {
            const isActive = dateFilter?.day === day && dateFilter?.month === month + 1 && dateFilter?.year === year;
            return (
              <button
                key={day}
                onClick={() => setDateFilter(isActive ? null : { year, month: month + 1, day })}
                className={`${dayStyle} ${isActive ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-surface-secondary' : ''}`}
              >
                {day}
                {!isToday && (
                  <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-cyan-400" />
                )}
              </button>
            );
          }
          return (
            <span key={day} className={dayStyle}>
              {day}
            </span>
          );
        })}
      </div>
    </div>
  );
}
