"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ImageOff, Search } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { getKnives } from "@/lib/data/knives";
import { Pagination } from "@/components/ui/pagination";
import { formatNumber, resolveMediaUrl } from "@/lib/utils";

function imgOf(m: { primary_image?: string | null; primary_image_url?: string | null }) {
  return resolveMediaUrl(m.primary_image_url || m.primary_image || null);
}
function MuseumKnifeArchivePage() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(initialQ);
  const [searchInput, setSearchInput] = useState(initialQ);
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["museum-knives", page, search], enabled: isHydrated,
    queryFn: () => getKnives({ page, search: search || undefined, ordering: "-created_at" }), retry: 1,
  });
  const items = data?.results ?? [];
  const total = data?.count ?? 0;
  const meta = useMemo(() => `${formatNumber(total)} اثر`, [total]);
  const heroSrc = items.map(imgOf).find(Boolean) || "/brand/study-banner.jpg";
  return (
    <div className="mu-stage min-h-screen">
      <header className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 scale-105 bg-cover bg-center" style={{ backgroundImage: `url(${heroSrc})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/70 to-[#0d0d0d]" />
        <div className="mu-container relative z-10 pb-12 pt-10 sm:pb-16 sm:pt-14">
          <nav className="mu-anim-rise text-sm text-white/45"><Link href="/museum" className="hover:text-white">خانه</Link><span className="mx-2">/</span><span className="text-[#C8A75D]">چاقوها</span></nav>
          <h1 className="museum-serif mu-anim-rise mt-8 text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">آرشیو چاقوها</h1>
          <p className="mu-anim-rise mt-4 max-w-lg text-sm leading-8 text-white/55">مجموعه چاقوهای تاریخی — با جستجو در نام، کشور یا سال کاوش کنید.</p>
          <p className="mu-anim-rise mt-6 text-sm text-[#C8A75D]">{meta}</p>
        </div>
      </header>
      <div className="mu-container">
        <form className="mu-filter-search mu-anim-rise my-8" onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }}>
          <Search className="size-4 shrink-0 text-[#C8A75D]" /><input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="جستجو نام، کشور، سال یا شماره کاتالوگ…" /><button type="submit">جستجو</button>
        </form>
        <div className="pb-16">
          {isError ? (<div className="py-20 text-center text-white/70"><p>{(error as Error)?.message}</p><button type="button" onClick={() => refetch()} className="mt-4 text-[#C8A75D]">تلاش مجدد</button></div>)
          : isLoading ? (<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => (<div key={i} className="museum-shimmer aspect-[4/5] rounded-sm" />))}</div>)
          : items.length === 0 ? (<p className="py-24 text-center text-sm text-white/50">نتیجه‌ای یافت نشد.</p>)
          : (<><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">{items.map((m) => { const src = imgOf(m); return (
            <Link key={m.id} href={`/museum/knives/${m.id}`} className="mu-item-card group"><div className="relative aspect-[4/5] overflow-hidden bg-[#0d0d0d]">
              {src ? (/* eslint-disable-next-line @next/next/no-img-element */<img src={src} alt={m.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />) : (<div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#C8A75D]/50"><ImageOff className="size-8" strokeWidth={1.25} /><span className="text-[0.65rem]">بدون تصویر</span></div>)}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-90" /><div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-[0.65rem] text-[#C8A75D]">{(m as { catalog_number?: string }).catalog_number ? `شماره ${(m as { catalog_number?: string }).catalog_number}` : "چاقو"}</p>
                <h3 className="mt-1 line-clamp-2 text-sm font-medium text-white">{m.name}</h3>
                <p className="mt-1 text-xs text-white/50">{[m.country, m.year].filter(Boolean).join(" · ") || "—"}</p>
              </div></div></Link>); })}</div>
            <div className="mt-14"><Pagination page={page} pageSize={20} total={total} onPageChange={setPage} /></div></>)}
        </div>
      </div>
    </div>
  );
}
export default function Page() {
  return (<Suspense fallback={<div className="min-h-screen bg-[#0D0D0D] museum-shimmer" />}><MuseumKnifeArchivePage /></Suspense>);
}
