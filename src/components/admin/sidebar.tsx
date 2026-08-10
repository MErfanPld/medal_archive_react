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

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  visible: (user: ReturnType<typeof useAuthStore.getState>["user"]) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/admin/dashboard",
    label: "داشبورد",
    icon: LayoutDashboard,
    visible: () => true,
  },
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
  {
    href: "/admin/users",
    label: "کاربران",
    icon: Users,
    visible: (u) => canViewUsers(u),
  },
  {
    href: "/admin/roles",
    label: "نقش‌ها و دسترسی‌ها",
    icon: Shield,
    visible: (u) => canViewRoles(u),
  },
  {
    href: "/admin/reports",
    label: "گزارش‌ها",
    icon: BarChart3,
    visible: (u) => canViewReports(u),
  },
  {
    href: "/admin/settings",
    label: "تنظیمات",
    icon: Settings,
    visible: () => true,
  },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
}

export function AdminSidebar({ open, onClose, collapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  const items = NAV_ITEMS.filter((item) => item.visible(user));

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
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
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

        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {items.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/admin/dashboard" &&
                  pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
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
        </nav>
      </aside>
    </>
  );
}
