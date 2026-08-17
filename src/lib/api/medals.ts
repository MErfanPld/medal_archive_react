import { api } from "./client";
import type {
  Medal,
  MedalRequest,
  PaginatedResponse,
  MuseumMedal,
  MedalImage,
  MedalFile,
  MedalPurchaseRecord,
  MedalValuationRecord,
} from "@/types/api";

export interface MedalListParams {
  page?: number;
  search?: string;
  ordering?: string;
  category?: number;
  country?: string;
  country_contains?: string;
  year?: number;
  year_min?: number;
  year_max?: number;
  material?: string;
  quality?: string;
  authenticity?: string;
  catalog_number?: string;
  maker?: string;
  historical_period?: string;
  occasion?: string;
  weight_min?: number;
  weight_max?: number;
  diameter_min?: number;
  diameter_max?: number;
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

export const medalsApi = {
  list: (params?: MedalListParams) =>
    api.get<PaginatedResponse<Medal>>(
      `/api/medals/${toQuery(params as Record<string, unknown>)}`
    ),

  retrieve: (id: number) => api.get<Medal>(`/api/medals/${id}/`),

  create: (data: MedalRequest) => api.post<Medal>("/api/medals/", data),

  update: (id: number, data: MedalRequest) =>
    api.put<Medal>(`/api/medals/${id}/`, data),

  partialUpdate: (id: number, data: Partial<MedalRequest>) =>
    api.patch<Medal>(`/api/medals/${id}/`, data),

  destroy: (id: number) => api.delete<void>(`/api/medals/${id}/`),

  museum: (id: number) => api.get<MuseumMedal>(`/api/medals/${id}/museum/`),

  listImages: (medalPk: number, page?: number) =>
    api.get<PaginatedResponse<MedalImage>>(
      `/api/medals/${medalPk}/images/${toQuery(page != null ? { page } : undefined)}`
    ),

  retrieveImage: (medalPk: number, id: number) =>
    api.get<MedalImage>(`/api/medals/${medalPk}/images/${id}/`),

  createImage: (medalPk: number, formData: FormData) =>
    api.postForm<MedalImage>(`/api/medals/${medalPk}/images/`, formData),

  updateImage: (medalPk: number, id: number, formData: FormData) =>
    api.put<MedalImage>(`/api/medals/${medalPk}/images/${id}/`, formData),

  partialUpdateImage: (
    medalPk: number,
    id: number,
    data: FormData | Record<string, unknown>
  ) => api.patch<MedalImage>(`/api/medals/${medalPk}/images/${id}/`, data),

  destroyImage: (medalPk: number, id: number) =>
    api.delete<void>(`/api/medals/${medalPk}/images/${id}/`),

  listFiles: (medalPk: number, page?: number) =>
    api.get<PaginatedResponse<MedalFile>>(
      `/api/medals/${medalPk}/files/${toQuery(page != null ? { page } : undefined)}`
    ),

  retrieveFile: (medalPk: number, id: number) =>
    api.get<MedalFile>(`/api/medals/${medalPk}/files/${id}/`),

  createFile: (medalPk: number, formData: FormData) =>
    api.postForm<MedalFile>(`/api/medals/${medalPk}/files/`, formData),

  destroyFile: (medalPk: number, id: number) =>
    api.delete<void>(`/api/medals/${medalPk}/files/${id}/`),

  listPurchases: (medalPk: number, page?: number) =>
    api.get<PaginatedResponse<MedalPurchaseRecord>>(
      `/api/medals/${medalPk}/purchases/${toQuery(page != null ? { page } : undefined)}`
    ),

  createPurchase: (medalPk: number, data: Partial<MedalPurchaseRecord>) =>
    api.post<MedalPurchaseRecord>(`/api/medals/${medalPk}/purchases/`, data),

  destroyPurchase: (medalPk: number, id: number) =>
    api.delete<void>(`/api/medals/${medalPk}/purchases/${id}/`),

  listValuations: (medalPk: number, page?: number) =>
    api.get<PaginatedResponse<MedalValuationRecord>>(
      `/api/medals/${medalPk}/valuations/${toQuery(page != null ? { page } : undefined)}`
    ),

  createValuation: (medalPk: number, data: Partial<MedalValuationRecord>) =>
    api.post<MedalValuationRecord>(`/api/medals/${medalPk}/valuations/`, data),

  destroyValuation: (medalPk: number, id: number) =>
    api.delete<void>(`/api/medals/${medalPk}/valuations/${id}/`),
};
