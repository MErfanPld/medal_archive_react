"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function mediaOk(src?: string | null) {
  if (!src) return false;
  const s = String(src);
  return s.length > 2 && !s.startsWith("0");
}

interface GalleryCardProps {
  href: string;
  name: string;
  meta?: string;
  badge?: string | null;
  image?: string | null;
  index?: number;
  className?: string;
}

export function GalleryCard({
  href,
  name,
  meta,
  badge,
  image,
  index = 0,
  className,
}: GalleryCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "museum-card group block overflow-hidden rounded-2xl border border-border/70 bg-surface animate-fade-up",
        className
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
    >
      <div className="museum-shine relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-surface-muted via-primary/[0.06] to-primary-deep/[0.08]">
        {mediaOk(image) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={String(image)}
            alt=""
            className="museum-card-media h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-5xl font-semibold text-primary/25 transition duration-300 group-hover:text-primary/40 group-hover:scale-110">
              {name.charAt(0)}
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
      </div>
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-text transition-colors group-hover:text-primary sm:text-base">
          {name}
        </h3>
        {meta && <p className="text-xs text-text-muted sm:text-sm">{meta}</p>}
        {badge ? (
          <Badge variant="outline" className="text-[11px]">
            {badge}
          </Badge>
        ) : null}
      </div>
    </Link>
  );
}
