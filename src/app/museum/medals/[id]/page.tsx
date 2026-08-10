"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { getMuseumMedal } from "@/lib/data/medals";
import { formatNumber, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";

export default function MuseumMedalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const medalId = Number(id);

  const { data: medal, isLoading, isError } = useQuery({
    queryKey: ["museum-medal", medalId],
    queryFn: () => getMuseumMedal(medalId),
    enabled: !Number.isNaN(medalId),
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !medal) {
    return (
      <Alert variant="danger">
        مدال یافت نشد.{" "}
        <Link href="/museum/medals" className="underline">
          بازگشت
        </Link>
      </Alert>
    );
  }

  return (
    <article className="space-y-10">
      <Link
        href="/museum/medals"
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text"
      >
        <ArrowRight className="size-4" />
        بازگشت به مجموعه
      </Link>

      <header className="space-y-4 text-center">
        <p className="text-sm text-primary">{medal.category_detail?.name}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-primary-deep sm:text-4xl">
          {medal.name}
        </h1>
        <p className="text-lg text-text-muted">
          {medal.country}
          {medal.year ? ` · ${medal.year}` : ""}
          {medal.historical_period ? ` · ${medal.historical_period}` : ""}
        </p>
      </header>

      <div className="mx-auto flex aspect-[4/3] max-w-lg items-center justify-center rounded-2xl bg-surface-muted">
        <span className="text-7xl font-semibold text-primary/30">
          {medal.name.charAt(0)}
        </span>
      </div>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["جنس", medal.material],
          ["وزن", medal.weight ? `${medal.weight} گرم` : null],
          ["قطر", medal.diameter ? `${medal.diameter} میلی‌متر` : null],
          ["کیفیت", medal.quality],
          ["اصالت", medal.authenticity],
          ["مناسبت", medal.occasion],
          ["سازنده", medal.maker],
          ["ضرابخانه", medal.mint_or_manufacturer],
          ["شماره کاتالوگ", medal.catalog_number],
        ].map(([label, value]) =>
          value ? (
            <div key={String(label)} className="border-b border-border pb-3">
              <dt className="text-xs uppercase tracking-wide text-text-subtle">
                {label}
              </dt>
              <dd className="mt-1 text-sm font-medium text-text">{value}</dd>
            </div>
          ) : null
        )}
      </section>

      {medal.notes && (
        <Card>
          <CardHeader>
            <CardTitle>درباره این مدال</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-text-muted">{medal.notes}</p>
          </CardContent>
        </Card>
      )}

      {medal.valuation_records && medal.valuation_records.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>سوابق ارزش‌گذاری</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border text-sm">
              {medal.valuation_records.map((v) => (
                <li key={v.id} className="flex justify-between py-2">
                  <span>{formatDate(v.valuation_date)}</span>
                  <span className="font-medium tabular-nums">
                    {formatNumber(v.value)} {v.currency}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </article>
  );
}
