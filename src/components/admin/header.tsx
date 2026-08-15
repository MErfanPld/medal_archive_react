"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import { useAuthStore, logout } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

interface AdminHeaderProps {
  onMenuClick?: () => void;
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function AdminHeader({
  onMenuClick,
  title,
  breadcrumbs,
}: AdminHeaderProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.username ||
    "کاربر";

  const roleLabel = user?.roles?.[0]?.name || "—";

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      document.cookie = "medal_auth=; path=/; max-age=0";
      router.replace("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/80 bg-surface/80 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-surface/70 sm:px-6">
      <button
        type="button"
        className="rounded-md p-2 text-text-muted hover:bg-surface-muted lg:hidden"
        onClick={onMenuClick}
        aria-label="باز کردن منو"
      >
        <Menu className="size-5" />
      </button>

      <div className="min-w-0 flex-1">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav aria-label="مسیر صفحه" className="flex items-center gap-1.5 text-sm">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && (
                  <span className="text-text-subtle" aria-hidden>
                    /
                  </span>
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-text-muted transition-colors hover:text-text"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-medium text-text">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : title ? (
          <h1 className="truncate text-base font-semibold text-text">{title}</h1>
        ) : null}
      </div>

      <div className="relative">
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-surface-muted",
            menuOpen && "bg-surface-muted"
          )}
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary-deep">
            <UserIcon className="size-4" aria-hidden />
          </span>
          <span className="hidden text-right sm:block">
            <span className="block font-medium text-text">{displayName}</span>
            <span className="block text-xs text-text-muted">{roleLabel}</span>
          </span>
          <ChevronDown className="size-4 text-text-subtle" aria-hidden />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
              aria-hidden
            />
            <div
              role="menu"
              className="absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border border-border bg-surface py-1 shadow-md"
            >
              <div className="border-b border-border px-3 py-2 sm:hidden">
                <p className="text-sm font-medium text-text">{displayName}</p>
                <p className="text-xs text-text-muted">{roleLabel}</p>
              </div>
              <Link
                href="/profile"
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text hover:bg-surface-muted"
                onClick={() => setMenuOpen(false)}
              >
                <UserIcon className="size-4" />
                پروفایل
              </Link>
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger-bg"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                <LogOut className="size-4" aria-hidden />
                {loggingOut ? "در حال خروج…" : "خروج"}
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
