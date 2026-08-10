"use client";

import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/lib/api/reports";
import { ApiError } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { Medal, Globe2, Calendar, BarChart3, RefreshCw } from "lucide-react";
import type { DashboardSummary } from "@/types/api";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="mb-3 h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-4 p-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-deep">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-sm text-text-muted">{title}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-text">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ListSection({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: unknown[];
  emptyLabel: string;
}) {
  if (!items?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-muted">{emptyLabel}</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {items.slice(0, 8).map((item, i) => {
            const row = item as Record<string, unknown>;
            const label =
              (row.name as string) ||
              (row.country as string) ||
              (row.label as string) ||
              (row.category as string) ||
              `مورد ${i + 1}`;
            const count = row.count ?? row.total ?? row.medals ?? row.value ?? null;
            return (
              <li key={i} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="truncate text-text">{String(label)}</span>
                {count !== null && count !== undefined && (
                  <span className="tabular-nums text-text-muted">{formatNumber(count as number | string)}</span>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function ValueByCurrency({ data }: { data: unknown[] }) {
  if (!data?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ارزش به تفکیک ارز</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-muted">داده‌ای ثبت نشده است.</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>ارزش به تفکیک ارز</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {data.map((item, i) => {
            const row = item as Record<string, unknown>;
            const currency = String(row.currency ?? row.code ?? "—");
            const total = row.total ?? row.value ?? row.amount ?? null;
            return (
              <li key={i} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="font-medium text-text">{currency}</span>
                <span className="tabular-nums text-text-muted">
                  {total !== null && total !== undefined ? formatNumber(total as number | string) : "—"}
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<DashboardSummary>({
    queryKey: ["reports", "dashboard"],
    queryFn: () => reportsApi.dashboard(),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-text">داشبورد</h1>
          <p className="mt-1 text-sm text-text-muted">خلاصه وضعیت آرشیو مدال</p>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  if (isError) {
    const message = error instanceof ApiError ? error.message : "خطا در دریافت اطلاعات داشبورد";
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold text-text">داشبورد</h1>
        <Alert variant="danger" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>{message}</span>
          <Button variant="outline" size="sm" onClick={() => refetch()} loading={isFetching}>
            <RefreshCw className="size-4" />
            تلاش مجدد
          </Button>
        </Alert>
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="داده‌ای برای داشبورد وجود ندارد"
        description="پس از ثبت مدال‌ها، آمار اینجا نمایش داده می‌شود."
      />
    );
  }

  const yearRange =
    data.oldest_year != null && data.newest_year != null
      ? `${formatNumber(data.oldest_year)} – ${formatNumber(data.newest_year)}`
      : data.newest_year != null
        ? formatNumber(data.newest_year)
        : "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-text">داشبورد</h1>
          <p className="mt-1 text-sm text-text-muted">خلاصه وضعیت آرشیو مدال</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} loading={isFetching}>
          <RefreshCw className="size-4" />
          بروزرسانی
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="تعداد مدال‌ها" value={formatNumber(data.total_medals)} icon={Medal} />
        <StatCard title="کشورها" value={formatNumber(data.countries)} icon={Globe2} />
        <StatCard title="بازه سال" value={yearRange} icon={Calendar} />
        <StatCard title="ارزهای ارزش‌گذاری" value={formatNumber(data.value_by_currency?.length ?? 0)} icon={BarChart3} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ValueByCurrency data={data.value_by_currency ?? []} />
        <ListSection title="مدال‌ها به تفکیک دسته" items={data.medals_by_category ?? []} emptyLabel="دسته‌بندی ثبت نشده است." />
        <ListSection title="برترین کشورها" items={data.medals_by_country_top ?? []} emptyLabel="داده‌ای برای کشورها وجود ندارد." />
      </div>
    </div>
  );
}
