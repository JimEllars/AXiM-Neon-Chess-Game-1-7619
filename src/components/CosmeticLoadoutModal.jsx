import React, { useState, useEffect } from 'react';
import { useChessStore } from '../store/useChessStore';
import { coreGamingClient, DEFAULT_CATALOG } from '../services/coreGamingClient';
import { passportClient } from '../services/passportClient';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiShoppingBag, FiExternalLink, FiCheck, FiLock } = FiIcons;

export default function CosmeticLoadoutModal({ isOpen, onClose }) {
  const { pieceSet, setPieceSet, boardTheme, setBoardTheme } = useChessStore();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('piece_set');
  const [unlockingId, setUnlockingId] = useState(null);

  useEffect(() => {
    const unsub = coreGamingClient.subscribe((p) => setProfile(p));
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const authState = passportClient.getState();
  const ownedItemIds = (profile?.inventory || []).map((i) => i.id);
  const earnedPoints = profile?.credits?.earned_points ?? 0;

  const filteredItems = DEFAULT_CATALOG.filter((item) => item.type === activeTab);

  const handleEquip = async (item) => {
    if (!authState.isAuthenticated) {
      alert('Sign in with AXiM Passport to persist and equip your owned cosmetics across games.');
      return;
    }
    if (item.type === 'piece_set') {
      setPieceSet(item.id);
      await coreGamingClient.equipItem('piece_set', item.id);
    } else {
      setBoardTheme(item.id);
      await coreGamingClient.equipItem('board_theme', item.id);
    }
  };

  const handleUnlock = async (item) => {
    if (!authState.isAuthenticated) {
      alert('Please connect your AXiM Passport to unlock items.');
      return;
    }
    if (earnedPoints < item.price_earned_points) {
      alert(`Insufficient Earned Points. You have ${earnedPoints} PTS, item costs ${item.price_earned_points} PTS.`);
      return;
    }

    try {
      setUnlockingId(item.id);
      await coreGamingClient.spendCredits(item.id, item.price_earned_points);
      // Auto-equip upon unlock
      await handleEquip(item);
    } catch (err) {
      alert(err.message || 'Unlock failed');
    } finally {
      setUnlockingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0b0e17] border border-cyan-500/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,240,255,0.2)]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <SafeIcon icon={FiShoppingBag} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-mono text-cyan-300 uppercase tracking-widest">
                AXiM Cosmetic Loadout
              </h2>
              <p className="text-[11px] font-mono text-cyan-500/60">
                Cross-game themes, piece skins & Selldone Collector Drops
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-white/10 hover:border-white/30 flex items-center justify-center text-white/50 hover:text-white font-mono text-sm"
          >
            ✕
          </button>
        </div>

        {/* Slot Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('piece_set')}
            className={`flex-1 py-2 rounded-lg font-mono text-xs uppercase tracking-wider border transition-all ${
              activeTab === 'piece_set'
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                : 'border-white/10 text-white/50 hover:border-white/20'
            }`}
          >
            Piece Sets
          </button>
          <button
            onClick={() => setActiveTab('board_theme')}
            className={`flex-1 py-2 rounded-lg font-mono text-xs uppercase tracking-wider border transition-all ${
              activeTab === 'board_theme'
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                : 'border-white/10 text-white/50 hover:border-white/20'
            }`}
          >
            Board Themes
          </button>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[360px] overflow-y-auto pr-1">
          {filteredItems.map((item) => {
            const isOwned = item.price_earned_points === 0 || ownedItemIds.includes(item.id);
            const isEquipped = activeTab === 'piece_set' ? pieceSet === item.id : boardTheme === item.id;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  isEquipped
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                    : isOwned
                    ? 'border-white/20 bg-black/40'
                    : 'border-white/10 bg-black/20 opacity-85'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono font-bold text-sm text-white">{item.name}</span>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                      item.rarity === 'collector'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : item.rarity === 'epic'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : item.rarity === 'rare'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {item.rarity}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-gray-400 mb-3">{item.desc}</p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  {item.is_selldone_exclusive ? (
                    <a
                      href={item.selldone_url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-gradient-to-r from-amber-600/30 to-amber-500/20 border border-amber-500/50 hover:border-amber-400 text-amber-200 font-mono text-xs font-bold transition-all"
                    >
                      <SafeIcon icon={FiExternalLink} />
                      <span>AXiM Selldone Shop (AR / Stripe)</span>
                    </a>
                  ) : isEquipped ? (
                    <span className="flex items-center gap-1 text-cyan-400 font-mono text-xs font-bold">
                      <SafeIcon icon={FiCheck} /> EQUIPPED
                    </span>
                  ) : isOwned ? (
                    <button
                      onClick={() => handleEquip(item)}
                      className="w-full py-1.5 px-3 rounded-lg border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-mono text-xs font-semibold"
                    >
                      Equip Item
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnlock(item)}
                      disabled={unlockingId === item.id}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-magenta-500/40 bg-magenta-500/10 hover:bg-magenta-500/20 text-magenta-300 font-mono text-xs font-semibold"
                    >
                      <SafeIcon icon={FiLock} />
                      <span>{item.price_earned_points} Earned Points</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-cyan-500/20 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-cyan-500/60">
          <span>Game: neon_chess</span>
          <span>Sync Protocol: POST /v1/gaming/inventory/equip</span>
        </div>

      </div>
    </div>
  );
}
