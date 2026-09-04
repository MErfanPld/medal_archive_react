"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Medal,
  Coins,
  Banknote,
  Gem,
  Sword,
  Package,
  Hexagon,
  Stamp,
  CircleDot,
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
  canViewBanknotes,
  canViewAntiques,
  canViewKnives,
  canViewRings,
  canViewSeals,
  canViewStamps,
  canViewTasbih,
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
    label: "مجموعه",
    items: [
      {
        href: "/admin/medals",
        label: "مدال‌ها",
        icon: Medal,
        visible: (u) => canViewMedals(u),
      },
      {
        href: "/admin/coins",
        label: "سکه و پول",
        icon: Coins,
        visible: (u) => canViewCoins(u),
      },
      {
        href: "/admin/banknotes",
        label: "اسکناس",
        icon: Banknote,
        visible: (u) => canViewBanknotes(u),
      },
      {
        href: "/admin/antiques",
        label: "آنتیک",
        icon: Package,
        visible: (u) => canViewAntiques(u),
      },
      {
        href: "/admin/knives",
        label: "چاقو",
        icon: Sword,
        visible: (u) => canViewKnives(u),
      },
      {
        href: "/admin/rings",
        label: "انگشتر",
        icon: Gem,
        visible: (u) => canViewRings(u),
      },
      {
        href: "/admin/seals",
        label: "مهر",
        icon: Hexagon,
        visible: (u) => canViewSeals(u),
      },
      {
        href: "/admin/stamps",
        label: "تمبر",
        icon: Stamp,
        visible: (u) => canViewStamps(u),
      },
      {
        href: "/admin/tasbih",
        label: "تسبیح",
        icon: CircleDot,
        visible: (u) => canViewTasbih(u),
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
        label: "نمای عمومی",
        icon: Landmark,
        visible: () => true,
      },
      {
        href: "/museum/medals",
        label: "گالری مدال‌ها",
        icon: ImageIcon,
        visible: () => true,
      },
      {
        href: "/museum/coins",
        label: "گالری سکه و پول",
        icon: Coins,
        visible: () => true,
      },
    ],
  },
  {
    id: "admin",
    label: "مدیریت",
    items: [
      {
        href: "/admin/users",
        label: "کاربران",
        icon: Users,
        visible: (u) => canViewUsers(u),
      },
      {
        href: "/admin/users/invite",
        label: "دعوت کاربر",
        icon: UserPlus,
        visible: (u) => canManageUsers(u),
      },
      {
        href: "/admin/roles",
        label: "نقش‌ها",
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
    ],
  },
];

export function AdminSidebar({ open, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userMenuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [userMenuOpen]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

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
          "fixed inset-y-0 right-0 z-50 flex w-64 flex-col border-l border-border bg-surface transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <Link href="/admin/dashboard" className="font-semibold text-text">
            پنل مدیریت آثار ناصر صلب
          </Link>
          <button
            type="button"
            className="rounded-md p-1 text-text-muted hover:bg-surface-muted lg:hidden"
            onClick={onClose}
            aria-label="بستن"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          {NAV_GROUPS.map((group) => {
            const items = group.items.filter((item) => item.visible(user));
            if (!items.length) return null;
            return (
              <div key={group.id} className="mb-4">
                {group.label && (
                  <p className="mb-1.5 px-2 text-xs font-medium text-text-muted">
                    {group.label}
                  </p>
                )}
                <ul className="space-y-0.5">
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
                            "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                            active
                              ? "bg-primary/10 font-medium text-primary"
                              : "text-text-muted hover:bg-surface-muted hover:text-text"
                          )}
                        >
                          <Icon className="size-4 shrink-0" />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="relative border-t border-border p-3" ref={menuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-surface-muted"
          >
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-primary">
              <UserIcon className="size-4" />
            </div>
            <div className="min-w-0 flex-1 text-right">
              <p className="truncate font-medium text-text">
                {user?.full_name || user?.username || "کاربر"}
              </p>
              <p className="truncate text-xs text-text-muted">
                {user?.email || ""}
              </p>
            </div>
            <ChevronUp
              className={cn(
                "size-4 text-text-muted transition-transform",
                !userMenuOpen && "rotate-180"
              )}
            />
          </button>
          {userMenuOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-1 rounded-lg border border-border bg-surface py-1 shadow-lg">
              <Link
                href="/profile"
                className="block px-3 py-2 text-sm hover:bg-surface-muted"
                onClick={() => setUserMenuOpen(false)}
              >
                پروفایل
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-surface-muted"
              >
                <LogOut className="size-4" />
                خروج
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
