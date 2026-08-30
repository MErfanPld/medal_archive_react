"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { KeyRound, RefreshCw } from "lucide-react";
import {
  ListFilters,
  FilterSearchField,
} from "@/components/admin/list-filters";
import { getPermissions } from "@/lib/data/users";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";

const GROUP_LABELS: Record<string, string> = {
  categories: "دسته‌بندی‌ها",
  medals: "مدال‌ها",
  reports: "گزارش‌ها",
  users: "کاربران",
  roles: "نقش‌ها",
  permissions: "دسترسی‌ها",
  auth: "احراز هویت",
  other: "سایر",
};

export default function PermissionsPage() {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canView =
    hasPermission(PERMISSIONS.ROLES_VIEW) ||
    hasPermission(PERMISSIONS.ROLES_MANAGE) ||
    hasPermission(PERMISSIONS.USERS_MANAGE);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data: permissions = [], isLoading, isError, refetch, isFetching } =
    useQuery({
      queryKey: ["permissions"],
      queryFn: getPermissions,
    });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return permissions;
    return permissions.filter(
      (p) =>
        p.codename.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q)
    );
  }, [permissions, search]);

  const groups = useMemo(() => {
    const map: Record<string, typeof permissions> = {};
    for (const p of filtered) {
      const key = p.codename.includes(".")
        ? p.codename.split(".")[0]
        : "other";
      if (!map[key]) map[key] = [];
      map[key].push(p);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  if (!canView) {
    return (
      <Alert variant="danger" title="دسترسی غیرمجاز">
        شما مجوز مشاهده دسترسی‌ها را ندارید.
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-page-title">دسترسی‌ها</h1>
          <p className="mt-1 text-caption">
            فهرست Permissionهای سیستم (فقط مشاهده — از API)
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
          بروزرسانی
        </Button>
      </div>

      <ListFilters>
        <FilterSearchField
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={() => setSearch(searchInput.trim())}
          placeholder="جستجو در نام یا codename…"
        />
      </ListFilters>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <Alert variant="danger" className="flex justify-between">
          <span>خطا در دریافت دسترسی‌ها</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            تلاش مجدد
          </Button>
        </Alert>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="دسترسی‌ای یافت نشد"
          icon={<KeyRound className="size-10" />}
        />
      ) : (
        <div className="space-y-4">
          {groups.map(([group, items]) => (
            <Card key={group}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{GROUP_LABELS[group] ?? group}</span>
                  <Badge variant="outline">{items.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-border">
                  {items.map((p) => (
                    <li
                      key={p.id}
                      className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-text">
                          {p.name}
                        </p>
                        {p.description && (
                          <p className="text-caption">{p.description}</p>
                        )}
                      </div>
                      <code
                        className="shrink-0 rounded bg-surface-muted px-2 py-0.5 font-mono text-xs text-text-muted"
                        dir="ltr"
                      >
                        {p.codename}
                      </code>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
