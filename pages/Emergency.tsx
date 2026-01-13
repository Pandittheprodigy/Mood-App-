
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { Provider, Role } from '../types';

export default function Emergency() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [userRole, setUserRole] = useState<Role>(Role.GUEST);
  const [isAdding, setIsAdding] = useState(false);
  const [newProvider, setNewProvider] = useState<Omit<Provider, 'id'>>({ name: '', specialty: '', contact: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const settings = dbService.getSettings();
    const user = dbService.getActiveUser();
    setProviders(settings.providers || []);
    if (user) setUserRole(user.role);
  }, []);

  const saveProvider = () => {
    if (!newProvider.name || !newProvider.contact) return;
    
    let updated;
    if (editingId) {
      updated = providers.map(p => p.id === editingId ? { ...newProvider, id: editingId } : p);
      setEditingId(null);
    } else {
      const provider: Provider = { ...newProvider, id: Math.random().toString(36).substr(2, 9) };
      updated = [...providers, provider];
    }
    
    setProviders(updated);
    dbService.updateSettings({ providers: updated });
    setNewProvider({ name: '', specialty: '', contact: '' });
    setIsAdding(false);
  };

  const startEdit = (p: Provider) => {
    setNewProvider({ name: p.name, specialty: p.specialty, contact: p.contact });
    setEditingId(p.id);
    setIsAdding(true);
  };

  const deleteProvider = (id: string) => {
    if (window.confirm("Remove this provider from the support list?")) {
      const updated = providers.filter(p => p.id !== id);
      setProviders(updated);
      dbService.updateSettings({ providers: updated });
    }
  };

  return (
    <div className="space-y-12">
      <header className="border-b border-red-100 pb-8 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif italic text-red-900">Emergency Support</h2>
          <p className="text-sm text-red-700/60 mt-2">Safe harbor in turbulent waters.</p>
        </div>
        {userRole === Role.GUIDE && (
          <button onClick={() => setIsAdding(!isAdding)} className="text-[10px] uppercase tracking-[0.2em] border border-red-200 px-6 py-2 hover:bg-red-50 transition-colors h-fit">
            {isAdding ? 'Close Console' : 'Manage Network'}
          </button>
        )}
      </header>

      <div className="max-w-2xl mx-auto space-y-8">
        {isAdding && userRole === Role.GUIDE && (
          <div className="bg-white p-10 border-2 border-dashed border-[#e5e5df] space-y-6">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#8e8e8a]">{editingId ? 'Edit Support Node' : 'Register Support Node'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Name" className="bg-[#f9f9f7] p-3 text-sm focus:outline-none border-b border-[#e5e5df]" value={newProvider.name} onChange={(e) => setNewProvider({...newProvider, name: e.target.value})} />
              <input type="text" placeholder="Specialty" className="bg-[#f9f9f7] p-3 text-sm focus:outline-none border-b border-[#e5e5df]" value={newProvider.specialty} onChange={(e) => setNewProvider({...newProvider, specialty: e.target.value})} />
              <input type="text" placeholder="Contact/Link" className="bg-[#f9f9f7] p-3 text-sm focus:outline-none border-b border-[#e5e5df] md:col-span-2" value={newProvider.contact} onChange={(e) => setNewProvider({...newProvider, contact: e.target.value})} />
            </div>
            <div className="flex space-x-4">
              <button onClick={saveProvider} className="flex-1 bg-[#4a4a45] text-white py-3 uppercase tracking-widest text-xs">{editingId ? 'Update Node' : 'Anchor Node'}</button>
              <button onClick={() => {setIsAdding(false); setEditingId(null);}} className="flex-1 border border-[#e5e5df] text-[#8e8e8a] py-3 uppercase tracking-widest text-xs">Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <h3 className="text-xs uppercase tracking-[0.2em] text-[#8e8e8a]">The Support Network</h3>
          {providers.map((p) => (
            <div key={p.id} className="bg-white p-8 border border-[#e5e5df] shadow-sm flex flex-col md:flex-row justify-between md:items-center hover:border-red-200 transition-all group">
              <div className="mb-4 md:mb-0">
                <h4 className="font-serif italic text-lg text-[#4a4a45]">{p.name}</h4>
                <p className="text-[10px] uppercase tracking-widest text-[#8e8e8a]">{p.specialty}</p>
              </div>
              <div className="flex items-center space-x-4">
                {userRole === Role.GUIDE && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-4 mr-4">
                    <button onClick={() => startEdit(p)} className="text-[9px] uppercase tracking-widest text-[#cbcbca] hover:text-[#4a4a45]">Edit</button>
                    <button onClick={() => deleteProvider(p.id)} className="text-[9px] uppercase tracking-widest text-red-200 hover:text-red-500">Delete</button>
                  </div>
                )}
                <a href={p.contact.startsWith('http') ? p.contact : `tel:${p.contact}`} className="text-xs border border-[#4a4a45] px-6 py-2 uppercase tracking-widest hover:bg-[#4a4a45] hover:text-white transition-all">Connect</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
