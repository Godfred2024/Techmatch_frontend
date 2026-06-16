import { ChallengeData } from '../types';
import { getTodayString, getDayNumber, getEndDate } from '../utils/calculations';
import {
  calculatePerfectDays,
  calculateCurrentStreak,
  calculateBestStreak,
  calculateHabitStats,
  calculateDailyScores,
  calculateUserLevel,
} from '../utils/progressCalculations';
import { ProgressHero } from './progress/ProgressHero';
import { ConsistencyHeatmap } from './progress/ConsistencyHeatmap';
import { KPIStats } from './progress/KPIStats';
import { HabitPerformance } from './progress/HabitPerformance';
import { TrendChart } from './progress/TrendChart';
import { MotivationLevel } from './progress/MotivationLevel';

interface Props {
  data: ChallengeData;
}

export function ProgressStats({ data }: Props) {
  const today = getTodayString();
  const { config } = data;

  const currentDay = Math.max(1, Math.min(getDayNumber(config.startDate, today), config.duration));
  const perfectDays   = calculatePerfectDays(data, today);
  const currentStreak = calculateCurrentStreak(data, today);
  const bestStreak    = calculateBestStreak(data, today);
  const habitStats    = calculateHabitStats(data, today);
  const dailyScores   = calculateDailyScores(data, today);
  const level         = calculateUserLevel(currentDay, config.duration);

  // For the hero bar: we show how many challenge days have elapsed
  const endDate = getEndDate(config.startDate, config.duration);
  const isFinished = today > endDate;

  return (
    <div className="space-y-4 animate-fade-in pb-2">
      {/* 1 — Hero */}
      <ProgressHero
        challengeName={config.name}
        currentDay={isFinished ? config.duration : currentDay}
        totalDays={config.duration}
        perfectDays={perfectDays}
        currentStreak={currentStreak}
      />

      {/* 2 — Consistance */}
      <ConsistencyHeatmap data={data} today={today} />

      {/* 3 — KPI cards */}
      <KPIStats
        perfectDays={perfectDays}
        currentStreak={currentStreak}
        bestStreak={bestStreak}
      />

      {/* 4 — Habitudes */}
      <HabitPerformance stats={habitStats} />

      {/* 5 — Tendance */}
      <TrendChart scores={dailyScores} />

      {/* 6 — Niveau */}
      <MotivationLevel level={level} />
    </div>
  );
}
