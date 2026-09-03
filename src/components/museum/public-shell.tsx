"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X } from "lucide-react";
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="museum-public museum-shell min-h-screen bg-[#0D0D0D] text-[#F5F2EA]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0D0D0D] shadow-lg shadow-black/40">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:h-[4.25rem] sm:px-8 lg:px-10">
          <Link href="/museum" className="group flex items-center gap-3">
            <span className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-white shadow-md shadow-black/30 transition group-hover:scale-105 sm:size-11">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/naser-solb-logo.png"
                alt="ناصر صلب"
                className="h-8 w-8 object-contain sm:h-9 sm:w-9"
              />
            </span>
            <span className="leading-tight">
              <span className="block text-[0.65rem] font-semibold tracking-[0.12em] text-[#C8A75D]">
                ناصر صلب
              </span>
              <span className="block text-sm font-semibold text-[#F5F2EA]">
                مجموعه آثار
              </span>
            </span>
          </Link>

          <nav className="hidden max-w-[min(100%,40rem)] flex-wrap items-center justify-end gap-0.5 lg:flex">
            {NAV.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/");
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
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#A8A8A8] transition hover:border-[#C8A75D]/40 hover:text-[#C8A75D]"
              aria-label="جستجو"
            >
              <Search className="size-4" />
              <span className="hidden sm:inline">جستجو</span>
            </button>
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
          <div className="border-t border-white/5 bg-[#0D0D0D] px-4 py-4 lg:hidden">
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
            </nav>
          </div>
        ) : null}
      </header>

      <main className="pt-16 sm:pt-[4.25rem]">{children}</main>

      <footer className="border-t border-white/5 bg-[#0a0a0a]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-3 px-5 py-10 text-center sm:px-8 lg:px-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/naser-solb-logo.png"
            alt="ناصر صلب"
            className="h-12 w-12 object-contain opacity-90 invert"
          />
          <p className="text-xs text-[#A8A8A8]">
            © {new Date().getFullYear()} مجموعه آثار ناصر صلب — همه حقوق محفوظ است.
          </p>
        </div>
      </footer>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
