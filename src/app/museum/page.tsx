"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Search,
  Award,
  Coins,
  Banknote,
  Package,
  Sword,
  Gem,
  Hexagon,
  Stamp,
  CircleDot,
  ImageOff,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { getMedals } from "@/lib/data/medals";
import { getCoins } from "@/lib/data/coins";
import { getBanknotes } from "@/lib/data/banknotes";
import { getAntiques } from "@/lib/data/antiques";
import { getKnives } from "@/lib/data/knives";
import { getRings } from "@/lib/data/rings";
import { getSeals } from "@/lib/data/seals";
import { getStamps } from "@/lib/data/stamps";
import { getTasbihs } from "@/lib/data/tasbih";
import { resolveMediaUrl } from "@/lib/utils";

type ItemLike = {
  id: number;
  name: string;
  year?: number | string | null;
  country?: string | null;
  primary_image?: string | null;
  primary_image_url?: string | null;
};

const DOMAINS = [
  { key: "medals", href: "/museum/medals", title: "مدال‌ها", en: "Medals", Icon: Award },
  { key: "coins", href: "/museum/coins", title: "سکه و پول", en: "Coins", Icon: Coins },
  { key: "banknotes", href: "/museum/banknotes", title: "اسکناس", en: "Banknotes", Icon: Banknote },
  { key: "antiques", href: "/museum/antiques", title: "آنتیک", en: "Antiques", Icon: Package },
  { key: "knives", href: "/museum/knives", title: "چاقو", en: "Knives", Icon: Sword },
  { key: "rings", href: "/museum/rings", title: "انگشتر", en: "Rings", Icon: Gem },
  { key: "seals", href: "/museum/seals", title: "مهر", en: "Seals", Icon: Hexagon },
  { key: "stamps", href: "/museum/stamps", title: "تمبر", en: "Stamps", Icon: Stamp },
  { key: "tasbih", href: "/museum/tasbih", title: "تسبیح", en: "Tasbih", Icon: CircleDot },
] as const;

function imgOf(m: ItemLike) {
  return resolveMediaUrl(m.primary_image_url || m.primary_image || null);
}

function ItemThumb({
  item,
  href,
  label,
}: {
  item: ItemLike;
  href: string;
  label: string;
}) {
  const src = imgOf(item);
  return (
    <Link href={href} className="mu-item-card mu-anim-rise group">
      <div className="relative aspect-square overflow-hidden bg-[#0d0d0d]">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#C8A75D]/50">
            <ImageOff className="size-8" strokeWidth={1.25} />
            <span className="text-[0.65rem] tracking-[0.16em] uppercase">بدون تصویر</span>
          </div>
        )}
      </div>
      <div className="space-y-1 p-4">
        <p className="text-[0.65rem] tracking-[0.16em] text-[#C8A75D]">{label}</p>
        <h3 className="line-clamp-2 text-sm font-medium text-[#F5F2EA]">{item.name}</h3>
        <p className="text-xs text-[#A8A8A8]">
          {[item.year, item.country].filter(Boolean).join(" · ") || "—"}
        </p>
      </div>
    </Link>
  );
}

