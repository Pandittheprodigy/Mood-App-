
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { Category, RoutineItem } from '../types';

export default function Routine() {
  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [newRoutineText, setNewRoutineText] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('08:00');
  const [isSettingsMode, setIsSettingsMode] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const settings = dbService.getSettings();
    setRoutines(settings.routines);
    setCompletedIds(dbService.getDailyRoutineCompletion(today));
  }, [today]);

  const toggleRoutine = (id: string) => {
    let newCompleted;
    if (completedIds.includes(id)) {
      newCompleted = completedIds.filter(i => i !== id);
    } else {
      newCompleted = [...completedIds, id];
    }
    setCompletedIds(newCompleted);

    const logs = dbService.getLogs();
    const existingIdx = logs.findIndex(l => l.category === Category.ROUTINE && l.date === today);
    
    if (existingIdx !== -1) {
      dbService.updateLog(logs[existingIdx].id, { inputData: { completedIds: newCompleted } });
    } else {
      dbService.saveLog({
        date: today,
        category: Category.ROUTINE,
        inputData: { completedIds: newCompleted }
      });
    }
  };

  const addRoutine = () => {
    if (!newRoutineText.trim()) return;
    const newItem: RoutineItem = { 
      id: Math.random().toString(36).substr(2, 9), 
      text: newRoutineText,
      reminderTime: newReminderTime 
    };
    const updated = [...routines, newItem];
    setRoutines(updated);
    dbService.updateSettings({ routines: updated });
    setNewRoutineText('');
  };

  const updateItemText = (id: string, text: string) => {
    const updated = routines.map(r => r.id === id ? { ...r, text } : r);
    setRoutines(updated);
    dbService.updateSettings({ routines: updated });
  };

  const updateItemTime = (id: string, time: string) => {
    const updated = routines.map(r => r.id === id ? { ...r, reminderTime: time } : r);
    setRoutines(updated);
    dbService.updateSettings({ routines: updated });
  };

  const removeRoutine = (id: string) => {
    if (window.confirm("Abandon this daily habit?")) {
      const updated = routines.filter(r => r.id !== id);
      setRoutines(updated);
      dbService.updateSettings({ routines: updated });
    }
  };

  const formatDisplayTime = (time?: string) => {
    if (!time) return '';
    const [hour, minute] = time.split(':');
    const h = parseInt(hour);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minute} ${ampm}`;
  };

  return (
    <div className="space-y-12">
      <header className="border-b border-[#e5e5df] pb-8 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif italic text-[#4a4a45]">The Daily Path</h2>
          <p className="text-sm text-[#8e8e8a] mt-2">Cultivate discipline through gentle repetition.</p>
        </div>
        <button onClick={() => setIsSettingsMode(!isSettingsMode)} className="text-[10px] uppercase tracking-widest border-b border-[#4a4a45] pb-1 hover:text-[#4a4a45] text-[#8e8e8a] transition-colors">
          {isSettingsMode ? 'View Checklist' : 'Edit Routines'}
        </button>
      </header>

      <div className="max-w-2xl mx-auto bg-white p-12 border border-[#e5e5df] shadow-sm">
        {isSettingsMode ? (
          <div className="space-y-8">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#8e8e8a]">Configure Path</h3>
            <div className="space-y-6">
              {routines.map(r => (
                <div key={r.id} className="flex flex-col group border-b border-[#f9f9f7] pb-6 last:border-0">
                  <div className="flex justify-between items-start mb-4">
                    <input 
                      type="text" 
                      className="bg-transparent text-[#4a4a45] text-sm flex-1 border-b border-transparent focus:border-[#4a4a45] focus:outline-none transition-all py-1"
                      value={r.text}
                      onChange={(e) => updateItemText(r.id, e.target.value)}
                    />
                    <button onClick={() => removeRoutine(r.id)} className="text-red-300 hover:text-red-600 transition-colors text-[10px] uppercase tracking-widest ml-4">Remove</button>
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="text-[9px] uppercase tracking-widest text-[#cbcbca]">Scheduled Moment:</label>
                    <input 
                      type="time" 
                      className="bg-transparent text-[10px] uppercase border-b border-[#f1f1ee] focus:outline-none focus:border-[#4a4a45] transition-colors py-1"
                      value={r.reminderTime || '08:00'}
                      onChange={(e) => updateItemTime(r.id, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-8 border-t border-[#f9f9f7] space-y-6">
              <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1 flex flex-col">
                  <label className="text-[9px] uppercase tracking-widest text-[#cbcbca] mb-1">New Intention</label>
                  <input type="text" placeholder="Morning meditation..." className="bg-[#f9f9f7] border-b border-[#e5e5df] py-2 px-1 text-sm focus:outline-none focus:border-[#4a4a45]" value={newRoutineText} onChange={(e) => setNewRoutineText(e.target.value)} />
                </div>
                <div className="flex flex-col w-full md:w-32">
                  <label className="text-[9px] uppercase tracking-widest text-[#cbcbca] mb-1">Time</label>
                  <input type="time" className="bg-[#f9f9f7] border-b border-[#e5e5df] py-2 px-1 text-sm focus:outline-none focus:border-[#4a4a45]" value={newReminderTime} onChange={(e) => setNewReminderTime(e.target.value)} />
                </div>
                <button onClick={addRoutine} className="bg-[#4a4a45] text-white text-[10px] uppercase tracking-widest px-8 py-3 hover:bg-[#32322e]">Add</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#8e8e8a]">Today's Affirmations</h3>
            {routines.length === 0 ? <p className="text-[#cbcbca] italic text-sm text-center py-8">Your path is empty.</p> : (
              <div className="space-y-6">
                {[...routines].sort((a, b) => (a.reminderTime || '').localeCompare(b.reminderTime || '')).map(r => (
                  <label key={r.id} className="flex items-center space-x-6 cursor-pointer group">
                    <input type="checkbox" className="hidden" checked={completedIds.includes(r.id)} onChange={() => toggleRoutine(r.id)} />
                    <div className={`w-6 h-6 border transition-all flex items-center justify-center ${completedIds.includes(r.id) ? 'bg-[#4a4a45] border-[#4a4a45]' : 'bg-transparent border-[#e5e5df]'}`}>
                      {completedIds.includes(r.id) && <span className="text-white text-[10px]">✓</span>}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm transition-all ${completedIds.includes(r.id) ? 'text-[#cbcbca] line-through' : 'text-[#4a4a45]'}`}>{r.text}</span>
                      {r.reminderTime && <span className="text-[9px] uppercase tracking-widest text-[#cbcbca] mt-1">{formatDisplayTime(r.reminderTime)}</span>}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
