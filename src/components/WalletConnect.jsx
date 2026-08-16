import React from 'react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export default function WalletConnect() {
  const { connect } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const truncateAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected) {
    return (
      <div
        onClick={() => disconnect()}
        className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-cyan-500/50 bg-cyan-500/10 rounded-lg group hover:bg-cyan-500/20 transition-all"
      >
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
        <span className="font-mono text-cyan-400 text-xs tracking-widest uppercase">
          {truncateAddress(address)}
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      className="flex items-center gap-2 px-4 py-2 border border-magenta-500/50 text-magenta-400 font-mono text-xs uppercase tracking-widest hover:bg-magenta-500/10 transition-all rounded-lg"
    >
      <div className="w-2 h-2 rounded-full bg-magenta-500/50" />
      Connect Wallet
    </button>
  );
}