function DomainSection({
  title,
  en,
  href,
  items,
  label,
}: {
  title: string;
  en: string;
  href: string;
  items: ItemLike[];
  label: string;
}) {
  if (!items.length) return null;
  return (
    <section className="border-t border-white/5 py-16 sm:py-20">
      <div className="mu-container">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="mu-anim-rise">
            <p className="mu-label">{en}</p>
            <h2 className="museum-serif mt-2 text-2xl font-semibold sm:text-3xl">{title}</h2>
          </div>
          <Link href={href} className="mu-anim-rise text-sm text-[#C8A75D] transition hover:text-[#F5F2EA]">
            مشاهده آرشیو ←
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-5">
          {items.slice(0, 4).map((item) => (
            <ItemThumb
              key={`${href}-${item.id}`}
              item={item}
              href={`${href}/${item.id}`}
              label={label}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function MuseumHomePage() {
  const router = useRouter();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [year, setYear] = useState("");
  const [searchDomain, setSearchDomain] = useState("medals");
  const sliderRef = useRef<HTMLDivElement>(null);
  const enabled = isHydrated;

  const medalsQ = useQuery({
    queryKey: ["mu-home", "medals"],
    enabled,
    queryFn: () => getMedals({ page: 1, ordering: "-created_at" }),
  });
  const coinsQ = useQuery({
    queryKey: ["mu-home", "coins"],
    enabled,
    queryFn: () => getCoins({ page: 1, is_active: true, ordering: "-created_at" }),
  });
  const banknotesQ = useQuery({
    queryKey: ["mu-home", "banknotes"],
    enabled,
    queryFn: () => getBanknotes({ page: 1, ordering: "-created_at" }),
  });
  const antiquesQ = useQuery({
    queryKey: ["mu-home", "antiques"],
    enabled,
    queryFn: () => getAntiques({ page: 1, ordering: "-created_at" }),
  });
  const knivesQ = useQuery({
    queryKey: ["mu-home", "knives"],
    enabled,
    queryFn: () => getKnives({ page: 1, ordering: "-created_at" }),
  });
  const ringsQ = useQuery({
    queryKey: ["mu-home", "rings"],
    enabled,
    queryFn: () => getRings({ page: 1, ordering: "-created_at" }),
  });
  const sealsQ = useQuery({
    queryKey: ["mu-home", "seals"],
    enabled,
    queryFn: () => getSeals({ page: 1, ordering: "-created_at" }),
  });
  const stampsQ = useQuery({
    queryKey: ["mu-home", "stamps"],
    enabled,
    queryFn: () => getStamps({ page: 1, ordering: "-created_at" }),
  });
  const tasbihQ = useQuery({
    queryKey: ["mu-home", "tasbih"],
    enabled,
    queryFn: () => getTasbihs({ page: 1, ordering: "-created_at" }),
  });

  const counts = useMemo(
    () => ({
      medals: medalsQ.data?.count ?? 0,
      coins: coinsQ.data?.count ?? 0,
      banknotes: banknotesQ.data?.count ?? 0,
      antiques: antiquesQ.data?.count ?? 0,
      knives: knivesQ.data?.count ?? 0,
      rings: ringsQ.data?.count ?? 0,
      seals: sealsQ.data?.count ?? 0,
      stamps: stampsQ.data?.count ?? 0,
      tasbih: tasbihQ.data?.count ?? 0,
    }),
    [medalsQ.data, coinsQ.data, banknotesQ.data, antiquesQ.data, knivesQ.data, ringsQ.data, sealsQ.data, stampsQ.data, tasbihQ.data]
  );

  const totalItems = Object.values(counts).reduce((a, b) => a + b, 0);

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    let raf = 0;
    let paused = false;
    const onEnter = () => {
      paused = true;
    };
    const onLeave = () => {
      paused = false;
    };
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("touchstart", onEnter, { passive: true });
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("touchend", onLeave);
    const tick = () => {
      if (!paused && el.scrollWidth > el.clientWidth) {
        el.scrollLeft += 0.6;
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 2) {
          el.scrollLeft = 0;
        }
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(raf);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("touchstart", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("touchend", onLeave);
    };
  }, []);

  const goSearch = () => {
    const parts = [q, country, year].map((x) => x.trim()).filter(Boolean);
    const params = new URLSearchParams();
    if (parts.length) params.set("q", parts.join(" "));
    const domain = DOMAINS.find((d) => d.key === searchDomain) ?? DOMAINS[0];
    const qs = params.toString();
    router.push(qs ? `${domain.href}?${qs}` : domain.href);
  };

  const heroItem = medalsQ.data?.results?.[0] ?? coinsQ.data?.results?.[0] ?? null;
  const heroSrc = heroItem ? imgOf(heroItem) : null;

  return (
    <div className="mu-stage">
      <section className="mu-hero" aria-label="Hero">
        {heroSrc ? (
          <div className="mu-hero-bg" style={{ backgroundImage: `url(${heroSrc})` }} aria-hidden />
        ) : (
          <div
            className="mu-hero-bg"
            style={{ background: "radial-gradient(ellipse at 50% 40%, #2a2418 0%, #0d0d0d 70%)" }}
            aria-hidden
          />
        )}
        <div className="mu-hero-overlay" aria-hidden />
        <div className="mu-container relative z-10 pb-16 pt-32 sm:pb-20 sm:pt-40">
          <p className="mu-label mu-anim-rise">Digital Museum · Archive</p>
          <h1 className="museum-serif mu-anim-rise mt-6 max-w-4xl text-5xl font-semibold text-[#F5F2EA] sm:text-6xl lg:text-7xl">
            MEDAL ARCHIVE
          </h1>
          <p className="mu-anim-rise mt-4 max-w-2xl text-lg font-medium tracking-wide text-[#C8A75D] sm:text-xl">
            A Digital Museum of Historical Collectibles
          </p>
          <p className="mu-anim-rise mt-5 max-w-xl text-base leading-8 text-[#A8A8A8] sm:text-lg">
            آرشیو دیجیتال مجموعه‌های تاریخی، مدال‌ها، سکه‌ها و آثار ارزشمند
          </p>
          <div className="mu-anim-rise mt-10 flex flex-wrap items-center gap-3">
            <Link href="/museum/medals" className="mu-btn mu-btn-gold">
              کاوش مجموعه
              <ArrowLeft className="size-4" />
            </Link>
            <a href="#categories" className="mu-btn mu-btn-ghost">دسته‌بندی‌ها</a>
          </div>
          <div className="mu-anim-rise mt-16 flex justify-center sm:mt-20">
            <a href="#stats" className="mu-scroll-hint">پیمایش<span /></a>
          </div>
        </div>
      </section>

      <section id="stats" className="border-y border-white/5 bg-[#171717]">
        <div className="mu-container grid grid-cols-2 gap-2 py-14 sm:grid-cols-4 sm:py-16">
          {[
            { v: totalItems > 0 ? totalItems.toLocaleString("fa-IR") : "—", l: "کل آثار" },
            { v: counts.medals > 0 ? counts.medals.toLocaleString("fa-IR") : "—", l: "مدال" },
            { v: counts.coins > 0 ? counts.coins.toLocaleString("fa-IR") : "—", l: "سکه" },
            { v: String(DOMAINS.length), l: "مجموعه" },
          ].map((s, i) => (
            <div key={s.l} className="mu-stat mu-anim-rise" style={{ animationDelay: `${i * 80}ms` }}>
              <p className="mu-stat-value">{s.v}</p>
              <p className="mu-stat-label">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="categories" className="py-16 sm:py-20">
        <div className="mu-container">
          <div className="mu-anim-rise">
            <p className="mu-label">Collections</p>
            <h2 className="museum-serif mt-3 text-3xl font-semibold sm:text-4xl">دسته‌بندی مجموعه‌ها</h2>
          </div>
        </div>
        <div ref={sliderRef} className="mu-cat-slider mt-10 flex gap-4 overflow-x-auto px-5 sm:px-8 lg:px-10" dir="ltr">
          {[...DOMAINS, ...DOMAINS].map((d, i) => {
            const count = counts[d.key as keyof typeof counts] ?? 0;
            return (
              <Link key={`${d.key}-${i}`} href={d.href} className="mu-cat-slide group">
                <span className="mu-cat-icon">
                  <d.Icon className="size-7" strokeWidth={1.25} />
                </span>
                <span className="mt-4 text-sm font-semibold text-[#F5F2EA]">{d.title}</span>
                <span className="mt-1 text-[0.65rem] tracking-[0.18em] text-[#C8A75D]">{d.en}</span>
                <span className="mt-2 text-xs text-[#A8A8A8]">
                  {count > 0 ? `${count.toLocaleString("fa-IR")} اثر` : "—"}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <DomainSection title="مدال‌ها" en="Medals" href="/museum/medals" items={(medalsQ.data?.results ?? []) as ItemLike[]} label="مدال" />
      <DomainSection title="سکه و پول" en="Coins" href="/museum/coins" items={(coinsQ.data?.results ?? []) as ItemLike[]} label="سکه" />
      <DomainSection title="اسکناس" en="Banknotes" href="/museum/banknotes" items={(banknotesQ.data?.results ?? []) as ItemLike[]} label="اسکناس" />
      <DomainSection title="آنتیک" en="Antiques" href="/museum/antiques" items={(antiquesQ.data?.results ?? []) as ItemLike[]} label="آنتیک" />
      <DomainSection title="چاقو" en="Knives" href="/museum/knives" items={(knivesQ.data?.results ?? []) as ItemLike[]} label="چاقو" />
      <DomainSection title="انگشتر" en="Rings" href="/museum/rings" items={(ringsQ.data?.results ?? []) as ItemLike[]} label="انگشتر" />
      <DomainSection title="مهر" en="Seals" href="/museum/seals" items={(sealsQ.data?.results ?? []) as ItemLike[]} label="مهر" />
      <DomainSection title="تمبر" en="Stamps" href="/museum/stamps" items={(stampsQ.data?.results ?? []) as ItemLike[]} label="تمبر" />
      <DomainSection title="تسبیح" en="Tasbih" href="/museum/tasbih" items={(tasbihQ.data?.results ?? []) as ItemLike[]} label="تسبیح" />

      <section className="border-y border-white/5 bg-[#0a0a0a] py-20 sm:py-24">
        <div className="mu-container">
          <div className="mu-search mu-anim-rise">
            <p className="mu-label">Search the Archive</p>
            <h2 className="museum-serif mt-3 text-2xl font-semibold sm:text-3xl">جستجو در آرشیو</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block space-y-2">
                <span className="text-xs text-[#A8A8A8]">نام اثر</span>
                <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && goSearch()} placeholder="مثلاً مدال المپیک…" />
              </label>
              <label className="block space-y-2">
                <span className="text-xs text-[#A8A8A8]">کشور</span>
                <input value={country} onChange={(e) => setCountry(e.target.value)} onKeyDown={(e) => e.key === "Enter" && goSearch()} placeholder="ایران، فرانسه…" />
              </label>
              <label className="block space-y-2">
                <span className="text-xs text-[#A8A8A8]">سال</span>
                <input value={year} onChange={(e) => setYear(e.target.value)} onKeyDown={(e) => e.key === "Enter" && goSearch()} placeholder="۱۹۷۶" />
              </label>
              <label className="block space-y-2">
                <span className="text-xs text-[#A8A8A8]">مجموعه</span>
                <select value={searchDomain} onChange={(e) => setSearchDomain(e.target.value)}>
                  {DOMAINS.map((d) => (
                    <option key={d.key} value={d.key}>{d.title}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-8">
              <button type="button" onClick={goSearch} className="mu-btn mu-btn-gold">
                <Search className="size-4" />
                جستجو در آرشیو
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
