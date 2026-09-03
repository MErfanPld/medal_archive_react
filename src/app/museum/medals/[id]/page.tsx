"use client";

import { use, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { getMedalById, getMedals, getMedalImages } from "@/lib/data/medals";
import { resolveMediaUrl, formatNumber } from "@/lib/utils";
import { authenticityLabel, qualityLabel } from "@/lib/medal-labels";
import {
  MuseumDetailLayout,
  type DetailSection,
} from "@/components/museum/detail-layout";
import type { Medal } from "@/types/api";

function primaryUrl(m: {
  primary_image?: string | null;
  primary_image_url?: string | null;
}) {
  return resolveMediaUrl(m.primary_image_url || m.primary_image || null);
}

function val(v: unknown): string {
  if (v == null || v === "") return "";
  return String(v);
}

export default function MuseumMedalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const medalId = Number(id);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const [zoom, setZoom] = useState(1);
  const [museumMode, setMuseumMode] = useState(false);
  const [activeId, setActiveId] = useState<string | number | null>(null);

  const { data: medal, isLoading, isError } = useQuery({
    queryKey: ["mu-medal", medalId],
    enabled: isHydrated && !Number.isNaN(medalId),
    queryFn: () => getMedalById(medalId),
  });

  const { data: imagesRes } = useQuery({
    queryKey: ["mu-medal-imgs", medalId],
    enabled: isHydrated && !Number.isNaN(medalId) && Boolean(medal),
    queryFn: () => getMedalImages(medalId),
  });

  const { data: related } = useQuery({
    queryKey: ["mu-related-medals"],
    queryFn: () => getMedals({ page: 1, ordering: "-created_at" }),
    enabled: isHydrated && Boolean(medal),
  });

  const images = useMemo(() => {
    const raw = imagesRes as
      | { results?: Array<{ id: number; image?: string; image_url?: string; caption?: string }> }
      | Array<{ id: number; image?: string; image_url?: string; caption?: string }>
      | undefined;
    const list = Array.isArray(raw) ? raw : (raw?.results ?? []);
    if (list.length === 0 && medal) {
      const u = primaryUrl(medal as Medal & { primary_image_url?: string });
      if (u) return [{ id: "primary", url: u }];
    }
    return list.map((img) => ({
      id: img.id,
      url: img.image_url || img.image || null,
      caption: img.caption,
    }));
  }, [imagesRes, medal]);

  useEffect(() => {
    if (images.length && activeId == null) setActiveId(images[0]!.id);
  }, [images, activeId]);

  useEffect(() => {
    if (!museumMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMuseumMode(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [museumMode]);

  if (isLoading) {
    return <div className="min-h-[70vh] museum-shimmer bg-[#0D0D0D]" />;
  }

  if (isError || !medal) {
    return (
      <div className="mu-stage px-5 py-24 text-center">
        <p className="text-[#C8A75D]">اثر یافت نشد.</p>
        <Link href="/museum/medals" className="mt-4 inline-block text-sm text-[#C8A75D]">
          بازگشت به آرشیو
        </Link>
      </div>
    );
  }

  const archiveNo = medal.catalog_number
    ? `MA-${medal.catalog_number}`
    : `MA-${String(medal.id).padStart(4, "0")}`;

  const sections: DetailSection[] = [
    {
      title: "شناسایی",
      items: [
        { label: "نام", value: val(medal.name) },
        { label: "شماره کاتالوگ", value: val(medal.catalog_number) },
        { label: "شماره آرشیو", value: archiveNo },
        { label: "دسته", value: val(medal.category_detail?.name) },
        { label: "کشور", value: val(medal.country) },
        { label: "سال", value: medal.year != null ? String(medal.year) : "" },
        { label: "مناسبت", value: val(medal.occasion) },
        { label: "دوره تاریخی", value: val(medal.historical_period) },
        { label: "سازنده", value: val(medal.maker) },
        { label: "ضرابخانه / کارخانه", value: val(medal.mint_or_manufacturer) },
      ],
    },
    {
      title: "ویژگی‌های فیزیکی",
      items: [
        { label: "جنس", value: val(medal.material) },
        {
          label: "وزن",
          value:
            medal.weight != null && medal.weight !== ""
              ? `${formatNumber(medal.weight)} گرم`
              : "",
        },
        {
          label: "قطر",
          value:
            medal.diameter != null && medal.diameter !== ""
              ? `${formatNumber(medal.diameter)} میلی‌متر`
              : "",
        },
        {
          label: "ضخامت",
          value:
            medal.thickness != null && medal.thickness !== ""
              ? `${formatNumber(medal.thickness)} میلی‌متر`
              : "",
        },
        { label: "شکل", value: val(medal.shape) },
        { label: "رنگ", value: val(medal.color) },
        { label: "لبه", value: val(medal.edge) },
      ],
    },
    {
      title: "وضعیت و اصالت",
      items: [
        { label: "کیفیت", value: qualityLabel(medal.quality) || val(medal.quality) },
        { label: "شرایط نگهداری", value: val(medal.preservation_condition) },
        {
          label: "اصالت",
          value: authenticityLabel(medal.authenticity) || val(medal.authenticity),
        },
      ],
    },
    {
      title: "محل نگهداری",
      items: [
        { label: "کابینت", value: val(medal.cabinet_number) },
        { label: "کشو", value: val(medal.drawer_number) },
        { label: "جعبه", value: val(medal.box_number) },
      ],
    },
  ];

  const relatedList = ((related?.results ?? []) as Medal[])
    .filter((m) => m.id !== medalId)
    .slice(0, 4)
    .map((m) => ({
      id: m.id,
      name: m.name,
      href: `/museum/medals/${m.id}`,
      image: primaryUrl(m as Medal & { primary_image_url?: string }),
      subtitle: [m.country, m.year].filter(Boolean).join(" · "),
    }));

  return (
    <MuseumDetailLayout
      breadcrumb={[
        { href: "/museum", label: "خانه" },
        { href: "/museum/medals", label: "مدال‌ها" },
      ]}
      kicker={`مدال · ${archiveNo}`}
      title={medal.name}
      subtitle={[medal.year, medal.country, medal.category_detail?.name]
        .filter(Boolean)
        .join(" · ")}
      images={images}
      activeId={activeId}
      onSelectImage={(imgId) => {
        setActiveId(imgId);
        setZoom(1);
      }}
      zoom={zoom}
      setZoom={setZoom}
      museumMode={museumMode}
      setMuseumMode={setMuseumMode}
      sections={sections}
      story={medal.notes?.trim() || ""}
      related={relatedList}
      relatedLabel="مدال‌های مرتبط"
      archiveHref="/museum/medals"
    />
  );
}
