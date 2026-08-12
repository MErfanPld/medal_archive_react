"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Eye, Pencil, Trash2, Filter, Medal as MedalIcon } from "lucide-react";
import { getMedals, deleteMedal } from "@/lib/data/medals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmDialog } from "@/components/ui/dialog";
import type { Medal } from "@/types/api";

export default function MedalsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["medals", { search, page }],
    queryFn: () => getMedals({ search, page, page_size: 12 }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMedal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medals"] });
      setDeleteId(null);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
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
      <div className="text-center py-12 text-destructive">
        خطا در بارگذاری مدال‌ها
      </div>
    );
  }

  const medals = data?.results ?? [];
  const total = data?.count ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <MedalIcon className="h-7 w-7 text-primary" />
            مدال‌ها
          </h1>
          <p className="text-sm text-text-muted mt-1">{total} مدال در آرشیو</p>
        </div>
        <Button asChild>
          <Link href="/admin/medals/new">
            <Plus className="h-4 w-4 ml-2" />
            ثبت مدال جدید
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
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
          <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-right p-3 font-medium">مدال</th>
                  <th className="text-right p-3 font-medium">کشور</th>
                  <th className="text-right p-3 font-medium">سال</th>
                  <th className="text-right p-3 font-medium">ماده</th>
                  <th className="text-right p-3 font-medium">وضعیت</th>
                  <th className="text-right p-3 font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {medals.map((m: Medal) => (
                  <tr key={m.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {m.name.slice(0, 2)}
                        </div>
                        <div>
                          <Link href={`/admin/medals/${m.id}`} className="font-medium hover:text-primary">
                            {m.name}
                          </Link>
                          <p className="text-xs text-text-muted">{m.catalog_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">{m.country}</td>
                    <td className="p-3">{m.year}</td>
                    <td className="p-3">{m.material}</td>
                    <td className="p-3">
                      <Badge variant={m.authenticity === "authentic" ? "default" : "secondary"}>
                        {m.authenticity === "authentic" ? "اصیل" : m.authenticity}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/medals/${m.id}`}><Eye className="h-4 w-4" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/medals/${m.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(m.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden grid gap-4">
            {medals.map((m: Medal) => (
              <Card key={m.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link href={`/admin/medals/${m.id}`} className="font-semibold hover:text-primary">
                        {m.name}
                      </Link>
                      <p className="text-xs text-text-muted mt-1">{m.country} · {m.year}</p>
                    </div>
                    <Badge>{m.material}</Badge>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/medals/${m.id}`}>مشاهده</Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/medals/${m.id}/edit`}>ویرایش</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {total > 12 && (
            <Pagination
              page={page}
              totalPages={Math.ceil(total / 12)}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="حذف مدال"
        description="آیا از حذف این مدال مطمئن هستید؟ این عمل قابل بازگشت نیست."
        confirmLabel="حذف"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
