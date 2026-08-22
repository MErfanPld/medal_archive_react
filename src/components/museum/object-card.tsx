"use client";

import Link from "next/link";
import { cn, resolveMediaUrl } from "@/lib/utils";
import { ItemPlaceholder } from "@/components/museum/item-placeholder";

export interface ObjectCardProps {
  href: string;
  name: string;
  year?: string | number | null;
  country?: string | null;
  category?: string | null;
  archiveNo?: string | null;
  image?: unknown;
  kind?: "medal" | "coin";
  size?: "sm" | "md" | "lg";
  index?: number;
  className?: string;
}

export function ObjectCard({
  href,
  name,
  year,
  country,
  category,
  archiveNo,
  image,
  kind = "medal",
  size = "md",
  index = 0,
  className,
}: ObjectCardProps) {
  const url = resolveMediaUrl(image);
  const aspect =
    size === "lg"
      ? "aspect-[4/5]"
      : size === "sm"
        ? "aspect-square"
        : "aspect-[3/4]";

  return (
    <Link
      href={href}
      className={cn(
        "group relative block overflow-hidden rounded-md museum-reveal",
        "border border-border/90 bg-surface shadow-sm",
        "ring-1 ring-black/[0.03] transition duration-300",
        "hover:border-primary/25 hover:shadow-lg hover:shadow-primary/10",
        className
      )}
      style={{ animationDelay: `${Math.min(index, 10) * 55}ms` }}
    >
      <div className={cn("museum-frame relative overflow-hidden rounded-md", aspect)}>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={name}
            className="object-card-img h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const ph = e.currentTarget.parentElement?.querySelector(
                "[data-ph]"
              ) as HTMLElement | null;
              if (ph) ph.style.display = "flex";
            }}
          />
        ) : null}
        <div
          data-ph
          className={cn("absolute inset-0", url ? "hidden" : "flex")}
        >
          <ItemPlaceholder kind={kind} label={name.charAt(0)} />
        </div>

        {/* hover veil */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1a1614]/85 via-[#1a1614]/10 to-transparent opacity-80 transition duration-500 group-hover:opacity-95" />

        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          {archiveNo ? (
            <p className="museum-label text-white/40">MA · {archiveNo}</p>
          ) : null}
          <p className="mt-1 font-semibold text-white line-clamp-2">{name}</p>
          <p className="mt-1 text-xs text-white/55">
            {[country, year, category].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>
    </Link>
  );
}
