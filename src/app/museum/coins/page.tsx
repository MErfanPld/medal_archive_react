"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Coins } from "lucide-react";
import { getCoins } from "@/lib/data/coins";
import { getCategories } from "@/lib/data/categories";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { coinItemTypeLabel } from "@/lib/coin-labels";
import { HeroSlider, type HeroSlide } from "@/components/museum/hero-slider";
import { GalleryCard } from "@/components/museum/gallery-card";

function imgOf(c: { primary_image?: string | null; primary_image_url?: string | null }) {
  return c.primary_image_url || c.primary_image || null;
}

export default function MuseumCoinsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState<number | undefined>();

  const { data: categoriesData } = useQuery({
    queryKey: ["museum-cats"],
    queryFn: () => getCategories({ is_active: true, pageSize: 50 }),
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["museum-coins", page, search, category],
    queryFn: () =>
      getCoins({
        page,
        search: search || undefined,
        category,
        is_active: true,
        ordering: "-year",
      }),
    retry: 1,
  });

  const coins = data?.results ?? [];
  const total = data?.count ?? 0;

  const slides: HeroSlide[] = useMemo(
    () =>
      coins.slice(0, 5).map((c) => ({
        id: c.id,
        title: c.name,
        subtitle: [c.country, c.year, coinItemTypeLabel(c.item_type)]
          .filter(Boolean)
          .join(" · "),
        meta: c.denomination || "سکه و پول",
        href: `/museum/coins/${c.id}`,
        image: imgOf(c),
        cta: "مشاهده جزئیات",
      })),
    [coins]
  );

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-l from-amber-500/15 via-surface to-surface px-6 py-8 sm:px-10">
        <div className="pointer-events-none absolute -left-10 top-0 size-40 rounded-full bg-amber-500/25 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-800">
              <Coins className="size-3.5" />
              گالری
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-primary-deep sm:text-4xl">
              مجموعه سکه و پول
            </h1>
            <p className="mt-2 max-w-lg text-sm text-text-muted sm:text-base">
              سکه، اسکناس و اقلام پولی تاریخی در یک گالری بصری و تعاملی
            </p>
          </div>
          {total > 0 && (
            <div className="rounded-2xl border border-amber-600/20 bg-surface/80 px-4 py-3 text-center shadow-sm backdrop-blur">
              <p className="text-2xl font-semibold tabular-nums text-primary-deep">
                {total}
              </p>
              <p className="text-[11px] text-text-muted">قلم در مجموعه</p>
            </div>
          )}
        </div>
      </div>

      {!isLoading && slides.length > 0 && (
        <HeroSlider slides={slides} heightClass="h-[min(52vh,24rem)]" />
      )}

      <div className="flex flex-wrap gap-3 rounded-2xl border border-border/70 bg-surface/70 p-3 shadow-sm backdrop-blur">
        <form
          className="flex min-w-[200px] flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchInput);
            setPage(1);
          }}
        >
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-subtle" />
            <Input
              placeholder="جستجو…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="border-border/80 bg-surface pr-9"
            />
          </div>
          <Button type="submit" className="shrink-0">
            جستجو
          </Button>
        </form>
        <select
          className="h-10 rounded-xl border border-border/80 bg-surface px-3 text-sm"
          value={category ?? ""}
          onChange={(e) => {
            setCategory(e.target.value ? Number(e.target.value) : undefined);
            setPage(1);
          }}
        >
          <option value="">همه دسته‌ها</option>
          {categoriesData?.results?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {isError ? (
        <div className="rounded-2xl border border-danger/30 bg-danger-bg/40 px-4 py-8 text-center">
          <p className="text-sm font-medium text-danger">خطا در دریافت سکه و پول از سرور</p>
          <p className="mt-1 text-xs text-text-muted">
            {(error as Error)?.message || "لطفاً اتصال و لاگین را بررسی کنید."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-white"
          >
            تلاش مجدد
          </button>
        </div>
      ) : isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
          ))}
        </div>
      ) : coins.length === 0 ? (
        <EmptyState
          title="نتیجه‌ای یافت نشد"
          description="فیلترها را تغییر دهید."
        />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {coins.map((c, i) => (
              <GalleryCard
                key={c.id}
                href={`/museum/coins/${c.id}`}
                name={c.name}
                meta={`${c.country || "—"} · ${c.year ?? "—"}`}
                badge={c.material || coinItemTypeLabel(c.item_type)}
                image={imgOf(c)}
                index={i}
                kind="coin"
              />
            ))}
          </div>
          <Pagination
            page={page}
            pageSize={20}
            total={total}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
