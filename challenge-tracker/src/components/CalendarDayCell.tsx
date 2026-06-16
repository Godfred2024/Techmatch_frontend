import { CalendarEvent, DayRecord, DayStatus, Habit } from '../types';

const HABIT_COLORS: Record<string, string> = {
  workout: '#f97316',
  mobility: '#22c55e',
  nutrition: '#10b981',
  protein: '#f59e0b',
  hydration: '#3b82f6',
  reading: '#8b5cf6',
  photo: '#ec4899',
  sleep: '#6366f1',
  no_alcohol: '#ef4444',
};

const FALLBACK_COLORS = ['#06b6d4', '#84cc16', '#a855f7', '#14b8a6', '#f43f5e'];

export function habitColor(id: string): string {
  if (HABIT_COLORS[id]) return HABIT_COLORS[id];
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) & 0xffffff;
  return FALLBACK_COLORS[Math.abs(h) % FALLBACK_COLORS.length];
}

const RING_STROKE: Record<DayStatus, string> = {
  complete: '#10b981',
  partial: '#f59e0b',
  missed: '#f43f5e',
  current: '#6366f1',
  future: 'transparent',
};

const DAY_TEXT_FILL: Record<DayStatus, string> = {
  complete: '#059669',
  partial: '#d97706',
  missed: '#e11d48',
  current: '#4f46e5',
  future: '#9ca3af',
};

interface Props {
  dateStr: string;
  isInChallenge: boolean;
  status: DayStatus | null;
  record: DayRecord | undefined;
  habits: Habit[];
  events: CalendarEvent[];
  isSelected: boolean;
  onClick: () => void;
}

const MAX_DOTS = 4;

export function CalendarDayCell({ dateStr, isInChallenge, status, record, habits, events, isSelected, onClick }: Props) {
  const dayOfMonth = new Date(dateStr + 'T00:00:00').getDate();
  const isFutureOrOut = !isInChallenge || status === 'future';

  const completedIds = record?.completedHabits ?? [];
  const pct = habits.length > 0 ? completedIds.length / habits.length : 0;

  const R = 13;
  const cx = 18;
  const cy = 18;
  const circ = 2 * Math.PI * R;

  // For missed days with nothing done, show a small dash so it reads as "missed" not "future"
  const arcOffset =
    isFutureOrOut
      ? circ
      : status === 'missed' && pct === 0
      ? circ * 0.87
      : circ * (1 - pct);

  const strokeColor = status ? RING_STROKE[status] : 'transparent';
  const textFill = status ? DAY_TEXT_FILL[status] : '#9ca3af';
  const showArc = !isFutureOrOut && status !== null;

  const visibleHabits = habits.slice(0, MAX_DOTS);
  const extraHabits = Math.max(0, habits.length - MAX_DOTS);
  const showDots = isInChallenge && status !== 'future' && habits.length > 0;

  return (
    <button
      onClick={onClick}
      className={[
        'relative flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-all duration-150 select-none',
        !isInChallenge
          ? 'opacity-25 cursor-default'
          : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40',
        isSelected
          ? 'bg-indigo-50 dark:bg-indigo-950/40 ring-2 ring-indigo-400 ring-offset-1 dark:ring-offset-gray-900 scale-105 z-10'
          : '',
      ].join(' ')}
    >
      {/* Progress ring */}
      <svg width="36" height="36" viewBox="0 0 36 36">
        <circle
          cx={cx} cy={cy} r={R}
          fill="none"
          strokeWidth="2.5"
          className="stroke-gray-200 dark:stroke-gray-700"
        />
        {showArc && (
          <circle
            cx={cx} cy={cy} r={R}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={arcOffset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        )}
        <text
          x={cx}
          y={cy + 0.5}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={dayOfMonth >= 10 ? '7.5' : '9'}
          fontWeight={status === 'current' ? '800' : '600'}
          fill={textFill}
        >
          {dayOfMonth}
        </text>
      </svg>

      {/* Per-habit dots */}
      {showDots ? (
        <div className="flex items-center gap-px">
          {visibleHabits.map(h => {
            const done = completedIds.includes(h.id);
            return (
              <div
                key={h.id}
                className={`w-1.5 h-1.5 rounded-full ${done ? '' : 'bg-gray-200 dark:bg-gray-700'}`}
                style={done ? { backgroundColor: habitColor(h.id) } : undefined}
              />
            );
          })}
          {extraHabits > 0 && (
            <span className="text-[5.5px] font-bold text-gray-400 dark:text-gray-600 ml-px leading-none">
              +{extraHabits}
            </span>
          )}
        </div>
      ) : (
        <div className="h-2" />
      )}

      {/* Event indicator dots */}
      {events.length > 0 && (
        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
          {events.slice(0, 2).map(ev => (
            <div
              key={ev.id}
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: ev.color }}
            />
          ))}
        </div>
      )}
    </button>
  );
}
