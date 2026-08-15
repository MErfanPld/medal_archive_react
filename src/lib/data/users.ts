/**
 * Users / Roles / Permissions data layer.
 * Backed by the real API (OpenAPI). Optional mock via NEXT_PUBLIC_USE_MOCK_DATA=1.
 */

import type {
  User,
  Role,
  Permission,
  PaginatedResponse,
  UserRoleAssignRequest,
} from "@/types/api";
import { usersApi } from "@/lib/api/users";
import {
  MOCK_USERS,
  MOCK_ROLES,
  MOCK_PERMISSIONS,
} from "@/data/mock/users";

const useMock =
  process.env.NEXT_PUBLIC_USE_MOCK_DATA === "1" ||
  process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "1";

let usersStore = [...MOCK_USERS];
let rolesStore = [...MOCK_ROLES];
let nextRoleId = Math.max(...MOCK_ROLES.map((r) => r.id), 0) + 1;

function delay(ms = 250) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeList<T>(
  res: PaginatedResponse<T> | T[]
): PaginatedResponse<T> {
  if (Array.isArray(res)) {
    return { count: res.length, next: null, previous: null, results: res };
  }
  return {
    count: res.count ?? res.results?.length ?? 0,
    next: res.next ?? null,
    previous: res.previous ?? null,
    results: res.results ?? [],
  };
}

export async function getUsers(params?: {
  page?: number;
  search?: string;
  is_active?: boolean;
}): Promise<PaginatedResponse<User>> {
  if (!useMock) return usersApi.list(params);
  await delay();
  let list = [...usersStore];
  if (params?.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.first_name?.toLowerCase().includes(q) ||
        u.last_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }
  if (params?.is_active != null) {
    list = list.filter((u) => u.is_active === params.is_active);
  }
  const page = params?.page ?? 1;
  const pageSize = 20;
  const start = (page - 1) * pageSize;
  return {
    count: list.length,
    next: start + pageSize < list.length ? `?page=${page + 1}` : null,
    previous: page > 1 ? `?page=${page - 1}` : null,
    results: list.slice(start, start + pageSize),
  };
}

export async function getUserById(id: number): Promise<User | null> {
  if (!useMock) {
    try {
      return await usersApi.retrieve(id);
    } catch {
      return null;
    }
  }
  await delay();
  return usersStore.find((u) => u.id === id) ?? null;
}

export async function setUserActive(
  id: number,
  is_active: boolean
): Promise<User | null> {
  if (!useMock) return await usersApi.setActive(id, is_active);
  await delay(300);
  const idx = usersStore.findIndex((u) => u.id === id);
  if (idx < 0) return null;
  usersStore[idx] = { ...usersStore[idx], is_active };
  return usersStore[idx];
}

export async function assignUserRoles(
  id: number,
  data: UserRoleAssignRequest
): Promise<User | null> {
  if (!useMock) return await usersApi.assignRoles(id, data);
  await delay(350);
  const idx = usersStore.findIndex((u) => u.id === id);
  if (idx < 0) return null;
  const roles = rolesStore
    .filter((r) => data.role_ids.includes(r.id))
    .map((r) => ({ id: r.id, name: r.name, codename: r.codename }));
  usersStore[idx] = { ...usersStore[idx], roles };
  return usersStore[idx];
}

export async function getRoles(page = 1): Promise<PaginatedResponse<Role>> {
  if (!useMock) {
    return normalizeList(await usersApi.listRoles({ page, page_size: 100 }));
  }
  await delay();
  const pageSize = 20;
  const start = (page - 1) * pageSize;
  return {
    count: rolesStore.length,
    next: null,
    previous: null,
    results: rolesStore.slice(start, start + pageSize),
  };
}

export async function getAllRoles(): Promise<Role[]> {
  if (useMock) {
    await delay();
    return [...rolesStore];
  }
  const all: Role[] = [];
  let page = 1;
  for (;;) {
    const res = normalizeList(
      await usersApi.listRoles({ page, page_size: 100 })
    );
    all.push(...res.results);
    if (!res.next || res.results.length === 0) break;
    page += 1;
    if (page > 50) break;
  }
  return all;
}

export async function getRoleById(id: number): Promise<Role | null> {
  if (!useMock) {
    try {
      return await usersApi.retrieveRole(id);
    } catch {
      return null;
    }
  }
  await delay();
  return rolesStore.find((r) => r.id === id) ?? null;
}

export async function createRole(data: {
  name: string;
  codename: string;
  description?: string;
  is_active?: boolean;
  permission_ids?: number[];
}): Promise<Role> {
  if (!useMock) return usersApi.createRole(data);
  await delay(350);
  const permissions = MOCK_PERMISSIONS.filter((p) =>
    (data.permission_ids ?? []).includes(p.id)
  );
  const role: Role = {
    id: nextRoleId++,
    name: data.name,
    codename: data.codename,
    description: data.description,
    is_active: data.is_active ?? true,
    permissions,
  };
  rolesStore = [role, ...rolesStore];
  return role;
}

export async function updateRole(
  id: number,
  data: {
    name?: string;
    codename?: string;
    description?: string;
    is_active?: boolean;
    permission_ids?: number[];
  }
): Promise<Role> {
  if (!useMock) {
    if (data.name != null && data.codename != null) {
      return await usersApi.updateRole(id, {
        name: data.name,
        codename: data.codename,
        description: data.description,
        is_active: data.is_active,
        permission_ids: data.permission_ids,
      });
    }
    return await usersApi.partialUpdateRole(id, data as Record<string, unknown>);
  }
  await delay(350);
  const idx = rolesStore.findIndex((r) => r.id === id);
  if (idx < 0) throw new Error("نقش یافت نشد");
  const permissions =
    data.permission_ids != null
      ? MOCK_PERMISSIONS.filter((p) => data.permission_ids!.includes(p.id))
      : rolesStore[idx].permissions;
  rolesStore[idx] = { ...rolesStore[idx], ...data, permissions };
  return rolesStore[idx];
}

export async function deleteRole(id: number): Promise<void> {
  if (!useMock) {
    await usersApi.destroyRole(id);
    return;
  }
  await delay(300);
  rolesStore = rolesStore.filter((r) => r.id !== id);
}

export async function getPermissions(): Promise<Permission[]> {
  if (useMock) {
    await delay();
    return MOCK_PERMISSIONS;
  }
  const all: Permission[] = [];
  let page = 1;
  for (;;) {
    const res = normalizeList(
      await usersApi.listPermissions({ page, page_size: 200 })
    );
    all.push(...res.results);
    if (!res.next || res.results.length === 0) break;
    page += 1;
    if (page > 50) break;
  }
  return all;
}
