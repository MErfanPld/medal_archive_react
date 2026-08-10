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
import {
  MOCK_CURRENT_USER,
  MOCK_ROLES,
  MOCK_USERS,
} from "@/data/mock/users";

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

// Wire the API client to the store once (client-side).
if (typeof window !== "undefined") {
  configureAuthHandlers(
    () => useAuthStore.getState().accessToken,
    () => useAuthStore.getState().clearSession()
  );
}

/** True only in local development — never in production builds. */
export const isDevMockAuthEnabled =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_DISABLE_MOCK_AUTH !== "1";

/**
 * Development-only mock login.
 * Maps known usernames to mock users with different roles for RBAC testing.
 * Password is ignored in mock mode (any non-empty works).
 */
function mockLogin(username: string): { access: string; refresh: string; user: UserMe } {
  const normalized = username.trim().toLowerCase();
  const found = MOCK_USERS.find((u) => u.username.toLowerCase() === normalized);

  let user: UserMe;
  if (found) {
    user = {
      id: found.id,
      username: found.username,
      email: found.email,
      first_name: found.first_name,
      last_name: found.last_name,
      roles: found.roles,
      is_active: found.is_active,
      must_change_password: found.must_change_password,
      date_joined: found.date_joined,
      last_login: found.last_login,
    };
  } else if (normalized === "superuser" || normalized === "super") {
    user = {
      ...MOCK_CURRENT_USER,
      username: "superuser",
      first_name: "سوپر",
      last_name: "یوزر",
      roles: [{ id: 1, name: "مدیر کل", codename: "admin" }],
    };
  } else {
    // Default to admin for any other username in dev (convenient exploration)
    user = { ...MOCK_CURRENT_USER };
  }

  if (!user.is_active) {
    throw new Error("INACTIVE_USER");
  }

  return {
    access: `dev-mock-access-${user.username}`,
    refresh: `dev-mock-refresh-${user.username}`,
    user,
  };
}

export async function login(username: string, password: string) {
  // ── Development mock auth (static frontend phase) ──────────────────
  if (isDevMockAuthEnabled) {
    // Allow bypass without network: any password works for known mock users
    if (!password) {
      throw new Error("PASSWORD_REQUIRED");
    }
    const data = mockLogin(username);
    useAuthStore.getState().setSession(data.access, data.refresh, data.user);
    return data;
  }

  // ── Production / real API ──────────────────────────────────────────
  const data = await authApi.login({ username, password });
  useAuthStore.getState().setSession(data.access, data.refresh, data.user);
  return data;
}

export async function logout() {
  const { refreshToken, clearSession, accessToken } = useAuthStore.getState();
  try {
    // Skip real API call for mock tokens
    if (
      refreshToken &&
      !String(accessToken || "").startsWith("dev-mock-") &&
      !isDevMockAuthEnabled
    ) {
      await authApi.logout({ refresh: refreshToken });
    }
  } catch {
    // ignore network errors on logout
  } finally {
    clearSession();
  }
}

/**
 * Refresh current user from the backend (call after login or on app start).
 * In mock mode, returns the stored user without a network call.
 */
export async function refreshCurrentUser() {
  const { accessToken, user, setUser, clearSession } = useAuthStore.getState();
  if (!accessToken) return null;

  if (isDevMockAuthEnabled || String(accessToken).startsWith("dev-mock-")) {
    return user;
  }

  try {
    const me = await authApi.me();
    setUser(me);
    return me;
  } catch {
    clearSession();
    return null;
  }
}

/** Helper for login UI: list of demo accounts (dev only). */
export function getDevMockAccounts() {
  if (!isDevMockAuthEnabled) return [];
  return [
    { username: "admin", role: "مدیر کل (دسترسی کامل)", password: "any" },
    { username: "curator.sara", role: "نگهدارنده", password: "any" },
    { username: "editor.neda", role: "ویرایشگر", password: "any" },
    { username: "viewer.ali", role: "بازدیدکننده", password: "any" },
  ];
}
