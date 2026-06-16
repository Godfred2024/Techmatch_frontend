import { ChallengeConfig, ChallengeData, DayRecord, Habit } from '../types';
import { getDayNumber, getActiveHabitsForDate, getEndDate, iterateDays } from './calculations';

// --- helpers ---

function dayScore(date: string, record: DayRecord | undefined, habits: Habit[]): number {
  const active = getActiveHabitsForDate(habits, date);
  if (active.length === 0) return 0;
  if (!record) return 0;
  const done = active.filter(h => record.completedHabits.includes(h.id)).length;
  return Math.round((done / active.length) * 100);
}

function dayComplete(date: string, record: DayRecord | undefined, habits: Habit[]): boolean {
  const active = getActiveHabitsForDate(habits, date);
  const required = active.filter(h => h.required);
  if (required.length === 0 || !record) return false;
  return required.every(h => record.completedHabits.includes(h.id));
}

function challengeDates(config: ChallengeConfig, today: string): string[] {
  const end = getEndDate(config.startDate, config.duration);
  return iterateDays(config.startDate, today < end ? today : end).filter(d => {
    const n = getDayNumber(config.startDate, d);
    return n >= 1 && n <= config.duration;
  });
}

// --- exports ---

export function calculatePerfectDays(data: ChallengeData, today: string): number {
  return challengeDates(data.config, today).filter(
    d => dayComplete(d, data.days[d], data.config.habits)
  ).length;
}

export function calculateCurrentStreak(data: ChallengeData, today: string): number {
  const dates = challengeDates(data.config, today);
  let streak = 0;
  for (let i = dates.length - 1; i >= 0; i--) {
    const d = dates[i];
    if (d === today) continue; // today is in-progress, doesn't break the streak
    if (dayComplete(d, data.days[d], data.config.habits)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function calculateBestStreak(data: ChallengeData, today: string): number {
  const dates = challengeDates(data.config, today);
  let best = 0;
  let cur = 0;
  for (const d of dates) {
    if (d === today) break;
    if (dayComplete(d, data.days[d], data.config.habits)) {
      cur++;
      if (cur > best) best = cur;
    } else {
      cur = 0;
    }
  }
  return best;
}

export interface HabitStat {
  habit: Habit;
  eligibleDays: number;
  doneDays: number;
  successRate: number;
}

export function calculateHabitStats(data: ChallengeData, today: string): HabitStat[] {
  const dates = challengeDates(data.config, today);
  return data.config.habits
    .map(habit => {
      let eligible = 0;
      let done = 0;
      for (const date of dates) {
        if (date === today) continue; // don't count today (in progress)
        const active = getActiveHabitsForDate([habit], date);
        if (active.length === 0) continue;
        eligible++;
        if (data.days[date]?.completedHabits.includes(habit.id)) done++;
      }
      return { habit, eligibleDays: eligible, doneDays: done, successRate: eligible > 0 ? Math.round((done / eligible) * 100) : 0 };
    })
    .sort((a, b) => b.successRate - a.successRate);
}

export interface DailyScore {
  date: string;
  dayNum: number;
  score: number;
}

export function calculateDailyScores(data: ChallengeData, today: string): DailyScore[] {
  return challengeDates(data.config, today)
    .filter(d => d !== today) // exclude in-progress today
    .map(date => ({
      date,
      dayNum: getDayNumber(data.config.startDate, date),
      score: dayScore(date, data.days[date], data.config.habits),
    }));
}

export function movingAverage(values: number[], window: number): (number | null)[] {
  return values.map((_, i) => {
    if (i + 1 < window) return null;
    const slice = values.slice(i + 1 - window, i + 1);
    return Math.round(slice.reduce((a, b) => a + b, 0) / window);
  });
}

export interface UserLevel {
  title: string;
  emoji: string;
  color: string;
  description: string;
  progressToNext: number; // 0-100
  nextTitle: string | null;
}

const LEVELS = [
  { t: 0,    title: 'Novice',       emoji: '🌱', color: '#6b7280', desc: 'Le voyage commence'           },
  { t: 0.14, title: 'Committed',    emoji: '💪', color: '#3b82f6', desc: 'Tu montres ta détermination'  },
  { t: 0.33, title: 'Disciplined',  emoji: '🎯', color: '#8b5cf6', desc: 'La régularité se forge'       },
  { t: 0.53, title: 'Focused',      emoji: '🔥', color: '#f59e0b', desc: 'Tu es dans ta zone'           },
  { t: 0.73, title: 'Elite',        emoji: '⚡', color: '#ef4444', desc: 'La plupart abandonnent ici'   },
  { t: 0.93, title: 'Unbreakable',  emoji: '👑', color: '#10b981', desc: "Rien ne peut t'arrêter"      },
];

export function calculateUserLevel(currentDay: number, totalDays: number): UserLevel {
  const pct = Math.min(1, Math.max(0, currentDay / totalDays));
  let idx = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (pct >= LEVELS[i].t) { idx = i; break; }
  }
  const cur = LEVELS[idx];
  const nxt = LEVELS[idx + 1] ?? null;
  const progressToNext = nxt
    ? Math.min(100, Math.max(0, Math.round(((pct - cur.t) / (nxt.t - cur.t)) * 100)))
    : 100;
  return { title: cur.title, emoji: cur.emoji, color: cur.color, description: cur.desc, progressToNext, nextTitle: nxt?.title ?? null };
}

export interface HeatmapCell {
  date: string;
  dayNum: number;
  score: number | null; // null = outside challenge or future
  isToday: boolean;
  isInChallenge: boolean;
  isPast: boolean;
}

export function getHeatmapCells(data: ChallengeData, today: string): HeatmapCell[] {
  const { config, days } = data;
  const end = getEndDate(config.startDate, config.duration);

  // Align start to Monday
  const startObj = new Date(config.startDate + 'T00:00:00');
  const dow = (startObj.getDay() + 6) % 7;
  const alignedStart = new Date(startObj);
  alignedStart.setDate(alignedStart.getDate() - dow);

  // Align end to Sunday
  const endObj = new Date(end + 'T00:00:00');
  const endDow = (endObj.getDay() + 6) % 7;
  const alignedEnd = new Date(endObj);
  alignedEnd.setDate(alignedEnd.getDate() + (6 - endDow));

  const cells: HeatmapCell[] = [];
  for (let d = new Date(alignedStart); d <= alignedEnd; d.setDate(d.getDate() + 1)) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const date = `${y}-${m}-${day}`;
    const dayNum = getDayNumber(config.startDate, date);
    const isInChallenge = dayNum >= 1 && dayNum <= config.duration;
    const isPast = date <= today;
    cells.push({
      date,
      dayNum,
      score: isInChallenge && isPast ? dayScore(date, days[date], config.habits) : null,
      isToday: date === today,
      isInChallenge,
      isPast,
    });
  }
  return cells;
}

export function heatmapColor(score: number | null, isToday: boolean, isInChallenge: boolean): string {
  if (!isInChallenge) return 'transparent';
  if (score === null) return ''; // future — use className
  if (isToday) return '#818cf8'; // indigo for today
  if (score >= 100) return '#10b981';
  if (score >= 75)  return '#34d399';
  if (score >= 50)  return '#fbbf24';
  if (score >= 1)   return '#f87171';
  return '#ef4444';
}
