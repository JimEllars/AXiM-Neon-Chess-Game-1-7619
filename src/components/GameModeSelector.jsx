import React from 'react';
import { useChessStore } from '../store/useChessStore';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiCpu, FiUsers } = FiIcons;

export default function GameModeSelector() {
  const { gameMode, setGameMode } = useChessStore();

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] text-cyan-500/50 uppercase tracking-[0.2em] font-mono">Combat Protocol</span>
      <div className="flex gap-2">
        <button
          onClick={() => setGameMode('ai')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 border font-mono text-[10px] transition-all rounded-md ${
            gameMode === 'ai' 
              ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.2)]' 
              : 'border-white/10 text-white/40 hover:border-white/30'
          }`}
        >
          <SafeIcon icon={FiCpu} />
          VS SYSTEM
        </button>
        <button
          onClick={() => setGameMode('local')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 border font-mono text-[10px] transition-all rounded-md ${
            gameMode === 'local' 
              ? 'bg-magenta-500/10 border-magenta-500 text-magenta-400 shadow-[0_0_10px_rgba(255,0,127,0.2)]' 
              : 'border-white/10 text-white/40 hover:border-white/30'
          }`}
        >
          <SafeIcon icon={FiUsers} />
          LOCAL MULTI
        </button>
      </div>
    </div>
  );
}