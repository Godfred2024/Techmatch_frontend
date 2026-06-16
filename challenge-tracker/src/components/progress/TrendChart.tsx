import { DailyScore, movingAverage } from '../../utils/progressCalculations';

interface Props {
  scores: DailyScore[];
}

export function TrendChart({ scores }: Props) {
  if (scores.length < 2) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
        <SectionHeader />
        <p className="text-sm text-gray-400 dark:text-gray-600 italic text-center py-6">
          Au moins 2 jours de données requis.
        </p>
      </div>
    );
  }

  const PX_PER_DAY = 14;
  const PAD = { t: 12, r: 12, b: 24, l: 30 };
  const H = 110;
  const W = Math.max(scores.length * PX_PER_DAY + PAD.l + PAD.r, 260);
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;

  const x = (i: number) => PAD.l + (i / Math.max(scores.length - 1, 1)) * cW;
  const y = (v: number) => PAD.t + (1 - v / 100) * cH;

  const vals = scores.map(s => s.score);
  const avgVals = movingAverage(vals, 7);

  // Build SVG paths
  const scorePath = vals.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
  const areaPath = `${scorePath} L${x(scores.length - 1).toFixed(1)},${y(0).toFixed(1)} L${PAD.l},${y(0).toFixed(1)} Z`;

  let avgPath = '';
  let avgStarted = false;
  avgVals.forEach((v, i) => {
    if (v === null) return;
    avgPath += `${!avgStarted ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`;
    avgStarted = true;
  });

  // X labels (max ~6)
  const step = Math.max(1, Math.ceil(scores.length / 6));
  const labelIdxs = scores
    .map((_, i) => i)
    .filter(i => i % step === 0 || i === scores.length - 1);

  // Grid lines at 0, 50, 100
  const gridPcts = [0, 50, 100];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
      <SectionHeader />

      {/* Legend */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-0.5 bg-indigo-300 rounded-full" />
          <span className="text-[10px] text-gray-400 dark:text-gray-600">Quotidien</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-0.5 bg-indigo-600 rounded-full" />
          <span className="text-[10px] text-gray-400 dark:text-gray-600">Moy. 7 jours</span>
        </div>
      </div>

      <div className="overflow-x-auto -mx-1 px-1 rounded-xl">
        <svg width={W} height={H}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
            <clipPath id="chartClip">
              <rect x={PAD.l} y={PAD.t} width={cW} height={cH} />
            </clipPath>
          </defs>

          {/* Grid lines */}
          {gridPcts.map(pct => (
            <g key={pct}>
              <line
                x1={PAD.l} y1={y(pct)} x2={W - PAD.r} y2={y(pct)}
                stroke="#e5e7eb" strokeWidth="0.5"
                strokeDasharray={pct === 0 || pct === 100 ? '' : '3,3'}
                className="dark:stroke-gray-800"
              />
              <text x={PAD.l - 5} y={y(pct) + 3} textAnchor="end" fontSize="7.5" fill="#9ca3af">
                {pct}%
              </text>
            </g>
          ))}

          {/* Area fill */}
          <path d={areaPath} fill="url(#areaGrad)" clipPath="url(#chartClip)" />

          {/* Daily score line (lighter) */}
          <path d={scorePath} fill="none" stroke="#a5b4fc" strokeWidth="1.5" strokeLinejoin="round"
            clipPath="url(#chartClip)" />

          {/* 7-day moving average (bold) */}
          {avgPath && (
            <path d={avgPath} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round"
              clipPath="url(#chartClip)" />
          )}

          {/* X-axis day labels */}
          {labelIdxs.map(i => (
            <text key={i} x={x(i)} y={H - 5} textAnchor="middle" fontSize="7.5" fill="#9ca3af">
              J{scores[i].dayNum}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

function SectionHeader() {
  return (
    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
      Évolution dans le temps
    </p>
  );
}
