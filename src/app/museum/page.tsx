"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Coins, Medal } from "lucide-react";
import { getMedals } from "@/lib/data/medals";
import { getCoins } from "@/lib/data/coins";
import { getCategories } from "@/lib/data/categories";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { coinItemTypeLabel } from "@/lib/coin-labels";
import type { Coin } from "@/types/api";

function CoinThumb({ coin }: { coin: Coin }) {
  const src = coin.primary_image_url || coin.primary_image;
  if (src && typeof src === "string" && src.length > 2 && !src.startsWith("0")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" className="h-full w-full object-cover" />
    );
  }
  return (
    <span className="text-4xl font-semibold text-primary/40">{coin.name.charAt(0)}</span>
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

  const medals = (medalsData?.results ?? []).slice(0, 6);
  const coins = (coinsData?.results ?? []).slice(0, 6);
  const categories = categoriesData?.results ?? [];

  return (
    <div className="space-y-16">
      <section className="text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">آرشیو دیجیتال</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-primary-deep sm:text-4xl lg:text-5xl">
          موزه مدال و سکه
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-text-muted sm:text-lg">
          مجموعه‌ای منتخب از مدال‌ها، سکه‌ها و اسکناس‌های تاریخی — از دوران کهن تا آثار معاصر
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/museum/medals"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-white hover:bg-primary-deep"
          >
            <Medal className="size-4" />
            گالری مدال‌ها
          </Link>
          <Link
            href="/museum/coins"
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-surface px-6 text-sm font-medium text-text hover:border-primary/30 hover:bg-primary/5"
          >
            <Coins className="size-4" />
            گالری سکه و پول
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-xl font-semibold text-text">مدال‌های برجسته</h2>
          <Link href="/museum/medals" className="text-sm text-primary hover:underline">همه مدال‌ها</Link>
        </div>
        {medalsLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-xl" />
            ))}
          </div>
        ) : medals.length === 0 ? (
          <p className="text-sm text-text-muted">هنوز مدالی ثبت نشده است.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {medals.map((m) => (
              <Link key={m.id} href={`/museum/medals/${m.id}`} className="group">
                <Card className="overflow-hidden transition-shadow hover:shadow-md">
                  <div className="flex aspect-[4/3] items-center justify-center bg-surface-muted">
                    {m.primary_image && String(m.primary_image).length > 2 && !String(m.primary_image).startsWith("0") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={String(m.primary_image)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-4xl font-semibold text-primary/40">{m.name.charAt(0)}</span>
                    )}
                  </div>
                  <CardContent className="space-y-2 p-4">
                    <h3 className="line-clamp-2 font-medium text-text group-hover:text-primary">{m.name}</h3>
                    <p className="text-sm text-text-muted">{m.country} · {m.year ?? "—"}</p>
                    {m.category_detail && <Badge variant="outline">{m.category_detail.name}</Badge>}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-xl font-semibold text-text">سکه و پول برجسته</h2>
          <Link href="/museum/coins" className="text-sm text-primary hover:underline">همه اقلام</Link>
        </div>
        {coinsLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-xl" />
            ))}
          </div>
        ) : coins.length === 0 ? (
          <p className="text-sm text-text-muted">هنوز قلمی ثبت نشده است.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coins.map((c) => (
              <Link key={c.id} href={`/museum/coins/${c.id}`} className="group">
                <Card className="overflow-hidden transition-shadow hover:shadow-md">
                  <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-surface-muted">
                    <CoinThumb coin={c} />
                  </div>
                  <CardContent className="space-y-2 p-4">
                    <h3 className="line-clamp-2 font-medium text-text group-hover:text-primary">{c.name}</h3>
                    <p className="text-sm text-text-muted">{[c.country, c.year].filter(Boolean).join(" · ") || "—"}</p>
                    <Badge variant="outline">{coinItemTypeLabel(c.item_type)}</Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-6 text-xl font-semibold text-text">مجموعه‌ها</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/museum/medals?category=${c.id}`}
              className="rounded-xl border border-border bg-surface px-5 py-4 transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <h3 className="font-medium text-text">{c.name}</h3>
              {c.description && (
                <p className="mt-1 line-clamp-2 text-sm text-text-muted">{c.description}</p>
              )}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
