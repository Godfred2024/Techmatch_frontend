"use client";

import { useState } from "react";
import { Plus, Edit2, Archive } from "lucide-react";

import { useStore } from "@/lib/store";
import { type Activity, type Category, CATEGORY_LABELS, CATEGORY_COLORS, ACTIVITY_ICONS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const COLORS = [
  "#3B82F6", "#10B981", "#8B5CF6", "#EF4444",
  "#F59E0B", "#EC4899", "#06B6D4", "#84CC16",
  "#F97316", "#6366F1", "#14B8A6", "#A855F7",
];

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Quotidien" },
  { value: "weekly", label: "Hebdomadaire" },
  { value: "monthly", label: "Mensuel" },
  { value: "yearly", label: "Annuel" },
];

type FormState = {
  name: string;
  category: Category;
  color: string;
  icon: string;
  goalAmount: string;
  goalFrequency: string;
};

const defaultForm = (): FormState => ({
  name: "",
  category: "work",
  color: COLORS[0],
  icon: ACTIVITY_ICONS[0],
  goalAmount: "",
  goalFrequency: "weekly",
});

export default function ActivitiesPage() {
  const { activities, addActivity, updateActivity } = useStore();

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm());
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const activeActivities = activities.filter((a) => !a.archived);
  const archivedActivities = activities.filter((a) => a.archived);

  function openCreate() {
    setEditId(null);
    setForm(defaultForm());
    setErrors({});
    setShowModal(true);
  }

  function openEdit(a: Activity) {
    setEditId(a.id);
    setForm({
      name: a.name,
      category: a.category,
      color: a.color,
      icon: a.icon,
      goalAmount: a.goalAmount?.toString() ?? "",
      goalFrequency: a.goalFrequency ?? "weekly",
    });
    setErrors({});
    setShowModal(true);
  }

  function validate(): boolean {
    const newErrors: Partial<FormState> = {};
    if (!form.name.trim()) newErrors.name = "Nom requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const data = {
      name: form.name.trim(),
      category: form.category,
      color: form.color,
      icon: form.icon,
      goalAmount: form.goalAmount ? parseFloat(form.goalAmount) : undefined,
      goalFrequency: form.goalAmount ? (form.goalFrequency as import("@/lib/types").Frequency) : undefined,
    };
    if (editId) {
      updateActivity(editId, data);
    } else {
      addActivity(data);
    }
    setShowModal(false);
  }

  const update = (k: keyof FormState, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="px-4 pt-12 pb-4 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activités</h1>
          <p className="text-sm text-gray-400 mt-0.5">{activeActivities.length} actives</p>
        </div>
        <Button size="icon" onClick={openCreate}>
          <Plus size={18} />
        </Button>
      </div>

      {/* Active list */}
      {activeActivities.length > 0 ? (
        <div className="space-y-2">
          {activeActivities.map((a) => (
            <ActivityRow
              key={a.id}
              activity={a}
              onEdit={() => openEdit(a)}
              onArchive={() => updateActivity(a.id, { archived: true })}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 space-y-3">
          <p className="text-5xl">🎯</p>
          <p className="font-medium text-gray-700">Aucune activité</p>
          <p className="text-sm text-gray-400">Créez vos premières activités à suivre</p>
          <Button onClick={openCreate}>Créer une activité</Button>
        </div>
      )}

      {/* Archived */}
      {archivedActivities.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Archivées
          </h2>
          <div className="space-y-2 opacity-60">
            {archivedActivities.map((a) => (
              <Card key={a.id} className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl grayscale"
                  style={{ backgroundColor: a.color + "18" }}
                >
                  {a.icon}
                </div>
                <p className="text-sm font-medium text-gray-500 flex-1">{a.name}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => updateActivity(a.id, { archived: false })}
                  className="text-xs"
                >
                  Restaurer
                </Button>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editId ? "Modifier l'activité" : "Nouvelle activité"}
      >
        <div className="space-y-4">
          <Input
            label="Nom"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Ex : Développement, Sport..."
            error={errors.name}
          />

          <Select
            label="Catégorie"
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            options={CATEGORY_OPTIONS}
          />

          {/* Icon picker */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Icône</p>
            <div className="grid grid-cols-10 gap-1.5">
              {ACTIVITY_ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => update("icon", icon)}
                  className={cn(
                    "h-9 w-9 rounded-xl text-lg flex items-center justify-center transition-all",
                    form.icon === icon
                      ? "bg-gray-900 shadow-sm"
                      : "bg-gray-100 hover:bg-gray-200"
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Couleur</p>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => update("color", c)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all border-2",
                    form.color === c ? "border-gray-900 scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Goal */}
          <div className="flex gap-2">
            <Input
              label="Objectif (heures, optionnel)"
              type="number"
              min="0"
              step="0.5"
              value={form.goalAmount}
              onChange={(e) => update("goalAmount", e.target.value)}
              placeholder="Ex : 5"
              className="flex-1"
            />
            <Select
              label="Fréquence"
              value={form.goalFrequency}
              onChange={(e) => update("goalFrequency", e.target.value)}
              options={FREQUENCY_OPTIONS}
              className="flex-1"
            />
          </div>

          {/* Preview */}
          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ backgroundColor: form.color + "12" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ backgroundColor: form.color + "22" }}
            >
              {form.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{form.name || "Nom de l'activité"}</p>
              <Badge color={CATEGORY_COLORS[form.category as Category]}>
                {CATEGORY_LABELS[form.category as Category]}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button className="flex-1" onClick={handleSave}>
              {editId ? "Enregistrer" : "Créer"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ActivityRow({
  activity,
  onEdit,
  onArchive,
}: {
  activity: Activity;
  onEdit: () => void;
  onArchive: () => void;
}) {

  return (
    <Card className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{ backgroundColor: activity.color + "18" }}
      >
        {activity.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{activity.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge color={CATEGORY_COLORS[activity.category]}>
            {CATEGORY_LABELS[activity.category]}
          </Badge>
          {activity.goalAmount && (
            <span className="text-xs text-gray-400">
              · {activity.goalAmount}h/{activity.goalFrequency === "weekly" ? "sem." : activity.goalFrequency === "monthly" ? "mois" : activity.goalFrequency === "daily" ? "jour" : "an"}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button size="icon-sm" variant="ghost" onClick={onEdit}>
          <Edit2 size={14} />
        </Button>
        <Button size="icon-sm" variant="ghost" onClick={onArchive}>
          <Archive size={14} />
        </Button>
      </div>
    </Card>
  );
}
