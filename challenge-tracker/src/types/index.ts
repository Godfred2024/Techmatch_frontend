export interface Habit {
  id: string;
  label: string;
  icon: string;
  required: boolean;
}

export type DayStatus = 'complete' | 'partial' | 'missed' | 'future' | 'current';

export interface DayRecord {
  date: string;
  completedHabits: string[];
  note: string;
}

export interface ChallengeConfig {
  name: string;
  startDate: string;
  duration: number;
  habits: Habit[];
}

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  icon: string;
  color: string;
  description?: string;
}

export interface ChallengeData {
  config: ChallengeConfig;
  days: Record<string, DayRecord>;
  events: CalendarEvent[];
}

export interface ChallengeStats {
  completed: number;
  partial: number;
  missed: number;
  currentStreak: number;
  bestStreak: number;
  progressPercentage: number;
  currentDay: number;
  totalDays: number;
}

export type View = 'dashboard' | 'calendar' | 'progress' | 'settings';
