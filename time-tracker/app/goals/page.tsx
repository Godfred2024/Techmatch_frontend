"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { useStore } from "@/lib/store";
import { type Goal, type Frequency } from "@/lib/types";
import { formatMinutes, minutesToHours } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { ProgressRing } from "@/components/ui/progress-ring";

const FREQ_OPTIONS = [
  { value: "daily", label: "Par jour" },
  { value: "weekly", label: "Par semaine" },
  { value: "monthly", label: "Par mois" },
  { value: "yearly", label: "Par année" },
];

const FREQ_LABELS: Record<Frequency, string> = {
  daily: "jour",
  weekly: "semaine",
  monthly: "mois",
  yearly: "an",
};

export default function GoalsPage() {
  const { activities, goals, addGoal, deleteGoal, getGoalProgress, getActivityMinutes } = useStore();

  const [showModal, setShowModal] = useState(false);
  const [activityId, setActivityId] = useState("");
  const [targetHours, setTargetHours] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const [error, setError] = useState("");

  const activeActivities = activities.filter((a) => !a.archived);

  function openCreate() {
    if (activeActivities.length === 0) return;
    setActivityId(activeActivities[0].id);
    setTargetHours("");
    setFrequency("weekly");
    setError("");
    setShowModal(true);
  }

  function handleSave() {
    const hours = parseFloat(targetHours);
    if (!activityId) { setError("Choisissez une activité"); return; }
    if (isNaN(hours) || hours <= 0) { setError("Entrez un objectif valide (heures > 0)"); return; }
    addGoal({ activityId, targetHours: hours, frequency });
    setShowModal(false);
  }

  const enrichedGoals = goals
    .map((g) => ({
      goal: g,
      activity: activities.find((a) => a.id === g.activityId),
      progress: getGoalProgress(g.id),
      achievedMins: getActivityMinutes(g.activityId, g.frequency),
    }))
    .filter((x) => x.activity);

  const completedGoals = enrichedGoals.filter((g) => g.progress >= 100);
  const ongoingGoals = enrichedGoals.filter((g) => g.progress < 100);

  return (
    <div className="px-4 pt-12 pb-4 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Objectifs</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {completedGoals.length}/{enrichedGoals.length} atteints
          </p>
        </div>
        <Button size="icon" onClick={openCreate} disabled={activeActivities.length === 0}>
          <Plus size={18} />
        </Button>
      </div>

      {/* Ongoing goals */}
      {ongoingGoals.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            En cours
          </h2>
          <div className="space-y-3">
            {ongoingGoals.map(({ goal, activity, progress, achievedMins }) => (
              <GoalDetailCard
                key={goal.id}
                goal={goal}
                activityName={activity!.name}
                activityIcon={activity!.icon}
                activityColor={activity!.color}
                progress={progress}
                achievedMins={achievedMins}
                onDelete={() => deleteGoal(goal.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Completed goals */}
      {completedGoals.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Atteints 🎉
          </h2>
          <div className="space-y-3">
            {completedGoals.map(({ goal, activity, progress, achievedMins }) => (
              <GoalDetailCard
                key={goal.id}
                goal={goal}
                activityName={activity!.name}
                activityIcon={activity!.icon}
                activityColor={activity!.color}
                progress={progress}
                achievedMins={achievedMins}
                onDelete={() => deleteGoal(goal.id)}
                completed
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty */}
      {enrichedGoals.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <p className="text-5xl">🎯</p>
          <p className="font-medium text-gray-700">Aucun objectif défini</p>
          <p className="text-sm text-gray-400 max-w-xs mx-auto">
            Définissez des objectifs pour mesurer vos progrès et vous motiver
          </p>
          {activeActivities.length > 0 ? (
            <Button onClick={openCreate}>Créer un objectif</Button>
          ) : (
            <p className="text-sm text-gray-400">Créez d&apos;abord une activité</p>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nouvel objectif">
        <div className="space-y-4">
          <Select
            label="Activité"
            value={activityId}
            onChange={(e) => setActivityId(e.target.value)}
            options={activeActivities.map((a) => ({ value: a.id, label: `${a.icon} ${a.name}` }))}
          />
          <div className="flex gap-2">
            <Input
              label="Objectif (heures)"
              type="number"
              min="0.5"
              step="0.5"
              value={targetHours}
              onChange={(e) => setTargetHours(e.target.value)}
              placeholder="Ex : 5"
              className="flex-1"
            />
            <Select
              label="Fréquence"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as Frequency)}
              options={FREQ_OPTIONS}
              className="flex-1"
            />
          </div>

          {/* Preview */}
          {targetHours && parseFloat(targetHours) > 0 && (
            <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-600 text-center">
              {parseFloat(targetHours)}h de{" "}
              <strong>{activeActivities.find((a) => a.id === activityId)?.name || "..."}</strong>{" "}
              par {FREQ_LABELS[frequency]}
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button className="flex-1" onClick={handleSave}>
              Créer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function GoalDetailCard({
  goal,
  activityName,
  activityIcon,
  activityColor,
  progress,
  achievedMins,
  onDelete,
  completed = false,
}: {
  goal: Goal;
  activityName: string;
  activityIcon: string;
  activityColor: string;
  progress: number;
  achievedMins: number;
  onDelete: () => void;
  completed?: boolean;
}) {
  const remaining = Math.max(0, goal.targetHours - minutesToHours(achievedMins));

  return (
    <Card className={completed ? "bg-emerald-50 border-emerald-100" : undefined}>
      <div className="flex items-center gap-4">
        <ProgressRing
          percentage={progress}
          size={64}
          strokeWidth={5}
          color={completed ? "#10B981" : activityColor}
          trackColor={completed ? "#D1FAE5" : "#F3F4F6"}
        >
          <span className="text-lg">{activityIcon}</span>
        </ProgressRing>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{activityName}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Objectif : {goal.targetHours}h / {FREQ_LABELS[goal.frequency]}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  backgroundColor: completed ? "#10B981" : activityColor,
                }}
              />
            </div>
            <span className="text-xs font-bold text-gray-600">{progress}%</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {formatMinutes(achievedMins)} effectué
            {!completed && ` · ${remaining.toFixed(1)}h restant`}
          </p>
          {completed && (
            <p className="text-xs text-emerald-600 font-semibold mt-0.5">✓ Objectif atteint !</p>
          )}
        </div>

        <Button size="icon-sm" variant="ghost" onClick={onDelete} className="text-gray-300 hover:text-red-500 shrink-0">
          <Trash2 size={14} />
        </Button>
      </div>
    </Card>
  );
}
