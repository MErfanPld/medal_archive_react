"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Landmark, Search, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchOverlay } from "@/components/museum/search-overlay";

const NAV = [
  { href: "/museum", label: "موزه", exact: true },
  { href: "/museum/medals", label: "مدال" },
  { href: "/museum/coins", label: "سکه و پول" },
  { href: "/museum/banknotes", label: "اسکناس" },
  { href: "/museum/antiques", label: "آنتیک" },
  { href: "/museum/knives", label: "چاقو" },
  { href: "/museum/rings", label: "انگشتر" },
  { href: "/museum/seals", label: "مهر" },
  { href: "/museum/stamps", label: "تمبر" },
  { href: "/museum/tasbih", label: "تسبیح" },
];

export function MuseumPublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="museum-public museum-shell min-h-screen bg-background text-text">
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b border-border bg-background",
          "shadow-[0_1px_0_0_color-mix(in_srgb,var(--border)_80%,transparent)]",
          scrolled && "shadow-md shadow-black/5"
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:h-[4.25rem] sm:px-8 lg:px-10">
          <Link href="/museum" className="group flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-deep text-white shadow-md shadow-primary/20 transition group-hover:scale-105">
              <Landmark className="size-4" />
            </span>
            <span className="leading-tight">
              <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-primary">
                Medal Archive
              </span>
              <span className="block text-sm font-semibold text-primary-deep">
                موزه دیجیتال
              </span>
            </span>
          </Link>

          <nav className="hidden max-w-[min(100%,42rem)] flex-wrap items-center justify-end gap-0.5 lg:flex">
            {NAV.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href ||
                  pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-2.5 py-1.5 text-xs transition xl:px-3 xl:text-sm",
                    active
                      ? "bg-primary/10 font-semibold text-primary-deep"
                      : "text-text-muted hover:bg-surface-muted hover:text-text"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-full border border-border/80 bg-surface/70 px-3 py-2 text-sm text-text-muted backdrop-blur transition hover:border-primary/30 hover:text-primary"
              aria-label="جستجو"
            >
              <Search className="size-4" />
              <span className="hidden sm:inline">جستجو</span>
            </button>
            <Link
              href="/login"
              className="hidden rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-deep sm:inline-flex"
            >
              ورود
            </Link>
            <button
              type="button"
              className="rounded-lg p-2 text-text-muted md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "بستن منو" : "منو"}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="border-t border-border bg-surface px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-text hover:bg-surface-muted"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/login"
                className="mt-2 rounded-lg bg-primary px-3 py-2.5 text-center text-sm font-medium text-white"
              >
                ورود به سامانه
              </Link>
            </nav>
          </div>
        ) : null}
      </header>

      <main className="pt-16 sm:pt-[4.25rem]">{children}</main>

      <footer className="mt-20 border-t border-border bg-[#1a1614] text-[#f5f2ed]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary text-white">
                <Landmark className="size-4" />
              </span>
              <span className="text-sm font-semibold tracking-wide">
                Medal Archive
              </span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/55">
              موزه دیجیتال مدال و سکه — فضایی برای کشف، مطالعه و حفظ میراث
              تاریخی مجموعه‌ها.
            </p>
          </div>
          <div>
            <p className="museum-label text-white/40">کاوش</p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li>
                <Link href="/museum/medals" className="hover:text-white">
                  مدال
                </Link>
              </li>
              <li>
                <Link href="/museum/coins" className="hover:text-white">
                  سکه و پول
                </Link>
              </li>
              <li>
                <Link href="/museum/banknotes" className="hover:text-white">
                  اسکناس
                </Link>
              </li>
              <li>
                <Link href="/museum/antiques" className="hover:text-white">
                  آنتیک
                </Link>
              </li>
              <li>
                <Link href="/museum/knives" className="hover:text-white">
                  چاقو
                </Link>
              </li>
              <li>
                <Link href="/museum/rings" className="hover:text-white">
                  انگشتر
                </Link>
              </li>
              <li>
                <Link href="/museum/seals" className="hover:text-white">
                  مهر
                </Link>
              </li>
              <li>
                <Link href="/museum/stamps" className="hover:text-white">
                  تمبر
                </Link>
              </li>
              <li>
                <Link href="/museum/tasbih" className="hover:text-white">
                  تسبیح
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="museum-label text-white/40">سامانه</p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li>
                <Link href="/login" className="hover:text-white">
                  ورود مدیران
                </Link>
              </li>
              <li>
                <Link href="/admin/dashboard" className="hover:text-white">
                  پنل مدیریت
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-center text-xs text-white/40 sm:flex-row sm:px-6 sm:text-right">
            <p>© {new Date().getFullYear()} Medal Archive Pro</p>
            <p className="tracking-[0.2em] uppercase">Digital Museum</p>
          </div>
        </div>
      </footer>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
