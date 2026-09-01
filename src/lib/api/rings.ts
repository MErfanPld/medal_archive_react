import { api } from "./client";
import type { PaginatedResponse } from "@/types/api";
import type {
  Ring,
  RingRequest,
  RingImage,
  RingPurchaseRecord,
  RingValuationRecord,
} from "@/types/rings";

export interface RingListParams {
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

export const ringsApi = {
  list: (params?: RingListParams) =>
    api.get<PaginatedResponse<Ring>>(
      `/api/rings/${toQuery(params as Record<string, unknown>)}`
    ),
  retrieve: (id: number) => api.get<Ring>(`/api/rings/${id}/`),
  create: (data: RingRequest) => api.post<Ring>("/api/rings/", data),
  update: (id: number, data: RingRequest) =>
    api.put<Ring>(`/api/rings/${id}/`, data),
  partialUpdate: (id: number, data: Partial<RingRequest>) =>
    api.patch<Ring>(`/api/rings/${id}/`, data),
  destroy: (id: number) => api.delete<void>(`/api/rings/${id}/`),
  listImages: (itemPk: number, page?: number) =>
    api.get<PaginatedResponse<RingImage>>(
      `/api/rings/${itemPk}/images/${toQuery(page != null ? { page } : undefined)}`
    ),
  retrieveImage: (itemPk: number, id: number) =>
    api.get<RingImage>(`/api/rings/${itemPk}/images/${id}/`),
  createImage: (itemPk: number, formData: FormData) =>
    api.postForm<RingImage>(`/api/rings/${itemPk}/images/`, formData),
  updateImage: (itemPk: number, id: number, formData: FormData) =>
    api.put<RingImage>(`/api/rings/${itemPk}/images/${id}/`, formData),
  partialUpdateImage: (
    itemPk: number,
    id: number,
    data: FormData | Record<string, unknown>
  ) => api.patch<RingImage>(`/api/rings/${itemPk}/images/${id}/`, data),
  destroyImage: (itemPk: number, id: number) =>
    api.delete<void>(`/api/rings/${itemPk}/images/${id}/`),
  listPurchases: (itemPk: number, page?: number) =>
    api.get<PaginatedResponse<RingPurchaseRecord>>(
      `/api/rings/${itemPk}/purchases/${toQuery(page != null ? { page } : undefined)}`
    ),
  retrievePurchase: (itemPk: number, id: number) =>
    api.get<RingPurchaseRecord>(`/api/rings/${itemPk}/purchases/${id}/`),
  createPurchase: (itemPk: number, data: Partial<RingPurchaseRecord>) =>
    api.post<RingPurchaseRecord>(`/api/rings/${itemPk}/purchases/`, data),
  destroyPurchase: (itemPk: number, id: number) =>
    api.delete<void>(`/api/rings/${itemPk}/purchases/${id}/`),
  listValuations: (itemPk: number, page?: number) =>
    api.get<PaginatedResponse<RingValuationRecord>>(
      `/api/rings/${itemPk}/valuations/${toQuery(page != null ? { page } : undefined)}`
    ),
  retrieveValuation: (itemPk: number, id: number) =>
    api.get<RingValuationRecord>(`/api/rings/${itemPk}/valuations/${id}/`),
  createValuation: (itemPk: number, data: Partial<RingValuationRecord>) =>
    api.post<RingValuationRecord>(`/api/rings/${itemPk}/valuations/`, data),
  destroyValuation: (itemPk: number, id: number) =>
    api.delete<void>(`/api/rings/${itemPk}/valuations/${id}/`),
};
