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

const { FiZap, FiZapOff, FiRefreshCcw, FiVolume2, FiVolumeX, FiInfo, FiFlag, FiShield } = FiIcons;

export default function ChessHUD() {
  const { 
    status, resetGame, game, 
    showHints, toggleHints, soundEnabled, toggleSound,
    capturedPieces, gameMode, resignGame, offerDraw, gameOver
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
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-cyan-500/50 uppercase tracking-[0.2em] font-mono">Match Actions</span>
            <div className="flex gap-2">
              <button 
                onClick={() => resignGame()}
                disabled={!!gameOver}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-rose-950/20 border border-rose-500/40 text-rose-400 font-mono text-[10px] font-bold uppercase tracking-wider hover:bg-rose-900/40 hover:text-rose-200 transition-all rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
                title="Concede match and finalize telemetry"
              >
                <SafeIcon icon={FiFlag} className="text-xs" />
                <span>FORFEIT</span>
              </button>
              <button 
                onClick={() => offerDraw()}
                disabled={!!gameOver}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-amber-950/20 border border-amber-500/40 text-amber-400 font-mono text-[10px] font-bold uppercase tracking-wider hover:bg-amber-900/40 hover:text-amber-200 transition-all rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
                title="Conclude match with an agreed draw"
              >
                <SafeIcon icon={FiShield} className="text-xs" />
                <span>DRAW OFFER</span>
              </button>
              <button 
                onClick={resetGame}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-cyan-950/30 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] font-bold uppercase tracking-wider hover:bg-cyan-500/20 hover:text-cyan-100 transition-all rounded-lg group"
                title="Restart fresh game"
              >
                <SafeIcon icon={FiRefreshCcw} className="group-hover:rotate-180 transition-transform duration-700 text-xs" />
                <span>RESET</span>
              </button>
            </div>
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