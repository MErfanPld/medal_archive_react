"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { getTasbihs } from "@/lib/data/tasbih";
import { getCategories } from "@/lib/data/categories";
import { ItemPlaceholder } from "@/components/museum/item-placeholder";
import { Pagination } from "@/components/ui/pagination";
import { formatNumber, resolveMediaUrl } from "@/lib/utils";

function imgOf(c: { primary_image?: string | null; primary_image_url?: string | null }) {
  return c.primary_image_url || c.primary_image || null;
}

export default function MuseumTasbihArchivePage() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState<number | undefined>();
  const [ordering, setOrdering] = useState("-created_at");
  const { data: categoriesData } = useQuery({ queryKey: ["museum-cats"], enabled: isHydrated, queryFn: () => getCategories({ is_active: true, pageSize: 50 }) });
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["museum-tasbih", page, search, category, ordering], enabled: isHydrated,
    queryFn: () => getTasbihs({ page, search: search || undefined, category, is_active: true, ordering }), retry: 1,
  });
  const items = data?.results ?? [];
  const total = data?.count ?? 0;
  return (
    <div>
      <header className="dm-vault"><div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
        <nav className="text-[0.65rem] tracking-[0.2em] text-white/35"><Link href="/museum" className="hover:text-white">خانه</Link><span className="mx-2">/</span><span>TASBIH ARCHIVE</span></nav>
        <h1 className="museum-serif mt-8 text-5xl font-semibold text-white sm:text-6xl lg:text-7xl">Tasbih<br />Archive</h1>
        <p className="mt-6 max-w-md text-sm leading-7 text-white/55">تالار تسبیح‌ها — دانه، جنس و سنت.</p>
        <p className="dm-label mt-8 text-[#c4a574]">{formatNumber(total)} قلم</p>
      </div></header>
      <div className="dm-stage border-b border-white/10"><div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-6 sm:flex-row sm:items-center sm:px-8 lg:px-10">
        <form className="flex min-w-0 flex-1 gap-2" onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }}>
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="جستجو…" className="h-11 w-full border-0 border-b border-white/15 bg-transparent text-sm text-white outline-none placeholder:text-white/30 focus:border-[#c4a574]" />
          <button type="submit" className="h-11 text-sm text-[#c4a574]">جستجو</button>
        </form>
        <select className="h-11 border-0 border-b border-white/15 bg-transparent text-sm text-white" value={category ?? ""} onChange={(e) => { setCategory(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}>
          <option value="">دسته</option>{categoriesData?.results?.map((c) => (<option key={c.id} value={c.id} className="text-text">{c.name}</option>))}
        </select>
        <select className="h-11 border-0 border-b border-white/15 bg-transparent text-sm text-white" value={ordering} onChange={(e) => { setOrdering(e.target.value); setPage(1); }}>
          <option value="-created_at" className="text-text">جدیدترین</option><option value="created_at" className="text-text">قدیمی‌ترین</option><option value="-year" className="text-text">سال</option><option value="name" className="text-text">الفبا</option>
        </select>
      </div></div>
      <div className="dm-vault"><div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
        {isError ? (<div className="py-20 text-center text-white/70"><p>{(error as Error)?.message}</p><button type="button" onClick={() => refetch()} className="mt-4 text-[#c4a574]">تلاش مجدد</button></div>)
        : isLoading ? (<div className="grid grid-cols-2 gap-8 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => (<div key={i} className="museum-shimmer mx-auto aspect-square max-w-[14rem] rounded-full" />))}</div>)
        : items.length === 0 ? (<p className="py-24 text-center text-sm text-white/50">نتیجه‌ای یافت نشد.</p>)
        : (<><div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:gap-x-10 lg:grid-cols-3">{items.map((c) => { const src = resolveMediaUrl(imgOf(c)); return (
          <Link key={c.id} href={`/museum/tasbih/${c.id}`} className="group text-center">
            <div className="museum-object-frame rounded-sm relative mx-auto aspect-square max-w-[13rem] overflow-hidden bg-[#1a1612] lg:max-w-[15rem]">{src ? (// eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={c.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />) : (<ItemPlaceholder kind="medal" />)}</div>
            <p className="dm-label mt-5 text-white/30">{c.catalog_number ? `TB / ${c.catalog_number}` : (c.material || c.country || "—")}</p>
            <p className="mt-2 text-sm font-medium text-white">{c.name}</p>
            <p className="mt-1 text-xs text-white/45">{[c.country, c.year, c.material].filter(Boolean).join(" · ")}</p>
          </Link>); })}</div>
          <div className="mt-14"><Pagination page={page} pageSize={20} total={total} onPageChange={setPage} /></div></>)}
      </div></div>
    </div>
  );
}
