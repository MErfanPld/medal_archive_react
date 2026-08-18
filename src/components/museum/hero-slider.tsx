"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HeroSlide {
  id: string | number;
  title: string;
  subtitle?: string;
  meta?: string;
  href?: string;
  image?: string | null;
  cta?: string;
  accent?: string;
}

function mediaOk(src?: string | null) {
  if (!src) return false;
  const s = String(src);
  return s.length > 2 && !s.startsWith("0");
}

interface HeroSliderProps {
  slides: HeroSlide[];
  intervalMs?: number;
  className?: string;
  heightClass?: string;
}

export function HeroSlider({
  slides,
  intervalMs = 5500,
  className,
  heightClass = "h-[min(70vh,32rem)]",
}: HeroSliderProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const go = useCallback(
    (dir: 1 | -1) => {
      if (count === 0) return;
      setIndex((i) => (i + dir + count) % count);
    },
    [count]
  );

  useEffect(() => {
    if (count <= 1 || paused) return;
    const t = window.setInterval(() => go(1), intervalMs);
    return () => window.clearInterval(t);
  }, [count, paused, intervalMs, go]);

  if (count === 0) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-bl from-primary/15 via-surface to-surface-muted",
          heightClass,
          className
        )}
      >
        <div className="flex h-full items-center justify-center text-text-muted">
          هنوز اثری برای نمایش نیست
        </div>
      </div>
    );
  }

  const slide = slides[index]!;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-border/50 shadow-xl shadow-primary/10",
        heightClass,
        className
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute inset-0 bg-primary-deep" />
      {mediaOk(slide.image) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={slide.id}
          src={String(slide.image)}
          alt=""
          className="museum-hero-slide absolute inset-0 h-full w-full object-cover opacity-55"
        />
      ) : (
        <div
          key={slide.id}
          className="museum-hero-slide absolute inset-0 bg-gradient-to-br from-primary via-primary-deep to-[#1a0a0d]"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(155,58,73,0.35),transparent_55%)]" />

      <div className="relative z-10 flex h-full flex-col justify-end p-6 sm:p-10 lg:p-12">
        <div className="museum-hero-slide max-w-xl space-y-3 text-white">
          {slide.meta && (
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">
              {slide.meta}
            </p>
          )}
          <h2 className="text-2xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p className="max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
              {slide.subtitle}
            </p>
          )}
          {slide.href && (
            <Link
              href={slide.href}
              className="mt-2 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-primary-deep shadow-lg transition hover:bg-primary hover:text-white"
            >
              {slide.cta || "مشاهده اثر"}
              <ChevronLeft className="size-4" />
            </Link>
          )}
        </div>

        {count > 1 && (
          <div className="mt-8 flex items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`اسلاید ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "museum-dot h-1.5 rounded-full",
                  i === index
                    ? "w-8 bg-white"
                    : "w-2.5 bg-white/40 hover:bg-white/70"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="قبلی"
            onClick={() => go(-1)}
            className="absolute right-3 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur transition hover:bg-black/50 sm:right-5"
          >
            <ChevronRight className="size-5" />
          </button>
          <button
            type="button"
            aria-label="بعدی"
            onClick={() => go(1)}
            className="absolute left-3 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur transition hover:bg-black/50 sm:left-5"
          >
            <ChevronLeft className="size-5" />
          </button>
        </>
      )}
    </div>
  );
}
