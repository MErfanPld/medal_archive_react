"use client";

import { use, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { getTasbihById, getTasbihs, getTasbihImages } from "@/lib/data/tasbih";
import { resolveMediaUrl } from "@/lib/utils";
import { MuseumDetailLayout } from "@/components/museum/detail-layout";

export default function MuseumTasbihDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const itemId = Number(id);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const [zoom, setZoom] = useState(1);
  const [museumMode, setMuseumMode] = useState(false);
  const [activeId, setActiveId] = useState<string | number | null>(null);

  const { data: item, isLoading, isError } = useQuery({
    queryKey: ["mu-tasbih", itemId],
    enabled: isHydrated && !Number.isNaN(itemId),
    queryFn: () => getTasbihById(itemId),
  });
  const { data: imagesRes } = useQuery({
    queryKey: ["mu-tasbih-imgs", itemId],
    enabled: isHydrated && !Number.isNaN(itemId) && Boolean(item),
    queryFn: () => getTasbihImages(itemId),
  });
  const { data: related } = useQuery({
    queryKey: ["mu-related-tasbih"],
    queryFn: () => getTasbihs({ page: 1, ordering: "-created_at" }),
    enabled: isHydrated && Boolean(item),
  });

  const images = useMemo(() => {
    const raw = imagesRes as { results?: Array<{ id: number; image?: string; image_url?: string }> } | Array<{ id: number; image?: string; image_url?: string }> | undefined;
    const list = Array.isArray(raw) ? raw : (raw?.results ?? []);
    if (list.length === 0 && item) {
      const any = item as { primary_image_url?: string | null; primary_image?: string | null };
      const u = resolveMediaUrl(any.primary_image_url || any.primary_image || null);
      if (u) return [{ id: "primary", url: u }];
    }
    return list.map((img) => ({ id: img.id, url: img.image_url || img.image || null }));
  }, [imagesRes, item]);

  useEffect(() => { if (images.length && activeId == null) setActiveId(images[0]!.id); }, [images, activeId]);
  useEffect(() => {
    if (!museumMode) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMuseumMode(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [museumMode]);

  if (isLoading) return <div className="min-h-[70vh] museum-shimmer bg-[#0D0D0D]" />;
  if (isError || !item) return (<div className="mu-stage px-5 py-24 text-center"><p className="text-[#C8A75D]">اثر یافت نشد.</p><Link href="/museum/tasbih" className="mt-4 inline-block text-sm text-[#C8A75D]">بازگشت به آرشیو</Link></div>);

  const anyItem = item as Record<string, unknown>;
  const catalog = (anyItem.catalog_number as string) || "";
  const archiveNo = catalog ? `TB-${catalog}` : `TB-${String(item.id).padStart(4, "0")}`;
  const meta = [
    { label: "YEAR", value: anyItem.year != null ? String(anyItem.year) : "" },
    { label: "COUNTRY", value: (anyItem.country as string) || "" },
    { label: "MATERIAL", value: (anyItem.material as string) || "" },
    { label: "ARCHIVE", value: archiveNo },
  ].filter((x) => x.value);
  const relatedList = ((related?.results ?? []) as Array<{ id: number; name: string; country?: string; year?: number | string; primary_image?: string | null; primary_image_url?: string | null; }>)
    .filter((m) => m.id !== itemId).slice(0, 4)
    .map((m) => ({ id: m.id, name: m.name, href: `/museum/tasbih/${m.id}`, image: m.primary_image_url || m.primary_image, subtitle: [m.country, m.year].filter(Boolean).join(" · ") }));

  return (
    <MuseumDetailLayout
      breadcrumb={[{ href: "/museum", label: "خانه" }, { href: "/museum/tasbih", label: "تسبیح" }]}
      archiveLabel={`Tasbih · ${archiveNo}`}
      title={item.name}
      subtitle={[anyItem.year, anyItem.country].filter(Boolean).join(" · ")}
      images={images}
      activeId={activeId}
      onSelectImage={(id) => { setActiveId(id); setZoom(1); }}
      zoom={zoom}
      setZoom={setZoom}
      museumMode={museumMode}
      setMuseumMode={setMuseumMode}
      meta={meta}
      story={String(anyItem.notes || anyItem.description || "").trim()}
      related={relatedList}
      archiveHref="/museum/tasbih"
    />
  );
}
