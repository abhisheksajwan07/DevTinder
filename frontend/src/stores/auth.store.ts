import { create } from "zustand";
import { persist } from "zustand/middleware";

export type User = {
  id: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
};
type AuthState = {
  user: User | null;
  setUser: (user: User | null) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clear: () => set({ user: null }),
    }),
    { name: "devtinder-auth" },
  ),
);
