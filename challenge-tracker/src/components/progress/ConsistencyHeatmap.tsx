import { useState } from 'react';
import { ChallengeData, Habit } from '../../types';
import { getActiveHabitsForDate } from '../../utils/calculations';
import { HeatmapCell, getHeatmapCells, heatmapColor } from '../../utils/progressCalculations';

interface Props {
  data: ChallengeData;
  today: string;
  onSelectDate?: (date: string) => void;
}

const WEEK_DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function cellBg(cell: HeatmapCell): { style?: React.CSSProperties; className: string } {
  if (!cell.isInChallenge) return { className: 'bg-transparent' };
  if (cell.score === null) {
    // future
    return { className: 'bg-gray-100 dark:bg-gray-800' };
  }
  const color = heatmapColor(cell.score, cell.isToday, cell.isInChallenge);
  return { style: { backgroundColor: color }, className: '' };
}

interface DetailPanel {
  cell: HeatmapCell;
  habits: Habit[];
  completedIds: string[];
}

export function ConsistencyHeatmap({ data, today }: Props) {
  const cells = getHeatmapCells(data, today);
  const [detail, setDetail] = useState<DetailPanel | null>(null);

  function handleClick(cell: HeatmapCell) {
    if (!cell.isInChallenge) return;
    if (detail?.cell.date === cell.date) { setDetail(null); return; }

    const activeHabits = getActiveHabitsForDate(data.config.habits, cell.date);
    const record = data.days[cell.date];
    setDetail({
      cell,
      habits: activeHabits,
      completedIds: record?.completedHabits ?? [],
    });
  }

  // Group cells into weeks (rows of 7)
  const weeks: HeatmapCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
        Consistance
      </p>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEK_DAYS.map((d, i) => (
          <div key={i} className="text-center text-[9px] font-bold text-gray-400 dark:text-gray-700">{d}</div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((cell, ci) => {
              const { style, className } = cellBg(cell);
              const isSelected = detail?.cell.date === cell.date;
              return (
                <button
                  key={ci}
                  onClick={() => handleClick(cell)}
                  disabled={!cell.isInChallenge}
                  title={cell.isInChallenge ? `J${cell.dayNum} — ${cell.score !== null ? cell.score + '%' : 'à venir'}` : ''}
                  className={[
                    'aspect-square rounded-md transition-all duration-150',
                    cell.isInChallenge ? 'cursor-pointer' : 'cursor-default opacity-0',
                    isSelected ? 'ring-2 ring-indigo-400 ring-offset-1 dark:ring-offset-gray-900 scale-110 z-10' : '',
                    cell.isToday ? 'ring-2 ring-white/50' : '',
                    className,
                  ].join(' ')}
                  style={style}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Color legend */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-4 justify-center">
        {([
          { color: '#ef4444', label: 'Raté' },
          { color: '#fbbf24', label: 'Partiel' },
          { color: '#34d399', label: 'Bon' },
          { color: '#10b981', label: 'Parfait' },
          { color: '#818cf8', label: "Aujourd'hui" },
        ] as const).map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-[9px] text-gray-400 dark:text-gray-600">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-gray-100 dark:bg-gray-800" />
          <span className="text-[9px] text-gray-400 dark:text-gray-600">À venir</span>
        </div>
      </div>

      {/* Detail panel */}
      {detail && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                Jour {detail.cell.dayNum}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-600">
                {new Date(detail.cell.date + 'T00:00:00').toLocaleDateString('fr-FR', {
                  weekday: 'long', day: 'numeric', month: 'long',
                })}
              </p>
            </div>
            <div className="text-right">
              {detail.cell.score !== null ? (
                <>
                  <p className={`text-lg font-black ${
                    detail.cell.score >= 80 ? 'text-emerald-500' :
                    detail.cell.score >= 50 ? 'text-amber-500' : 'text-rose-500'
                  }`}>{detail.cell.score}%</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-600">
                    {detail.completedIds.filter(id => detail.habits.some(h => h.id === id)).length}/{detail.habits.length} habitudes
                  </p>
                </>
              ) : (
                <p className="text-xs text-gray-400 dark:text-gray-600 italic">À venir</p>
              )}
            </div>
          </div>

          {detail.cell.isPast && detail.habits.length > 0 && (
            <div className="grid grid-cols-2 gap-1">
              {detail.habits.map(h => {
                const done = detail.completedIds.includes(h.id);
                return (
                  <div
                    key={h.id}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs ${
                      done
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                        : 'bg-gray-50 dark:bg-gray-800/60 text-gray-400 dark:text-gray-600'
                    }`}
                  >
                    <span className={`text-[10px] ${done ? '' : 'opacity-40'}`}>{done ? '✅' : '❌'}</span>
                    <span className="truncate">{h.icon} {h.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {!detail.cell.isPast && (
            <p className="text-xs text-gray-400 dark:text-gray-600 italic text-center py-2">
              Cette journée n'est pas encore arrivée.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
