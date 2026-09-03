"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  CircleDot,
  ImageOff,
} from "lucide-react";
import {
  ListFilters,
  FilterSearchField,
  FilterSelect,
  FilterViewToggle,
} from "@/components/admin/list-filters";
import { getTasbihs, deleteTasbih } from "@/lib/data/tasbih";
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
} from "@/lib/tasbih-labels";
import type { Tasbih } from "@/types/tasbih";

function TasbihThumb({ item }: { item: Tasbih }) {
  const src = resolvePrimaryImage(item);
  if (src) {
    return (
      <div className="medal-thumb overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>
    );
  }
  return (
    <div className="medal-thumb text-text-subtle">
      <ImageOff className="size-4" aria-hidden />
    </div>
  );
}

export default function TasbihPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canCreate = hasPermission(PERMISSIONS.TASBIH_CREATE);
  const canUpdate = hasPermission(PERMISSIONS.TASBIH_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.TASBIH_DELETE);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState<number | undefined>();
  const [authenticity, setAuthenticity] = useState<string | undefined>();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [view, setView] = useState<"list" | "grid">("list");

  const { data: categoriesData } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => getCategories({ pageSize: 100 }),
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["tasbih", page, search, category, authenticity],
    queryFn: () =>
      getTasbihs({
        page,
        search: search || undefined,
        category,
        authenticity,
        ordering: "-created_at",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTasbih(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasbih"] });
      setDeleteId(null);
      toast.success("تسبیح با موفقیت حذف شد");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "خطا در حذف");
    },
  });

  const items = data?.results ?? [];
  const total = data?.count ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-page-title">تسبیح</h1>
          <p className="mt-1 text-caption">مدیریت مجموعه تسبیح‌ها</p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/admin/tasbih/new">
              <Plus className="size-4" />
              افزودن تسبیح
            </Link>
          </Button>
        )}
      </div>

      <ListFilters>
        <FilterSearchField
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={() => {
            setSearch(searchInput);
            setPage(1);
          }}
          placeholder="جستجو در نام، کشور، کاتالوگ…"
        />
        <FilterSelect
          value={category != null ? String(category) : ""}
          onChange={(v) => {
            setCategory(v ? Number(v) : undefined);
            setPage(1);
          }}
          options={(categoriesData?.results ?? []).map((c) => ({
            value: String(c.id),
            label: c.name,
          }))}
          allLabel="همه دسته‌ها"
          aria-label="دسته‌بندی"
        />
        <FilterSelect
          value={authenticity ?? ""}
          onChange={(v) => {
            setAuthenticity(v || undefined);
            setPage(1);
          }}
          options={authenticityFilterOptions}
          allLabel="همه وضعیت‌ها"
          aria-label="اصالت"
        />
        <FilterViewToggle view={view} onChange={setView} />
      </ListFilters>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <Alert variant="danger" className="flex items-center justify-between gap-3">
          <span>خطا در بارگذاری تسبیح‌ها</span>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            تلاش مجدد
          </Button>
        </Alert>
      ) : items.length === 0 ? (
        <EmptyState
          title="تسبیحی یافت نشد"
          description="هنوز تسبیحی در آرشیو نیست یا با فیلتر فعلی مطابقت ندارد."
          icon={<CircleDot className="size-10" />}
          action={
            canCreate ? (
              <Button asChild>
                <Link href="/admin/tasbih/new">افزودن تسبیح</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          {view === "list" && (
            <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface md:block">
              <table className="w-full text-sm">
                <thead className="bg-surface-muted/50">
                  <tr>
                    <th className="p-3 text-right font-medium">تسبیح</th>
                    <th className="p-3 text-right font-medium">کشور</th>
                    <th className="p-3 text-right font-medium">سال</th>
                    <th className="p-3 text-right font-medium">کاتالوگ</th>
                    <th className="p-3 text-right font-medium">اصالت</th>
                    <th className="p-3 text-right font-medium">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => (
                    <tr
                      key={c.id}
                      className="border-t border-border transition-colors hover:bg-surface-muted/30"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <TasbihThumb item={c} />
                          <div>
                            <Link
                              href={`/admin/tasbih/${c.id}`}
                              className="font-medium hover:text-primary"
                            >
                              {c.name}
                            </Link>
                            <p className="text-xs text-text-muted">
                              {c.catalog_number || c.bead_material || c.material || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">{c.country || "—"}</td>
                      <td className="p-3">{c.year ?? "—"}</td>
                      <td className="p-3">{c.catalog_number || "—"}</td>
                      <td className="p-3">
                        <Badge variant={authenticityVariant(c.authenticity)}>
                          {authenticityLabel(c.authenticity)}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/tasbih/${c.id}`} aria-label="مشاهده">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          {canUpdate && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link
                                href={`/admin/tasbih/${c.id}/edit`}
                                aria-label="ویرایش"
                              >
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteId(c.id)}
                              aria-label="حذف"
                            >
                              <Trash2 className="h-4 w-4 text-danger" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {(view === "grid" || true) && (
            <div
              className={cn(
                "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
                view === "list" && "md:hidden"
              )}
            >
              {items.map((c) => (
                <Card key={c.id} className="overflow-hidden">
                  <div className="flex h-36 items-center justify-center bg-surface-muted">
                    {resolvePrimaryImage(c) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={resolvePrimaryImage(c)!}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <CircleDot className="size-10 text-text-subtle" />
                    )}
                  </div>
                  <CardContent className="space-y-2 p-4">
                    <Link
                      href={`/admin/tasbih/${c.id}`}
                      className="block font-medium text-text hover:text-primary"
                    >
                      {c.name}
                    </Link>
                    <p className="text-xs text-text-muted">
                      {[c.country, c.year, c.material].filter(Boolean).join(" · ") ||
                        "—"}
                    </p>
                    <Badge variant={authenticityVariant(c.authenticity)}>
                      {authenticityLabel(c.authenticity)}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {total > 20 && (
            <Pagination
              page={page}
              pageSize={20}
              total={total}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="حذف تسبیح"
        description="آیا از حذف این تسبیح مطمئن هستید؟ این عمل قابل بازگشت نیست."
        confirmLabel="حذف"
        onConfirm={async () => {
          if (deleteId == null) return;
          await deleteMutation.mutateAsync(deleteId);
        }}
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
