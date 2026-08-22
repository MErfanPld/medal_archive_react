"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { getMedals } from "@/lib/data/medals";
import { getCoins } from "@/lib/data/coins";
import { getCategories } from "@/lib/data/categories";
import { ItemPlaceholder } from "@/components/museum/item-placeholder";
import {
  IconMedal,
  IconCoin,
  IconEmblem,
  IconLaurel,
  IconInsignia,
  IconAncientCoin,
} from "@/components/museum/explore-icons";
import { resolveMediaUrl, formatNumber, cn } from "@/lib/utils";
import type { Coin, Medal as MedalType } from "@/types/api";

function imgOf(item: {
  primary_image?: string | null;
  primary_image_url?: string | null;
}) {
  return item.primary_image_url || item.primary_image || null;
}

const WALL = ["mu-w1", "mu-w2", "mu-w3", "mu-w4", "mu-w5", "mu-w6"] as const;

const COUNTRIES = ["ایران", "فرانسه", "آلمان", "روسیه", "آمریکا", "بریتانیا"] as const;

const ERAS = [
  { y: "1800", label: "آغاز قرن ۱۹" },
  { y: "1850", label: "نیمهٔ قرن" },
  { y: "1900", label: "آستانۀ قرن ۲۰" },
  { y: "1950", label: "پس از جنگ" },
  { y: "2000", label: "عصر معاصر" },
] as const;

const EXPLORE = [
  {
    href: "/museum/medals",
    title: "مدال‌ها",
    desc: "نشان‌های افتخار و یادبود",
    Icon: IconMedal,
    countKey: "medals" as const,
  },
  {
    href: "/museum/coins",
    title: "سکه‌ها",
    desc: "سکه، اسکناس و فلزات",
    Icon: IconCoin,
    countKey: "coins" as const,
  },
  {
    href: "/museum/medals",
    title: "نشان‌ها",
    desc: "emblem و نشان‌های رسمی",
    Icon: IconEmblem,
    countKey: "medals" as const,
  },
  {
    href: "/museum/medals",
    title: "ورزشی",
    desc: "المپیک و قهرمانی",
    Icon: IconLaurel,
    countKey: "medals" as const,
  },
  {
    href: "/museum/medals",
    title: "نظامی",
    desc: "افتخارات نظامی",
    Icon: IconInsignia,
    countKey: "medals" as const,
  },
  {
    href: "/museum/coins",
    title: "سکه‌های تاریخی",
    desc: "ضرب‌های کهن و یادبود",
    Icon: IconAncientCoin,
    countKey: "coins" as const,
  },
];

