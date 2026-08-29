import { api } from "./client";
import type {
  Banknote,
  BanknoteRequest,
  BanknoteImage,
  BanknotePurchaseRecord,
  BanknoteValuationRecord,
  PaginatedResponse,
} from "@/types/api";

export interface BanknoteListParams {
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
  denomination?: string;
  face_value_max?: number;
  face_value_min?: number;
  historical_period?: string;
  is_active?: boolean;
  is_commemorative?: boolean;
  material?: string;
  name?: string;
  quality?: string;
  serial_number?: string;
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

export const banknotesApi = {
  list: (params?: BanknoteListParams) =>
    api.get<PaginatedResponse<Banknote>>(
      `/api/banknotes/${toQuery(params as Record<string, unknown>)}`
    ),

  retrieve: (id: number) => api.get<Banknote>(`/api/banknotes/${id}/`),

  create: (data: BanknoteRequest) => api.post<Banknote>("/api/banknotes/", data),

  update: (id: number, data: BanknoteRequest) =>
    api.put<Banknote>(`/api/banknotes/${id}/`, data),

  partialUpdate: (id: number, data: Partial<BanknoteRequest>) =>
    api.patch<Banknote>(`/api/banknotes/${id}/`, data),

  destroy: (id: number) => api.delete<void>(`/api/banknotes/${id}/`),

  listImages: (itemPk: number, page?: number) =>
    api.get<PaginatedResponse<BanknoteImage>>(
      `/api/banknotes/${itemPk}/images/${toQuery(page != null ? { page } : undefined)}`
    ),

  retrieveImage: (itemPk: number, id: number) =>
    api.get<BanknoteImage>(`/api/banknotes/${itemPk}/images/${id}/`),

  createImage: (itemPk: number, formData: FormData) =>
    api.post<BanknoteImage>(`/api/banknotes/${itemPk}/images/`, formData),

  updateImage: (itemPk: number, id: number, formData: FormData) =>
    api.put<BanknoteImage>(`/api/banknotes/${itemPk}/images/${id}/`, formData),

  partialUpdateImage: (
    itemPk: number,
    id: number,
    data: FormData | Record<string, unknown>
  ) => api.patch<BanknoteImage>(`/api/banknotes/${itemPk}/images/${id}/`, data),

  destroyImage: (itemPk: number, id: number) =>
    api.delete<void>(`/api/banknotes/${itemPk}/images/${id}/`),

  listPurchases: (itemPk: number, page?: number) =>
    api.get<PaginatedResponse<BanknotePurchaseRecord>>(
      `/api/banknotes/${itemPk}/purchases/${toQuery(page != null ? { page } : undefined)}`
    ),

  retrievePurchase: (itemPk: number, id: number) =>
    api.get<BanknotePurchaseRecord>(`/api/banknotes/${itemPk}/purchases/${id}/`),

  createPurchase: (itemPk: number, data: Partial<BanknotePurchaseRecord>) =>
    api.post<BanknotePurchaseRecord>(`/api/banknotes/${itemPk}/purchases/`, data),

  destroyPurchase: (itemPk: number, id: number) =>
    api.delete<void>(`/api/banknotes/${itemPk}/purchases/${id}/`),

  listValuations: (itemPk: number, page?: number) =>
    api.get<PaginatedResponse<BanknoteValuationRecord>>(
      `/api/banknotes/${itemPk}/valuations/${toQuery(page != null ? { page } : undefined)}`
    ),

  retrieveValuation: (itemPk: number, id: number) =>
    api.get<BanknoteValuationRecord>(
      `/api/banknotes/${itemPk}/valuations/${id}/`
    ),

  createValuation: (itemPk: number, data: Partial<BanknoteValuationRecord>) =>
    api.post<BanknoteValuationRecord>(
      `/api/banknotes/${itemPk}/valuations/`,
      data
    ),

  destroyValuation: (itemPk: number, id: number) =>
    api.delete<void>(`/api/banknotes/${itemPk}/valuations/${id}/`),
};
