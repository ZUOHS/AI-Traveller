import { create } from 'zustand';

import {
  exchangeToken,
  fetchProfile,
  signOutSupabase
} from '../services/authService.js';

const STORAGE_KEY = 'ai-traveller-token';

export const useSessionStore = create((set, get) => ({
  user: null,
  token: null,
  loading: true,
  error: null,
  initialise: async () => {
    try {
      const storedToken = localStorage.getItem(STORAGE_KEY) || null;
      if (!storedToken) {
        set({ loading: false });
        return null;
      }
      await get().setSession(storedToken);
      return storedToken;
    } catch (error) {
      set({ error, loading: false });
      return null;
    }
  },
  setSession: async (accessToken) => {
    if (!accessToken) {
      return get().clear();
    }
    localStorage.setItem(STORAGE_KEY, accessToken);
    const profile = await exchangeToken(accessToken);
    set({
      token: accessToken,
      user: profile,
      loading: false,
      error: null
    });
    return profile;
  },
  refreshProfile: async () => {
    const profile = await fetchProfile();
    set({ user: profile });
    return profile;
  },
  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ user: null, token: null, loading: false });
  },
  signOut: async () => {
    await signOutSupabase();
    get().clear();
  }
}));
