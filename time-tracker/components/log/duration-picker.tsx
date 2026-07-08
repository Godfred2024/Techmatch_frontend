"use client";

import { cn } from "@/lib/utils";

interface DurationPickerProps {
  hours: number;
  minutes: number;
  onHoursChange: (h: number) => void;
  onMinutesChange: (m: number) => void;
}

const HOUR_OPTIONS = Array.from({ length: 13 }, (_, i) => i);
const MINUTE_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export function DurationPicker({ hours, minutes, onHoursChange, onMinutesChange }: DurationPickerProps) {
  return (
    <div className="flex gap-3">
      <div className="flex-1">
        <p className="text-xs text-gray-400 mb-1.5 font-medium">Heures</p>
        <div className="grid grid-cols-5 gap-1.5">
          {HOUR_OPTIONS.map((h) => (
            <button
              key={h}
              onClick={() => onHoursChange(h)}
              className={cn(
                "h-9 rounded-xl text-sm font-semibold transition-all",
                hours === h
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {h}h
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-400 mb-1.5 font-medium">Minutes</p>
        <div className="grid grid-cols-4 gap-1.5">
          {MINUTE_OPTIONS.map((m) => (
            <button
              key={m}
              onClick={() => onMinutesChange(m)}
              className={cn(
                "h-9 rounded-xl text-sm font-semibold transition-all",
                minutes === m
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {m.toString().padStart(2, "0")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