export default function MuseumHomePage() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const [country, setCountry] = useState<string>(COUNTRIES[0]);
  const [eraIdx, setEraIdx] = useState(2);

  const {
    data: medalsData,
    isError: medalsError,
    error: medalsErr,
    refetch: refetchMedals,
  } = useQuery({
    queryKey: ["mu", "medals"],
    enabled: isHydrated,
    queryFn: () => getMedals({ page: 1, ordering: "-created_at" }),
    retry: 1,
  });
  const { data: coinsData, isError: coinsError, refetch: refetchCoins } =
    useQuery({
      queryKey: ["mu", "coins"],
      enabled: isHydrated,
      queryFn: () =>
        getCoins({ page: 1, is_active: true, ordering: "-created_at" }),
      retry: 1,
    });
  const { data: categoriesData } = useQuery({
    queryKey: ["mu", "cats"],
    enabled: isHydrated,
    queryFn: () => getCategories({ is_active: true, pageSize: 12 }),
  });

  const medals = (medalsData?.results ?? []) as MedalType[];
  const coins = (coinsData?.results ?? []) as Coin[];
  const categories = categoriesData?.results ?? [];
  const medalCount = medalsData?.count ?? 0;
  const coinCount = coinsData?.count ?? 0;

  const hero = medals[0] ?? null;
  const heroSrc = hero ? resolveMediaUrl(imgOf(hero)) : null;
  const exhibition = medals[1] ?? medals[0] ?? null;
  const exhibitionSrc = exhibition
    ? resolveMediaUrl(imgOf(exhibition))
    : null;
  const wallItems = medals.slice(0, 6);
  const rare = medals.slice(0, 3);

  const countryStats = useMemo(() => {
    const aliases: Record<string, string[]> = {
      ایران: ["ایران", "iran", "persia"],
      فرانسه: ["فرانسه", "france"],
      آلمان: ["آلمان", "germany"],
      روسیه: ["روسیه", "russia"],
      آمریکا: ["آمریکا", "america", "usa", "united states"],
      بریتانیا: ["بریتانیا", "britain", "uk", "england"],
    };
    const keys = aliases[country] ?? [country];
    const from = medals.filter((m) => {
      const c = (m.country || "").toLowerCase();
      return keys.some((k) => c.includes(k.toLowerCase()));
    });
    const years = (from.length ? from : medals)
      .map((m) => Number(m.year))
      .filter((y) => !Number.isNaN(y) && y > 0);
    return {
      count: from.length,
      oldest: years.length ? Math.min(...years) : "—",
      newest: years.length ? Math.max(...years) : "—",
    };
  }, [medals, country]);

  const eraYear = Number(ERAS[eraIdx].y);
  const eraObjects = useMemo(() => {
    return medals
      .map((m) => ({ m, y: Number(m.year) || 0 }))
      .filter((x) => x.y > 0)
      .sort((a, b) => Math.abs(a.y - eraYear) - Math.abs(b.y - eraYear))
      .slice(0, 4)
      .map((x) => x.m);
  }, [medals, eraYear]);

  return (
    <div>
      {(medalsError || coinsError) && (
        <div className="border-b border-danger/20 bg-[#2a1216] px-5 py-3 text-center text-sm text-[#f0c8cc]">
          {(medalsErr as Error)?.message || "اتصال برقرار نشد."}{" "}
          <button
            type="button"
            className="underline"
            onClick={() => {
              void refetchMedals();
              void refetchCoins();
            }}
          >
            تلاش مجدد
          </button>
        </div>
      )}

      <section className="mu-stage relative min-h-[90vh] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,#241618_0%,#0D0B0C_68%)]" />
        <div className="mu-container relative flex min-h-[90vh] flex-col items-center justify-center pb-16 pt-24">
          <p className="mu-label mu-fade text-[#c4a574]/85">THE ARCHIVE</p>
          <div className="mu-hero-object relative z-10 mt-8 w-full max-w-md sm:max-w-lg">
            <div className="mu-hero-glow" />
            <div className="relative z-10 mx-auto aspect-square max-h-[52vh] w-full">
              {heroSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={heroSrc}
                  alt={hero?.name ?? ""}
                  className="h-full w-full object-contain"
                />
              ) : (
                <ItemPlaceholder kind="medal" className="h-full w-full" />
              )}
            </div>
          </div>
          <div className="mu-fade relative z-10 mt-10 max-w-xl text-center" style={{ animationDelay: "100ms" }}>
            <p className="text-[0.7rem] tracking-[0.28em] text-white/35">
              Objects that carry history
            </p>
            <h1 className="museum-serif mt-3 text-3xl font-semibold leading-[1.2] tracking-tight text-white sm:text-4xl lg:text-[2.65rem]">
              آثاری که تاریخ را روایت می‌کنند
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/50 sm:text-base">
              کشف مجموعه‌ای از مدال‌ها، سکه‌ها و آثار تاریخی.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/museum/medals"
                className="border border-white/25 bg-white/[0.03] px-8 py-3 text-sm tracking-wide text-white transition hover:border-[#c4a574] hover:text-[#c4a574]"
              >
                کاوش آرشیو
              </Link>
              <Link
                href="#latest"
                className="px-4 py-3 text-sm tracking-wide text-white/45 transition hover:text-white"
              >
                کشف مجموعه
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mu-ivory border-b border-border">
        <div className="mx-auto grid max-w-6xl lg:grid-cols-12">
          <div className="relative min-h-[20rem] lg:col-span-7 lg:min-h-[30rem]">
            {exhibitionSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={exhibitionSrc}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-[#1a1614]">
                <ItemPlaceholder kind="medal" className="h-full" />
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center px-5 py-12 sm:px-10 lg:col-span-5 lg:py-16">
            <p className="mu-label text-primary">EXHIBITION 01</p>
            <h2 className="museum-serif mt-4 text-2xl font-semibold leading-snug text-primary-deep sm:text-3xl">
              {exhibition?.category_detail?.name
                ? `تالار ${exhibition.category_detail.name}`
                : "مدال‌ها و نشان‌های منتخب"}
            </h2>
            <p className="mt-4 text-sm leading-8 text-text-muted">
              {exhibition?.notes?.slice(0, 160) ||
                "نمایشگاهی از آثار برجستهٔ آرشیو — جزئیات، اصالت و داستان هر اثر."}
            </p>
            <p className="mu-label mt-8 text-text-subtle">
              {formatNumber(medalCount)} OBJECTS
              {exhibition?.year ? `  ·  ${exhibition.year}` : ""}
            </p>
            <Link
              href={
                exhibition
                  ? `/museum/medals/${exhibition.id}`
                  : "/museum/medals"
              }
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-deep"
            >
              مشاهده نمایشگاه
              <ArrowLeft className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mu-ivory border-b border-border">
        <div className="mu-container py-16 sm:py-24">
          <p className="mu-label text-primary">Explore</p>
          <h2 className="museum-serif mt-2 text-3xl font-semibold text-primary-deep sm:text-4xl">
            کاوش مجموعه
          </h2>
          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {EXPLORE.map((item) => {
              const count =
                item.countKey === "medals" ? medalCount : coinCount;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="mu-explore-tile group"
                >
                  <item.Icon className="mu-explore-icon" />
                  <span className="mu-explore-line" />
                  <div>
                    <h3 className="text-lg font-semibold text-text">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs leading-6 text-text-muted">
                      {item.desc}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-xs tabular-nums text-text-subtle">
                      {formatNumber(count)} اثر
                    </span>
                    <span className="text-xs text-primary opacity-0 transition group-hover:opacity-100">
                      مشاهده →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mu-stage border-b border-white/5 py-16 sm:py-24">
        <div className="mu-container">
          <p className="mu-label text-[#c4a574]">Curated</p>
          <h2 className="museum-serif mt-2 text-3xl font-semibold text-white sm:text-4xl">
            مجموعه‌های گزیده
          </h2>
          <div className="mt-12 grid gap-3 md:grid-cols-12">
            {(categories.length
              ? categories.slice(0, 5)
              : [
                  { id: 0, name: "Medals of Iran" },
                  { id: -1, name: "Olympic Legends" },
                  { id: -2, name: "Military Honors" },
                  { id: -3, name: "Rare Coins" },
                  { id: -4, name: "Historical" },
                ]
            ).map((c, i) => {
              const cover =
                i < medals.length
                  ? resolveMediaUrl(imgOf(medals[i]!))
                  : null;
              const span =
                i === 0
                  ? "md:col-span-7 md:row-span-2 min-h-[22rem]"
                  : i === 1
                    ? "md:col-span-5 min-h-[14rem]"
                    : "md:col-span-4 min-h-[12rem]";
              return (
                <Link
                  key={c.id}
                  href={
                    c.id > 0
                      ? `/museum/medals?category=${c.id}`
                      : "/museum/medals"
                  }
                  className={cn(
                    "group relative overflow-hidden bg-[#1a1614]",
                    span
                  )}
                >
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-700 group-hover:scale-105 group-hover:opacity-90"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="relative flex h-full flex-col justify-end p-5 sm:p-6">
                    <span className="mu-label text-white/35">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-2 text-lg font-semibold text-white sm:text-xl">
                      {c.name}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section id="latest" className="mu-ivory border-b border-border">
        <div className="mu-container py-16 sm:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mu-label text-primary">Latest Objects</p>
              <h2 className="museum-serif mt-2 text-3xl font-semibold text-primary-deep sm:text-4xl">
                آخرین آثار
              </h2>
            </div>
            <Link
              href="/museum/medals"
              className="text-sm text-primary hover:text-primary-deep"
            >
              آرشیو کامل →
            </Link>
          </div>
          <div className="mu-wall mt-12">
            {wallItems.map((m, i) => {
              const src = resolveMediaUrl(imgOf(m));
              return (
                <Link
                  key={m.id}
                  href={`/museum/medals/${m.id}`}
                  className={WALL[i] ?? "mu-w4"}
                >
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt={m.name} />
                  ) : (
                    <ItemPlaceholder kind="medal" label={m.name.charAt(0)} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    {m.catalog_number ? (
                      <p className="mu-label text-white/40">
                        MA · {m.catalog_number}
                      </p>
                    ) : null}
                    <p className="mt-1 font-semibold text-white">{m.name}</p>
                    <p className="mt-1 text-xs text-white/55">
                      {[m.country, m.year].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mu-burgundy">
        <div className="mu-container py-16 sm:py-24">
          <p className="mu-label text-[#c4a574]">Timeline</p>
          <h2 className="museum-serif mt-2 text-3xl font-semibold text-white sm:text-4xl">
            سفر در زمان
          </h2>
          <div className="mt-8 flex flex-wrap gap-2">
            {ERAS.map((e, i) => (
              <button
                key={e.y}
                type="button"
                onClick={() => setEraIdx(i)}
                className={cn(
                  "border px-4 py-2 text-sm tracking-wide transition",
                  i === eraIdx
                    ? "border-[#c4a574] text-[#c4a574]"
                    : "border-white/15 text-white/45 hover:border-white/30 hover:text-white"
                )}
              >
                {e.y}
              </button>
            ))}
          </div>
          <div className="mu-timeline-rail mt-10 text-white">
            {ERAS.map((e, i) => (
              <div key={e.y} className="mu-timeline-node">
                <p className="museum-serif text-2xl font-semibold text-white/90">
                  {e.y}
                </p>
                <p className="mt-1 text-xs text-white/40">{e.label}</p>
                {i === eraIdx && eraObjects[0] ? (
                  <p className="mt-4 text-sm text-[#c4a574]">
                    {eraObjects[0].name}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
          {eraObjects.length > 0 ? (
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {eraObjects.map((m) => {
                const src = resolveMediaUrl(imgOf(m));
                return (
                  <Link
                    key={m.id}
                    href={`/museum/medals/${m.id}`}
                    className="group relative aspect-[3/4] overflow-hidden bg-black/25"
                  >
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={src}
                        alt={m.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <ItemPlaceholder kind="medal" />
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <p className="text-xs font-medium text-white">{m.name}</p>
                      <p className="text-[0.65rem] text-white/50">{m.year}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>

      <section className="mu-ivory border-b border-border">
        <div className="mu-container py-16 sm:py-24">
          <p className="mu-label text-primary">Explore by Country</p>
          <h2 className="museum-serif mt-2 text-3xl font-semibold text-primary-deep sm:text-4xl">
            کاوش بر اساس کشور
          </h2>
          <div className="mt-10 grid gap-8 lg:grid-cols-12">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:col-span-7">
              {COUNTRIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  data-active={country === c}
                  onClick={() => setCountry(c)}
                  className="mu-country-btn"
                >
                  <span className="text-sm font-medium">{c}</span>
                </button>
              ))}
            </div>
            <div className="border border-border bg-white/40 px-6 py-8 lg:col-span-5">
              <p className="mu-label text-text-subtle">{country}</p>
              <p className="museum-serif mt-4 text-5xl font-semibold text-primary-deep">
                {formatNumber(countryStats.count)}
              </p>
              <p className="mt-1 text-sm text-text-muted">اثر در آرشیو</p>
              <dl className="mt-8 space-y-3 text-sm">
                <div className="flex justify-between border-b border-border pb-3">
                  <dt className="text-text-subtle">قدیمی‌ترین</dt>
                  <dd className="font-medium">{countryStats.oldest}</dd>
                </div>
                <div className="flex justify-between border-b border-border pb-3">
                  <dt className="text-text-subtle">جدیدترین</dt>
                  <dd className="font-medium">{countryStats.newest}</dd>
                </div>
              </dl>
              <Link
                href={`/museum/medals?q=${encodeURIComponent(country)}`}
                className="mt-8 inline-block text-sm font-medium text-primary"
              >
                مشاهده آثار {country} →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mu-vault border-b border-white/5">
        <div className="mu-container py-16 sm:py-24">
          <p className="mu-label text-[#c4a574]">Rare Objects</p>
          <h2 className="museum-serif mt-2 text-3xl font-semibold text-white sm:text-4xl">
            گنجینه‌های کمیاب
          </h2>
          <div className="mt-12 grid gap-3 sm:grid-cols-3">
            {rare.map((m, i) => {
              const src = resolveMediaUrl(imgOf(m));
              return (
                <Link
                  key={m.id}
                  href={`/museum/medals/${m.id}`}
                  className={cn(
                    "group relative overflow-hidden",
                    i === 0
                      ? "min-h-[20rem] sm:col-span-2 sm:row-span-2 sm:min-h-[28rem]"
                      : "min-h-[12rem]"
                  )}
                >
                  <div className="absolute inset-0 bg-[#120e0c]">
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={src}
                        alt={m.name}
                        className="h-full w-full object-cover opacity-85 transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <ItemPlaceholder kind="medal" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="mu-label text-[#c4a574]/70">
                      {m.catalog_number ? `MA · ${m.catalog_number}` : "RARE"}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {m.name}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {coins.length > 0 ? (
        <section className="mu-stage border-b border-white/5 py-16">
          <div className="mu-container">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="mu-label text-[#c4a574]">Coins</p>
                <h2 className="museum-serif mt-2 text-2xl font-semibold text-white">
                  سکه و پول
                </h2>
              </div>
              <Link
                href="/museum/coins"
                className="text-sm text-[#c4a574] hover:text-white"
              >
                آرشیو →
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-8 lg:grid-cols-4">
              {coins.slice(0, 4).map((c) => {
                const src = resolveMediaUrl(imgOf(c));
                return (
                  <Link
                    key={c.id}
                    href={`/museum/coins/${c.id}`}
                    className="group text-center"
                  >
                    <div className="museum-coin-ring relative mx-auto aspect-square max-w-[10rem] overflow-hidden bg-[#1a1612]">
                      {src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={src}
                          alt={c.name}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <ItemPlaceholder kind="coin" />
                      )}
                    </div>
                    <p className="mt-4 text-sm font-medium text-white">{c.name}</p>
                    <p className="mt-1 text-xs text-white/40">
                      {[c.country, c.year].filter(Boolean).join(" · ")}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mu-stage border-b border-white/5">
        <div className="mu-container grid grid-cols-2 gap-10 py-16 sm:grid-cols-4 sm:py-20">
          {[
            { n: formatNumber(medalCount + coinCount), l: "آثار" },
            { n: formatNumber(medalCount), l: "مدال" },
            { n: formatNumber(coinCount), l: "سکه" },
            {
              n: formatNumber(Math.max(categories.length, 1)),
              l: "مجموعه",
            },
          ].map((s) => (
            <div key={s.l}>
              <p className="museum-serif text-4xl font-semibold tabular-nums text-white sm:text-5xl">
                {s.n}
                <span className="text-[#c4a574]">+</span>
              </p>
              <p className="mu-label mt-3 text-white/35">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mu-ivory">
        <div className="mu-container py-20 text-center sm:py-28">
          <p className="mu-label text-primary">Begin</p>
          <p className="mt-2 text-xs tracking-[0.2em] text-text-subtle">
            There is always another story to discover
          </p>
          <h2 className="museum-serif mt-4 text-3xl font-semibold text-primary-deep sm:text-4xl">
            تاریخ را از نزدیک ببینید.
          </h2>
          <Link
            href="/museum/medals"
            className="mt-10 inline-block bg-primary px-10 py-3.5 text-sm font-medium tracking-wide text-white transition hover:bg-primary-deep"
          >
            ورود به آرشیو
          </Link>
        </div>
      </section>
    </div>
  );
}
