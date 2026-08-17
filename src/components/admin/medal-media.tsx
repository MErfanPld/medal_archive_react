"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Image as ImageIcon,
  FileText,
  Trash2,
  Upload,
  Loader2,
  Star,
} from "lucide-react";
import {
  getMedalImages,
  getMedalFiles,
  uploadMedalImage,
  uploadMedalFile,
  deleteMedalImage,
  deleteMedalFile,
} from "@/lib/data/medals";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";
import { medalsApi } from "@/lib/api/medals";

const MAX_IMAGE_MB = 8;
const MAX_FILE_MB = 15;
const IMAGE_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const IMAGE_TYPE_OPTIONS = [
  { value: "front", label: "رو" },
  { value: "back", label: "پشت" },
  { value: "edge", label: "لبه" },
  { value: "packaging", label: "بسته‌بندی" },
  { value: "certificate", label: "گواهی" },
  { value: "invoice", label: "فاکتور" },
  { value: "other", label: "سایر" },
] as const;

const FILE_TYPE_OPTIONS = [
  { value: "certificate", label: "گواهی" },
  { value: "invoice", label: "فاکتور" },
  { value: "document", label: "سند" },
  { value: "other", label: "سایر" },
] as const;

function fileTypeLabel(value?: string | null) {
  if (!value) return "—";
  return FILE_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? String(value);
}

function imageTypeLabel(value?: string | null) {
  if (!value) return "—";
  return IMAGE_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? String(value);
}

interface MedalMediaProps {
  medalId: number;
  canEdit?: boolean;
}

