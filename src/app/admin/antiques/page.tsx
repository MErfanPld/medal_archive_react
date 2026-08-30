"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  Gem,
  ImageOff,
} from "lucide-react";
import {
  ListFilters,
  FilterSearchField,
  FilterSelect,
  FilterViewToggle,
} from "@/components/admin/list-filters";
import { getAntiques, deleteAntique } from "@/lib/data/antiques";
import { getCategories } from "@/lib/data/categories";
import { cn, resolvePrimaryImage } from "@/lib/utils";
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
} from "@/lib/antique-labels";
import type { Antique } from "@/types/antiques";

function AntiqueThumb({ item }: { item: Antique }) {
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

export default function AntiquesPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canCreate = hasPermission(PERMISSIONS.ANTIQUES_CREATE);
  const canUpdate = hasPermission(PERMISSIONS.ANTIQUES_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.ANTIQUES_DELETE);

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
    queryKey: ["antiques", page, search, category, authenticity],
    queryFn: () =>
      getAntiques({
        page,
        search: search || undefined,
        category,
        authenticity,
        ordering: "-created_at",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAntique(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["antiques"] });
      setDeleteId(null);
      toast.success("آنتیک با موفقیت حذف شد");
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
          <h1 className="text-page-title">آنتیک</h1>
          <p className="mt-1 text-caption">مدیریت مجموعه آنتیک‌ها</p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/admin/antiques/new">
              <Plus className="size-4" />
              افزودن آنتیک
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
          <span>خطا در بارگذاری آنتیک‌ها</span>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            تلاش مجدد
          </Button>
        </Alert>
      ) : items.length === 0 ? (
        <EmptyState
          title="آنتیکی یافت نشد"
          description="هنوز آنتیکی در آرشیو نیست یا با فیلتر فعلی مطابقت ندارد."
          icon={<Gem className="size-10" />}
          action={
            canCreate ? (
              <Button asChild>
                <Link href="/admin/antiques/new">افزودن آنتیک</Link>
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
                    <th className="p-3 text-right font-medium">آنتیک</th>
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
                          <AntiqueThumb item={c} />
                          <div>
                            <Link
                              href={`/admin/antiques/${c.id}`}
                              className="font-medium hover:text-primary"
                            >
                              {c.name}
                            </Link>
                            <p className="text-xs text-text-muted">
                              {c.catalog_number || c.material || "—"}
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
                            <Link href={`/admin/antiques/${c.id}`} aria-label="مشاهده">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          {canUpdate && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link
                                href={`/admin/antiques/${c.id}/edit`}
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
                    <Gem className="size-10 text-text-subtle" />
                  )}
                </div>
                <CardContent className="space-y-2 p-4">
                  <Link
                    href={`/admin/antiques/${c.id}`}
                    className="block font-medium text-text hover:text-primary"
                  >
                    {c.name}
                  </Link>
                  <p className="text-xs text-text-muted">
                    {[c.country, c.year, c.material].filter(Boolean).join(" · ") || "—"}
                  </p>
                  <Badge variant={authenticityVariant(c.authenticity)}>
                    {authenticityLabel(c.authenticity)}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

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
        title="حذف آنتیک"
        description="آیا از حذف این آنتیک مطمئن هستید؟ این عمل قابل بازگشت نیست."
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
