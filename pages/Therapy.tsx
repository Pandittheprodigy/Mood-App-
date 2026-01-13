
import React, { useState, useEffect } from 'react';

export default function Therapy() {
  const [meditationTime, setMeditationTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [activeColor, setActiveColor] = useState('#f9f9f7');

  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => {
        setMeditationTime(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Meditation */}
        <section className="bg-white p-10 border border-[#e5e5df] shadow-sm flex flex-col items-center text-center">
          <h3 className="text-xs uppercase tracking-[0.2em] text-[#8e8e8a] mb-12">Meditation Timer</h3>
          <div className="text-6xl font-serif text-[#4a4a45] mb-8 tabular-nums">
            {formatTime(meditationTime)}
          </div>
          <button 
            onClick={() => setIsRunning(!isRunning)}
            className={`w-full py-4 uppercase tracking-[0.2em] text-xs transition-colors ${
              isRunning ? 'border border-[#4a4a45] text-[#4a4a45]' : 'bg-[#4a4a45] text-white'
            }`}
          >
            {isRunning ? 'Pause' : 'Commence'}
          </button>
          <button 
            onClick={() => {setMeditationTime(0); setIsRunning(false);}}
            className="mt-4 text-[10px] text-[#cbcbca] uppercase tracking-widest hover:text-[#4a4a45]"
          >
            Reset
          </button>
        </section>

        {/* Music List Placeholder */}
        <section className="bg-white p-10 border border-[#e5e5df] shadow-sm">
          <h3 className="text-xs uppercase tracking-[0.2em] text-[#8e8e8a] mb-8">Celestial Rhythms</h3>
          <div className="space-y-6">
            {['Forest Whispers', 'Tidal Breath', 'Binaural Harmony', 'Summer Rain'].map((track, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer border-b border-[#f1f1ee] pb-4">
                <span className="text-sm italic font-serif text-[#4a4a45]">{track}</span>
                <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">▶</span>
              </div>
            ))}
          </div>
        </section>

        {/* Colour Therapy */}
        <section 
          className="p-10 border border-[#e5e5df] shadow-sm transition-colors duration-1000"
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
