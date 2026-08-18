"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/museum", label: "نمای عمومی", exact: true },
  { href: "/museum/medals", label: "گالری مدال‌ها" },
  { href: "/museum/coins", label: "گالری سکه و پول" },
];

export default function MuseumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="museum-shell min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-surface/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <Link href="/museum" className="group flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-deep text-white shadow-md shadow-primary/25 transition group-hover:scale-105">
              <Landmark className="size-3.5" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold tracking-tight text-primary-deep">
                موزه دیجیتال
              </span>
              <span className="block text-[10px] font-medium text-text-subtle">
                Medal Archive
              </span>
            </span>
          </Link>

          <nav className="flex items-center gap-0.5 text-sm">
            {NAV.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href ||
                  pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-active={active}
                  className={cn(
                    "museum-nav-link rounded-lg px-2 py-1.5 sm:px-3",
                    active
                      ? "font-semibold text-primary"
                      : "text-text-muted hover:bg-surface-muted hover:text-text"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/admin/dashboard"
              className="mr-1 hidden rounded-lg border border-border/80 bg-surface px-2.5 py-1 text-xs font-medium text-text-muted shadow-sm transition hover:border-primary/30 hover:text-primary sm:inline-flex"
            >
              پنل مدیریت
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>

      <footer className="border-t border-border/70 bg-surface/40">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-center sm:flex-row sm:text-right">
          <p className="text-xs text-text-subtle">
            موزه دیجیتال مدال و سکه · Medal Archive Pro
          </p>
          <div className="flex gap-4 text-xs text-text-muted">
            <Link href="/museum/medals" className="hover:text-primary">
              مدال‌ها
            </Link>
            <Link href="/museum/coins" className="hover:text-primary">
              سکه و پول
            </Link>
            <Link href="/login" className="hover:text-primary">
              ورود
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
