/**
 * Centralized frontend authorization helpers.
 * Backend remains the final security authority.
 *
 * Roles from the API (documented):
 * - Superuser / superuser / super_admin → full access
 * - Admin / admin → users, roles, content
 * - Curator / curator → categories + medals
 * - Viewer / viewer → view-only
 *
 * Permission codenames (from OpenAPI / backend):
 * categories.view | categories.create | categories.update | categories.delete
 * medals.view | medals.create | medals.update | medals.delete
 * reports.view
 * + users / ACL related
 */

import type { UserMe, RoleMini } from "@/types/api";

/** Known permission codenames used for UI gating */
export const PERMISSIONS = {
  CATEGORIES_VIEW: "categories.view",
  CATEGORIES_CREATE: "categories.create",
  CATEGORIES_UPDATE: "categories.update",
  CATEGORIES_DELETE: "categories.delete",
  MEDALS_VIEW: "medals.view",
  MEDALS_CREATE: "medals.create",
  MEDALS_UPDATE: "medals.update",
  MEDALS_DELETE: "medals.delete",
  COINS_VIEW: "coins.view",
  COINS_CREATE: "coins.create",
  COINS_UPDATE: "coins.update",
  COINS_DELETE: "coins.delete",
  BANKNOTES_VIEW: "banknotes.view",
  BANKNOTES_CREATE: "banknotes.create",
  BANKNOTES_UPDATE: "banknotes.update",
  BANKNOTES_DELETE: "banknotes.delete",
  ANTIQUES_VIEW: "antiques.view",
  ANTIQUES_CREATE: "antiques.create",
  ANTIQUES_UPDATE: "antiques.update",
  ANTIQUES_DELETE: "antiques.delete",
  KNIVES_VIEW: "knives.view",
  KNIVES_CREATE: "knives.create",
  KNIVES_UPDATE: "knives.update",
  KNIVES_DELETE: "knives.delete",
  RINGS_VIEW: "rings.view",
  RINGS_CREATE: "rings.create",
  RINGS_UPDATE: "rings.update",
  RINGS_DELETE: "rings.delete",
  SEALS_VIEW: "seals.view",
  SEALS_CREATE: "seals.create",
  SEALS_UPDATE: "seals.update",
  SEALS_DELETE: "seals.delete",
  REPORTS_VIEW: "reports.view",
  USERS_VIEW: "users.view",
  USERS_MANAGE: "users.manage",
  ROLES_VIEW: "roles.view",
  ROLES_MANAGE: "roles.manage",
} as const;

export type PermissionCodename =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Role codenames that imply full access */
const FULL_ACCESS_ROLES = new Set([
  "superuser",
  "super_admin",
  "super-admin",
  "admin",
]);

