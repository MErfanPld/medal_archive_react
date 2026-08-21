"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { Search } from "lucide-react";
import { getMedals } from "@/lib/data/medals";
import { getCategories } from "@/lib/data/categories";
import { ObjectCard } from "@/components/museum/object-card";
import { Pagination } from "@/components/ui/pagination";
import { formatNumber } from "@/lib/utils";

function imgOf(m: { primary_image?: string | null; primary_image_url?: string | null }) {
  return m.primary_image_url || m.primary_image || null;
}

function MuseumMedalsArchivePage() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const initialCat = searchParams.get("category");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(initialQ);
  const [searchInput, setSearchInput] = useState(initialQ);
  const [category, setCategory] = useState<number | undefined>(initialCat ? Number(initialCat) : undefined);
  const [ordering, setOrdering] = useState("-created_at");

  const { data: categoriesData } = useQuery({
    queryKey: ["museum-cats"],
    enabled: isHydrated,
    queryFn: () => getCategories({ is_active: true, pageSize: 50 }),
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["museum-medals", page, search, category, ordering],
    enabled: isHydrated,
    queryFn: () => getMedals({ page, search: search || undefined, category, ordering }),
    retry: 1,
  });

  const medals = data?.results ?? [];
  const total = data?.count ?? 0;
  const headerMeta = useMemo(() => `${formatNumber(total)} مدال ثبت‌شده`, [total]);

  return (
    <div>
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
          <nav className="text-xs text-text-subtle">
            <Link href="/museum" className="hover:text-text">خانه</Link>
            <span className="mx-2 opacity-40">/</span>
            <span className="text-text-muted">آرشیو مدال‌ها</span>
          </nav>
          <p className="museum-label mt-6 text-primary">Medal Catalog</p>
          <h1 className="museum-serif mt-3 text-4xl font-semibold text-primary-deep sm:text-5xl">آرشیو مدال‌ها</h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-text-muted">کاتالوگ موزه‌ای مدال‌ها — جستجو، فیلتر و کشف آثار.</p>
          <p className="mt-4 text-sm font-medium text-text">{headerMeta}</p>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-3 border border-border bg-surface p-3 sm:flex-row sm:items-center">
          <form className="flex min-w-0 flex-1 gap-2" onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }}>
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-subtle" />
              <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="جستجو…" className="h-11 w-full border border-border bg-background pr-10 pl-3 text-sm outline-none focus:border-primary" />
            </div>
            <button type="submit" className="h-11 shrink-0 bg-primary px-5 text-sm font-medium text-white hover:bg-primary-deep">جستجو</button>
          </form>
          <select className="h-11 border border-border bg-background px-3 text-sm" value={category ?? ""} onChange={(e) => { setCategory(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}>
            <option value="">همه دسته‌ها</option>
            {categoriesData?.results?.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
          <select className="h-11 border border-border bg-background px-3 text-sm" value={ordering} onChange={(e) => { setOrdering(e.target.value); setPage(1); }}>
            <option value="-created_at">جدیدترین</option>
            <option value="created_at">قدیمی‌ترین</option>
            <option value="-year">سال (نزولی)</option>
            <option value="year">سال (صعودی)</option>
            <option value="name">الفبایی</option>
          </select>
        </div>
        {isError ? (
          <div className="mt-12 border border-danger/30 bg-danger-bg/40 px-4 py-12 text-center">
            <p className="font-medium text-danger">خطا در دریافت آرشیو</p>
            <p className="mt-1 text-xs text-text-muted">{(error as Error)?.message}</p>
            <button type="button" onClick={() => refetch()} className="mt-4 bg-primary px-4 py-2 text-sm text-white">تلاش مجدد</button>
          </div>
        ) : isLoading ? (
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => (<div key={i} className="museum-shimmer aspect-[3/4] rounded-md" />))}</div>
        ) : medals.length === 0 ? (
          <div className="mt-16 border border-dashed border-border px-6 py-16 text-center">
            <p className="text-sm text-text-muted">اثری با این مشخصات پیدا نشد.</p>
            <Link href="/museum/medals" className="mt-4 inline-block text-sm text-primary">بازگشت به آرشیو</Link>
          </div>
        ) : (
          <>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
              {medals.map((m, i) => (
                <ObjectCard key={m.id} href={`/museum/medals/${m.id}`} name={m.name} year={m.year} country={m.country} category={m.material || m.category_detail?.name} archiveNo={m.catalog_number ? `MEDAL / ${m.catalog_number}` : null} image={imgOf(m)} kind="medal" index={i} />
              ))}
            </div>
            <div className="mt-10"><Pagination page={page} pageSize={20} total={total} onPageChange={setPage} /></div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] museum-shimmer" />}>
      <MuseumMedalsArchivePage />
    </Suspense>
  );
}
