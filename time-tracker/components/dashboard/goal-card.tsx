"use client";

import { type Goal, type Activity } from "@/lib/types";
import { useStore } from "@/lib/store";
import { formatHours, minutesToHours } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface GoalCardProps {
  goal: Goal;
  activity: Activity;
}

export function GoalCard({ goal, activity }: GoalCardProps) {
  const { getGoalProgress, getActivityMinutes } = useStore();
  const progress = getGoalProgress(goal.id);
  const achievedMins = getActivityMinutes(activity.id, goal.frequency);
  const achievedHours = minutesToHours(achievedMins);
  const remaining = Math.max(0, goal.targetHours - achievedHours);

  const freqLabel: Record<string, string> = {
    daily: "aujourd'hui",
    weekly: "cette semaine",
    monthly: "ce mois",
    yearly: "cette année",
  };

  return (
    <Card>
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ backgroundColor: activity.color + "18" }}
        >
          {activity.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900 truncate">{activity.name}</p>
            <span className="text-xs font-bold text-gray-900 ml-2">{progress}%</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatHours(achievedMins)} / {goal.targetHours}h {freqLabel[goal.frequency]}
          </p>
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                backgroundColor: progress >= 100 ? "#10B981" : activity.color,
              }}
            />
          </div>
          {remaining > 0 && (
            <p className="text-xs text-gray-400 mt-1">Il reste {remaining.toFixed(1)}h</p>
          )}
          {progress >= 100 && (
            <p className="text-xs text-emerald-600 font-medium mt-1">✓ Objectif atteint !</p>
          )}
        </div>
      </div>
    </Card>
  );
}
