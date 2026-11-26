/**
 * AXiM Core Gaming Client
 * Handles Gaming Profile, Inventory (Cosmetics), Credits / Earned Points, and Spend / Equip operations.
 */

const CORE_API_URL = import.meta.env.VITE_AXIM_CORE_URL || 'https://core.axim.us.com';
const SELLDONE_SHOP_URL = 'https://shop.axim.us.com';

// Mock/Initial items available in the Neon Chess catalog
export const DEFAULT_CATALOG = [
  {
    id: 'retro',
    name: 'Retro Synthwave',
    type: 'piece_set',
    game_compatibility: ['neon_chess'],
    rarity: 'standard',
    price_earned_points: 0,
    price_paid_credits: 0,
    equipped: true,
    owned: true,
    desc: 'Classic 80s glowing wireframe pieces',
  },
  {
    id: 'neon',
    name: 'Cyber Neon Glow',
    type: 'piece_set',
    game_compatibility: ['neon_chess'],
    rarity: 'rare',
    price_earned_points: 150,
    price_paid_credits: 20,
    equipped: false,
    owned: false,
    desc: 'High-intensity photon-charged pieces',
  },
  {
    id: 'digital',
    name: 'Matrix Digital',
    type: 'piece_set',
    game_compatibility: ['neon_chess'],
    rarity: 'epic',
    price_earned_points: 300,
    price_paid_credits: 40,
    equipped: false,
    owned: false,
    desc: 'Pure green code cascade holographic set',
  },
  {
    id: 'classic',
    name: 'Analog Chrome',
    type: 'piece_set',
    game_compatibility: ['neon_chess'],
    rarity: 'rare',
    price_earned_points: 200,
    price_paid_credits: 25,
    equipped: false,
    owned: false,
    desc: 'Polished mirrored chrome with neon accents',
  },
  {
    id: 'neon_grid_cyan',
    name: 'Neon Grid (Cyan/Magenta)',
    type: 'board_theme',
    game_compatibility: ['neon_chess'],
    rarity: 'standard',
    price_earned_points: 0,
    price_paid_credits: 0,
    equipped: true,
    owned: true,
    desc: 'Signature dual neon laser grid',
  },
  {
    id: 'obsidian_gold',
    name: 'Obsidian Gold Limited',
    type: 'board_theme',
    game_compatibility: ['neon_chess'],
    rarity: 'collector',
    is_selldone_exclusive: true,
    selldone_url: `${SELLDONE_SHOP_URL}/products/obsidian-gold-chess-set`,
    desc: 'Exclusive collector edition with 3D GLB/USDZ AR inspection & physical token',
  },
  {
    id: 'quantum_void',
    name: 'Quantum Void Grandmaster Set',
    type: 'piece_set',
    game_compatibility: ['neon_chess'],
    rarity: 'collector',
    is_selldone_exclusive: true,
    selldone_url: `${SELLDONE_SHOP_URL}/products/quantum-void-grandmaster`,
    desc: 'Limited mint tournament skin with custom checkmate animation',
  },
];

export class AximCoreGamingClient {
  constructor(getAuthToken) {
    this.getAuthToken = getAuthToken;
    this.profileCache = null;
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    if (this.profileCache) listener(this.profileCache);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((cb) => cb(this.profileCache));
  }

  async fetchProfile() {
    const token = this.getAuthToken ? this.getAuthToken() : null;
    if (!token) {
      // Guest profile fallback
      this.profileCache = {
        isGuest: true,
        credits: {
          paid_credits: 0,
          earned_points: 0,
        },
        inventory: DEFAULT_CATALOG.filter((i) => i.price_earned_points === 0),
        equipped: {
          piece_set: 'retro',
          board_theme: 'neon_grid_cyan',
        },
      };
      this.notify();
      return this.profileCache;
    }

    try {
      const res = await fetch(`${CORE_API_URL}/v1/gaming/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        this.profileCache = {
          isGuest: false,
          credits: {
            paid_credits: data.paid_credits || 0,
            earned_points: data.earned_points || 0,
          },
          inventory: (data.gaming_user_inventory || []).filter((item) =>
            item.game_compatibility?.includes('neon_chess')
          ),
          equipped: data.equipped_items || {
            piece_set: 'retro',
            board_theme: 'neon_grid_cyan',
          },
        };
        this.notify();
        return this.profileCache;
      }
    } catch (err) {
      console.warn('[AXiM Core] Profile fetch failed, using local session state:', err);
    }

    // Mock/fallback authenticated session state from localStorage
    const savedInventory = localStorage.getItem('axim_user_inventory');
    const savedEquipped = localStorage.getItem('axim_user_equipped');
    const savedPoints = localStorage.getItem('axim_earned_points') || '500';
    const savedCredits = localStorage.getItem('axim_paid_credits') || '100';

    this.profileCache = {
      isGuest: false,
      credits: {
        paid_credits: parseInt(savedCredits, 10),
        earned_points: parseInt(savedPoints, 10),
      },
      inventory: savedInventory
        ? JSON.parse(savedInventory)
        : DEFAULT_CATALOG.filter((i) => i.price_earned_points === 0),
      equipped: savedEquipped
        ? JSON.parse(savedEquipped)
        : { piece_set: 'retro', board_theme: 'neon_grid_cyan' },
    };
    this.notify();
    return this.profileCache;
  }

  async equipItem(itemType, itemId) {
    const token = this.getAuthToken ? this.getAuthToken() : null;
    if (token) {
      try {
        await fetch(`${CORE_API_URL}/v1/gaming/inventory/equip`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            game: 'neon_chess',
            slot: itemType,
            item_id: itemId,
          }),
        });
      } catch (err) {
        console.warn('[AXiM Core] Equip sync failed, applying locally:', err);
      }
    }

    if (this.profileCache) {
      this.profileCache.equipped[itemType] = itemId;
      if (typeof window !== 'undefined') {
        localStorage.setItem('axim_user_equipped', JSON.stringify(this.profileCache.equipped));
      }
      this.notify();
    }
  }

  async spendCredits(itemId, costPoints) {
    const token = this.getAuthToken ? this.getAuthToken() : null;
    if (!token) {
      throw new Error('Passport authentication required to unlock items.');
    }

    if (this.profileCache && this.profileCache.credits.earned_points < costPoints) {
      throw new Error('Insufficient Earned Points.');
    }

    try {
      await fetch(`${CORE_API_URL}/v1/gaming/credits/spend`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_app: 'neon_chess',
          bucket: 'earned_points',
          amount: costPoints,
          item_id: itemId,
        }),
      });
    } catch (err) {
      console.warn('[AXiM Core] Spend API fallback to local cache:', err);
    }

    // Update local cached state
    if (this.profileCache) {
      this.profileCache.credits.earned_points -= costPoints;
      const target = DEFAULT_CATALOG.find((i) => i.id === itemId);
      if (target && !this.profileCache.inventory.some((i) => i.id === itemId)) {
        this.profileCache.inventory.push({ ...target, owned: true });
      }
      localStorage.setItem('axim_earned_points', this.profileCache.credits.earned_points.toString());
      localStorage.setItem('axim_user_inventory', JSON.stringify(this.profileCache.inventory));
      this.notify();
    }
  }
}

import { passportClient } from './passportClient';
export const coreGamingClient = new AximCoreGamingClient(() => passportClient.getState().token);

