import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChessStore } from '../store/useChessStore';

export default function GameOverModal() {
  const { gameOver, resetGame } = useChessStore();

  return (
    <AnimatePresence>
      {gameOver && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-[#0a0a0f] border-2 border-cyan-500 p-8 rounded-xl shadow-[0_0_50px_rgba(0,240,255,0.3)] max-w-sm w-full text-center"
          >
            <h2 className="text-xs text-cyan-500 uppercase tracking-[0.4em] mb-2 font-mono">Session Terminated</h2>
            <div className="text-4xl font-black text-white mb-6 font-mono neon-text-cyan uppercase italic">
              {gameOver}
            </div>
            
            <div className="space-y-4">
              <button 
                onClick={resetGame}
                className="w-full py-3 bg-cyan-500 text-black font-bold font-mono uppercase tracking-widest hover:bg-cyan-400 transition-all rounded shadow-[0_0_20px_rgba(0,240,255,0.4)]"
              >
                Initialize New Match
              </button>
              <a 
                href="https://axim.us.com/games"
                className="block w-full py-3 border border-cyan-500/30 text-cyan-500 font-mono text-sm uppercase tracking-widest hover:bg-cyan-500/10 transition-all rounded"
              >
                Return to Hub
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}