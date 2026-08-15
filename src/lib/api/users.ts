import { api } from "./client";
import type {
  User,
  PaginatedResponse,
  UserRoleAssignRequest,
  UserCreateRequest,
  Role,
  Permission,
} from "@/types/api";

export interface UserListParams {
  page?: number;
  search?: string;
  is_active?: boolean;
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

export const usersApi = {
  list: (params?: UserListParams) =>
    api.get<PaginatedResponse<User>>(`/api/users/${toQuery(params)}`),

  create: (data: UserCreateRequest) =>
    api.post<User>("/api/users/", data),

  retrieve: (id: number) => api.get<User>(`/api/users/${id}/`),

  setActive: (id: number, is_active: boolean) =>
    api.patch<User>(`/api/users/${id}/`, { is_active }),

  assignRoles: (id: number, data: UserRoleAssignRequest) =>
    api.put<User>(`/api/users/${id}/roles/`, data),

  listRoles: (params?: { page?: number; page_size?: number }) =>
    api.get<PaginatedResponse<Role> | Role[]>(
      `/api/users/roles/${toQuery(params)}`
    ),

  retrieveRole: (id: number) => api.get<Role>(`/api/users/roles/${id}/`),

  createRole: (data: {
    name: string;
    codename: string;
    description?: string;
    is_active?: boolean;
    permission_ids?: number[];
  }) => api.post<Role>("/api/users/roles/", data),

  updateRole: (
    id: number,
    data: {
      name: string;
      codename: string;
      description?: string;
      is_active?: boolean;
      permission_ids?: number[];
    }
  ) => api.put<Role>(`/api/users/roles/${id}/`, data),

  partialUpdateRole: (id: number, data: Record<string, unknown>) =>
    api.patch<Role>(`/api/users/roles/${id}/`, data),

  destroyRole: (id: number) => api.delete<void>(`/api/users/roles/${id}/`),

  listPermissions: (params?: { page?: number; page_size?: number }) =>
    api.get<PaginatedResponse<Permission> | Permission[]>(
      `/api/users/permissions/${toQuery(params)}`
    ),
};
