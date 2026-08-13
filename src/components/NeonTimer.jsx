import React, { useEffect } from 'react';
import { useChessStore } from '../store/useChessStore';
import { motion } from 'framer-motion';

export default function NeonTimer({ color }) {
  const { timers, game, tickTimers, isPaused } = useChessStore();
  const time = timers[color];
  const isTurn = game.turn() === color;

  useEffect(() => {
    const interval = setInterval(() => tickTimers(), 1000);
    return () => clearInterval(interval);
  }, [tickTimers]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = time < 60;

  return (
    <div className={`relative px-4 py-2 border-2 rounded-lg transition-all duration-500 ${
      isTurn 
        ? color === 'w' ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,240,255,0.3)]' : 'border-magenta-500 bg-magenta-500/10 shadow-[0_0_15px_rgba(255,0,127,0.3)]'
        : 'border-white/10 bg-white/5 opacity-50'
    }`}>
      <div className="flex flex-col items-center">
        <span className="text-[8px] font-mono uppercase tracking-[0.3em] mb-1 opacity-60">
          {color === 'w' ? 'White Nucleus' : 'Black Core'}
        </span>
        <motion.span 
          key={time}
          initial={isTurn ? { scale: 1.1 } : {}}
          animate={{ scale: 1 }}
          className={`text-2xl font-black font-mono tracking-tighter ${
            isLowTime ? 'text-rose-500 animate-pulse' : 'text-white'
          }`}
        >
          {formatTime(time)}
        </motion.span>
      </div>
      {isTurn && !isPaused && (
        <motion.div 
          className={`absolute bottom-0 left-0 h-1 ${color === 'w' ? 'bg-cyan-500' : 'bg-magenta-500'}`}
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 1, ease: "linear" }}
        />
      )}
    </div>
  );
}