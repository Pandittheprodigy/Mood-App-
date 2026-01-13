
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { Category, LogEntry } from '../types';

export default function Therapy() {
  const [meditationTime, setMeditationTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [activeColor, setActiveColor] = useState('#f9f9f7');
  const [sessions, setSessions] = useState<LogEntry[]>([]);
  const [sessionNote, setSessionNote] = useState('');

  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => {
        setMeditationTime(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    refreshSessions();
  }, []);

  const refreshSessions = () => {
    const logs = dbService.getLogs();
    setSessions(logs.filter(l => l.category === Category.JOURNAL && l.notes === 'Meditation Session').sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  };

  const saveSession = () => {
    if (meditationTime < 1) return;
    dbService.saveLog({
      date: new Date().toISOString().split('T')[0],
      category: Category.JOURNAL,
      inputData: { duration: meditationTime, content: sessionNote },
      notes: 'Meditation Session'
    });
    setMeditationTime(0);
    setIsRunning(false);
    setSessionNote('');
    refreshSessions();
  };

  const deleteSession = (id: string) => {
    if (window.confirm("Remove this meditation record?")) {
      dbService.deleteLog(id);
      refreshSessions();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const therapyColors = [
    { hex: '#f9f9f7', label: 'Clarity' },
    { hex: '#e2e8f0', label: 'Calm' },
    { hex: '#fef3c7', label: 'Energy' },
    { hex: '#dcfce7', label: 'Growth' },
    { hex: '#fee2e2', label: 'Passion' },
    { hex: '#faf5ff', label: 'Spiritual' }
  ];

  return (
    <div className="space-y-12">
      <header className="border-b border-[#e5e5df] pb-8">
        <h2 className="text-4xl font-serif italic text-[#4a4a45]">Sanctuary</h2>
        <p className="text-sm text-[#8e8e8a] mt-2">Music, Mindfulness, and the Spectrum of Healing.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Meditation Timer */}
        <section className="bg-white p-10 border border-[#e5e5df] shadow-sm flex flex-col items-center text-center">
          <h3 className="text-xs uppercase tracking-[0.2em] text-[#8e8e8a] mb-12">Meditation Timer</h3>
          <div className="text-6xl font-serif text-[#4a4a45] mb-8 tabular-nums">
            {formatTime(meditationTime)}
          </div>
          
          <div className="w-full space-y-4">
            <button 
              onClick={() => setIsRunning(!isRunning)}
              className={`w-full py-4 uppercase tracking-[0.2em] text-xs transition-colors ${
                isRunning ? 'border border-[#4a4a45] text-[#4a4a45]' : 'bg-[#4a4a45] text-white'
              }`}
            >
              {isRunning ? 'Pause' : 'Commence'}
            </button>
            
            {!isRunning && meditationTime > 0 && (
              <div className="space-y-4 animate-in fade-in duration-500">
                <textarea 
                  className="w-full bg-[#f9f9f7] border border-[#e5e5df] p-3 text-xs italic font-serif" 
                  placeholder="Note on this session..."
                  value={sessionNote}
                  onChange={(e) => setSessionNote(e.target.value)}
                />
                <button 
                  onClick={saveSession}
                  className="w-full bg-[#4a4a45] text-white py-3 uppercase tracking-[0.2em] text-[10px]"
                >
                  Anchor Session
                </button>
              </div>
            )}

            <button 
              onClick={() => {setMeditationTime(0); setIsRunning(false);}}
              className="mt-4 text-[10px] text-[#cbcbca] uppercase tracking-widest hover:text-[#4a4a45]"
            >
              Reset
            </button>
          </div>
        </section>

        {/* Meditation History (READ/DELETE) */}
        <section className="bg-white p-10 border border-[#e5e5df] shadow-sm">
          <h3 className="text-xs uppercase tracking-[0.2em] text-[#8e8e8a] mb-8">Practice History</h3>
          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {sessions.map((s) => (
              <div key={s.id} className="group border-b border-[#f1f1ee] pb-4 last:border-0">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] uppercase tracking-widest text-[#cbcbca]">
                    {new Date(s.timestamp).toLocaleDateString()} • {formatTime(s.inputData.duration)}
                  </span>
                  <button onClick={() => deleteSession(s.id)} className="opacity-0 group-hover:opacity-100 text-[9px] text-red-300 uppercase tracking-widest hover:text-red-500 transition-all">Delete</button>
                </div>
                <p className="text-xs italic font-serif text-[#8e8e8a] line-clamp-2">
                  {s.inputData.content || 'Quiet contemplation.'}
                </p>
              </div>
            ))}
            {sessions.length === 0 && <p className="text-[#cbcbca] italic text-center text-sm py-12">No sessions recorded yet.</p>}
          </div>
        </section>

        {/* Colour Therapy */}
        <section 
          className="p-10 border border-[#e5e5df] shadow-sm transition-colors duration-1000 h-fit"
          style={{ backgroundColor: activeColor }}
        >
          <h3 className="text-xs uppercase tracking-[0.2em] text-[#8e8e8a] mb-8">Colour Therapy</h3>
          <div className="grid grid-cols-3 gap-4">
            {therapyColors.map(c => (
              <button
                key={c.hex}
                onClick={() => setActiveColor(c.hex)}
                className="aspect-square border border-white shadow-sm hover:scale-110 transition-transform"
                style={{ backgroundColor: c.hex }}
                title={c.label}
              />
            ))}
          </div>
          <p className="mt-8 text-center text-[10px] uppercase tracking-widest text-[#8e8e8a]">
            Selected Hue: {therapyColors.find(c => c.hex === activeColor)?.label}
          </p>
        </section>
      </div>
    </div>
  );
}
