"use client";

import { useState, useMemo } from "react";
import { format, addMonths, subMonths, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";

import { useStore } from "@/lib/store";
import { formatMinutes, today } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

export default function CalendarPage() {
  const { activities, timeEntries } = useStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end }).map((d) => format(d, "yyyy-MM-dd"));

    const firstDow = (getDay(start) + 6) % 7; // Mon = 0
    const prefix = Array(firstDow).fill("");

    const totalCells = Math.ceil((days.length + firstDow) / 7) * 7;
    const suffix = Array(totalCells - days.length - firstDow).fill("");

    return [...prefix, ...days, ...suffix];
  }, [currentMonth]);

  // Minutes per date
  const minutesByDate = useMemo(() => {
    const map: Record<string, number> = {};
    timeEntries.forEach((e) => {
      map[e.date] = (map[e.date] || 0) + e.duration;
    });
    return map;
  }, [timeEntries]);

  const maxDayMinutes = Math.max(...Object.values(minutesByDate), 1);

  // Selected day entries
  const selectedEntries = useMemo(() => {
    if (!selectedDay) return [];
    return timeEntries.filter((e) => e.date === selectedDay);
  }, [timeEntries, selectedDay]);

  const selectedTotal = selectedEntries.reduce((s, e) => s + e.duration, 0);
  const todayStr = today();

  function getActivity(id: string) {
    return activities.find((a) => a.id === id);
  }

  return (
    <div className="px-4 pt-12 pb-4 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendrier</h1>
          <p className="text-sm text-gray-400 mt-0.5 capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: fr })}
          </p>
        </div>
        <div className="flex gap-1">
          <Button size="icon-sm" variant="secondary" onClick={() => setCurrentMonth((d) => subMonths(d, 1))}>
            <ChevronLeft size={16} />
          </Button>
          <Button size="icon-sm" variant="secondary" onClick={() => setCurrentMonth((d) => addMonths(d, 1))}>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <Card>
        {/* Day labels */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_LABELS.map((d, i) => (
            <div key={i} className="text-center text-[10px] font-semibold text-gray-400 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-0.5">
          {calendarDays.map((dateStr, i) => {
            if (!dateStr) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }

            const mins = minutesByDate[dateStr] || 0;
            const intensity = mins > 0 ? Math.max(0.15, mins / maxDayMinutes) : 0;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDay;
            const dayNum = format(parseISO(dateStr), "d");

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDay(dateStr === selectedDay ? null : dateStr)}
                className={cn(
                  "aspect-square flex flex-col items-center justify-center rounded-xl transition-all relative",
                  isSelected && "ring-2 ring-gray-900",
                  !isSelected && "hover:bg-gray-50"
                )}
              >
                <span
                  className={cn(
                    "text-xs font-semibold z-10",
                    isToday ? "text-white" : isSelected ? "text-gray-900" : "text-gray-700"
                  )}
                >
                  {dayNum}
                </span>
                {mins > 0 && (
                  <div
                    className="absolute inset-1 rounded-lg"
                    style={{
                      backgroundColor: isToday ? "#111827" : `rgba(17, 24, 39, ${intensity * 0.3})`,
                    }}
                  />
                )}
                {isToday && !mins && (
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-900 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
          <span className="text-xs text-gray-400">Moins</span>
          {[0.1, 0.3, 0.5, 0.7, 0.9].map((v) => (
            <div
              key={v}
              className="w-4 h-4 rounded"
              style={{ backgroundColor: `rgba(17, 24, 39, ${v * 0.3})` }}
            />
          ))}
          <span className="text-xs text-gray-400">Plus</span>
        </div>
      </Card>

      {/* Selected day detail */}
      {selectedDay && (
        <section className="animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 capitalize">
              {format(parseISO(selectedDay), "EEEE d MMMM", { locale: fr })}
            </h2>
            {selectedTotal > 0 && (
              <span className="text-sm font-bold text-gray-900">{formatMinutes(selectedTotal)}</span>
            )}
          </div>

          {selectedEntries.length > 0 ? (
            <div className="space-y-2">
              {selectedEntries.map((entry) => {
                const act = getActivity(entry.activityId);
                if (!act) return null;
                return (
                  <Card key={entry.id} className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: act.color + "18" }}
                    >
                      {act.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{act.name}</p>
                      {entry.comment && (
                        <p className="text-xs text-gray-400 truncate flex items-center gap-1 mt-0.5">
                          <MessageSquare size={9} />
                          {entry.comment}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-bold text-gray-600 shrink-0">
                      {formatMinutes(entry.duration)}
                    </span>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="text-center py-6">
              <p className="text-sm text-gray-400">Aucune entrée ce jour-là</p>
            </Card>
          )}
        </section>
      )}
    </div>
  );
}
