import { useState } from 'react';
import { CalendarEvent } from '../types';

const PRESET_COLORS = [
  { value: '#ef4444', label: 'Rouge' },
  { value: '#f97316', label: 'Orange' },
  { value: '#eab308', label: 'Jaune' },
  { value: '#22c55e', label: 'Vert' },
  { value: '#3b82f6', label: 'Bleu' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#ec4899', label: 'Rose' },
  { value: '#6b7280', label: 'Gris' },
];

const PRESET_ICONS = [
  { value: '✈️', label: 'Voyage' },
  { value: '🏖️', label: 'Vacances' },
  { value: '💼', label: 'Travail' },
  { value: '🎉', label: 'Événement' },
  { value: '🏥', label: 'Santé' },
  { value: '🎓', label: 'Formation' },
  { value: '👨‍👩‍👧', label: 'Famille' },
  { value: '🍽️', label: 'Repas' },
  { value: '🚗', label: 'Déplacement' },
  { value: '⚠️', label: 'Attention' },
];

interface Props {
  date: string;
  initial?: CalendarEvent;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  onCancel: () => void;
}

export function EventForm({ date, initial, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? '✈️');
  const [color, setColor] = useState(initial?.color ?? '#3b82f6');
  const [description, setDescription] = useState(initial?.description ?? '');

  function handleSubmit() {
    if (!title.trim()) return;
    onSave({ date, title: title.trim(), icon, color, description: description.trim() || undefined });
  }

  return (
    <div className="space-y-3 animate-slide-up">
      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">
        {initial ? 'Modifier l\'événement' : 'Nouvel événement'}
      </h4>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Titre de l'événement..."
        autoFocus
        className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800
          text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-400 transition-colors"
      />

      {/* Icon picker */}
      <div>
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-1.5">Icône</p>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_ICONS.map(p => (
            <button
              key={p.value}
              onClick={() => setIcon(p.value)}
              title={p.label}
              className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all
                ${icon === p.value
                  ? 'bg-indigo-100 dark:bg-indigo-900/40 ring-2 ring-indigo-400 scale-110'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              {p.value}
            </button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      <div>
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-1.5">Couleur</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map(p => (
            <button
              key={p.value}
              onClick={() => setColor(p.value)}
              title={p.label}
              style={{ backgroundColor: p.value }}
              className={`w-7 h-7 rounded-full transition-all
                ${color === p.value ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900 scale-125' : 'opacity-70 hover:opacity-100'}`}
            />
          ))}
        </div>
      </div>

      {/* Description */}
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Description optionnelle..."
        rows={2}
        className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800
          text-sm text-gray-700 dark:text-gray-300 placeholder-gray-300 dark:placeholder-gray-600
          focus:outline-none focus:border-indigo-400 resize-none transition-colors"
      />

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-semibold transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Annuler
        </button>
        <button
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-semibold transition-colors"
        >
          {initial ? 'Enregistrer' : 'Ajouter'}
        </button>
      </div>
    </div>
  );
}
