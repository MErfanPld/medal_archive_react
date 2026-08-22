"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, ZoomIn, ZoomOut, Maximize2, RotateCcw } from "lucide-react";
import { cn, resolveMediaUrl } from "@/lib/utils";
import { ItemPlaceholder } from "@/components/museum/item-placeholder";

export type ViewerImage = {
  id: string | number;
  url: string | null;
  type?: string | null;
  caption?: string | null;
};

type Props = {
  images: ViewerImage[];
  title: string;
  kind?: "medal" | "coin";
  className?: string;
};

function pickSide(images: ViewerImage[], side: "front" | "back") {
  const keys =
    side === "front"
      ? ["front", "obverse", "رو"]
      : ["back", "reverse", "پشت"];
  const found = images.find((img) =>
    keys.some((k) => (img.type || "").toLowerCase().includes(k))
  );
  return found ?? (side === "front" ? images[0] : images[1] ?? images[0]);
}

export function ObjectViewer({
  images,
  title,
  kind = "medal",
  className,
}: Props) {
  const list = images.length
    ? images
    : [{ id: "empty", url: null, type: "front" }];
  const [side, setSide] = useState<"front" | "back">("front");
  const [activeId, setActiveId] = useState<string | number>(list[0]!.id);
  const [museumMode, setMuseumMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [flipping, setFlipping] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const current =
    list.find((i) => i.id === activeId) ??
    pickSide(list, side) ??
    list[0]!;
  const src = resolveMediaUrl(current.url);

  const hasBack =
    list.length > 1 ||
    list.some((i) => {
      const t = (i.type || "").toLowerCase();
      return t.includes("back") || t.includes("reverse") || t.includes("پشت");
    });

  const flip = useCallback(() => {
    if (!hasBack || list.length < 2) return;
    setFlipping(true);
    window.setTimeout(() => {
      const next = side === "front" ? "back" : "front";
      const img = pickSide(list, next);
      if (img) setActiveId(img.id);
      setSide(next);
      setFlipping(false);
      setZoom(1);
    }, 280);
  }, [hasBack, list, side]);

  useEffect(() => {
    if (!museumMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMuseumMode(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [museumMode]);

  const stage = (
    <div
      ref={stageRef}
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        museumMode
          ? "fixed inset-0 z-[80] bg-[#0a0809]"
          : "aspect-square w-full max-h-[78vh] bg-transparent",
        className
      )}
    >
      <div
        className={cn(
          "relative flex h-full w-full max-w-3xl items-center justify-center transition-transform duration-500",
          flipping && "scale-95 opacity-40",
          kind === "coin" && !museumMode && "museum-coin-ring max-w-md"
        )}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={title}
            className={cn(
              "max-h-full max-w-full object-contain transition-transform duration-300 ease-out",
              museumMode ? "max-h-[85vh]" : "max-h-[70vh]"
            )}
            style={{ transform: `scale(${zoom})` }}
            draggable={false}
          />
        ) : (
          <ItemPlaceholder kind={kind} className="h-64 w-64 opacity-60" />
        )}
      </div>

      <div
        className={cn(
          "absolute flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2 py-1.5 backdrop-blur-md",
          museumMode
            ? "bottom-8 left-1/2 -translate-x-1/2"
            : "bottom-4 left-1/2 -translate-x-1/2"
        )}
      >
        <button
          type="button"
          aria-label="کوچک‌نمایی"
          className="flex size-9 items-center justify-center text-white/70 transition hover:text-white"
          onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
        >
          <ZoomOut className="size-4" />
        </button>
        <button
          type="button"
          aria-label="بزرگ‌نمایی"
          className="flex size-9 items-center justify-center text-white/70 transition hover:text-white"
          onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
        >
          <ZoomIn className="size-4" />
        </button>
        {hasBack ? (
          <button
            type="button"
            aria-label="چرخش رو / پشت"
            className="flex size-9 items-center justify-center text-white/70 transition hover:text-white"
            onClick={flip}
          >
            <RotateCcw className="size-4" />
          </button>
        ) : null}
        <button
          type="button"
          aria-label={museumMode ? "خروج از حالت موزه" : "حالت موزه"}
          className="flex size-9 items-center justify-center text-white/70 transition hover:text-white"
          onClick={() => {
            setMuseumMode((v) => !v);
            setZoom(1);
          }}
        >
          {museumMode ? <X className="size-4" /> : <Maximize2 className="size-4" />}
        </button>
      </div>

      {museumMode ? (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center">
          <p className="text-[0.65rem] tracking-[0.25em] text-white/40">{title}</p>
          <p className="mt-2 text-xs text-white/30">
            {side === "front" ? "OBVERSE" : "REVERSE"} · Esc برای خروج
          </p>
        </div>
      ) : null}
    </div>
  );

  return (
    <div>
      {stage}
      {!museumMode && list.length > 0 ? (
        <div className="mt-6 flex flex-col items-center gap-4">
          {hasBack ? (
            <div className="flex gap-6 text-[0.65rem] tracking-[0.22em]">
              <button
                type="button"
                onClick={() => {
                  setSide("front");
                  const img = pickSide(list, "front");
                  if (img) setActiveId(img.id);
                  setZoom(1);
                }}
                className={cn(
                  "pb-1 transition",
                  side === "front"
                    ? "border-b border-[#c4a574] text-[#c4a574]"
                    : "text-white/35 hover:text-white/70"
                )}
              >
                OBVERSE
              </button>
              <button
                type="button"
                onClick={() => {
                  setSide("back");
                  const img = pickSide(list, "back");
                  if (img) setActiveId(img.id);
                  setZoom(1);
                }}
                className={cn(
                  "pb-1 transition",
                  side === "back"
                    ? "border-b border-[#c4a574] text-[#c4a574]"
                    : "text-white/35 hover:text-white/70"
                )}
              >
                REVERSE
              </button>
            </div>
          ) : null}
          {list.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {list.map((img) => {
                const thumb = resolveMediaUrl(img.url);
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => {
                      setActiveId(img.id);
                      setZoom(1);
                      const t = (img.type || "").toLowerCase();
                      if (t.includes("back") || t.includes("reverse")) setSide("back");
                      else setSide("front");
                    }}
                    className={cn(
                      "relative h-14 w-14 shrink-0 overflow-hidden border transition",
                      activeId === img.id
                        ? "border-[#c4a574]"
                        : "border-white/15 opacity-70 hover:opacity-100"
                    )}
                  >
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full items-center justify-center bg-white/5 text-[0.55rem] text-white/40">
                        —
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
