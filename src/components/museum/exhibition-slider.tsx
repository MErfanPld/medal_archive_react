"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, resolveMediaUrl } from "@/lib/utils";
import { ItemPlaceholder } from "@/components/museum/item-placeholder";

export type ExhibitionSlide = {
  id: string | number;
  href: string;
  title: string;
  archiveNo?: string | null;
  year?: string | number | null;
  country?: string | null;
  category?: string | null;
  image?: string | null;
  kind?: "medal" | "coin";
};

export function ExhibitionSlider({
  slides,
  autoMs = 7000,
}: {
  slides: ExhibitionSlide[];
  autoMs?: number;
}) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = slides.length;

  const step = useCallback(
    (d: 1 | -1) => {
      if (!n) return;
      setI((x) => (x + d + n) % n);
    },
    [n]
  );

  useEffect(() => {
    if (paused || n < 2) return;
    const id = window.setInterval(() => step(1), autoMs);
    return () => window.clearInterval(id);
  }, [paused, n, autoMs, step]);

  if (!n) {
    return (
      <section className="ex-room-dark flex min-h-[88vh] items-center justify-center px-6">
        <div className="max-w-lg text-center ex-reveal">
          <p className="ex-label text-[#c4a574]/80">THE ARCHIVE / 00</p>
          <h1 className="museum-serif mt-6 text-4xl font-semibold leading-tight sm:text-5xl">
            آثاری که تاریخ را روایت می‌کنند
          </h1>
          <Link
            href="/museum/medals"
            className="mt-10 inline-block border border-white/25 px-8 py-3 text-sm tracking-wide transition hover:border-[#c4a574] hover:text-[#c4a574]"
          >
            ورود به آرشیو
          </Link>
        </div>
      </section>
    );
  }

  const s = slides[i]!;

  return (
    <section
      className="ex-room-dark relative isolate min-h-[92vh] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, idx) => {
        const src = resolveMediaUrl(slide.image);
        return (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-[900ms] ease-out",
              idx === i ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          >
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt=""
                className={cn(
                  "h-full w-full object-cover transition-transform duration-[8s] ease-out",
                  idx === i ? "scale-[1.06]" : "scale-100"
                )}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#161214]">
                <ItemPlaceholder kind={slide.kind ?? "medal"} className="h-64 w-64 opacity-70" />
              </div>
            )}
          </div>
        );
      })}

      <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B0C] via-[#0D0B0C]/35 to-[#0D0B0C]/55" />
      <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#0D0B0C]/80" />

      <div className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-end px-5 pb-12 pt-28 sm:px-8 sm:pb-16 lg:px-10">
        <div className="max-w-md ex-reveal">
          <p className="ex-label text-[#c4a574]">
            THE ARCHIVE / {String(i + 1).padStart(2, "0")}
          </p>
          {s.archiveNo ? (
            <p className="mt-4 text-xs tracking-[0.25em] text-white/40">{s.archiveNo}</p>
          ) : null}
          <h1 className="museum-serif mt-3 text-[2.35rem] font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.5rem]">
            {s.title}
          </h1>
          <p className="mt-4 text-sm text-white/65 sm:text-base">
            {[s.country, s.year, s.category].filter(Boolean).join("  ·  ")}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href={s.href}
              className="border border-white/30 bg-white/5 px-7 py-3 text-sm tracking-wide text-white backdrop-blur-sm transition hover:border-[#c4a574] hover:text-[#c4a574]"
            >
              مشاهده اثر
            </Link>
            <Link
              href="/museum/medals"
              className="px-5 py-3 text-sm tracking-wide text-white/55 transition hover:text-white"
            >
              ورود به آرشیو
            </Link>
          </div>
        </div>

        <div className="mt-14 flex items-center justify-between gap-6 border-t border-white/10 pt-6">
          <div className="w-36 sm:w-48">
            <p className="text-[0.65rem] tabular-nums tracking-[0.3em] text-white/45">
              {String(i + 1).padStart(2, "0")} — {String(n).padStart(2, "0")}
            </p>
            <div className="ex-progress mt-3">
              <i style={{ width: `${((i + 1) / n) * 100}%` }} />
            </div>
          </div>
          <div className="flex gap-1">
            <button type="button" aria-label="قبلی" onClick={() => step(-1)} className="flex size-10 items-center justify-center text-white/50 transition hover:text-white">
              <ChevronRight className="size-5" />
            </button>
            <button type="button" aria-label="بعدی" onClick={() => step(1)} className="flex size-10 items-center justify-center text-white/50 transition hover:text-white">
              <ChevronLeft className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
