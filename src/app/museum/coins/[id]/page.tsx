"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Coins } from "lucide-react";
import { getCoinById, getCoinImages } from "@/lib/data/coins";
import { formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import {
  authenticityLabel,
  qualityLabel,
  coinItemTypeLabel,
  coinImageTypeOptions,
} from "@/lib/coin-labels";

export default function MuseumCoinDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const coinId = Number(id);

  const { data: coin, isLoading, isError } = useQuery({
    queryKey: ["museum-coin", coinId],
    queryFn: () => getCoinById(coinId),
    enabled: !Number.isNaN(coinId),
  });

  const { data: imagesData } = useQuery({
    queryKey: ["museum-coin-images", coinId],
    queryFn: () => getCoinImages(coinId),
    enabled: !!coin,
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !coin) {
    return (
      <Alert variant="danger">
        قلم یافت نشد.{" "}
        <Link href="/museum/coins" className="underline">بازگشت</Link>
      </Alert>
    );
  }

  const images = imagesData?.results ?? [];
  const primary =
    coin.primary_image_url ||
    coin.primary_image ||
    images.find((i) => i.is_primary)?.image_url ||
    images[0]?.image_url ||
    images[0]?.image ||
    null;

  const specs: [string, string | number | null | undefined][] = [
    ["نوع", coinItemTypeLabel(coin.item_type)],
    ["کشور", coin.country],
    ["سال", coin.year],
    ["سال هجری", coin.year_hijri],
    ["دوره", coin.historical_period],
    ["حاکم", coin.reign_or_ruler],
    ["ارزش اسمی", coin.face_value],
    ["فرقه", coin.denomination],
    ["ارز", coin.currency_name],
    ["جنس", coin.material],
    ["عیار", coin.purity],
    ["وزن", coin.weight ? `${coin.weight}` : null],
    ["قطر", coin.diameter ? `${coin.diameter}` : null],
    ["ضخامت", coin.thickness],
    ["شکل", coin.shape],
    ["لبه", coin.edge],
    ["رنگ", coin.color],
    ["Mint", coin.mint],
    ["سازنده", coin.maker],
    ["چاپخانه", coin.printer],
    ["تیراژ", coin.mintage],
    ["سریال", coin.serial_number],
    ["سری", coin.series],
    ["کاتالوگ", coin.catalog_number],
    ["کیفیت", qualityLabel(coin.quality, "")],
    ["اصالت", authenticityLabel(coin.authenticity, "")],
  ];

  return (
    <article className="space-y-10">
      <Link href="/museum/coins" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text">
        <ArrowRight className="size-4" />
        بازگشت به مجموعه سکه و پول
      </Link>

      <header className="space-y-4 text-center">
        <p className="text-sm text-primary">
          {coin.category_detail?.name || coin.category_name || coinItemTypeLabel(coin.item_type)}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-primary-deep sm:text-4xl">{coin.name}</h1>
        <p className="text-lg text-text-muted">
          {[coin.country, coin.year, coin.historical_period].filter(Boolean).join(" · ")}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="outline">{coinItemTypeLabel(coin.item_type)}</Badge>
          {coin.is_proof && <Badge variant="primary">Proof</Badge>}
          {coin.is_commemorative && <Badge>یادبود</Badge>}
          {coin.authenticity && <Badge variant="default">{authenticityLabel(coin.authenticity)}</Badge>}
        </div>
      </header>

      <div className="mx-auto flex aspect-[4/3] max-w-lg items-center justify-center overflow-hidden rounded-2xl bg-surface-muted">
        {primary && String(primary).length > 2 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={String(primary)} alt={coin.name} className="h-full w-full object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-3 text-primary/30">
            <Coins className="size-16" />
            <span className="text-7xl font-semibold">{coin.name.charAt(0)}</span>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mx-auto grid max-w-2xl grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="overflow-hidden rounded-xl border border-border bg-surface-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.image_url || img.image} alt={img.caption || ""} className="aspect-square w-full object-cover" />
              <p className="px-2 py-1 text-center text-[10px] text-text-muted">
                {coinImageTypeOptions.find((o) => o.value === img.image_type)?.label || img.image_type}
              </p>
            </div>
          ))}
        </div>
      )}

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {specs.map(([label, value]) =>
          value !== null && value !== undefined && value !== "" ? (
            <div key={String(label)} className="border-b border-border pb-3">
              <dt className="text-xs uppercase tracking-wide text-text-subtle">{label}</dt>
              <dd className="mt-1 text-sm font-medium text-text">{value}</dd>
            </div>
          ) : null
        )}
      </section>

      {(coin.current_value || coin.face_value) && (
        <Card>
          <CardHeader><CardTitle>ارزش</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-6 text-sm">
            {coin.face_value && (
              <div>
                <p className="text-text-muted">ارزش اسمی</p>
                <p className="mt-1 font-semibold tabular-nums">
                  {formatNumber(coin.face_value)}
                  {coin.denomination ? ` ${coin.denomination}` : ""}
                </p>
              </div>
            )}
            {coin.current_value && (
              <div>
                <p className="text-text-muted">ارزش برآوردی</p>
                <p className="mt-1 font-semibold tabular-nums">{formatNumber(coin.current_value)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {coin.notes && (
        <Card>
          <CardHeader><CardTitle>درباره این قلم</CardTitle></CardHeader>
          <CardContent>
            <p className="leading-relaxed text-text-muted whitespace-pre-wrap">{coin.notes}</p>
          </CardContent>
        </Card>
      )}
    </article>
  );
}
