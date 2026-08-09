"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserMe } from "@/types/api";
import { configureAuthHandlers } from "@/lib/api/client";
import { authApi } from "@/lib/api/auth";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserMe | null;
  isHydrated: boolean;

  setSession: (access: string, refresh: string, user: UserMe) => void;
  clearSession: () => void;
  setUser: (user: UserMe) => void;
  setHydrated: (v: boolean) => void;

  /** Helper: does the current user hold a given permission codename? */
  hasPermission: (codename: string) => boolean;
  /** Helper: does the current user hold any of the given roles? */
  hasRole: (...codenames: string[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isHydrated: false,

      setSession: (access, refresh, user) =>
        set({ accessToken: access, refreshToken: refresh, user }),

      clearSession: () =>
        set({ accessToken: null, refreshToken: null, user: null }),

      setUser: (user) => set({ user }),

      setHydrated: (v) => set({ isHydrated: v }),

      hasPermission: (codename) => {
        const user = get().user;
        if (!user) return false;
        const roleCodes = user.roles.map((r) => r.codename.toLowerCase());
        if (
          roleCodes.includes("superuser") ||
          roleCodes.includes("admin") ||
          roleCodes.includes("super_admin")
        ) {
          return true;
        }
        return false;
      },

      hasRole: (...codenames) => {
        const user = get().user;
        if (!user) return false;
        const setCodes = new Set(user.roles.map((r) => r.codename.toLowerCase()));
        return codenames.some((c) => setCodes.has(c.toLowerCase()));
      },
    }),
    {
      name: "medal-archive-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

// Wire the API client to the store once (client-side).
if (typeof window !== "undefined") {
  configureAuthHandlers(
    () => useAuthStore.getState().accessToken,
    () => useAuthStore.getState().clearSession()
  );
}

/**
 * Login helper used by the login form.
 */
export async function login(username: string, password: string) {
  const data = await authApi.login({ username, password });
  useAuthStore.getState().setSession(data.access, data.refresh, data.user);
  return data;
}

/**
 * Logout helper.
 */
export async function logout() {
  const { refreshToken, clearSession } = useAuthStore.getState();
  try {
    if (refreshToken) {
      await authApi.logout({ refresh: refreshToken });
    }
  } catch {
    // ignore network errors on logout
  } finally {
    clearSession();
  }
}
