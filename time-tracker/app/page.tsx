"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Plus, TrendingUp, Zap } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { useStore } from "@/lib/store";
import { formatMinutes, formatHours, getDateRange, filterEntriesByDateRange } from "@/lib/utils";
import { CATEGORY_COLORS } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress-ring";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityBar } from "@/components/dashboard/activity-bar";
import { GoalCard } from "@/components/dashboard/goal-card";

export default function DashboardPage() {
  const { activities, timeEntries, goals, getTodayMinutes, getWeekMinutes } = useStore();

  const todayMinutes = getTodayMinutes();
  const weekMinutes = getWeekMinutes();
  const todayLabel = format(new Date(), "EEEE d MMMM", { locale: fr });

  const topActivities = useMemo(() => {
    const { start, end } = getDateRange(new Date(), "weekly");
    const weekEntries = filterEntriesByDateRange(timeEntries, start, end);
    const byActivity: Record<string, number> = {};
    weekEntries.forEach((e) => {
      byActivity[e.activityId] = (byActivity[e.activityId] || 0) + e.duration;
    });
    return Object.entries(byActivity)
      .map(([id, mins]) => ({ activity: activities.find((a) => a.id === id), mins }))
      .filter((x) => x.activity)
      .sort((a, b) => b.mins - a.mins)
      .slice(0, 4) as Array<{ activity: NonNullable<(typeof activities)[number]>; mins: number }>;
  }, [timeEntries, activities]);

  const categoryBreakdown = useMemo(() => {
    const { start, end } = getDateRange(new Date(), "monthly");
    const monthEntries = filterEntriesByDateRange(timeEntries, start, end);
    const totalMins = monthEntries.reduce((s, e) => s + e.duration, 0);
    const byCategory: Record<string, number> = {};
    monthEntries.forEach((e) => {
      const act = activities.find((a) => a.id === e.activityId);
      if (act) byCategory[act.category] = (byCategory[act.category] || 0) + e.duration;
    });
    return Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, mins]) => ({
        category: cat,
        mins,
        pct: totalMins > 0 ? Math.round((mins / totalMins) * 100) : 0,
        color: CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] || "#6B7280",
      }));
  }, [timeEntries, activities]);

  const activeGoals = goals
    .map((g) => ({
      goal: g,
      activity: activities.find((a) => a.id === g.activityId),
    }))
    .filter((x) => x.activity)
    .slice(0, 3) as Array<{ goal: (typeof goals)[number]; activity: NonNullable<(typeof activities)[number]> }>;

  const monthMinutes = useMemo(() => {
    const { start, end } = getDateRange(new Date(), "monthly");
    return filterEntriesByDateRange(timeEntries, start, end).reduce((s, e) => s + e.duration, 0);
  }, [timeEntries]);

  const dailyGoalMinutes = 480;
  const dailyProgress = Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100));

  return (
    <div className="px-4 pt-12 pb-4 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 capitalize">{todayLabel}</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-0.5">Bonjour 👋</h1>
        </div>
        <Link href="/activities">
          <Button size="icon" variant="secondary">
            <Plus size={18} />
          </Button>
        </Link>
      </div>

      {/* Today hero */}
      <Card className="!bg-gray-900 text-white border-0 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Aujourd&apos;hui</p>
            <p className="text-4xl font-bold mt-1">{formatMinutes(todayMinutes)}</p>
            <p className="text-gray-400 text-sm mt-2">
              Cette semaine &middot;{" "}
              <span className="text-white font-semibold">{formatHours(weekMinutes)}</span>
            </p>
          </div>
          <ProgressRing
            percentage={dailyProgress}
            size={88}
            strokeWidth={7}
            color="#FFFFFF"
            trackColor="rgba(255,255,255,0.15)"
          >
            <span className="text-white text-base font-bold">{dailyProgress}%</span>
          </ProgressRing>
        </div>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Cette semaine" value={formatHours(weekMinutes)} icon={TrendingUp} />
        <StatCard label="Ce mois" value={formatHours(monthMinutes)} icon={Zap} />
      </div>

      {/* Quick log */}
      <Link href="/log" className="block">
        <Button className="w-full h-14 text-base font-semibold rounded-2xl shadow-sm">
          <Plus size={20} />
          Enregistrer du temps
        </Button>
      </Link>

      {/* Top activities */}
      {topActivities.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Activités · cette semaine
          </h2>
          <Card>
            <div className="space-y-3">
              {topActivities.map(({ activity, mins }) => (
                <ActivityBar
                  key={activity.id}
                  activity={activity}
                  minutes={mins}
                  maxMinutes={topActivities[0].mins}
                />
              ))}
            </div>
          </Card>
        </section>
      )}

      {/* Goals */}
      {activeGoals.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Objectifs
            </h2>
            <Link href="/goals" className="text-xs text-gray-400 font-medium">
              Voir tout →
            </Link>
          </div>
          <div className="space-y-3">
            {activeGoals.map(({ goal, activity }) => (
              <GoalCard key={goal.id} goal={goal} activity={activity} />
            ))}
          </div>
        </section>
      )}

      {/* Category breakdown */}
      {categoryBreakdown.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Répartition · ce mois
          </h2>
          <Card>
            <div className="space-y-3">
              {categoryBreakdown.map(({ category, pct, color }) => (
                <div key={category} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-sm text-gray-700 flex-1 capitalize">{category}</span>
                  <div className="w-24 bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 w-8 text-right">{pct}%</span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}

      {/* Empty state */}
      {activities.length === 0 && (
        <div className="text-center py-12 space-y-3">
          <p className="text-5xl">⏱️</p>
          <h3 className="font-semibold text-gray-900">Suivez votre temps</h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Créez vos premières activités et commencez à mesurer ce qui compte
          </p>
          <Link href="/activities">
            <Button className="mt-2">Créer une activité</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
