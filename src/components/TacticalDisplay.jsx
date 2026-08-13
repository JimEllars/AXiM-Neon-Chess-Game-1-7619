import React from 'react';
import { useChessStore } from '../store/useChessStore';
import { motion } from 'framer-motion';

export default function TacticalDisplay() {
  const { stats } = useChessStore();

  return (
    <div className="grid grid-cols-3 gap-2">
      {[
        { label: 'OP-COUNT', value: stats.moves, color: 'text-cyan-400' },
        { label: 'TERMINATED', value: stats.captures, color: 'text-magenta-400' },
        { label: 'BREACHES', value: stats.checks, color: 'text-emerald-400' }
      ].map((stat, i) => (
        <div key={i} className="bg-[#0a0a0f] border border-white/5 p-2 rounded flex flex-col items-center">
          <span className="text-[8px] text-white/30 font-mono uppercase tracking-widest">{stat.label}</span>
          <motion.span 
            key={stat.value}
            initial={{ scale: 1.2, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-lg font-black font-mono ${stat.color}`}
          >
            {stat.value.toString().padStart(2, '0')}
          </motion.span>
        </div>
      ))}
    </div>
  );
}