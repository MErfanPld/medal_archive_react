"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ImageOff, Search } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { getMedals } from "@/lib/data/medals";
import { getCategories } from "@/lib/data/categories";
import { Pagination } from "@/components/ui/pagination";
import { formatNumber, resolveMediaUrl } from "@/lib/utils";

function imgOf(m: {
  primary_image?: string | null;
  primary_image_url?: string | null;
}) {
  return resolveMediaUrl(m.primary_image_url || m.primary_image || null);
}

function MuseumMedalsArchivePage() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const initialCat = searchParams.get("category");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(initialQ);
  const [searchInput, setSearchInput] = useState(initialQ);
  const [category, setCategory] = useState<number | undefined>(
    initialCat ? Number(initialCat) : undefined
  );
  const [ordering, setOrdering] = useState("-created_at");

  const { data: categoriesData } = useQuery({
    queryKey: ["museum-cats"],
    enabled: isHydrated,
    queryFn: () => getCategories({ is_active: true, pageSize: 50 }),
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["museum-medals", page, search, category, ordering],
    enabled: isHydrated,
    queryFn: () =>
      getMedals({
        page,
        search: search || undefined,
        category,
        ordering,
      }),
    retry: 1,
  });

  const medals = data?.results ?? [];
  const total = data?.count ?? 0;
  const meta = useMemo(() => `${formatNumber(total)} اثر`, [total]);

  return (
    <div className="mu-stage min-h-screen">
      <header className="mu-archive-hero">
        <div className="mu-container">
          <nav className="mu-anim-rise text-[0.65rem] tracking-[0.2em] text-white/35">
            <Link href="/museum" className="hover:text-white">خانه</Link>
            <span className="mx-2">/</span>
            <span className="text-[#C8A75D]">MEDAL ARCHIVE</span>
          </nav>
          <h1 className="museum-serif mu-anim-rise mt-8 text-5xl font-semibold text-white sm:text-6xl lg:text-7xl">
            Medal<br />Archive
          </h1>
          <p className="mu-anim-rise mt-6 max-w-md text-sm leading-7 text-white/55">
            کاتالوگ موزه‌ای مدال‌ها — دیوار مجموعه، نه فهرست کالا.
          </p>
          <p className="mu-label mu-anim-rise mt-8 text-[#c8a75d]">{meta}</p>
        </div>
      </header>

      <div className="mu-container">
        <div className="mu-filter-bar mu-anim-rise">
          <form
            className="flex min-w-0 flex-1 gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(searchInput);
              setPage(1);
            }}
          >
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="جستجو در آرشیو…"
              className="min-w-0 flex-1"
            />
            <button type="submit" className="inline-flex h-11 items-center gap-2 text-sm text-[#C8A75D]">
              <Search className="size-4" />
              جستجو
            </button>
          </form>
          <select
            value={category ?? ""}
            onChange={(e) => {
              setCategory(e.target.value ? Number(e.target.value) : undefined);
              setPage(1);
            }}
          >
            <option value="">دسته</option>
            {categoriesData?.results?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={ordering}
            onChange={(e) => {
              setOrdering(e.target.value);
              setPage(1);
            }}
          >
            <option value="-created_at">جدیدترین</option>
            <option value="created_at">قدیمی‌ترین</option>
            <option value="-year">سال ↓</option>
            <option value="year">سال ↑</option>
            <option value="name">الفبا</option>
          </select>
        </div>

        <div className="py-12 sm:py-16">
          {isError ? (
            <div className="py-20 text-center text-white/70">
              <p>{(error as Error)?.message}</p>
              <button type="button" onClick={() => refetch()} className="mt-4 text-[#C8A75D]">
                تلاش مجدد
              </button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="museum-shimmer aspect-square rounded-sm" />
              ))}
            </div>
          ) : medals.length === 0 ? (
            <p className="py-24 text-center text-sm text-white/50">نتیجه‌ای یافت نشد.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
                {medals.map((m) => {
                  const src = imgOf(m);
                  return (
                    <Link key={m.id} href={`/museum/medals/${m.id}`} className="mu-item-card">
                      <div className="relative aspect-square overflow-hidden bg-[#0d0d0d]">
                        {src ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={src} alt={m.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#C8A75D]/50">
                            <ImageOff className="size-8" strokeWidth={1.25} />
                            <span className="text-[0.65rem] tracking-[0.16em] uppercase">بدون تصویر</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1 p-4">
                        <p className="text-[0.65rem] tracking-[0.16em] text-[#C8A75D]">
                          {m.catalog_number ? `MA / ${m.catalog_number}` : "مدال"}
                        </p>
                        <h3 className="line-clamp-2 text-sm font-medium text-[#F5F2EA]">{m.name}</h3>
                        <p className="text-xs text-[#A8A8A8]">
                          {[m.country, m.year].filter(Boolean).join(" · ") || "—"}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <div className="mt-14">
                <Pagination page={page} pageSize={20} total={total} onPageChange={setPage} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0D0D0D] museum-shimmer" />}>
      <MuseumMedalsArchivePage />
    </Suspense>
  );
}
