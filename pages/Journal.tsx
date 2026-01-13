
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { Category, LogEntry } from '../types';

export default function Journal() {
  const today = new Date().toISOString().split('T')[0];
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [history, setHistory] = useState<LogEntry[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(today);

  useEffect(() => {
    refreshHistory();
  }, []);

  const refreshHistory = () => {
    const logs = dbService.getLogs();
    setHistory(logs.filter(l => l.category === Category.JOURNAL).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleSave = () => {
    if (!content.trim()) return;
    
    if (editingId) {
      dbService.updateLog(editingId, { inputData: { content } });
      setEditingId(null);
    } else {
      dbService.saveLog({
        date: today,
        category: Category.JOURNAL,
        inputData: { content }
      });
    }
    
    setContent('');
    refreshHistory();
  };

  const startEdit = (entry: LogEntry) => {
    setContent(entry.inputData.content);
    setEditingId(entry.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteEntry = (id: string) => {
    if (window.confirm("Dissolve this recorded thought forever?")) {
      dbService.deleteLog(id);
      refreshHistory();
    }
  };

  const handleExport = () => {
    const filteredEntries = history.filter(entry => {
      const entryDate = entry.date;
      return (!startDate || entryDate >= startDate) && (!endDate || entryDate <= endDate);
    });

    if (filteredEntries.length === 0) {
      alert("No entries found within this date range.");
      return;
    }

    const exportEntries = [...filteredEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let fileContent = `SERENITY WELLNESS SUITE - JOURNAL ARCHIVES\nRange: ${startDate || 'Beginning'} to ${endDate || 'Present'}\n\n`;

    exportEntries.forEach(entry => {
      fileContent += `DATE: ${entry.date}\n------------------------------------------\n${entry.inputData.content}\n\n`;
    });

    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `serenity-journal-export.txt`;
    link.click();
  };

  return (
    <div className="space-y-12">
      <header className="border-b border-[#e5e5df] pb-8 flex flex-col md:flex-row md:items-end justify-between space-y-6 md:space-y-0">
        <div>
          <h2 className="text-4xl font-serif italic text-[#4a4a45]">The Inner Voice</h2>
          <p className="text-sm text-[#8e8e8a] mt-2">Unburden your mind upon the page.</p>
        </div>
        <div className="flex flex-wrap items-end gap-4 bg-white/50 p-4 border border-[#f1f1ee] rounded-sm">
          <div className="flex flex-col"><label className="text-[9px] uppercase tracking-widest text-[#cbcbca] mb-1">From</label><input type="date" className="bg-transparent border-b border-[#e5e5df] text-[10px] focus:outline-none" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
          <div className="flex flex-col"><label className="text-[9px] uppercase tracking-widest text-[#cbcbca] mb-1">To</label><input type="date" className="bg-transparent border-b border-[#e5e5df] text-[10px] focus:outline-none" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
          <button onClick={handleExport} className="text-[10px] uppercase tracking-widest border-b border-[#4a4a45] pb-1 text-[#8e8e8a] hover:text-[#4a4a45]">Export</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-white p-12 border border-[#e5e5df] shadow-sm space-y-8 h-fit sticky top-28">
          <h3 className="text-xs uppercase tracking-[0.2em] text-[#8e8e8a] mb-8">{editingId ? 'Updating Reflection' : "Today's Reflection"}</h3>
          <textarea className="w-full bg-[#f9f9f7] border-none p-6 text-sm font-serif italic leading-relaxed focus:outline-none min-h-[400px] shadow-inner" placeholder="Dearest Journal..." value={content} onChange={(e) => setContent(e.target.value)} />
          <div className="flex space-x-4">
            {editingId && <button onClick={() => {setEditingId(null); setContent('');}} className="flex-1 bg-white border border-[#e5e5df] text-[#8e8e8a] py-4 uppercase tracking-[0.2em] text-xs">Cancel</button>}
            <button onClick={handleSave} className="flex-1 bg-[#4a4a45] text-white py-4 uppercase tracking-[0.2em] text-xs hover:bg-[#32322e] transition-all">
              {editingId ? 'Update Thought' : 'Preserve Thought'}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-xs uppercase tracking-[0.2em] text-[#8e8e8a]">Archives</h3>
          <div className="space-y-8 max-h-[800px] overflow-y-auto pr-4 custom-scrollbar">
            {history.map(entry => (
              <div key={entry.id} className="bg-white p-8 border border-[#e5e5df] shadow-sm relative group">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-[10px] uppercase tracking-widest text-[#cbcbca]">{new Date(entry.date).toLocaleDateString()}</p>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-4">
                    <button onClick={() => startEdit(entry)} className="text-[10px] uppercase tracking-widest text-[#8e8e8a] hover:text-[#4a4a45]">Edit</button>
                    <button onClick={() => deleteEntry(entry.id)} className="text-[10px] uppercase tracking-widest text-red-300 hover:text-red-500">Delete</button>
                  </div>
                </div>
                <div className="font-serif italic text-sm text-[#4a4a45] leading-loose whitespace-pre-wrap border-l-2 border-[#f1f1ee] pl-6">{entry.inputData.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
