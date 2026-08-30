"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  Medal as MedalIcon,
  ImageOff,
} from "lucide-react";
import { getMedals, deleteMedal } from "@/lib/data/medals";
import { getCategories } from "@/lib/data/categories";
import {
  authenticityLabel,
  authenticityVariant,
  authenticityFilterOptions,
} from "@/lib/medal-labels";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";
import { resolvePrimaryImage, cn } from "@/lib/utils";
import {
  ListFilters,
  FilterSearchField,
  FilterSelect,
  FilterViewToggle,
} from "@/components/admin/list-filters";
import type { Medal } from "@/types/api";

function MedalThumb({ medal }: { medal: Medal }) {
  const src = resolvePrimaryImage(medal);
  if (!src) {
    return (
      <div className="medal-thumb text-text-subtle">
        <ImageOff className="size-4" aria-hidden />
      </div>
    );
  }
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

export default function MedalsPage() {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<number | undefined>();
  const [authenticity, setAuthenticity] = useState<string | undefined>();
  const [view, setView] = useState<"list" | "grid">("list");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: categoriesData } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => getCategories({ pageSize: 100 }),
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["medals", page, search, category, authenticity],
    queryFn: () =>
      getMedals({
        search: search || undefined,
        page,
        category,
        authenticity,
        ordering: "-created_at",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteMedal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medals"] });
      setDeleteId(null);
      toast.success("مدال با موفقیت حذف شد");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "خطا در حذف مدال");
    },
  });

  const medals = data?.results ?? [];
  const total = data?.count ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-page-title">مدال‌ها</h1>
          <p className="mt-1 text-caption">
            {total > 0 ? `${total} مدال در آرشیو` : "مدیریت مجموعه مدال‌ها"}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/medals/new">
            <Plus className="size-4" />
            ثبت مدال جدید
          </Link>
        </Button>
      </div>

      <ListFilters>
        <FilterSearchField
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={() => {
            setSearch(searchInput.trim());
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
          aria-label="فیلتر دسته"
        />
        <FilterSelect
          value={authenticity ?? ""}
          onChange={(v) => {
            setAuthenticity(v || undefined);
            setPage(1);
          }}
          options={authenticityFilterOptions}
          allLabel="همه اصالت‌ها"
          aria-label="فیلتر اصالت"
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
          <span>
            {(error as Error)?.message || "خطا در بارگذاری مدال‌ها"}
          </span>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            تلاش مجدد
          </Button>
        </Alert>
      ) : medals.length === 0 ? (
        <EmptyState
          title="مدالی یافت نشد"
          description="هنوز مدالی در این بخش ثبت نشده یا با فیلتر فعلی مطابقت ندارد."
          icon={<MedalIcon className="size-10" />}
          action={
            <Button asChild>
              <Link href="/admin/medals/new">ثبت مدال جدید</Link>
            </Button>
          }
        />
      ) : (
        <>
          {view === "list" ? (
            <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface md:block">
              <table className="w-full text-sm">
                <thead className="bg-surface-muted/50">
                  <tr>
                    <th className="p-3 text-right font-medium">مدال</th>
                    <th className="p-3 text-right font-medium">کشور</th>
                    <th className="p-3 text-right font-medium">سال</th>
                    <th className="p-3 text-right font-medium">جنس</th>
                    <th className="p-3 text-right font-medium">اصالت</th>
                    <th className="p-3 text-right font-medium">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {medals.map((m: Medal) => (
                    <tr
                      key={m.id}
                      className="border-t border-border transition-colors hover:bg-surface-muted/30"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <MedalThumb medal={m} />
                          <div>
                            <Link
                              href={`/admin/medals/${m.id}`}
                              className="font-medium hover:text-primary"
                            >
                              {m.name}
                            </Link>
                            <p className="text-xs text-text-muted">
                              {m.catalog_number}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">{m.country || "—"}</td>
                      <td className="p-3">{m.year ?? "—"}</td>
                      <td className="p-3">{m.material || "—"}</td>
                      <td className="p-3">
                        <Badge variant={authenticityVariant(m.authenticity)}>
                          {authenticityLabel(m.authenticity)}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={`/admin/medals/${m.id}`}
                              aria-label="مشاهده"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={`/admin/medals/${m.id}/edit`}
                              aria-label="ویرایش"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(m.id)}
                            aria-label="حذف"
                          >
                            <Trash2 className="h-4 w-4 text-danger" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          <div
            className={cn(
              "grid gap-4",
              view === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "md:hidden"
            )}
          >
            {medals.map((m: Medal) => (
              <Card key={m.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <MedalThumb medal={m} />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/medals/${m.id}`}
                        className="font-semibold hover:text-primary"
                      >
                        {m.name}
                      </Link>
                      <p className="mt-1 text-xs text-text-muted">
                        {m.country || "—"} · {m.year ?? "—"}
                      </p>
                      <div className="mt-2">
                        <Badge variant={authenticityVariant(m.authenticity)}>
                          {authenticityLabel(m.authenticity)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/medals/${m.id}`}>مشاهده</Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/medals/${m.id}/edit`}>ویرایش</Link>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-danger"
                      onClick={() => setDeleteId(m.id)}
                    >
                      حذف
                    </Button>
                  </div>
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
        title="حذف مدال"
        description="آیا از حذف این مدال مطمئن هستید؟ این عمل قابل بازگشت نیست."
        confirmLabel="حذف"
        onConfirm={async () => {
          const id = deleteId;
          if (id == null) return;
          await deleteMutation.mutateAsync(id);
        }}
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
