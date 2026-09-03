"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Landmark, Search, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchOverlay } from "@/components/museum/search-overlay";

const NAV = [
  { href: "/museum", label: "خانه", exact: true },
  { href: "/museum/medals", label: "مدال" },
  { href: "/museum/coins", label: "سکه" },
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
    <div className="museum-public museum-shell min-h-screen bg-[#0D0D0D] text-[#F5F2EA]">
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b border-white/5 transition-colors duration-300",
          scrolled
            ? "bg-[#0D0D0D]/92 shadow-lg shadow-black/30 backdrop-blur-md"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:h-[4.25rem] sm:px-8 lg:px-10">
          <Link href="/museum" className="group flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-[#C8A75D] text-[#0D0D0D] shadow-md shadow-[#C8A75D]/20 transition group-hover:scale-105">
              <Landmark className="size-4" />
            </span>
            <span className="leading-tight">
              <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[#C8A75D]">
                Medal Archive
              </span>
              <span className="block text-sm font-semibold text-[#F5F2EA]">
                موزه دیجیتال
              </span>
            </span>
          </Link>

          <nav className="hidden max-w-[min(100%,40rem)] flex-wrap items-center justify-end gap-0.5 lg:flex">
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
                      ? "bg-[#C8A75D]/15 font-semibold text-[#C8A75D]"
                      : "text-[#A8A8A8] hover:bg-white/5 hover:text-[#F5F2EA]"
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
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#A8A8A8] backdrop-blur transition hover:border-[#C8A75D]/40 hover:text-[#C8A75D]"
              aria-label="جستجو"
            >
              <Search className="size-4" />
              <span className="hidden sm:inline">جستجو</span>
            </button>
            <Link
              href="/login"
              className="hidden rounded-full bg-[#C8A75D] px-4 py-2 text-sm font-medium text-[#0D0D0D] transition hover:bg-[#d4b56e] sm:inline-flex"
            >
              ورود
            </Link>
            <button
              type="button"
              className="rounded-lg p-2 text-[#A8A8A8] lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "بستن منو" : "منو"}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="border-t border-white/5 bg-[#171717] px-4 py-4 lg:hidden">
            <nav className="flex flex-col gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#F5F2EA] hover:bg-white/5"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/login"
                className="mt-2 rounded-lg bg-[#C8A75D] px-3 py-2.5 text-center text-sm font-medium text-[#0D0D0D]"
              >
                ورود به سامانه
              </Link>
            </nav>
          </div>
        ) : null}
      </header>

      <main className="pt-0">{children}</main>

      <footer className="mt-0 border-t border-white/5 bg-[#0a0a0a] text-[#F5F2EA]">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-10">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-full bg-[#C8A75D] text-[#0D0D0D]">
                <Landmark className="size-4" />
              </span>
              <span className="text-sm font-semibold tracking-wide">
                Medal Archive
              </span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-7 text-[#A8A8A8]">
              موزه دیجیتال مجموعه‌های تاریخی — فضایی برای کشف، مطالعه و حفظ
              میراث مادی مدال، سکه و آثار ارزشمند.
            </p>
          </div>
          <div>
            <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-[#C8A75D] uppercase">
              مجموعه‌ها
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[#A8A8A8]">
              {[
                ["/museum/medals", "مدال"],
                ["/museum/coins", "سکه و پول"],
                ["/museum/banknotes", "اسکناس"],
                ["/museum/antiques", "آنتیک"],
                ["/museum/seals", "مهر"],
                ["/museum/stamps", "تمبر"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-[#F5F2EA]">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-[#C8A75D] uppercase">
              سامانه
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[#A8A8A8]">
              <li>
                <Link href="/museum" className="hover:text-[#F5F2EA]">
                  نمای عمومی
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#F5F2EA]">
                  ورود مدیران
                </Link>
              </li>
              <li>
                <Link href="/admin/dashboard" className="hover:text-[#F5F2EA]">
                  پنل مدیریت
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-5 text-center text-xs text-[#A8A8A8] sm:flex-row sm:px-8 sm:text-right lg:px-10">
            <p>© {new Date().getFullYear()} Medal Archive Pro</p>
            <p className="tracking-[0.2em] uppercase text-[#C8A75D]/70">
              Digital Museum
            </p>
          </div>
        </div>
      </footer>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
