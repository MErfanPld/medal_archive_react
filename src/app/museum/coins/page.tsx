"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { getCoins } from "@/lib/data/coins";
import { getCategories } from "@/lib/data/categories";
import { ObjectCard } from "@/components/museum/object-card";
import { Pagination } from "@/components/ui/pagination";
import { coinItemTypeLabel } from "@/lib/coin-labels";
import { formatNumber } from "@/lib/utils";

function imgOf(c: { primary_image?: string | null; primary_image_url?: string | null }) {
  return c.primary_image_url || c.primary_image || null;
}

export default function MuseumCoinsArchivePage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState<number | undefined>();
  const [ordering, setOrdering] = useState("-created_at");

  const { data: categoriesData } = useQuery({
    queryKey: ["museum-cats"],
    queryFn: () => getCategories({ is_active: true, pageSize: 50 }),
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["museum-coins", page, search, category, ordering],
    queryFn: () =>
      getCoins({
        page,
        search: search || undefined,
        category,
        is_active: true,
        ordering,
      }),
    retry: 1,
  });

  const coins = data?.results ?? [];
  const total = data?.count ?? 0;

  return (
    <div>
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="museum-label text-primary">Currency Catalog</p>
          <h1 className="museum-serif mt-3 text-4xl font-semibold text-primary-deep sm:text-5xl">
            آرشیو سکه و پول
          </h1>
          <p className="mt-3 text-sm text-text-muted">{formatNumber(total)} قلم ثبت‌شده</p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-3 rounded-sm border border-border bg-surface p-3 sm:flex-row sm:items-center">
          <form
            className="flex min-w-0 flex-1 gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(searchInput);
              setPage(1);
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-subtle" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="جستجو…"
                className="h-11 w-full rounded-sm border border-border bg-background pr-10 pl-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <button type="submit" className="h-11 shrink-0 rounded-sm bg-primary px-5 text-sm font-medium text-white hover:bg-primary-deep">
              جستجو
            </button>
          </form>
          <select
            className="h-11 rounded-sm border border-border bg-background px-3 text-sm"
            value={category ?? ""}
            onChange={(e) => {
              setCategory(e.target.value ? Number(e.target.value) : undefined);
              setPage(1);
            }}
          >
            <option value="">همه دسته‌ها</option>
            {categoriesData?.results?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            className="h-11 rounded-sm border border-border bg-background px-3 text-sm"
            value={ordering}
            onChange={(e) => {
              setOrdering(e.target.value);
              setPage(1);
            }}
          >
            <option value="-created_at">جدیدترین</option>
            <option value="created_at">قدیمی‌ترین</option>
            <option value="-year">سال (نزولی)</option>
            <option value="name">الفبایی</option>
          </select>
        </div>

        {isError ? (
          <div className="mt-12 rounded-sm border border-danger/30 bg-danger-bg/40 px-4 py-10 text-center">
            <p className="font-medium text-danger">خطا در دریافت آرشیو</p>
            <p className="mt-1 text-xs text-text-muted">{(error as Error)?.message}</p>
            <button type="button" onClick={() => refetch()} className="mt-4 rounded-sm bg-primary px-4 py-2 text-sm text-white">تلاش مجدد</button>
          </div>
        ) : isLoading ? (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-sm bg-surface-muted" />
            ))}
          </div>
        ) : coins.length === 0 ? (
          <p className="mt-16 text-center text-sm text-text-muted">نتیجه‌ای یافت نشد.</p>
        ) : (
          <>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
              {coins.map((c, i) => (
                <ObjectCard
                  key={c.id}
                  href={`/museum/coins/${c.id}`}
                  name={c.name}
                  year={c.year}
                  country={c.country}
                  category={c.material || coinItemTypeLabel(c.item_type)}
                  image={imgOf(c)}
                  kind="coin"
                  index={i}
                />
              ))}
            </div>
            <div className="mt-10">
              <Pagination page={page} pageSize={20} total={total} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
