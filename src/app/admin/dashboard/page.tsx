"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Medal,
  FolderOpen,
  Users,
  Image as ImageIcon,
  Plus,
  Landmark,
  RefreshCw,
  ArrowUpLeft,
  Calendar,
} from "lucide-react";
import { getMedals } from "@/lib/data/medals";
import { getCategories } from "@/lib/data/categories";
import { getUsers } from "@/lib/data/users";
import { authenticityLabel, authenticityVariant } from "@/lib/medal-labels";
import {
  formatNumber,
  formatDate,
  cn,
  resolvePrimaryImage,
} from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import type { Medal as MedalType, Category } from "@/types/api";

function KpiCard({
  title,
  value,
  icon: Icon,
  hint,
  accent,
  className,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
  accent?: string;
  className?: string;
}) {
  return (
    <div className={cn("kpi-card p-5", className)}>
      <div className="relative z-[1] flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-text-muted">{title}</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-text">
            {value}
          </p>
          {hint ? <p className="mt-2 text-xs text-text-subtle">{hint}</p> : null}
        </div>
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            accent ?? "bg-primary/10 text-primary-deep"
          )}
        >
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
    </div>
  );
}

function MiniBarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  if (!data.length) {
    return (
      <p className="py-10 text-center text-sm text-text-muted">
        داده‌ای برای نمودار وجود ندارد.
      </p>
    );
  }
  return (
    <div className="flex h-44 items-end gap-2 pt-4" dir="ltr">
      {data.map((d) => {
        const h = Math.max(8, Math.round((d.value / max) * 100));
        return (
          <div key={d.label} className="group flex flex-1 flex-col items-center gap-2">
            <span className="text-[10px] tabular-nums text-text-subtle opacity-0 transition-opacity group-hover:opacity-100">
              {d.value}
            </span>
            <div
              className="w-full max-w-[2rem] rounded-t-md bg-gradient-to-t from-primary-deep to-primary-accent/90 transition-all duration-300 group-hover:from-primary group-hover:to-primary-accent"
              style={{ height: `${h}%` }}
              title={`${d.label}: ${d.value}`}
            />
            <span className="max-w-full truncate text-[10px] text-text-muted">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let acc = 0;
  const stops = data.map((d) => {
    const start = (acc / total) * 100;
    acc += d.value;
    const end = (acc / total) * 100;
    return `${d.color} ${start}% ${end}%`;
  });
  if (!data.length) {
    return (
      <p className="py-10 text-center text-sm text-text-muted">
        دسته‌بندی ثبت نشده است.
      </p>
    );
  }
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <div
        className="size-36 shrink-0 rounded-full"
        style={{
          background: `conic-gradient(${stops.join(", ")})`,
          mask: "radial-gradient(circle, transparent 48%, black 49%)",
          WebkitMask: "radial-gradient(circle, transparent 48%, black 49%)",
        }}
        aria-hidden
      />
      <ul className="w-full space-y-2 text-sm">
        {data.map((d) => (
          <li key={d.label} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
              <span className="truncate text-text">{d.label}</span>
            </span>
            <span className="tabular-nums text-text-muted">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const DONUT_COLORS = [
  "#6E1F2A",
  "#9B3A49",
  "#C45A6A",
  "#43131B",
  "#B45309",
  "#2D6A4F",
  "#1E40AF",
  "#78716C",
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.username ||
    "کاربر";

  const medalsQ = useQuery({
    queryKey: ["medals", "dashboard"],
    queryFn: () => getMedals({ page: 1, pageSize: 100, ordering: "-created_at" }),
    staleTime: 60_000,
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

  const isLoading = medalsQ.isLoading || categoriesQ.isLoading || usersQ.isLoading;
  const isError = medalsQ.isError && categoriesQ.isError;
  const isFetching = medalsQ.isFetching || categoriesQ.isFetching || usersQ.isFetching;

  const medals = medalsQ.data?.results ?? [];
  const totalMedals = medalsQ.data?.count ?? medals.length;
  const categories = categoriesQ.data?.results ?? [];
  const totalCategories = categoriesQ.data?.count ?? categories.length;
  const totalUsers = usersQ.data?.count ?? usersQ.data?.results?.length ?? 0;

  const withImage = useMemo(
    () => medals.filter((m) => resolvePrimaryImage(m)).length,
    [medals]
  );

  const byYear = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of medals) {
      const y = m.year != null ? String(m.year) : "نامشخص";
      map.set(y, (map.get(y) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => {
        const na = Number(a.label);
        const nb = Number(b.label);
        if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
        return a.label.localeCompare(b.label, "fa");
      })
      .slice(-8);
  }, [medals]);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of medals) {
      const name =
        m.category_detail?.name ||
        (m as MedalType & { category_name?: string }).category_name ||
        "بدون دسته";
      map.set(name, (map.get(name) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([label, value], i) => ({
        label,
        value,
        color: DONUT_COLORS[i % DONUT_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [medals]);

  const recent = medals.slice(0, 6);

  const todayLabel = new Intl.DateTimeFormat("fa-IR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const refetchAll = () => {
    medalsQ.refetch();
    categoriesQ.refetch();
    usersQ.refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert
        variant="danger"
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <span>خطا در دریافت داده‌های داشبورد از سرور</span>
        <Button variant="outline" size="sm" onClick={refetchAll} loading={isFetching}>
          <RefreshCw className="size-4" />
          تلاش مجدد
        </Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <section className="hero-museum animate-fade-up relative p-6 sm:p-8 lg:p-10">
        <div className="relative z-[1] grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-medium text-white/70">{todayLabel}</p>
            <h1 className="mt-2 text-2xl font-semibold leading-snug tracking-tight text-white sm:text-3xl lg:text-[2rem]">
              خوش آمدید، {displayName}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
              نمای کلی مجموعه موزه و فعالیت‌های اخیر — مدال‌ها، دسته‌بندی‌ها و کاربران را از یک نقطه مدیریت کنید.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="bg-white text-primary-deep shadow-md hover:bg-white/95">
                <Link href="/admin/medals/new">
                  <Plus className="size-4" />
                  افزودن مدال
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/15 hover:text-white"
              >
                <Link href="/museum">
                  <Landmark className="size-4" />
                  مشاهده مجموعه
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative hidden justify-center lg:flex">
            <div className="relative flex size-40 items-center justify-center rounded-full border border-white/15 bg-white/10 shadow-[0_0_60px_-10px_rgba(255,255,255,0.35)] backdrop-blur-sm">
              <Medal className="size-16 text-white/90" strokeWidth={1.25} />
              <div className="absolute -left-4 top-6 size-16 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm" />
              <div className="absolute -bottom-2 -right-6 size-20 rounded-full border border-white/15 bg-white/5" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          className="animate-fade-up stagger-1"
          title="تعداد کل مدال‌ها"
          value={formatNumber(totalMedals)}
          icon={Medal}
          hint="از API مدال‌ها"
          accent="bg-primary/12 text-primary-deep"
        />
        <KpiCard
          className="animate-fade-up stagger-2"
          title="دسته‌بندی‌ها"
          value={formatNumber(totalCategories)}
          icon={FolderOpen}
          hint="ساختار مجموعه"
          accent="bg-amber-500/10 text-amber-800 dark:text-amber-300"
        />
        <KpiCard
          className="animate-fade-up stagger-3"
          title="کاربران"
          value={formatNumber(totalUsers)}
          icon={Users}
          hint="حساب‌های سامانه"
          accent="bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
        />
        <KpiCard
          className="animate-fade-up stagger-4"
          title="مدال با تصویر"
          value={formatNumber(withImage)}
          icon={ImageIcon}
          hint={`از ${formatNumber(medals.length)} نمونه بارگذاری‌شده`}
          accent="bg-sky-500/10 text-sky-800 dark:text-sky-300"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        <div className="card-premium animate-fade-up stagger-2 p-5 lg:col-span-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-section-title">توزیع بر اساس سال</h2>
              <p className="text-caption">از مدال‌های دریافتی API</p>
            </div>
            <Calendar className="size-4 text-text-subtle" />
          </div>
          <MiniBarChart data={byYear} />
        </div>
        <div className="card-premium animate-fade-up stagger-3 p-5 lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-section-title">توزیع دسته‌بندی</h2>
            <p className="text-caption">سهم هر دسته در نمونه فعلی</p>
          </div>
          <DonutChart data={byCategory} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        <div className="card-premium animate-fade-up p-5 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-section-title">آخرین مدال‌های ثبت‌شده</h2>
              <p className="text-caption">مرتب‌سازی بر اساس جدیدترین</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/medals">
                همه
                <ArrowUpLeft className="size-3.5" />
              </Link>
            </Button>
          </div>
          {recent.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-surface-muted/40 px-4 py-10 text-center">
              <p className="text-sm font-medium text-text">هنوز مدالی ثبت نشده</p>
              <p className="mt-1 text-caption">اولین مدال را به مجموعه اضافه کنید.</p>
              <Button className="mt-4" size="sm" asChild>
                <Link href="/admin/medals/new">
                  <Plus className="size-4" />
                  افزودن مدال
                </Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((m) => {
                const thumb = resolvePrimaryImage(m);
                return (
                  <li key={m.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="medal-thumb overflow-hidden">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumb}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <Medal className="size-4 text-text-subtle" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/medals/${m.id}`}
                        className="block truncate text-sm font-medium text-text hover:text-primary"
                      >
                        {m.name}
                      </Link>
                      <p className="truncate text-xs text-text-muted">
                        {[
                          m.category_detail?.name,
                          m.country,
                          m.year != null ? String(m.year) : null,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </p>
                    </div>
                    <Badge variant={authenticityVariant(m.authenticity)}>
                      {authenticityLabel(m.authenticity)}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="card-premium animate-fade-up stagger-2 p-5">
            <h2 className="text-section-title">اقدامات سریع</h2>
            <div className="mt-4 grid gap-2">
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/admin/medals/new">
                  <Plus className="size-4 text-primary" />
                  ثبت مدال جدید
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/admin/categories/new">
                  <FolderOpen className="size-4 text-primary" />
                  افزودن دسته‌بندی
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/admin/users/invite">
                  <Users className="size-4 text-primary" />
                  دعوت کاربر
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/museum">
                  <Landmark className="size-4 text-primary" />
                  باز کردن موزه
                </Link>
              </Button>
            </div>
          </div>

          <div className="card-premium animate-fade-up stagger-3 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-section-title">فعالیت اخیر</h2>
              <Button variant="ghost" size="sm" onClick={refetchAll} loading={isFetching}>
                <RefreshCw className="size-3.5" />
              </Button>
            </div>
            {recent.length === 0 ? (
              <p className="text-sm text-text-muted">فعالیتی ثبت نشده است.</p>
            ) : (
              <ol className="relative space-y-4 border-r border-border pr-4">
                {recent.slice(0, 5).map((m) => (
                  <li key={m.id} className="relative">
                    <span className="absolute -right-[1.15rem] top-1.5 size-2.5 rounded-full border-2 border-surface bg-primary" />
                    <p className="text-sm text-text">مدال «{m.name}» در فهرست</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-text-subtle">
                      <Calendar className="size-3" />
                      {formatDate(m.created_at) || "—"}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="card-premium animate-fade-up p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-section-title">نمای دسته‌بندی‌ها</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/categories">مدیریت</Link>
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.slice(0, 6).map((c: Category) => (
              <Link
                key={c.id}
                href={`/admin/categories/${c.id}`}
                className="rounded-xl border border-border bg-surface-muted/30 px-4 py-3 transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-sm"
              >
                <p className="font-medium text-text">{c.name}</p>
                <p className="mt-1 line-clamp-1 text-xs text-text-muted">
                  {c.description || "بدون توضیح"}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
