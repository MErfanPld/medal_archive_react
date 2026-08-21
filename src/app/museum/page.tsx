"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { ArrowLeft, Search } from "lucide-react";
import { getMedals } from "@/lib/data/medals";
import { getCoins } from "@/lib/data/coins";
import { getCategories } from "@/lib/data/categories";
import { ObjectCard } from "@/components/museum/object-card";
import { ItemPlaceholder } from "@/components/museum/item-placeholder";
import { resolveMediaUrl, formatNumber } from "@/lib/utils";
import type { Coin, Medal as MedalType } from "@/types/api";

function imgOf(item: {
  primary_image?: string | null;
  primary_image_url?: string | null;
}) {
  return item.primary_image_url || item.primary_image || null;
}

export default function MuseumHomePage() {
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const {
    data: medalsData,
    isLoading: medalsLoading,
    isError: medalsError,
    error: medalsErr,
    refetch: refetchMedals,
  } = useQuery({
    queryKey: ["museum", "featured-medals"],
    enabled: isHydrated,
    queryFn: () => getMedals({ page: 1, ordering: "-year" }),
    retry: 1,
  });
  const { data: coinsData, isError: coinsError, refetch: refetchCoins } = useQuery({
    queryKey: ["museum", "featured-coins"],
    enabled: isHydrated,
    queryFn: () => getCoins({ page: 1, is_active: true, ordering: "-year" }),
    retry: 1,
  });
  const { data: categoriesData } = useQuery({
    queryKey: ["museum", "categories"],
    enabled: isHydrated,
    queryFn: () => getCategories({ is_active: true, pageSize: 12 }),
  });

  const medals = (medalsData?.results ?? []).slice(0, 7) as MedalType[];
  const coins = (coinsData?.results ?? []).slice(0, 4) as Coin[];
  const categories = categoriesData?.results ?? [];
  const heroMedal = medals[0];
  const heroImg = heroMedal ? resolveMediaUrl(imgOf(heroMedal)) : null;
  const medalCount = medalsData?.count ?? 0;
  const coinCount = coinsData?.count ?? 0;

  return (
    <div>
      {(medalsError || coinsError) && (
        <div className="border-b border-danger/20 bg-danger-bg/50">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-sm font-medium text-danger">اتصال به آرشیو برقرار نشد</p>
              <p className="mt-1 text-xs text-text-muted">
                {(medalsErr as Error)?.message || "احتمالاً باید وارد شوید یا Backend روشن باشد."}{" "}
                APIهای مدال/سکه معمولاً نیاز به لاگین دارند.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/login" className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white">ورود</Link>
              <button type="button" onClick={() => { void refetchMedals(); void refetchCoins(); }} className="rounded-full border border-border bg-surface px-4 py-2 text-sm">تلاش مجدد</button>
            </div>
          </div>
        </div>
      )}

      <section className="relative overflow-hidden border-b border-border">
        <div className="museum-hero-glow pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-12 lg:pb-24 lg:pt-20">
          <div className="museum-reveal lg:col-span-6">
            <p className="museum-label text-primary">Digital Museum</p>
            <h1 className="museum-serif mt-4 text-4xl font-semibold leading-[1.15] tracking-tight text-primary-deep sm:text-5xl lg:text-[3.25rem]">
              میراثی که زمان را<br />پشت سر گذاشته است
            </h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-text-muted sm:text-lg">
              کشف مجموعه‌ای از مدال‌ها، سکه‌ها و آثار تاریخی در یک موزه دیجیتال.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/museum/medals" className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-white shadow-lg shadow-primary/25 transition hover:bg-primary-deep">
                کاوش مجموعه <ArrowLeft className="size-4" />
              </Link>
              <Link href="/museum/medals" className="inline-flex h-12 items-center rounded-full border border-border bg-surface/80 px-6 text-sm font-medium text-text transition hover:border-primary/30 hover:bg-surface">
                مشاهده آثار ویژه
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap gap-8 border-t border-border/80 pt-8">
              <div>
                <p className="text-2xl font-semibold tabular-nums text-primary-deep">{formatNumber(medalCount)}</p>
                <p className="mt-1 text-xs text-text-subtle">مدال در آرشیو</p>
              </div>
              <div>
                <p className="text-2xl font-semibold tabular-nums text-primary-deep">{formatNumber(coinCount)}</p>
                <p className="mt-1 text-xs text-text-subtle">سکه و پول</p>
              </div>
              <div>
                <p className="text-2xl font-semibold tabular-nums text-primary-deep">{formatNumber(categories.length)}</p>
                <p className="mt-1 text-xs text-text-subtle">دسته‌بندی</p>
              </div>
            </div>
          </div>
          <div className="museum-reveal relative lg:col-span-6" style={{ animationDelay: "120ms" }}>
            <div className="museum-frame relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-sm lg:max-w-none">
              {heroImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={heroImg} alt={heroMedal?.name ?? "اثر ویژه"} className="h-full w-full object-cover" />
              ) : (
                <ItemPlaceholder kind="medal" label={heroMedal?.name?.charAt(0)} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1614]/70 via-transparent to-transparent" />
              {heroMedal ? (
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="museum-label text-white/50">اثر ویژه</p>
                  <p className="mt-2 text-xl font-semibold text-white">{heroMedal.name}</p>
                  <p className="mt-1 text-sm text-white/70">{[heroMedal.country, heroMedal.year].filter(Boolean).join(" · ")}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col items-stretch gap-4 px-4 py-8 sm:flex-row sm:items-center sm:px-6">
          <div className="flex flex-1 items-center gap-3 rounded-full border border-border bg-background px-5 py-3.5">
            <Search className="size-4 shrink-0 text-text-subtle" />
            <Link href="/museum/medals" className="flex-1 text-sm text-text-muted">جستجو در آرشیو… نام، کشور، سال یا دوره تاریخی</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="museum-label text-primary">Selected Pieces</p>
            <h2 className="museum-serif mt-2 text-3xl font-semibold text-primary-deep sm:text-4xl">آثار منتخب</h2>
          </div>
          <Link href="/museum/medals" className="text-sm font-medium text-primary hover:text-primary-deep">مشاهده همه →</Link>
        </div>
        {medalsLoading ? (
          <div className="mt-10 grid gap-4 lg:grid-cols-12">
            <div className="h-[28rem] animate-pulse rounded-sm bg-surface-muted lg:col-span-7" />
            <div className="grid gap-4 lg:col-span-5">
              <div className="h-52 animate-pulse rounded-sm bg-surface-muted" />
              <div className="h-52 animate-pulse rounded-sm bg-surface-muted" />
            </div>
          </div>
        ) : medals.length === 0 ? (
          <p className="mt-10 text-center text-sm text-text-muted">هنوز اثری برای نمایش در آرشیو ثبت نشده است.</p>
        ) : (
          <div className="mt-10 grid gap-5 lg:grid-cols-12 lg:gap-6">
            {medals[0] ? (
              <ObjectCard className="lg:col-span-7" size="lg" href={`/museum/medals/${medals[0].id}`} name={medals[0].name} year={medals[0].year} country={medals[0].country} category={medals[0].category_detail?.name} archiveNo={medals[0].catalog_number} image={imgOf(medals[0])} kind="medal" index={0} />
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
              {medals.slice(1, 3).map((m, i) => (
                <ObjectCard key={m.id} size="sm" href={`/museum/medals/${m.id}`} name={m.name} year={m.year} country={m.country} category={m.category_detail?.name} archiveNo={m.catalog_number} image={imgOf(m)} kind="medal" index={i + 1} />
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="border-y border-border bg-[#1a1614] py-16 text-[#f5f2ed] sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <p className="museum-label text-[#c4a574]">Explore</p>
          <h2 className="museum-serif mt-2 text-3xl font-semibold sm:text-4xl">کاوش مجموعه</h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-white/55">هر دسته‌بندی مانند یک تالار نمایش طراحی شده است.</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(categories.length
              ? categories.slice(0, 6)
              : [
                  { id: 0, name: "مدال‌های تاریخی", description: "" },
                  { id: -1, name: "مدال‌های ورزشی", description: "" },
                  { id: -2, name: "سکه و یادبود", description: "" },
                ]
            ).map((c) => (
              <Link key={c.id} href={c.id > 0 ? `/museum/medals?category=${c.id}` : "/museum/medals"} className="group relative flex min-h-[9.5rem] flex-col justify-end overflow-hidden rounded-sm border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-5 transition hover:border-[#c4a574]/40">
                <span className="museum-label text-white/35">Exhibition</span>
                <span className="mt-2 text-lg font-medium text-white transition group-hover:text-[#c4a574]">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="museum-label text-primary">Currency & Metal</p>
            <h2 className="museum-serif mt-2 text-3xl font-semibold text-primary-deep">سکه و پول</h2>
          </div>
          <Link href="/museum/coins" className="text-sm font-medium text-primary hover:text-primary-deep">گالری کامل →</Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {coins.map((c, i) => (
            <ObjectCard key={c.id} href={`/museum/coins/${c.id}`} name={c.name} year={c.year} country={c.country} category={c.material} image={imgOf(c)} kind="coin" index={i} />
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:grid-cols-2 sm:px-6 sm:py-20">
          <div>
            <p className="museum-label text-primary">About the Archive</p>
            <h2 className="museum-serif mt-3 text-3xl font-semibold leading-snug text-primary-deep">آرشیوی برای دیدن، فهمیدن و نگه داشتن تاریخ</h2>
          </div>
          <p className="text-base leading-8 text-text-muted">Medal Archive فضایی است برای نمایش حرفه‌ای مجموعه‌های مدال و سکه.</p>
        </div>
      </section>
    </div>
  );
}
