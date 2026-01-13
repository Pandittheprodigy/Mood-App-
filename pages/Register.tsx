
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dbService } from '../services/dbService';
import { Role } from '../types';

export default function Register() {
  const [name, setName] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [role, setRole] = useState<Role>(Role.SEEKER);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !passphrase) return;

    dbService.createUser({
      name,
      passphrase,
      role
    });
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f9f9f7]">
      <div className="w-full max-w-md bg-white p-12 shadow-sm border border-[#e5e5df] rounded-sm">
        <h1 className="text-3xl font-serif italic mb-2 text-[#4a4a45] text-center">Join the Suite</h1>
        <p className="text-[#8e8e8a] mb-8 font-light text-sm tracking-wide text-center">Create your private sanctuary</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-widest text-[#cbcbca]">Your Identity</label>
            <input
              type="text"
              placeholder="e.g. Julian"
              className="w-full bg-[#f9f9f7] border-b border-[#e5e5df] py-3 px-1 focus:outline-none focus:border-[#4a4a45] transition-colors"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-widest text-[#cbcbca]">The Passphrase</label>
            <input
              type="password"
              placeholder="Keep it sacred"
              className="w-full bg-[#f9f9f7] border-b border-[#e5e5df] py-3 px-1 focus:outline-none focus:border-[#4a4a45] transition-colors"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-[9px] uppercase tracking-widest text-[#cbcbca]">Choose Your Path</label>
            <div className="grid grid-cols-1 gap-3">
              {[Role.GUEST, Role.SEEKER, Role.GUIDE].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`text-left p-4 border transition-all rounded-sm group ${
                    role === r ? 'border-[#4a4a45] bg-[#f9f9f7]' : 'border-[#f1f1ee] hover:border-[#cbcbca]'
                  }`}
                >
                  <p className={`text-xs uppercase tracking-widest ${role === r ? 'text-[#4a4a45] font-bold' : 'text-[#8e8e8a]'}`}>
                    {r}
                  </p>
                  <p className="text-[10px] text-[#cbcbca] mt-1 italic font-serif">
                    {r === Role.GUEST && "Light access to meditation and atmosphere."}
                    {r === Role.SEEKER && "Full logging of mood, habits, and journals."}
                    {r === Role.GUIDE && "All features plus administrative care tools."}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#4a4a45] text-white py-4 uppercase tracking-[0.3em] text-xs hover:bg-[#32322e] transition-colors shadow-lg mt-4"
          >
            Initiate Account
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] text-[#cbcbca] uppercase tracking-widest">
          Already a member? <Link to="/login" className="text-[#4a4a45] border-b border-[#4a4a45]">Login here</Link>
        </p>
      </div>
    </div>
  );
}
