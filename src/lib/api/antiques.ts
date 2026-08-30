import { api } from "./client";
import type { PaginatedResponse } from "@/types/api";
import type {
  Antique,
  AntiqueRequest,
  AntiqueImage,
  AntiquePurchaseRecord,
  AntiqueValuationRecord,
} from "@/types/antiques";

export interface AntiqueListParams {
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

export const antiquesApi = {
  list: (params?: AntiqueListParams) =>
    api.get<PaginatedResponse<Antique>>(
      `/api/antiques/${toQuery(params as Record<string, unknown>)}`
    ),
  retrieve: (id: number) => api.get<Antique>(`/api/antiques/${id}/`),
  create: (data: AntiqueRequest) => api.post<Antique>("/api/antiques/", data),
  update: (id: number, data: AntiqueRequest) =>
    api.put<Antique>(`/api/antiques/${id}/`, data),
  partialUpdate: (id: number, data: Partial<AntiqueRequest>) =>
    api.patch<Antique>(`/api/antiques/${id}/`, data),
  destroy: (id: number) => api.delete<void>(`/api/antiques/${id}/`),
  listImages: (itemPk: number, page?: number) =>
    api.get<PaginatedResponse<AntiqueImage>>(
      `/api/antiques/${itemPk}/images/${toQuery(page != null ? { page } : undefined)}`
    ),
  retrieveImage: (itemPk: number, id: number) =>
    api.get<AntiqueImage>(`/api/antiques/${itemPk}/images/${id}/`),
  createImage: (itemPk: number, formData: FormData) =>
    api.postForm<AntiqueImage>(`/api/antiques/${itemPk}/images/`, formData),
  updateImage: (itemPk: number, id: number, formData: FormData) =>
    api.put<AntiqueImage>(`/api/antiques/${itemPk}/images/${id}/`, formData),
  partialUpdateImage: (
    itemPk: number,
    id: number,
    data: FormData | Record<string, unknown>
  ) => api.patch<AntiqueImage>(`/api/antiques/${itemPk}/images/${id}/`, data),
  destroyImage: (itemPk: number, id: number) =>
    api.delete<void>(`/api/antiques/${itemPk}/images/${id}/`),
  listPurchases: (itemPk: number, page?: number) =>
    api.get<PaginatedResponse<AntiquePurchaseRecord>>(
      `/api/antiques/${itemPk}/purchases/${toQuery(page != null ? { page } : undefined)}`
    ),
  retrievePurchase: (itemPk: number, id: number) =>
    api.get<AntiquePurchaseRecord>(`/api/antiques/${itemPk}/purchases/${id}/`),
  createPurchase: (itemPk: number, data: Partial<AntiquePurchaseRecord>) =>
    api.post<AntiquePurchaseRecord>(`/api/antiques/${itemPk}/purchases/`, data),
  destroyPurchase: (itemPk: number, id: number) =>
    api.delete<void>(`/api/antiques/${itemPk}/purchases/${id}/`),
  listValuations: (itemPk: number, page?: number) =>
    api.get<PaginatedResponse<AntiqueValuationRecord>>(
      `/api/antiques/${itemPk}/valuations/${toQuery(page != null ? { page } : undefined)}`
    ),
  retrieveValuation: (itemPk: number, id: number) =>
    api.get<AntiqueValuationRecord>(`/api/antiques/${itemPk}/valuations/${id}/`),
  createValuation: (itemPk: number, data: Partial<AntiqueValuationRecord>) =>
    api.post<AntiqueValuationRecord>(`/api/antiques/${itemPk}/valuations/`, data),
  destroyValuation: (itemPk: number, id: number) =>
    api.delete<void>(`/api/antiques/${itemPk}/valuations/${id}/`),
};
