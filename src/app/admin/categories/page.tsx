"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, FolderOpen, Eye } from "lucide-react";
import {
  ListFilters,
  FilterSearchField,
  FilterSelect,
} from "@/components/admin/list-filters";
import { getCategories, deleteCategory } from "@/lib/data/categories";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";
import { ApiError } from "@/lib/api/client";

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canCreate = hasPermission(PERMISSIONS.CATEGORIES_CREATE);
  const canUpdate = hasPermission(PERMISSIONS.CATEGORIES_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.CATEGORIES_DELETE);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<string>("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const isActive =
    status === "active" ? true : status === "inactive" ? false : undefined;

  const { data, isLoading, isError, refetch, error } = useQuery({
    queryKey: ["categories", page, search, isActive],
    queryFn: () =>
      getCategories({
        page,
        search: search || undefined,
        is_active: isActive,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: (ok) => {
      if (ok) {
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        setDeleteId(null);
        toast.success("دسته‌بندی با موفقیت حذف شد");
      } else {
        toast.error("حذف دسته‌بندی ناموفق بود");
      }
    },
    onError: (err) => {
      const msg =
        err instanceof ApiError
          ? err.message
          : "خطا در حذف دسته‌بندی. لطفاً دوباره تلاش کنید.";
      toast.error(msg);
    },
  });

  const items = data?.results ?? [];
  const total = data?.count ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-page-title">دسته‌بندی‌ها</h1>
          <p className="mt-1 text-caption">
            مدیریت و سازمان‌دهی دسته‌بندی‌های مدال‌ها
          </p>
        </div>
        {canCreate && (
          <Link href="/admin/categories/new">
            <Button>
              <Plus className="size-4" />
              افزودن دسته‌بندی
            </Button>
          </Link>
        )}
      </div>

      <ListFilters>
        <FilterSearchField
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={() => {
            setSearch(searchInput.trim());
            setPage(1);
          }}
          placeholder="جستجو در نام، نامک یا توضیحات…"
        />
        <FilterSelect
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
          options={[
            { value: "active", label: "فعال" },
            { value: "inactive", label: "غیرفعال" },
          ]}
          allLabel="همه وضعیت‌ها"
          aria-label="فیلتر وضعیت"
        />
      </ListFilters>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <Alert variant="danger" className="flex flex-wrap items-center justify-between gap-2">
          <span>
            {error instanceof ApiError
              ? error.message
              : "خطا در بارگذاری دسته‌بندی‌ها"}
          </span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            تلاش مجدد
          </Button>
        </Alert>
      ) : items.length === 0 ? (
        <EmptyState
          title="هنوز دسته‌بندی‌ای ایجاد نشده است"
          description="برای سازمان‌دهی مدال‌ها، اولین دسته‌بندی را بسازید."
          icon={<FolderOpen className="size-10" />}
          action={
            canCreate ? (
              <Link href="/admin/categories/new">
                <Button>
                  <Plus className="size-4" />
                  ایجاد اولین دسته‌بندی
                </Button>
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
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">
                    نامک
                  </th>
                  <th className="px-4 py-3 font-medium">وضعیت</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">
                    تاریخ ایجاد
                  </th>
                  <th className="px-4 py-3 font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border last:border-0 hover:bg-surface-muted/30"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/categories/${c.id}`}
                        className="font-medium text-text hover:text-primary"
                      >
                        {c.name}
                      </Link>
                      {c.description && (
                        <p className="line-clamp-1 text-xs text-text-subtle">
                          {c.description}
                        </p>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-text-muted sm:table-cell">
                      {c.slug || "—"}
                    </td>
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
                        <Link
                          href={`/admin/categories/${c.id}`}
                          className="rounded-md p-1.5 text-text-muted hover:bg-surface-muted"
                          aria-label="مشاهده"
                        >
                          <Eye className="size-4" />
                        </Link>
                        {canUpdate && (
                          <Link
                            href={`/admin/categories/${c.id}/edit`}
                            className="rounded-md p-1.5 text-text-muted hover:bg-surface-muted"
                            aria-label="ویرایش"
                          >
                            <Pencil className="size-4" />
                          </Link>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            className="rounded-md p-1.5 text-text-muted hover:bg-danger-bg hover:text-danger"
                            onClick={() => setDeleteId(c.id)}
                            aria-label="حذف"
                          >
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

          <div className="grid gap-3 sm:hidden">
            {items.map((c) => (
              <Card key={c.id}>
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/admin/categories/${c.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {c.name}
                    </Link>
                    <Badge variant={c.is_active ? "success" : "default"}>
                      {c.is_active ? "فعال" : "غیرفعال"}
                    </Badge>
                  </div>
                  {c.description && (
                    <p className="text-xs text-text-muted line-clamp-2">
                      {c.description}
                    </p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/categories/${c.id}`}>مشاهده</Link>
                    </Button>
                    {canUpdate && (
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/admin/categories/${c.id}/edit`}>
                          ویرایش
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Pagination
            page={page}
            pageSize={20}
            total={total}
            onPageChange={setPage}
          />
        </>
      )}

      <ConfirmDialog
        open={deleteId != null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="حذف دسته‌بندی"
        description="آیا از حذف این دسته‌بندی مطمئن هستید؟ مدال‌های مرتبط معمولاً از دسته جدا می‌شوند."
        confirmLabel="حذف"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
