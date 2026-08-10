"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore, refreshCurrentUser } from "@/stores/auth-store";

interface AuthGuardProps {
  children: ReactNode;
  permission?: string;
  fallback?: ReactNode;
}

export function AuthGuard({ children, permission, fallback }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { accessToken, user, isHydrated, hasPermission } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isHydrated) return;

    let cancelled = false;

    async function verify() {
      if (!accessToken) {
        const next = encodeURIComponent(pathname || "/admin/dashboard");
        router.replace(`/login?next=${next}`);
        return;
      }

      if (!user) {
        await refreshCurrentUser();
      }

      if (cancelled) return;

      if (!useAuthStore.getState().user) {
        router.replace("/login");
        return;
      }

      setChecking(false);
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [isHydrated, accessToken, user, pathname, router]);

  if (!isHydrated || checking) {
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
