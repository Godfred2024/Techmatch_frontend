"use client";

import { useState, useMemo } from "react";
import { format, startOfWeek, eachDayOfInterval, endOfWeek } from "date-fns";
import { fr } from "date-fns/locale";

import { useStore } from "@/lib/store";
import { formatMinutes, getDateRange, filterEntriesByDateRange } from "@/lib/utils";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { WeekBarChart } from "@/components/charts/week-bar-chart";
import { cn } from "@/lib/utils";

type Period = "week" | "month" | "year";

const PERIOD_TO_FREQUENCY: Record<Period, "weekly" | "monthly" | "yearly"> = {
  week: "weekly",
  month: "monthly",
  year: "yearly",
};

export default function StatsPage() {
  const { activities, timeEntries } = useStore();
  const [period, setPeriod] = useState<Period>("week");

  const { start, end } = useMemo(
    () => getDateRange(new Date(), PERIOD_TO_FREQUENCY[period]),
    [period]
  );

  const periodEntries = useMemo(
    () => filterEntriesByDateRange(timeEntries, start, end),
    [timeEntries, start, end]
  );

  const totalMinutes = periodEntries.reduce((s, e) => s + e.duration, 0);

  // By activity
  const byActivity = useMemo(() => {
    const map: Record<string, number> = {};
    periodEntries.forEach((e) => {
      map[e.activityId] = (map[e.activityId] || 0) + e.duration;
    });
    return Object.entries(map)
      .map(([id, mins]) => ({ activity: activities.find((a) => a.id === id), mins }))
      .filter((x) => x.activity)
      .sort((a, b) => b.mins - a.mins) as Array<{
        activity: NonNullable<ReturnType<typeof activities.find>>;
        mins: number;
      }>;
  }, [periodEntries, activities]);

  // By category
  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    periodEntries.forEach((e) => {
      const act = activities.find((a) => a.id === e.activityId);
      if (act) map[act.category] = (map[act.category] || 0) + e.duration;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, mins]) => ({
        category: cat,
        label: CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] || cat,
        mins,
        pct: totalMinutes > 0 ? Math.round((mins / totalMinutes) * 100) : 0,
        color: CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] || "#6B7280",
      }));
  }, [periodEntries, activities, totalMinutes]);

  // Daily data for chart (week view)
  const weekDays = useMemo(() => {
    const now = new Date();
    const ws = startOfWeek(now, { weekStartsOn: 1 });
    const we = endOfWeek(now, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: ws, end: we }).map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const mins = timeEntries
        .filter((e) => e.date === dateStr)
        .reduce((s, e) => s + e.duration, 0);
      return { label: format(day, "EEE", { locale: fr }), mins, date: dateStr };
    });
  }, [timeEntries]);

  const periodLabels: Record<Period, string> = {
    week: "cette semaine",
    month: "ce mois",
    year: "cette année",
  };

  return (
    <div className="px-4 pt-12 pb-4 space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
        <p className="text-sm text-gray-400 mt-0.5">Analysez votre temps</p>
      </div>

      {/* Period tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl">
        {(["week", "month", "year"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              "flex-1 py-2 text-sm font-semibold rounded-xl transition-all",
              period === p ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
            )}
          >
            {p === "week" ? "Semaine" : p === "month" ? "Mois" : "Année"}
          </button>
        ))}
      </div>

      {/* Total */}
      <Card className="!bg-gray-900 text-white border-0">
        <p className="text-gray-400 text-sm">Total {periodLabels[period]}</p>
        <p className="text-4xl font-bold mt-1">{formatMinutes(totalMinutes)}</p>
        <p className="text-gray-400 text-sm mt-2">
          {periodEntries.length} entrée{periodEntries.length > 1 ? "s" : ""}
          {totalMinutes > 0 && (() => {
            const uniqueDays = new Set(periodEntries.map((e) => e.date)).size;
            return ` · moy. ${formatMinutes(Math.round(totalMinutes / Math.max(1, uniqueDays)))}/jour`;
          })()}
        </p>
      </Card>

      {/* Week bar chart */}
      {period === "week" && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Par jour
          </h2>
          <Card>
            <WeekBarChart data={weekDays} />
          </Card>
        </section>
      )}

      {/* By activity */}
      {byActivity.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Par activité
          </h2>
          <Card>
            <div className="space-y-4">
              {byActivity.map(({ activity, mins }) => {
                const pct = totalMinutes > 0 ? Math.round((mins / totalMinutes) * 100) : 0;
                return (
                  <div key={activity.id}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-base">{activity.icon}</span>
                      <span className="text-sm font-medium text-gray-800 flex-1 truncate">{activity.name}</span>
                      <span className="text-xs text-gray-400">{pct}%</span>
                      <span className="text-sm font-bold text-gray-700">{formatMinutes(mins)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: activity.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>
      )}

      {/* By category */}
      {byCategory.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Par catégorie
          </h2>
          <Card>
            {/* Mini donut visual */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-2.5 flex-1 rounded-full overflow-hidden gap-0.5">
                {byCategory.map(({ category, pct, color }) => (
                  <div
                    key={category}
                    className="h-full first:rounded-l-full last:rounded-r-full"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2.5">
              {byCategory.map(({ category, label, mins, pct, color }) => (
                <div key={category} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-sm text-gray-700 flex-1">{label}</span>
                  <span className="text-xs text-gray-400">{pct}%</span>
                  <span className="text-sm font-semibold text-gray-700">{formatMinutes(mins)}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}

      {/* Empty */}
      {periodEntries.length === 0 && (
        <div className="text-center py-16 space-y-2">
          <p className="text-4xl">📊</p>
          <p className="font-medium text-gray-700">Pas de données {periodLabels[period]}</p>
          <p className="text-sm text-gray-400">Commencez à enregistrer du temps</p>
        </div>
      )}
    </div>
  );
}
