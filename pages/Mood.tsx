
import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../services/dbService';
import { Category, LogEntry } from '../types';

const MOODS = [
  { value: 1, label: 'Difficult', emoji: '☁️' },
  { value: 2, label: 'Low', emoji: '🌧️' },
  { value: 3, label: 'Neutral', emoji: '🌤️' },
  { value: 4, label: 'Good', emoji: '☀️' },
  { value: 5, label: 'Excellent', emoji: '✨' }
];

export default function Mood() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [history, setHistory] = useState<LogEntry[]>([]);
  const [savedToday, setSavedToday] = useState(false);
  const [hoveredData, setHoveredData] = useState<any>(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    refreshHistory();
  }, [today]);

  const refreshHistory = () => {
    const logs = dbService.getLogs();
    const moodLogs = logs.filter(l => l.category === Category.MOOD).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setHistory(moodLogs);
    setSavedToday(moodLogs.some(l => l.date === today));
  };

  const handleSave = () => {
    if (selectedMood === null) return;
    const moodObj = MOODS.find(m => m.value === selectedMood);
    
    if (editingId) {
      dbService.updateLog(editingId, {
        inputData: { ...moodObj, reason },
        notes: reason
      });
      setEditingId(null);
    } else {
      dbService.saveLog({
        date: today,
        category: Category.MOOD,
        inputData: { ...moodObj, reason },
        notes: reason
      });
    }
    
    setSelectedMood(null);
    setReason('');
    refreshHistory();
  };

  const startEdit = (entry: LogEntry) => {
    setSelectedMood(entry.inputData.value);
    setReason(entry.inputData.reason || '');
    setEditingId(entry.id);
    setSavedToday(false); // Temporarily allow editing even if saved today
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteEntry = (id: string) => {
    if (window.confirm("Remove this mood record from history?")) {
      dbService.deleteLog(id);
      refreshHistory();
    }
  };

  // Trend Chart Calculation for the past 30 days
  const trendData = useMemo(() => {
    const last30Days = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA');
      const log = history.find(h => h.date === dateStr);
      last30Days.push({
        date: dateStr,
        displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        shortDate: d.getDate().toString(),
        value: log ? log.inputData.value : null,
        label: log ? log.inputData.label : '',
        reason: log ? log.inputData.reason : '',
        emoji: log ? log.inputData.emoji : ''
      });
    }
    return last30Days;
  }, [history]);

  const chartWidth = 1000;
  const chartHeight = 300;
  const paddingX = 60;
  const paddingY = 40;

  const points = trendData
    .map((d, i) => {
      if (d.value === null) return null;
      const x = paddingX + (i * (chartWidth - paddingX * 2)) / (trendData.length - 1);
      const y = (chartHeight - paddingY) - ((d.value - 1) * (chartHeight - paddingY * 2)) / 4;
      return { x, y, data: d };
    })
    .filter(p => p !== null) as { x: number; y: number; data: any }[];

  const pathD = points.length > 1 
    ? `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`
    : '';

  const areaD = points.length > 1
    ? `${pathD} L ${points[points.length - 1].x},${chartHeight - paddingY} L ${points[0].x},${chartHeight - paddingY} Z`
    : '';

  return (
    <div className="space-y-12">
      <header className="border-b border-[#e5e5df] pb-8">
        <h2 className="text-4xl font-serif italic text-[#4a4a45]">Mood Landscape</h2>
        <p className="text-sm text-[#8e8e8a] mt-2">Observing the rhythmic shifts of your inner weather.</p>
      </header>

      {/* Mood Trend Chart Section */}
      <section className="bg-white p-10 border border-[#e5e5df] shadow-sm overflow-hidden group/chart">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xs uppercase tracking-[0.2em] text-[#8e8e8a]">Atmospheric Trends (Last 30 Days)</h3>
          <div className="flex space-x-4 text-[10px] uppercase tracking-widest text-[#cbcbca]">
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#4a4a45] mr-2"></span> Mood Level</span>
          </div>
        </div>
        
        <div className="relative w-full overflow-visible">
          <svg 
            viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
            className="w-full h-auto overflow-visible"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Y Axis Guide Lines & Labels */}
            {MOODS.map(m => {
              const y = (chartHeight - paddingY) - ((m.value - 1) * (chartHeight - paddingY * 2)) / 4;
              return (
                <g key={m.value}>
                  <line x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y} stroke="#f1f1ee" strokeWidth="1" />
                  <text x={paddingX - 10} y={y + 3} textAnchor="end" className="text-[9px] uppercase tracking-tighter fill-[#8e8e8a] font-sans font-light">
                    {m.label}
                  </text>
                </g>
              );
            })}

            {/* X Axis Labels */}
            {trendData.map((d, i) => {
              if (i % 5 === 0 || i === trendData.length - 1) {
                const x = paddingX + (i * (chartWidth - paddingX * 2)) / (trendData.length - 1);
                return (
                  <text key={i} x={x} y={chartHeight - 15} textAnchor="middle" className="text-[9px] uppercase tracking-tighter fill-[#cbcbca] font-sans font-light">
                    {d.shortDate}
                  </text>
                );
              }
              return null;
            })}
            
            {areaD && <path d={areaD} fill="url(#moodGradient)" className="opacity-20 transition-all duration-700" />}
            {pathD && <path d={pathD} fill="none" stroke="#4a4a45" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" className="transition-all duration-700" />}

            <defs>
              <linearGradient id="moodGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#4a4a45" />
                <stop offset="100%" stopColor="#f9f9f7" />
              </linearGradient>
            </defs>

            {points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="5" fill="white" stroke="#4a4a45" strokeWidth="2" onMouseEnter={() => setHoveredData(p)} onMouseLeave={() => setHoveredData(null)} className="cursor-pointer hover:r-7 transition-all duration-200" />
            ))}
          </svg>

          {hoveredData && (
            <div className="absolute bg-[#4a4a45] text-white p-4 rounded-sm shadow-2xl text-[10px] z-50 pointer-events-none min-w-[160px] animate-in fade-in zoom-in duration-200" style={{ left: `${(hoveredData.x / chartWidth) * 100}%`, top: `${(hoveredData.y / chartHeight) * 100}%`, transform: 'translate(-50%, -120%)' }}>
              <div className="border-b border-white/20 pb-2 mb-2 flex justify-between items-center">
                <p className="font-bold uppercase tracking-widest">{hoveredData.data.displayDate}</p>
                <span className="text-sm">{hoveredData.data.emoji}</span>
              </div>
              <p className="italic font-serif text-xs mb-2">Feeling {hoveredData.data.label}</p>
              {hoveredData.data.reason && <div className="bg-white/10 p-2 rounded-sm italic leading-relaxed text-[#f1f1ee]">&ldquo;{hoveredData.data.reason}&rdquo;</div>}
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-white p-10 border border-[#e5e5df] shadow-sm">
          <h3 className="text-xs uppercase tracking-[0.2em] text-[#8e8e8a] mb-8">{editingId ? 'Refining Record' : 'Daily Check-In'}</h3>
          
          {savedToday && !editingId ? (
            <div className="text-center py-12">
              <span className="text-4xl mb-4 block">✓</span>
              <p className="font-serif italic text-lg text-[#4a4a45]">Today's landscape is preserved.</p>
              <button onClick={() => setSavedToday(false)} className="mt-6 text-[10px] uppercase tracking-widest text-[#cbcbca] hover:text-[#4a4a45] transition-colors border-b border-[#f1f1ee] pb-1">Update Entry</button>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="flex justify-between items-center px-4">
                {MOODS.map(m => (
                  <button key={m.value} onClick={() => setSelectedMood(m.value)} className={`flex flex-col items-center p-3 transition-all transform ${selectedMood === m.value ? 'scale-125' : 'opacity-40 grayscale hover:opacity-70'}`}>
                    <span className="text-4xl mb-2">{m.emoji}</span>
                    <span className="text-[10px] uppercase tracking-tighter">{m.label}</span>
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-[#8e8e8a] block mb-2 font-medium">Reflect on your state...</label>
                <textarea className="w-full bg-[#f9f9f7] border border-[#e5e5df] p-4 text-sm focus:outline-none focus:border-[#4a4a45] h-32 resize-none font-serif italic" placeholder="The morning was quiet..." value={reason} onChange={(e) => setReason(e.target.value)} />
              </div>

              <div className="flex space-x-4">
                {editingId && (
                   <button onClick={() => {setEditingId(null); setReason(''); setSelectedMood(null); refreshHistory();}} className="flex-1 bg-white border border-[#e5e5df] text-[#8e8e8a] py-4 uppercase tracking-[0.2em] text-xs hover:bg-[#f9f9f7] transition-all">Cancel</button>
                )}
                <button onClick={handleSave} disabled={selectedMood === null} className="flex-1 bg-[#4a4a45] text-white py-4 uppercase tracking-[0.2em] text-xs hover:bg-[#32322e] disabled:opacity-30 transition-all shadow-md active:scale-[0.98]">
                  {editingId ? 'Update Record' : 'Preserve Moment'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-10 border border-[#e5e5df] shadow-sm">
          <h3 className="text-xs uppercase tracking-[0.2em] text-[#8e8e8a] mb-8">Recent Check-ins</h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {history.slice(0, 10).map((entry) => (
              <div key={entry.id} className="group border-b border-[#f1f1ee] pb-4 last:border-0 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className="text-xl">{entry.inputData.emoji}</span>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#cbcbca]">{new Date(entry.date).toLocaleDateString()}</p>
                    <p className="text-sm font-serif italic text-[#4a4a45]">{entry.inputData.label}</p>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-3">
                  <button onClick={() => startEdit(entry)} className="text-[10px] uppercase tracking-widest text-[#8e8e8a] hover:text-[#4a4a45]">Edit</button>
                  <button onClick={() => deleteEntry(entry.id)} className="text-[10px] uppercase tracking-widest text-red-300 hover:text-red-500">Delete</button>
                </div>
              </div>
            ))}
            {history.length === 0 && <p className="text-[#cbcbca] italic text-center py-10">No records found.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
