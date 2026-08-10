"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserMe } from "@/types/api";
import { configureAuthHandlers } from "@/lib/api/client";
import { authApi } from "@/lib/api/auth";
import {
  hasPermission as checkPermission,
  hasRole as checkRole,
  hasAnyPermission as checkAny,
  hasAllPermissions as checkAll,
} from "@/lib/permissions";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserMe | null;
  isHydrated: boolean;

  setSession: (access: string, refresh: string, user: UserMe) => void;
  clearSession: () => void;
  setUser: (user: UserMe) => void;
  setHydrated: (v: boolean) => void;

  hasPermission: (codename: string) => boolean;
  hasAnyPermission: (codenames: string[]) => boolean;
  hasAllPermissions: (codenames: string[]) => boolean;
  hasRole: (...codenames: string[]) => boolean;
  isAuthenticated: () => boolean;
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

      hasPermission: (codename) => checkPermission(get().user, codename),
      hasAnyPermission: (codenames) => checkAny(get().user, codenames),
      hasAllPermissions: (codenames) => checkAll(get().user, codenames),
      hasRole: (...codenames) => checkRole(get().user, ...codenames),
      isAuthenticated: () => Boolean(get().accessToken && get().user),
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

if (typeof window !== "undefined") {
  configureAuthHandlers(
    () => useAuthStore.getState().accessToken,
    () => useAuthStore.getState().clearSession()
  );
}

export async function login(username: string, password: string) {
  const data = await authApi.login({ username, password });
  useAuthStore.getState().setSession(data.access, data.refresh, data.user);
  return data;
}

export async function logout() {
  const { refreshToken, clearSession } = useAuthStore.getState();
  try {
    if (refreshToken) {
      await authApi.logout({ refresh: refreshToken });
    }
  } catch {
    // ignore
  } finally {
    clearSession();
  }
}

export async function refreshCurrentUser() {
  const { accessToken, setUser, clearSession } = useAuthStore.getState();
  if (!accessToken) return null;
  try {
    const user = await authApi.me();
    setUser(user);
    return user;
  } catch {
    clearSession();
    return null;
  }
}
