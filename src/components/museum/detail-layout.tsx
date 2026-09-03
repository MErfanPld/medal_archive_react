"use client";

import Link from "next/link";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  ImageOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { resolveMediaUrl } from "@/lib/utils";

export type DetailImage = {
  id: string | number;
  url: string | null;
  caption?: string;
};

export type DetailMeta = { label: string; value: string };

export type DetailSection = {
  title: string;
  items: DetailMeta[];
};

export type RelatedItem = {
  id: number;
  name: string;
  href: string;
  image?: string | null;
  subtitle?: string;
};

function sectionHasItems(s: DetailSection) {
  return s.items.some((i) => i.value && String(i.value).trim() !== "");
}

export function MuseumDetailLayout({
  breadcrumb,
  kicker,
  title,
  subtitle,
  images,
  activeId,
  onSelectImage,
  zoom,
  setZoom,
  museumMode,
  setMuseumMode,
  sections,
  meta,
  story,
  related,
  relatedLabel = "آثار مرتبط",
  archiveHref,
}: {
  breadcrumb: { href: string; label: string }[];
  kicker?: string;
  title: string;
  subtitle?: string;
  images: DetailImage[];
  activeId: string | number | null;
  onSelectImage: (id: string | number) => void;
  zoom: number;
  setZoom: (fn: (z: number) => number) => void;
  museumMode: boolean;
  setMuseumMode: (v: boolean) => void;
  sections?: DetailSection[];
  meta?: DetailMeta[];
  story?: string;
  related: RelatedItem[];
  relatedLabel?: string;
  archiveHref: string;
}) {
  const current =
    images.find((i) => i.id === activeId) ?? images[0] ?? null;
  const src = current ? resolveMediaUrl(current.url) : null;
  const idx = Math.max(
    0,
    images.findIndex((i) => i.id === (activeId ?? current?.id))
  );

  const resolvedSections: DetailSection[] =
    sections && sections.length
      ? sections.filter(sectionHasItems)
      : meta && meta.length
        ? [{ title: "مشخصات", items: meta.filter((m) => m.value) }]
        : [];

  const goPrev = () => {
    if (!images.length) return;
    const next = images[(idx - 1 + images.length) % images.length];
    if (next) onSelectImage(next.id);
  };
  const goNext = () => {
    if (!images.length) return;
    const next = images[(idx + 1) % images.length];
    if (next) onSelectImage(next.id);
  };

  return (
    <article className="mu-stage min-h-screen">
      <section className="relative h-[min(72vh,40rem)] w-full overflow-hidden bg-[#0a0a0a]">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={title}
            style={{ transform: `scale(${zoom})` }}
            className="h-full w-full object-cover transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-[#C8A75D]/40">
            <ImageOff className="size-16" strokeWidth={1} />
            <span className="text-sm tracking-[0.2em]">بدون تصویر</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/45 to-black/25" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="mu-container pb-10 pt-20">
            <nav className="text-[0.7rem] text-white/50">
              {breadcrumb.map((b, i) => (
                <span key={b.href + b.label}>
                  {i > 0 ? (
                    <span className="mx-1.5 text-white/25">/</span>
                  ) : null}
                  <Link href={b.href} className="transition hover:text-white">
                    {b.label}
                  </Link>
                </span>
              ))}
            </nav>
            {kicker ? (
              <p className="mt-5 text-[0.7rem] font-semibold tracking-[0.22em] text-[#C8A75D]">
                {kicker}
              </p>
            ) : null}
            <h1 className="museum-serif mt-3 max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/55">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        <div className="absolute left-4 top-1/2 hidden -translate-y-1/2 flex-col gap-2 sm:flex">
          {images.length > 1 ? (
            <>
              <button type="button" onClick={goPrev} className="rounded-full border border-white/15 bg-black/40 p-2.5 text-white backdrop-blur transition hover:border-[#C8A75D]/50 hover:text-[#C8A75D]" aria-label="قبلی">
                <ChevronRight className="size-4" />
              </button>
              <button type="button" onClick={goNext} className="rounded-full border border-white/15 bg-black/40 p-2.5 text-white backdrop-blur transition hover:border-[#C8A75D]/50 hover:text-[#C8A75D]" aria-label="بعدی">
                <ChevronLeft className="size-4" />
              </button>
            </>
          ) : null}
        </div>
        <div className="absolute bottom-6 left-5 flex gap-2 sm:left-auto sm:right-8">
          <button type="button" onClick={() => setZoom((z) => Math.min(2.2, z + 0.2))} className="rounded-full border border-white/15 bg-black/40 p-2 text-white backdrop-blur" aria-label="بزرگنمایی">
            <ZoomIn className="size-4" />
          </button>
          <button type="button" onClick={() => setZoom((z) => Math.max(1, z - 0.2))} className="rounded-full border border-white/15 bg-black/40 p-2 text-white backdrop-blur" aria-label="کوچک‌نمایی">
            <ZoomOut className="size-4" />
          </button>
          {src ? (
            <button type="button" onClick={() => setMuseumMode(true)} className="rounded-full border border-white/15 bg-black/40 p-2 text-white backdrop-blur" aria-label="تمام‌صفحه">
              <Maximize2 className="size-4" />
            </button>
          ) : null}
        </div>
      </section>

      {images.length > 1 ? (
        <div className="border-b border-white/5 bg-[#111]">
          <div className="mu-container flex gap-2 overflow-x-auto py-4">
            {images.map((img, i) => {
              const thumb = resolveMediaUrl(img.url);
              const active = img.id === (activeId ?? current?.id);
              return (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => {
                    onSelectImage(img.id);
                    setZoom(() => 1);
                  }}
                  className={`relative h-[4.75rem] w-[4.75rem] shrink-0 overflow-hidden border transition ${
                    active
                      ? "border-[#C8A75D] opacity-100"
                      : "border-white/10 opacity-55 hover:opacity-100"
                  }`}
                >
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt={img.caption || ""} className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-[0.65rem] text-white/40">{i + 1}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <section className="mu-container py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="space-y-12 lg:col-span-7">
            {resolvedSections.map((sec) => (
              <div key={sec.title}>
                <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-[#C8A75D]">
                  {sec.title}
                </p>
                <div className="mt-5 grid gap-0 sm:grid-cols-2">
                  {sec.items
                    .filter((m) => m.value && String(m.value).trim() !== "")
                    .map((m) => (
                      <div
                        key={sec.title + m.label}
                        className="flex items-baseline justify-between gap-3 border-b border-white/[0.06] py-3.5 sm:px-1"
                      >
                        <span className="shrink-0 text-[0.7rem] tracking-[0.1em] text-[#C8A75D]/90">
                          {m.label}
                        </span>
                        <span className="text-left text-sm font-medium text-[#F5F2EA]">
                          {m.value}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-5">
            <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-[#C8A75D]">روایت</p>
            <h2 className="museum-serif mt-2 text-2xl font-semibold text-white">درباره این اثر</h2>
            <p className="mt-6 text-base leading-9 text-white/60">
              {story?.trim() ||
                "این اثر در مجموعه آثار ناصر صلب ثبت و نگهداری شده است. تصاویر و مشخصات برای پژوهش و مستندسازی ارائه می‌شود."}
            </p>
            <Link
              href={archiveHref}
              className="mt-10 inline-flex items-center gap-2 border border-white/15 px-5 py-2.5 text-sm text-white/75 transition hover:border-[#C8A75D] hover:text-[#C8A75D]"
            >
              <ChevronLeft className="size-4" />
              بازگشت به آرشیو
            </Link>
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="border-t border-white/5 bg-[#0a0a0a] py-16 sm:py-20">
          <div className="mu-container">
            <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-[#C8A75D]">پیشنهاد مجموعه</p>
            <h2 className="museum-serif mt-2 text-2xl font-semibold text-white sm:text-3xl">
              {relatedLabel}
            </h2>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-5">
              {related.slice(0, 4).map((m) => {
                const rsrc = resolveMediaUrl(m.image || null);
                return (
                  <Link key={m.id} href={m.href} className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#111]">
                      {rsrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={rsrc} alt={m.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#C8A75D]/30">
                          <ImageOff className="size-8" strokeWidth={1.2} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <h3 className="line-clamp-2 text-sm font-medium text-white">{m.name}</h3>
                        {m.subtitle ? <p className="mt-1 text-xs text-white/45">{m.subtitle}</p> : null}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {museumMode && src ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/96 p-4 sm:p-10">
          <button type="button" onClick={() => setMuseumMode(false)} className="absolute top-5 left-5 rounded-full border border-white/15 bg-white/10 p-2.5 text-white" aria-label="بستن">
            <X className="size-5" />
          </button>
          {images.length > 1 ? (
            <>
              <button type="button" onClick={goPrev} className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full border border-white/15 bg-white/10 p-3 text-white" aria-label="قبلی">
                <ChevronRight className="size-5" />
              </button>
              <button type="button" onClick={goNext} className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full border border-white/15 bg-white/10 p-3 text-white" aria-label="بعدی">
                <ChevronLeft className="size-5" />
              </button>
            </>
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={title} className="max-h-full max-w-full object-contain" />
        </div>
      ) : null}
    </article>
  );
}
