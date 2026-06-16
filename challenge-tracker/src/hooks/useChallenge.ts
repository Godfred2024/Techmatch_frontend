import { useState, useEffect, useCallback } from 'react';
import { CalendarEvent, ChallengeConfig, ChallengeData, DayRecord, Habit } from '../types';
import { loadData, saveData } from '../utils/storage';
import { getTodayString } from '../utils/calculations';

export const DEFAULT_HABITS: Habit[] = [
  { id: 'workout',    label: 'Séance de musculation',              icon: '💪', required: true },
  { id: 'mobility',  label: 'Activité légère / marche / mobilité', icon: '🚶', required: true },
  { id: 'nutrition', label: 'Nutrition respectée',                 icon: '🥗', required: true },
  { id: 'protein',   label: 'Protéines atteintes',                 icon: '🥩', required: true },
  { id: 'hydration', label: 'Hydratation respectée',               icon: '💧', required: true },
  { id: 'reading',   label: 'Lecture effectuée',                   icon: '📚', required: true },
  { id: 'photo',     label: 'Photo de progression prise',          icon: '📸', required: true },
  { id: 'sleep',     label: 'Sommeil suffisant',                   icon: '😴', required: true },
  { id: 'no_alcohol',label: 'Aucun alcool',                        icon: '🚫', required: true },
];

function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function migrateData(raw: ChallengeData): ChallengeData {
  return {
    ...raw,
    events: raw.events ?? [],
    config: {
      ...raw.config,
      habits: raw.config.habits.map(h => ({
        ...h,
        createdAt: h.createdAt ?? raw.config.startDate,
        deactivatedAt: h.deactivatedAt ?? null,
      })),
    },
  };
}

export function useChallenge() {
  const [data, setData] = useState<ChallengeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const raw = loadData();
    setData(raw ? migrateData(raw) : null);
    setIsLoading(false);
  }, []);

  const persist = useCallback((newData: ChallengeData) => {
    setData(newData);
    saveData(newData);
  }, []);

  const setupChallenge = useCallback(
    (config: ChallengeConfig) => {
      const habits: Habit[] = config.habits.map(h => ({
        ...h,
        createdAt: h.createdAt ?? config.startDate,
        deactivatedAt: null,
      }));
      persist({ config: { ...config, habits }, days: {}, events: [] });
    },
    [persist]
  );

  const updateConfig = useCallback(
    (config: ChallengeConfig) => {
      if (!data) return;
      const today = getTodayString();
      const habits: Habit[] = config.habits.map(h => ({
        ...h,
        createdAt: h.createdAt ?? today,
        deactivatedAt: h.deactivatedAt ?? null,
      }));
      persist({ ...data, config: { ...config, habits } });
    },
    [data, persist]
  );

  const toggleHabit = useCallback(
    (date: string, habitId: string) => {
      if (!data) return;
      const existing: DayRecord = data.days[date] ?? { date, completedHabits: [], note: '' };
      const completedHabits = existing.completedHabits.includes(habitId)
        ? existing.completedHabits.filter(id => id !== habitId)
        : [...existing.completedHabits, habitId];
      persist({ ...data, days: { ...data.days, [date]: { ...existing, completedHabits } } });
    },
    [data, persist]
  );

  const updateNote = useCallback(
    (date: string, note: string) => {
      if (!data) return;
      const existing: DayRecord = data.days[date] ?? { date, completedHabits: [], note: '' };
      persist({ ...data, days: { ...data.days, [date]: { ...existing, note } } });
    },
    [data, persist]
  );

  const addEvent = useCallback(
    (event: Omit<CalendarEvent, 'id'>) => {
      if (!data) return;
      const newEvent: CalendarEvent = { ...event, id: genId() };
      persist({ ...data, events: [...(data.events ?? []), newEvent] });
    },
    [data, persist]
  );

  const updateEvent = useCallback(
    (updated: CalendarEvent) => {
      if (!data) return;
      persist({ ...data, events: (data.events ?? []).map(e => (e.id === updated.id ? updated : e)) });
    },
    [data, persist]
  );

  const deleteEvent = useCallback(
    (id: string) => {
      if (!data) return;
      persist({ ...data, events: (data.events ?? []).filter(e => e.id !== id) });
    },
    [data, persist]
  );

  const getEventsForDate = useCallback(
    (date: string): CalendarEvent[] => (data?.events ?? []).filter(e => e.date === date),
    [data]
  );

  const resetChallenge = useCallback(() => {
    if (!data) return;
    persist({ config: data.config, days: {}, events: data.events ?? [] });
  }, [data, persist]);

  const getDayRecord = useCallback(
    (date: string): DayRecord => data?.days[date] ?? { date, completedHabits: [], note: '' },
    [data]
  );

  return {
    data,
    isLoading,
    setupChallenge,
    updateConfig,
    toggleHabit,
    updateNote,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
    resetChallenge,
    getDayRecord,
    persist,
  };
}
