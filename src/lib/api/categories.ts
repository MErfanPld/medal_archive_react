import { api } from "./client";
import type { Category, CategoryRequest, PaginatedResponse } from "@/types/api";

export interface CategoryListParams {
  page?: number;
  search?: string;
  ordering?: string;
  is_active?: boolean;
}

function toQuery(params?: CategoryListParams): string {
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

export const categoriesApi = {
  list: (params?: CategoryListParams) =>
    api.get<PaginatedResponse<Category>>(`/api/categories/${toQuery(params)}`),

  retrieve: (id: number) => api.get<Category>(`/api/categories/${id}/`),

  create: (data: CategoryRequest) =>
    api.post<Category>("/api/categories/", data),

  update: (id: number, data: CategoryRequest) =>
    api.put<Category>(`/api/categories/${id}/`, data),

  partialUpdate: (id: number, data: Partial<CategoryRequest>) =>
    api.patch<Category>(`/api/categories/${id}/`, data),

  destroy: (id: number) => api.delete<void>(`/api/categories/${id}/`),
};
