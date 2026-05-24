// react-jsx transform: no import needed;
import { Habit } from '../types';

interface Props {
  habit: Habit;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function HabitItem({ habit, checked, onToggle, disabled }: Props) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`flex items-center gap-3 w-full p-3.5 rounded-2xl border-2 transition-all duration-200 text-left
        ${checked
          ? 'bg-emerald-50 border-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-600'
          : 'bg-white border-gray-100 dark:bg-gray-800/60 dark:border-gray-700/60 hover:border-gray-200 dark:hover:border-gray-600'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}
      `}
    >
      <span className="text-xl select-none">{habit.icon}</span>
      <span
        className={`flex-1 text-sm font-medium transition-colors
          ${checked ? 'text-emerald-700 dark:text-emerald-400 line-through decoration-emerald-400' : 'text-gray-700 dark:text-gray-300'}
        `}
      >
        {habit.label}
      </span>
      <div
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200
          ${checked ? 'bg-emerald-500 border-emerald-500 scale-110' : 'border-gray-300 dark:border-gray-600'}
        `}
      >
        {checked && (
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </button>
  );
}
