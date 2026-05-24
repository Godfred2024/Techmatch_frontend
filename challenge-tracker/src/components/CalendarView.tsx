import { useState } from 'react';;
import { ChallengeConfig, DayRecord, DayStatus } from '../types';
import { getDayStatus, getDayNumber, getTodayString } from '../utils/calculations';
import { DailyChecklist } from './DailyChecklist';

interface Props {
  config: ChallengeConfig;
  days: Record<string, DayRecord>;
  onToggle: (date: string, habitId: string) => void;
  onNoteChange: (date: string, note: string) => void;
}

const STATUS_STYLES: Record<DayStatus, string> = {
  complete: 'bg-emerald-500 text-white',
  partial: 'bg-amber-400 text-white',
  missed: 'bg-rose-400 text-white',
  current: 'bg-indigo-500 text-white ring-2 ring-indigo-300 ring-offset-1 dark:ring-offset-gray-900',
  future: 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600',
};

export function CalendarView({ config, days, onToggle, onNoteChange }: Props) {
  const today = getTodayString();
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const startDate = new Date(config.startDate + 'T00:00:00');
  const endDateObj = new Date(startDate);
  endDateObj.setDate(endDateObj.getDate() + config.duration - 1);

  function getDaysInMonth(year: number, month: number): (string | null)[] {
    const firstDay = new Date(year, month, 1).getDay();
    const monday0 = (firstDay + 6) % 7; // Monday = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (string | null)[] = Array(monday0).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const m = String(month + 1).padStart(2, '0');
      const day = String(d).padStart(2, '0');
      cells.push(`${year}-${m}-${day}`);
    }
    return cells;
  }

  const cells = getDaysInMonth(viewYear, viewMonth);
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(v => v - 1); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(v => v + 1); }
    else setViewMonth(m => m + 1);
  }

  const selectedRecord = selectedDate
    ? (days[selectedDate] ?? { date: selectedDate, completedHabits: [], note: '' })
    : null;

  const dayNumForSelected = selectedDate ? getDayNumber(config.startDate, selectedDate) : 0;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Month navigation */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-200 capitalize">
            {monthLabel}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
            <div key={i} className="text-center text-xs font-semibold text-gray-400 dark:text-gray-600 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((dateStr, idx) => {
            if (!dateStr) return <div key={idx} />;

            const dayNum = getDayNumber(config.startDate, dateStr);
            const isInChallenge = dayNum >= 1 && dayNum <= config.duration;
            const status = isInChallenge
              ? getDayStatus(dateStr, days[dateStr], config.habits, config.startDate, config.duration)
              : null;
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;

            return (
              <button
                key={idx}
                onClick={() => {
                  if (!isInChallenge) return;
                  setSelectedDate(isSelected ? null : dateStr);
                }}
                disabled={!isInChallenge}
                className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-semibold transition-all duration-150
                  ${isInChallenge ? 'cursor-pointer' : 'cursor-default opacity-30'}
                  ${status ? STATUS_STYLES[status] : 'text-gray-300 dark:text-gray-700'}
                  ${isSelected ? 'ring-2 ring-indigo-400 ring-offset-1 dark:ring-offset-gray-900 scale-110' : ''}
                  ${!status && isInChallenge ? 'bg-gray-50 dark:bg-gray-800/40' : ''}
                `}
              >
                <span>{new Date(dateStr + 'T00:00:00').getDate()}</span>
                {isInChallenge && status && status !== 'future' && (
                  <span className="text-[8px] opacity-75">J{dayNum}</span>
                )}
                {isToday && !isSelected && (
                  <div className="absolute w-1 h-1 rounded-full bg-white/80 mt-4" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 justify-center">
          {[
            { status: 'complete' as DayStatus, label: 'Complet' },
            { status: 'partial' as DayStatus, label: 'Partiel' },
            { status: 'missed' as DayStatus, label: 'Manqué' },
            { status: 'current' as DayStatus, label: "Aujourd'hui" },
          ].map(({ status, label }) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${STATUS_STYLES[status]}`} />
              <span className="text-xs text-gray-500 dark:text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDate && selectedRecord && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
                Jour {dayNumForSelected}
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-600">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('fr-FR', {
                  weekday: 'long', day: 'numeric', month: 'long',
                })}
              </p>
            </div>
            <button
              onClick={() => setSelectedDate(null)}
              className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <DailyChecklist
            date={selectedDate}
            record={selectedRecord}
            habits={config.habits}
            onToggle={habitId => onToggle(selectedDate, habitId)}
            onNoteChange={note => onNoteChange(selectedDate, note)}
            readonly={selectedDate > getTodayString()}
          />
        </div>
      )}
    </div>
  );
}
