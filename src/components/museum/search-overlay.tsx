"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const POPULAR = ["ایران", "المپیک", "نقره", "نظامی", "یادبود", "سکه"];

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const go = (term: string) => {
    const value = term.trim();
    onClose();
    if (!value) {
      router.push("/museum/medals");
      return;
    }
    router.push(`/museum/medals?q=${encodeURIComponent(value)}`);
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex flex-col bg-[#0D0B0C]/92 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label="جستجو در آرشیو"
    >
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pt-8 sm:pt-16">
        <div className="flex items-center gap-3 border-b border-white/15 pb-4">
          <Search className="size-5 shrink-0 text-white/50" aria-hidden />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") go(q);
            }}
            placeholder="نام، کشور، سال، دوره تاریخی یا نوع اثر…"
            className="w-full bg-transparent text-lg text-white placeholder:text-white/35 outline-none sm:text-2xl"
            aria-label="جستجو"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="بستن"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-10 space-y-8">
          <div>
            <p className="museum-label text-white/40">جستجوهای پرتکرار</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {POPULAR.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => go(term)}
                  className={cn(
                    "rounded-full border border-white/15 px-4 py-2 text-sm text-white/80",
                    "transition hover:border-white/35 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push("/museum/medals");
              }}
              className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-right transition hover:bg-white/10"
            >
              <span>
                <span className="block text-sm font-medium text-white">گالری مدال‌ها</span>
                <span className="mt-1 block text-xs text-white/45">آرشیو مدال و نشان</span>
              </span>
              <ArrowLeft className="size-4 text-white/40 transition group-hover:-translate-x-1 group-hover:text-white" />
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push("/museum/coins");
              }}
              className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-right transition hover:bg-white/10"
            >
              <span>
                <span className="block text-sm font-medium text-white">گالری سکه و پول</span>
                <span className="mt-1 block text-xs text-white/45">سکه، اسکناس و توکن</span>
              </span>
              <ArrowLeft className="size-4 text-white/40 transition group-hover:-translate-x-1 group-hover:text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
