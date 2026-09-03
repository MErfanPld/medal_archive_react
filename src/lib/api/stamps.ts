import { api } from "./client";
import type { PaginatedResponse } from "@/types/api";
import type {
  Stamp,
  StampRequest,
  StampImage,
  StampPurchaseRecord,
  StampValuationRecord,
} from "@/types/stamps";

export interface StampListParams {
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

export const stampsApi = {
  list: (params?: StampListParams) =>
    api.get<PaginatedResponse<Stamp>>(
      `/api/stamps/${toQuery(params as Record<string, unknown>)}`
    ),
  retrieve: (id: number) => api.get<Stamp>(`/api/stamps/${id}/`),
  create: (data: StampRequest) => api.post<Stamp>("/api/stamps/", data),
  update: (id: number, data: StampRequest) =>
    api.put<Stamp>(`/api/stamps/${id}/`, data),
  partialUpdate: (id: number, data: Partial<StampRequest>) =>
    api.patch<Stamp>(`/api/stamps/${id}/`, data),
  destroy: (id: number) => api.delete<void>(`/api/stamps/${id}/`),
  listImages: (itemPk: number, page?: number) =>
    api.get<PaginatedResponse<StampImage>>(
      `/api/stamps/${itemPk}/images/${toQuery(page != null ? { page } : undefined)}`
    ),
  retrieveImage: (itemPk: number, id: number) =>
    api.get<StampImage>(`/api/stamps/${itemPk}/images/${id}/`),
  createImage: (itemPk: number, formData: FormData) =>
    api.postForm<StampImage>(`/api/stamps/${itemPk}/images/`, formData),
  updateImage: (itemPk: number, id: number, formData: FormData) =>
    api.put<StampImage>(`/api/stamps/${itemPk}/images/${id}/`, formData),
  partialUpdateImage: (
    itemPk: number,
    id: number,
    data: FormData | Record<string, unknown>
  ) => api.patch<StampImage>(`/api/stamps/${itemPk}/images/${id}/`, data),
  destroyImage: (itemPk: number, id: number) =>
    api.delete<void>(`/api/stamps/${itemPk}/images/${id}/`),
  listPurchases: (itemPk: number, page?: number) =>
    api.get<PaginatedResponse<StampPurchaseRecord>>(
      `/api/stamps/${itemPk}/purchases/${toQuery(page != null ? { page } : undefined)}`
    ),
  retrievePurchase: (itemPk: number, id: number) =>
    api.get<StampPurchaseRecord>(`/api/stamps/${itemPk}/purchases/${id}/`),
  createPurchase: (itemPk: number, data: Partial<StampPurchaseRecord>) =>
    api.post<StampPurchaseRecord>(`/api/stamps/${itemPk}/purchases/`, data),
  destroyPurchase: (itemPk: number, id: number) =>
    api.delete<void>(`/api/stamps/${itemPk}/purchases/${id}/`),
  listValuations: (itemPk: number, page?: number) =>
    api.get<PaginatedResponse<StampValuationRecord>>(
      `/api/stamps/${itemPk}/valuations/${toQuery(page != null ? { page } : undefined)}`
    ),
  retrieveValuation: (itemPk: number, id: number) =>
    api.get<StampValuationRecord>(`/api/stamps/${itemPk}/valuations/${id}/`),
  createValuation: (itemPk: number, data: Partial<StampValuationRecord>) =>
    api.post<StampValuationRecord>(`/api/stamps/${itemPk}/valuations/`, data),
  destroyValuation: (itemPk: number, id: number) =>
    api.delete<void>(`/api/stamps/${itemPk}/valuations/${id}/`),
};
