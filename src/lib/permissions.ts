/**
 * Centralized frontend authorization helpers.
 * Backend remains the final security authority.
 */

import type { UserMe, RoleMini } from "@/types/api";

export const PERMISSIONS = {
  CATEGORIES_VIEW: "categories.view",
  CATEGORIES_CREATE: "categories.create",
  CATEGORIES_UPDATE: "categories.update",
  CATEGORIES_DELETE: "categories.delete",
  MEDALS_VIEW: "medals.view",
  MEDALS_CREATE: "medals.create",
  MEDALS_UPDATE: "medals.update",
  MEDALS_DELETE: "medals.delete",
  REPORTS_VIEW: "reports.view",
  USERS_VIEW: "users.view",
  USERS_MANAGE: "users.manage",
  ROLES_VIEW: "roles.view",
  ROLES_MANAGE: "roles.manage",
} as const;

export type PermissionCodename =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const FULL_ACCESS_ROLES = new Set([
  "superuser",
  "super_admin",
  "super-admin",
  "admin",
]);

const ROLE_CAPABILITIES: Record<string, Set<string>> = {
  curator: new Set([
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CATEGORIES_CREATE,
    PERMISSIONS.CATEGORIES_UPDATE,
    PERMISSIONS.CATEGORIES_DELETE,
    PERMISSIONS.MEDALS_VIEW,
    PERMISSIONS.MEDALS_CREATE,
    PERMISSIONS.MEDALS_UPDATE,
    PERMISSIONS.MEDALS_DELETE,
    PERMISSIONS.REPORTS_VIEW,
  ]),
  viewer: new Set([
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.MEDALS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
  ]),
  editor: new Set([
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CATEGORIES_CREATE,
    PERMISSIONS.CATEGORIES_UPDATE,
    PERMISSIONS.MEDALS_VIEW,
    PERMISSIONS.MEDALS_CREATE,
    PERMISSIONS.MEDALS_UPDATE,
    PERMISSIONS.REPORTS_VIEW,
  ]),
};

function normalizeRole(role: RoleMini): string {
  return role.codename.toLowerCase().trim();
}

function getRoleCodes(user: UserMe | null | undefined): string[] {
  if (!user?.roles?.length) return [];
  return user.roles.map(normalizeRole);
}

export function isFullAccess(user: UserMe | null | undefined): boolean {
  return getRoleCodes(user).some((c) => FULL_ACCESS_ROLES.has(c));
}

export function hasPermission(
  user: UserMe | null | undefined,
  permission: string
): boolean {
  if (!user) return false;
  if (isFullAccess(user)) return true;
  const codes = getRoleCodes(user);
  for (const code of codes) {
    const caps = ROLE_CAPABILITIES[code];
    if (caps?.has(permission)) return true;
  }
  return false;
}

export function hasAnyPermission(
  user: UserMe | null | undefined,
  permissions: string[]
): boolean {
  return permissions.some((p) => hasPermission(user, p));
}

export function hasAllPermissions(
  user: UserMe | null | undefined,
  permissions: string[]
): boolean {
  return permissions.every((p) => hasPermission(user, p));
}

export function hasRole(
  user: UserMe | null | undefined,
  ...roleCodenames: string[]
): boolean {
  if (!user) return false;
  const codes = new Set(getRoleCodes(user));
  return roleCodenames.some((r) => codes.has(r.toLowerCase()));
}

export function can(
  user: UserMe | null | undefined,
  permission: string
): boolean {
  return hasPermission(user, permission);
}

export function canViewMedals(user: UserMe | null | undefined) {
  return hasPermission(user, PERMISSIONS.MEDALS_VIEW);
}
export function canViewCategories(user: UserMe | null | undefined) {
  return hasPermission(user, PERMISSIONS.CATEGORIES_VIEW);
}
export function canViewReports(user: UserMe | null | undefined) {
  return hasPermission(user, PERMISSIONS.REPORTS_VIEW);
}
export function canViewUsers(user: UserMe | null | undefined) {
  return hasPermission(user, PERMISSIONS.USERS_VIEW) || isFullAccess(user);
}
export function canViewRoles(user: UserMe | null | undefined) {
  return hasPermission(user, PERMISSIONS.ROLES_VIEW) || isFullAccess(user);
}
