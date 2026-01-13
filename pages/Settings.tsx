
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';

export default function Settings() {
  const [name, setName] = useState('');
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    setName(dbService.getSettings().name);
  }, []);

  const handleUpdate = () => {
    dbService.updateSettings({ name });
    alert('Preferences secured.');
  };

  const clearData = () => {
    if (window.confirm('Are you certain? This will dissolve all your records forever.')) {
      dbService.clearAllData();
      setCleared(true);
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="space-y-12">
      <header className="border-b border-[#e5e5df] pb-8">
        <h2 className="text-4xl font-serif italic text-[#4a4a45]">Preferences</h2>
        <p className="text-sm text-[#8e8e8a] mt-2">Tailor the suite to your soul's requirements.</p>
      </header>

      <div className="max-w-2xl mx-auto space-y-12">
        <section className="bg-white p-12 border border-[#e5e5df] shadow-sm space-y-10">
          <div className="space-y-4">
            <label className="text-xs uppercase tracking-[0.2em] text-[#8e8e8a] block">Identity</label>
            <input 
              type="text" 
              className="w-full bg-[#f9f9f7] border-b border-[#e5e5df] py-3 px-2 text-sm focus:outline-none focus:border-[#4a4a45]"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="How shall we address you?"
            />
          </div>

          <div className="space-y-4">
            <label className="text-xs uppercase tracking-[0.2em] text-[#8e8e8a] block">Atmosphere</label>
            <div className="flex space-x-4">
              <div className="w-8 h-8 rounded-full bg-[#f9f9f7] border-2 border-[#4a4a45]" title="Classic Light" />
              <div className="w-8 h-8 rounded-full bg-[#2d2d2b] opacity-30 cursor-not-allowed" title="Sepia (Coming Soon)" />
            </div>
          </div>

          <button 
            onClick={handleUpdate}
            className="w-full bg-[#4a4a45] text-white py-4 uppercase tracking-[0.2em] text-xs hover:bg-[#32322e] transition-all"
          >
            Commit Changes
          </button>
        </section>

        <section className="p-12 border border-red-50 text-center">
          <h3 className="text-xs uppercase tracking-[0.2em] text-red-900/40 mb-6">Data Sovereignty</h3>
          <p className="text-[10px] text-[#cbcbca] uppercase tracking-widest mb-8 leading-relaxed">
            All your records are held locally on this device. <br/>
            Clearing them is irreversible.
          </p>
          <button 
            onClick={clearData}
            className="text-[10px] uppercase tracking-widest text-red-700 border border-red-100 px-8 py-3 hover:bg-red-50 transition-colors"
          >
            {cleared ? 'Dissolving...' : 'Wipe all data'}
          </button>
        </section>
      </div>
    </div>
  );
}
