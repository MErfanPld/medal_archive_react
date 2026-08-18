"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn, resolveMediaUrl } from "@/lib/utils";
import { ItemPlaceholder } from "@/components/museum/item-placeholder";

interface GalleryCardProps {
  href: string;
  name: string;
  meta?: string;
  badge?: string | null;
  image?: string | null;
  index?: number;
  className?: string;
  kind?: "medal" | "coin";
}

export function GalleryCard({
  href,
  name,
  meta,
  badge,
  image,
  index = 0,
  className,
  kind = "medal",
}: GalleryCardProps) {
  const url = resolveMediaUrl(image);

  return (
    <Link
      href={href}
      className={cn(
        "museum-card group block overflow-hidden rounded-2xl border border-border/70 bg-surface animate-fade-up",
        className
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <div className="museum-shine relative aspect-[4/3] overflow-hidden bg-surface-muted">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt=""
            className="museum-card-media h-full w-full object-cover"
            onError={(e) => {
              const el = e.currentTarget;
              el.style.display = "none";
              const wrap = el.parentElement?.querySelector(
                "[data-placeholder]"
              ) as HTMLElement | null;
              if (wrap) wrap.style.display = "flex";
            }}
          />
        ) : null}
        <div
          data-placeholder
          className={cn("absolute inset-0", url ? "hidden" : "flex")}
        >
          <ItemPlaceholder kind={kind} label={name.charAt(0)} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
      </div>
      <div className="space-y-1.5 p-3.5 sm:p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-text transition-colors group-hover:text-primary sm:text-[0.95rem]">
          {name}
        </h3>
        {meta && (
          <p className="text-xs text-text-muted sm:text-[0.8125rem]">{meta}</p>
        )}
        {badge ? (
          <Badge variant="outline" className="text-[11px]">
            {badge}
          </Badge>
        ) : null}
      </div>
    </Link>
  );
}
