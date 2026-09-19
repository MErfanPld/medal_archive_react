"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueries } from "@tanstack/react-query";
import {
  Search,
  ImageOff,
  Award,
  Coins,
  Banknote,
  Package,
  Sword,
  Gem,
  Hexagon,
  Stamp,
  CircleDot,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { getMedals } from "@/lib/data/medals";
import { getCoins } from "@/lib/data/coins";
import { getBanknotes } from "@/lib/data/banknotes";
import { getAntiques } from "@/lib/data/antiques";
import { getKnives } from "@/lib/data/knives";
import { getRings } from "@/lib/data/rings";
import { getSeals } from "@/lib/data/seals";
import { getStamps } from "@/lib/data/stamps";
import { getTasbihs } from "@/lib/data/tasbih";
import { resolveMediaUrl, formatNumber } from "@/lib/utils";

type ItemLike = {
  id: number;
  name: string;
  year?: number | string | null;
  country?: string | null;
  primary_image?: string | null;
  primary_image_url?: string | null;
};

const CATEGORIES = [
  {
    key: "medals",
    title: "مدال‌ها",
    href: "/museum/medals",
    Icon: Award,
    fetch: (q: string) =>
      getMedals({ page: 1, search: q || undefined, ordering: "-created_at" }),
  },
  {
    key: "coins",
    title: "سکه و پول",
    href: "/museum/coins",
    Icon: Coins,
    fetch: (q: string) =>
      getCoins({
        page: 1,
        search: q || undefined,
        is_active: true,
        ordering: "-created_at",
      }),
  },
  {
    key: "banknotes",
    title: "اسکناس",
    href: "/museum/banknotes",
    Icon: Banknote,
    fetch: (q: string) =>
      getBanknotes({
        page: 1,
        search: q || undefined,
        ordering: "-created_at",
      }),
  },
  {
    key: "antiques",
    title: "آنتیک",
    href: "/museum/antiques",
    Icon: Package,
    fetch: (q: string) =>
      getAntiques({
        page: 1,
        search: q || undefined,
        ordering: "-created_at",
      }),
  },
  {
    key: "knives",
    title: "چاقو",
    href: "/museum/knives",
    Icon: Sword,
    fetch: (q: string) =>
      getKnives({ page: 1, search: q || undefined, ordering: "-created_at" }),
  },
  {
    key: "rings",
    title: "انگشتر",
    href: "/museum/rings",
    Icon: Gem,
    fetch: (q: string) =>
      getRings({ page: 1, search: q || undefined, ordering: "-created_at" }),
  },
  {
    key: "seals",
    title: "مهر",
    href: "/museum/seals",
    Icon: Hexagon,
    fetch: (q: string) =>
      getSeals({ page: 1, search: q || undefined, ordering: "-created_at" }),
  },
  {
    key: "stamps",
    title: "تمبر",
    href: "/museum/stamps",
    Icon: Stamp,
    fetch: (q: string) =>
      getStamps({ page: 1, search: q || undefined, ordering: "-created_at" }),
  },
  {
    key: "tasbih",
    title: "تسبیح",
    href: "/museum/tasbih",
    Icon: CircleDot,
    fetch: (q: string) =>
      getTasbihs({ page: 1, search: q || undefined, ordering: "-created_at" }),
  },
] as const;

function imgOf(m: ItemLike) {
  return resolveMediaUrl(m.primary_image_url || m.primary_image || null);
}

function MuseumSearchPageInner() {
  const router = useRouter();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";

  const [searchInput, setSearchInput] = useState(initialQ);
  const [q, setQ] = useState(initialQ);

  const queries = useQueries({
    queries: CATEGORIES.map((cat) => ({
      queryKey: ["museum-search", cat.key, q],
      enabled: isHydrated && q.trim().length > 0,
      queryFn: () => cat.fetch(q.trim()),
      retry: 1,
    })),
  });

  const sections = useMemo(() => {
    return CATEGORIES.map((cat, i) => {
      const data = queries[i]?.data;
      const results = (data?.results ?? []) as ItemLike[];
      const count = data?.count ?? results.length;
      return {
        ...cat,
        results: results.slice(0, 8),
        count,
        isLoading: queries[i]?.isLoading ?? false,
        isError: queries[i]?.isError ?? false,
      };
    }).filter(
      (s) => s.isLoading || s.isError || s.count > 0 || s.results.length > 0
    );
  }, [queries]);

  const totalFound = sections.reduce((sum, s) => sum + (s.count || 0), 0);
  const anyLoading = queries.some((x) => x.isLoading);
  const hasQuery = q.trim().length > 0;

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const next = searchInput.trim();
    setQ(next);
    const params = new URLSearchParams();
    if (next) params.set("q", next);
    router.replace(
      params.toString() ? `/museum/search?${params}` : "/museum/search"
    );
  };

  return (
    <div className="mu-stage min-h-screen">
      <header className="relative overflow-hidden border-b border-white/5">
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center"
          style={{ backgroundImage: "url(/brand/study-banner.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/70 to-[#0d0d0d]" />
        <div className="mu-container relative z-10 pb-12 pt-10 sm:pb-16 sm:pt-14">
          <nav className="mu-anim-rise text-sm text-white/45">
            <Link href="/museum" className="hover:text-white">
              خانه
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[#C8A75D]">جستجو</span>
          </nav>
          <h1 className="museum-serif mu-anim-rise mt-8 text-4xl font-semibold text-white sm:text-5xl">
            جستجو در مجموعه
          </h1>
          <p className="mu-anim-rise mt-4 max-w-lg text-sm leading-8 text-white/55">
            در همه دسته‌ها جستجو کنید: مدال، سکه، اسکناس، آنتیک، چاقو، انگشتر،
            مهر، تمبر و تسبیح.
          </p>
        </div>
      </header>

      <div className="mu-container pb-20">
        <form className="mu-filter-search mu-anim-rise my-8" onSubmit={submit}>
          <Search className="size-4 shrink-0 text-[#C8A75D]" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="نام، کشور، سال یا هر واژه‌ای…"
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
            aria-label="جستجو در همه دسته‌ها"
          />
          <button
            type="submit"
            className="mu-btn mu-btn-gold !px-4 !py-2 text-sm"
          >
            جستجو
          </button>
        </form>

        {!hasQuery && (
          <p className="text-center text-sm text-white/45">
            واژه‌ای وارد کنید تا در همه دسته‌بندی‌ها جستجو شود.
          </p>
        )}

        {hasQuery && anyLoading && (
          <p className="text-sm text-white/50">در حال جستجو در همه دسته‌ها…</p>
        )}

        {hasQuery && !anyLoading && totalFound === 0 && (
          <p className="text-center text-sm text-white/50">
            نتیجه‌ای برای «{q}» یافت نشد.
          </p>
        )}

        {hasQuery && totalFound > 0 && (
          <p className="mb-8 text-sm text-[#C8A75D]">
            {formatNumber(totalFound)} نتیجه در{" "}
            {sections.filter((s) => s.count > 0).length} دسته
          </p>
        )}

        <div className="space-y-14">
          {sections.map((section) => {
            if (!section.isLoading && section.count === 0) return null;
            const Icon = section.Icon;
            return (
              <section key={section.key} className="mu-anim-rise">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#C8A75D]">
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        {section.title}
                      </h2>
                      <p className="text-xs text-white/40">
                        {section.isLoading
                          ? "در حال بارگذاری…"
                          : `${formatNumber(section.count)} اثر`}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`${section.href}?q=${encodeURIComponent(q)}`}
                    className="text-sm text-[#C8A75D] hover:underline"
                  >
                    مشاهده همه در این دسته
                  </Link>
                </div>

                {section.isError && (
                  <p className="text-sm text-white/40">خطا در دریافت این دسته</p>
                )}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {section.results.map((item) => {
                    const src = imgOf(item);
                    return (
                      <Link
                        key={`${section.key}-${item.id}`}
                        href={`${section.href}/${item.id}`}
                        className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-[#C8A75D]/40 hover:bg-white/[0.06]"
                      >
                        <div className="relative aspect-[4/3] bg-black/40">
                          {src ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={src}
                              alt={item.name}
                              className="size-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center text-white/25">
                              <ImageOff className="size-8" />
                            </div>
                          )}
                        </div>
                        <div className="p-3.5">
                          <p className="line-clamp-2 text-sm font-medium text-white">
                            {item.name}
                          </p>
                          <p className="mt-1 text-xs text-white/40">
                            {[item.country, item.year]
                              .filter(Boolean)
                              .join(" · ") || section.title}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function MuseumSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mu-stage flex min-h-screen items-center justify-center text-white/50">
          در حال آماده‌سازی جستجو…
        </div>
      }
    >
      <MuseumSearchPageInner />
    </Suspense>
  );
}
