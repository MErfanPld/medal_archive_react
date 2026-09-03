"use client";

import Link from "next/link";
import { ZoomIn, ZoomOut, Maximize2, X, ImageOff } from "lucide-react";
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
  archiveLabel,
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
  archiveLabel: string;
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
      <header className="mu-detail-hero">
        <div className="mu-container">
          <nav className="mu-anim-rise text-[0.65rem] tracking-[0.2em] text-white/40">
            {breadcrumb.map((b, i) => (
              <span key={b.href + b.label}>
                {i > 0 ? <span className="mx-2">/</span> : null}
                <Link href={b.href} className="hover:text-white">
                  {b.label}
                </Link>
              </span>
            ))}
            <span className="mx-2">/</span>
            <span className="text-[#C8A75D]">{archiveLabel}</span>
          </nav>
          <p className="mu-label mu-anim-rise mt-8">{archiveLabel}</p>
          <h1 className="museum-serif mu-anim-rise mt-3 max-w-3xl text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mu-anim-rise mt-4 text-sm text-white/55">{subtitle}</p>
          ) : null}
        </div>
      </header>

      <div className="mu-container py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="mu-anim-rise lg:col-span-7">
            <div className="mu-detail-gallery">
              <div className="relative flex min-h-[20rem] items-center justify-center bg-[#0d0d0d] sm:min-h-[28rem]">
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt={title}
                    style={{ transform: `scale(${zoom})` }}
                    className="max-h-[65vh] w-full object-contain transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 py-20 text-[#C8A75D]/50">
                    <ImageOff className="size-12" strokeWidth={1.25} />
                    <span className="text-[0.65rem] tracking-[0.16em] uppercase">
                      بدون تصویر
                    </span>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
                    className="rounded-full bg-black/50 p-2 text-white backdrop-blur hover:bg-black/70"
                    aria-label="بزرگنمایی"
                  >
                    <ZoomIn className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
                    className="rounded-full bg-black/50 p-2 text-white backdrop-blur hover:bg-black/70"
                    aria-label="کوچک‌نمایی"
                  >
                    <ZoomOut className="size-4" />
                  </button>
                  {src ? (
                    <button
                      type="button"
                      onClick={() => setMuseumMode(true)}
                      className="rounded-full bg-black/50 p-2 text-white backdrop-blur hover:bg-black/70"
                      aria-label="تمام‌صفحه"
                    >
                      <Maximize2 className="size-4" />
                    </button>
                  ) : null}
                </div>
              </div>
              {images.length > 1 ? (
                <div className="mu-detail-thumbs">
                  {images.map((img) => {
                    const thumb = resolveMediaUrl(img.url);
                    return (
                      <button
                        key={img.id}
                        type="button"
                        data-active={String(
                          img.id === (activeId ?? current?.id)
                        )}
                        onClick={() => onSelectImage(img.id)}
                      >
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumb}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mu-anim-rise lg:col-span-5">
            <p className="mu-label">Specifications</p>
            <h2 className="museum-serif mt-2 text-2xl font-semibold">
              مشخصات اثر
            </h2>
            <dl className="mu-detail-meta mt-8">
              {meta.map((m) => (
                <div key={m.label}>
                  <dt>{m.label}</dt>
                  <dd>{m.value}</dd>
                </div>
              ))}
            </dl>
            {story ? (
              <div className="mt-10">
                <p className="mu-label">Historical note</p>
                <p className="mt-3 text-sm leading-8 text-[#A8A8A8]">{story}</p>
              </div>
            ) : null}
            <div className="mt-10">
              <Link href={archiveHref} className="mu-btn mu-btn-ghost text-sm">
                بازگشت به آرشیو
              </Link>
            </div>
          </div>
        </div>

        {related.length > 0 ? (
          <section className="mt-16 border-t border-white/5 pt-14">
            <p className="mu-label">Related</p>
            <h2 className="museum-serif mt-2 text-2xl font-semibold">
              {relatedLabel}
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
              {related.slice(0, 4).map((m) => {
                const rsrc = resolveMediaUrl(m.image || null);
                return (
                  <Link key={m.id} href={m.href} className="mu-item-card">
                    <div className="relative aspect-square overflow-hidden bg-[#0d0d0d]">
                      {rsrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={rsrc}
                          alt={m.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#C8A75D]/40">
                          <ImageOff className="size-8" strokeWidth={1.25} />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1 p-4">
                      <h3 className="line-clamp-2 text-sm font-medium text-[#F5F2EA]">
                        {m.name}
                      </h3>
                      {m.subtitle ? (
                        <p className="text-xs text-[#A8A8A8]">{m.subtitle}</p>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>

      {museumMode && src ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/95 p-6">
          <button
            type="button"
            onClick={() => setMuseumMode(false)}
            className="absolute top-5 left-5 rounded-full bg-white/10 p-2 text-white"
            aria-label="بستن"
          >
            <X className="size-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={title}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      ) : null}
    </article>
  );
}
