import type { User, UserMe, Role, Permission, RoleMini } from "@/types/api";

export const MOCK_PERMISSIONS: Permission[] = [
  { id: 1, codename: "categories.view", name: "مشاهده دسته‌بندی‌ها", description: "" },
  { id: 2, codename: "categories.create", name: "ایجاد دسته‌بندی", description: "" },
  { id: 3, codename: "categories.update", name: "ویرایش دسته‌بندی", description: "" },
  { id: 4, codename: "categories.delete", name: "حذف دسته‌بندی", description: "" },
  { id: 5, codename: "medals.view", name: "مشاهده مدال‌ها", description: "" },
  { id: 6, codename: "medals.create", name: "ایجاد مدال", description: "" },
  { id: 7, codename: "medals.update", name: "ویرایش مدال", description: "" },
  { id: 8, codename: "medals.delete", name: "حذف مدال", description: "" },
  { id: 9, codename: "reports.view", name: "مشاهده گزارش‌ها", description: "" },
  { id: 10, codename: "users.view", name: "مشاهده کاربران", description: "" },
  { id: 11, codename: "users.manage", name: "مدیریت کاربران", description: "" },
  { id: 12, codename: "roles.view", name: "مشاهده نقش‌ها", description: "" },
  { id: 13, codename: "roles.manage", name: "مدیریت نقش‌ها", description: "" },
];

export const MOCK_ROLES: Role[] = [
  {
    id: 1,
    name: "مدیر کل",
    codename: "admin",
    description: "دسترسی کامل به تمام بخش‌ها",
    is_active: true,
    permissions: MOCK_PERMISSIONS,
  },
  {
    id: 2,
    name: "نگهدارنده",
    codename: "curator",
    description: "مدیریت مدال‌ها و دسته‌بندی‌ها",
    is_active: true,
    permissions: MOCK_PERMISSIONS.filter((p) =>
      ["categories", "medals", "reports"].some((k) => p.codename.startsWith(k))
    ),
  },
  {
    id: 3,
    name: "بازدیدکننده",
    codename: "viewer",
    description: "فقط مشاهده",
    is_active: true,
    permissions: MOCK_PERMISSIONS.filter((p) => p.codename.endsWith(".view")),
  },
  {
    id: 4,
    name: "ویرایشگر",
    codename: "editor",
    description: "ایجاد و ویرایش محتوا",
    is_active: true,
    permissions: MOCK_PERMISSIONS.filter(
      (p) =>
        p.codename.includes(".view") ||
        p.codename.includes(".create") ||
        p.codename.includes(".update")
    ),
  },
];

const toMini = (r: Role): RoleMini => ({
  id: r.id,
  name: r.name,
  codename: r.codename,
});

export const MOCK_USERS: User[] = [
  {
    id: 1,
    username: "admin",
    email: "admin@medalarchive.ir",
    first_name: "محمد",
    last_name: "رضایی",
    roles: [toMini(MOCK_ROLES[0])],
    is_active: true,
    is_locked: false,
    must_change_password: false,
    date_joined: "2024-01-01T08:00:00Z",
    last_login: "2026-08-09T18:30:00Z",
    last_login_ip: "185.143.233.10",
  },
  {
    id: 2,
    username: "curator.sara",
    email: "sara@medalarchive.ir",
    first_name: "سارا",
    last_name: "محمدی",
    roles: [toMini(MOCK_ROLES[1])],
    is_active: true,
    is_locked: false,
    must_change_password: false,
    date_joined: "2024-03-15T10:00:00Z",
    last_login: "2026-08-08T14:00:00Z",
    last_login_ip: "91.98.12.45",
  },
  {
    id: 3,
    username: "viewer.ali",
    email: "ali@example.com",
    first_name: "علی",
    last_name: "حسینی",
    roles: [toMini(MOCK_ROLES[2])],
    is_active: true,
    is_locked: false,
    must_change_password: false,
    date_joined: "2025-01-20T09:00:00Z",
    last_login: "2026-08-05T11:20:00Z",
    last_login_ip: "5.232.10.88",
  },
  {
    id: 4,
    username: "editor.neda",
    email: "neda@medalarchive.ir",
    first_name: "ندا",
    last_name: "کریمی",
    roles: [toMini(MOCK_ROLES[3])],
    is_active: true,
    is_locked: false,
    must_change_password: false,
    date_joined: "2025-06-01T12:00:00Z",
    last_login: "2026-08-07T16:45:00Z",
    last_login_ip: "37.156.20.11",
  },
  {
    id: 5,
    username: "inactive.user",
    email: "old@example.com",
    first_name: "رضا",
    last_name: "احمدی",
    roles: [toMini(MOCK_ROLES[2])],
    is_active: false,
    is_locked: false,
    must_change_password: true,
    date_joined: "2024-08-10T08:00:00Z",
    last_login: "2025-12-01T10:00:00Z",
    last_login_ip: null,
  },
];

export const MOCK_CURRENT_USER: UserMe = {
  id: 1,
  username: "admin",
  email: "admin@medalarchive.ir",
  first_name: "محمد",
  last_name: "رضایی",
  roles: [toMini(MOCK_ROLES[0])],
  is_active: true,
  must_change_password: false,
  date_joined: "2024-01-01T08:00:00Z",
  last_login: "2026-08-09T18:30:00Z",
};
