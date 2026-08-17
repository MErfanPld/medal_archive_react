"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/museum", label: "خانه", exact: true },
  { href: "/museum/medals", label: "مدال‌ها" },
  { href: "/museum/coins", label: "سکه و پول" },
];

export default function MuseumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <Link
            href="/museum"
            className="text-sm font-semibold tracking-tight text-primary-deep"
          >
            موزه دیجیتال مدال
          </Link>
          <nav className="flex items-center gap-1 text-sm sm:gap-2">
            {NAV.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-2.5 py-1.5 transition-colors sm:px-3",
                    active
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-text-muted hover:bg-surface-muted hover:text-text"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/admin/dashboard"
              className="mr-1 rounded-lg px-2.5 py-1.5 text-text-muted transition-colors hover:bg-surface-muted hover:text-text sm:px-3"
            >
              مدیریت
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">{children}</main>
      <footer className="border-t border-border py-8 text-center text-xs text-text-subtle">
        Medal Archive Pro · تجربه موزه‌ای
      </footer>
    </div>
  );
}
