import React, { useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { useChessStore } from '../store/useChessStore';
import { playSelectSound } from '../utils/SynthAudioEngine';
import * as FaIcons from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const { 
  FaChessPawn, FaChessKnight, FaChessBishop, 
  FaChessRook, FaChessQueen, FaChessKing 
} = FaIcons;

export default function NeonBoard() {
  const { 
    fen, makeMove, isComputerThinking, game, 
    showHints, optionSquares, setOptionSquares, 
    pieceSet, boardTheme, lastMove, boardOrientation,
    selectedSquare, setSelectedSquare
  } = useChessStore();

  const [pendingPromotion, setPendingPromotion] = React.useState(null);

  const checkIsPromotion = (from, to) => {
    const piece = game.get(from);
    if (!piece || piece.type !== 'p') return false;
    const isWhitePromotion = piece.color === 'w' && from[1] === '7' && to[1] === '8';
    const isBlackPromotion = piece.color === 'b' && from[1] === '2' && to[1] === '1';
    return isWhitePromotion || isBlackPromotion;
  };

  const handleExecuteMove = (from, to, promotion = 'q') => {
    const move = makeMove({
      from,
      to,
      promotion,
    });
    setSelectedSquare(null);
    setOptionSquares({});
    setPendingPromotion(null);
    return move;
  };

  const onDrop = (sourceSquare, targetSquare) => {
    if (isComputerThinking) return false;
    if (checkIsPromotion(sourceSquare, targetSquare)) {
      setPendingPromotion({ from: sourceSquare, to: targetSquare });
      return false;
    }
    return handleExecuteMove(sourceSquare, targetSquare);
  };

  const onSquareClick = (square) => {
    if (!showHints || isComputerThinking || pendingPromotion) return;

    const piece = game.get(square);
    const isPlayersTurn = piece && piece.color === game.turn();

    if (selectedSquare === square) {
      // Cancel selection if tapping the same piece again
      setSelectedSquare(null);
      setOptionSquares({});
      return;
    }

    if (selectedSquare) {
      // Tap 2: Try to move
      const moves = game.moves({ square: selectedSquare, verbose: true });
      const isValidMove = moves.some((m) => m.to === square);

      if (isValidMove) {
        if (checkIsPromotion(selectedSquare, square)) {
          setPendingPromotion({ from: selectedSquare, to: square });
          return;
        }

        const move = handleExecuteMove(selectedSquare, square);
        if (move) return;
      } else if (isPlayersTurn) {
         // Selected a different piece belonging to the player, update selection
         setSelectedSquare(square);
         playSelectSound();
         const newMoves = game.moves({ square, verbose: true });
         const newSquares = {};
         newMoves.forEach((move) => {
           newSquares[move.to] = {
             background: game.get(move.to) && game.get(move.to).color !== game.get(square).color
                 ? 'radial-gradient(circle, rgba(255, 0, 127, 0.6) 25%, transparent 25%)'
                 : 'radial-gradient(circle, rgba(0, 240, 255, 0.4) 25%, transparent 25%)',
             borderRadius: '50%',
           };
         });
         setOptionSquares(newSquares);
         return;
      }
    }

    if (isPlayersTurn) {
      // Select piece
      setSelectedSquare(square);
      playSelectSound();
      const moves = game.moves({ square, verbose: true });
      const newSquares = {};
      moves.forEach((move) => {
        newSquares[move.to] = {
          background: game.get(move.to) && game.get(move.to).color !== game.get(square).color
                 ? 'radial-gradient(circle, rgba(255, 0, 127, 0.6) 25%, transparent 25%)'
                 : 'radial-gradient(circle, rgba(0, 240, 255, 0.4) 25%, transparent 25%)',
          borderRadius: '50%',
        };
      });
      setOptionSquares(newSquares);
    } else {
      // Tapped empty square or opponent's piece without having selected a piece to move
      setSelectedSquare(null);
      setOptionSquares({});
    }
  };

  const squareStyles = useMemo(() => {
    const styles = {};
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];

    files.forEach(f => {
      ranks.forEach(r => {
        const sq = `${f}${r}`;
        styles[sq] = {
          boxShadow: pieceSet === 'retro'
            ? 'inset 0 0 5px rgba(255, 0, 127, 0.3), 0 0 1px rgba(255, 0, 127, 0.5)'
            : 'inset 0 0 5px rgba(0, 240, 255, 0.3), 0 0 1px rgba(0, 240, 255, 0.5)',
          boxSizing: 'border-box'
        };
      });
    });

    Object.assign(styles, optionSquares);

    if (lastMove) {
      styles[lastMove.from] = { ...styles[lastMove.from], backgroundColor: 'rgba(255, 255, 255, 0.05)' };
      styles[lastMove.to] = { ...styles[lastMove.to], backgroundColor: 'rgba(0, 240, 255, 0.1)' };
    }

    if (selectedSquare) {
      styles[selectedSquare] = {
        ...styles[selectedSquare],
        backgroundColor: 'rgba(0, 240, 255, 0.4)'
      };
    }

    return styles;
  }, [optionSquares, lastMove, pieceSet, selectedSquare]);

  const customPieces = useMemo(() => {
    if (pieceSet !== 'retro' && pieceSet !== 'digital') return undefined;
    const pieces = ['P', 'N', 'B', 'R', 'Q', 'K'];
    const colors = ['w', 'b'];
    const mapping = {};
    const IconMap = { P: FaChessPawn, N: FaChessKnight, B: FaChessBishop, R: FaChessRook, Q: FaChessQueen, K: FaChessKing };

    colors.forEach(color => {
      pieces.forEach(p => {
        const Icon = IconMap[p];
        mapping[`${color}${p}`] = ({ squareWidth, isDragging }) => {
          const defaultFilter = pieceSet === 'retro'
                  ? `drop-shadow(0 0 12px ${color === 'w' ? 'rgba(0,240,255,1)' : 'rgba(255,0,127,1)'}) brightness(1.2)`
                  : `drop-shadow(0 0 8px ${color === 'w' ? 'rgba(0,240,255,0.8)' : 'rgba(255,0,127,0.8)'})`;

          return (
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center justify-center h-full w-full">
              <Icon
                style={{
                  width: squareWidth * (pieceSet === 'retro' ? 0.75 : 0.65),
                  height: squareWidth * (pieceSet === 'retro' ? 0.75 : 0.65),
                  color: color === 'w' ? '#00f0ff' : '#ff007f',
                  filter: isDragging ? 'none' : defaultFilter
                }}
              />
            </motion.div>
          );
        };
      });
    });
    return mapping;
  }, [pieceSet]);

  const isObsidianGold = boardTheme === 'obsidian_gold';

  return (
    <div className={`w-full max-w-[580px] mx-auto p-4 rounded-xl relative piece-set-${pieceSet} ${
      isObsidianGold 
        ? 'border-2 border-amber-500/60 bg-[#070603] shadow-[0_0_60px_rgba(245,158,11,0.25)]' 
        : 'neon-border-cyan bg-[#050508] shadow-[0_0_60px_rgba(0,240,255,0.2)]'
    }`}>
      {pieceSet === 'retro' && (
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div className="w-full h-full" style={{
            backgroundImage: isObsidianGold
              ? 'linear-gradient(#f59e0b 1px, transparent 1px), linear-gradient(90deg, #f59e0b 1px, transparent 1px)'
              : 'linear-gradient(#00f0ff 1px, transparent 1px), linear-gradient(90deg, #00f0ff 1px, transparent 1px)',
            backgroundSize: '12.5% 12.5%'
          }}></div>
        </div>
      )}

      <Chessboard 
        arePiecesDraggable={!isComputerThinking}
        id="NeonChess" 
        position={fen} 
        onPieceDrop={onDrop}
        onSquareClick={onSquareClick}
        boardOrientation={boardOrientation}
        customPieces={customPieces}
        customSquareStyles={squareStyles}
        customDarkSquareStyle={{ 
          backgroundColor: isObsidianGold 
            ? '#120f06' 
            : pieceSet === 'retro' ? '#0a0015' : '#0f172a' 
        }}
        customLightSquareStyle={{ 
          backgroundColor: isObsidianGold 
            ? '#2d240d' 
            : pieceSet === 'retro' ? '#1a0030' : '#1e293b' 
        }}
        customBoardStyle={{
          borderRadius: '8px',
          boxShadow: isObsidianGold ? '0 0 35px rgba(245, 158, 11, 0.25)' : '0 0 30px rgba(0, 240, 255, 0.15)',
          border: isObsidianGold 
            ? '2px solid #d97706' 
            : pieceSet === 'retro' ? '2px solid #ff007f' : '1px solid rgba(0, 240, 255, 0.3)'
        }}
        animationDuration={250}
      />
      
      <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden opacity-[0.05] mix-blend-overlay">
        <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]"></div>
      </div>

      <AnimatePresence>
        {game.isCheck() && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
            <div className="px-8 py-3 bg-rose-600/20 border-2 border-rose-500 text-rose-500 font-mono font-black text-4xl italic tracking-tighter uppercase neon-text-magenta animate-pulse">
              System Breach: Check
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cyberpunk Pawn Promotion Overlay */}
      <AnimatePresence>
        {pendingPromotion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm rounded-xl p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#0b0e17] border-2 border-cyan-400 p-6 rounded-2xl shadow-[0_0_40px_rgba(0,240,255,0.4)] text-center max-w-sm w-full"
            >
              <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-cyan-400 mb-1">Quantum Upgrade</h3>
              <p className="text-[11px] font-mono text-white/60 mb-5">Select Promotion Spec</p>

              <div className="grid grid-cols-4 gap-3">
                {[
                  { type: 'q', label: 'QUEEN', icon: FaChessQueen },
                  { type: 'r', label: 'ROOK', icon: FaChessRook },
                  { type: 'b', label: 'BISHOP', icon: FaChessBishop },
                  { type: 'n', label: 'KNIGHT', icon: FaChessKnight }
                ].map(({ type, label, icon: IconComponent }) => (
                  <button
                    key={type}
                    onClick={() => handleExecuteMove(pendingPromotion.from, pendingPromotion.to, type)}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all group"
                  >
                    <IconComponent className="text-2xl text-cyan-400 group-hover:scale-110 group-hover:text-cyan-300 transition-transform mb-2" />
                    <span className="text-[9px] font-mono font-bold text-cyan-300">{label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPendingPromotion(null)}
                className="mt-5 text-[10px] font-mono text-rose-400/80 hover:text-rose-300 uppercase tracking-wider"
              >
                Cancel Move
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}