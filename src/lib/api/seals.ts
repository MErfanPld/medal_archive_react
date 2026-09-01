import { api } from "./client";
import type { PaginatedResponse } from "@/types/api";
import type {
  Seal,
  SealRequest,
  SealImage,
  SealPurchaseRecord,
  SealValuationRecord,
} from "@/types/seals";

export interface SealListParams {
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

export const sealsApi = {
  list: (params?: SealListParams) =>
    api.get<PaginatedResponse<Seal>>(
      `/api/seals/${toQuery(params as Record<string, unknown>)}`
    ),
  retrieve: (id: number) => api.get<Seal>(`/api/seals/${id}/`),
  create: (data: SealRequest) => api.post<Seal>("/api/seals/", data),
  update: (id: number, data: SealRequest) =>
    api.put<Seal>(`/api/seals/${id}/`, data),
  partialUpdate: (id: number, data: Partial<SealRequest>) =>
    api.patch<Seal>(`/api/seals/${id}/`, data),
  destroy: (id: number) => api.delete<void>(`/api/seals/${id}/`),
  listImages: (itemPk: number, page?: number) =>
    api.get<PaginatedResponse<SealImage>>(
      `/api/seals/${itemPk}/images/${toQuery(page != null ? { page } : undefined)}`
    ),
  retrieveImage: (itemPk: number, id: number) =>
    api.get<SealImage>(`/api/seals/${itemPk}/images/${id}/`),
  createImage: (itemPk: number, formData: FormData) =>
    api.postForm<SealImage>(`/api/seals/${itemPk}/images/`, formData),
  updateImage: (itemPk: number, id: number, formData: FormData) =>
    api.put<SealImage>(`/api/seals/${itemPk}/images/${id}/`, formData),
  partialUpdateImage: (
    itemPk: number,
    id: number,
    data: FormData | Record<string, unknown>
  ) => api.patch<SealImage>(`/api/seals/${itemPk}/images/${id}/`, data),
  destroyImage: (itemPk: number, id: number) =>
    api.delete<void>(`/api/seals/${itemPk}/images/${id}/`),
  listPurchases: (itemPk: number, page?: number) =>
    api.get<PaginatedResponse<SealPurchaseRecord>>(
      `/api/seals/${itemPk}/purchases/${toQuery(page != null ? { page } : undefined)}`
    ),
  retrievePurchase: (itemPk: number, id: number) =>
    api.get<SealPurchaseRecord>(`/api/seals/${itemPk}/purchases/${id}/`),
  createPurchase: (itemPk: number, data: Partial<SealPurchaseRecord>) =>
    api.post<SealPurchaseRecord>(`/api/seals/${itemPk}/purchases/`, data),
  destroyPurchase: (itemPk: number, id: number) =>
    api.delete<void>(`/api/seals/${itemPk}/purchases/${id}/`),
  listValuations: (itemPk: number, page?: number) =>
    api.get<PaginatedResponse<SealValuationRecord>>(
      `/api/seals/${itemPk}/valuations/${toQuery(page != null ? { page } : undefined)}`
    ),
  retrieveValuation: (itemPk: number, id: number) =>
    api.get<SealValuationRecord>(`/api/seals/${itemPk}/valuations/${id}/`),
  createValuation: (itemPk: number, data: Partial<SealValuationRecord>) =>
    api.post<SealValuationRecord>(`/api/seals/${itemPk}/valuations/`, data),
  destroyValuation: (itemPk: number, id: number) =>
    api.delete<void>(`/api/seals/${itemPk}/valuations/${id}/`),
};
