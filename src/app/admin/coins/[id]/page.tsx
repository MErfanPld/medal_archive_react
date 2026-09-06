"use client";

import { use, useRef, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Pencil,
  Coins,
  Upload,
  Trash2,
  ImageOff,
} from "lucide-react";
import {
  getCoinById,
  getCoinImages,
  uploadCoinImage,
  deleteCoinImage,
} from "@/lib/data/coins";
import {
  formatNumber,
  resolvePrimaryImage,
  resolveMediaUrl,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { CoinFinance } from "@/components/admin/coin-finance";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";
import { getErrorMessage } from "@/lib/api/errors";
import {
  authenticityLabel,
  authenticityVariant,
  qualityLabel,
  coinItemTypeLabel,
  coinImageTypeOptions,
} from "@/lib/coin-labels";

export default function CoinDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const coinId = Number(id);
  const toast = useToast();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [deleteImageId, setDeleteImageId] = useState<number | null>(null);
  const [imageType, setImageType] = useState("front");

  const canUpdate = useAuthStore((s) =>
    s.hasPermission(PERMISSIONS.COINS_UPDATE)
  );

  const { data: coin, isLoading, isError } = useQuery({
    queryKey: ["coin", coinId],
    queryFn: () => getCoinById(coinId),
    enabled: !Number.isNaN(coinId),
  });

  const imagesQ = useQuery({
    queryKey: ["coin-images", coinId],
    queryFn: () => getCoinImages(coinId),
    enabled: !!coin,
  });

  const uploadMutation = useMutation({
    mutationFn: (form: FormData) => uploadCoinImage(coinId, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coin-images", coinId] });
      queryClient.invalidateQueries({ queryKey: ["coin", coinId] });
      toast.success("تصویر افزوده شد");
      if (fileRef.current) fileRef.current.value = "";
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "خطا در آپلود تصویر"));
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: number) => deleteCoinImage(coinId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coin-images", coinId] });
      queryClient.invalidateQueries({ queryKey: ["coin", coinId] });
      setDeleteImageId(null);
      toast.success("تصویر حذف شد");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "خطا در حذف تصویر"));
    },
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

  if (isError || !coin) {
    return (
      <Alert variant="danger">
        سکه یافت نشد.{" "}
        <Link href="/admin/coins" className="underline">
          بازگشت به لیست
        </Link>
      </Alert>
    );
  }

  const primary = resolvePrimaryImage(coin);
  const images = imagesQ.data?.results ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/admin/coins"
            className="mb-2 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text"
          >
            <ArrowRight className="size-4" />
            بازگشت به لیست
          </Link>
          <h1 className="text-xl font-semibold text-text">{coin.name}</h1>
          <p className="mt-1 text-sm text-text-muted">
            {coin.catalog_number || "بدون شماره کاتالوگ"}
            {coin.country ? ` · ${coin.country}` : ""}
            {coin.year != null ? ` · ${coin.year}` : ""}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {coin.item_type && (
              <Badge variant="outline">{coinItemTypeLabel(coin.item_type)}</Badge>
            )}
            {coin.authenticity && (
              <Badge variant={authenticityVariant(coin.authenticity)}>
                {authenticityLabel(coin.authenticity)}
              </Badge>
            )}
            {coin.quality && (
              <Badge variant="default">{qualityLabel(coin.quality)}</Badge>
            )}
          </div>
        </div>
        {canUpdate && (
          <Button asChild>
            <Link href={`/admin/coins/${coinId}/edit`}>
              <Pencil className="size-4" />
              ویرایش
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex min-h-[220px] items-center justify-center p-4">
            {primary ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={primary}
                alt={coin.name}
                className="max-h-64 w-full rounded-lg object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-text-subtle">
                <Coins className="size-12" />
                <span className="text-xs">بدون تصویر</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>اطلاعات کلی</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              {[
                ["نوع", coinItemTypeLabel(coin.item_type)],
                ["کشور", coin.country],
                ["سال", coin.year],
                ["دوره تاریخی", coin.historical_period],
                ["حاکم / دوره", coin.reign_or_ruler],
                ["ارزش اسمی", coin.face_value],
                ["واحد", coin.denomination || coin.currency_name],
                ["جنس", coin.material],
                ["عیار", coin.purity],
                ["ضرابخانه", coin.mint],
                ["سازنده", coin.maker],
                ["شماره سریال", coin.serial_number],
                ["سری", coin.series],
                ["کاتالوگ", coin.catalog_number],
                [
                  "قیمت خرید",
                  coin.purchase_price
                    ? `${formatNumber(coin.purchase_price)} ${coin.purchase_currency || ""}`
                    : null,
                ],
                [
                  "ارزش فعلی",
                  coin.current_value
                    ? `${formatNumber(coin.current_value)} ${coin.purchase_currency || ""}`
                    : null,
                ],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <dt className="text-text-muted">{label}</dt>
                  <dd className="mt-0.5 font-medium text-text">
                    {value === null || value === undefined || value === ""
                      ? "—"
                      : String(value)}
                  </dd>
                </div>
              ))}
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
              ["وزن", coin.weight],
              ["قطر", coin.diameter],
              ["ضخامت", coin.thickness],
              ["شکل", coin.shape],
              ["لبه", coin.edge],
              ["رنگ", coin.color],
              ["کیفیت", qualityLabel(coin.quality, "") || null],
              ["وضعیت نگهداری", coin.preservation_condition],
              ["دوره تاریخی", coin.historical_period],
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
            <p>
              <span className="text-text-muted">کمد: </span>
              {coin.cabinet_number || "—"}
            </p>
            <p>
              <span className="text-text-muted">کشو: </span>
              {coin.drawer_number || "—"}
            </p>
            <p>
              <span className="text-text-muted">باکس: </span>
              {coin.box_number || "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>یادداشت</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-muted">
              {coin.notes || "یادداشتی ثبت نشده است."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle>تصاویر</CardTitle>
          {canUpdate && (
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="h-9 rounded-lg border border-border bg-surface px-2 text-sm"
                value={imageType}
                onChange={(e) => setImageType(e.target.value)}
              >
                {coinImageTypeOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const fd = new FormData();
                  fd.append("image", file);
                  fd.append("image_type", imageType);
                  fd.append("is_primary", images.length === 0 ? "true" : "false");
                  uploadMutation.mutate(fd);
                }}
              />
              <Button
                size="sm"
                variant="outline"
                loading={uploadMutation.isPending}
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="size-4" />
                افزودن تصویر
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {imagesQ.isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-text-subtle">
              <ImageOff className="size-8" />
              <p className="text-sm">تصویری ثبت نشده است</p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {images.map((img) => (
                <li
                  key={img.id}
                  className="group relative overflow-hidden rounded-lg border border-border"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      resolveMediaUrl(img.image_url || img.image) || undefined
                    }
                    alt={img.caption || ""}
                    className="aspect-square w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/50 px-2 py-1 text-[10px] text-white">
                    <span>
                      {coinImageTypeOptions.find(
                        (o) => o.value === img.image_type
                      )?.label || img.image_type}
                      {img.is_primary ? " · اصلی" : ""}
                    </span>
                    {canUpdate && (
                      <button
                        type="button"
                        className="rounded p-0.5 hover:bg-white/20"
                        onClick={() => setDeleteImageId(img.id)}
                        aria-label="حذف تصویر"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <CoinFinance coinId={coinId} canEdit={canUpdate} />

      <ConfirmDialog
        open={deleteImageId != null}
        onClose={() => setDeleteImageId(null)}
        title="حذف تصویر"
        description="آیا از حذف این تصویر مطمئن هستید؟"
        confirmLabel="حذف"
        variant="danger"
        loading={deleteImageMutation.isPending}
        onConfirm={() => {
          if (deleteImageId != null) deleteImageMutation.mutate(deleteImageId);
        }}
      />
    </div>
  );
}
