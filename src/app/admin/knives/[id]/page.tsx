"use client";

import { use, useRef, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Pencil,
  Sword,
  Upload,
  Trash2,
  ImageOff,
} from "lucide-react";
import {
  getKnifeById,
  getKnifeImages,
  uploadKnifeImage,
  deleteKnifeImage,
} from "@/lib/data/knives";
import { formatNumber, formatDate, resolvePrimaryImage, resolveMediaUrl } from "@/lib/utils";
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
  knifeImageTypeOptions,
} from "@/lib/knife-labels";
import { KnifeFinance } from "@/components/admin/knife-finance";

function Field({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex justify-between gap-3 border-b border-border/60 py-2 text-sm last:border-0">
      <span className="shrink-0 text-text-muted">{label}</span>
      <span className="text-left text-text">{value}</span>
    </div>
  );
}

export default function KnifeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const knifeId = Number(id);
  const toast = useToast();
  const queryClient = useQueryClient();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canUpdate = hasPermission(PERMISSIONS.KNIVES_UPDATE);
  const fileRef = useRef<HTMLInputElement>(null);
  const [deleteImageId, setDeleteImageId] = useState<number | null>(null);

  const { data: knife, isLoading, isError } = useQuery({
    queryKey: ["knife", knifeId],
    queryFn: () => getKnifeById(knifeId),
    enabled: !Number.isNaN(knifeId),
  });

  const imagesQ = useQuery({
    queryKey: ["knife-images", knifeId],
    queryFn: () => getKnifeImages(knifeId),
    enabled: !Number.isNaN(knifeId),
  });

  const uploadMutation = useMutation({
    mutationFn: (fd: FormData) => uploadKnifeImage(knifeId, fd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knife-images", knifeId] });
      queryClient.invalidateQueries({ queryKey: ["knife", knifeId] });
      toast.success("تصویر افزوده شد");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "خطا در آپلود");
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: number) => deleteKnifeImage(knifeId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knife-images", knifeId] });
      queryClient.invalidateQueries({ queryKey: ["knife", knifeId] });
      setDeleteImageId(null);
      toast.success("تصویر حذف شد");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "خطا در حذف تصویر");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !knife) {
    return (
      <Alert variant="danger">
        چاقو یافت نشد.{" "}
        <Link href="/admin/knives" className="underline">
          بازگشت به لیست
        </Link>
      </Alert>
    );
  }

  const primary = resolvePrimaryImage(knife);
  const images = imagesQ.data?.results ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/admin/knives"
            className="mb-2 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text"
          >
            <ArrowRight className="size-4" />
            بازگشت به لیست
          </Link>
          <h1 className="text-page-title">{knife.name}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="outline">چاقو</Badge>
            <Badge variant={authenticityVariant(knife.authenticity)}>
              {authenticityLabel(knife.authenticity)}
            </Badge>
            {knife.is_active === false && (
              <Badge variant="danger">غیرفعال</Badge>
            )}
          </div>
        </div>
        {canUpdate && (
          <Button asChild>
            <Link href={`/admin/knives/${knife.id}/edit`}>
              <Pencil className="size-4" />
              ویرایش
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card>
          <CardContent className="flex min-h-[220px] items-center justify-center p-4">
            {primary ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={primary}
                alt={knife.name}
                className="max-h-64 w-full rounded-lg object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-text-subtle">
                <Sword className="size-12" />
                <span className="text-xs">بدون تصویر</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>مشخصات</CardTitle>
          </CardHeader>
          <CardContent>
            <Field label="کشور" value={knife.country} />
            <Field label="دوره تاریخی" value={knife.historical_period} />
            <Field label="سال" value={knife.year} />
            <Field label="سبک" value={knife.style} />
            <Field label="منشأ" value={knife.origin} />
            <Field label="سازنده" value={knife.maker} />
            <Field label="جنس تیغه" value={knife.material} />
            <Field label="طول تیغه" value={knife.blade_length} />
            <Field label="جنس دسته" value={knife.handle_material} />
            <Field label="ابعاد" value={knife.dimensions} />
            <Field label="کاتالوگ" value={knife.catalog_number} />
            <Field label="کیفیت" value={qualityLabel(knife.quality)} />
            <Field
              label="ارزش فعلی"
              value={
                knife.current_value ? formatNumber(knife.current_value) : null
              }
            />
            <Field label="تاریخ ایجاد" value={formatDate(knife.created_at)} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>تصاویر</CardTitle>
          {canUpdate && (
            <>
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
                  fd.append("image_type", "front");
                  fd.append("is_primary", images.length === 0 ? "true" : "false");
                  uploadMutation.mutate(fd);
                  e.target.value = "";
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
            </>
          )}
        </CardHeader>
        <CardContent>
          {imagesQ.isLoading ? (
            <Skeleton className="h-32 w-full" />
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
                    src={resolveMediaUrl(img.image_url || img.image) || undefined}
                    alt={img.caption || ""}
                    className="aspect-square w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/50 px-2 py-1 text-[10px] text-white">
                    <span>
                      {knifeImageTypeOptions.find((o) => o.value === img.image_type)?.label ||
                        img.image_type}
                      {img.is_primary ? " · اصلی" : ""}
                    </span>
                    {canUpdate && (
                      <button
                        type="button"
                        className="rounded p-0.5 hover:bg-white/20"
                        onClick={() => setDeleteImageId(img.id)}
                        aria-label="حذف"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <KnifeFinance knifeId={knifeId} canEdit={canUpdate} />

      <ConfirmDialog
        open={deleteImageId !== null}
        onClose={() => setDeleteImageId(null)}
        title="حذف تصویر"
        description="آیا از حذف این تصویر مطمئن هستید؟"
        confirmLabel="حذف"
        onConfirm={async () => {
          if (deleteImageId == null) return;
          await deleteImageMutation.mutateAsync(deleteImageId);
        }}
        loading={deleteImageMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
