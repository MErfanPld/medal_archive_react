/**
 * Medals data layer — real API by default.
 * Set NEXT_PUBLIC_USE_MOCK_DATA=1 to force mock.
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
import { medalsApi, type MedalListParams as ApiMedalListParams } from "@/lib/api/medals";
import {
  MOCK_MEDALS,
  MOCK_IMAGES,
  MOCK_FILES,
  MOCK_PURCHASES,
  MOCK_VALUATIONS,
  toMuseumMedal,
} from "@/data/mock/medals";
import { MOCK_CATEGORIES } from "@/data/mock/categories";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "1";

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
  catalog_number?: string;
  maker?: string;
  historical_period?: string;
  occasion?: string;
}

let medalsStore: Medal[] = [...MOCK_MEDALS];
let nextId = Math.max(...MOCK_MEDALS.map((m) => m.id), 0) + 1;

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
  if (params.category) result = result.filter((m) => m.category === params.category);
  if (params.country)
    result = result.filter((m) => m.country?.toLowerCase() === params.country!.toLowerCase());
  if (params.year_min != null) result = result.filter((m) => (m.year ?? 0) >= params.year_min!);
  if (params.year_max != null) result = result.filter((m) => (m.year ?? 9999) <= params.year_max!);
  if (params.material)
    result = result.filter((m) => m.material?.toLowerCase().includes(params.material!.toLowerCase()));
  if (params.quality) result = result.filter((m) => m.quality === params.quality);
  if (params.authenticity) result = result.filter((m) => m.authenticity === params.authenticity);
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

function paginate<T>(list: T[], page = 1, pageSize = 20): PaginatedResponse<T> {
  const start = (page - 1) * pageSize;
  return {
    count: list.length,
    next: start + pageSize < list.length ? `?page=${page + 1}` : null,
    previous: page > 1 ? `?page=${page - 1}` : null,
    results: list.slice(start, start + pageSize),
  };
}

export async function getMedals(params?: MedalListParams): Promise<PaginatedResponse<Medal>> {
  if (!useMock) {
    const apiParams: ApiMedalListParams = {
      page: params?.page,
      search: params?.search,
      ordering: params?.ordering,
      category: params?.category,
      country: params?.country,
      year_min: params?.year_min,
      year_max: params?.year_max,
      material: params?.material,
      quality: params?.quality,
      authenticity: params?.authenticity,
      catalog_number: params?.catalog_number,
      maker: params?.maker,
      historical_period: params?.historical_period,
      occasion: params?.occasion,
    };
    return medalsApi.list(apiParams);
  }
  await delay();
  return paginate(applyFilters(medalsStore, params), params?.page ?? 1, params?.pageSize ?? 20);
}

export async function getMedalById(id: number): Promise<Medal | null> {
  if (!useMock) {
    try { return await medalsApi.retrieve(id); } catch { return null; }
  }
  await delay();
  return medalsStore.find((m) => m.id === id) ?? null;
}

export async function getMuseumMedal(id: number): Promise<MuseumMedal | null> {
  if (!useMock) {
    try { return await medalsApi.museum(id); } catch { return null; }
  }
  await delay();
  const m = medalsStore.find((x) => x.id === id);
  return m ? toMuseumMedal(m) : null;
}

export async function createMedal(data: MedalRequest): Promise<Medal> {
  if (!useMock) return medalsApi.create(data);
  await delay(400);
  const category_detail = MOCK_CATEGORIES.find((c) => c.id === data.category) ?? MOCK_CATEGORIES[0];
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

export async function updateMedal(id: number, data: Partial<MedalRequest>): Promise<Medal | null> {
  if (!useMock) {
    try {
      if (data.name) return await medalsApi.update(id, data as MedalRequest);
      return await medalsApi.partialUpdate(id, data);
    } catch { return null; }
  }
  await delay(400);
  const idx = medalsStore.findIndex((m) => m.id === id);
  if (idx < 0) return null;
  const category_detail =
    data.category != null
      ? MOCK_CATEGORIES.find((c) => c.id === data.category) ?? medalsStore[idx].category_detail
      : medalsStore[idx].category_detail;
  medalsStore[idx] = { ...medalsStore[idx], ...data, category_detail, updated_at: new Date().toISOString() };
  return medalsStore[idx];
}

export async function deleteMedal(id: number): Promise<boolean> {
  if (!useMock) {
    try { await medalsApi.destroy(id); return true; } catch { return false; }
  }
  await delay(300);
  const before = medalsStore.length;
  medalsStore = medalsStore.filter((m) => m.id !== id);
  return medalsStore.length < before;
}

export async function getMedalImages(medalId: number): Promise<MedalImage[]> {
  if (!useMock) {
    const res = await medalsApi.listImages(medalId);
    return res.results ?? [];
  }
  await delay();
  return MOCK_IMAGES[medalId] ?? [];
}

export async function uploadMedalImage(medalId: number, formData: FormData): Promise<MedalImage> {
  if (!useMock) return medalsApi.createImage(medalId, formData);
  await delay(400);
  return {
    id: Date.now(), image: "", image_url: "", image_type: "front", caption: "", ordering: 0,
    is_primary: false, original_filename: "upload.jpg", file_size: 0, uploaded_by: null,
    uploaded_at: new Date().toISOString(),
  };
}

export async function deleteMedalImage(medalId: number, imageId: number): Promise<boolean> {
  if (!useMock) {
    try { await medalsApi.destroyImage(medalId, imageId); return true; } catch { return false; }
  }
  await delay(300);
  return true;
}

export async function getMedalFiles(medalId: number): Promise<MedalFile[]> {
  if (!useMock) {
    const res = await medalsApi.listFiles(medalId);
    return res.results ?? [];
  }
  await delay();
  return MOCK_FILES[medalId] ?? [];
}

export async function uploadMedalFile(medalId: number, formData: FormData): Promise<MedalFile> {
  if (!useMock) return medalsApi.createFile(medalId, formData);
  await delay(400);
  return {
    id: Date.now(), file: "", file_url: "", file_type: "document", original_filename: "file.pdf",
    content_type: "application/pdf", file_size: 0, notes: "", uploaded_by: null,
    uploaded_at: new Date().toISOString(),
  };
}

export async function deleteMedalFile(medalId: number, fileId: number): Promise<boolean> {
  if (!useMock) {
    try { await medalsApi.destroyFile(medalId, fileId); return true; } catch { return false; }
  }
  await delay(300);
  return true;
}

export async function getMedalPurchases(medalId: number): Promise<MedalPurchaseRecord[]> {
  if (!useMock) {
    const res = await medalsApi.listPurchases(medalId);
    return res.results ?? [];
  }
  await delay();
  return MOCK_PURCHASES[medalId] ?? [];
}

export async function getMedalValuations(medalId: number): Promise<MedalValuationRecord[]> {
  if (!useMock) {
    const res = await medalsApi.listValuations(medalId);
    return res.results ?? [];
  }
  await delay();
  return MOCK_VALUATIONS[medalId] ?? [];
}

export async function createMedalPurchase(
  medalId: number,
  data: Partial<MedalPurchaseRecord>
): Promise<MedalPurchaseRecord> {
  if (!useMock) return medalsApi.createPurchase(medalId, data);
  await delay(300);
  return {
    id: Date.now(),
    purchase_date: data.purchase_date ?? null,
    location: data.location ?? "",
    seller: data.seller ?? "",
    price: data.price ?? null,
    currency: data.currency,
    notes: data.notes ?? "",
    created_at: new Date().toISOString(),
    created_by: null,
  };
}

export async function deleteMedalPurchase(
  medalId: number,
  purchaseId: number
): Promise<boolean> {
  if (!useMock) {
    try { await medalsApi.destroyPurchase(medalId, purchaseId); return true; } catch { return false; }
  }
  await delay(200);
  return true;
}

export async function createMedalValuation(
  medalId: number,
  data: Partial<MedalValuationRecord>
): Promise<MedalValuationRecord> {
  if (!useMock) return medalsApi.createValuation(medalId, data);
  await delay(300);
  return {
    id: Date.now(),
    value: data.value ?? "0",
    currency: data.currency,
    valuation_date: data.valuation_date ?? new Date().toISOString().slice(0, 10),
    source: data.source ?? "",
    notes: data.notes ?? "",
    created_at: new Date().toISOString(),
    created_by: null,
  };
}

export async function deleteMedalValuation(
  medalId: number,
  valuationId: number
): Promise<boolean> {
  if (!useMock) {
    try { await medalsApi.destroyValuation(medalId, valuationId); return true; } catch { return false; }
  }
  await delay(200);
  return true;
}
