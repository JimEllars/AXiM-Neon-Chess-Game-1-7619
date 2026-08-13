import React from 'react';
import { useChessStore } from '../store/useChessStore';

const timeControls = [
  { label: '1m', value: 60, type: 'Bullet' },
  { label: '3m', value: 180, type: 'Blitz' },
  { label: '5m', value: 300, type: 'Blitz' },
  { label: '10m', value: 600, type: 'Rapid' },
  { label: '30m', value: 1800, type: 'Classical' }
];

export default function TimeControlSelector() {
  const { initialTime, setInitialTime } = useChessStore();

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] text-cyan-500/50 uppercase tracking-[0.2em] font-mono">Time Constraint</span>
      <div className="flex gap-1.5 flex-wrap">
        {timeControls.map((control) => (
          <button
            key={control.value}
            onClick={() => setInitialTime(control.value)}
            className={`flex-1 min-w-[50px] py-2 border font-mono text-[10px] transition-all duration-300 rounded-md flex flex-col items-center justify-center ${
              initialTime === control.value 
                ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.2)]' 
                : 'border-white/10 text-white/40 hover:border-white/30'
            }`}
          >
            <span className="font-bold">{control.label}</span>
            <span className="text-[7px] opacity-40 uppercase tracking-tighter">{control.type}</span>
          </button>
        ))}
      </div>
    </div>
  );
}