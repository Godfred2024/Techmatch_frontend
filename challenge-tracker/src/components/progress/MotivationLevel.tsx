import { UserLevel } from '../../utils/progressCalculations';

interface Props {
  level: UserLevel;
}

export function MotivationLevel({ level }: Props) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
        Niveau
      </p>

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{level.emoji}</span>
            <span className="text-xl font-black text-gray-900 dark:text-white">{level.title}</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{level.description}</p>
        </div>
        {level.nextTitle && (
          <div className="text-right">
            <p className="text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-wider">Prochain</p>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">{level.nextTitle}</p>
          </div>
        )}
      </div>

      {/* Progress bar to next level */}
      {level.nextTitle ? (
        <div>
          <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-600 mb-1.5">
            <span>{level.title}</span>
            <span>{level.progressToNext}%</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${level.progressToNext}%`,
                backgroundColor: level.color,
              }}
            />
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1.5 text-right">
            → {level.nextTitle}
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-3">
          <span className="text-lg">👑</span>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            Niveau maximum atteint. Rien ne peut t'arrêter.
          </p>
        </div>
      )}
    </div>
  );
}
