"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getMedals } from "@/lib/data/medals";
import { getCategories } from "@/lib/data/categories";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function MuseumHomePage() {
  const { data: medalsData, isLoading } = useQuery({
    queryKey: ["museum", "featured"],
    queryFn: () => getMedals({ pageSize: 6, ordering: "-year" }),
  });
  const { data: categoriesData } = useQuery({
    queryKey: ["museum", "categories"],
    queryFn: () => getCategories({ is_active: true, pageSize: 10 }),
  });

  const medals = medalsData?.results ?? [];
  const categories = categoriesData?.results ?? [];

  return (
    <div className="space-y-16">
      <section className="text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">آرشیو دیجیتال</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-primary-deep sm:text-4xl lg:text-5xl">
          موزه مدال و سکه
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-text-muted sm:text-lg">
          مجموعه‌ای منتخب از مدال‌های تاریخی، نظامی و یادبود — از دوران قاجار تا المپیک‌های معاصر
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/museum/medals"
            className="inline-flex h-11 items-center rounded-lg bg-primary px-6 text-sm font-medium text-white hover:bg-primary-deep"
          >
            مشاهده مجموعه
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-xl font-semibold text-text">مدال‌های برجسته</h2>
          <Link href="/museum/medals" className="text-sm text-primary hover:underline">
            همه مدال‌ها
          </Link>
        </div>
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {medals.map((m) => (
              <Link key={m.id} href={`/museum/medals/${m.id}`} className="group">
                <Card className="overflow-hidden transition-shadow hover:shadow-md">
                  <div className="flex aspect-[4/3] items-center justify-center bg-surface-muted">
                    <span className="text-4xl font-semibold text-primary/40">
                      {m.name.charAt(0)}
                    </span>
                  </div>
                  <CardContent className="space-y-2 p-4">
                    <h3 className="font-medium text-text group-hover:text-primary line-clamp-2">
                      {m.name}
                    </h3>
                    <p className="text-sm text-text-muted">
                      {m.country} · {m.year ?? "—"}
                    </p>
                    {m.category_detail && (
                      <Badge variant="outline">{m.category_detail.name}</Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-6 text-xl font-semibold text-text">مجموعه‌ها</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/museum/medals?category=${c.id}`}
              className="rounded-xl border border-border bg-surface px-5 py-4 transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <h3 className="font-medium text-text">{c.name}</h3>
              {c.description && (
                <p className="mt-1 line-clamp-2 text-sm text-text-muted">{c.description}</p>
              )}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
