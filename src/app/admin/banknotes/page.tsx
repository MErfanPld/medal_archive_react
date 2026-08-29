"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Banknote as BanknoteIcon,
  LayoutGrid,
  List,
  ImageOff,
} from "lucide-react";
import { getBanknotes, deleteBanknote } from "@/lib/data/banknotes";
import { getCategories } from "@/lib/data/categories";
import { cn, resolvePrimaryImage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/lib/banknote-labels";
import type { Banknote } from "@/types/api";

function BanknoteThumb({ item }: { item: Banknote }) {
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

export default function BanknotesPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canCreate = hasPermission(PERMISSIONS.BANKNOTES_CREATE);
  const canUpdate = hasPermission(PERMISSIONS.BANKNOTES_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.BANKNOTES_DELETE);

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
    queryKey: ["banknotes", page, search, category, authenticity],
    queryFn: () =>
      getBanknotes({
        page,
        search: search || undefined,
        category,
        authenticity,
        ordering: "-created_at",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteBanknote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banknotes"] });
      setDeleteId(null);
      toast.success("اسکناس با موفقیت حذف شد");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "خطا در حذف");
    },
  });

  const items = data?.results ?? [];
  const total = data?.count ?? 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-page-title">اسکناس</h1>
          <p className="mt-1 text-caption">مدیریت مجموعه اسکناس‌ها</p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/admin/banknotes/new">
              <Plus className="size-4" />
              افزودن اسکناس
            </Link>
          </Button>
        )}
      </div>

      <div className="panel p-3 sm:p-4">
        <div className="flex flex-wrap items-end gap-3">
          <form onSubmit={handleSearch} className="flex min-w-[200px] flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-subtle" />
              <Input
                placeholder="جستجو در نام، کشور، کاتالوگ…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pr-9"
              />
            </div>
            <Button type="submit" variant="secondary">
              جستجو
            </Button>
          </form>
          <select
            className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-text"
            value={category ?? ""}
            onChange={(e) => {
              setCategory(e.target.value ? Number(e.target.value) : undefined);
              setPage(1);
            }}
            aria-label="دسته‌بندی"
          >
            <option value="">همه دسته‌ها</option>
            {(categoriesData?.results ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-text"
            value={authenticity ?? ""}
            onChange={(e) => {
              setAuthenticity(e.target.value || undefined);
              setPage(1);
            }}
            aria-label="اصالت"
          >
            <option value="">همه وضعیت‌ها</option>
            {authenticityFilterOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <div className="flex rounded-lg border border-border p-0.5">
            <button
              type="button"
              className={cn(
                "rounded-md p-2",
                view === "list" ? "bg-primary/10 text-primary" : "text-text-muted"
              )}
              onClick={() => setView("list")}
              aria-label="نمای لیست"
            >
              <List className="size-4" />
            </button>
            <button
              type="button"
              className={cn(
                "rounded-md p-2",
                view === "grid" ? "bg-primary/10 text-primary" : "text-text-muted"
              )}
              onClick={() => setView("grid")}
              aria-label="نمای کارت"
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <Alert variant="danger" className="flex items-center justify-between gap-3">
          <span>خطا در بارگذاری اسکناس‌ها</span>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            تلاش مجدد
          </Button>
        </Alert>
      ) : items.length === 0 ? (
        <EmptyState
          title="اسکناسی یافت نشد"
          description="هنوز اسکناسی در آرشیو نیست یا با فیلتر فعلی مطابقت ندارد."
          icon={<BanknoteIcon className="size-10" />}
          action={
            canCreate ? (
              <Button asChild>
                <Link href="/admin/banknotes/new">افزودن اسکناس</Link>
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
                    <th className="p-3 text-right font-medium">اسکناس</th>
                    <th className="p-3 text-right font-medium">کشور</th>
                    <th className="p-3 text-right font-medium">سال</th>
                    <th className="p-3 text-right font-medium">سریال</th>
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
                          <BanknoteThumb item={c} />
                          <div>
                            <Link
                              href={`/admin/banknotes/${c.id}`}
                              className="font-medium hover:text-primary"
                            >
                              {c.name}
                            </Link>
                            <p className="text-xs text-text-muted">
                              {c.catalog_number || c.denomination || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">{c.country || "—"}</td>
                      <td className="p-3">{c.year ?? "—"}</td>
                      <td className="p-3">{c.serial_number || "—"}</td>
                      <td className="p-3">
                        <Badge variant={authenticityVariant(c.authenticity)}>
                          {authenticityLabel(c.authenticity)}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/banknotes/${c.id}`} aria-label="مشاهده">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          {canUpdate && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link
                                href={`/admin/banknotes/${c.id}/edit`}
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
                    <BanknoteIcon className="size-10 text-text-subtle" />
                  )}
                </div>
                <CardContent className="space-y-2 p-4">
                  <Link
                    href={`/admin/banknotes/${c.id}`}
                    className="block font-medium text-text hover:text-primary"
                  >
                    {c.name}
                  </Link>
                  <p className="text-xs text-text-muted">
                    {[c.country, c.year, c.serial_number].filter(Boolean).join(" · ") ||
                      "—"}
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
        title="حذف اسکناس"
        description="آیا از حذف این اسکناس مطمئن هستید؟ این عمل قابل بازگشت نیست."
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
