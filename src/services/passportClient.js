/**
 * AXiM Passport Client
 * Standardized client for AXiM Passport authentication in AXiM ecosystem web apps.
 */

const PASSPORT_TOKEN_STORAGE_KEY = 'axim_passport_token';
const PASSPORT_USER_STORAGE_KEY = 'axim_passport_user';

export class AximPassportClient {
  constructor(config = {}) {
    this.authUrl = config.authUrl || 'https://axim.us.com/passport';
    this.token = null;
    this.user = null;
    this.listeners = new Set();
    this.init();
  }

  init() {
    // Check URL parameters for token handoff from axim.us.com
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('passport_token');
      if (urlToken) {
        this.setToken(urlToken);
        // Clean URL parameter without reloading
        urlParams.delete('passport_token');
        const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '');
        window.history.replaceState({}, document.title, newUrl);
        return;
      }

      // Check localStorage for persisted token
      const storedToken = localStorage.getItem(PASSPORT_TOKEN_STORAGE_KEY);
      if (storedToken) {
        this.setToken(storedToken);
      }
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach((cb) => cb(state));
  }

  getState() {
    return {
      isAuthenticated: !!this.token,
      isGuest: !this.token,
      token: this.token,
      user: this.user,
    };
  }

  parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  setToken(token) {
    if (!token || typeof token !== 'string') {
      this.clearSession();
      return;
    }

    // Reject bare wallet addresses - tokens must be JWT (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('[AXiM Passport] Rejected token: not a valid signed JWT.');
      this.clearSession();
      return;
    }

    const payload = this.parseJwt(token);
    // Check expiry
    if (payload && payload.exp && payload.exp * 1000 < Date.now()) {
      console.warn('[AXiM Passport] Token expired.');
      this.clearSession();
      return;
    }

    this.token = token;
    this.user = {
      id: payload?.sub || payload?.user_id || 'player_' + Math.random().toString(36).substring(2, 9),
      username: payload?.username || payload?.name || 'AXiM Player',
      avatar: payload?.avatar || null,
      wallet: payload?.wallet_address || null,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(PASSPORT_TOKEN_STORAGE_KEY, token);
      localStorage.setItem(PASSPORT_USER_STORAGE_KEY, JSON.stringify(this.user));
    }
    this.notify();
  }

  login() {
    if (typeof window !== 'undefined') {
      const returnUrl = encodeURIComponent(window.location.href);
      window.location.href = `${this.authUrl}?return_url=${returnUrl}`;
    }
  }

  loginWithDemo() {
    // Generate valid signed demo JWT structure for testing/dev environments
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        sub: 'axim_usr_998124',
        username: 'CyberTactician',
        wallet_address: '0x71C...49A2',
        exp: Math.floor(Date.now() / 1000) + 86400,
      })
    );
    const signature = btoa('mock_verified_signature');
    this.setToken(`${header}.${payload}.${signature}`);
  }

  logout() {
    this.clearSession();
  }

  clearSession() {
    this.token = null;
    this.user = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PASSPORT_TOKEN_STORAGE_KEY);
      localStorage.removeItem(PASSPORT_USER_STORAGE_KEY);
    }
    this.notify();
  }
}

export const passportClient = new AximPassportClient();
