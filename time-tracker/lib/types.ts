export type Frequency = "daily" | "weekly" | "monthly" | "yearly";

export type Category =
  | "work"
  | "sport"
  | "learning"
  | "health"
  | "creative"
  | "personal"
  | "other";

export interface Activity {
  id: string;
  name: string;
  category: Category;
  color: string;
  icon: string;
  goalAmount?: number;
  goalFrequency?: Frequency;
  createdAt: string;
  archived?: boolean;
}

export interface TimeEntry {
  id: string;
  activityId: string;
  date: string; // ISO date string YYYY-MM-DD
  duration: number; // minutes
  comment?: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  activityId: string;
  targetHours: number;
  frequency: Frequency;
  createdAt: string;
}

export interface DailySummary {
  date: string;
  totalMinutes: number;
  entries: TimeEntry[];
  topActivity?: Activity;
}

export interface WeeklySummary {
  weekStart: string;
  totalMinutes: number;
  bestDay: string;
  topActivity?: Activity;
  goalProgress: GoalProgress[];
}

export interface GoalProgress {
  activity: Activity;
  goal: Goal;
  achievedHours: number;
  targetHours: number;
  percentage: number;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  work: "Travail",
  sport: "Sport",
  learning: "Formation",
  health: "Santé",
  creative: "Créatif",
  personal: "Personnel",
  other: "Autre",
};

export const CATEGORY_COLORS: Record<Category, string> = {
  work: "#3B82F6",
  sport: "#10B981",
  learning: "#8B5CF6",
  health: "#EF4444",
  creative: "#F59E0B",
  personal: "#EC4899",
  other: "#6B7280",
};

export const ACTIVITY_ICONS = [
  "💼", "📚", "🏃", "🎨", "💪", "🧘", "🎵", "✍️",
  "🔬", "💻", "🍳", "🌱", "🎯", "📊", "🤝", "🏊",
  "🚴", "🧠", "🎭", "📝",
];
