import { type Activity } from "@/lib/types";
import { formatMinutes } from "@/lib/utils";

interface ActivityBarProps {
  activity: Activity;
  minutes: number;
  maxMinutes: number;
}

export function ActivityBar({ activity, minutes, maxMinutes }: ActivityBarProps) {
  const pct = maxMinutes > 0 ? Math.round((minutes / maxMinutes) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0"
        style={{ backgroundColor: activity.color + "18" }}
      >
        {activity.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-800 truncate">{activity.name}</span>
          <span className="text-xs font-semibold text-gray-500 ml-2 shrink-0">{formatMinutes(minutes)}</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: activity.color }}
          />
        </div>
      </div>
    </div>
  );
}
