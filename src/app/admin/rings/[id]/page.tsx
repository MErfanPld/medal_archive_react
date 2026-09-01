"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Pencil, Gem } from "lucide-react";
import { getRingById } from "@/lib/data/rings";
import { formatNumber, formatDate, resolvePrimaryImage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";
import { authenticityLabel, qualityLabel } from "@/lib/ring-labels";

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex justify-between gap-3 border-b border-border/60 py-2 text-sm last:border-0">
      <span className="shrink-0 text-text-muted">{label}</span>
      <span className="text-left text-text">{value}</span>
    </div>
  );
}

export default function RingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const ringId = Number(id);
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canUpdate = hasPermission(PERMISSIONS.RINGS_UPDATE);

  const { data: item, isLoading, isError } = useQuery({
    queryKey: ["ring", ringId],
    queryFn: () => getRingById(ringId),
    enabled: !Number.isNaN(ringId),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !item) {
    return (
      <Alert variant="danger">
        انگشتر یافت نشد.{" "}
        <Link href="/admin/rings" className="underline">بازگشت</Link>
      </Alert>
    );
  }

  const primary = resolvePrimaryImage(item);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/rings"><ArrowRight className="size-5" /></Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-text">{item.name}</h1>
            <p className="text-sm text-text-muted">انگشتر · #{item.id}</p>
          </div>
        </div>
        {canUpdate && (
          <Button asChild>
            <Link href={`/admin/rings/${item.id}/edit`}>
              <Pencil className="size-4" />
              ویرایش
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <div className="aspect-square bg-surface-muted">
            {primary ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={primary} alt={item.name} className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center text-text-subtle">
                <Gem className="size-12" />
              </div>
            )}
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>مشخصات</CardTitle></CardHeader>
          <CardContent>
            <Field label="کشور" value={item.country} />
            <Field label="سال" value={item.year} />
            <Field label="دوره" value={item.historical_period} />
            <Field label="جنس" value={item.material} />
            <Field label="سایز" value={item.ring_size} />
            <Field label="نگین" value={item.gemstone} />
            <Field label="ابعاد" value={item.dimensions} />
            <Field label="وزن" value={item.weight} />
            <Field label="سازنده" value={item.maker} />
            <Field label="کاتالوگ" value={item.catalog_number} />
            <Field label="اصالت" value={authenticityLabel(item.authenticity)} />
            <Field label="کیفیت" value={qualityLabel(item.quality)} />
            <Field label="ارزش فعلی" value={item.current_value ? formatNumber(item.current_value) : null} />
            <Field label="یادداشت" value={item.notes} />
            <Field label="ایجاد" value={formatDate(item.created_at)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
