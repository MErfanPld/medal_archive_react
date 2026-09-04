"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  Medal, Coins, Banknote, Package, Sword, Gem, Hexagon, Stamp, CircleDot,
  FolderOpen, Users, Plus, Landmark, RefreshCw, ArrowUpLeft, Layers, TrendingUp,
} from "lucide-react";
import { getMedals } from "@/lib/data/medals";
import { getCoins } from "@/lib/data/coins";
import { getBanknotes } from "@/lib/data/banknotes";
import { getAntiques } from "@/lib/data/antiques";
import { getKnives } from "@/lib/data/knives";
import { getRings } from "@/lib/data/rings";
import { getSeals } from "@/lib/data/seals";
import { getStamps } from "@/lib/data/stamps";
import { getTasbihs } from "@/lib/data/tasbih";
import { getCategories } from "@/lib/data/categories";
import { getUsers } from "@/lib/data/users";
import { formatNumber, formatDate, cn, resolvePrimaryImage } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";

type CollectionKey =
  | "medals" | "coins" | "banknotes" | "antiques" | "knives"
  | "rings" | "seals" | "stamps" | "tasbih";

const COLLECTIONS: {
  key: CollectionKey;
  label: string;
  href: string;
  newHref: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  bar: string;
}[] = [
  { key: "medals", label: "مدال‌ها", href: "/admin/medals", newHref: "/admin/medals/new", icon: Medal, accent: "bg-rose-600 text-white shadow-md shadow-rose-600/30", bar: "#6E1F2A" },
  { key: "coins", label: "سکه و پول", href: "/admin/coins", newHref: "/admin/coins/new", icon: Coins, accent: "bg-amber-500 text-white shadow-md shadow-amber-500/30", bar: "#D4A017" },
  { key: "banknotes", label: "اسکناس", href: "/admin/banknotes", newHref: "/admin/banknotes/new", icon: Banknote, accent: "bg-emerald-600 text-white shadow-md shadow-emerald-600/30", bar: "#2D6A4F" },
  { key: "antiques", label: "آنتیک", href: "/admin/antiques", newHref: "/admin/antiques/new", icon: Package, accent: "bg-orange-600 text-white shadow-md shadow-orange-600/30", bar: "#C2410C" },
  { key: "knives", label: "چاقو", href: "/admin/knives", newHref: "/admin/knives/new", icon: Sword, accent: "bg-slate-700 text-white shadow-md shadow-slate-700/30", bar: "#334155" },
  { key: "rings", label: "انگشتر", href: "/admin/rings", newHref: "/admin/rings/new", icon: Gem, accent: "bg-violet-600 text-white shadow-md shadow-violet-600/30", bar: "#7C3AED" },
  { key: "seals", label: "مهر", href: "/admin/seals", newHref: "/admin/seals/new", icon: Hexagon, accent: "bg-sky-600 text-white shadow-md shadow-sky-600/30", bar: "#0284C7" },
  { key: "stamps", label: "تمبر", href: "/admin/stamps", newHref: "/admin/stamps/new", icon: Stamp, accent: "bg-pink-600 text-white shadow-md shadow-pink-600/30", bar: "#DB2777" },
  { key: "tasbih", label: "تسبیح", href: "/admin/tasbih", newHref: "/admin/tasbih/new", icon: CircleDot, accent: "bg-teal-600 text-white shadow-md shadow-teal-600/30", bar: "#0D9488" },
];

const listFetchers: Record<
  CollectionKey,
  (params: { page: number; pageSize: number; ordering?: string }) => Promise<{
    count: number;
    results: { id: number; name?: string; title?: string; created_at?: string; primary_image?: unknown; primary_image_url?: unknown }[];
  }>
> = {
  medals: (p) => getMedals(p) as never,
  coins: (p) => getCoins(p) as never,
  banknotes: (p) => getBanknotes(p) as never,
  antiques: (p) => getAntiques(p) as never,
  knives: (p) => getKnives(p) as never,
  rings: (p) => getRings(p) as never,
  seals: (p) => getSeals(p) as never,
  stamps: (p) => getStamps(p) as never,
  tasbih: (p) => getTasbihs(p) as never,
};

