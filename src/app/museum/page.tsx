"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Coins, Medal, Sparkles } from "lucide-react";
import { getMedals } from "@/lib/data/medals";
import { getCoins } from "@/lib/data/coins";
import { getCategories } from "@/lib/data/categories";
import { Skeleton } from "@/components/ui/skeleton";
import { coinItemTypeLabel } from "@/lib/coin-labels";
import { HeroSlider, type HeroSlide } from "@/components/museum/hero-slider";
import { GalleryCard } from "@/components/museum/gallery-card";
import type { Coin, Medal as MedalType } from "@/types/api";

function imgOf(item: { primary_image?: string | null; primary_image_url?: string | null }) {
  return item.primary_image_url || item.primary_image || null;
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

  const slides: HeroSlide[] = [
    ...medals.slice(0, 4).map((m) => ({
      id: `m-${m.id}`,
      title: m.name,
      subtitle: [m.country, m.year, m.historical_period].filter(Boolean).join(" · "),
      meta: "مدال منتخب",
      href: `/museum/medals/${m.id}`,
      image: imgOf(m as { primary_image?: string | null }),
      cta: "ورود به گالری مدال",
    })),
    ...coins.slice(0, 3).map((c) => ({
      id: `c-${c.id}`,
      title: c.name,
      subtitle: [c.country, c.year, coinItemTypeLabel(c.item_type)].filter(Boolean).join(" · "),
      meta: "سکه و پول منتخب",
      href: `/museum/coins/${c.id}`,
      image: imgOf(c),
      cta: "ورود به گالری سکه",
    })),
  ];

  const heroSlides: HeroSlide[] =
    slides.length > 0
      ? slides
      : [
          {
            id: "welcome",
            title: "موزه دیجیتال مدال و سکه",
            subtitle:
              "مجموعه‌ای منتخب از آثار تاریخی را در فضایی حرفه‌ای و بصری کاوش کنید.",
            meta: "آرشیو دیجیتال",
            href: "/museum/medals",
            cta: "شروع کاوش",
          },
        ];

  return (
    <div className="space-y-16 sm:space-y-20">
      <HeroSlider slides={heroSlides} />

      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/museum/medals"
          className="museum-card group relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-bl from-primary/[0.12] via-surface to-surface p-6 sm:p-8"
        >
          <div className="absolute -left-8 -top-8 size-32 rounded-full bg-primary/15 blur-2xl transition group-hover:bg-primary/25" />
          <div className="relative flex items-start gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-deep text-white shadow-lg shadow-primary/30">
              <Medal className="size-6" />
            </span>
            <div className="min-w-0 flex-1 text-right">
              <p className="text-xs font-medium text-primary">مجموعه آثار</p>
              <h2 className="mt-1 text-xl font-semibold text-primary-deep">گالری مدال‌ها</h2>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                کاوش در مدال‌های تاریخی، نظامی و یادبود با فیلتر و جستجو
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                ورود به گالری
                <ArrowLeft className="size-4 transition group-hover:-translate-x-1" />
              </span>
            </div>
          </div>
        </Link>

        <Link
          href="/museum/coins"
          className="museum-card group relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-bl from-amber-500/10 via-surface to-surface p-6 sm:p-8"
        >
          <div className="absolute -left-8 -top-8 size-32 rounded-full bg-amber-500/15 blur-2xl transition group-hover:bg-amber-500/25" />
          <div className="relative flex items-start gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-lg shadow-amber-700/25">
              <Coins className="size-6" />
            </span>
            <div className="min-w-0 flex-1 text-right">
              <p className="text-xs font-medium text-amber-800">مجموعه پولی</p>
              <h2 className="mt-1 text-xl font-semibold text-primary-deep">گالری سکه و پول</h2>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                سکه، اسکناس و اقلام پولی تاریخی در یک گالری بصری
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-amber-800">
                ورود به گالری
                <ArrowLeft className="size-4 transition group-hover:-translate-x-1" />
              </span>
            </div>
          </div>
        </Link>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "مدال‌ها", value: medalsData?.count ?? "—", icon: Medal },
          { label: "سکه و پول", value: coinsData?.count ?? "—", icon: Coins },
          { label: "مجموعه‌ها", value: categories.length || "—", icon: Sparkles },
          { label: "آثار منتخب", value: medals.length + coins.length || "—", icon: Sparkles },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border/70 bg-surface/80 px-4 py-5 text-center shadow-sm backdrop-blur"
          >
            <s.icon className="mx-auto size-5 text-primary/70" />
            <p className="mt-2 text-2xl font-semibold tabular-nums text-primary-deep">{s.value}</p>
            <p className="mt-0.5 text-xs text-text-muted">{s.label}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-primary">منتخب</p>
            <h2 className="mt-1 text-2xl font-semibold text-primary-deep">مدال‌های برجسته</h2>
          </div>
          <Link href="/museum/medals" className="text-sm font-medium text-primary hover:underline">
            همه مدال‌ها
          </Link>
        </div>
        {medalsLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
            ))}
          </div>
        ) : medals.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-text-muted">
            هنوز مدالی ثبت نشده است.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {medals.map((m, i) => (
              <GalleryCard
                key={m.id}
                href={`/museum/medals/${m.id}`}
                name={m.name}
                meta={`${m.country || "—"} · ${m.year ?? "—"}`}
                badge={m.category_detail?.name}
                image={imgOf(m as { primary_image?: string | null })}
                index={i}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-amber-800">منتخب</p>
            <h2 className="mt-1 text-2xl font-semibold text-primary-deep">سکه و پول برجسته</h2>
          </div>
          <Link href="/museum/coins" className="text-sm font-medium text-primary hover:underline">
            همه اقلام
          </Link>
        </div>
        {coinsLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
            ))}
          </div>
        ) : coins.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-text-muted">
            هنوز قلمی ثبت نشده است.
          </p>
        ) : (
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
              />
            ))}
          </div>
        )}
      </section>

      {categories.length > 0 && (
        <section>
          <h2 className="mb-6 text-2xl font-semibold text-primary-deep">مجموعه‌ها</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c, i) => (
              <Link
                key={c.id}
                href={`/museum/medals?category=${c.id}`}
                className="museum-card rounded-2xl border border-border/70 bg-surface px-5 py-5 animate-fade-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <h3 className="font-semibold text-text">{c.name}</h3>
                {c.description && (
                  <p className="mt-1.5 line-clamp-2 text-sm text-text-muted">{c.description}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
