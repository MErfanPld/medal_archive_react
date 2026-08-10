"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, FolderOpen } from "lucide-react";
import { getCategories, deleteCategory } from "@/lib/data/categories";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canCreate = hasPermission(PERMISSIONS.CATEGORIES_CREATE);
  const canUpdate = hasPermission(PERMISSIONS.CATEGORIES_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.CATEGORIES_DELETE);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["categories", page, search],
    queryFn: () => getCategories({ page, search: search || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDeleteId(null);
    },
  });

  const items = data?.results ?? [];
  const total = data?.count ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-text">دسته‌بندی‌ها</h1>
          <p className="mt-1 text-sm text-text-muted">مدیریت دسته‌های مدال</p>
        </div>
        {canCreate && (
          <Link href="/admin/categories/new">
            <Button><Plus className="size-4" />دسته جدید</Button>
          </Link>
        )}
      </div>

      <Card>
        <CardContent className="flex gap-2 p-4">
          <form
            className="flex flex-1 gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(searchInput);
              setPage(1);
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-subtle" />
              <Input
                placeholder="جستجوی دسته…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pr-9"
              />
            </div>
            <Button type="submit" variant="secondary">جستجو</Button>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <Alert variant="danger" className="flex justify-between">
          <span>خطا در بارگذاری</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>تلاش مجدد</Button>
        </Alert>
      ) : items.length === 0 ? (
        <EmptyState
          title="دسته‌ای یافت نشد"
          description="هنوز دسته‌بندی‌ای ثبت نشده است."
          icon={<FolderOpen className="size-10" />}
          action={
            canCreate ? (
              <Link href="/admin/categories/new">
                <Button><Plus className="size-4" />افزودن دسته</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/50 text-right text-text-muted">
                  <th className="px-4 py-3 font-medium">نام</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">نامک</th>
                  <th className="px-4 py-3 font-medium">وضعیت</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">تاریخ</th>
                  <th className="px-4 py-3 font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface-muted/30">
                    <td className="px-4 py-3">
                      <Link href={`/admin/categories/${c.id}`} className="font-medium text-text hover:text-primary">
                        {c.name}
                      </Link>
                      {c.description && (
                        <p className="line-clamp-1 text-xs text-text-subtle">{c.description}</p>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-text-muted sm:table-cell">{c.slug}</td>
                    <td className="px-4 py-3">
                      <Badge variant={c.is_active ? "success" : "default"}>
                        {c.is_active ? "فعال" : "غیرفعال"}
                      </Badge>
                    </td>
                    <td className="hidden px-4 py-3 text-text-muted md:table-cell">
                      {formatDate(c.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {canUpdate && (
                          <Link href={`/admin/categories/${c.id}/edit`} className="rounded-md p-1.5 text-text-muted hover:bg-surface-muted" aria-label="ویرایش">
                            <Pencil className="size-4" />
                          </Link>
                        )}
                        {canDelete && (
                          <button type="button" className="rounded-md p-1.5 text-text-muted hover:bg-danger-bg hover:text-danger" onClick={() => setDeleteId(c.id)} aria-label="حذف">
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageSize={20} total={total} onPageChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={deleteId != null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="حذف دسته‌بندی"
        description="آیا از حذف این دسته مطمئن هستید؟"
        confirmLabel="حذف"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
