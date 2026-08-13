import React from 'react';
import { useChessStore } from '../store/useChessStore';
import { motion } from 'framer-motion';
import NeonTimer from './NeonTimer';
import DifficultySelector from './DifficultySelector';
import PieceSetSelector from './PieceSetSelector';
import GameModeSelector from './GameModeSelector';
import OrientationToggle from './OrientationToggle';
import TimeControlSelector from './TimeControlSelector';
import MoveHistory from './MoveHistory';
import CapturedPieces from './CapturedPieces';
import TacticalDisplay from './TacticalDisplay';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiZap, FiZapOff, FiRefreshCcw, FiVolume2, FiVolumeX, FiInfo } = FiIcons;

export default function ChessHUD() {
  const { 
    status, isComputerThinking, resetGame, game, 
    showHints, toggleHints, soundEnabled, toggleSound,
    capturedPieces, gameMode 
  } = useChessStore();
  
  return (
    <div className="w-full max-w-[950px] mx-auto mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 px-4">
      
      {/* Left Panel: Primary Controls & Timers */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Timers Row */}
        <div className="grid grid-cols-2 gap-4">
          <NeonTimer color="w" />
          <NeonTimer color="b" />
        </div>

        {/* Status Hub */}
        <div className="relative p-6 bg-[#0a0a0f] border border-cyan-500/20 rounded-xl overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-20">
             <SafeIcon icon={FiInfo} className="text-cyan-500" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-cyan-500/60 font-mono uppercase tracking-widest">Tactical Overlay v1.4</span>
            <motion.h2 
              key={status}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className={`text-3xl font-black font-mono italic tracking-tighter uppercase ${
                status.includes('CHECK') ? 'text-rose-500 neon-text-magenta' : 'text-cyan-400 neon-text-cyan'
              }`}
            >
              {status}
            </motion.h2>
          </div>
          <div className="mt-4 flex items-center gap-4">
             <div className="flex-1 h-[2px] bg-gradient-to-r from-cyan-500/50 to-transparent" />
             <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">
               {game.turn() === 'w' ? 'Authorized: White' : 'Authorized: Black'}
             </span>
          </div>
        </div>

        <TacticalDisplay />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <GameModeSelector />
            <TimeControlSelector />
          </div>
          <div className="flex flex-col gap-4">
            {gameMode === 'ai' ? <DifficultySelector /> : <OrientationToggle />}
            <PieceSetSelector />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-cyan-500/50 uppercase tracking-[0.2em] font-mono">Sensory Interface</span>
            <div className="flex gap-2">
              <button 
                onClick={toggleHints}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 border font-mono text-[10px] transition-all rounded-lg ${
                  showHints ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'border-white/10 text-white/40'
                }`}
              >
                <SafeIcon icon={showHints ? FiZap : FiZapOff} />
                AUGMENTED HINTS
              </button>
              <button 
                onClick={toggleSound}
                className={`w-14 flex items-center justify-center border font-mono transition-all rounded-lg ${
                  soundEnabled ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'border-white/10 text-white/40'
                }`}
              >
                <SafeIcon icon={soundEnabled ? FiVolume2 : FiVolumeX} />
              </button>
            </div>
          </div>
          <div className="flex items-end">
            <button 
              onClick={resetGame}
              className="w-full flex items-center justify-center gap-3 py-3 bg-rose-600/5 border border-rose-600/30 text-rose-500 font-mono text-xs font-bold uppercase tracking-[0.3em] hover:bg-rose-600 hover:text-black transition-all rounded-xl group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-rose-600/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
              <SafeIcon icon={FiRefreshCcw} className="group-hover:rotate-180 transition-transform duration-700 relative z-10" />
              <span className="relative z-10">Reboot Matrix</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/40 border border-cyan-500/10 p-4 rounded-xl">
            <span className="text-[9px] text-cyan-500/40 font-mono uppercase mb-3 block">Captured Assets (White)</span>
            <CapturedPieces pieces={capturedPieces.w} color="w" />
          </div>
          <div className="bg-black/40 border border-magenta-500/10 p-4 rounded-xl text-right">
            <span className="text-[9px] text-magenta-500/40 font-mono uppercase mb-3 block">Captured Assets (Black)</span>
            <CapturedPieces pieces={capturedPieces.b} color="b" />
          </div>
        </div>
      </div>

      {/* Right Panel: Telemetry & Logs */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="flex-1 min-h-[500px]">
          <MoveHistory />
        </div>
        <div className="p-4 bg-[#0a0a0f] border border-white/5 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
             <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(0,240,255,0.8)]" />
             <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-[0.2em]">Neural Uplink: Active</span>
          </div>
          <p className="text-[10px] text-white/40 font-mono leading-relaxed">
            {gameMode === 'ai' 
              ? 'Minimax v4.2 analyzing board topology. Depth: 4. Branching factor optimized.' 
              : 'Secure peer-to-peer relay established. Neural orientation synchronized.'}
          </p>
        </div>
      </div>
    </div>
  );
}