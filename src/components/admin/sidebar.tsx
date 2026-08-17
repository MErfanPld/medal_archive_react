"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Medal,
  Coins,
  FolderOpen,
  Users,
  Shield,
  BarChart3,
  Settings,
  Landmark,
  UserPlus,
  KeyRound,
  X,
  LogOut,
  User as UserIcon,
  ChevronUp,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore, logout } from "@/stores/auth-store";
import {
  canViewMedals,
  canViewCoins,
  canViewCategories,
  canViewReports,
  canViewUsers,
  canManageUsers,
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
      { href: "/admin/dashboard", label: "داشبورد", icon: LayoutDashboard, visible: () => true },
    ],
  },
  {
    id: "collection",
    label: "مجموعه",
    items: [
      { href: "/admin/medals", label: "مدال‌ها", icon: Medal, visible: (u) => canViewMedals(u) },
      { href: "/admin/coins", label: "سکه و پول", icon: Coins, visible: (u) => canViewCoins(u) },
      { href: "/admin/categories", label: "دسته‌بندی‌ها", icon: FolderOpen, visible: (u) => canViewCategories(u) },
    ],
  },
  {
    id: "museum",
    label: "موزه",
    items: [
      { href: "/museum", label: "نمای عمومی", icon: Landmark, visible: () => true },
      { href: "/museum/medals", label: "گالری مدال‌ها", icon: ImageIcon, visible: () => true },
    ],
  },
  {
    id: "users",
    label: "مدیریت",
    items: [
      { href: "/admin/users", label: "کاربران", icon: Users, visible: (u) => canViewUsers(u) },
      { href: "/admin/users/invite", label: "دعوت‌ها", icon: UserPlus, visible: (u) => canManageUsers(u) },
      { href: "/admin/roles", label: "نقش‌ها", icon: Shield, visible: (u) => canViewRoles(u) },
      { href: "/admin/permissions", label: "دسترسی‌ها", icon: KeyRound, visible: (u) => canViewRoles(u) },
    ],
  },
  {
    id: "reports",
    label: "تحلیل",
    items: [
      { href: "/admin/reports", label: "گزارش‌ها", icon: BarChart3, visible: (u) => canViewReports(u) },
    ],
  },
  {
    id: "settings",
    label: "سیستم",
    items: [
      { href: "/admin/settings", label: "تنظیمات", icon: Settings, visible: () => true },
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
  if (href === "/museum") return pathname === "/museum";
  return pathname.startsWith(href + "/") || pathname === href;
}

export function AdminSidebar({ open, onClose, collapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const groups = NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((item) => item.visible(user)),
  })).filter((g) => g.items.length > 0);

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.username ||
    "کاربر";
  const roleLabel = user?.roles?.[0]?.name || "—";
  const initials =
    [user?.first_name?.[0], user?.last_name?.[0]].filter(Boolean).join("").toUpperCase() ||
    user?.username?.[0]?.toUpperCase() ||
    "؟";

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      document.cookie = "medal_auth=; path=/; max-age=0";
      router.replace("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "sidebar-rail fixed inset-y-0 right-0 z-50 flex flex-col transition-[transform,width] duration-200 ease-out lg:static lg:translate-x-0",
          collapsed ? "w-[4.5rem]" : "w-[17rem]",
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
        aria-label="منوی اصلی"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/80 px-4">
          {!collapsed && (
            <Link href="/admin/dashboard" className="group flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-deep text-white shadow-md shadow-primary/25 transition-transform duration-150 group-hover:scale-[1.03]">
                <Medal className="size-4" aria-hidden />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-semibold tracking-tight text-text">Medal Archive</span>
                <span className="block text-[10px] font-medium text-text-subtle">موزه دیجیتال</span>
              </span>
            </Link>
          )}
          {collapsed && (
            <Link
              href="/admin/dashboard"
              className="mx-auto flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-deep text-white shadow-md"
              title="Medal Archive"
            >
              <Medal className="size-4" />
            </Link>
          )}
          <button
            type="button"
            className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface-muted lg:hidden"
            onClick={onClose}
            aria-label="بستن منو"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.id}>
                {!collapsed && group.label ? (
                  <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-subtle">
                    {group.label}
                  </p>
                ) : null}
                <ul className="space-y-1">
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
                            "nav-item",
                            active && "nav-item-active",
                            collapsed && "justify-center px-2"
                          )}
                          aria-current={active ? "page" : undefined}
                        >
                          <Icon
                            className={cn(
                              "nav-item-icon size-[1.125rem] shrink-0",
                              active && "text-primary"
                            )}
                            aria-hidden
                          />
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
          <div className="relative shrink-0 border-t border-border/80 p-3" ref={menuRef}>
            {userMenuOpen && (
              <div className="absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-xl border border-border bg-surface shadow-lg animate-fade-up">
                <Link
                  href="/profile"
                  onClick={() => {
                    setUserMenuOpen(false);
                    onClose?.();
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm text-text transition-colors hover:bg-surface-muted"
                >
                  <UserIcon className="size-4 text-text-muted" />
                  پروفایل
                </Link>
                <Link
                  href="/admin/settings"
                  onClick={() => {
                    setUserMenuOpen(false);
                    onClose?.();
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm text-text transition-colors hover:bg-surface-muted"
                >
                  <Settings className="size-4 text-text-muted" />
                  تنظیمات
                </Link>
                <button
                  type="button"
                  disabled={loggingOut}
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-danger transition-colors hover:bg-danger-bg disabled:opacity-50"
                >
                  <LogOut className="size-4" />
                  {loggingOut ? "در حال خروج…" : "خروج"}
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-surface-muted/50 px-3 py-2.5 text-right transition-all duration-150 hover:border-primary/20 hover:bg-surface-muted"
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/25 to-primary/10 text-xs font-semibold text-primary-deep ring-2 ring-primary/10">
                {initials}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-text">{displayName}</span>
                <span className="block truncate text-xs text-text-muted">{roleLabel}</span>
              </span>
              <ChevronUp
                className={cn(
                  "size-4 shrink-0 text-text-subtle transition-transform duration-150",
                  userMenuOpen ? "rotate-0" : "rotate-180"
                )}
              />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