type RecentItem = {
  id: number;
  name: string;
  typeKey: CollectionKey;
  typeLabel: string;
  href: string;
  created_at?: string;
  image?: string | null;
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.username ||
    "کاربر";

  const collectionQueries = useQueries({
    queries: COLLECTIONS.map((c) => ({
      queryKey: ["dashboard", c.key],
      queryFn: () =>
        listFetchers[c.key]({ page: 1, pageSize: 6, ordering: "-created_at" }),
      staleTime: 60_000,
      retry: 1,
    })),
  });

  const categoriesQ = useQuery({
    queryKey: ["categories", "dashboard"],
    queryFn: () => getCategories({ page: 1, pageSize: 100 }),
    staleTime: 60_000,
  });

  const usersQ = useQuery({
    queryKey: ["users", "dashboard"],
    queryFn: () => getUsers({ page: 1 }),
    staleTime: 60_000,
  });

  const isLoading =
    collectionQueries.some((q) => q.isLoading) ||
    categoriesQ.isLoading ||
    usersQ.isLoading;

  const isFetching =
    collectionQueries.some((q) => q.isFetching) ||
    categoriesQ.isFetching ||
    usersQ.isFetching;

  const counts = useMemo(() => {
    const map = {
      medals: 0, coins: 0, banknotes: 0, antiques: 0, knives: 0,
      rings: 0, seals: 0, stamps: 0, tasbih: 0,
    } as Record<CollectionKey, number>;
    COLLECTIONS.forEach((c, i) => {
      map[c.key] = collectionQueries[i]?.data?.count ?? 0;
    });
    return map;
  }, [collectionQueries]);

  const totalItems = useMemo(
    () => Object.values(counts).reduce((a, b) => a + b, 0),
    [counts]
  );

  const totalCategories =
    categoriesQ.data?.count ?? categoriesQ.data?.results?.length ?? 0;
  const totalUsers =
    usersQ.data?.count ?? usersQ.data?.results?.length ?? 0;

  const chartData = useMemo(
    () =>
      COLLECTIONS.map((c) => ({
        key: c.key,
        label: c.label,
        value: counts[c.key],
        color: c.bar,
        href: c.href,
      })).filter((d) => d.value > 0),
    [counts]
  );

  const chartMax = Math.max(...chartData.map((d) => d.value), 1);

  const recentItems = useMemo(() => {
    const items: RecentItem[] = [];
    COLLECTIONS.forEach((c, i) => {
      const results = collectionQueries[i]?.data?.results ?? [];
      for (const r of results.slice(0, 3)) {
        items.push({
          id: r.id,
          name: r.name || r.title || `#${r.id}`,
          typeKey: c.key,
          typeLabel: c.label,
          href: `${c.href}/${r.id}`,
          created_at: r.created_at,
          image: resolvePrimaryImage(r),
        });
      }
    });
    items.sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      return tb - ta;
    });
    return items.slice(0, 10);
  }, [collectionQueries]);

  const todayLabel = (() => {
    const d = new Date();
    const weekday = new Intl.DateTimeFormat("fa-IR", { weekday: "long" }).format(d);
    const day = new Intl.DateTimeFormat("fa-IR", { day: "numeric" }).format(d);
    const month = new Intl.DateTimeFormat("fa-IR", { month: "long" }).format(d);
    const year = new Intl.DateTimeFormat("fa-IR", { year: "numeric" }).format(d);
    return `${weekday}، ${day} ${month} ${year}`;
  })();

  const refetchAll = () => {
    collectionQueries.forEach((q) => q.refetch());
    categoriesQ.refetch();
    usersQ.refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const anyError = collectionQueries.every((q) => q.isError);
  if (anyError && totalItems === 0) {
    return (
      <Alert variant="danger" title="خطا در بارگذاری داشبورد">
        اتصال به API برقرار نشد.
        <div className="mt-3">
          <Button type="button" variant="outline" size="sm" onClick={refetchAll}>تلاش مجدد</Button>
        </div>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-bl from-[#43131B] via-[#5a1822] to-[#2a0f14] p-6 text-[#F5F2EA] shadow-lg sm:p-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 90% 20%, rgba(110,31,42,0.55), transparent 55%)",
          }}
        />
        <div className="relative z-[1] flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-rose-200/90">{todayLabel}</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              سلام، {displayName}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">
              نمای کلی مجموعه آثار ناصر صلب — همه دسته‌بندی‌ها، آمار و آخرین ثبت‌ها.
            </p>
            <div className="mt-5 flex flex-wrap gap-4 text-sm">
              <div className="rounded-xl bg-white/5 px-4 py-2.5 backdrop-blur">
                <p className="text-xs text-white/60">کل آثار</p>
                <p className="mt-0.5 text-xl font-semibold tabular-nums text-rose-200">{formatNumber(totalItems)}</p>
              </div>
              <div className="rounded-xl bg-white/5 px-4 py-2.5 backdrop-blur">
                <p className="text-xs text-white/60">دسته‌بندی‌ها</p>
                <p className="mt-0.5 text-xl font-semibold tabular-nums">{formatNumber(totalCategories)}</p>
              </div>
              <div className="rounded-xl bg-white/5 px-4 py-2.5 backdrop-blur">
                <p className="text-xs text-white/60">کاربران</p>
                <p className="mt-0.5 text-xl font-semibold tabular-nums">{formatNumber(totalUsers)}</p>
              </div>
              <div className="rounded-xl bg-white/5 px-4 py-2.5 backdrop-blur">
                <p className="text-xs text-white/60">انواع مجموعه</p>
                <p className="mt-0.5 text-xl font-semibold tabular-nums">{formatNumber(COLLECTIONS.length)}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" className="border-white/20 bg-white/5 text-[#F5F2EA] hover:bg-white/10" onClick={refetchAll} disabled={isFetching}>
              <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
              به‌روزرسانی
            </Button>
            <Button asChild size="sm" className="bg-primary text-white hover:bg-primary-accent">
              <Link href="/museum">
                <Landmark className="size-4" />
                نمای عمومی
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="size-5 text-primary" />
            <h2 className="text-section-title">آمار مجموعه‌ها</h2>
          </div>
          <p className="text-xs text-text-muted">{formatNumber(totalItems)} اثر در {formatNumber(COLLECTIONS.length)} دسته</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          {COLLECTIONS.map((c) => {
            const Icon = c.icon;
            return (
              <Link key={c.key} href={c.href} className="group relative overflow-hidden rounded-xl border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm text-text-muted">{c.label}</p>
                    <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-text">{formatNumber(counts[c.key])}</p>
                  </div>
                  <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-110", c.accent)}>
                    <Icon className="size-5" />
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-text-subtle">
                  <span>مشاهده فهرست</span>
                  <ArrowUpLeft className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm lg:col-span-2">
          <div className="mb-5 flex items-center gap-2">
            <TrendingUp className="size-5 text-primary" />
            <h2 className="text-section-title">توزیع آثار در دسته‌ها</h2>
          </div>
          {chartData.length === 0 ? (
            <p className="py-12 text-center text-sm text-text-muted">هنوز اثری ثبت نشده است.</p>
          ) : (
            <div className="space-y-3">
              {chartData.map((d) => {
                const pct = Math.round((d.value / chartMax) * 100);
                return (
                  <Link key={d.key} href={d.href} className="group block rounded-lg px-1 py-0.5 transition-colors hover:bg-surface-muted/60">
                    <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                      <span className="font-medium text-text">{d.label}</span>
                      <span className="tabular-nums text-text-muted">{formatNumber(d.value)}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-surface-muted">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(pct, 4)}%`, background: d.color }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Plus className="size-5 text-primary" />
            <h2 className="text-section-title">ثبت سریع</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {COLLECTIONS.map((c) => {
              const Icon = c.icon;
              return (
                <Link key={c.key} href={c.newHref} className="flex items-center gap-2 rounded-lg border border-border/80 bg-surface-muted/40 px-2.5 py-2.5 text-xs font-medium text-text transition-all hover:border-primary/30 hover:bg-primary/5">
                  <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", c.accent)}>
                    <Icon className="size-3.5" />
                  </span>
                  <span className="truncate">افزودن {c.label}</span>
                </Link>
              );
            })}
          </div>
          <div className="mt-4 space-y-2 border-t border-border pt-4">
            <Link href="/admin/categories" className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-text-muted transition-colors hover:bg-surface-muted hover:text-text">
              <FolderOpen className="size-4" /> مدیریت دسته‌بندی‌ها
            </Link>
            <Link href="/admin/users" className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-text-muted transition-colors hover:bg-surface-muted hover:text-text">
              <Users className="size-4" /> مدیریت کاربران
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-section-title">آخرین آثار ثبت‌شده</h2>
          <span className="text-xs text-text-muted">از همه دسته‌بندی‌ها</span>
        </div>
        {recentItems.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-text">هنوز اثری ثبت نشده</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {recentItems.map((item) => {
              const meta = COLLECTIONS.find((c) => c.key === item.typeKey);
              const Icon = meta?.icon ?? Package;
              return (
                <li key={`${item.typeKey}-${item.id}`}>
                  <Link href={item.href} className="flex items-center gap-3 py-3 transition-colors hover:bg-surface-muted/50">
                    <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-muted">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt="" className="size-full object-cover" />
                      ) : (
                        <Icon className="size-4 text-text-subtle" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-text">{item.name}</p>
                      <p className="mt-0.5 text-xs text-text-muted">
                        {item.typeLabel}{item.created_at ? ` · ${formatDate(item.created_at)}` : ""}
                      </p>
                    </div>
                    <ArrowUpLeft className="size-4 shrink-0 text-text-subtle" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {(categoriesQ.data?.results?.length ?? 0) > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-section-title">دسته‌بندی‌ها</h2>
            <Link href="/admin/categories" className="text-xs font-medium text-primary hover:underline">مشاهده همه</Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {(categoriesQ.data?.results ?? []).slice(0, 8).map((c) => (
              <Link key={c.id} href="/admin/categories" className="rounded-xl border border-border bg-surface-muted/30 px-4 py-3 transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-sm">
                <p className="font-medium text-text">{c.name}</p>
                <p className="mt-1 line-clamp-1 text-xs text-text-muted">{c.description || "بدون توضیح"}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
