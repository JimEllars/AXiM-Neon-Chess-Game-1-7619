import React, { useEffect, useState } from 'react';
import { passportClient } from '../services/passportClient';
import { coreGamingClient } from '../services/coreGamingClient';
import { useChessStore } from '../store/useChessStore';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiUser, FiLogIn, FiLogOut, FiAward, FiDollarSign, FiInfo } = FiIcons;

export default function AximPassportHeader() {
  const [authState, setAuthState] = useState(passportClient.getState());
  const [profile, setProfile] = useState(null);
  const [showClosedLoopTooltip, setShowClosedLoopTooltip] = useState(false);
  const { setPassportJwt, setPieceSet, setBoardTheme } = useChessStore();

  useEffect(() => {
    const unsubAuth = passportClient.subscribe((state) => {
      setAuthState(state);
      setPassportJwt(state.token);
      coreGamingClient.fetchProfile();
    });

    const unsubProfile = coreGamingClient.subscribe((prof) => {
      setProfile(prof);
      if (prof?.equipped?.piece_set) {
        setPieceSet(prof.equipped.piece_set);
      }
      if (prof?.equipped?.board_theme) {
        setBoardTheme(prof.equipped.board_theme);
      }
    });

    coreGamingClient.fetchProfile();

    return () => {
      unsubAuth();
      unsubProfile();
    };
  }, [setPassportJwt, setPieceSet, setBoardTheme]);

  const handleLogin = () => {
    // If dev or no backend URL, support mock demo login for easy testing
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('webcontainer')) {
      passportClient.loginWithDemo();
    } else {
      passportClient.login();
    }
  };

  const handleLogout = () => {
    passportClient.logout();
    coreGamingClient.fetchProfile();
  };

  const paidCredits = profile?.credits?.paid_credits ?? 0;
  const earnedPoints = profile?.credits?.earned_points ?? 0;

  return (
    <div className="w-full max-w-[950px] mx-auto px-4 mb-6 z-20">
      <div className="bg-[#0b0e17]/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-4 shadow-[0_0_25px_rgba(0,240,255,0.15)]">
        
        {/* Left: Player Identity / Guest Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.3)]">
            <SafeIcon icon={FiUser} className="text-lg" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs sm:text-sm text-cyan-200 uppercase tracking-wider">
                {authState.isAuthenticated ? authState.user?.username || 'Verified Player' : 'Casual Guest'}
              </span>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                authState.isAuthenticated 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {authState.isAuthenticated ? 'Passport Verified' : 'Guest Mode'}
              </span>
            </div>
            <p className="text-[10px] font-mono text-cyan-500/60">
              {authState.isAuthenticated 
                ? (authState.user?.wallet ? `ID: ${authState.user.wallet.slice(0, 6)}...${authState.user.wallet.slice(-4)}` : 'AXiM Core Linked')
                : 'Sign in to earn AXiM Credits & equip loadout'}
            </p>
          </div>
        </div>

        {/* Center: Unified Balance Header */}
        <div className="flex items-center gap-3 sm:gap-6 bg-black/40 px-3 py-2 rounded-xl border border-white/5">
          {/* Earned Points */}
          <div className="flex items-center gap-2 relative">
            <div className="w-7 h-7 rounded-lg bg-magenta-950/50 border border-magenta-500/40 flex items-center justify-center text-magenta-400">
              <SafeIcon icon={FiAward} className="text-xs" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-mono uppercase text-magenta-400/80 tracking-wider">Earned Points</span>
                <button 
                  onClick={() => setShowClosedLoopTooltip(!showClosedLoopTooltip)}
                  onMouseEnter={() => setShowClosedLoopTooltip(true)}
                  onMouseLeave={() => setShowClosedLoopTooltip(false)}
                  className="text-white/40 hover:text-white"
                  title="Policy Details"
                >
                  <SafeIcon icon={FiInfo} className="text-[10px]" />
                </button>
              </div>
              <span className="text-xs sm:text-sm font-mono font-bold text-magenta-300">
                {earnedPoints.toLocaleString()} <span className="text-[9px] text-magenta-500/70">PTS</span>
              </span>
            </div>

            {/* Closed Loop Notice Popup */}
            {showClosedLoopTooltip && (
              <div className="absolute top-12 left-0 w-64 p-2.5 bg-[#0e121d] border border-magenta-500/40 rounded-lg shadow-2xl z-50 text-[10px] font-mono text-gray-300 leading-snug">
                <span className="text-magenta-400 font-bold block mb-1">Closed-Loop Policy:</span>
                Earned Points are non-transferable and redeemable only for in-game & cosmetic shop unlocks. No cash-out.
              </div>
            )}
          </div>

          <div className="h-6 w-[1px] bg-white/10" />

          {/* Paid Credits */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-950/50 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <SafeIcon icon={FiDollarSign} className="text-xs" />
            </div>
            <div>
              <span className="text-[9px] font-mono uppercase text-cyan-400/80 tracking-wider block">Paid Credits</span>
              <span className="text-xs sm:text-sm font-mono font-bold text-cyan-300">
                {paidCredits.toLocaleString()} <span className="text-[9px] text-cyan-500/70">CR</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Auth CTA Buttons */}
        <div className="flex items-center gap-2">
          {authState.isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-mono text-[11px] font-medium transition-all"
            >
              <SafeIcon icon={FiLogOut} className="text-xs" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-cyan-400 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 font-mono text-xs font-bold tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] animate-pulse"
            >
              <SafeIcon icon={FiLogIn} className="text-xs" />
              <span>Connect Passport</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
