
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { GoalItem } from '../types';

export default function GoalSetting() {
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [newGoal, setNewGoal] = useState('');

  useEffect(() => {
    setGoals(dbService.getSettings().goals);
  }, []);

  const addGoal = () => {
    if (!newGoal.trim()) return;
    const newItem: GoalItem = {
      id: Math.random().toString(36).substr(2, 9),
      text: newGoal,
      progress: 0,
      completed: false
    };
    const updated = [...goals, newItem];
    setGoals(updated);
    dbService.updateSettings({ goals: updated });
    setNewGoal('');
  };

  const updateGoalText = (id: string, text: string) => {
    const updated = goals.map(g => g.id === id ? { ...g, text } : g);
    setGoals(updated);
    dbService.updateSettings({ goals: updated });
  };

  const updateProgress = (id: string, delta: number) => {
    const updated = goals.map(g => {
      if (g.id === id) {
        const next = Math.min(100, Math.max(0, g.progress + delta));
        return { ...g, progress: next, completed: next === 100 };
      }
      return g;
    });
    setGoals(updated);
    dbService.updateSettings({ goals: updated });
  };

  const removeGoal = (id: string) => {
    if (window.confirm("Release this intention?")) {
      const updated = goals.filter(g => g.id !== id);
      setGoals(updated);
      dbService.updateSettings({ goals: updated });
    }
  };

  return (
    <div className="space-y-12">
      <header className="border-b border-[#e5e5df] pb-8">
        <h2 className="text-4xl font-serif italic text-[#4a4a45]">Goal Setting</h2>
        <p className="text-sm text-[#8e8e8a] mt-2">Chart your course with intention and grace.</p>
      </header>

      <div className="max-w-2xl mx-auto space-y-12">
        <div className="bg-white p-8 border border-[#e5e5df] shadow-sm">
          <h3 className="text-xs uppercase tracking-[0.2em] text-[#8e8e8a] mb-6">Create an Intention</h3>
          <div className="flex space-x-4">
            <input type="text" placeholder="What do you wish to achieve?" className="flex-1 bg-transparent border-b border-[#e5e5df] py-3 text-sm focus:outline-none focus:border-[#4a4a45]" value={newGoal} onChange={(e) => setNewGoal(e.target.value)} />
            <button onClick={addGoal} className="bg-[#4a4a45] text-white text-[10px] uppercase tracking-widest px-8 py-3 hover:bg-[#32322e]">Anchor</button>
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-xs uppercase tracking-[0.2em] text-[#8e8e8a]">Active Endeavors</h3>
          <div className="space-y-6">
            {goals.map(goal => (
              <div key={goal.id} className="bg-white p-8 border border-[#e5e5df] shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <input 
                    type="text" 
                    className={`bg-transparent font-serif italic text-lg flex-1 mr-4 focus:outline-none border-b border-transparent focus:border-[#e5e5df] ${goal.completed ? 'text-[#cbcbca] line-through' : 'text-[#4a4a45]'}`}
                    value={goal.text}
                    onChange={(e) => updateGoalText(goal.id, e.target.value)}
                  />
                  <button onClick={() => removeGoal(goal.id)} className="text-[10px] text-[#cbcbca] hover:text-red-400">Release</button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] uppercase tracking-widest text-[#8e8e8a]"><span>Progress</span><span>{goal.progress}%</span></div>
                  <div className="h-1 bg-[#f1f1ee] w-full relative"><div className="h-full bg-[#4a4a45] transition-all duration-500" style={{ width: `${goal.progress}%` }} /></div>
                </div>

                <div className="flex space-x-2">
                  <button onClick={() => updateProgress(goal.id, -10)} className="px-3 py-1 border border-[#e5e5df] text-[10px]">-10%</button>
                  <button onClick={() => updateProgress(goal.id, 10)} className="px-3 py-1 border border-[#e5e5df] text-[10px]">+10%</button>
                  <button onClick={() => updateProgress(goal.id, 100)} className="flex-1 border border-[#4a4a45] text-[10px] uppercase tracking-widest py-1 hover:bg-[#4a4a45] hover:text-white transition-colors">Mark Complete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
