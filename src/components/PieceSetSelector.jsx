import React from 'react';
import { useChessStore } from '../store/useChessStore';

const sets = [
  { id: 'retro', label: 'RETRO', desc: '80s Synth' },
  { id: 'neon', label: 'NEON', desc: 'Modern Glow' },
  { id: 'digital', label: 'DIGITAL', desc: 'Wireframe' },
  { id: 'classic', label: 'CLASSIC', desc: 'Analog' }
];

export default function PieceSetSelector() {
  const { pieceSet, setPieceSet } = useChessStore();

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] text-cyan-500/50 uppercase tracking-[0.2em] font-mono">Visual Identity</span>
      <div className="flex gap-1.5">
        {sets.map((set) => (
          <button
            key={set.id}
            onClick={() => setPieceSet(set.id)}
            className={`flex-1 py-1 px-1 border font-mono text-[9px] transition-all duration-300 rounded flex flex-col items-center justify-center min-h-[40px] ${
              pieceSet === set.id 
                ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]' 
                : 'border-white/10 text-white/40 hover:border-white/30'
            }`}
          >
            <span className="font-bold tracking-wider leading-tight">{set.label}</span>
            <span className="text-[7px] opacity-40 uppercase">{set.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}