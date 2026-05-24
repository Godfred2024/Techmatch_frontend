// react-jsx transform: no import needed;
import { ChallengeConfig, DayRecord } from '../types';
import { DailyChecklist } from './DailyChecklist';
import { getTodayString, getDayNumber } from '../utils/calculations';

interface Props {
  config: ChallengeConfig;
  record: DayRecord;
  onToggle: (habitId: string) => void;
  onNoteChange: (note: string) => void;
}

export function Dashboard({ config, record, onToggle, onNoteChange }: Props) {
  const today = getTodayString();
  const dayNumber = getDayNumber(config.startDate, today);
  const clamped = Math.max(1, Math.min(dayNumber, config.duration));
  const done = record.completedHabits.length;
  const total = config.habits.length;
  const allDone = done === total && total > 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = circumference - (pct / 100) * circumference;

  const motivationalMessage = () => {
    if (dayNumber < 1) return 'Le challenge commence bientôt !';
    if (dayNumber > config.duration) return 'Challenge terminé ! Bravo !';
    if (allDone) return '🔥 Journée parfaite ! Continue comme ça !';
    if (pct >= 50) return '💪 Bonne progression, termine fort !';
    if (pct > 0) return "🚀 C'est parti ! Reste focus !";
    return '☀️ Nouvelle journée, nouvelles opportunités !';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header card */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-200 text-sm font-medium uppercase tracking-widest">
              {config.name}
            </p>
            <h1 className="text-4xl font-black mt-1">
              Jour {clamped}
              <span className="text-2xl font-light text-indigo-300"> / {config.duration}</span>
            </h1>
            <p className="text-indigo-200 text-sm mt-2">{motivationalMessage()}</p>
          </div>

          {/* Ring progress */}
          <div className="relative flex-shrink-0">
            <svg width="110" height="110" className="-rotate-90">
              <circle
                cx="55" cy="55" r={radius}
                fill="none" stroke="rgba(255,255,255,0.15)"
                strokeWidth="10"
              />
              <circle
                cx="55" cy="55" r={radius}
                fill="none"
                stroke={allDone ? '#34d399' : 'white'}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDash}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black">{pct}%</span>
              <span className="text-xs text-indigo-200">{done}/{total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist card */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4">
          Habitudes du jour
        </h2>
        <DailyChecklist
          date={today}
          record={record}
          habits={config.habits}
          onToggle={onToggle}
          onNoteChange={onNoteChange}
          readonly={dayNumber < 1 || dayNumber > config.duration}
        />
      </div>
    </div>
  );
}
