import React from 'react';
import { useChessStore } from '../store/useChessStore';
import { motion } from 'framer-motion';
import DifficultySelector from './DifficultySelector';
import PieceSetSelector from './PieceSetSelector';
import GameModeSelector from './GameModeSelector';
import OrientationToggle from './OrientationToggle';
import MoveHistory from './MoveHistory';
import CapturedPieces from './CapturedPieces';
import TacticalDisplay from './TacticalDisplay';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiZap, FiZapOff, FiRefreshCcw, FiVolume2, FiVolumeX } = FiIcons;

export default function ChessHUD() {
  const { 
    status, isComputerThinking, resetGame, game, 
    showHints, toggleHints, soundEnabled, toggleSound,
    capturedPieces, gameMode 
  } = useChessStore();
  
  const getTurnLabel = () => {
    if (gameMode === 'ai') return game.turn() === 'w' ? 'PLAYER' : 'SYSTEM';
    return game.turn() === 'w' ? 'WHITE' : 'BLACK';
  };

  return (
    <div className="w-full max-w-[900px] mx-auto mt-8 grid grid-cols-1 md:grid-cols-12 gap-6 pb-12 px-4 md:px-0">
      
      <div className="md:col-span-7 flex flex-col gap-5">
        
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-magenta-500 rounded-lg blur opacity-20 transition duration-1000"></div>
          <div className="relative flex justify-between items-center bg-[#0a0a0f] border border-cyan-500/30 p-6 rounded-lg overflow-hidden">
            <div className="flex flex-col">
              <span className="text-[10px] text-cyan-500 uppercase tracking-widest font-mono opacity-50">Operation Status</span>
              <motion.span 
                key={status}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-2xl font-black font-mono uppercase tracking-tighter ${
                  status.includes('CHECK') || status.includes('CALC') ? 'text-rose-500 neon-text-magenta' : 'text-cyan-300 neon-text-cyan'
                }`}
              >
                {status}
              </motion.span>
            </div>

            <div className="flex flex-col items-end text-right">
              <span className="text-[10px] text-cyan-500 uppercase tracking-widest font-mono opacity-50">Authorized Turn</span>
              <span className={`text-xl font-mono font-bold italic ${isComputerThinking ? 'text-magenta-400 animate-pulse' : 'text-cyan-400'}`}>
                {getTurnLabel()}
              </span>
            </div>
          </div>
        </div>

        <TacticalDisplay />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GameModeSelector />
          {gameMode === 'ai' ? <DifficultySelector /> : <OrientationToggle />}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PieceSetSelector />
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-cyan-500/50 uppercase tracking-[0.2em] font-mono">Feedback Matrix</span>
            <div className="flex gap-2">
              <button 
                onClick={toggleHints}
                className={`flex-1 flex items-center justify-center gap-2 py-2 border font-mono text-[10px] transition-all rounded-md ${
                  showHints ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'border-white/10 text-white/40'
                }`}
              >
                <SafeIcon icon={showHints ? FiZap : FiZapOff} />
                AUGMENTED HINTS
              </button>
              <button 
                onClick={toggleSound}
                className={`w-12 flex items-center justify-center border font-mono transition-all rounded-md ${
                  soundEnabled ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'border-white/10 text-white/40'
                }`}
              >
                <SafeIcon icon={soundEnabled ? FiVolume2 : FiVolumeX} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-end">
           <button 
            onClick={resetGame}
            className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-rose-500/5 border border-rose-500/40 text-rose-500 font-mono text-xs uppercase tracking-widest hover:bg-rose-500 hover:text-black transition-all rounded-md group"
          >
            <SafeIcon icon={FiRefreshCcw} className="group-hover:rotate-180 transition-transform duration-700" />
            Terminate & Reboot Session
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#0a0a0f]/50 border border-cyan-500/10 p-3 rounded-lg">
            <span className="text-[9px] text-cyan-500/40 font-mono uppercase mb-2 block">Allied Losses</span>
            <CapturedPieces pieces={capturedPieces.w} color="w" />
          </div>
          <div className="bg-[#0a0a0f]/50 border border-magenta-500/10 p-3 rounded-lg text-right">
            <span className="text-[9px] text-magenta-500/40 font-mono uppercase mb-2 block">System Losses</span>
            <CapturedPieces pieces={capturedPieces.b} color="b" />
          </div>
        </div>
      </div>

      <div className="md:col-span-5 flex flex-col gap-2 min-h-[400px]">
        <div className="flex-1">
          <MoveHistory />
        </div>
        <div className="p-4 bg-black/40 border border-white/5 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
             <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
             <span className="text-[9px] text-cyan-500 font-mono uppercase tracking-[0.2em]">Telemetry Stream Active</span>
          </div>
          <p className="text-[9px] text-white/30 font-mono leading-relaxed">
            {gameMode === 'ai' 
              ? 'Deep Neural Engine v4.2 analyzing synaptic board states.' 
              : 'Secure Local Peer Protocol established. Manual override enabled.'}
          </p>
        </div>
      </div>
    </div>
  );
}