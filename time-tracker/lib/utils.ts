import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isWithinInterval,
  parseISO,
  differenceInDays,
} from "date-fns";
import { fr } from "date-fns/locale";
import { type Frequency } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h${m.toString().padStart(2, "0")}`;
}

export function formatHours(minutes: number): string {
  return (minutes / 60).toFixed(1) + "h";
}

export function minutesToHours(minutes: number): number {
  return parseFloat((minutes / 60).toFixed(2));
}

export function hoursToMinutes(hours: number): number {
  return Math.round(hours * 60);
}

export function getDateRange(
  date: Date,
  frequency: Frequency
): { start: Date; end: Date } {
  switch (frequency) {
    case "daily":
      return { start: date, end: date };
    case "weekly":
      return {
        start: startOfWeek(date, { weekStartsOn: 1 }),
        end: endOfWeek(date, { weekStartsOn: 1 }),
      };
    case "monthly":
      return { start: startOfMonth(date), end: endOfMonth(date) };
    case "yearly":
      return { start: startOfYear(date), end: endOfYear(date) };
  }
}

export function filterEntriesByDateRange<T extends { date: string }>(
  entries: T[],
  start: Date,
  end: Date
): T[] {
  return entries.filter((e) => {
    const entryDate = parseISO(e.date);
    return isWithinInterval(entryDate, { start, end });
  });
}

export function formatDate(date: string | Date, fmt = "d MMM yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, fmt, { locale: fr });
}

export function today(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function getDaysInCurrentWeek(): string[] {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return format(d, "yyyy-MM-dd");
  });
}

export function getDaysInCurrentMonth(): string[] {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  const days: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    days.push(format(cur, "yyyy-MM-dd"));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

export function getWeeksInCurrentMonth(): string[][] {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  const weeks: string[][] = [];
  let currentWeek: string[] = [];

  // Fill leading empty days
  const firstDayOfWeek = (start.getDay() + 6) % 7; // Monday = 0
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push("");
  }

  const cur = new Date(start);
  while (cur <= end) {
    currentWeek.push(format(cur, "yyyy-MM-dd"));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    cur.setDate(cur.getDate() + 1);
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push("");
    weeks.push(currentWeek);
  }

  return weeks;
}

export function differenceFromToday(dateStr: string): number {
  return differenceInDays(parseISO(dateStr), new Date());
}
