"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  type Activity,
  type TimeEntry,
  type Goal,
  type Frequency,
} from "./types";
import { generateId, today, getDateRange, filterEntriesByDateRange, minutesToHours } from "./utils";

interface AppState {
  activities: Activity[];
  timeEntries: TimeEntry[];
  goals: Goal[];

  // Activity actions
  addActivity: (data: Omit<Activity, "id" | "createdAt">) => string;
  updateActivity: (id: string, data: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;

  // TimeEntry actions
  addTimeEntry: (data: Omit<TimeEntry, "id" | "createdAt">) => void;
  updateTimeEntry: (id: string, data: Partial<TimeEntry>) => void;
  deleteTimeEntry: (id: string) => void;

  // Goal actions
  addGoal: (data: Omit<Goal, "id" | "createdAt">) => void;
  updateGoal: (id: string, data: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  // Computed
  getTodayMinutes: () => number;
  getWeekMinutes: () => number;
  getMonthMinutes: () => number;
  getActivityMinutes: (activityId: string, frequency: Frequency) => number;
  getGoalProgress: (goalId: string) => number;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      activities: [],
      timeEntries: [],
      goals: [],

      addActivity: (data) => {
        const id = generateId();
        const activity: Activity = { ...data, id, createdAt: new Date().toISOString() };
        set((s) => ({ activities: [...s.activities, activity] }));
        return id;
      },

      updateActivity: (id, data) =>
        set((s) => ({
          activities: s.activities.map((a) =>
            a.id === id ? { ...a, ...data } : a
          ),
        })),

      deleteActivity: (id) =>
        set((s) => ({
          activities: s.activities.filter((a) => a.id !== id),
          timeEntries: s.timeEntries.filter((e) => e.activityId !== id),
          goals: s.goals.filter((g) => g.activityId !== id),
        })),

      addTimeEntry: (data) =>
        set((s) => ({
          timeEntries: [
            ...s.timeEntries,
            { ...data, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),

      updateTimeEntry: (id, data) =>
        set((s) => ({
          timeEntries: s.timeEntries.map((e) =>
            e.id === id ? { ...e, ...data } : e
          ),
        })),

      deleteTimeEntry: (id) =>
        set((s) => ({
          timeEntries: s.timeEntries.filter((e) => e.id !== id),
        })),

      addGoal: (data) =>
        set((s) => ({
          goals: [
            ...s.goals,
            { ...data, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),

      updateGoal: (id, data) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === id ? { ...g, ...data } : g
          ),
        })),

      deleteGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      getTodayMinutes: () => {
        const { timeEntries } = get();
        const t = today();
        return timeEntries
          .filter((e) => e.date === t)
          .reduce((sum, e) => sum + e.duration, 0);
      },

      getWeekMinutes: () => {
        const { timeEntries } = get();
        const { start, end } = getDateRange(new Date(), "weekly");
        return filterEntriesByDateRange(timeEntries, start, end)
          .reduce((sum, e) => sum + e.duration, 0);
      },

      getMonthMinutes: () => {
        const { timeEntries } = get();
        const { start, end } = getDateRange(new Date(), "monthly");
        return filterEntriesByDateRange(timeEntries, start, end)
          .reduce((sum, e) => sum + e.duration, 0);
      },

      getActivityMinutes: (activityId, frequency) => {
        const { timeEntries } = get();
        const { start, end } = getDateRange(new Date(), frequency);
        return filterEntriesByDateRange(timeEntries, start, end)
          .filter((e) => e.activityId === activityId)
          .reduce((sum, e) => sum + e.duration, 0);
      },

      getGoalProgress: (goalId) => {
        const { goals, getActivityMinutes } = get();
        const goal = goals.find((g) => g.id === goalId);
        if (!goal) return 0;
        const achievedMinutes = getActivityMinutes(goal.activityId, goal.frequency);
        const achievedHours = minutesToHours(achievedMinutes);
        return Math.min(100, Math.round((achievedHours / goal.targetHours) * 100));
      },
    }),
    {
      name: "timetracker-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