export function MedalMedia({ medalId, canEdit = false }: MedalMediaProps) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deleteImageId, setDeleteImageId] = useState<number | null>(null);
  const [deleteFileId, setDeleteFileId] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string>("front");
  const [isPrimary, setIsPrimary] = useState(false);
  const [fileType, setFileType] = useState<string>("document");
  const [fileNotes, setFileNotes] = useState("");

  const { data: images = [], isLoading: imagesLoading } = useQuery({
    queryKey: ["medal-images", medalId],
    queryFn: () => getMedalImages(medalId),
  });

  const { data: files = [], isLoading: filesLoading } = useQuery({
    queryKey: ["medal-files", medalId],
    queryFn: () => getMedalFiles(medalId),
  });

  const uploadImageMutation = useMutation({
    mutationFn: (fd: FormData) => uploadMedalImage(medalId, fd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medal-images", medalId] });
      queryClient.invalidateQueries({ queryKey: ["medal", medalId] });
      toast.success("تصویر با موفقیت آپلود شد");
      setPreviewUrl(null);
      setIsPrimary(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "خطا در آپلود تصویر");
      setPreviewUrl(null);
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: (fd: FormData) => uploadMedalFile(medalId, fd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medal-files", medalId] });
      toast.success("فایل با موفقیت آپلود شد");
      setFileNotes("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "خطا در آپلود فایل");
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: (id: number) => deleteMedalImage(medalId, id),
    onSuccess: (ok) => {
      if (ok) {
        queryClient.invalidateQueries({ queryKey: ["medal-images", medalId] });
        queryClient.invalidateQueries({ queryKey: ["medal", medalId] });
        setDeleteImageId(null);
        toast.success("تصویر حذف شد");
      } else toast.error("حذف تصویر ناموفق بود");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "خطا در حذف تصویر");
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: (id: number) => deleteMedalFile(medalId, id),
    onSuccess: (ok) => {
      if (ok) {
        queryClient.invalidateQueries({ queryKey: ["medal-files", medalId] });
        setDeleteFileId(null);
        toast.success("فایل حذف شد");
      } else toast.error("حذف فایل ناموفق بود");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "خطا در حذف فایل");
    },
  });

  const setPrimaryMutation = useMutation({
    mutationFn: (imageId: number) => {
      const fd = new FormData();
      fd.append("is_primary", "true");
      return medalsApi.partialUpdateImage(medalId, imageId, fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medal-images", medalId] });
      queryClient.invalidateQueries({ queryKey: ["medal", medalId] });
      toast.success("تصویر اصلی به‌روز شد");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "خطا در تنظیم تصویر اصلی");
    },
  });

  const onImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!IMAGE_MIME.includes(file.type)) {
      toast.error("فقط فایل‌های JPEG، PNG، WebP یا GIF مجاز است");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      toast.error(`حداکثر حجم تصویر ${MAX_IMAGE_MB} مگابایت است`);
      e.target.value = "";
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    const fd = new FormData();
    fd.append("image", file);
    fd.append("image_type", imageType);
    if (isPrimary || images.length === 0) fd.append("is_primary", "true");
    uploadImageMutation.mutate(fd);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`حداکثر حجم فایل ${MAX_FILE_MB} مگابایت است`);
      e.target.value = "";
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("file_type", fileType);
    if (fileNotes.trim()) fd.append("notes", fileNotes.trim());
    uploadFileMutation.mutate(fd);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <ImageIcon className="size-4 text-primary" />
            تصاویر
          </CardTitle>
          {canEdit && (
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="h-9 rounded-lg border border-border bg-surface px-2 text-sm"
                value={imageType}
                onChange={(e) => setImageType(e.target.value)}
                aria-label="نوع تصویر"
              >
                {IMAGE_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <label className="flex items-center gap-1.5 text-xs text-text-muted">
                <input type="checkbox" className="size-3.5" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} />
                تصویر اصلی
              </label>
              <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={onImageSelect} />
              <Button size="sm" variant="outline" disabled={uploadImageMutation.isPending} onClick={() => imageInputRef.current?.click()}>
                {uploadImageMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                آپلود تصویر
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {previewUrl && uploadImageMutation.isPending && (
            <div className="mb-4 overflow-hidden rounded-lg border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="پیش‌نمایش" className="h-40 w-full object-cover opacity-70" />
            </div>
          )}
          {imagesLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : images.length === 0 ? (
            <EmptyState title="تصویری ثبت نشده" description="هنوز تصویری برای این مدال آپلود نشده است." icon={<ImageIcon className="size-8" />} />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {images.map((img) => {
                const src = img.image_url || img.image;
                return (
                  <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-surface-muted">
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={src} alt={img.caption || img.original_filename || "مدال"} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-text-muted">
                        <ImageIcon className="size-8" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1 text-[10px] text-white">
                      {imageTypeLabel(img.image_type)}
                      {img.is_primary ? " · اصلی" : ""}
                    </div>
                    {img.is_primary && (
                      <span className="absolute right-2 top-2 rounded bg-primary px-1.5 py-0.5 text-[10px] text-white">اصلی</span>
                    )}
                    {canEdit && (
                      <div className="absolute left-2 top-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
                        {!img.is_primary && (
                          <button type="button" className="rounded-md bg-black/50 p-1.5 text-white" title="تنظیم به‌عنوان اصلی" onClick={() => setPrimaryMutation.mutate(img.id)} disabled={setPrimaryMutation.isPending}>
                            <Star className="size-3.5" />
                          </button>
                        )}
                        <button type="button" className="rounded-md bg-black/50 p-1.5 text-white" onClick={() => setDeleteImageId(img.id)} aria-label="حذف تصویر">
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="size-4 text-primary" />
            فایل‌ها
          </CardTitle>
          {canEdit && (
            <div className="flex flex-wrap items-center gap-2">
              <select className="h-9 rounded-lg border border-border bg-surface px-2 text-sm" value={fileType} onChange={(e) => setFileType(e.target.value)} aria-label="نوع فایل">
                {FILE_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <input type="text" className="h-9 max-w-[10rem] rounded-lg border border-border bg-surface px-2 text-sm" placeholder="یادداشت (اختیاری)" value={fileNotes} onChange={(e) => setFileNotes(e.target.value)} />
              <input ref={fileInputRef} type="file" className="hidden" onChange={onFileSelect} />
              <Button size="sm" variant="outline" disabled={uploadFileMutation.isPending} onClick={() => fileInputRef.current?.click()}>
                {uploadFileMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                آپلود فایل
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {filesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : files.length === 0 ? (
            <EmptyState title="فایلی ثبت نشده" description="هنوز فایلی برای این مدال آپلود نشده است." icon={<FileText className="size-8" />} />
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {files.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{f.original_filename || "فایل"}</p>
                    <p className="text-xs text-text-muted">
                      {fileTypeLabel(f.file_type)}
                      {f.file_size != null ? ` · ${(f.file_size / 1024).toFixed(1)} KB` : ""}
                      {f.notes ? ` · ${f.notes}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {(f.file_url || f.file) && (
                      <Button size="sm" variant="ghost" asChild>
                        <a href={f.file_url || f.file} target="_blank" rel="noopener noreferrer">مشاهده</a>
                      </Button>
                    )}
                    {canEdit && (
                      <button type="button" className="rounded-md p-1.5 text-text-muted hover:bg-danger-bg hover:text-danger" onClick={() => setDeleteFileId(f.id)} aria-label="حذف فایل">
                        <Trash2 className="size-4" />
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
        onConfirm={() => deleteImageId && deleteImageMutation.mutate(deleteImageId)}
        title="حذف تصویر"
        description="آیا از حذف این تصویر مطمئن هستید؟"
        confirmLabel="حذف"
        loading={deleteImageMutation.isPending}
        variant="danger"
      />

      <ConfirmDialog
        open={deleteFileId != null}
        onClose={() => setDeleteFileId(null)}
        onConfirm={() => deleteFileId && deleteFileMutation.mutate(deleteFileId)}
        title="حذف فایل"
        description="آیا از حذف این فایل مطمئن هستید؟"
        confirmLabel="حذف"
        loading={deleteFileMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
