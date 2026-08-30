"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore, refreshCurrentUser } from "@/stores/auth-store";

interface AuthGuardProps {
  children: ReactNode;
  permission?: string;
  fallback?: ReactNode;
}

/**
 * Client-side protection. Middleware only checks cookie hint;
 * this guard validates JWT session via Zustand.
 *
 * Performance: if persisted session already has token+user, render
 * immediately and refresh /me in the background (non-blocking).
 */
export function AuthGuard({ children, permission, fallback }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const hasPermission = useAuthStore((s) => s.hasPermission);

  const hasCachedSession = Boolean(accessToken && user);
  const [hardChecking, setHardChecking] = useState(!hasCachedSession);

  useEffect(() => {
    if (!isHydrated) return;

    let cancelled = false;

    async function verify() {
      if (!accessToken) {
        const next = encodeURIComponent(pathname || "/admin/dashboard");
        router.replace(`/login?next=${next}`);
        return;
      }

      // Fast path: cached user → show UI, refresh profile in background
      if (user) {
        setHardChecking(false);
        void refreshCurrentUser().then(() => {
          if (cancelled) return;
          const state = useAuthStore.getState();
          if (!state.accessToken || !state.user) {
            router.replace(
              `/login?next=${encodeURIComponent(pathname || "/admin")}`
            );
          }
        });
        return;
      }

      // No cached user → must wait for /me
      await refreshCurrentUser();
      if (cancelled) return;

      const state = useAuthStore.getState();
      if (!state.accessToken || !state.user) {
        router.replace(
          `/login?next=${encodeURIComponent(pathname || "/admin")}`
        );
        return;
      }

      setHardChecking(false);
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [isHydrated, accessToken, user, pathname, router]);

  if (!isHydrated || (hardChecking && !hasCachedSession)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <span
            className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
            aria-hidden
          />
          <p className="text-sm text-text-muted">در حال بررسی دسترسی…</p>
        </div>
      </div>
    );
  }

  if (!accessToken || !user) {
    return null;
  }

  if (permission && !hasPermission(permission)) {
    return (
      fallback ?? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-8 text-center">
          <h2 className="text-lg font-semibold text-text">دسترسی محدود</h2>
          <p className="max-w-sm text-sm text-text-muted">
            شما مجوز لازم برای مشاهده این بخش را ندارید.
          </p>
        </div>
      )
    );
  }

  return <>{children}</>;
}
