import { api } from "./client";
import type { PaginatedResponse } from "@/types/api";
import type {
  Knife,
  KnifeRequest,
  KnifeImage,
  KnifePurchaseRecord,
  KnifeValuationRecord,
} from "@/types/knives";

export interface KnifeListParams {
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

export const knivesApi = {
  list: (params?: KnifeListParams) =>
    api.get<PaginatedResponse<Knife>>(
      `/api/knives/${toQuery(params as Record<string, unknown>)}`
    ),
  retrieve: (id: number) => api.get<Knife>(`/api/knives/${id}/`),
  create: (data: KnifeRequest) => api.post<Knife>("/api/knives/", data),
  update: (id: number, data: KnifeRequest) =>
    api.put<Knife>(`/api/knives/${id}/`, data),
  partialUpdate: (id: number, data: Partial<KnifeRequest>) =>
    api.patch<Knife>(`/api/knives/${id}/`, data),
  destroy: (id: number) => api.delete<void>(`/api/knives/${id}/`),
  listImages: (itemPk: number, page?: number) =>
    api.get<PaginatedResponse<KnifeImage>>(
      `/api/knives/${itemPk}/images/${toQuery(page != null ? { page } : undefined)}`
    ),
  retrieveImage: (itemPk: number, id: number) =>
    api.get<KnifeImage>(`/api/knives/${itemPk}/images/${id}/`),
  createImage: (itemPk: number, formData: FormData) =>
    api.postForm<KnifeImage>(`/api/knives/${itemPk}/images/`, formData),
  updateImage: (itemPk: number, id: number, formData: FormData) =>
    api.put<KnifeImage>(`/api/knives/${itemPk}/images/${id}/`, formData),
  partialUpdateImage: (
    itemPk: number,
    id: number,
    data: FormData | Record<string, unknown>
  ) => api.patch<KnifeImage>(`/api/knives/${itemPk}/images/${id}/`, data),
  destroyImage: (itemPk: number, id: number) =>
    api.delete<void>(`/api/knives/${itemPk}/images/${id}/`),
  listPurchases: (itemPk: number, page?: number) =>
    api.get<PaginatedResponse<KnifePurchaseRecord>>(
      `/api/knives/${itemPk}/purchases/${toQuery(page != null ? { page } : undefined)}`
    ),
  retrievePurchase: (itemPk: number, id: number) =>
    api.get<KnifePurchaseRecord>(`/api/knives/${itemPk}/purchases/${id}/`),
  createPurchase: (itemPk: number, data: Partial<KnifePurchaseRecord>) =>
    api.post<KnifePurchaseRecord>(`/api/knives/${itemPk}/purchases/`, data),
  destroyPurchase: (itemPk: number, id: number) =>
    api.delete<void>(`/api/knives/${itemPk}/purchases/${id}/`),
  listValuations: (itemPk: number, page?: number) =>
    api.get<PaginatedResponse<KnifeValuationRecord>>(
      `/api/knives/${itemPk}/valuations/${toQuery(page != null ? { page } : undefined)}`
    ),
  retrieveValuation: (itemPk: number, id: number) =>
    api.get<KnifeValuationRecord>(`/api/knives/${itemPk}/valuations/${id}/`),
  createValuation: (itemPk: number, data: Partial<KnifeValuationRecord>) =>
    api.post<KnifeValuationRecord>(`/api/knives/${itemPk}/valuations/`, data),
  destroyValuation: (itemPk: number, id: number) =>
    api.delete<void>(`/api/knives/${itemPk}/valuations/${id}/`),
};
