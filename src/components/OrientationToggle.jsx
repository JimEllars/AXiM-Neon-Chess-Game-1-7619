import React from 'react';
import { useChessStore } from '../store/useChessStore';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiRefreshCw } = FiIcons;

export default function OrientationToggle() {
  const { boardOrientation, setBoardOrientation } = useChessStore();

  const toggle = () => {
    setBoardOrientation(boardOrientation === 'white' ? 'black' : 'white');
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] text-cyan-500/50 uppercase tracking-[0.2em] font-mono">Neural View</span>
      <button
        onClick={toggle}
        className="flex items-center justify-center gap-2 py-2 border border-white/10 text-white/60 font-mono text-[10px] transition-all rounded-md hover:border-cyan-500/50 hover:text-cyan-400"
      >
        <SafeIcon icon={FiRefreshCw} className={boardOrientation === 'black' ? 'rotate-180 transition-transform' : 'transition-transform'} />
        FLIP PERSPECTIVE
      </button>
    </div>
  );
}