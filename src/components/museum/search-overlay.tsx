"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  ArrowLeft,
  Award,
  Coins,
  Banknote,
  Package,
  Sword,
  Gem,
  Hexagon,
  Stamp,
  CircleDot,
} from "lucide-react";
import { cn } from "@/lib/utils";

const POPULAR = ["ایران", "المپیک", "نقره", "نظامی", "یادبود", "سکه"];

const CATEGORIES = [
  { href: "/museum/medals", label: "مدال‌ها", Icon: Award },
  { href: "/museum/coins", label: "سکه و پول", Icon: Coins },
  { href: "/museum/banknotes", label: "اسکناس", Icon: Banknote },
  { href: "/museum/antiques", label: "آنتیک", Icon: Package },
  { href: "/museum/knives", label: "چاقو", Icon: Sword },
  { href: "/museum/rings", label: "انگشتر", Icon: Gem },
  { href: "/museum/seals", label: "مهر", Icon: Hexagon },
  { href: "/museum/stamps", label: "تمبر", Icon: Stamp },
  { href: "/museum/tasbih", label: "تسبیح", Icon: CircleDot },
];

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

  /** Search across ALL museum categories */
  const go = (term: string) => {
    const value = term.trim();
    onClose();
    if (!value) {
      router.push("/museum/search");
      return;
    }
    router.push(`/museum/search?q=${encodeURIComponent(value)}`);
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex flex-col bg-[#0D0B0C]/92 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label="جستجو در آرشیو"
    >
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-y-auto px-4 pt-8 sm:pt-16">
        <div className="flex items-center gap-3 border-b border-white/15 pb-4">
          <Search className="size-5 shrink-0 text-white/50" aria-hidden />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") go(q);
            }}
            placeholder="جستجو در همه دسته‌ها: نام، کشور، سال…"
            className="w-full bg-transparent text-lg text-white placeholder:text-white/35 outline-none sm:text-2xl"
            aria-label="جستجو در همه دسته‌بندی‌ها"
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

        <div className="mt-10 space-y-10 pb-16">
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

          <div>
            <p className="museum-label text-white/40">
              یا مستقیم یک دسته را باز کنید
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.Icon;
                return (
                  <button
                    key={cat.href}
                    type="button"
                    onClick={() => {
                      onClose();
                      router.push(cat.href);
                    }}
                    className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-right transition hover:bg-white/10"
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="size-4 text-[#C8A75D]" />
                      <span className="text-sm font-medium text-white">
                        {cat.label}
                      </span>
                    </span>
                    <ArrowLeft className="size-4 text-white/40 transition group-hover:-translate-x-1 group-hover:text-white" />
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => go(q)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#C8A75D]/40 bg-[#C8A75D]/15 px-4 py-3.5 text-sm font-medium text-[#C8A75D] transition hover:bg-[#C8A75D]/25"
          >
            <Search className="size-4" />
            جستجو در همه دسته‌بندی‌ها
          </button>
        </div>
      </div>
    </div>
  );
}
