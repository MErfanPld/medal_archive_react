"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Coins, Medal, Landmark } from "lucide-react";
import { getMedals } from "@/lib/data/medals";
import { getCoins } from "@/lib/data/coins";
import { getCategories } from "@/lib/data/categories";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { coinItemTypeLabel } from "@/lib/coin-labels";
import type { Coin, Medal as MedalType } from "@/types/api";

function mediaSrc(primary?: string | null) {
  if (!primary) return null;
  const s = String(primary);
  if (s.length <= 2 || s.startsWith("0")) return null;
  return s;
}

function ItemThumb({ name, src }: { name: string; src?: string | null }) {
  const url = mediaSrc(src);
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
      />
    );
  }
  return (
    <span className="text-4xl font-semibold text-primary/35">{name.charAt(0)}</span>
  );
}

function FeaturedCard({
  href,
  name,
  meta,
  badge,
  src,
}: {
  href: string;
  name: string;
  meta: string;
  badge?: string | null;
  src?: string | null;
}) {
  return (
    <Link href={href} className="group">
      <Card className="overflow-hidden border-border/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5">
        <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-surface-muted to-primary/[0.06]">
          <ItemThumb name={name} src={src} />
        </div>
        <CardContent className="space-y-2 p-4">
          <h3 className="line-clamp-2 font-medium text-text group-hover:text-primary">{name}</h3>
          <p className="text-sm text-text-muted">{meta}</p>
          {badge ? <Badge variant="outline">{badge}</Badge> : null}
        </CardContent>
      </Card>
    </Link>
  );
}

export default function MuseumHomePage() {
  const { data: medalsData, isLoading: medalsLoading } = useQuery({
    queryKey: ["museum", "featured-medals"],
    queryFn: () => getMedals({ page: 1, ordering: "-year" }),
  });
  const { data: coinsData, isLoading: coinsLoading } = useQuery({
    queryKey: ["museum", "featured-coins"],
    queryFn: () => getCoins({ page: 1, is_active: true, ordering: "-year" }),
  });
  const { data: categoriesData } = useQuery({
    queryKey: ["museum", "categories"],
    queryFn: () => getCategories({ is_active: true, pageSize: 10 }),
  });

  const medals = (medalsData?.results ?? []).slice(0, 6) as MedalType[];
  const coins = (coinsData?.results ?? []).slice(0, 6) as Coin[];
  const categories = categoriesData?.results ?? [];
  const medalsCount = medalsData?.count;
  const coinsCount = coinsData?.count;

  return (
    <div className="space-y-16 sm:space-y-20">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-bl from-primary/[0.08] via-surface to-surface-muted px-6 py-12 text-center sm:px-10 sm:py-16">
        <div className="pointer-events-none absolute -left-20 -top-24 size-64 rounded-full bg-primary/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-16 -right-16 size-56 rounded-full bg-primary-deep/10 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-surface/80 px-3 py-1 text-xs font-medium text-primary shadow-sm backdrop-blur">
            <Landmark className="size-3.5" />
            آرشیو دیجیتال
          </p>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-primary-deep sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
            موزه مدال و سکه
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-text-muted sm:text-lg">
            مجموعه‌ای منتخب از مدال‌ها، سکه‌ها و اسکناس‌های تاریخی — از دوران کهن تا آثار معاصر
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/museum/medals"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-white shadow-md shadow-primary/25 transition hover:bg-primary-deep"
            >
              <Medal className="size-4" />
              گالری مدال‌ها
            </Link>
            <Link
              href="/museum/coins"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-surface/90 px-6 text-sm font-medium text-text shadow-sm transition hover:border-primary/30 hover:bg-primary/5"
            >
              <Coins className="size-4" />
              گالری سکه و پول
            </Link>
          </div>
          {(medalsCount != null || coinsCount != null) && (
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-text-muted">
              {medalsCount != null && (
                <span>
                  <strong className="tabular-nums text-text">{medalsCount}</strong> مدال
                </span>
              )}
              {coinsCount != null && (
                <span>
                  <strong className="tabular-nums text-text">{coinsCount}</strong> سکه و پول
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/museum/medals"
          className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 transition hover:border-primary/30 hover:shadow-md"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
            <Medal className="size-5" />
          </span>
          <span className="min-w-0 flex-1 text-right">
            <span className="block font-semibold text-text">مجموعه مدال‌ها</span>
            <span className="mt-0.5 block text-sm text-text-muted">کاوش در آرشیو تاریخی مدال</span>
          </span>
          <ArrowLeft className="size-4 shrink-0 text-text-subtle transition group-hover:text-primary" />
        </Link>
        <Link
          href="/museum/coins"
          className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 transition hover:border-primary/30 hover:shadow-md"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
            <Coins className="size-5" />
          </span>
          <span className="min-w-0 flex-1 text-right">
            <span className="block font-semibold text-text">مجموعه سکه و پول</span>
            <span className="mt-0.5 block text-sm text-text-muted">سکه، اسکناس و اقلام پولی</span>
          </span>
          <ArrowLeft className="size-4 shrink-0 text-text-subtle transition group-hover:text-primary" />
        </Link>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between gap-3">
          <h2 className="text-xl font-semibold text-text">مدال‌های برجسته</h2>
          <Link href="/museum/medals" className="text-sm font-medium text-primary hover:underline">همه مدال‌ها</Link>
        </div>
        {medalsLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-xl" />
            ))}
          </div>
        ) : medals.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-text-muted">هنوز مدالی ثبت نشده است.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {medals.map((m) => (
              <FeaturedCard
                key={m.id}
                href={`/museum/medals/${m.id}`}
                name={m.name}
                meta={`${m.country || "—"} · ${m.year ?? "—"}`}
                badge={m.category_detail?.name}
                src={(m as { primary_image_url?: string }).primary_image_url || m.primary_image}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between gap-3">
          <h2 className="text-xl font-semibold text-text">سکه و پول برجسته</h2>
          <Link href="/museum/coins" className="text-sm font-medium text-primary hover:underline">همه اقلام</Link>
        </div>
        {coinsLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-xl" />
            ))}
          </div>
        ) : coins.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-text-muted">هنوز قلمی ثبت نشده است.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coins.map((c) => (
              <FeaturedCard
                key={c.id}
                href={`/museum/coins/${c.id}`}
                name={c.name}
                meta={`${c.country || "—"} · ${c.year ?? "—"}`}
                badge={c.material || coinItemTypeLabel(c.item_type)}
                src={c.primary_image_url || c.primary_image}
              />
            ))}
          </div>
        )}
      </section>

      {categories.length > 0 && (
        <section>
          <h2 className="mb-6 text-xl font-semibold text-text">مجموعه‌ها</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/museum/medals?category=${c.id}`}
                className="rounded-2xl border border-border bg-surface px-5 py-4 transition-all hover:border-primary/30 hover:bg-primary/[0.04] hover:shadow-sm"
              >
                <h3 className="font-medium text-text">{c.name}</h3>
                {c.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-text-muted">{c.description}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
