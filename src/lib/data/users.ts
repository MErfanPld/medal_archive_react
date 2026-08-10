import type {
  User,
  Role,
  Permission,
  PaginatedResponse,
  UserRoleAssignRequest,
} from "@/types/api";
import {
  MOCK_USERS,
  MOCK_ROLES,
  MOCK_PERMISSIONS,
} from "@/data/mock/users";

let usersStore = [...MOCK_USERS];
let rolesStore = [...MOCK_ROLES];
let nextRoleId = Math.max(...MOCK_ROLES.map((r) => r.id)) + 1;

function delay(ms = 250) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function getUsers(params?: {
  page?: number;
  search?: string;
  is_active?: boolean;
}): Promise<PaginatedResponse<User>> {
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
  await delay();
  return usersStore.find((u) => u.id === id) ?? null;
}

export async function setUserActive(
  id: number,
  is_active: boolean
): Promise<User | null> {
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

export async function getRoleById(id: number): Promise<Role | null> {
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
): Promise<Role | null> {
  await delay(350);
  const idx = rolesStore.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  const permissions =
    data.permission_ids != null
      ? MOCK_PERMISSIONS.filter((p) => data.permission_ids!.includes(p.id))
      : rolesStore[idx].permissions;
  rolesStore[idx] = { ...rolesStore[idx], ...data, permissions };
  return rolesStore[idx];
}

export async function deleteRole(id: number): Promise<boolean> {
  await delay(300);
  const before = rolesStore.length;
  rolesStore = rolesStore.filter((r) => r.id !== id);
  return rolesStore.length < before;
}

export async function getPermissions(): Promise<Permission[]> {
  await delay();
  return MOCK_PERMISSIONS;
}
