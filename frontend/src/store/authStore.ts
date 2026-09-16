import { create } from "zustand";

interface AuthState {
  isLoaded: boolean;
  userId: number | null;
  username: string | null;
  karma: number;
  setUser: (user: { id: number; username: string; karma: number }) => void;
  updateKarma: (karma: number) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoaded: false,
  userId: null,
  username: null,
  karma: 0,
  setUser: (user) => set({ isLoaded: true, userId: user.id, username: user.username, karma: user.karma }),
  updateKarma: (karma) => set({ karma }),
  clearUser: () => set({ isLoaded: true, userId: null, username: null, karma: 0 }),
}));
