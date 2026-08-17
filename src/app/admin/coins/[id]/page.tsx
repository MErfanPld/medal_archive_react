"use client";

import { use, useRef, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Pencil, Coins, Upload, Trash2, ImageOff } from "lucide-react";
import {
  getCoinById,
  getCoinImages,
  uploadCoinImage,
  deleteCoinImage,
} from "@/lib/data/coins";
import { formatNumber, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";
import { ApiError } from "@/lib/api/client";
import {
  authenticityLabel,
  authenticityVariant,
  qualityLabel,
  coinItemTypeLabel,
  coinImageTypeOptions,
} from "@/lib/coin-labels";

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-caption">{label}</dt>
      <dd className="mt-0.5 text-sm text-text">
        {value === null || value === undefined || value === "" ? "—" : String(value)}
      </dd>
    </div>
  );
}

export default function CoinDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const coinId = Number(id);
  const toast = useToast();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [deleteImageId, setDeleteImageId] = useState<number | null>(null);
  const [imageType, setImageType] = useState("front");
  const canUpdate = useAuthStore((s) => s.hasPermission(PERMISSIONS.COINS_UPDATE));

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
      toast.success("تصویر اضافه شد");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "خطا در آپلود");
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
      toast.error(err instanceof ApiError ? err.message : "خطا در حذف تصویر");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !coin) {
    return (
      <Alert variant="danger">
        قلم یافت نشد.{" "}
        <Link href="/admin/coins" className="underline">بازگشت به لیست</Link>
      </Alert>
    );
  }

  const primary = coin.primary_image_url || coin.primary_image || null;
  const images = imagesQ.data?.results ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/coins" className="mb-2 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text">
            <ArrowRight className="size-4" />
            بازگشت به لیست
          </Link>
          <h1 className="text-page-title">{coin.name}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="outline">{coinItemTypeLabel(coin.item_type)}</Badge>
            <Badge variant={authenticityVariant(coin.authenticity)}>{authenticityLabel(coin.authenticity)}</Badge>
            {coin.is_proof && <Badge variant="primary">Proof</Badge>}
            {coin.is_commemorative && <Badge>یادبود</Badge>}
            {coin.is_active === false && <Badge variant="danger">غیرفعال</Badge>}
          </div>
        </div>
        {canUpdate && (
          <Button asChild>
            <Link href={`/admin/coins/${coin.id}/edit`}>
              <Pencil className="size-4" />
              ویرایش
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card>
          <CardContent className="flex min-h-[220px] items-center justify-center p-4">
            {primary && String(primary).length > 2 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={String(primary)} alt={coin.name} className="max-h-64 w-full rounded-lg object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-text-subtle">
                <Coins className="size-12" />
                <span className="text-sm">بدون تصویر اصلی</span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>شناسایی</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid gap-3 sm:grid-cols-2">
                <Field label="کشور" value={coin.country} />
                <Field label="سال" value={coin.year} />
                <Field label="سال هجری" value={coin.year_hijri} />
                <Field label="دوره" value={coin.historical_period} />
                <Field label="حاکم" value={coin.reign_or_ruler} />
                <Field label="دسته" value={coin.category_detail?.name || coin.category_name || null} />
                <Field label="کاتالوگ" value={coin.catalog_number} />
                <Field label="سریال" value={coin.serial_number} />
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>پولی و فیزیکی</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid gap-3 sm:grid-cols-2">
                <Field label="ارزش اسمی" value={coin.face_value} />
                <Field label="فرقه" value={coin.denomination} />
                <Field label="ارز" value={coin.currency_name} />
                <Field label="جنس" value={coin.material} />
                <Field label="عیار" value={coin.purity} />
                <Field label="وزن" value={coin.weight} />
                <Field label="قطر" value={coin.diameter} />
                <Field label="Mint" value={coin.mint} />
                <Field label="کیفیت" value={qualityLabel(coin.quality)} />
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>خرید و ارزش</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid gap-3 sm:grid-cols-2">
                <Field label="تاریخ خرید" value={formatDate(coin.purchase_date)} />
                <Field label="محل خرید" value={coin.purchase_location} />
                <Field label="فروشنده" value={coin.seller} />
                <Field label="قیمت خرید" value={coin.purchase_price ? `${formatNumber(coin.purchase_price)} ${coin.purchase_currency || ""}` : null} />
                <Field label="ارزش فعلی" value={coin.current_value ? formatNumber(coin.current_value) : null} />
                <Field label="آخرین ارزش‌گذاری" value={formatDate(coin.last_valuation_date)} />
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>نگهداری</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid gap-3 sm:grid-cols-2">
                <Field label="کابینت" value={coin.cabinet_number} />
                <Field label="کشو" value={coin.drawer_number} />
                <Field label="جعبه" value={coin.box_number} />
                <Field label="ثبت" value={formatDate(coin.created_at)} />
              </dl>
              {coin.notes && <p className="mt-4 text-sm text-text-muted whitespace-pre-wrap">{coin.notes}</p>}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>تصاویر</CardTitle>
          {canUpdate && (
            <div className="flex flex-wrap items-center gap-2">
              <select className="h-9 rounded-lg border border-border bg-surface px-2 text-sm" value={imageType} onChange={(e) => setImageType(e.target.value)}>
                {coinImageTypeOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
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
                  e.target.value = "";
                }}
              />
              <Button size="sm" variant="outline" loading={uploadMutation.isPending} onClick={() => fileRef.current?.click()}>
                <Upload className="size-4" />
                آپلود تصویر
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
                <li key={img.id} className="group relative overflow-hidden rounded-lg border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.image_url || img.image} alt={img.caption || ""} className="aspect-square w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/50 px-2 py-1 text-[10px] text-white">
                    <span>
                      {coinImageTypeOptions.find((o) => o.value === img.image_type)?.label || img.image_type}
                      {img.is_primary ? " · اصلی" : ""}
                    </span>
                    {canUpdate && (
                      <button type="button" className="rounded p-0.5 hover:bg-white/20" onClick={() => setDeleteImageId(img.id)} aria-label="حذف تصویر">
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

      <ConfirmDialog
        open={deleteImageId != null}
        onClose={() => setDeleteImageId(null)}
        title="حذف تصویر"
        description="این تصویر حذف شود؟"
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
