"use client";

import { use, useMemo, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { getMuseumMedal, getMedals, getMedalImages } from "@/lib/data/medals";
import { formatNumber, resolveMediaUrl, cn } from "@/lib/utils";
import { ItemPlaceholder } from "@/components/museum/item-placeholder";
import { authenticityLabel, qualityLabel } from "@/lib/medal-labels";
import type { Medal, MedalImage, MuseumMedal } from "@/types/api";

function primaryUrl(m: MuseumMedal | Medal): string | null {
  const any = m as { primary_image_url?: string | null; primary_image?: string };
  return resolveMediaUrl(any.primary_image_url || any.primary_image || null);
}

type Side = "front" | "back";

function pickImage(
  images: { id: string | number; url: string | null; type?: string | null }[],
  side: Side
) {
  const keys =
    side === "front"
      ? ["front", "obverse", "رو"]
      : ["back", "reverse", "پشت"];
  const found = images.find((img) =>
    keys.some((k) => (img.type || "").toLowerCase().includes(k))
  );
  return found ?? (side === "front" ? images[0] : images[1] ?? images[0]);
}

export default function MuseumMedalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const medalId = Number(id);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const [side, setSide] = useState<Side>("front");
  const [zoom, setZoom] = useState(1);
  const [museumMode, setMuseumMode] = useState(false);
  const [activeId, setActiveId] = useState<string | number | null>(null);

  const { data: medal, isLoading, isError } = useQuery({
    queryKey: ["mu-medal", medalId],
    enabled: isHydrated && !Number.isNaN(medalId),
    queryFn: () => getMuseumMedal(medalId),
  });

  const { data: imagesFallback } = useQuery({
    queryKey: ["mu-medal-imgs", medalId],
    enabled: isHydrated && !Number.isNaN(medalId) && Boolean(medal),
    queryFn: () => getMedalImages(medalId),
  });

  const { data: related } = useQuery({
    queryKey: ["mu-related", medal?.country, medal?.category],
    queryFn: () =>
      getMedals({
        page: 1,
        country: medal?.country || undefined,
        category: medal?.category ?? undefined,
        ordering: "-year",
      }),
    enabled: isHydrated && Boolean(medal),
  });

  const images = useMemo(() => {
    const fromMuseum = (medal?.images ?? []) as MedalImage[];
    const list =
      fromMuseum.length > 0 ? fromMuseum : (imagesFallback ?? []);
    if (list.length === 0 && medal) {
      const u = primaryUrl(medal);
      if (u) return [{ id: "primary", url: u, type: "front" as string | null }];
    }
    return list.map((img) => ({
      id: img.id,
      url: img.image_url || img.image,
      type: img.image_type ?? null,
    }));
  }, [medal, imagesFallback]);

  useEffect(() => {
    if (images.length && activeId == null) {
      setActiveId(images[0]!.id);
    }
  }, [images, activeId]);

  const current =
    images.find((i) => i.id === activeId) ??
    pickImage(images, side) ??
    images[0];
  const src = current ? resolveMediaUrl(current.url) : null;

  const hasBack =
    images.length > 1 ||
    images.some((i) => {
      const t = (i.type || "").toLowerCase();
      return t.includes("back") || t.includes("reverse");
    });

  const switchSide = useCallback(
    (next: Side) => {
      setSide(next);
      const img = pickImage(images, next);
      if (img) setActiveId(img.id);
      setZoom(1);
    },
    [images]
  );

  useEffect(() => {
    if (!museumMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMuseumMode(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [museumMode]);

  const relatedList = useMemo(() => {
    return ((related?.results ?? []) as Medal[])
      .filter((m) => m.id !== medalId)
      .slice(0, 5);
  }, [related, medalId]);

  if (isLoading) {
    return <div className="min-h-[70vh] museum-shimmer bg-[#F7F5F2]" />;
  }

  if (isError || !medal) {
    return (
      <div className="mu-ivory px-5 py-24 text-center">
        <p className="text-danger">اثر یافت نشد.</p>
        <Link href="/museum/medals" className="mt-4 inline-block text-sm text-primary">
          بازگشت به آرشیو
        </Link>
      </div>
    );
  }

  const archiveNo = medal.catalog_number
    ? `MA-${medal.catalog_number}`
    : `MA-${String(medal.id).padStart(4, "0")}`;

  const meta: { label: string; value: string }[] = [
    { label: "YEAR", value: medal.year != null ? String(medal.year) : "" },
    { label: "COUNTRY", value: medal.country || "" },
    { label: "MATERIAL", value: medal.material || "" },
    {
      label: "WEIGHT",
      value: medal.weight != null ? `${formatNumber(medal.weight)} g` : "",
    },
    {
      label: "DIAMETER",
      value:
        medal.diameter != null ? `${formatNumber(medal.diameter)} mm` : "",
    },
    {
      label: "CATEGORY",
      value: medal.category_detail?.name || "",
    },
    { label: "QUALITY", value: qualityLabel(medal.quality) || "" },
    {
      label: "AUTHENTICITY",
      value: authenticityLabel(medal.authenticity) || "",
    },
    { label: "ARCHIVE", value: archiveNo },
  ].filter((x) => x.value);

  const story = medal.notes?.trim() || "";

  const prev = relatedList[0];
  const next = relatedList[1] ?? relatedList[0];

  return (
    <article className="mu-ivory">
      <div className="mu-container max-w-3xl pb-8 pt-10 sm:pt-14">
        <nav className="text-[0.65rem] tracking-[0.14em] text-text-subtle">
          <Link href="/museum" className="hover:text-primary">
            خانه
          </Link>
          <span className="mx-2 opacity-40">/</span>
          <Link href="/museum/medals" className="hover:text-primary">
            مدال‌ها
          </Link>
          <span className="mx-2 opacity-40">/</span>
          <span className="text-text-muted">{medal.name}</span>
        </nav>

        <header className="mt-10 text-center">
          <p className="mu-label text-primary">MEDAL  ·  {archiveNo}</p>
          <h1 className="museum-serif mt-4 text-3xl font-semibold leading-snug text-primary-deep sm:text-4xl">
            {medal.name}
          </h1>
          <p className="mt-3 text-sm text-text-muted">
            {[medal.year, medal.country, medal.category_detail?.name]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </header>

        <div className="mt-12">
          <div className="mu-object-stage relative overflow-hidden">
            <div
              className={cn(
                "flex items-center justify-center transition-transform duration-300",
                museumMode && "fixed inset-0 z-[80] bg-[#0a0809]"
              )}
            >
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt={medal.name}
                  className={cn(
                    "transition-transform duration-300",
                    museumMode ? "max-h-[85vh] max-w-[90vw] p-4" : ""
                  )}
                  style={{ transform: `scale(${zoom})` }}
                  draggable={false}
                />
              ) : (
                <ItemPlaceholder
                  kind="medal"
                  className="mx-auto h-64 w-64 opacity-50"
                />
              )}
              {museumMode ? (
                <button
                  type="button"
                  className="absolute top-6 left-1/2 -translate-x-1/2 text-white/50 hover:text-white"
                  onClick={() => {
                    setMuseumMode(false);
                    setZoom(1);
                  }}
                >
                  <X className="size-6" />
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="mu-ctrl text-text">
              {hasBack ? (
                <>
                  <button
                    type="button"
                    data-active={side === "front"}
                    onClick={() => switchSide("front")}
                    className="tracking-[0.12em]"
                  >
                    OBVERSE
                  </button>
                  <button
                    type="button"
                    data-active={side === "back"}
                    onClick={() => switchSide("back")}
                    className="tracking-[0.12em]"
                  >
                    REVERSE
                  </button>
                </>
              ) : null}
              <button
                type="button"
                aria-label="کوچک"
                onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
              >
                <ZoomOut className="size-4" />
              </button>
              <button
                type="button"
                aria-label="بزرگ"
                onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
              >
                <ZoomIn className="size-4" />
              </button>
              <button
                type="button"
                aria-label="تمام‌صفحه"
                onClick={() => {
                  setMuseumMode(true);
                  setZoom(1);
                }}
              >
                <Maximize2 className="size-4" />
              </button>
            </div>

            {images.length > 1 ? (
              <div className="flex gap-2">
                {images.map((img) => {
                  const thumb = resolveMediaUrl(img.url);
                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => {
                        setActiveId(img.id);
                        setZoom(1);
                        const t = (img.type || "").toLowerCase();
                        if (t.includes("back") || t.includes("reverse"))
                          setSide("back");
                        else setSide("front");
                      }}
                      className={cn(
                        "h-12 w-12 overflow-hidden border transition",
                        activeId === img.id
                          ? "border-primary"
                          : "border-border opacity-70 hover:opacity-100"
                      )}
                    >
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumb}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="block h-full bg-surface-muted" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        <section className="mt-16 border-t border-border pt-12 sm:mt-20 sm:pt-16">
          <p className="mu-label text-center text-primary">Object Record</p>
          <dl className="mu-meta-grid mt-10">
            {meta.map((row) => (
              <div key={row.label} className="mu-meta-cell text-text">
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {story ? (
          <section className="mt-16 border-t border-border pt-12 sm:mt-20 sm:pt-16">
            <p className="mu-label text-center text-primary">The Story</p>
            <h2 className="museum-serif mt-3 text-center text-2xl font-semibold text-primary-deep">
              داستان اثر
            </h2>
            <div className="mu-narrow mt-10 space-y-5 text-center text-base leading-9 text-text-muted sm:text-[1.05rem]">
              {story.split(/\n+/).filter(Boolean).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {medal.year ? (
              <p className="museum-serif mt-12 text-center text-6xl font-semibold text-primary/10">
                {medal.year}
              </p>
            ) : null}
          </section>
        ) : null}

        <div className="mu-divider text-text-subtle">
          <span className="mu-label">{archiveNo}</span>
        </div>

        {relatedList.length > 0 ? (
          <section className="pb-8">
            <p className="mu-label text-center text-primary">Related Objects</p>
            <h2 className="museum-serif mt-2 text-center text-xl font-semibold text-primary-deep">
              آثار مرتبط
            </h2>
            <div className="mt-10 flex gap-4 overflow-x-auto pb-2">
              {relatedList.map((m) => {
                const u = resolveMediaUrl(
                  m.primary_image_url || m.primary_image
                );
                return (
                  <Link
                    key={m.id}
                    href={`/museum/medals/${m.id}`}
                    className="group w-36 shrink-0 text-center sm:w-40"
                  >
                    <div className="aspect-square overflow-hidden border border-border bg-white">
                      {u ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={u}
                          alt={m.name}
                          className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <ItemPlaceholder kind="medal" />
                      )}
                    </div>
                    <p className="mt-3 text-sm font-medium text-text line-clamp-2">
                      {m.name}
                    </p>
                    <p className="mt-1 text-xs text-text-subtle">
                      {[m.year, m.country].filter(Boolean).join(" · ")}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

        <nav className="mt-8 flex items-center justify-between border-t border-border pt-8 pb-16 text-sm">
          {prev ? (
            <Link
              href={`/museum/medals/${prev.id}`}
              className="inline-flex items-center gap-1 text-text-muted transition hover:text-primary"
            >
              <ChevronRight className="size-4" />
              <span className="max-w-[8rem] truncate sm:max-w-[12rem]">
                {prev.name}
              </span>
            </Link>
          ) : (
            <span />
          )}
          <Link
            href="/museum/medals"
            className="mu-label text-primary hover:text-primary-deep"
          >
            آرشیو
          </Link>
          {next ? (
            <Link
              href={`/museum/medals/${next.id}`}
              className="inline-flex items-center gap-1 text-text-muted transition hover:text-primary"
            >
              <span className="max-w-[8rem] truncate sm:max-w-[12rem]">
                {next.name}
              </span>
              <ChevronLeft className="size-4" />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </article>
  );
}
