"use client";

import { use, useRef, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Pencil,
  CircleDot,
  Upload,
  Trash2,
  ImageOff,
} from "lucide-react";
import {
  getTasbihById,
  getTasbihImages,
  uploadTasbihImage,
  deleteTasbihImage,
} from "@/lib/data/tasbih";
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
  tasbihImageTypeOptions,
} from "@/lib/tasbih-labels";
import { TasbihFinance } from "@/components/admin/tasbih-finance";

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

export default function TasbihDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const tasbihId = Number(id);
  const toast = useToast();
  const queryClient = useQueryClient();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canUpdate = hasPermission(PERMISSIONS.TASBIH_UPDATE);
  const fileRef = useRef<HTMLInputElement>(null);
  const [deleteImageId, setDeleteImageId] = useState<number | null>(null);

  const { data: item, isLoading, isError } = useQuery({
    queryKey: ["tasbih", tasbihId],
    queryFn: () => getTasbihById(tasbihId),
    enabled: !Number.isNaN(tasbihId),
  });

  const imagesQ = useQuery({
    queryKey: ["tasbih-images", tasbihId],
    queryFn: () => getTasbihImages(tasbihId),
    enabled: !Number.isNaN(tasbihId),
  });

  const uploadMutation = useMutation({
    mutationFn: (fd: FormData) => uploadTasbihImage(tasbihId, fd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasbih-images", tasbihId] });
      queryClient.invalidateQueries({ queryKey: ["tasbih", tasbihId] });
      toast.success("تصویر افزوده شد");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "خطا در آپلود");
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: number) => deleteTasbihImage(tasbihId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasbih-images", tasbihId] });
      queryClient.invalidateQueries({ queryKey: ["tasbih", tasbihId] });
      setDeleteImageId(null);
      toast.success("تصویر حذف شد");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "خطا در حذف");
    },
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
        تسبیح یافت نشد.{" "}
        <Link href="/admin/tasbih" className="underline">
          بازگشت
        </Link>
      </Alert>
    );
  }

  const primary = resolvePrimaryImage(item);
  const images = imagesQ.data?.results ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/tasbih">
              <ArrowRight className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-text">{item.name}</h1>
            <p className="text-sm text-text-muted">تسبیح · #{item.id}</p>
          </div>
        </div>
        {canUpdate && (
          <Button asChild>
            <Link href={`/admin/tasbih/${item.id}/edit`}>
              <Pencil className="size-4" />
              ویرایش
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-1">
          <div className="flex aspect-square items-center justify-center bg-surface-muted">
            {primary ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={primary} alt="" className="h-full w-full object-cover" />
            ) : (
              <CircleDot className="size-16 text-text-subtle" />
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>مشخصات</CardTitle>
          </CardHeader>
          <CardContent>
            <Field label="کشور" value={item.country} />
            <Field label="سال" value={item.year} />
            <Field label="دوره" value={item.historical_period} />
            <Field label="جنس" value={item.material} />
            <Field label="تعداد دانه" value={item.bead_count} />
            <Field label="جنس دانه" value={item.bead_material} />
            <Field label="ابعاد" value={item.dimensions} />
            <Field label="وزن" value={item.weight} />
            <Field label="سازنده" value={item.maker} />
            <Field label="کاتالوگ" value={item.catalog_number} />
            <Field label="اصالت" value={authenticityLabel(item.authenticity)} />
            <Field label="کیفیت" value={qualityLabel(item.quality)} />
            <Field
              label="ارزش فعلی"
              value={item.current_value ? formatNumber(item.current_value) : null}
            />
            <Field label="یادداشت" value={item.notes} />
            <Field label="ایجاد" value={formatDate(item.created_at)} />
            {item.authenticity && (
              <div className="mt-3">
                <Badge variant={authenticityVariant(item.authenticity)}>
                  {authenticityLabel(item.authenticity)}
                </Badge>
              </div>
            )}
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
                  fd.append("image_type", "other");
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
                آپلود
              </Button>
            </>
          )}
        </CardHeader>
        <CardContent>
          {imagesQ.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : images.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-text-muted">
              <ImageOff className="size-4" /> تصویری ثبت نشده است.
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-3 md:grid-cols-4">
              {images.map((img) => {
                const src = resolveMediaUrl(img.image_url || img.image);
                return (
                  <li
                    key={img.id}
                    className="relative overflow-hidden rounded-lg border border-border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src || ""}
                      alt={img.caption || ""}
                      className="aspect-square w-full object-cover"
                    />
                    <div className="flex items-center justify-between gap-1 p-2 text-xs">
                      <span className="truncate text-text-muted">
                        {tasbihImageTypeOptions.find((o) => o.value === img.image_type)?.label ||
                          img.image_type ||
                          "—"}
                      </span>
                      {canUpdate && (
                        <button
                          type="button"
                          className="text-danger"
                          onClick={() => setDeleteImageId(img.id)}
                          aria-label="حذف"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <TasbihFinance tasbihId={tasbihId} canEdit={canUpdate} />

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
