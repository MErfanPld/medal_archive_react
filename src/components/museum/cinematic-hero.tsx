"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, resolveMediaUrl } from "@/lib/utils";
import { ItemPlaceholder } from "@/components/museum/item-placeholder";

export interface CinematicSlide {
  id: string | number;
  href: string;
  title: string;
  subtitle?: string | null;
  year?: string | number | null;
  country?: string | null;
  category?: string | null;
  image?: string | null;
  kind?: "medal" | "coin";
}

interface CinematicHeroProps {
  slides: CinematicSlide[];
  autoMs?: number;
}

export function CinematicHero({ slides, autoMs = 6500 }: CinematicHeroProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = slides.length;

  const go = useCallback(
    (dir: 1 | -1) => {
      if (!total) return;
      setIndex((i) => (i + dir + total) % total);
    },
    [total]
  );

  useEffect(() => {
    if (paused || total < 2) return;
    const t = window.setInterval(() => go(1), autoMs);
    return () => window.clearInterval(t);
  }, [paused, total, autoMs, go]);

  if (!total) {
    return (
      <section className="relative flex min-h-[70vh] items-center justify-center bg-[#1a1614] text-white">
        <div className="px-6 text-center">
          <p className="museum-label text-white/40">Digital Museum</p>
          <h1 className="museum-serif mt-4 text-4xl font-semibold sm:text-5xl">
            میراثی که زمان را پشت سر گذاشته است
          </h1>
          <Link
            href="/museum/medals"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-white"
          >
            کاوش مجموعه
            <ArrowLeft className="size-4" />
          </Link>
        </div>
      </section>
    );
  }

  const slide = slides[index]!;

  return (
    <section
      className="relative isolate min-h-[78vh] overflow-hidden bg-[#0D0B0C] text-white sm:min-h-[85vh]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((s, i) => {
        const src = resolveMediaUrl(s.image);
        return (
          <div
            key={s.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              i === index ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            aria-hidden={i !== index}
          >
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt=""
                className={cn(
                  "h-full w-full object-cover transition-transform duration-[6s] ease-out",
                  i === index ? "scale-105" : "scale-100"
                )}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#1a1614]">
                <ItemPlaceholder kind={s.kind ?? "medal"} className="max-h-80 max-w-80 opacity-80" />
              </div>
            )}
          </div>
        );
      })}

      <div className="absolute inset-0 bg-gradient-to-l from-[#0D0B0C]/25 via-[#0D0B0C]/55 to-[#0D0B0C]/92" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B0C] via-transparent to-[#0D0B0C]/40" />

      <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-5 pb-14 pt-28 sm:min-h-[85vh] sm:px-8 sm:pb-16 lg:px-10">
        <div className="max-w-xl museum-reveal">
          <p className="museum-label text-[#c4a574]/90">
            {[slide.category, slide.kind === "coin" ? "Coin" : "Medal"]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <h1 className="museum-serif mt-4 text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.35rem]">
            {slide.title}
          </h1>
          {slide.subtitle ? (
            <p className="mt-2 text-sm tracking-wide text-white/55 sm:text-base">{slide.subtitle}</p>
          ) : null}
          <p className="mt-4 text-sm text-white/70 sm:text-base">
            {[slide.country, slide.year].filter(Boolean).join(" · ")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={slide.href}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-white shadow-lg shadow-primary/30 transition hover:bg-primary-deep"
            >
              مشاهده جزئیات
              <ArrowLeft className="size-4" />
            </Link>
            <Link
              href="/museum/medals"
              className="inline-flex h-12 items-center rounded-full border border-white/25 bg-white/5 px-6 text-sm font-medium text-white backdrop-blur transition hover:border-white/45 hover:bg-white/10"
            >
              کاوش مجموعه
            </Link>
          </div>
        </div>

        <div className="mt-12 flex items-end justify-between gap-4">
          <div className="min-w-[7rem]">
            <p className="text-xs tabular-nums tracking-[0.2em] text-white/55">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </p>
            <div className="museum-progress mt-3 w-28 sm:w-40">
              <span style={{ width: `${((index + 1) / total) * 100}%` }} />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              className="flex size-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:bg-white/15"
              aria-label="اسلاید قبلی"
            >
              <ChevronRight className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="flex size-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:bg-white/15"
              aria-label="اسلاید بعدی"
            >
              <ChevronLeft className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
