import React from 'react';
import { useChessStore } from '../store/useChessStore';

const levels = [
  { id: 'easy', label: 'NOVICE', color: 'text-emerald-400' },
  { id: 'normal', label: 'STRIKER', color: 'text-cyan-400' },
  { id: 'hard', label: 'OVERLORD', color: 'text-magenta-400' }
];

export default function DifficultySelector() {
  const { difficulty, setDifficulty } = useChessStore();

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] text-cyan-500/50 uppercase tracking-[0.2em] font-mono">Difficulty Level</span>
      <div className="flex gap-2">
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => setDifficulty(level.id)}
            className={`flex-1 py-1 px-2 border font-mono text-[10px] transition-all duration-300 rounded ${
              difficulty === level.id 
                ? `bg-cyan-500/10 border-cyan-500 ${level.color} shadow-[0_0_10px_rgba(0,240,255,0.2)]` 
                : 'border-white/10 text-white/40 hover:border-white/30'
            }`}
          >
            {level.label}
          </button>
        ))}
      </div>
    </div>
  );
}