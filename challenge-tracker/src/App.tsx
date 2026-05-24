import { useEffect, useState } from 'react';;
import { useChallenge } from './hooks/useChallenge';
import { SetupScreen } from './components/SetupScreen';
import { Dashboard } from './components/Dashboard';
import { CalendarView } from './components/CalendarView';
import { ProgressStats } from './components/ProgressStats';
import { ChallengeSettings } from './components/ChallengeSettings';
import { calculateStats, getTodayString } from './utils/calculations';
import { View } from './types';

const NAV_ITEMS: { view: View; label: string; icon: JSX.Element }[] = [
  {
    view: 'dashboard',
    label: "Aujourd'hui",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    view: 'calendar',
    label: 'Calendrier',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    view: 'progress',
    label: 'Progression',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    view: 'settings',
    label: 'Paramètres',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('dark_mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [view, setView] = useState<View>('dashboard');

  const { data, isLoading, setupChallenge, updateConfig, toggleHabit, updateNote, resetChallenge, getDayRecord, persist } = useChallenge();

  useEffect(() => {
    localStorage.setItem('dark_mode', String(darkMode));
  }, [darkMode]);

  if (isLoading) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <SetupScreen onSetup={setupChallenge} />
      </div>
    );
  }

  const today = getTodayString();
  const todayRecord = getDayRecord(today);
  const stats = calculateStats(data);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-gray-900 dark:text-white">
                {data.config.name}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                J{stats.currentDay}/{stats.totalDays}
              </span>
            </div>
            <button
              onClick={() => setDarkMode(d => !d)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-lg mx-auto px-4 py-5 pb-28">
          {view === 'dashboard' && (
            <Dashboard
              config={data.config}
              record={todayRecord}
              onToggle={habitId => toggleHabit(today, habitId)}
              onNoteChange={note => updateNote(today, note)}
            />
          )}
          {view === 'calendar' && (
            <CalendarView
              config={data.config}
              days={data.days}
              onToggle={(date, habitId) => toggleHabit(date, habitId)}
              onNoteChange={(date, note) => updateNote(date, note)}
            />
          )}
          {view === 'progress' && (
            <ProgressStats stats={stats} challengeName={data.config.name} />
          )}
          {view === 'settings' && (
            <ChallengeSettings
              config={data.config}
              data={data}
              onUpdateConfig={updateConfig}
              onReset={resetChallenge}
              onImport={imported => { persist(imported); }}
            />
          )}
        </main>

        {/* Bottom navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 z-10">
          <div className="max-w-lg mx-auto flex">
            {NAV_ITEMS.map(({ view: v, label, icon }) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-all duration-150
                  ${view === v
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400'}`}
              >
                {icon}
                <span className="text-[10px] font-semibold">{label}</span>
                {view === v && (
                  <div className="absolute bottom-0 w-8 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
