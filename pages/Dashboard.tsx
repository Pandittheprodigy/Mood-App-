
import React, { useEffect, useState, useMemo } from 'react';
import { dbService } from '../services/dbService';
import { Category, LogEntry } from '../types';
import { getWellnessInsight } from '../services/geminiService';

export default function Dashboard() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [insight, setInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [hoveredData, setHoveredData] = useState<any>(null);

  useEffect(() => {
    const data = dbService.getLogs();
    setLogs(data);
  }, []);

  const fetchInsight = async () => {
    setLoadingInsight(true);
    const text = await getWellnessInsight(logs);
    setInsight(text);
    setLoadingInsight(false);
  };

  const today = new Date().toISOString().split('T')[0];
  const todayLogs = logs.filter(l => l.date === today);
  const completedRoutines = dbService.getDailyRoutineCompletion(today);
  const routineTotal = dbService.getSettings().routines.length;

  // 7-Day Trend Calculation
  const trendData = useMemo(() => {
    const last7Days = [];
    const now = new Date();
    const moodLogs = logs.filter(l => l.category === Category.MOOD);
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA');
      const log = moodLogs.find(h => h.date === dateStr);
      last7Days.push({
        date: dateStr,
        displayDate: d.toLocaleDateString('en-US', { weekday: 'short' }),
        value: log ? log.inputData.value : null,
        emoji: log ? log.inputData.emoji : '',
        label: log ? log.inputData.label : ''
      });
    }
    return last7Days;
  }, [logs]);

  const chartWidth = 600;
  const chartHeight = 120;
  const padding = 30;

  const points = trendData
    .map((d, i) => {
      if (d.value === null) return null;
      const x = padding + (i * (chartWidth - padding * 2)) / (trendData.length - 1);
      const y = chartHeight - padding - ((d.value - 1) * (chartHeight - padding * 2)) / 4;
      return { x, y, data: d };
    })
    .filter(p => p !== null) as { x: number; y: number; data: any }[];

  const pathD = points.length > 1 
    ? `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`
    : '';

  return (
    <div className="space-y-12">
      <header className="border-b border-[#e5e5df] pb-8">
        <p className="text-xs uppercase tracking-widest text-[#8e8e8a] mb-2">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <h2 className="text-4xl font-serif italic text-[#4a4a45]">Welcome Back</h2>
      </header>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 border border-[#e5e5df] shadow-sm flex flex-col justify-between">
          <h3 className="text-xs uppercase tracking-[0.2em] text-[#8e8e8a] mb-4">Mood Status</h3>
          <div className="flex-1 flex items-center justify-center">
            {todayLogs.find(l => l.category === Category.MOOD) ? (
              <div className="text-center">
                <span className="text-5xl block mb-2">{todayLogs.find(l => l.category === Category.MOOD)?.inputData.emoji}</span>
                <span className="text-sm italic font-serif text-[#4a4a45]">Feeling {todayLogs.find(l => l.category === Category.MOOD)?.inputData.label}</span>
              </div>
            ) : (
              <p className="text-[#cbcbca] italic text-sm">Not logged yet today</p>
            )}
          </div>
        </div>

        <div className="bg-white p-8 border border-[#e5e5df] shadow-sm">
          <h3 className="text-xs uppercase tracking-[0.2em] text-[#8e8e8a] mb-4">Daily Routines</h3>
          <div className="text-center py-4">
             <span className="text-5xl font-serif text-[#4a4a45]">{completedRoutines.length}<span className="text-xl text-[#8e8e8a]">/{routineTotal}</span></span>
             <p className="text-xs uppercase tracking-widest text-[#8e8e8a] mt-4">Tasks Completed</p>
          </div>
        </div>

        <div className="bg-white p-8 border border-[#e5e5df] shadow-sm">
          <h3 className="text-xs uppercase tracking-[0.2em] text-[#8e8e8a] mb-4">Gratitude</h3>
          <div className="text-center py-4">
             <span className="text-5xl font-serif text-[#4a4a45]">{todayLogs.filter(l => l.category === Category.GRATITUDE).length}</span>
             <p className="text-xs uppercase tracking-widest text-[#8e8e8a] mt-4">Entries Shared</p>
          </div>
        </div>
      </div>

      {/* Mood Trend Graph */}
      <section className="bg-white p-10 border border-[#e5e5df] shadow-sm">
        <h3 className="text-xs uppercase tracking-[0.2em] text-[#8e8e8a] mb-8 text-center">Weekly Atmosphere</h3>
        <div className="relative w-full overflow-hidden">
          <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible mx-auto">
            {/* Guide Lines */}
            {[1, 3, 5].map(v => (
              <line
                key={v}
                x1={padding}
                y1={chartHeight - padding - ((v - 1) * (chartHeight - padding * 2)) / 4}
                x2={chartWidth - padding}
                y2={chartHeight - padding - ((v - 1) * (chartHeight - padding * 2)) / 4}
                stroke="#f1f1ee"
                strokeWidth="1"
              />
            ))}
            
            {/* The Trend Line */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#4a4a45"
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}

            {/* Interaction Circles */}
            {points.map((p, i) => (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="3.5"
                  fill="white"
                  stroke="#4a4a45"
                  strokeWidth="1.5"
                  className="cursor-pointer hover:fill-[#4a4a45] transition-colors"
                  onMouseEnter={() => setHoveredData(p)}
                  onMouseLeave={() => setHoveredData(null)}
                />
              </g>
            ))}

            {/* X Axis Labels */}
            {trendData.map((d, i) => (
              <text
                key={i}
                x={padding + (i * (chartWidth - padding * 2)) / (trendData.length - 1)}
                y={chartHeight - 10}
                textAnchor="middle"
                className="text-[8px] uppercase tracking-tighter fill-[#cbcbca] font-sans"
              >
                {d.displayDate}
              </text>
            ))}
          </svg>

          {/* Tooltip Overlay */}
          {hoveredData && (
            <div 
              className="absolute bg-[#4a4a45] text-white p-2 rounded shadow-xl text-[9px] z-50 pointer-events-none"
              style={{ 
                left: `${(hoveredData.x / chartWidth) * 100}%`, 
                top: hoveredData.y - 45,
                transform: 'translateX(-50%)'
              }}
            >
              <p className="font-serif italic text-center whitespace-nowrap">
                {hoveredData.data.emoji} {hoveredData.data.label}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* AI Insights Section */}
      <section className="bg-white p-12 border border-[#e5e5df] shadow-sm text-center">
        <h3 className="text-xs uppercase tracking-[0.2em] text-[#8e8e8a] mb-6 underline decoration-[#e5e5df] underline-offset-8">AI Wellness Insight</h3>
        {insight ? (
          <p className="font-serif italic text-lg leading-relaxed text-[#4a4a45] max-w-2xl mx-auto">
            &ldquo;{insight}&rdquo;
          </p>
        ) : (
          <button 
            onClick={fetchInsight}
            disabled={loadingInsight}
            className="text-sm uppercase tracking-[0.2em] border border-[#4a4a45] px-8 py-3 hover:bg-[#4a4a45] hover:text-white transition-all disabled:opacity-50"
          >
            {loadingInsight ? 'Gathering Thoughts...' : 'Ask for a reflection'}
          </button>
        )}
      </section>
    </div>
  );
}
