"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserMe, TokenPairResponse } from "@/types/api";
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
  MOCK_USERS,
} from "@/data/mock/users";

const AUTH_COOKIE = "medal_auth";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserMe | null;
  isHydrated: boolean;

  setSession: (access: string, refresh: string, user: UserMe | null) => void;
  clearSession: () => void;
  setUser: (user: UserMe) => void;
  setHydrated: (v: boolean) => void;

  hasPermission: (codename: string) => boolean;
  hasAnyPermission: (codenames: string[]) => boolean;
  hasAllPermissions: (codenames: string[]) => boolean;
  hasRole: (...codenames: string[]) => boolean;
  isAuthenticated: () => boolean;
}

function setAuthCookie(on: boolean) {
  if (typeof document === "undefined") return;
  if (on) {
    document.cookie = `${AUTH_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  } else {
    document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isHydrated: false,

      setSession: (access, refresh, user) => {
        set({ accessToken: access, refreshToken: refresh, user });
        setAuthCookie(true);
      },

      clearSession: () => {
        set({ accessToken: null, refreshToken: null, user: null });
        setAuthCookie(false);
      },

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
        // Restore middleware cookie if session was persisted
        if (state?.accessToken) {
          setAuthCookie(true);
        }
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

/**
 * Mock auth is OPT-IN only.
 * Real API is the default. Set NEXT_PUBLIC_USE_MOCK_AUTH=1 to force mock login.
 * Never enabled in production builds.
 */
export const isDevMockAuthEnabled =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "1";

function mockLogin(username: string): TokenPairResponse {
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

/**
 * Production login flow:
 * 1. POST /api/users/login/  { username, password }
 * 2. Store access + refresh tokens
 * 3. GET /api/users/me/ for authoritative user + roles
 * 4. Persist session (Zustand + cookie hint for middleware)
 */
export async function login(username: string, password: string) {
  if (isDevMockAuthEnabled) {
    if (!password) {
      throw new Error("PASSWORD_REQUIRED");
    }
    const data = mockLogin(username);
    useAuthStore
      .getState()
      .setSession(data.access, data.refresh, data.user ?? null);
    return data;
  }

  // Real API — never mock
  const data = await authApi.login({
    username: username.trim(),
    password,
  });

  if (!data?.access) {
    throw new Error("پاسخ ورود ناقص است (access token موجود نیست).");
  }

  // Store tokens first so subsequent /me has Authorization header
  useAuthStore.getState().setSession(
    data.access,
    data.refresh ?? "",
    data.user ?? null
  );

  // Authoritative user profile from backend
  try {
    const me = await authApi.me();
    useAuthStore.getState().setUser(me);
    return { ...data, user: me };
  } catch {
    // If /me fails but login returned user, keep that; otherwise fail
    if (data.user) {
      return data;
    }
    useAuthStore.getState().clearSession();
    throw new Error("ورود موفق بود ولی دریافت اطلاعات کاربر ناموفق بود.");
  }
}

export async function logout() {
  const { refreshToken, clearSession, accessToken } = useAuthStore.getState();
  try {
    if (
      refreshToken &&
      !String(accessToken || "").startsWith("dev-mock-") &&
      !isDevMockAuthEnabled
    ) {
      // POST /api/users/logout/ with { refresh }
      await authApi.logout({ refresh: refreshToken });
    }
  } catch {
    // Always clear local session even if network fails
  } finally {
    clearSession();
  }
}

/**
 * Re-fetch current user (GET /api/users/me/).
 * Used after page refresh and by AuthGuard.
 */
export async function refreshCurrentUser(options?: { clearOnError?: boolean }) {
  const clearOnError = options?.clearOnError ?? false;
  const { accessToken, user, setUser, clearSession } = useAuthStore.getState();
  if (!accessToken) return null;

  if (isDevMockAuthEnabled || String(accessToken).startsWith("dev-mock-")) {
    return user;
  }

  try {
    const me = await authApi.me();
    const normalized = {
      ...me,
      first_name:
        me.first_name ??
        (me as { firstName?: string }).firstName ??
        "",
      last_name:
        me.last_name ??
        (me as { lastName?: string }).lastName ??
        "",
      email: me.email ?? null,
    };
    setUser(normalized);
    setAuthCookie(true);
    return normalized;
  } catch {
    if (clearOnError) {
      clearSession();
      return null;
    }
    // Keep existing session user so settings/profile fields stay filled
    return user;
  }
}

/** Demo accounts — only when mock auth is explicitly enabled. */
export function getDevMockAccounts() {
  if (!isDevMockAuthEnabled) return [];
  return [
    { username: "admin", role: "مدیر کل (دسترسی کامل)", password: "any" },
    { username: "curator.sara", role: "نگهدارنده", password: "any" },
    { username: "editor.neda", role: "ویرایشگر", password: "any" },
    { username: "viewer.ali", role: "بازدیدکننده", password: "any" },
  ];
}
