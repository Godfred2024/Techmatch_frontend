"use client";

import { formatMinutes } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface DayData {
  label: string;
  mins: number;
  date: string;
}

interface WeekBarChartProps {
  data: DayData[];
}

export function WeekBarChart({ data }: WeekBarChartProps) {
  const maxMins = Math.max(...data.map((d) => d.mins), 1);
  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="flex items-end gap-2 h-36 pt-2">
      {data.map((day) => {
        const pct = (day.mins / maxMins) * 100;
        const isToday = day.date === today;
        return (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
            {day.mins > 0 && (
              <span className="text-[9px] text-gray-400 font-medium">{formatMinutes(day.mins)}</span>
            )}
            <div className="w-full flex items-end" style={{ height: "80px" }}>
              <div
                className={cn(
                  "w-full rounded-t-lg transition-all duration-500",
                  isToday ? "bg-gray-900" : "bg-gray-200"
                )}
                style={{ height: `${Math.max(pct, day.mins > 0 ? 4 : 0)}%` }}
              />
            </div>
            <span
              className={cn(
                "text-[10px] font-semibold",
                isToday ? "text-gray-900" : "text-gray-400"
              )}
            >
              {day.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
