import React from 'react';
import { useChessStore } from '../store/useChessStore';
import { motion } from 'framer-motion';
import DifficultySelector from './DifficultySelector';
import MoveHistory from './MoveHistory';
import CapturedPieces from './CapturedPieces';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiZap, FiZapOff, FiRefreshCcw, FiVolume2, FiVolumeX } = FiIcons;

export default function ChessHUD() {
  const { 
    status, isComputerThinking, resetGame, game, 
    showHints, toggleHints, soundEnabled, toggleSound,
    capturedPieces 
  } = useChessStore();
  
  const turn = game.turn() === 'w' ? 'PLAYER' : 'SYSTEM';

  return (
    <div className="w-full max-w-[900px] mx-auto mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 pb-12">
      
      {/* Left Panel: Status, Captured, Controls */}
      <div className="md:col-span-7 flex flex-col gap-4">
        
        {/* Turn & Status Header */}
        <div className="flex justify-between items-center bg-[#0a0a0f] border border-cyan-500/30 p-5 rounded-lg shadow-[0_0_15px_rgba(0,240,255,0.1)] relative overflow-hidden">
          <div className="flex flex-col z-10">
            <span className="text-[10px] text-cyan-500 uppercase tracking-widest font-mono opacity-50">Protocol Status</span>
            <motion.span 
              key={status}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-xl font-bold font-mono uppercase tracking-tighter ${
                status.includes('CHECK') ? 'text-rose-500 neon-text-magenta' : 'text-cyan-300 neon-text-cyan'
              }`}
            >
              {status}
            </motion.span>
          </div>

          <div className="flex flex-col items-end z-10">
            <span className="text-[10px] text-cyan-500 uppercase tracking-widest font-mono opacity-50">Authorized Turn</span>
            <span className={`text-lg font-mono font-bold ${isComputerThinking ? 'text-magenta-400 animate-pulse' : 'text-cyan-400'}`}>
              {turn}
            </span>
          </div>

          {/* Glitchy background pulse */}
          {isComputerThinking && (
            <motion.div 
              animate={{ opacity: [0.05, 0.15, 0.05] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="absolute inset-0 bg-magenta-500/10 pointer-events-none"
            />
          )}
        </div>

        {/* Captured Pieces Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#0a0a0f] border border-cyan-500/10 p-3 rounded flex flex-col gap-1">
            <span className="text-[9px] text-cyan-500/40 font-mono uppercase">Captured by Player</span>
            <CapturedPieces pieces={capturedPieces.w} color="w" />
          </div>
          <div className="bg-[#0a0a0f] border border-magenta-500/10 p-3 rounded flex flex-col gap-1 text-right">
            <span className="text-[9px] text-magenta-500/40 font-mono uppercase">Captured by System</span>
            <CapturedPieces pieces={capturedPieces.b} color="b" />
          </div>
        </div>

        {/* Difficulty & Assistance */}
        <div className="grid grid-cols-2 gap-4">
          <DifficultySelector />
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-cyan-500/50 uppercase tracking-[0.2em] font-mono">Assistance Matrix</span>
            <div className="flex gap-2">
              <button 
                onClick={toggleHints}
                title="Toggle Move Hints"
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 border font-mono text-[10px] transition-all rounded ${
                  showHints 
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' 
                    : 'border-white/10 text-white/40'
                }`}
              >
                <SafeIcon icon={showHints ? FiZap : FiZapOff} />
                HINTS
              </button>
              <button 
                onClick={toggleSound}
                title="Toggle Sound"
                className={`w-10 flex items-center justify-center border font-mono text-[10px] transition-all rounded ${
                  soundEnabled 
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' 
                    : 'border-white/10 text-white/40'
                }`}
              >
                <SafeIcon icon={soundEnabled ? FiVolume2 : FiVolumeX} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-auto pt-4 border-t border-cyan-500/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] text-emerald-500/60 font-mono uppercase tracking-widest">Network: Arbitrum One</span>
          </div>
          <button 
            onClick={resetGame}
            className="flex items-center gap-2 px-6 py-2 bg-transparent border border-rose-500/50 text-rose-400 font-mono text-xs uppercase tracking-wider hover:bg-rose-500/10 hover:border-rose-500 transition-all rounded group"
          >
            <SafeIcon icon={FiRefreshCcw} className="group-hover:rotate-180 transition-transform duration-500" />
            Restart Session
          </button>
        </div>
      </div>

      {/* Right Panel: Move History */}
      <div className="md:col-span-5 h-[300px] md:h-auto">
        <MoveHistory />
      </div>
    </div>
  );
}