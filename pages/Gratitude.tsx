
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { Category, LogEntry } from '../types';

export default function Gratitude() {
  const [entries, setEntries] = useState(['', '', '']);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [history, setHistory] = useState<LogEntry[]>([]);
  const [savedToday, setSavedToday] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    refreshHistory();
  }, [today]);

  const refreshHistory = () => {
    const logs = dbService.getLogs();
    const gradLogs = logs.filter(l => l.category === Category.GRATITUDE).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setHistory(gradLogs);
    setSavedToday(gradLogs.some(l => l.date === today));
  };

  const handleSave = () => {
    if (entries.every(e => !e.trim())) return;
    
    if (editingId) {
      dbService.updateLog(editingId, {
        inputData: { entries: entries.filter(e => e.trim()) },
      });
      setEditingId(null);
    } else {
      dbService.saveLog({
        date: today,
        category: Category.GRATITUDE,
        inputData: { entries: entries.filter(e => e.trim()) },
      });
    }
    
    setEntries(['', '', '']);
    refreshHistory();
  };

  const startEdit = (h: LogEntry) => {
    const editEntries = [...h.inputData.entries];
    while (editEntries.length < 3) editEntries.push('');
    setEntries(editEntries);
    setEditingId(h.id);
    setSavedToday(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteEntry = (id: string) => {
    if (window.confirm("Dispel this record of gratitude?")) {
      dbService.deleteLog(id);
      refreshHistory();
    }
  };

  const getDaysInMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    return { firstDay, days, month, year };
  };

  const { firstDay, days, month, year } = getDaysInMonth();
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1;
    return day > 0 && day <= days ? day : null;
  });

  const getGratitudeForDay = (day: number) => {
    const date = new Date(year, month, day);
    const dateStr = date.toLocaleDateString('en-CA');
    return history.find(h => h.date === dateStr);
  };

  const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <header className="border-b border-[#e5e5df] pb-8">
        <h2 className="text-4xl font-serif italic text-[#4a4a45]">Gratitude Journal</h2>
        <p className="text-sm text-[#8e8e8a] mt-2">A record of life's quiet blessings.</p>
      </header>

      <section className="bg-white p-10 border border-[#e5e5df] shadow-sm">
        <h3 className="text-xs uppercase tracking-[0.2em] text-[#8e8e8a] mb-8">{editingId ? 'Refining Archive' : "Today's Reflection"}</h3>
        {savedToday && !editingId ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-4">✨</div>
            <p className="font-serif italic text-[#4a4a45]">Gratitude has been gathered for today.</p>
            <button onClick={() => setSavedToday(false)} className="mt-6 text-[10px] uppercase tracking-widest text-[#8e8e8a] border-b border-[#e5e5df]">Add more to today</button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-6">
              {entries.map((val, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <span className="font-serif italic text-[#cbcbca] text-lg">{i + 1}.</span>
                  <input type="text" placeholder="I am thankful for..." className="flex-1 bg-transparent border-b border-[#f1f1ee] py-2 focus:outline-none focus:border-[#4a4a45] text-sm italic" value={val} onChange={(e) => { const next = [...entries]; next[i] = e.target.value; setEntries(next); }} />
                </div>
              ))}
            </div>
            <div className="flex space-x-4">
              {editingId && (
                <button onClick={() => {setEditingId(null); setEntries(['','','']); refreshHistory();}} className="flex-1 border border-[#e5e5df] py-4 uppercase tracking-[0.2em] text-xs">Cancel</button>
              )}
              <button onClick={handleSave} disabled={entries.every(e => !e.trim())} className="flex-1 bg-[#4a4a45] text-white py-4 uppercase tracking-[0.2em] text-xs hover:bg-[#32322e] disabled:opacity-30 shadow-md">
                {editingId ? 'Update Reflection' : 'Preserve These Moments'}
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="bg-white p-10 border border-[#e5e5df] shadow-sm">
        <header className="flex justify-between items-center mb-8"><h3 className="text-xs uppercase tracking-[0.2em] text-[#8e8e8a]">The {monthName} Map</h3></header>
        <div className="grid grid-cols-7 gap-2">
          {['S','M','T','W','T','F','S'].map(d => (<div key={d} className="text-[10px] text-center font-bold text-[#cbcbca] mb-2">{d}</div>))}
          {calendarDays.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} className="aspect-square" />;
            const gradLog = getGratitudeForDay(day);
            const isToday = day === new Date().getDate() && month === new Date().getMonth();
            return (
              <div key={day} className={`aspect-square flex flex-col items-center justify-center text-[10px] border relative transition-all rounded-sm ${gradLog ? 'bg-[#fef3c7] border-[#fbbf24]' : 'bg-[#f9f9f7] border-[#f1f1ee]'} ${isToday ? 'ring-2 ring-[#4a4a45] ring-inset' : ''}`}>
                <span className={`font-medium ${gradLog ? 'text-[#92400e]' : 'text-[#8e8e8a]'} ${isToday ? 'font-bold underline' : ''}`}>{day}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-8">
        <h3 className="text-xs uppercase tracking-[0.2em] text-[#8e8e8a]">Archives</h3>
        <div className="space-y-6">
          {history.map((h) => (
            <div key={h.id} className="bg-white p-8 border border-[#e5e5df] shadow-sm relative group">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#cbcbca]">{new Date(h.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-4">
                  <button onClick={() => startEdit(h)} className="text-[10px] uppercase tracking-widest text-[#8e8e8a] hover:text-[#4a4a45]">Edit</button>
                  <button onClick={() => deleteEntry(h.id)} className="text-[10px] uppercase tracking-widest text-red-300 hover:text-red-500">Delete</button>
                </div>
              </div>
              <ul className="space-y-4">
                {h.inputData.entries.map((entry: string, idx: number) => (
                  <li key={idx} className="flex items-start space-x-3"><span className="text-[#cbcbca] text-xs mt-1">•</span><p className="text-sm italic font-serif text-[#4a4a45]">{entry}</p></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
