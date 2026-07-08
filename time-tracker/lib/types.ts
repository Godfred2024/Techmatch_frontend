export type Frequency = "daily" | "weekly" | "monthly" | "yearly";

export interface CustomCategory {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
}

export const DEFAULT_CATEGORIES: CustomCategory[] = [
  { id: "work",     name: "Travail",    color: "#3B82F6", isDefault: true },
  { id: "sport",    name: "Sport",      color: "#10B981", isDefault: true },
  { id: "learning", name: "Formation",  color: "#8B5CF6", isDefault: true },
  { id: "health",   name: "Santé",      color: "#EF4444", isDefault: true },
  { id: "creative", name: "Créatif",    color: "#F59E0B", isDefault: true },
  { id: "personal", name: "Personnel",  color: "#EC4899", isDefault: true },
  { id: "other",    name: "Autre",      color: "#6B7280", isDefault: true },
];

export interface Activity {
  id: string;
  name: string;
  category: string;
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
  date: string; // YYYY-MM-DD
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
  autoCreated?: boolean; // created from activity form
}

export const ACTIVITY_ICONS = [
  // Travail & Productivité
  "💼", "💻", "📊", "📈", "📝", "✍️", "📋", "🖥️", "⌨️", "🖱️",
  "📌", "📎", "🗂️", "🗃️", "📧", "📅", "🔧", "⚙️", "🛠️", "📡",
  // Formation & Apprentissage
  "📚", "🎓", "🔬", "🧪", "📖", "🧠", "💡", "🔭", "🧮", "🔍",
  // Sport & Santé
  "🏃", "💪", "🧘", "🏊", "🚴", "⚽", "🏋️", "🧗", "🤸", "🏸",
  "🎾", "🏈", "⛷️", "🏄", "🥊", "🤾", "🧜", "🚶", "🏇", "🤺",
  // Créatif
  "🎨", "🎵", "🎸", "🎭", "📸", "✏️", "🖌️", "🎬", "🎤", "🎷",
  "🎹", "🖊️", "✂️", "🎲", "🃏", "🎯",
  // Personnel & Lifestyle
  "🍳", "🌱", "🤝", "❤️", "🏠", "🧹", "🛒", "🌍", "🐕", "🌿",
  "☕", "🍵", "🥗", "💆", "🛁", "🌺",
  // Finance & Business
  "💰", "💳", "📉", "🏦", "💹", "🤑", "💎",
  // Mindset & Objectifs
  "🏆", "🌟", "⭐", "🎯", "🚀", "🔥", "💫", "🌈", "☀️", "🌙",
];
