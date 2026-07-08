"use client";

import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Trash2, MessageSquare } from "lucide-react";

import { useStore } from "@/lib/store";
import { today, formatMinutes } from "@/lib/utils";
import { type TimeEntry } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea, Select } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { DurationPicker } from "@/components/log/duration-picker";

export default function LogPage() {
  const { activities, timeEntries, addTimeEntry, deleteTimeEntry } = useStore();

  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today());
  const [activityId, setActivityId] = useState("");
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const activeActivities = activities.filter((a) => !a.archived);

  const entriesForDate = useMemo(() => {
    return timeEntries
      .filter((e) => e.date === selectedDate)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [timeEntries, selectedDate]);

  const totalMinutesToday = entriesForDate.reduce((s, e) => s + e.duration, 0);

  function handleSubmit() {
    if (!activityId) { setError("Choisissez une activité"); return; }
    const totalMins = hours * 60 + minutes;
    if (totalMins === 0) { setError("La durée doit être > 0"); return; }
    addTimeEntry({ activityId, date: selectedDate, duration: totalMins, comment: comment.trim() || undefined });
    setShowForm(false);
    setHours(0);
    setMinutes(30);
    setComment("");
    setError("");
  }

  function openForm() {
    if (activeActivities.length === 0) return;
    setActivityId(activeActivities[0].id);
    setShowForm(true);
  }

  const getActivity = (id: string) => activities.find((a) => a.id === id);

  return (
    <div className="px-4 pt-12 pb-4 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saisir</h1>
          <p className="text-sm text-gray-400 mt-0.5">Enregistrez votre temps</p>
        </div>
        <Button size="icon" onClick={openForm} disabled={activeActivities.length === 0}>
          <Plus size={18} />
        </Button>
      </div>

      {/* Date picker */}
      <div>
        <input
          type="date"
          value={selectedDate}
          max={today()}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 focus:outline-none focus:border-gray-400"
        />
      </div>

      {/* Daily total */}
      {entriesForDate.length > 0 && (
        <Card className="!bg-gray-900 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs">
                {format(parseISO(selectedDate), "EEEE d MMMM", { locale: fr })}
              </p>
              <p className="text-3xl font-bold mt-1">{formatMinutes(totalMinutesToday)}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs">{entriesForDate.length} entrée{entriesForDate.length > 1 ? "s" : ""}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Entries list */}
      {entriesForDate.length > 0 ? (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Entrées du jour
          </h2>
          <div className="space-y-2">
            {entriesForDate.map((entry) => {
              const act = getActivity(entry.activityId);
              if (!act) return null;
              return (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  activityName={act.name}
                  activityIcon={act.icon}
                  activityColor={act.color}
                  onDelete={() => deleteTimeEntry(entry.id)}
                />
              );
            })}
          </div>
        </section>
      ) : (
        <div className="text-center py-16 space-y-3">
          <p className="text-4xl">📋</p>
          <p className="font-medium text-gray-700">Aucune entrée pour ce jour</p>
          {activeActivities.length > 0 ? (
            <Button onClick={openForm}>Ajouter une entrée</Button>
          ) : (
            <p className="text-sm text-gray-400">Créez d&apos;abord une activité</p>
          )}
        </div>
      )}

      {/* Add button (floating) */}
      {activeActivities.length > 0 && entriesForDate.length > 0 && (
        <Button
          className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg text-xl"
          onClick={openForm}
          size="icon"
        >
          <Plus size={22} />
        </Button>
      )}

      {/* Form modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nouvelle entrée">
        <div className="space-y-4">
          <Select
            label="Activité"
            value={activityId}
            onChange={(e) => setActivityId(e.target.value)}
            options={activeActivities.map((a) => ({ value: a.id, label: `${a.icon} ${a.name}` }))}
          />

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Durée</p>
            <DurationPicker hours={hours} minutes={minutes} onHoursChange={setHours} onMinutesChange={setMinutes} />
          </div>

          <Textarea
            label="Commentaire (optionnel)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Notes sur cette session..."
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setShowForm(false)}>
              Annuler
            </Button>
            <Button className="flex-1" onClick={handleSubmit}>
              Enregistrer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function EntryRow({
  entry,
  activityName,
  activityIcon,
  activityColor,
  onDelete,
}: {
  entry: TimeEntry;
  activityName: string;
  activityIcon: string;
  activityColor: string;
  onDelete: () => void;
}) {
  return (
    <Card className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{ backgroundColor: activityColor + "18" }}
      >
        {activityIcon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{activityName}</p>
        {entry.comment && (
          <p className="text-xs text-gray-400 truncate flex items-center gap-1 mt-0.5">
            <MessageSquare size={10} />
            {entry.comment}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-bold text-gray-700">{formatMinutes(entry.duration)}</span>
        <Button size="icon-sm" variant="ghost" onClick={onDelete} className="text-gray-300 hover:text-red-500">
          <Trash2 size={14} />
        </Button>
      </div>
    </Card>
  );
}
