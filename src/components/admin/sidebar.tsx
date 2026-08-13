"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Medal,
  FolderOpen,
  Users,
  Shield,
  BarChart3,
  Settings,
  Landmark,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import {
  canViewMedals,
  canViewCategories,
  canViewReports,
  canViewUsers,
  canViewRoles,
} from "@/lib/permissions";

type User = ReturnType<typeof useAuthStore.getState>["user"];

interface NavLeaf {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  visible: (user: User) => boolean;
}

interface NavGroup {
  id: string;
  label: string;
  items: NavLeaf[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: "main",
    label: "",
    items: [
      {
        href: "/admin/dashboard",
        label: "داشبورد",
        icon: LayoutDashboard,
        visible: () => true,
      },
    ],
  },
  {
    id: "collection",
    label: "مدیریت مجموعه",
    items: [
      {
        href: "/admin/medals",
        label: "مدال‌ها",
        icon: Medal,
        visible: (u) => canViewMedals(u),
      },
      {
        href: "/admin/categories",
        label: "دسته‌بندی‌ها",
        icon: FolderOpen,
        visible: (u) => canViewCategories(u),
      },
    ],
  },
  {
    id: "museum",
    label: "موزه",
    items: [
      {
        href: "/museum",
        label: "نمای موزه",
        icon: Landmark,
        visible: () => true,
      },
    ],
  },
  {
    id: "users",
    label: "مدیریت کاربران",
    items: [
      {
        href: "/admin/users",
        label: "کاربران",
        icon: Users,
        visible: (u) => canViewUsers(u),
      },
      {
        href: "/admin/roles",
        label: "نقش‌ها",
        icon: Shield,
        visible: (u) => canViewRoles(u),
      },
    ],
  },
  {
    id: "reports",
    label: "گزارش‌ها",
    items: [
      {
        href: "/admin/reports",
        label: "گزارش‌ها",
        icon: BarChart3,
        visible: (u) => canViewReports(u),
      },
    ],
  },
  {
    id: "settings",
    label: "",
    items: [
      {
        href: "/admin/settings",
        label: "تنظیمات",
        icon: Settings,
        visible: () => true,
      },
    ],
  },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
}

function isActive(pathname: string, href: string) {
  if (pathname === href) return true;
  if (href === "/admin/dashboard") return false;
  if (href === "/museum") return pathname.startsWith("/museum");
  return pathname.startsWith(href);
}

export function AdminSidebar({ open, onClose, collapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  const groups = NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((item) => item.visible(user)),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex flex-col border-l border-border bg-surface transition-transform duration-200 lg:static lg:translate-x-0",
          collapsed ? "w-[4.5rem]" : "w-64",
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
        aria-label="منوی اصلی"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
          {!collapsed && (
            <Link
              href="/admin/dashboard"
              className="text-sm font-semibold tracking-tight text-primary-deep"
            >
              Medal Archive
            </Link>
          )}
          <button
            type="button"
            className="rounded-md p-1.5 text-text-muted hover:bg-surface-muted lg:hidden"
            onClick={onClose}
            aria-label="بستن منو"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-5">
            {groups.map((group) => (
              <div key={group.id}>
                {!collapsed && group.label ? (
                  <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
                    {group.label}
                  </p>
                ) : null}
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = isActive(pathname, item.href);
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          title={collapsed ? item.label : undefined}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                            active
                              ? "bg-primary/10 text-primary-deep"
                              : "text-text-muted hover:bg-surface-muted hover:text-text"
                          )}
                          aria-current={active ? "page" : undefined}
                        >
                          <Icon className="size-5 shrink-0" aria-hidden />
                          {!collapsed && <span>{item.label}</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        {!collapsed && user && (
          <div className="shrink-0 border-t border-border p-3">
            <div className="rounded-lg bg-surface-muted/60 px-3 py-2.5">
              <p className="truncate text-sm font-medium text-text">
                {user.first_name || user.last_name
                  ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
                  : user.username}
              </p>
              <p className="truncate text-xs text-text-muted" dir="ltr">
                {user.username}
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
