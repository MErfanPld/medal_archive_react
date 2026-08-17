import { api } from "./client";
import type {
  Coin,
  CoinRequest,
  CoinImage,
  PaginatedResponse,
} from "@/types/api";

export interface CoinListParams {
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
  is_proof?: boolean;
  item_type?: string;
  material?: string;
  mint?: string;
  name?: string;
  quality?: string;
  serial_number?: string;
  weight_max?: number;
  weight_min?: number;
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

export const coinsApi = {
  list: (params?: CoinListParams) =>
    api.get<PaginatedResponse<Coin>>(
      `/api/coins/${toQuery(params as Record<string, unknown>)}`
    ),

  retrieve: (id: number) => api.get<Coin>(`/api/coins/${id}/`),

  create: (data: CoinRequest) => api.post<Coin>("/api/coins/", data),

  update: (id: number, data: CoinRequest) =>
    api.put<Coin>(`/api/coins/${id}/`, data),

  partialUpdate: (id: number, data: Partial<CoinRequest>) =>
    api.patch<Coin>(`/api/coins/${id}/`, data),

  destroy: (id: number) => api.delete<void>(`/api/coins/${id}/`),

  listImages: (coinPk: number, page?: number) =>
    api.get<PaginatedResponse<CoinImage>>(
      `/api/coins/${coinPk}/images/${toQuery(page != null ? { page } : undefined)}`
    ),

  retrieveImage: (coinPk: number, id: number) =>
    api.get<CoinImage>(`/api/coins/${coinPk}/images/${id}/`),

  createImage: (coinPk: number, formData: FormData) =>
    api.post<CoinImage>(`/api/coins/${coinPk}/images/`, formData),

  updateImage: (coinPk: number, id: number, formData: FormData) =>
    api.put<CoinImage>(`/api/coins/${coinPk}/images/${id}/`, formData),

  partialUpdateImage: (
    coinPk: number,
    id: number,
    data: FormData | Record<string, unknown>
  ) => api.patch<CoinImage>(`/api/coins/${coinPk}/images/${id}/`, data),

  destroyImage: (coinPk: number, id: number) =>
    api.delete<void>(`/api/coins/${coinPk}/images/${id}/`),
};
