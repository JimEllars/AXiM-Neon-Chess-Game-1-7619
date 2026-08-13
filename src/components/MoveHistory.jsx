import React, { useEffect, useRef } from 'react';
import { useChessStore } from '../store/useChessStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function MoveHistory() {
  const { moveHistory } = useChessStore();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moveHistory]);

  return (
    <div className="flex flex-col h-full">
      <span className="text-[10px] text-cyan-500/50 uppercase tracking-[0.2em] font-mono mb-2">Telemetry Log</span>
      <div 
        ref={scrollRef}
        className="flex-1 bg-[#0a0a0f] border border-cyan-500/20 rounded p-3 overflow-y-auto font-mono text-[11px] custom-scrollbar"
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <AnimatePresence>
            {moveHistory.map((move, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex gap-2 ${i % 2 === 0 ? 'text-cyan-400' : 'text-magenta-400'}`}
              >
                <span className="opacity-30">{Math.floor(i / 2) + 1}.</span>
                <span className="font-bold">{move.san}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          {moveHistory.length === 0 && (
            <span className="col-span-2 text-white/20 italic">Waiting for input...</span>
          )}
        </div>
      </div>
    </div>
  );
}