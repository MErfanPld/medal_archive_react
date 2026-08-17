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
  Coins,
  LayoutGrid,
  List,
  ImageOff,
} from "lucide-react";
import { getCoins, deleteCoin } from "@/lib/data/coins";
import { getCategories } from "@/lib/data/categories";
import { formatNumber, cn } from "@/lib/utils";
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
  qualityLabel,
  coinItemTypeLabel,
  coinItemTypeOptions,
} from "@/lib/coin-labels";
import type { Coin } from "@/types/api";

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}

function CoinThumb({ coin }: { coin: Coin }) {
  const src = coin.primary_image_url || coin.primary_image;
  if (src && typeof src === "string" && src.length > 2 && !src.startsWith("0")) {
    return (
      <div className="medal-thumb">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" />
      </div>
    );
  }
  return (
    <div className="medal-thumb text-text-subtle">
      <ImageOff className="size-4" aria-hidden />
    </div>
  );
}

export default function CoinsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canCreate = hasPermission(PERMISSIONS.COINS_CREATE);
  const canUpdate = hasPermission(PERMISSIONS.COINS_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.COINS_DELETE);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState<number | undefined>();
  const [authenticity, setAuthenticity] = useState<string | undefined>();
  const [itemType, setItemType] = useState<string | undefined>();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [view, setView] = useState<"list" | "grid">("list");

  const { data: categoriesData } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => getCategories({ pageSize: 100 }),
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["coins", page, search, category, authenticity, itemType],
    queryFn: () =>
      getCoins({
        page,
        search: search || undefined,
        category,
        authenticity,
        item_type: itemType,
        ordering: "-created_at",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCoin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coins"] });
      setDeleteId(null);
      toast.success("قلم با موفقیت حذف شد");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "خطا در حذف");
    },
  });

  const coins = data?.results ?? [];
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
          <h1 className="text-page-title">سکه و پول</h1>
          <p className="mt-1 text-caption">مدیریت سکه‌ها، اسکناس‌ها و اقلام مرتبط</p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/admin/coins/new">
              <Plus className="size-4" />
              افزودن قلم
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
            <Button type="submit" variant="secondary">جستجو</Button>
          </form>
          <select
            className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-text"
            value={itemType ?? ""}
            onChange={(e) => { setItemType(e.target.value || undefined); setPage(1); }}
            aria-label="نوع قلم"
          >
            <option value="">همه انواع</option>
            {coinItemTypeOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-text"
            value={category ?? ""}
            onChange={(e) => { setCategory(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}
            aria-label="فیلتر دسته"
          >
            <option value="">همه دسته‌ها</option>
            {categoriesData?.results?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-text"
            value={authenticity ?? ""}
            onChange={(e) => { setAuthenticity(e.target.value || undefined); setPage(1); }}
            aria-label="فیلتر اصالت"
          >
            <option value="">همه اصالت‌ها</option>
            {authenticityFilterOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <div className="inline-flex rounded-lg border border-border bg-surface-muted/40 p-0.5" role="group">
            <button type="button" onClick={() => setView("list")} className={cn("rounded-md p-2", view === "list" ? "bg-surface text-text shadow-sm" : "text-text-muted")} aria-pressed={view === "list"}>
              <List className="size-4" />
            </button>
            <button type="button" onClick={() => setView("grid")} className={cn("rounded-md p-2", view === "grid" ? "bg-surface text-text shadow-sm" : "text-text-muted")} aria-pressed={view === "grid"}>
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <Alert variant="danger" className="flex items-center justify-between">
          <span>خطا در بارگذاری اقلام</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>تلاش مجدد</Button>
        </Alert>
      ) : coins.length === 0 ? (
        <EmptyState
          title="هنوز قلمی ثبت نشده است"
          description="با فیلترهای فعلی نتیجه‌ای نیست یا هنوز سکه‌ای در آرشیو نیست."
          icon={<Coins className="size-10" />}
          action={canCreate ? (<Button asChild><Link href="/admin/coins/new"><Plus className="size-4" />افزودن اولین قلم</Link></Button>) : undefined}
        />
      ) : (
        <>
          {view === "list" && (
            <>
              <div className="hidden overflow-hidden rounded-xl border border-border bg-surface md:block">
                <table className="archive-table">
                  <thead>
                    <tr>
                      <th className="w-14" />
                      <th>نام</th>
                      <th>نوع</th>
                      <th>کشور</th>
                      <th>سال</th>
                      <th>فرقه</th>
                      <th>کیفیت</th>
                      <th>اصالت</th>
                      <th>ارزش</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coins.map((c) => (
                      <tr key={c.id}>
                        <td><CoinThumb coin={c} /></td>
                        <td>
                          <Link href={`/admin/coins/${c.id}`} className="font-medium text-text hover:text-primary">{c.name}</Link>
                          {c.catalog_number && <p className="text-meta">{c.catalog_number}</p>}
                        </td>
                        <td><Badge variant="outline">{coinItemTypeLabel(c.item_type)}</Badge></td>
                        <td className="text-text-muted">{c.country || "—"}</td>
                        <td className="tabular-nums text-text-muted">{c.year ?? "—"}</td>
                        <td className="text-text-muted">{c.denomination || c.face_value || "—"}</td>
                        <td><Badge variant="outline">{qualityLabel(c.quality)}</Badge></td>
                        <td><Badge variant={authenticityVariant(c.authenticity)}>{authenticityLabel(c.authenticity)}</Badge></td>
                        <td className="tabular-nums text-text-muted">{c.current_value ? formatNumber(c.current_value) : "—"}</td>
                        <td>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" asChild><Link href={`/admin/coins/${c.id}`}><Eye className="size-4" /></Link></Button>
                            {canUpdate && <Button variant="ghost" size="sm" asChild><Link href={`/admin/coins/${c.id}/edit`}><Pencil className="size-4" /></Link></Button>}
                            {canDelete && <Button variant="ghost" size="sm" onClick={() => setDeleteId(c.id)}><Trash2 className="size-4 text-danger" /></Button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid gap-3 md:hidden">
                {coins.map((c) => (
                  <Card key={c.id}>
                    <CardContent className="flex gap-3 p-4">
                      <CoinThumb coin={c} />
                      <div className="min-w-0 flex-1">
                        <Link href={`/admin/coins/${c.id}`} className="font-medium text-text hover:text-primary">{c.name}</Link>
                        <p className="mt-1 text-xs text-text-muted">{[coinItemTypeLabel(c.item_type), c.country, c.year].filter(Boolean).join(" · ")}</p>
                        <div className="mt-2"><Badge variant={authenticityVariant(c.authenticity)}>{authenticityLabel(c.authenticity)}</Badge></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {view === "grid" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {coins.map((c) => (
                <Card key={c.id} className="overflow-hidden">
                  <div className="flex h-36 items-center justify-center bg-surface-muted">
                    {(c.primary_image_url || c.primary_image) && String(c.primary_image_url || c.primary_image).length > 2 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={String(c.primary_image_url || c.primary_image)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Coins className="size-10 text-text-subtle" />
                    )}
                  </div>
                  <CardContent className="space-y-2 p-4">
                    <Link href={`/admin/coins/${c.id}`} className="block font-medium text-text hover:text-primary">{c.name}</Link>
                    <p className="text-xs text-text-muted">{coinItemTypeLabel(c.item_type)}{c.country ? ` · ${c.country}` : ""}{c.year != null ? ` · ${c.year}` : ""}</p>
                    <Badge variant={authenticityVariant(c.authenticity)}>{authenticityLabel(c.authenticity)}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {total > 20 && (
            <Pagination page={page} pageSize={20} total={total} onPageChange={setPage} />
          )}
        </>
      )}

      <ConfirmDialog
        open={deleteId != null}
        onClose={() => setDeleteId(null)}
        title="حذف قلم"
        description="آیا از حذف این سکه / اسکناس مطمئن هستید؟ این عمل قابل بازگشت نیست."
        confirmLabel="حذف"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => { if (deleteId != null) deleteMutation.mutate(deleteId); }}
      />
    </div>
  );
}
