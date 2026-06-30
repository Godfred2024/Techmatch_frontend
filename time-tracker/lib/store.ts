"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  type Activity,
  type TimeEntry,
  type Goal,
  type Frequency,
  type CustomCategory,
  DEFAULT_CATEGORIES,
} from "./types";
import {
  generateId,
  today,
  getDateRange,
  filterEntriesByDateRange,
  minutesToHours,
} from "./utils";

interface AppState {
  activities: Activity[];
  timeEntries: TimeEntry[];
  goals: Goal[];
  categories: CustomCategory[];

  // Activity actions
  addActivity: (data: Omit<Activity, "id" | "createdAt">) => string;
  updateActivity: (id: string, data: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;

  // TimeEntry actions
  addTimeEntry: (data: Omit<TimeEntry, "id" | "createdAt">) => void;
  updateTimeEntry: (id: string, data: Partial<TimeEntry>) => void;
  deleteTimeEntry: (id: string) => void;

  // Goal actions
  addGoal: (data: Omit<Goal, "id" | "createdAt">) => string;
  updateGoal: (id: string, data: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  // Category actions
  addCategory: (data: Omit<CustomCategory, "id" | "isDefault">) => string;
  updateCategory: (id: string, data: Partial<Omit<CustomCategory, "id" | "isDefault">>) => void;
  deleteCategory: (id: string) => void;

  // Computed
  getTodayMinutes: () => number;
  getWeekMinutes: () => number;
  getMonthMinutes: () => number;
  getActivityMinutes: (activityId: string, frequency: Frequency) => number;
  getGoalProgress: (goalId: string) => number;
  getCategoryById: (id: string) => CustomCategory | undefined;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      activities: [],
      timeEntries: [],
      goals: [],
      categories: DEFAULT_CATEGORIES,

      addActivity: (data) => {
        const id = generateId();
        const activity: Activity = {
          ...data,
          id,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ activities: [...s.activities, activity] }));

        // Auto-create goal if goalAmount is set
        if (data.goalAmount && data.goalFrequency) {
          get().addGoal({
            activityId: id,
            targetHours: data.goalAmount,
            frequency: data.goalFrequency,
            autoCreated: true,
          });
        }

        return id;
      },

      updateActivity: (id, data) => {
        const { activities, goals } = get();
        const current = activities.find((a) => a.id === id);
        if (!current) return;

        const merged = { ...current, ...data };

        set((s) => ({
          activities: s.activities.map((a) =>
            a.id === id ? { ...a, ...data } : a
          ),
        }));

        // Sync auto-created goal
        const existingGoal = goals.find(
          (g) => g.activityId === id && g.autoCreated
        );

        if (merged.goalAmount && merged.goalFrequency) {
          if (existingGoal) {
            get().updateGoal(existingGoal.id, {
              targetHours: merged.goalAmount,
              frequency: merged.goalFrequency,
            });
          } else {
            get().addGoal({
              activityId: id,
              targetHours: merged.goalAmount,
              frequency: merged.goalFrequency,
              autoCreated: true,
            });
          }
        } else if (!merged.goalAmount && existingGoal) {
          get().deleteGoal(existingGoal.id);
        }
      },

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
            {
              ...data,
              id: generateId(),
              createdAt: new Date().toISOString(),
            },
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

      addGoal: (data) => {
        const id = generateId();
        set((s) => ({
          goals: [
            ...s.goals,
            { ...data, id, createdAt: new Date().toISOString() },
          ],
        }));
        return id;
      },

      updateGoal: (id, data) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === id ? { ...g, ...data } : g
          ),
        })),

      deleteGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      addCategory: (data) => {
        const id = generateId();
        set((s) => ({
          categories: [
            ...s.categories,
            { ...data, id, isDefault: false },
          ],
        }));
        return id;
      },

      updateCategory: (id, data) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        })),

      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
        })),

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
        return filterEntriesByDateRange(timeEntries, start, end).reduce(
          (sum, e) => sum + e.duration,
          0
        );
      },

      getMonthMinutes: () => {
        const { timeEntries } = get();
        const { start, end } = getDateRange(new Date(), "monthly");
        return filterEntriesByDateRange(timeEntries, start, end).reduce(
          (sum, e) => sum + e.duration,
          0
        );
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
        const achievedMinutes = getActivityMinutes(
          goal.activityId,
          goal.frequency
        );
        const achievedHours = minutesToHours(achievedMinutes);
        return Math.min(
          100,
          Math.round((achievedHours / goal.targetHours) * 100)
        );
      },

      getCategoryById: (id) => {
        return get().categories.find((c) => c.id === id);
      },
    }),
    {
      name: "timetracker-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
