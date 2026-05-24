// react-jsx transform: no import needed;
import { ChallengeStats } from '../types';

interface Props {
  stats: ChallengeStats;
  challengeName: string;
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800`}>
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-black mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{sub}</p>}
    </div>
  );
}

export function ProgressStats({ stats, challengeName }: Props) {
  const { completed, partial, missed, currentStreak, bestStreak, progressPercentage, currentDay, totalDays } = stats;
  const remaining = totalDays - completed;

  const circumference = 2 * Math.PI * 52;
  const strokeDash = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Main progress ring */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
        <p className="text-indigo-200 text-sm font-medium uppercase tracking-widest">{challengeName}</p>
        <div className="flex items-center gap-6 mt-3">
          <div className="relative flex-shrink-0">
            <svg width="120" height="120" className="-rotate-90">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="52" fill="none"
                stroke="#34d399"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDash}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black">{progressPercentage}%</span>
              <span className="text-xs text-indigo-200">complété</span>
            </div>
          </div>
          <div className="space-y-1">
            <div>
              <p className="text-3xl font-black">Jour {currentDay}</p>
              <p className="text-indigo-200 text-sm">sur {totalDays}</p>
            </div>
            <p className="text-sm text-indigo-200">
              {remaining > 0 ? `${remaining} jours restants` : 'Challenge terminé !'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Jours complets" value={completed} sub="100% des habitudes" color="text-emerald-500" />
        <StatCard label="Jours partiels" value={partial} sub="au moins 1 habitude" color="text-amber-500" />
        <StatCard label="Jours manqués" value={missed} sub="aucune habitude" color="text-rose-500" />
        <StatCard label="Série actuelle" value={`${currentStreak}🔥`} sub="jours consécutifs" color="text-indigo-500" />
      </div>

      {/* Best streak */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Meilleure série
            </p>
            <p className="text-3xl font-black text-indigo-500 mt-1">{bestStreak} 🏆</p>
            <p className="text-xs text-gray-400 dark:text-gray-600">jours consécutifs parfaits</p>
          </div>
          <div className="text-5xl opacity-20">🏅</div>
        </div>
      </div>

      {/* Progress bar breakdown */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
          Répartition des jours
        </p>
        <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
          {completed > 0 && (
            <div
              className="bg-emerald-500 transition-all duration-700 flex items-center justify-center"
              style={{ width: `${(completed / totalDays) * 100}%` }}
              title={`Complets: ${completed}`}
            />
          )}
          {partial > 0 && (
            <div
              className="bg-amber-400 transition-all duration-700"
              style={{ width: `${(partial / totalDays) * 100}%` }}
              title={`Partiels: ${partial}`}
            />
          )}
          {missed > 0 && (
            <div
              className="bg-rose-400 transition-all duration-700"
              style={{ width: `${(missed / totalDays) * 100}%` }}
              title={`Manqués: ${missed}`}
            />
          )}
          <div className="flex-1 bg-gray-100 dark:bg-gray-800" title="Restants" />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-gray-500 dark:text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> {completed} complets</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" /> {partial} partiels</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-rose-400 inline-block" /> {missed} manqués</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-gray-200 dark:bg-gray-700 inline-block" /> {totalDays - completed - partial - missed} à venir</span>
        </div>
      </div>
    </div>
  );
}
