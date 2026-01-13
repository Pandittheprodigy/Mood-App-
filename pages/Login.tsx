
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { dbService } from '../services/dbService';

interface LoginProps {
  onLogin: (user: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [name, setName] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const users = dbService.getUsers();
    const user = users.find(u => u.name.toLowerCase() === name.toLowerCase() && u.passphrase === passphrase);

    if (user) {
      onLogin(user);
    } else {
      setError('Identity not recognized. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f9f9f7]">
      <div className="w-full max-w-md bg-white p-12 shadow-sm border border-[#e5e5df] rounded-sm text-center">
        <h1 className="text-4xl font-serif italic mb-2 text-[#4a4a45]">Welcome Back</h1>
        <p className="text-[#8e8e8a] mb-8 font-light text-sm tracking-wide">Enter your private sanctuary</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1 text-left">
            <label className="text-[9px] uppercase tracking-widest text-[#cbcbca]">Identity Name</label>
            <input
              type="text"
              placeholder="Your name"
              className="w-full bg-[#f9f9f7] border-b border-[#e5e5df] py-3 px-1 focus:outline-none focus:border-[#4a4a45] transition-colors"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-1 text-left">
            <label className="text-[9px] uppercase tracking-widest text-[#cbcbca]">Passphrase</label>
            <input
              type="password"
              placeholder="Your secret"
              className="w-full bg-[#f9f9f7] border-b border-[#e5e5df] py-3 px-1 focus:outline-none focus:border-[#4a4a45] transition-colors"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
          
          <button
            type="submit"
            className="w-full bg-[#4a4a45] text-white py-4 uppercase tracking-[0.3em] text-xs hover:bg-[#32322e] transition-colors shadow-lg"
          >
            Authenticate
          </button>
        </form>

        <p className="mt-8 text-[10px] text-[#cbcbca] uppercase tracking-widest leading-loose">
          Not registered? <Link to="/register" className="text-[#4a4a45] border-b border-[#4a4a45]">Create Account</Link>
        </p>
      </div>
    </div>
  );
}
