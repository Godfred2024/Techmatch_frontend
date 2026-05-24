import { ChallengeData, ChallengeStats, DayRecord, DayStatus, Habit } from '../types';

export function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDayNumber(startDate: string, date: string): number {
  const start = new Date(startDate + 'T00:00:00');
  const target = new Date(date + 'T00:00:00');
  const diff = Math.round((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diff + 1;
}

function isComplete(record: DayRecord | undefined, habits: Habit[]): boolean {
  if (!record) return false;
  const required = habits.filter(h => h.required);
  return required.every(h => record.completedHabits.includes(h.id));
}

function hasAnyHabit(record: DayRecord | undefined): boolean {
  return !!(record && record.completedHabits.length > 0);
}

export function getDayStatus(
  date: string,
  record: DayRecord | undefined,
  habits: Habit[],
  startDate: string,
  duration: number
): DayStatus {
  const today = getTodayString();
  const dayNum = getDayNumber(startDate, date);

  if (dayNum < 1 || dayNum > duration) return 'future';
  if (date > today) return 'future';

  if (date === today) {
    if (isComplete(record, habits)) return 'complete';
    if (hasAnyHabit(record)) return 'partial';
    return 'current';
  }

  if (isComplete(record, habits)) return 'complete';
  if (hasAnyHabit(record)) return 'partial';
  return 'missed';
}

export function iterateDays(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${day}`);
  }
  return dates;
}

export function calculateStats(data: ChallengeData): ChallengeStats {
  const { config, days } = data;
  const today = getTodayString();

  const endDateObj = new Date(config.startDate + 'T00:00:00');
  endDateObj.setDate(endDateObj.getDate() + config.duration - 1);
  const endDate = endDateObj.toISOString().split('T')[0];

  const allPastDates = iterateDays(config.startDate, today < endDate ? today : endDate);

  let completed = 0;
  let partial = 0;
  let missed = 0;

  for (const dateStr of allPastDates) {
    const dayNum = getDayNumber(config.startDate, dateStr);
    if (dayNum < 1 || dayNum > config.duration) continue;
    const status = getDayStatus(dateStr, days[dateStr], config.habits, config.startDate, config.duration);
    if (status === 'complete') completed++;
    else if (status === 'partial') partial++;
    else if (status === 'missed') missed++;
  }

  let bestStreak = 0;
  let tempStreak = 0;
  let currentStreak = 0;

  for (const dateStr of allPastDates) {
    const dayNum = getDayNumber(config.startDate, dateStr);
    if (dayNum < 1 || dayNum > config.duration) continue;
    const status = getDayStatus(dateStr, days[dateStr], config.habits, config.startDate, config.duration);
    if (status === 'complete') {
      tempStreak++;
      if (tempStreak > bestStreak) bestStreak = tempStreak;
    } else if (status !== 'current') {
      tempStreak = 0;
    }
  }

  for (let i = allPastDates.length - 1; i >= 0; i--) {
    const dateStr = allPastDates[i];
    const dayNum = getDayNumber(config.startDate, dateStr);
    if (dayNum < 1 || dayNum > config.duration) continue;
    const status = getDayStatus(dateStr, days[dateStr], config.habits, config.startDate, config.duration);
    if (status === 'complete') {
      currentStreak++;
    } else if (status === 'current') {
      continue;
    } else {
      break;
    }
  }

  const currentDay = Math.max(1, Math.min(getDayNumber(config.startDate, today), config.duration));
  const progressPercentage = Math.round((completed / config.duration) * 100);

  return { completed, partial, missed, currentStreak, bestStreak, progressPercentage, currentDay, totalDays: config.duration };
}
