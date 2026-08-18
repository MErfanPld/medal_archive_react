"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Medal } from "lucide-react";
import { getMedals } from "@/lib/data/medals";
import { getCategories } from "@/lib/data/categories";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { HeroSlider, type HeroSlide } from "@/components/museum/hero-slider";
import { GalleryCard } from "@/components/museum/gallery-card";

function imgOf(m: { primary_image?: string | null; primary_image_url?: string | null }) {
  return m.primary_image_url || m.primary_image || null;
}

export default function MuseumMedalsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState<number | undefined>();

  const { data: categoriesData } = useQuery({
    queryKey: ["museum-cats"],
    queryFn: () => getCategories({ is_active: true, pageSize: 50 }),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["museum-medals", page, search, category],
    queryFn: () =>
      getMedals({
        page,
        search: search || undefined,
        category,
        ordering: "-year",
      }),
  });

  const medals = data?.results ?? [];
  const total = data?.count ?? 0;

  const slides: HeroSlide[] = useMemo(
    () =>
      medals.slice(0, 5).map((m) => ({
        id: m.id,
        title: m.name,
        subtitle: [m.country, m.year, m.material].filter(Boolean).join(" · "),
        meta: m.category_detail?.name || "مدال",
        href: `/museum/medals/${m.id}`,
        image: imgOf(m as { primary_image?: string | null }),
        cta: "مشاهده جزئیات",
      })),
    [medals]
  );

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-l from-primary/[0.14] via-surface to-surface px-6 py-8 sm:px-10">
        <div className="pointer-events-none absolute -left-10 top-0 size-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
              <Medal className="size-3.5" />
              گالری
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-primary-deep sm:text-4xl">
              مجموعه مدال‌ها
            </h1>
            <p className="mt-2 max-w-lg text-sm text-text-muted sm:text-base">
              کاوش بصری در آرشیو مدال‌های تاریخی — جستجو، فیلتر و مشاهده جزئیات
            </p>
          </div>
          {total > 0 && (
            <div className="rounded-2xl border border-primary/15 bg-surface/80 px-4 py-3 text-center shadow-sm backdrop-blur">
              <p className="text-2xl font-semibold tabular-nums text-primary-deep">
                {total}
              </p>
              <p className="text-[11px] text-text-muted">اثر در مجموعه</p>
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
              placeholder="جستجو در نام، کشور، کاتالوگ…"
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

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
          ))}
        </div>
      ) : medals.length === 0 ? (
        <EmptyState
          title="نتیجه‌ای یافت نشد"
          description="فیلترها را تغییر دهید یا عبارت دیگری جستجو کنید."
        />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {medals.map((m, i) => (
              <GalleryCard
                key={m.id}
                href={`/museum/medals/${m.id}`}
                name={m.name}
                meta={`${m.country || "—"} · ${m.year ?? "—"}`}
                badge={m.material || m.category_detail?.name}
                image={imgOf(m as { primary_image?: string | null })}
                index={i}
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
