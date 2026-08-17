"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { getCoins } from "@/lib/data/coins";
import { getCategories } from "@/lib/data/categories";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { coinItemTypeLabel } from "@/lib/coin-labels";
import type { Coin } from "@/types/api";

function CoinThumb({ coin }: { coin: Coin }) {
  const src = coin.primary_image_url || coin.primary_image;
  if (src && typeof src === "string" && src.length > 2 && !src.startsWith("0")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
    );
  }
  return (
    <span className="text-4xl font-semibold text-primary/40">{coin.name.charAt(0)}</span>
  );
}

export default function MuseumCoinsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState<number | undefined>();

  const { data: categoriesData } = useQuery({
    queryKey: ["museum-cats"],
    queryFn: () => getCategories({ is_active: true, pageSize: 50 }),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["museum-coins", page, search, category],
    queryFn: () =>
      getCoins({
        page,
        search: search || undefined,
        category,
        is_active: true,
        ordering: "-year",
      }),
  });

  const coins = data?.results ?? [];
  const total = data?.count ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-primary-deep">
          مجموعه سکه و پول
        </h1>
        <p className="mt-2 text-text-muted">
          کاوش در آرشیو سکه‌ها، اسکناس‌ها و اقلام پولی تاریخی
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <form
          className="flex min-w-[200px] flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchInput);
            setPage(1);
          }}
        >
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-subtle" />
            <Input
              placeholder="جستجو…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pr-9"
            />
          </div>
          <Button type="submit" variant="secondary">جستجو</Button>
        </form>
        <select
          className="h-10 rounded-lg border border-border bg-surface px-3 text-sm"
          value={category ?? ""}
          onChange={(e) => {
            setCategory(e.target.value ? Number(e.target.value) : undefined);
            setPage(1);
          }}
        >
          <option value="">همه دسته‌ها</option>
          {categoriesData?.results?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] rounded-xl" />
          ))}
        </div>
      ) : coins.length === 0 ? (
        <EmptyState title="نتیجه‌ای یافت نشد" description="فیلترها را تغییر دهید." />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coins.map((c) => (
              <Link key={c.id} href={`/museum/coins/${c.id}`} className="group">
                <Card className="overflow-hidden transition-shadow hover:shadow-md">
                  <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-surface-muted">
                    <CoinThumb coin={c} />
                  </div>
                  <CardContent className="space-y-2 p-4">
                    <h3 className="line-clamp-2 font-medium text-text group-hover:text-primary">{c.name}</h3>
                    <p className="text-sm text-text-muted">{c.country} · {c.year ?? "—"}</p>
                    {(c.material || c.item_type) && (
                      <Badge variant="outline">{c.material || coinItemTypeLabel(c.item_type)}</Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <Pagination page={page} pageSize={20} total={total} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
