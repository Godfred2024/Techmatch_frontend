import { HabitStat } from '../../utils/progressCalculations';

interface Props {
  stats: HabitStat[];
}

export function HabitPerformance({ stats }: Props) {
  if (stats.length === 0 || stats.every(s => s.eligibleDays === 0)) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          Analyse des habitudes
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-600 italic text-center py-4">
          Aucune donnée pour l'instant. Continue le challenge !
        </p>
      </div>
    );
  }

  const active = stats.filter(s => s.eligibleDays > 0);
  const best = active[0];
  const worst = active[active.length - 1];

  function barColor(rate: number): string {
    if (rate >= 80) return 'bg-emerald-500';
    if (rate >= 60) return 'bg-amber-400';
    return 'bg-rose-400';
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
        Analyse des habitudes
      </p>

      <div className="space-y-4">
        {active.map((s, i) => {
          const isBest  = s.habit.id === best?.habit.id  && best.successRate > 0;
          const isWorst = s.habit.id === worst?.habit.id && active.length > 1 && worst.successRate < 100;

          return (
            <div key={s.habit.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base flex-shrink-0">{s.habit.icon}</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {s.habit.label}
                  </span>
                  {isBest && (
                    <span className="flex-shrink-0 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full">
                      TOP
                    </span>
                  )}
                  {isWorst && !isBest && (
                    <span className="flex-shrink-0 text-[9px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/30 px-1.5 py-0.5 rounded-full">
                      ↓
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className="text-[11px] text-gray-400 dark:text-gray-600">
                    {s.doneDays}/{s.eligibleDays}
                  </span>
                  <span className={`text-sm font-black w-9 text-right ${
                    s.successRate >= 80 ? 'text-emerald-500' :
                    s.successRate >= 60 ? 'text-amber-500' : 'text-rose-500'
                  }`}>
                    {s.successRate}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor(s.successRate)}`}
                  style={{ width: `${s.successRate}%` }}
                />
              </div>
              {i < active.length - 1 && (
                <div className="border-b border-gray-50 dark:border-gray-800/50 mt-4" />
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {active.length >= 2 && (
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-3">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-3">
            <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Meilleure
            </p>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-0.5 truncate">
              {best.habit.icon} {best.habit.label}
            </p>
            <p className="text-lg font-black text-emerald-500">{best.successRate}%</p>
          </div>
          <div className="bg-rose-50 dark:bg-rose-900/20 rounded-2xl p-3">
            <p className="text-[9px] font-bold text-rose-500 uppercase tracking-wider">
              À renforcer
            </p>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-0.5 truncate">
              {worst.habit.icon} {worst.habit.label}
            </p>
            <p className="text-lg font-black text-rose-500">{worst.successRate}%</p>
          </div>
        </div>
      )}
    </div>
  );
}
