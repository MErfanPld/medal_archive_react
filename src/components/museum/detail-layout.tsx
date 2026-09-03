"use client";

import Link from "next/link";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  ImageOff,
  ChevronLeft,
} from "lucide-react";
import { resolveMediaUrl } from "@/lib/utils";

export type DetailImage = {
  id: string | number;
  url: string | null;
};

export type DetailMeta = { label: string; value: string };

export type RelatedItem = {
  id: number;
  name: string;
  href: string;
  image?: string | null;
  subtitle?: string;
};

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
  meta: DetailMeta[];
  story?: string;
  related: RelatedItem[];
  relatedLabel?: string;
  archiveHref: string;
}) {
  const current =
    images.find((i) => i.id === activeId) ?? images[0] ?? null;
  const src = current ? resolveMediaUrl(current.url) : null;

  return (
    <article className="mu-stage min-h-screen">
      <section className="relative">
        <div className="relative mx-auto grid max-w-6xl gap-0 lg:grid-cols-12 lg:min-h-[min(82vh,52rem)]">
          <div className="relative bg-[#0a0a0a] lg:col-span-7">
            <div className="relative flex min-h-[18rem] items-center justify-center overflow-hidden sm:min-h-[26rem] lg:min-h-full">
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt={title}
                  style={{ transform: `scale(${zoom})` }}
                  className="max-h-[70vh] w-full object-contain transition-transform duration-500 ease-out lg:max-h-none lg:h-full lg:object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 py-24 text-[#C8A75D]/45">
                  <ImageOff className="size-14" strokeWidth={1.1} />
                  <span className="text-xs tracking-[0.2em]">بدون تصویر</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d]/80 via-transparent to-transparent lg:bg-gradient-to-l lg:from-transparent lg:to-[#0d0d0d]/30" />
              <div className="absolute bottom-4 left-4 flex gap-2">
                <button type="button" onClick={() => setZoom((z) => Math.min(2.4, z + 0.2))} className="rounded-full border border-white/10 bg-black/40 p-2.5 text-white backdrop-blur transition hover:border-[#C8A75D]/50 hover:text-[#C8A75D]" aria-label="بزرگنمایی">
                  <ZoomIn className="size-4" />
                </button>
                <button type="button" onClick={() => setZoom((z) => Math.max(1, z - 0.2))} className="rounded-full border border-white/10 bg-black/40 p-2.5 text-white backdrop-blur transition hover:border-[#C8A75D]/50 hover:text-[#C8A75D]" aria-label="کوچک‌نمایی">
                  <ZoomOut className="size-4" />
                </button>
                {src ? (
                  <button type="button" onClick={() => setMuseumMode(true)} className="rounded-full border border-white/10 bg-black/40 p-2.5 text-white backdrop-blur transition hover:border-[#C8A75D]/50 hover:text-[#C8A75D]" aria-label="تمام‌صفحه">
                    <Maximize2 className="size-4" />
                  </button>
                ) : null}
              </div>
            </div>
            {images.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto border-t border-white/5 bg-[#111] px-3 py-3">
                {images.map((img) => {
                  const thumb = resolveMediaUrl(img.url);
                  const active = img.id === (activeId ?? current?.id);
                  return (
                    <button key={img.id} type="button" onClick={() => onSelectImage(img.id)} className={`relative h-16 w-16 shrink-0 overflow-hidden border transition ${
                        active ? "border-[#C8A75D] opacity-100" : "border-white/10 opacity-60 hover:opacity-100"
                      }`}>
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col justify-center border-t border-white/5 bg-[#111] px-6 py-10 sm:px-10 lg:col-span-5 lg:border-t-0 lg:border-r border-white/5">
            <nav className="text-[0.7rem] text-white/40">
              {breadcrumb.map((b, i) => (
                <span key={b.href + b.label}>
                  {i > 0 ? <span className="mx-1.5">/</span> : null}
                  <Link href={b.href} className="transition hover:text-white">{b.label}</Link>
                </span>
              ))}
            </nav>
            {kicker ? (
              <p className="mt-6 text-[0.7rem] font-semibold tracking-[0.22em] text-[#C8A75D]">{kicker}</p>
            ) : null}
            <h1 className="museum-serif mt-3 text-3xl font-semibold leading-snug text-white sm:text-4xl">{title}</h1>
            {subtitle ? <p className="mt-3 text-sm leading-7 text-white/50">{subtitle}</p> : null}
            <div className="mt-8 h-px w-16 bg-[#C8A75D]/60" />
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5">
              {meta.map((m) => (
                <div key={m.label}>
                  <dt className="text-[0.65rem] tracking-[0.14em] text-[#C8A75D]/90">{m.label}</dt>
                  <dd className="mt-1.5 text-sm font-medium text-[#F5F2EA]">{m.value}</dd>
                </div>
              ))}
            </dl>
            {story ? (
              <div className="mt-10">
                <p className="text-[0.65rem] tracking-[0.18em] text-[#C8A75D]">روایت تاریخی</p>
                <p className="mt-3 text-sm leading-8 text-white/55">{story}</p>
              </div>
            ) : null}
            <Link href={archiveHref} className="mt-10 inline-flex w-fit items-center gap-2 border border-white/15 px-5 py-2.5 text-sm text-white/80 transition hover:border-[#C8A75D] hover:text-[#C8A75D]">
              <ChevronLeft className="size-4" />
              بازگشت به آرشیو
            </Link>
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="border-t border-white/5 py-16 sm:py-20">
          <div className="mu-container">
            <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-[#C8A75D]">پیشنهاد آرشیو</p>
            <h2 className="museum-serif mt-2 text-2xl font-semibold sm:text-3xl">{relatedLabel}</h2>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-5">
              {related.slice(0, 4).map((m) => {
                const rsrc = resolveMediaUrl(m.image || null);
                return (
                  <Link key={m.id} href={m.href} className="mu-item-card group">
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#0d0d0d]">
                      {rsrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={rsrc} alt={m.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#C8A75D]/35">
                          <ImageOff className="size-8" strokeWidth={1.2} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <h3 className="line-clamp-2 text-sm font-medium text-white">{m.name}</h3>
                        {m.subtitle ? <p className="mt-1 text-xs text-white/50">{m.subtitle}</p> : null}
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
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/95 p-4 sm:p-8">
          <button type="button" onClick={() => setMuseumMode(false)} className="absolute top-5 left-5 rounded-full border border-white/15 bg-white/10 p-2.5 text-white" aria-label="بستن">
            <X className="size-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={title} className="max-h-full max-w-full object-contain" />
        </div>
      ) : null}
    </article>
  );
}
