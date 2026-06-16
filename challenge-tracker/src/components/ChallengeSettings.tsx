import { useState } from 'react';
import { ChallengeConfig, ChallengeData, Habit } from '../types';
import { exportData, importFromFile } from '../utils/storage';
import { getTodayString } from '../utils/calculations';

interface Props {
  config: ChallengeConfig;
  data: ChallengeData;
  onUpdateConfig: (config: ChallengeConfig) => void;
  onReset: () => void;
  onImport: (data: ChallengeData) => void;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function ChallengeSettings({ config, data, onUpdateConfig, onReset, onImport }: Props) {
  const [name, setName] = useState(config.name);
  const [startDate, setStartDate] = useState(config.startDate);
  const [duration, setDuration] = useState(String(config.duration));
  const [habits, setHabits] = useState<Habit[]>(config.habits);
  const [newHabitLabel, setNewHabitLabel] = useState('');
  const [newHabitIcon, setNewHabitIcon] = useState('⭐');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    const parsed = parseInt(duration);
    if (!name.trim() || isNaN(parsed) || parsed < 1 || !startDate) return;
    onUpdateConfig({ name: name.trim(), startDate, duration: parsed, habits });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function addHabit() {
    if (!newHabitLabel.trim()) return;
    const today = getTodayString();
    setHabits(h => [...h, {
      id: generateId(),
      label: newHabitLabel.trim(),
      icon: newHabitIcon,
      required: true,
      createdAt: today,
      deactivatedAt: null,
    }]);
    setNewHabitLabel('');
    setNewHabitIcon('⭐');
  }

  function deactivateHabit(id: string) {
    const today = getTodayString();
    setHabits(h => h.map(hab => hab.id === id ? { ...hab, deactivatedAt: today } : hab));
  }

  function reactivateHabit(id: string) {
    setHabits(h => h.map(hab => hab.id === id ? { ...hab, deactivatedAt: null } : hab));
  }

  function toggleRequired(id: string) {
    setHabits(h => h.map(hab => hab.id === id ? { ...hab, required: !hab.required } : hab));
  }

  function moveHabit(index: number, dir: -1 | 1) {
    const newHabits = [...habits];
    const target = index + dir;
    if (target < 0 || target >= newHabits.length) return;
    [newHabits[index], newHabits[target]] = [newHabits[target], newHabits[index]];
    setHabits(newHabits);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importFromFile(file);
      onImport(imported);
      setName(imported.config.name);
      setStartDate(imported.config.startDate);
      setDuration(String(imported.config.duration));
      setHabits(imported.config.habits);
    } catch (err) {
      alert((err as Error).message);
    }
    e.target.value = '';
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Challenge config */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4">⚙️ Configuration</h2>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Nom du challenge
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800
                text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Date de début
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800
                  text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Durée (jours)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800
                  text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-400 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Habits */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4">📋 Habitudes</h2>

        <div className="space-y-2 mb-4">
          {habits.map((habit, idx) => {
            const isDeactivated = !!habit.deactivatedAt;
            return (
              <div key={habit.id} className={`rounded-xl transition-all ${
                isDeactivated ? 'bg-gray-50/50 dark:bg-gray-800/20 opacity-60' : 'bg-gray-50 dark:bg-gray-800/60'
              }`}>
                <div className="flex items-center gap-2 p-2.5">
                  <span className={`text-lg ${isDeactivated ? 'grayscale' : ''}`}>{habit.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm text-gray-700 dark:text-gray-300 truncate block ${
                      isDeactivated ? 'line-through text-gray-400' : ''
                    }`}>{habit.label}</span>
                    {habit.createdAt && (
                      <span className="text-[9px] text-gray-400 dark:text-gray-600">
                        Depuis le {new Date(habit.createdAt + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {isDeactivated && habit.deactivatedAt && (
                          <> · Désactivé le {new Date(habit.deactivatedAt + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</>
                        )}
                      </span>
                    )}
                  </div>

                  {isDeactivated ? (
                    <button
                      onClick={() => reactivateHabit(habit.id)}
                      className="text-xs px-2 py-0.5 rounded-full font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 transition-colors"
                    >
                      Réactiver
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleRequired(habit.id)}
                        title={habit.required ? 'Obligatoire' : 'Optionnel'}
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold transition-colors flex-shrink-0
                          ${habit.required
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                            : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}
                      >
                        {habit.required ? 'req.' : 'opt.'}
                      </button>
                      <button onClick={() => moveHabit(idx, -1)} disabled={idx === 0}
                        className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-20 transition-colors flex-shrink-0">
                        <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button onClick={() => moveHabit(idx, 1)} disabled={idx === habits.length - 1}
                        className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-20 transition-colors flex-shrink-0">
                        <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deactivateHabit(habit.id)}
                        title="Désactiver cette habitude"
                        className="p-1 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add habit */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newHabitIcon}
            onChange={e => setNewHabitIcon(e.target.value)}
            className="w-14 px-2 py-2 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800
              text-center text-lg focus:outline-none focus:border-indigo-400 transition-colors"
            placeholder="🎯"
            maxLength={2}
          />
          <input
            type="text"
            value={newHabitLabel}
            onChange={e => setNewHabitLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addHabit()}
            placeholder="Nouvelle habitude..."
            className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800
              text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-400 transition-colors"
          />
          <button onClick={addHabit}
            className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors">
            +
          </button>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-200
          ${saved
            ? 'bg-emerald-500 text-white'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
      >
        {saved ? '✓ Sauvegardé !' : 'Sauvegarder les modifications'}
      </button>

      {/* Data section */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4">💾 Données</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => exportData(data)}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800
              text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exporter
          </button>
          <label className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700
            text-gray-600 dark:text-gray-400 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Importer
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      {/* Reset */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-rose-100 dark:border-rose-900/30">
        <h2 className="text-base font-bold text-rose-500 mb-2">⚠️ Zone dangereuse</h2>
        <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
          Réinitialiser efface tous les jours cochés. La configuration est conservée.
        </p>
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-3 rounded-2xl border-2 border-rose-200 dark:border-rose-800 text-rose-500 text-sm font-semibold
              hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
          >
            Réinitialiser le challenge
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 text-center">
              Es-tu sûr ? Cette action est irréversible.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => { onReset(); setShowResetConfirm(false); }}
                className="py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