/** Approximate capability matrix by role (until /me returns full permissions) */
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
    PERMISSIONS.COINS_VIEW,
    PERMISSIONS.COINS_CREATE,
    PERMISSIONS.COINS_UPDATE,
    PERMISSIONS.COINS_DELETE,
    PERMISSIONS.BANKNOTES_VIEW,
    PERMISSIONS.BANKNOTES_CREATE,
    PERMISSIONS.BANKNOTES_UPDATE,
    PERMISSIONS.BANKNOTES_DELETE,
    PERMISSIONS.ANTIQUES_VIEW,
    PERMISSIONS.ANTIQUES_CREATE,
    PERMISSIONS.ANTIQUES_UPDATE,
    PERMISSIONS.ANTIQUES_DELETE,
    PERMISSIONS.KNIVES_VIEW,
    PERMISSIONS.KNIVES_CREATE,
    PERMISSIONS.KNIVES_UPDATE,
    PERMISSIONS.KNIVES_DELETE,
    PERMISSIONS.RINGS_VIEW,
    PERMISSIONS.RINGS_CREATE,
    PERMISSIONS.RINGS_UPDATE,
    PERMISSIONS.RINGS_DELETE,
    PERMISSIONS.SEALS_VIEW,
    PERMISSIONS.SEALS_CREATE,
    PERMISSIONS.SEALS_UPDATE,
    PERMISSIONS.SEALS_DELETE,
    PERMISSIONS.REPORTS_VIEW,
  ]),
  viewer: new Set([
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.MEDALS_VIEW,
    PERMISSIONS.COINS_VIEW,
    PERMISSIONS.BANKNOTES_VIEW,
    PERMISSIONS.ANTIQUES_VIEW,
    PERMISSIONS.KNIVES_VIEW,
    PERMISSIONS.RINGS_VIEW,
    PERMISSIONS.SEALS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
  ]),
  editor: new Set([
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CATEGORIES_CREATE,
    PERMISSIONS.CATEGORIES_UPDATE,
    PERMISSIONS.MEDALS_VIEW,
    PERMISSIONS.MEDALS_CREATE,
    PERMISSIONS.MEDALS_UPDATE,
    PERMISSIONS.COINS_VIEW,
    PERMISSIONS.COINS_CREATE,
    PERMISSIONS.COINS_UPDATE,
    PERMISSIONS.BANKNOTES_VIEW,
    PERMISSIONS.BANKNOTES_CREATE,
    PERMISSIONS.BANKNOTES_UPDATE,
    PERMISSIONS.ANTIQUES_VIEW,
    PERMISSIONS.ANTIQUES_CREATE,
    PERMISSIONS.ANTIQUES_UPDATE,
    PERMISSIONS.KNIVES_VIEW,
    PERMISSIONS.KNIVES_CREATE,
    PERMISSIONS.KNIVES_UPDATE,
    PERMISSIONS.RINGS_VIEW,
    PERMISSIONS.RINGS_CREATE,
    PERMISSIONS.RINGS_UPDATE,
    PERMISSIONS.SEALS_VIEW,
    PERMISSIONS.SEALS_CREATE,
    PERMISSIONS.SEALS_UPDATE,
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
  if (!user) return false;
  const anyUser = user as UserMe & {
    is_superuser?: boolean;
    is_staff?: boolean;
  };
  if (anyUser.is_superuser) return true;

  return getRoleCodes(user).some((c) => FULL_ACCESS_ROLES.has(c));
}

export function hasPermission(
  user: UserMe | null | undefined,
  permission: string
): boolean {
  if (!user) return false;
  if (isFullAccess(user)) return true;

  const anyUser = user as UserMe & {
    permissions?: Array<string | { codename?: string }>;
  };
  if (Array.isArray(anyUser.permissions)) {
    for (const p of anyUser.permissions) {
      const code = typeof p === "string" ? p : p?.codename;
      if (code === permission) return true;
    }
  }

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
export function canViewCoins(user: UserMe | null | undefined) {
  return hasPermission(user, PERMISSIONS.COINS_VIEW);
}
export function canViewBanknotes(user: UserMe | null | undefined) {
  return (
    hasPermission(user, PERMISSIONS.BANKNOTES_VIEW) ||
    hasPermission(user, PERMISSIONS.COINS_VIEW)
  );
}
export function canViewAntiques(user: UserMe | null | undefined) {
  return hasPermission(user, PERMISSIONS.ANTIQUES_VIEW);
}
export function canViewKnives(user: UserMe | null | undefined) {
  return hasPermission(user, PERMISSIONS.KNIVES_VIEW);
}
export function canViewRings(user: UserMe | null | undefined) {
  return (
    hasPermission(user, PERMISSIONS.RINGS_VIEW) ||
    hasPermission(user, PERMISSIONS.ANTIQUES_VIEW) ||
    hasPermission(user, PERMISSIONS.KNIVES_VIEW)
  );
}
export function canViewSeals(user: UserMe | null | undefined) {
  return (
    hasPermission(user, PERMISSIONS.SEALS_VIEW) ||
    hasPermission(user, PERMISSIONS.ANTIQUES_VIEW) ||
    hasPermission(user, PERMISSIONS.KNIVES_VIEW)
  );
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
export function canManageUsers(user: UserMe | null | undefined) {
  return hasPermission(user, PERMISSIONS.USERS_MANAGE) || isFullAccess(user);
}
export function canViewRoles(user: UserMe | null | undefined) {
  return hasPermission(user, PERMISSIONS.ROLES_VIEW) || isFullAccess(user);
}
