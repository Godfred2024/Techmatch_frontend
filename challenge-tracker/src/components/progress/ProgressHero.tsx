interface Props {
  challengeName: string;
  currentDay: number;
  totalDays: number;
  perfectDays: number;
  currentStreak: number;
}

export function ProgressHero({ challengeName, currentDay, totalDays, perfectDays, currentStreak }: Props) {
  const pct = Math.round((perfectDays / totalDays) * 100);
  const R = 56;
  const circ = 2 * Math.PI * R;
  const offset = circ * (1 - pct / 100);
  const remaining = totalDays - currentDay;

  return (
    <div className="bg-gray-950 rounded-3xl p-6 text-white shadow-lg overflow-hidden relative">
      {/* Subtle background glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-5">{challengeName}</p>

      <div className="flex items-center justify-between gap-4">
        {/* Left: day + streak */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-5xl font-black tracking-tight leading-none">
              Jour {currentDay}
            </span>
            <span className="text-gray-500 text-xl font-light">/ {totalDays}</span>
          </div>

          <p className="text-gray-500 text-xs mt-2">
            {remaining > 0 ? `${remaining} jours restants` : 'Challenge terminé !'}
          </p>

          <div className="flex items-center gap-2 mt-5">
            <div className="flex items-center gap-1.5 bg-orange-500/15 px-3 py-1.5 rounded-xl">
              <span className="text-base leading-none">🔥</span>
              <span className="text-orange-400 font-black text-lg leading-none">{currentStreak}</span>
              <span className="text-orange-400/70 text-xs">jours</span>
            </div>
            <span className="text-gray-600 text-xs">série actuelle</span>
          </div>
        </div>

        {/* Right: big progress ring */}
        <div className="relative flex-shrink-0">
          <svg width="128" height="128" className="-rotate-90">
            {/* Track */}
            <circle cx="64" cy="64" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
            {/* Progress arc */}
            <circle
              cx="64" cy="64" r={R}
              fill="none"
              stroke={pct === 100 ? '#34d399' : '#818cf8'}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black">{pct}%</span>
            <span className="text-gray-500 text-[10px] font-medium uppercase tracking-wide">complété</span>
          </div>
        </div>
      </div>

      {/* Day range mini bar */}
      <div className="mt-5">
        <div className="flex justify-between text-[10px] text-gray-600 mb-1">
          <span>Début</span>
          <span>Fin</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, Math.round((currentDay / totalDays) * 100))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
