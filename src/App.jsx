import React from 'react';
import NeonBoard from './components/NeonBoard';
import ChessHUD from './components/ChessHUD';
import GameOverModal from './components/GameOverModal';
import { motion } from 'framer-motion';
import { useAccount, useSignMessage } from 'wagmi';
import { useChessStore } from './store/useChessStore';
import { useEffect } from 'react';

function App() {
  const { isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const setSignMatchCallback = useChessStore(state => state.setSignMatchCallback);

  useEffect(() => {
    if (isConnected) {
      setSignMatchCallback(async (pgn, result) => {
        const message = `AXiM Arcade Verification\nResult: ${result}\nPGN: ${pgn}`;
        return await signMessageAsync({ message });
      });
    } else {
      setSignMatchCallback(null);
    }
  }, [isConnected, signMessageAsync, setSignMatchCallback]);

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-start md:justify-center p-4 py-20 md:py-0 overflow-x-hidden">
      
      {/* Global Branding */}
      <a 
        href="https://axim.us.com/games" 
        className="fixed top-6 left-6 z-50 hover:scale-105 transition-transform cursor-pointer"
        target="_blank"
        rel="noreferrer"
      >
        <img 
          src="https://wp.axim.us.com/wp-content/uploads/2026/08/AXiM-Development-1200x628-layout1284-infrastructure-axim-axim-axim-1l7q5v7.webp" 
          alt="AXiM Games" 
          className="w-32 sm:w-44 h-auto drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]" 
        />
      </a>

      {/* Main Game Interface */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-[900px] z-10 flex flex-col items-center"
      >
        <div className="text-center mb-8 relative">
          <motion.h1 
            className="text-4xl sm:text-6xl font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 via-cyan-500 to-blue-800 neon-text-cyan font-mono uppercase italic"
            animate={{ skewX: [-1, 1, -1] }}
            transition={{ repeat: Infinity, duration: 4 }}
          >
            Neon Chess
          </motion.h1>
          <div className="flex items-center justify-center gap-6 mt-3">
            <div className="h-[1px] flex-1 max-w-[100px] bg-gradient-to-r from-transparent to-cyan-500/50"></div>
            <p className="text-cyan-500/60 font-mono text-[10px] tracking-[0.4em] uppercase whitespace-nowrap">
              Secure Tactical Interface v1.2.0
            </p>
            <div className="h-[1px] flex-1 max-w-[100px] bg-gradient-to-l from-transparent to-cyan-500/50"></div>
          </div>
        </div>

        <div className="w-full flex flex-col items-center">
          <NeonBoard />
          <ChessHUD />
        </div>
      </motion.div>

      {/* Modals */}
      <GameOverModal />

      {/* Background Ambience & Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Dynamic Neon Grid */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(to right, #00f0ff 1px, transparent 1px),
            linear-gradient(to bottom, #00f0ff 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          perspective: '1000px',
          transform: 'rotateX(60deg) translateY(-20%)'
        }}></div>
        
        {/* Glow Spheres */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-cyan-600/10 rounded-full blur-[180px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-magenta-600/10 rounded-full blur-[180px]"></div>
        
        {/* Noise/Texture */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 240, 255, 0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 240, 255, 0.2); border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 240, 255, 0.4); }
        
        @keyframes subtle-glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-1px, 1px); }
          40% { transform: translate(-1px, -1px); }
          60% { transform: translate(1px, 1px); }
          80% { transform: translate(1px, -1px); }
          100% { transform: translate(0); }
        }
      `}} />
    </div>
  );
}

export default App;