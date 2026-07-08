"use client";

import { useState } from "react";
import { Plus, Edit2, Archive, Tag, Trash2 } from "lucide-react";

import { useStore } from "@/lib/store";
import { type Activity, type Frequency, type CustomCategory, ACTIVITY_ICONS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ACTIVITY_COLORS = [
  "#3B82F6", "#10B981", "#8B5CF6", "#EF4444",
  "#F59E0B", "#EC4899", "#06B6D4", "#84CC16",
  "#F97316", "#6366F1", "#14B8A6", "#A855F7",
  "#0EA5E9", "#22C55E", "#E879F9", "#FB923C",
];

const CATEGORY_COLORS_PALETTE = [
  "#3B82F6", "#10B981", "#8B5CF6", "#EF4444",
  "#F59E0B", "#EC4899", "#06B6D4", "#84CC16",
  "#F97316", "#6366F1", "#14B8A6", "#0EA5E9",
];

const FREQ_OPTIONS = [
  { value: "daily",   label: "Par jour" },
  { value: "weekly",  label: "Par semaine" },
  { value: "monthly", label: "Par mois" },
  { value: "yearly",  label: "Par an" },
];

type Tab = "activities" | "categories";

type ActivityForm = {
  name: string;
  category: string;
  color: string;
  icon: string;
  goalAmount: string;
  goalFrequency: Frequency;
};

type CatForm = { name: string; color: string };

const defaultActivityForm = (firstCatId: string): ActivityForm => ({
  name: "",
  category: firstCatId,
  color: ACTIVITY_COLORS[0],
  icon: ACTIVITY_ICONS[0],
  goalAmount: "",
  goalFrequency: "weekly",
});

export default function ActivitiesPage() {
  const {
    activities, addActivity, updateActivity,
    categories, addCategory, updateCategory, deleteCategory,
  } = useStore();

  const [tab, setTab] = useState<Tab>("activities");

  // Activity modal
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editActivityId, setEditActivityId] = useState<string | null>(null);
  const [actForm, setActForm] = useState<ActivityForm>(
    defaultActivityForm(categories[0]?.id ?? "")
  );
  const [actError, setActError] = useState("");

  // Category modal
  const [showCatModal, setShowCatModal] = useState(false);
  const [editCatId, setEditCatId] = useState<string | null>(null);
  const [catForm, setCatForm] = useState<CatForm>({ name: "", color: CATEGORY_COLORS_PALETTE[0] });
  const [catError, setCatError] = useState("");

  // ── Activity handlers ──────────────────────────────────────────────────
  function openCreateActivity() {
    setEditActivityId(null);
    setActForm(defaultActivityForm(categories[0]?.id ?? ""));
    setActError("");
    setShowActivityModal(true);
  }

  function openEditActivity(a: Activity) {
    setEditActivityId(a.id);
    setActForm({
      name: a.name,
      category: a.category,
      color: a.color,
      icon: a.icon,
      goalAmount: a.goalAmount?.toString() ?? "",
      goalFrequency: a.goalFrequency ?? "weekly",
    });
    setActError("");
    setShowActivityModal(true);
  }

  function saveActivity() {
    if (!actForm.name.trim()) { setActError("Le nom est requis"); return; }
    const data = {
      name: actForm.name.trim(),
      category: actForm.category,
      color: actForm.color,
      icon: actForm.icon,
      goalAmount: actForm.goalAmount ? parseFloat(actForm.goalAmount) : undefined,
      goalFrequency: actForm.goalAmount ? actForm.goalFrequency : undefined,
    };
    if (editActivityId) {
      updateActivity(editActivityId, data);
    } else {
      addActivity(data);
    }
    setShowActivityModal(false);
  }

  // ── Category handlers ──────────────────────────────────────────────────
  function openCreateCategory() {
    setEditCatId(null);
    setCatForm({ name: "", color: CATEGORY_COLORS_PALETTE[0] });
    setCatError("");
    setShowCatModal(true);
  }

  function openEditCategory(c: CustomCategory) {
    setEditCatId(c.id);
    setCatForm({ name: c.name, color: c.color });
    setCatError("");
    setShowCatModal(true);
  }

  function saveCategory() {
    if (!catForm.name.trim()) { setCatError("Le nom est requis"); return; }
    if (editCatId) {
      updateCategory(editCatId, catForm);
    } else {
      addCategory(catForm);
    }
    setShowCatModal(false);
  }

  const activeActivities = activities.filter((a) => !a.archived);
  const archivedActivities = activities.filter((a) => a.archived);

  const getCat = (id: string) => categories.find((c) => c.id === id);

  return (
    <div className="px-4 pt-12 pb-4 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {tab === "activities" ? "Activités" : "Catégories"}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {tab === "activities" ? `${activeActivities.length} actives` : `${categories.length} au total`}
          </p>
        </div>
        <Button size="icon" onClick={tab === "activities" ? openCreateActivity : openCreateCategory}>
          <Plus size={18} />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl">
        {(["activities", "categories"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2 text-sm font-semibold rounded-xl transition-all",
              tab === t ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
            )}
          >
            {t === "activities" ? "Activités" : "Catégories"}
          </button>
        ))}
      </div>

      {/* ── Activities tab ── */}
      {tab === "activities" && (
        <>
          {activeActivities.length > 0 ? (
            <div className="space-y-2">
              {activeActivities.map((a) => {
                const cat = getCat(a.category);
                return (
                  <Card key={a.id} className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ backgroundColor: a.color + "18" }}
                    >
                      {a.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{a.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {cat && <Badge color={cat.color}>{cat.name}</Badge>}
                        {a.goalAmount && (
                          <span className="text-xs text-gray-400">
                            · {a.goalAmount}h/{a.goalFrequency === "weekly" ? "sem." : a.goalFrequency === "monthly" ? "mois" : a.goalFrequency === "daily" ? "jour" : "an"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button size="icon-sm" variant="ghost" onClick={() => openEditActivity(a)}>
                        <Edit2 size={14} />
                      </Button>
                      <Button size="icon-sm" variant="ghost" onClick={() => updateActivity(a.id, { archived: true })}>
                        <Archive size={14} />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 space-y-3">
              <p className="text-5xl">🎯</p>
              <p className="font-medium text-gray-700">Aucune activité</p>
              <p className="text-sm text-gray-400">Créez vos premières activités à suivre</p>
              <Button onClick={openCreateActivity}>Créer une activité</Button>
            </div>
          )}

          {archivedActivities.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Archivées
              </h2>
              <div className="space-y-2 opacity-60">
                {archivedActivities.map((a) => (
                  <Card key={a.id} className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl grayscale shrink-0"
                      style={{ backgroundColor: a.color + "18" }}
                    >
                      {a.icon}
                    </div>
                    <p className="text-sm font-medium text-gray-500 flex-1">{a.name}</p>
                    <Button size="sm" variant="ghost" onClick={() => updateActivity(a.id, { archived: false })} className="text-xs">
                      Restaurer
                    </Button>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* ── Categories tab ── */}
      {tab === "categories" && (
        <div className="space-y-2">
          {categories.map((cat) => (
            <Card key={cat.id} className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: cat.color + "22" }}
              >
                <Tag size={16} style={{ color: cat.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                {cat.isDefault && (
                  <p className="text-xs text-gray-400">Catégorie par défaut</p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button size="icon-sm" variant="ghost" onClick={() => openEditCategory(cat)}>
                  <Edit2 size={14} />
                </Button>
                {!cat.isDefault && (
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="text-gray-300 hover:text-red-500"
                    onClick={() => deleteCategory(cat.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Activity Modal ── */}
      <Modal
        open={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        title={editActivityId ? "Modifier l'activité" : "Nouvelle activité"}
      >
        <div className="space-y-4">
          <Input
            label="Nom"
            value={actForm.name}
            onChange={(e) => setActForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ex : Développement, Sport..."
            error={actError}
          />

          <Select
            label="Catégorie"
            value={actForm.category}
            onChange={(e) => setActForm((f) => ({ ...f, category: e.target.value }))}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />

          {/* Icon picker */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Icône</p>
            <div className="grid grid-cols-10 gap-1 max-h-40 overflow-y-auto scrollbar-hide">
              {ACTIVITY_ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setActForm((f) => ({ ...f, icon }))}
                  className={cn(
                    "h-9 w-9 rounded-xl text-lg flex items-center justify-center transition-all",
                    actForm.icon === icon ? "bg-gray-900" : "bg-gray-100 hover:bg-gray-200"
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
              {ACTIVITY_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setActForm((f) => ({ ...f, color: c }))}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    actForm.color === c ? "border-gray-900 scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Goal (optional) */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Objectif <span className="text-gray-400 font-normal">(optionnel — sera ajouté aux objectifs)</span></p>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                step="0.5"
                value={actForm.goalAmount}
                onChange={(e) => setActForm((f) => ({ ...f, goalAmount: e.target.value }))}
                placeholder="Heures"
                className="flex-1"
              />
              <Select
                value={actForm.goalFrequency}
                onChange={(e) => setActForm((f) => ({ ...f, goalFrequency: e.target.value as Frequency }))}
                options={FREQ_OPTIONS}
                className="flex-1"
              />
            </div>
            {actForm.goalAmount && (
              <p className="text-xs text-emerald-600 mt-1 font-medium">
                ✓ Un objectif de {actForm.goalAmount}h/{actForm.goalFrequency === "weekly" ? "sem." : actForm.goalFrequency === "monthly" ? "mois" : actForm.goalFrequency === "daily" ? "jour" : "an"} sera créé
              </p>
            )}
          </div>

          {/* Preview */}
          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ backgroundColor: actForm.color + "12" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ backgroundColor: actForm.color + "22" }}
            >
              {actForm.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {actForm.name || "Nom de l'activité"}
              </p>
              {getCat(actForm.category) && (
                <Badge color={getCat(actForm.category)!.color}>
                  {getCat(actForm.category)!.name}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setShowActivityModal(false)}>
              Annuler
            </Button>
            <Button className="flex-1" onClick={saveActivity}>
              {editActivityId ? "Enregistrer" : "Créer"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Category Modal ── */}
      <Modal
        open={showCatModal}
        onClose={() => setShowCatModal(false)}
        title={editCatId ? "Modifier la catégorie" : "Nouvelle catégorie"}
      >
        <div className="space-y-4">
          <Input
            label="Nom"
            value={catForm.name}
            onChange={(e) => setCatForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ex : Famille, Side project..."
            error={catError}
          />
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Couleur</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS_PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => setCatForm((f) => ({ ...f, color: c }))}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    catForm.color === c ? "border-gray-900 scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ backgroundColor: catForm.color + "12" }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: catForm.color + "22" }}>
              <Tag size={16} style={{ color: catForm.color }} />
            </div>
            <p className="text-sm font-semibold text-gray-900">{catForm.name || "Nom de la catégorie"}</p>
          </div>

          {catError && <p className="text-sm text-red-500">{catError}</p>}

          <div className="flex gap-2 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setShowCatModal(false)}>
              Annuler
            </Button>
            <Button className="flex-1" onClick={saveCategory}>
              {editCatId ? "Enregistrer" : "Créer"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
