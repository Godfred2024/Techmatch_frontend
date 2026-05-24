import { useState } from 'react';
import { ChallengeConfig } from '../types';
import { DEFAULT_HABITS } from '../hooks/useChallenge';
import { getTodayString } from '../utils/calculations';

interface Props {
  onSetup: (config: ChallengeConfig) => void;
}

export function SetupScreen({ onSetup }: Props) {
  const [name, setName] = useState('75 Hard Challenge');
  const [startDate, setStartDate] = useState(getTodayString());
  const [duration, setDuration] = useState('75');
  const habits = DEFAULT_HABITS;
  const [step, setStep] = useState<1 | 2>(1);

  function handleStart() {
    const parsed = parseInt(duration);
    if (!name.trim() || isNaN(parsed) || parsed < 1 || !startDate) return;
    onSetup({ name: name.trim(), startDate, duration: parsed, habits });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-violet-900 to-indigo-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💪</div>
          <h1 className="text-3xl font-black text-white">Challenge Tracker</h1>
          <p className="text-indigo-300 mt-2 text-sm">
            Discipline. Consistance. Transformation.
          </p>
        </div>

        {/* Steps */}
        <div className="flex gap-2 mb-6 justify-center">
          {[1, 2].map(s => (
            <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${
              step >= s ? 'bg-indigo-400 w-8' : 'bg-white/20 w-4'
            }`} />
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
          {step === 1 && (
            <div className="space-y-4 animate-slide-up">
              <h2 className="text-lg font-bold text-white">Configure ton challenge</h2>

              <div>
                <label className="block text-xs font-semibold text-indigo-300 mb-1.5 uppercase tracking-wider">
                  Nom du challenge
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40
                    focus:outline-none focus:border-indigo-400 text-sm font-medium transition-colors"
                  placeholder="Mon challenge personnel"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-300 mb-1.5 uppercase tracking-wider">
                  Date de début
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white
                    focus:outline-none focus:border-indigo-400 text-sm font-medium transition-colors [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-300 mb-1.5 uppercase tracking-wider">
                  Durée (jours)
                </label>
                <div className="flex gap-2">
                  {['30', '75', '90'].map(d => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all
                        ${duration === d
                          ? 'bg-indigo-500 text-white'
                          : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20'}`}
                    >
                      {d}j
                    </button>
                  ))}
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    className="w-16 px-2 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-center text-sm
                      focus:outline-none focus:border-indigo-400 transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!name.trim() || !startDate}
                className="w-full py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40
                  text-white font-bold text-sm transition-all mt-2"
              >
                Suivant →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-slide-up">
              <div className="flex items-center gap-2">
                <button onClick={() => setStep(1)} className="p-1.5 rounded-xl hover:bg-white/10 transition-colors">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-lg font-bold text-white">Tes habitudes ({habits.filter(h => h.required).length} obligatoires)</h2>
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {habits.map(habit => (
                  <div key={habit.id}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/10 border border-white/10">
                    <span className="text-base">{habit.icon}</span>
                    <span className="flex-1 text-sm text-white/90">{habit.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
                      ${habit.required ? 'bg-emerald-500/30 text-emerald-300' : 'bg-white/10 text-white/50'}`}>
                      {habit.required ? '✓' : 'opt'}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-indigo-300 text-center">
                Tu pourras modifier ces habitudes dans les paramètres.
              </p>

              <button
                onClick={handleStart}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300
                  text-white font-black text-base transition-all shadow-lg shadow-emerald-900/30"
              >
                🚀 Lancer le challenge !
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
