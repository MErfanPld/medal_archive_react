/**
 * Medal data service — currently backed by static mock data.
 * Swap implementation to real API later without changing UI consumers.
 */

import type {
  Medal,
  MedalRequest,
  MuseumMedal,
  PaginatedResponse,
  MedalImage,
  MedalFile,
  MedalPurchaseRecord,
  MedalValuationRecord,
} from "@/types/api";
import {
  MOCK_MEDALS,
  MOCK_IMAGES,
  MOCK_FILES,
  MOCK_PURCHASES,
  MOCK_VALUATIONS,
  toMuseumMedal,
} from "@/data/mock/medals";
import { MOCK_CATEGORIES } from "@/data/mock/categories";

export interface MedalListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  ordering?: string;
  category?: number;
  country?: string;
  year_min?: number;
  year_max?: number;
  material?: string;
  quality?: string;
  authenticity?: string;
}

// In-memory store so create/update/delete feel interactive
let medalsStore: Medal[] = [...MOCK_MEDALS];
let nextId = Math.max(...MOCK_MEDALS.map((m) => m.id)) + 1;

function delay(ms = 280) {
  return new Promise((r) => setTimeout(r, ms));
}

function applyFilters(list: Medal[], params?: MedalListParams): Medal[] {
  if (!params) return list;
  let result = [...list];

  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.country?.toLowerCase().includes(q) ||
        m.catalog_number?.toLowerCase().includes(q) ||
        m.maker?.toLowerCase().includes(q) ||
        m.material?.toLowerCase().includes(q)
    );
  }
  if (params.category) {
    result = result.filter((m) => m.category === params.category);
  }
  if (params.country) {
    result = result.filter(
      (m) => m.country?.toLowerCase() === params.country!.toLowerCase()
    );
  }
  if (params.year_min != null) {
    result = result.filter((m) => (m.year ?? 0) >= params.year_min!);
  }
  if (params.year_max != null) {
    result = result.filter((m) => (m.year ?? 9999) <= params.year_max!);
  }
  if (params.material) {
    result = result.filter((m) =>
      m.material?.toLowerCase().includes(params.material!.toLowerCase())
    );
  }
  if (params.quality) {
    result = result.filter((m) => m.quality === params.quality);
  }
  if (params.authenticity) {
    result = result.filter((m) => m.authenticity === params.authenticity);
  }

  if (params.ordering) {
    const desc = params.ordering.startsWith("-");
    const field = desc ? params.ordering.slice(1) : params.ordering;
    result.sort((a, b) => {
      const av = (a as Record<string, unknown>)[field];
      const bv = (b as Record<string, unknown>)[field];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av < bv) return desc ? 1 : -1;
      if (av > bv) return desc ? -1 : 1;
      return 0;
    });
  }

  return result;
}

function paginate<T>(
  list: T[],
  page = 1,
  pageSize = 20
): PaginatedResponse<T> {
  const start = (page - 1) * pageSize;
  const results = list.slice(start, start + pageSize);
  return {
    count: list.length,
    next: start + pageSize < list.length ? `?page=${page + 1}` : null,
    previous: page > 1 ? `?page=${page - 1}` : null,
    results,
  };
}

export async function getMedals(
  params?: MedalListParams
): Promise<PaginatedResponse<Medal>> {
  await delay();
  const filtered = applyFilters(medalsStore, params);
  return paginate(filtered, params?.page ?? 1, params?.pageSize ?? 20);
}

export async function getMedalById(id: number): Promise<Medal | null> {
  await delay();
  return medalsStore.find((m) => m.id === id) ?? null;
}

export async function getMuseumMedal(id: number): Promise<MuseumMedal | null> {
  await delay();
  const m = medalsStore.find((x) => x.id === id);
  return m ? toMuseumMedal(m) : null;
}

export async function createMedal(data: MedalRequest): Promise<Medal> {
  await delay(400);
  const category_detail =
    MOCK_CATEGORIES.find((c) => c.id === data.category) ?? MOCK_CATEGORIES[0];
  const medal: Medal = {
    id: nextId++,
    name: data.name,
    country: data.country,
    year: data.year,
    occasion: data.occasion,
    historical_period: data.historical_period,
    maker: data.maker,
    mint_or_manufacturer: data.mint_or_manufacturer,
    category: data.category,
    category_detail,
    material: data.material,
    weight: data.weight,
    diameter: data.diameter,
    thickness: data.thickness,
    shape: data.shape,
    color: data.color,
    edge: data.edge,
    quality: data.quality,
    preservation_condition: data.preservation_condition,
    authenticity: data.authenticity,
    catalog_number: data.catalog_number,
    purchase_date: data.purchase_date,
    purchase_location: data.purchase_location,
    seller: data.seller,
    purchase_price: data.purchase_price,
    purchase_currency: data.purchase_currency,
    current_value: data.current_value,
    last_valuation_date: data.last_valuation_date,
    cabinet_number: data.cabinet_number,
    drawer_number: data.drawer_number,
    box_number: data.box_number,
    notes: data.notes,
    primary_image: "",
    images_count: "0",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  medalsStore = [medal, ...medalsStore];
  return medal;
}

export async function updateMedal(
  id: number,
  data: Partial<MedalRequest>
): Promise<Medal | null> {
  await delay(400);
  const idx = medalsStore.findIndex((m) => m.id === id);
  if (idx < 0) return null;
  const category_detail =
    data.category != null
      ? MOCK_CATEGORIES.find((c) => c.id === data.category) ??
        medalsStore[idx].category_detail
      : medalsStore[idx].category_detail;
  medalsStore[idx] = {
    ...medalsStore[idx],
    ...data,
    category_detail,
    updated_at: new Date().toISOString(),
  };
  return medalsStore[idx];
}

export async function deleteMedal(id: number): Promise<boolean> {
  await delay(300);
  const before = medalsStore.length;
  medalsStore = medalsStore.filter((m) => m.id !== id);
  return medalsStore.length < before;
}

export async function getMedalImages(medalId: number): Promise<MedalImage[]> {
  await delay();
  return MOCK_IMAGES[medalId] ?? [];
}

export async function getMedalFiles(medalId: number): Promise<MedalFile[]> {
  await delay();
  return MOCK_FILES[medalId] ?? [];
}

export async function getMedalPurchases(
  medalId: number
): Promise<MedalPurchaseRecord[]> {
  await delay();
  return MOCK_PURCHASES[medalId] ?? [];
}

export async function getMedalValuations(
  medalId: number
): Promise<MedalValuationRecord[]> {
  await delay();
  return MOCK_VALUATIONS[medalId] ?? [];
}
