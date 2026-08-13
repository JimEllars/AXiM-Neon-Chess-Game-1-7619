import React from 'react';
import { 
  FaChessPawn, FaChessKnight, FaChessBishop, 
  FaChessRook, FaChessQueen 
} from 'react-icons/fa';

const pieceIcons = {
  p: FaChessPawn,
  n: FaChessKnight,
  b: FaChessBishop,
  r: FaChessRook,
  q: FaChessQueen
};

export default function CapturedPieces({ pieces, color }) {
  return (
    <div className={`flex flex-wrap gap-1 min-h-[24px] ${color === 'w' ? 'justify-start' : 'justify-end'}`}>
      {pieces.map((p, i) => {
        const Icon = pieceIcons[p];
        return (
          <Icon 
            key={i} 
            className={`text-sm ${color === 'w' ? 'text-cyan-400/60' : 'text-magenta-400/60'}`} 
          />
        );
      })}
    </div>
  );
}