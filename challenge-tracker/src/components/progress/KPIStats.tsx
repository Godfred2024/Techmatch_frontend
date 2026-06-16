interface KPICardProps {
  icon: string;
  label: string;
  value: number;
  sub: string;
  color: string;
}

function KPICard({ icon, label, value, sub, color }: KPICardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-lg">{icon}</span>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${color} opacity-60`}>{label}</span>
      </div>
      <p className={`text-4xl font-black leading-none ${color}`}>{value}</p>
      <p className="text-[11px] text-gray-400 dark:text-gray-600">{sub}</p>
    </div>
  );
}

interface Props {
  perfectDays: number;
  currentStreak: number;
  bestStreak: number;
}

export function KPIStats({ perfectDays, currentStreak, bestStreak }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <KPICard
        icon="🏆"
        label="Perfect"
        value={perfectDays}
        sub="jours parfaits"
        color="text-emerald-500"
      />
      <KPICard
        icon="⚡"
        label="Streak"
        value={currentStreak}
        sub="en cours"
        color="text-indigo-500"
      />
      <KPICard
        icon="🚀"
        label="Record"
        value={bestStreak}
        sub="meilleure série"
        color="text-violet-500"
      />
    </div>
  );
}
