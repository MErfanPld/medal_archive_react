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
  Medal as MedalIcon,
} from "lucide-react";
import { getMedals, deleteMedal } from "@/lib/data/medals";
import {
  authenticityLabel,
  authenticityVariant,
} from "@/lib/medal-labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";
import type { Medal } from "@/types/api";

export default function MedalsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["medals", { search, page }],
    queryFn: () => getMedals({ search: search || undefined, page, ordering: "-created_at" }),
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-danger">خطا در بارگذاری مدال‌ها</p>
        <p className="text-sm text-text-muted">
          {(error as Error)?.message || "اتصال به سرور را بررسی کنید."}
        </p>
        <Button type="button" onClick={() => refetch()}>
          تلاش مجدد
        </Button>
      </div>
    );
  }

  const medals = data?.results ?? [];
  const total = data?.count ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-text">
            <MedalIcon className="h-7 w-7 text-primary" />
            مدال‌ها
          </h1>
          <p className="mt-1 text-sm text-text-muted">{total} مدال در آرشیو</p>
        </div>
        <Button asChild>
          <Link href="/admin/medals/new">
            <Plus className="ml-2 h-4 w-4" />
            ثبت مدال جدید
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="جستجو در نام، کشور، سال..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pr-10"
          />
        </div>
      </div>

      {medals.length === 0 ? (
        <EmptyState
          title="مدالی یافت نشد"
          description="هنوز مدالی در این بخش ثبت نشده یا با فیلتر فعلی مطابقت ندارد."
          action={
            <Button asChild>
              <Link href="/admin/medals/new">ثبت مدال جدید</Link>
            </Button>
          }
        />
      ) : (
        <>
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
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                          {m.name.slice(0, 2)}
                        </div>
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
                          <Link href={`/admin/medals/${m.id}`} aria-label="مشاهده">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/medals/${m.id}/edit`} aria-label="ویرایش">
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

          <div className="grid gap-4 md:hidden">
            {medals.map((m: Medal) => (
              <Card key={m.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/admin/medals/${m.id}`}
                        className="font-semibold hover:text-primary"
                      >
                        {m.name}
                      </Link>
                      <p className="mt-1 text-xs text-text-muted">
                        {m.country} · {m.year}
                      </p>
                    </div>
                    <Badge variant={authenticityVariant(m.authenticity)}>
                      {authenticityLabel(m.authenticity)}
                    </Badge>
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
