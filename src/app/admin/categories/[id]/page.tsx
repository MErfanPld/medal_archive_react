"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, ArrowRight } from "lucide-react";
import { getCategoryById, deleteCategory } from "@/lib/data/categories";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";
import { useState } from "react";

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const categoryId = Number(params.id);
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canUpdate = hasPermission(PERMISSIONS.CATEGORIES_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.CATEGORIES_DELETE);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: category, isLoading, isError } = useQuery({
    queryKey: ["category", categoryId],
    queryFn: () => getCategoryById(categoryId),
    enabled: Number.isFinite(categoryId),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      router.push("/admin/categories");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !category) {
    return (
      <Alert variant="danger" title="یافت نشد">
        دسته‌بندی مورد نظر وجود ندارد.
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/admin/categories"
            className="mb-2 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text"
          >
            <ArrowRight className="size-4" />
            بازگشت
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-text">{category.name}</h1>
            <Badge variant={category.is_active ? "success" : "default"}>
              {category.is_active ? "فعال" : "غیرفعال"}
            </Badge>
          </div>
          {category.slug && (
            <p className="mt-1 font-mono text-sm text-text-subtle">
              {category.slug}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {canUpdate && (
            <Link href={`/admin/categories/${category.id}/edit`}>
              <Button variant="outline">
                <Pencil className="size-4" />
                ویرایش
              </Button>
            </Link>
          )}
          {canDelete && (
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="size-4" />
              حذف
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>جزئیات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="text-text-muted">توضیحات</p>
            <p className="mt-1 text-text">
              {category.description || "—"}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-text-muted">تاریخ ایجاد</p>
              <p className="mt-1">{formatDate(category.created_at)}</p>
            </div>
            <div>
              <p className="text-text-muted">آخرین به‌روزرسانی</p>
              <p className="mt-1">{formatDate(category.updated_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="حذف دسته‌بندی"
        description="آیا از حذف این دسته‌بندی مطمئن هستید؟"
        confirmLabel="حذف"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  );
}
