// react-jsx transform: no import needed;
import { Habit, DayRecord } from '../types';
import { HabitItem } from './HabitItem';

interface Props {
  date: string;
  record: DayRecord;
  habits: Habit[];
  onToggle: (habitId: string) => void;
  onNoteChange: (note: string) => void;
  readonly?: boolean;
}

export function DailyChecklist({ date, record, habits, onToggle, onNoteChange, readonly }: Props) {
  const done = record.completedHabits.length;
  const total = habits.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Mini progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 w-16 text-right">
          {done}/{total}
        </span>
      </div>

      {/* Habit list */}
      <div className="space-y-2">
        {habits.map(habit => (
          <HabitItem
            key={habit.id}
            habit={habit}
            checked={record.completedHabits.includes(habit.id)}
            onToggle={() => onToggle(habit.id)}
            disabled={readonly}
          />
        ))}
      </div>

      {/* Note */}
      <div className="pt-1">
        <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
          📝 Note du jour
        </label>
        <textarea
          value={record.note}
          onChange={e => onNoteChange(e.target.value)}
          disabled={readonly}
          placeholder="Écris ici tes ressentis, performances, motivation du jour..."
          rows={3}
          className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/60
            text-sm text-gray-700 dark:text-gray-300 placeholder-gray-300 dark:placeholder-gray-600
            focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 resize-none transition-colors
            disabled:opacity-40 disabled:cursor-not-allowed"
        />
      </div>

      {/* Date info */}
      <p className="text-xs text-center text-gray-300 dark:text-gray-600">
        {new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </p>
    </div>
  );
}
