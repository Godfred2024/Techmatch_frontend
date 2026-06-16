import { useState } from 'react';
import { CalendarEvent, ChallengeConfig, DayRecord } from '../types';
import { getDayStatus, getDayNumber, getTodayString } from '../utils/calculations';
import { DailyChecklist } from './DailyChecklist';
import { EventForm } from './EventForm';
import { CalendarDayCell, habitColor } from './CalendarDayCell';

interface Props {
  config: ChallengeConfig;
  days: Record<string, DayRecord>;
  events: CalendarEvent[];
  onToggle: (date: string, habitId: string) => void;
  onNoteChange: (date: string, note: string) => void;
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onUpdateEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
}

export function CalendarView({ config, days, events, onToggle, onNoteChange, onAddEvent, onUpdateEvent, onDeleteEvent }: Props) {
  const today = getTodayString();
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  function getDaysInMonth(year: number, month: number): (string | null)[] {
    const firstDay = new Date(year, month, 1).getDay();
    const monday0 = (firstDay + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (string | null)[] = Array(monday0).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const m = String(month + 1).padStart(2, '0');
      const day = String(d).padStart(2, '0');
      cells.push(`${year}-${m}-${day}`);
    }
    return cells;
  }

  const cells = getDaysInMonth(viewYear, viewMonth);
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('fr-FR', {
    month: 'long', year: 'numeric',
  });

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(v => v - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(v => v + 1); }
    else setViewMonth(m => m + 1);
  }

  function getEventsForDate(date: string) {
    return events.filter(e => e.date === date);
  }

  const selectedRecord = selectedDate
    ? (days[selectedDate] ?? { date: selectedDate, completedHabits: [], note: '' })
    : null;
  const dayNumForSelected = selectedDate ? getDayNumber(config.startDate, selectedDate) : 0;
  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  function closeDetail() {
    setSelectedDate(null);
    setShowEventForm(false);
    setEditingEvent(null);
  }

  function handleSaveEvent(event: Omit<CalendarEvent, 'id'>) {
    if (editingEvent) {
      onUpdateEvent({ ...event, id: editingEvent.id });
    } else {
      onAddEvent(event);
    }
    setShowEventForm(false);
    setEditingEvent(null);
  }

  function startEdit(event: CalendarEvent) {
    setEditingEvent(event);
    setShowEventForm(true);
  }

  // Max 4 habits shown in dots per cell — legend shows what each color means
  const legendHabits = config.habits.slice(0, 4);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Calendar card */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-200 capitalize">{monthLabel}</h2>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 mb-1">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
            <div key={i} className="text-center text-[10px] font-bold text-gray-400 dark:text-gray-600 py-1">{d}</div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((dateStr, idx) => {
            if (!dateStr) return <div key={idx} />;

            const dayNum = getDayNumber(config.startDate, dateStr);
            const isInChallenge = dayNum >= 1 && dayNum <= config.duration;
            const status = isInChallenge
              ? getDayStatus(dateStr, days[dateStr], config.habits, config.startDate, config.duration)
              : null;

            return (
              <CalendarDayCell
                key={idx}
                dateStr={dateStr}
                isInChallenge={isInChallenge}
                status={status}
                record={days[dateStr]}
                habits={config.habits}
                events={getEventsForDate(dateStr)}
                isSelected={dateStr === selectedDate}
                onClick={() => setSelectedDate(dateStr === selectedDate ? null : dateStr)}
              />
            );
          })}
        </div>

        {/* Habit color legend */}
        {legendHabits.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
            <p className="text-[9px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-2">
              Habitudes (points colorés)
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {config.habits.slice(0, 8).map(h => (
                <div key={h.id} className="flex items-center gap-1.5 min-w-0">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: habitColor(h.id) }}
                  />
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{h.icon} {h.label}</span>
                </div>
              ))}
            </div>
            {config.habits.length > 8 && (
              <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1">
                +{config.habits.length - 8} autres habitudes
              </p>
            )}
          </div>
        )}

        {/* Status legend */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 justify-center">
          {([
            { color: '#10b981', label: 'Complet' },
            { color: '#f59e0b', label: 'Partiel' },
            { color: '#f43f5e', label: 'Manqué' },
            { color: '#6366f1', label: "Aujourd'hui" },
          ] as const).map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[10px] text-gray-400 dark:text-gray-600">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[10px] text-gray-400 dark:text-gray-600">Événement</span>
          </div>
        </div>
      </div>

      {/* Day detail panel */}
      {selectedDate && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
                {dayNumForSelected >= 1 && dayNumForSelected <= config.duration
                  ? `Jour ${dayNumForSelected}`
                  : 'Hors challenge'}
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-600">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('fr-FR', {
                  weekday: 'long', day: 'numeric', month: 'long',
                })}
              </p>
            </div>
            <button onClick={closeDetail} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Events section */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Événements ({selectedEvents.length})
              </p>
              {!showEventForm && (
                <button
                  onClick={() => { setShowEventForm(true); setEditingEvent(null); }}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter
                </button>
              )}
            </div>

            {showEventForm && (
              <div className="mb-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
                <EventForm
                  date={selectedDate}
                  initial={editingEvent ?? undefined}
                  onSave={handleSaveEvent}
                  onCancel={() => { setShowEventForm(false); setEditingEvent(null); }}
                />
              </div>
            )}

            {selectedEvents.length === 0 && !showEventForm && (
              <p className="text-xs text-gray-300 dark:text-gray-600 italic py-2">
                Aucun événement — clique sur "Ajouter" pour en créer un.
              </p>
            )}

            <div className="space-y-2">
              {selectedEvents.map(event => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-2xl border-l-4 bg-gray-50 dark:bg-gray-800/60"
                  style={{ borderLeftColor: event.color }}
                >
                  <span className="text-xl flex-shrink-0 mt-0.5">{event.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{event.title}</p>
                    {event.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{event.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => startEdit(event)}
                      className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDeleteEvent(event.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Habit checklist (challenge days only) */}
          {selectedRecord && dayNumForSelected >= 1 && dayNumForSelected <= config.duration && (
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Habitudes du jour
              </p>
              <DailyChecklist
                date={selectedDate}
                record={selectedRecord}
                habits={config.habits}
                onToggle={habitId => onToggle(selectedDate, habitId)}
                onNoteChange={note => onNoteChange(selectedDate, note)}
                readonly={selectedDate > today}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
