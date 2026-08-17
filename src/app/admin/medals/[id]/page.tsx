"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Pencil,
  MapPin,
  Calendar,
  Scale,
  CircleDot,
} from "lucide-react";
import {
  getMedalById,
  getMedalPurchases,
  getMedalValuations,
} from "@/lib/data/medals";
import { formatNumber, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { MedalMedia } from "@/components/admin/medal-media";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";

import {
  authenticityLabel,
  authenticityVariant,
  qualityLabel,
} from "@/lib/medal-labels";

export default function MedalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const medalId = Number(id);
  const canUpdate = useAuthStore((s) => s.hasPermission(PERMISSIONS.MEDALS_UPDATE));

  const { data: medal, isLoading, isError } = useQuery({
    queryKey: ["medal", medalId],
    queryFn: () => getMedalById(medalId),
    enabled: !Number.isNaN(medalId),
  });

  const { data: purchases } = useQuery({
    queryKey: ["medal-purchases", medalId],
    queryFn: () => getMedalPurchases(medalId),
    enabled: !!medal,
  });

  const { data: valuations } = useQuery({
    queryKey: ["medal-valuations", medalId],
    queryFn: () => getMedalValuations(medalId),
    enabled: !!medal,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !medal) {
    return (
      <Alert variant="danger">
        مدال یافت نشد.{" "}
        <Link href="/admin/medals" className="underline">
          بازگشت به لیست
        </Link>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/admin/medals"
            className="mb-2 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text"
          >
            <ArrowRight className="size-4" />
            بازگشت به لیست
          </Link>
          <h1 className="text-xl font-semibold text-text">{medal.name}</h1>
          <p className="mt-1 text-sm text-text-muted">
            {medal.catalog_number || "بدون شماره کاتالوگ"}
          </p>
        </div>
        {canUpdate && (
          <Link href={`/admin/medals/${medal.id}/edit`}>
            <Button variant="outline">
              <Pencil className="size-4" />
              ویرایش
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex aspect-square items-center justify-center bg-surface-muted p-6">
            <div className="flex size-32 items-center justify-center rounded-full bg-primary/10 text-primary-deep">
              <span className="text-4xl font-semibold">{medal.name.charAt(0)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>اطلاعات کلی</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="size-4 text-text-subtle" />
                <dt className="text-text-muted">کشور:</dt>
                <dd className="font-medium text-text">{medal.country || "—"}</dd>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="size-4 text-text-subtle" />
                <dt className="text-text-muted">سال:</dt>
                <dd className="font-medium tabular-nums text-text">{medal.year ?? "—"}</dd>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CircleDot className="size-4 text-text-subtle" />
                <dt className="text-text-muted">دسته:</dt>
                <dd className="font-medium text-text">{medal.category_detail?.name || "—"}</dd>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Scale className="size-4 text-text-subtle" />
                <dt className="text-text-muted">جنس:</dt>
                <dd className="font-medium text-text">{medal.material || "—"}</dd>
              </div>
              <div className="text-sm">
                <dt className="text-text-muted">اصالت</dt>
                <dd className="mt-1">
                  <Badge variant={authenticityVariant(medal.authenticity)}>
                    {authenticityLabel(medal.authenticity)}
                  </Badge>
                </dd>
              </div>
              <div className="text-sm">
                <dt className="text-text-muted">ارزش روز</dt>
                <dd className="mt-1 font-semibold tabular-nums text-text">
                  {medal.current_value
                    ? `${formatNumber(medal.current_value)} ${medal.purchase_currency || ""}`
                    : "—"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>مشخصات فیزیکی</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            {[
              ["وزن (گرم)", medal.weight],
              ["قطر (میلی‌متر)", medal.diameter],
              ["ضخامت", medal.thickness],
              ["شکل", medal.shape],
              ["رنگ", medal.color],
              ["لبه", medal.edge],
              ["کیفیت", qualityLabel(medal.quality, "") || null],
              ["وضعیت نگهداری", medal.preservation_condition],
              ["دوره تاریخی", medal.historical_period],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <dt className="text-text-muted">{label}</dt>
                <dd className="mt-0.5 font-medium text-text">{value || "—"}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>محل نگهداری</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-text-muted">کمد: </span>{medal.cabinet_number || "—"}</p>
            <p><span className="text-text-muted">کشو: </span>{medal.drawer_number || "—"}</p>
            <p><span className="text-text-muted">باکس: </span>{medal.box_number || "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>یادداشت</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-muted">{medal.notes || "یادداشتی ثبت نشده است."}</p>
          </CardContent>
        </Card>
      </div>

      <MedalMedia medalId={medalId} canEdit={canUpdate} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>سوابق خرید</CardTitle>
          </CardHeader>
          <CardContent>
            {!purchases?.length ? (
              <p className="text-sm text-text-muted">سابقه‌ای نیست.</p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {purchases.map((p) => (
                  <li key={p.id} className="flex justify-between py-2">
                    <span>{formatDate(p.purchase_date)} — {p.seller}</span>
                    <span className="tabular-nums">{p.price ? formatNumber(p.price) : "—"} {p.currency}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>سوابق ارزش‌گذاری</CardTitle>
          </CardHeader>
          <CardContent>
            {!valuations?.length ? (
              <p className="text-sm text-text-muted">سابقه‌ای نیست.</p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {valuations.map((v) => (
                  <li key={v.id} className="flex justify-between py-2">
                    <span>{formatDate(v.valuation_date)} — {v.source}</span>
                    <span className="tabular-nums">{formatNumber(v.value)} {v.currency}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
