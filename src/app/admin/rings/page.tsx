"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Eye, Pencil, Trash2, Gem, ImageOff } from "lucide-react";
import {
  ListFilters,
  FilterSearchField,
  FilterSelect,
  FilterViewToggle,
} from "@/components/admin/list-filters";
import { getRings, deleteRing } from "@/lib/data/rings";
import { getCategories } from "@/lib/data/categories";
import { formatNumber, cn, resolvePrimaryImage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";
import {
  authenticityLabel,
  authenticityVariant,
  authenticityFilterOptions,
} from "@/lib/ring-labels";
import type { Ring } from "@/types/rings";

function RingThumb({ item }: { item: Ring }) {
  const src = resolvePrimaryImage(item);
  if (!src) {
    return (
      <div className="flex size-12 items-center justify-center rounded-lg bg-surface-muted text-text-subtle">
        <ImageOff className="size-5" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={item.name} className="size-12 rounded-lg object-cover" />
  );
}

export default function RingsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canCreate = hasPermission(PERMISSIONS.RINGS_CREATE);
  const canUpdate = hasPermission(PERMISSIONS.RINGS_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.RINGS_DELETE);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [authenticity, setAuthenticity] = useState("");
  const [category, setCategory] = useState("");
  const [view, setView] = useState<"table" | "grid">("table");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: categoriesData } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => getCategories({ page_size: 200 }),
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["rings", page, search, authenticity, category],
    queryFn: () =>
      getRings({
        page,
        search: search || undefined,
        authenticity: authenticity || undefined,
        category: category ? Number(category) : undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rings"] });
      toast.success("انگشتر با موفقیت حذف شد");
      setDeleteId(null);
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "خطا در حذف");
    },
  });

  const results = data?.results ?? [];
  const totalPages = data?.total_pages ?? 1;

  const categoryOptions = [
    { value: "", label: "همه دسته‌ها" },
    ...((categoriesData?.results ?? []).map((c) => ({
      value: String(c.id),
      label: c.name,
    })) ?? []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-page-title">انگشتر</h1>
          <p className="mt-1 text-caption">مدیریت مجموعه انگشترها</p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/admin/rings/new">
              <Plus className="size-4" />
              افزودن انگشتر
            </Link>
          </Button>
        )}
      </div>

      <ListFilters>
        <FilterSearchField
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="جستجو نام، کاتالوگ، کشور…"
        />
        <FilterSelect
          value={authenticity}
          onChange={(v) => {
            setAuthenticity(v);
            setPage(1);
          }}
          options={[{ value: "", label: "همه اصالت‌ها" }, ...authenticityFilterOptions]}
        />
        <FilterSelect
          value={category}
          onChange={(v) => {
            setCategory(v);
            setPage(1);
          }}
          options={categoryOptions}
        />
        <FilterViewToggle value={view} onChange={setView} />
      </ListFilters>

      {isError && (
        <Alert variant="danger">
          <span>خطا در بارگذاری انگشترها</span>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
            تلاش مجدد
          </Button>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          icon={Gem}
          title="انگشتری یافت نشد"
          description="هنوز انگشتری در آرشیو نیست یا با فیلتر فعلی مطابقت ندارد."
          action={
            canCreate ? (
              <Button asChild>
                <Link href="/admin/rings/new">افزودن انگشتر</Link>
              </Button>
            ) : undefined
          }
        />
      ) : view === "table" ? (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted/60 text-text-muted">
              <tr>
                <th className="p-3 text-right font-medium">انگشتر</th>
                <th className="p-3 text-right font-medium">کشور</th>
                <th className="p-3 text-right font-medium">اصالت</th>
                <th className="p-3 text-right font-medium">ارزش</th>
                <th className="p-3 text-left font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item) => (
                <tr key={item.id} className="border-t border-border/60 hover:bg-surface-muted/40">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <RingThumb item={item} />
                      <div>
                        <Link
                          href={`/admin/rings/${item.id}`}
                          className="font-medium text-text hover:text-primary"
                        >
                          {item.name}
                        </Link>
                        {item.catalog_number && (
                          <p className="text-xs text-text-muted" dir="ltr">
                            {item.catalog_number}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-text-muted">{item.country || "—"}</td>
                  <td className="p-3">
                    {item.authenticity ? (
                      <Badge variant={authenticityVariant(item.authenticity)}>
                        {authenticityLabel(item.authenticity)}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-3" dir="ltr">
                    {item.current_value ? formatNumber(item.current_value) : "—"}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild title="مشاهده">
                        <Link href={`/admin/rings/${item.id}`}>
                          <Eye className="size-4" />
                        </Link>
                      </Button>
                      {canUpdate && (
                        <Button variant="ghost" size="icon" asChild title="ویرایش">
                          <Link href={`/admin/rings/${item.id}/edit`}>
                            <Pencil className="size-4" />
                          </Link>
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="حذف"
                          onClick={() => setDeleteId(item.id)}
                        >
                          <Trash2 className="size-4 text-danger" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((item) => {
            const src = resolvePrimaryImage(item);
            return (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-[4/3] bg-surface-muted">
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt={item.name} className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center text-text-subtle">
                      <ImageOff className="size-8" />
                    </div>
                  )}
                </div>
                <CardContent className="space-y-2 p-4">
                  <Link
                    href={`/admin/rings/${item.id}`}
                    className="font-medium text-text hover:text-primary"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-text-muted">
                    {item.country || "—"}
                    {item.year ? ` · ${item.year}` : ""}
                  </p>
                  <div className="flex gap-1 pt-1">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/rings/${item.id}`}>مشاهده</Link>
                    </Button>
                    {canUpdate && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/rings/${item.id}/edit`}>ویرایش</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      )}

      <ConfirmDialog
        open={deleteId != null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="حذف انگشتر"
        description="آیا از حذف این انگشتر مطمئن هستید؟ این عمل قابل بازگشت نیست."
        confirmLabel="حذف"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteId != null && deleteMutation.mutate(deleteId)}
      />
    </div>
  );
}
