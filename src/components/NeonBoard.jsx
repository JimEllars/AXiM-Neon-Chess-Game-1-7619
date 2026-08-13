import React from 'react';
import { Chessboard } from 'react-chessboard';
import { useChessStore } from '../store/useChessStore';

export default function NeonBoard() {
  const { fen, makeMove, isComputerThinking, game, showHints, optionSquares, setOptionSquares } = useChessStore();

  const onDrop = (sourceSquare, targetSquare) => {
    if (isComputerThinking) return false;
    
    const move = makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });
    
    return move;
  };

  const onSquareClick = (square) => {
    if (!showHints || isComputerThinking) return;

    // Clear if clicking same square or empty square
    if (optionSquares[square]) {
      setOptionSquares({});
      return;
    }

    const moves = game.moves({
      square,
      verbose: true,
    });

    if (moves.length === 0) {
      setOptionSquares({});
      return;
    }

    const newSquares = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to) && game.get(move.to).color !== game.get(square).color
            ? 'radial-gradient(circle, rgba(255,0,127,.3) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,240,255,.2) 25%, transparent 25%)',
        borderRadius: '50%',
      };
      return move;
    });

    newSquares[square] = {
      background: 'rgba(0, 240, 255, 0.1)',
    };

    setOptionSquares(newSquares);
  };

  return (
    <div className="w-full max-w-[550px] mx-auto p-3 neon-border-cyan bg-[#0a0a0f] rounded-lg shadow-[0_0_40px_rgba(0,240,255,0.15)] relative">
      <Chessboard 
        id="NeonChess" 
        position={fen} 
        onPieceDrop={onDrop}
        onSquareClick={onSquareClick}
        customSquareStyles={{
          ...optionSquares,
        }}
        customDarkSquareStyle={{ backgroundColor: '#0f172a' }}
        customLightSquareStyle={{ backgroundColor: '#1e293b' }}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 0 20px rgba(0, 240, 255, 0.1)'
        }}
        animationDuration={300}
      />
      
      {/* Visual Scanline Effect Overlay */}
      <div className="absolute inset-0 pointer-events-none rounded-lg overflow-hidden opacity-[0.03]">
        <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
      </div>
    </div>
  );
}