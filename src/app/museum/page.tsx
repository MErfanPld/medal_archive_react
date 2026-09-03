"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowUpLeft,
  Search,
  Landmark,
  BookOpen,
  Shield,
  GraduationCap,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { getMedals } from "@/lib/data/medals";
import { getCoins } from "@/lib/data/coins";
import { resolveMediaUrl } from "@/lib/utils";
import { ItemPlaceholder } from "@/components/museum/item-placeholder";

const HERO_IMG =
  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=2400&q=80";

const CATEGORIES = [
  { href: "/museum/medals", title: "مدال‌ها", en: "Medals", count: "۱۲٬۴۰۰+", image: "https://images.unsplash.com/photo-1569025743873-ea3a9a6f8c6f?auto=format&fit=crop&w=1200&q=80" },
  { href: "/museum/coins", title: "سکه و پول", en: "Coins", count: "۸٬۲۰۰+", image: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=1200&q=80" },
  { href: "/museum/banknotes", title: "اسکناس", en: "Banknotes", count: "۳٬۱۰۰+", image: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=1200&q=80" },
  { href: "/museum/antiques", title: "آنتیک", en: "Antiques", count: "۲٬۴۰۰+", image: "https://images.unsplash.com/photo-1577083552431-6e5fd82594ea?auto=format&fit=crop&w=1200&q=80" },
  { href: "/museum/knives", title: "چاقو", en: "Knives", count: "۹۸۰+", image: "https://images.unsplash.com/photo-1595527893147-4e5e5c2c1a5e?auto=format&fit=crop&w=1200&q=80" },
  { href: "/museum/rings", title: "انگشتر", en: "Rings", count: "۱٬۱۵۰+", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80" },
  { href: "/museum/seals", title: "مهر", en: "Seals", count: "۷۲۰+", image: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=1200&q=80" },
  { href: "/museum/stamps", title: "تمبر", en: "Stamps", count: "۴٬۶۰۰+", image: "https://images.unsplash.com/photo-1601925260368-ae2c6e9d6a26?auto=format&fit=crop&w=1200&q=80" },
  { href: "/museum/tasbih", title: "تسبیح", en: "Tasbih", count: "۵۴۰+", image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=1200&q=80" },
];

const FEATURED = [
  { href: "/museum/medals?q=ایران", title: "مدال‌های ایران", subtitle: "از قاجار تا عصر معاصر", image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1600&q=80" },
  { href: "/museum/medals?q=المپیک", title: "مدال‌های المپیک", subtitle: "افتخارات ورزشی جهان", image: "https://images.unsplash.com/photo-1461896836934-ffe607ba6851?auto=format&fit=crop&w=1200&q=80" },
  { href: "/museum/coins", title: "سکه‌های تاریخی", subtitle: "ضرب‌های کهن و یادبود", image: "https://images.unsplash.com/photo-1624365168968-f283d507b1d9?auto=format&fit=crop&w=1200&q=80" },
  { href: "/museum/seals", title: "مهرهای سلطنتی", subtitle: "کتیبه، نقش و اعتبار", image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=1200&q=80" },
  { href: "/museum/medals?q=نظامی", title: "مجموعه نظامی", subtitle: "نشان‌ها و افتخارات", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80" },
];

const ERAS = [
  { period: "Qajar", title: "قاجار", years: "۱۷۸۹ — ۱۹۲۵", desc: "نشان‌های سلطنتی، مدال‌های دولتی و سکه‌های نقرهٔ عصر قاجار." },
  { period: "Pahlavi", title: "پهلوی", years: "۱۹۲۵ — ۱۹۷۹", desc: "مدال‌های رسمی، نشان‌های نظامی و ضرب‌های یادبود دوره پهلوی." },
  { period: "Modern", title: "ایران معاصر", years: "۱۹۷۹ — امروز", desc: "مجموعه‌های ورزشی، علمی و فرهنگی دوران معاصر." },
  { period: "World Wars", title: "جنگ‌های جهانی", years: "۱۹۱۴ — ۱۹۴۵", desc: "نشان‌ها و مدال‌های مرتبط با جنگ جهانی اول و دوم." },
  { period: "Ancient", title: "تمدن‌های کهن", years: "پیش از اسلام", desc: "سکه‌ها، مهرها و آثار بازمانده از تمدن‌های باستانی." },
];

const STORY = [
  { icon: Shield, title: "حفاظت", desc: "نگهداری دیجیتال و مستندسازی دقیق آثار برای نسل‌های آینده." },
  { icon: BookOpen, title: "مستندسازی", desc: "ثبت مشخصات فنی، اصالت، سوابق خرید و ارزش‌گذاری هر قلم." },
  { icon: Search, title: "پژوهش", desc: "امکان کاوش بر اساس کشور، دوره تاریخی، ماده و کاتالوگ." },
  { icon: GraduationCap, title: "آموزش", desc: "روایت فرهنگی و تاریخی مجموعه‌ها برای مخاطب عمومی و متخصص." },
];

function imgOf(m: { primary_image?: string | null; primary_image_url?: string | null }) {
  return resolveMediaUrl(m.primary_image_url || m.primary_image || null);
}

export default function MuseumHomePage() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [year, setYear] = useState("");
  const [category, setCategory] = useState("medals");

  const { data: medalsData } = useQuery({
    queryKey: ["museum-home-medals"],
    enabled: isHydrated,
    queryFn: () => getMedals({ page: 1, ordering: "-created_at" }),
  });

  const { data: coinsData } = useQuery({
    queryKey: ["museum-home-coins"],
    enabled: isHydrated,
    queryFn: () => getCoins({ page: 1, is_active: true, ordering: "-created_at" }),
  });

  const latest = useMemo(() => {
    const medals = (medalsData?.results ?? []).slice(0, 4).map((m) => ({
      id: m.id,
      name: m.name,
      year: m.year,
      country: m.country,
      href: `/museum/medals/${m.id}`,
      image: imgOf(m),
      category: "مدال",
    }));
    const coins = (coinsData?.results ?? []).slice(0, 4).map((c) => ({
      id: c.id,
      name: c.name,
      year: c.year,
      country: c.country,
      href: `/museum/coins/${c.id}`,
      image: imgOf(c),
      category: "سکه",
    }));
    return [...medals, ...coins].slice(0, 8);
  }, [medalsData, coinsData]);

  const goSearch = () => {
    const parts = [q, country, year].map((x) => x.trim()).filter(Boolean);
    const params = new URLSearchParams();
    if (parts.length) params.set("q", parts.join(" "));
    const base =
      category === "coins"
        ? "/museum/coins"
        : category === "banknotes"
          ? "/museum/banknotes"
          : category === "seals"
            ? "/museum/seals"
            : "/museum/medals";
    const qs = params.toString();
    window.location.href = qs ? `${base}?${qs}` : base;
  };

  return (
    <div className="mu-stage">
      <section className="mu-hero" aria-label="Hero">
        <div className="mu-hero-bg" style={{ backgroundImage: `url(${HERO_IMG})` }} aria-hidden />
        <div className="mu-hero-overlay" aria-hidden />
        <div className="mu-container relative z-10 pb-16 pt-32 sm:pb-20 sm:pt-40">
          <p className="mu-label mu-reveal">Digital Museum · Est. Archive</p>
          <h1 className="museum-serif mu-reveal mt-6 max-w-4xl text-5xl font-semibold text-[#F5F2EA] sm:text-6xl lg:text-7xl">
            MEDAL ARCHIVE
          </h1>
          <p className="mu-reveal mt-4 max-w-2xl text-lg font-medium tracking-wide text-[#C8A75D] sm:text-xl">
            A Digital Museum of Historical Collectibles
          </p>
          <p className="mu-reveal mt-5 max-w-xl text-base leading-8 text-[#A8A8A8] sm:text-lg">
            آرشیو دیجیتال مجموعه‌های تاریخی، مدال‌ها، سکه‌ها و آثار ارزشمند
          </p>
          <div className="mu-reveal mt-10 flex flex-wrap items-center gap-3">
            <Link href="/museum/medals" className="mu-btn mu-btn-gold">
              کاوش مجموعه
              <ArrowLeft className="size-4" />
            </Link>
            <a href="#categories" className="mu-btn mu-btn-ghost">مشاهده دسته‌ها</a>
          </div>
          <div className="mu-reveal mt-16 flex justify-center sm:mt-20">
            <a href="#stats" className="mu-scroll-hint">پیمایش<span /></a>
          </div>
        </div>
      </section>

      <section id="stats" className="border-y border-white/5 bg-[#171717]">
        <div className="mu-container grid grid-cols-2 gap-2 py-14 sm:grid-cols-4 sm:py-16">
          {[
            { v: "۵۰٬۰۰۰+", l: "اثر" },
            { v: "۱۲۰+", l: "کشور" },
            { v: "۳۰۰+", l: "دسته" },
            { v: "۱۰۰+", l: "سال تاریخ" },
          ].map((s) => (
            <div key={s.l} className="mu-stat">
              <p className="mu-stat-value">{s.v}</p>
              <p className="mu-stat-label">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="categories" className="py-20 sm:py-28">
        <div className="mu-container">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mu-label">Collections</p>
              <h2 className="museum-serif mt-3 text-3xl font-semibold text-[#F5F2EA] sm:text-4xl">دسته‌بندی مجموعه‌ها</h2>
              <p className="mt-3 max-w-lg text-sm leading-7 text-[#A8A8A8]">از مدال و سکه تا مهر و تمبر — هر مجموعه روایتی مستقل از تاریخ مادی است.</p>
            </div>
            <Link href="/museum/medals" className="text-sm text-[#C8A75D] transition hover:text-[#F5F2EA]">مشاهده همه ←</Link>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
            {CATEGORIES.map((c) => (
              <Link key={c.href} href={c.href} className="mu-cat-card group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image} alt="" />
                <div className="mu-cat-overlay">
                  <p className="text-[0.65rem] tracking-[0.2em] text-[#C8A75D]">{c.en}</p>
                  <h3 className="museum-serif mt-1 text-xl font-semibold text-[#F5F2EA]">{c.title}</h3>
                  <p className="mt-1 text-xs text-[#A8A8A8]">{c.count} اثر</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-[#0a0a0a] py-20 sm:py-28">
        <div className="mu-container">
          <p className="mu-label">Curated</p>
          <h2 className="museum-serif mt-3 text-3xl font-semibold sm:text-4xl">مجموعه‌های منتخب</h2>
          <p className="mt-3 max-w-lg text-sm leading-7 text-[#A8A8A8]">گلچین‌هایی سردبیری‌شده برای کشف عمیق‌تر تاریخ و فرهنگ.</p>
          <div className="mu-featured mt-12">
            {FEATURED.slice(0, 3).map((f, i) => (
              <Link key={f.href + i} href={f.href} className="mu-featured-card group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.image} alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="mu-label text-[#C8A75D]">Featured</p>
                  <h3 className="museum-serif mt-2 text-2xl font-semibold text-white">{f.title}</h3>
                  <p className="mt-1 text-sm text-white/60">{f.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {FEATURED.slice(3).map((f) => (
              <Link key={f.href} href={f.href} className="mu-featured-card min-h-[14rem]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.image} alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="museum-serif text-xl font-semibold text-white">{f.title}</h3>
                  <p className="mt-1 text-sm text-white/60">{f.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mu-container">
          <p className="mu-label">Timeline</p>
          <h2 className="museum-serif mt-3 text-3xl font-semibold sm:text-4xl">گاه‌شمار تاریخی</h2>
          <p className="mt-3 max-w-lg text-sm leading-7 text-[#A8A8A8]">سفر در دوره‌ها — از تمدن‌های کهن تا عصر معاصر.</p>
          <div className="mu-timeline mt-10">
            {ERAS.map((e) => (
              <article key={e.period} className="mu-era">
                <p className="mu-label">{e.period}</p>
                <h3 className="museum-serif mt-4 text-2xl font-semibold text-[#F5F2EA]">{e.title}</h3>
                <p className="mt-2 text-sm text-[#C8A75D]">{e.years}</p>
                <p className="mt-4 text-sm leading-7 text-[#A8A8A8]">{e.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-[#171717] py-20 sm:py-28">
        <div className="mu-container">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mu-label">Recent Acquisitions</p>
              <h2 className="museum-serif mt-3 text-3xl font-semibold sm:text-4xl">تازه‌ترین آثار</h2>
            </div>
            <Link href="/museum/medals" className="text-sm text-[#C8A75D] hover:text-[#F5F2EA]">آرشیو کامل ←</Link>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
            {latest.length === 0
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="museum-shimmer aspect-square rounded-sm bg-[#0d0d0d]" />
                ))
              : latest.map((item) => (
                  <Link key={`${item.href}-${item.id}`} href={item.href} className="mu-item-card">
                    <div className="bg-[#0d0d0d]">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt={item.name} />
                      ) : (
                        <div className="flex aspect-square items-center justify-center">
                          <ItemPlaceholder kind="medal" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1 p-4">
                      <p className="text-[0.65rem] tracking-[0.16em] text-[#C8A75D]">{item.category}</p>
                      <h3 className="line-clamp-2 text-sm font-medium text-[#F5F2EA]">{item.name}</h3>
                      <p className="text-xs text-[#A8A8A8]">{[item.year, item.country].filter(Boolean).join(" · ") || "—"}</p>
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mu-container">
          <p className="mu-label">Experience</p>
          <h2 className="museum-serif mt-3 max-w-2xl text-3xl font-semibold sm:text-4xl">تجربهٔ موزه دیجیتال</h2>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-[#A8A8A8]">Medal Archive فقط یک فهرست نیست — فضایی برای روایت، پژوهش و حفظ میراث مجموعه‌های تاریخی است.</p>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            <div className="mu-story-panel min-h-[20rem] md:min-h-[28rem]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1566058539055-5361ffc80d22?auto=format&fit=crop&w=1600&q=80" alt="" />
              <div className="relative z-10 p-8">
                <h3 className="museum-serif text-2xl font-semibold text-white">هر اثر، یک روایت</h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-white/65">از تصویر و مشخصات فنی تا سوابق اصالت و ارزش‌گذاری — هر قلم در بافت تاریخی خود نمایش داده می‌شود.</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {STORY.map((s) => (
                <div key={s.title} className="border border-white/8 bg-[#171717] p-6 transition hover:border-[#C8A75D]/40">
                  <s.icon className="size-5 text-[#C8A75D]" />
                  <h3 className="museum-serif mt-4 text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[#A8A8A8]">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-[#0a0a0a] py-20 sm:py-24">
        <div className="mu-container">
          <div className="mu-search">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mu-label">Search the Archive</p>
                <h2 className="museum-serif mt-3 text-2xl font-semibold sm:text-3xl">جستجو در آرشیو</h2>
              </div>
              <Landmark className="hidden size-8 text-[#C8A75D]/50 sm:block" />
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block space-y-2">
                <span className="text-xs text-[#A8A8A8]">نام اثر</span>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="مثلاً مدال المپیک…" />
              </label>
              <label className="block space-y-2">
                <span className="text-xs text-[#A8A8A8]">کشور</span>
                <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="ایران، فرانسه…" />
              </label>
              <label className="block space-y-2">
                <span className="text-xs text-[#A8A8A8]">سال</span>
                <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="۱۹۷۶" />
              </label>
              <label className="block space-y-2">
                <span className="text-xs text-[#A8A8A8]">دسته</span>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="medals">مدال</option>
                  <option value="coins">سکه</option>
                  <option value="banknotes">اسکناس</option>
                  <option value="seals">مهر</option>
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

      <section className="py-20 sm:py-28">
        <div className="mu-container mu-about-grid">
          <div>
            <p className="mu-label">Institution</p>
            <h2 className="museum-serif mt-3 text-3xl font-semibold sm:text-4xl">دربارهٔ آرشیو</h2>
            <p className="mt-6 text-sm leading-8 text-[#A8A8A8] sm:text-base">
              Medal Archive یک نهاد دیجیتال برای نگهداری، مستندسازی و نمایش مجموعه‌های تاریخی است. مأموریت ما پیوند دادن مخاطب با میراث مادی — از مدال و سکه تا مهر و آنتیک — در قالبی موزه‌ای، دقیق و قابل اعتماد است.
            </p>
            <div className="mu-gold-line my-8" />
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-[#C8A75D]">ماموریت</h3>
                <p className="mt-2 text-sm leading-7 text-[#A8A8A8]">حفظ و دسترس‌پذیر کردن دانش مجموعه‌ها برای پژوهشگران و عموم.</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#C8A75D]">چشم‌انداز</h3>
                <p className="mt-2 text-sm leading-7 text-[#A8A8A8]">تبدیل شدن به مرجع دیجیتال مجموعه‌های تاریخی منطقه.</p>
              </div>
            </div>
          </div>
          <div className="relative min-h-[20rem] overflow-hidden bg-[#171717]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1554907984-15263bfd63bd?auto=format&fit=crop&w=1400&q=80" alt="" className="h-full w-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent" />
            <div className="absolute bottom-0 p-6">
              <p className="museum-serif text-2xl text-white">تاریخ را لمس کنید</p>
              <p className="mt-2 text-sm text-white/60">هر مجموعه، دریچه‌ای به گذشته</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-[#171717]">
        <div className="mu-container flex flex-col items-start justify-between gap-6 py-16 sm:flex-row sm:items-center">
          <div>
            <p className="mu-label">Begin</p>
            <h2 className="museum-serif mt-2 text-2xl font-semibold sm:text-3xl">وارد آرشیو شوید</h2>
          </div>
          <Link href="/museum/medals" className="mu-btn mu-btn-gold">
            شروع کاوش
            <ArrowUpLeft className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
