import { api } from "./client";
import type { PaginatedResponse } from "@/types/api";
import type {
  Tasbih,
  TasbihRequest,
  TasbihImage,
  TasbihPurchaseRecord,
  TasbihValuationRecord,
} from "@/types/tasbih";

export interface TasbihListParams {
  page?: number;
  search?: string;
  ordering?: string;
  authenticity?: string;
  catalog_number?: string;
  category?: number;
  country?: string;
  country_contains?: string;
  current_value_max?: number;
  current_value_min?: number;
  historical_period?: string;
  is_active?: boolean;
  material?: string;
  name?: string;
  quality?: string;
  year?: number;
  year_max?: number;
  year_min?: number;
}

function toQuery(params?: Record<string, unknown>): string {
  if (!params) return "";
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      q.set(k, String(v));
    }
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const tasbihApi = {
  list: (params?: TasbihListParams) =>
    api.get<PaginatedResponse<Tasbih>>(
      `/api/tasbih/${toQuery(params as Record<string, unknown>)}`
    ),
  retrieve: (id: number) => api.get<Tasbih>(`/api/tasbih/${id}/`),
  create: (data: TasbihRequest) => api.post<Tasbih>("/api/tasbih/", data),
  update: (id: number, data: TasbihRequest) =>
    api.put<Tasbih>(`/api/tasbih/${id}/`, data),
  partialUpdate: (id: number, data: Partial<TasbihRequest>) =>
    api.patch<Tasbih>(`/api/tasbih/${id}/`, data),
  destroy: (id: number) => api.delete<void>(`/api/tasbih/${id}/`),
  listImages: (itemPk: number, page?: number) =>
    api.get<PaginatedResponse<TasbihImage>>(
      `/api/tasbih/${itemPk}/images/${toQuery(page != null ? { page } : undefined)}`
    ),
  retrieveImage: (itemPk: number, id: number) =>
    api.get<TasbihImage>(`/api/tasbih/${itemPk}/images/${id}/`),
  createImage: (itemPk: number, formData: FormData) =>
    api.postForm<TasbihImage>(`/api/tasbih/${itemPk}/images/`, formData),
  updateImage: (itemPk: number, id: number, formData: FormData) =>
    api.put<TasbihImage>(`/api/tasbih/${itemPk}/images/${id}/`, formData),
  partialUpdateImage: (
    itemPk: number,
    id: number,
    data: FormData | Record<string, unknown>
  ) => api.patch<TasbihImage>(`/api/tasbih/${itemPk}/images/${id}/`, data),
  destroyImage: (itemPk: number, id: number) =>
    api.delete<void>(`/api/tasbih/${itemPk}/images/${id}/`),
  listPurchases: (itemPk: number, page?: number) =>
    api.get<PaginatedResponse<TasbihPurchaseRecord>>(
      `/api/tasbih/${itemPk}/purchases/${toQuery(page != null ? { page } : undefined)}`
    ),
  retrievePurchase: (itemPk: number, id: number) =>
    api.get<TasbihPurchaseRecord>(`/api/tasbih/${itemPk}/purchases/${id}/`),
  createPurchase: (itemPk: number, data: Partial<TasbihPurchaseRecord>) =>
    api.post<TasbihPurchaseRecord>(`/api/tasbih/${itemPk}/purchases/`, data),
  destroyPurchase: (itemPk: number, id: number) =>
    api.delete<void>(`/api/tasbih/${itemPk}/purchases/${id}/`),
  listValuations: (itemPk: number, page?: number) =>
    api.get<PaginatedResponse<TasbihValuationRecord>>(
      `/api/tasbih/${itemPk}/valuations/${toQuery(page != null ? { page } : undefined)}`
    ),
  retrieveValuation: (itemPk: number, id: number) =>
    api.get<TasbihValuationRecord>(`/api/tasbih/${itemPk}/valuations/${id}/`),
  createValuation: (itemPk: number, data: Partial<TasbihValuationRecord>) =>
    api.post<TasbihValuationRecord>(`/api/tasbih/${itemPk}/valuations/`, data),
  destroyValuation: (itemPk: number, id: number) =>
    api.delete<void>(`/api/tasbih/${itemPk}/valuations/${id}/`),
};
