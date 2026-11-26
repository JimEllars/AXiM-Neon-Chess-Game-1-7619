import React, { useEffect, useRef, useState } from 'react';
import { useChessStore } from '../store/useChessStore';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiCopy, FiCheck, FiDownload } = FiIcons;

export default function MoveHistory() {
  const { moveHistory, game } = useChessStore();
  const scrollRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moveHistory]);

  const handleCopyPgn = () => {
    const pgn = game.pgn() || 'No moves recorded yet.';
    navigator.clipboard.writeText(pgn);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPgn = () => {
    const pgn = game.pgn() || '';
    const blob = new Blob([pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `axim-neon-chess-${Date.now()}.pgn`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-cyan-500/50 uppercase tracking-[0.2em] font-mono">Telemetry Log</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyPgn}
            disabled={moveHistory.length === 0}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 hover:text-cyan-200 text-[9px] font-mono uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Copy match PGN string"
          >
            <SafeIcon icon={copied ? FiCheck : FiCopy} className="text-[10px]" />
            <span>{copied ? 'COPIED' : 'PGN'}</span>
          </button>
          <button
            onClick={handleDownloadPgn}
            disabled={moveHistory.length === 0}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 hover:text-cyan-200 text-[9px] font-mono uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Download match PGN file"
          >
            <SafeIcon icon={FiDownload} className="text-[10px]" />
          </button>
        </div>
      </div>
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