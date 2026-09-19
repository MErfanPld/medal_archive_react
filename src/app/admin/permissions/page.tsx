"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { KeyRound, RefreshCw } from "lucide-react";
import {
  ListFilters,
  FilterSearchField,
} from "@/components/admin/list-filters";
import { getPermissions } from "@/lib/data/users";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/auth-store";
import {
  PERMISSIONS,
  getPermissionGroupLabel,
  getPermissionLabel,
  getPermissionGroupKey,
} from "@/lib/permissions";

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
    return permissions.filter((p) => {
      const label = getPermissionLabel(p.codename, p.name).toLowerCase();
      return (
        label.includes(q) ||
        p.codename.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q)
      );
    });
  }, [permissions, search]);

  const groups = useMemo(() => {
    const map: Record<string, typeof permissions> = {};
    for (const p of filtered) {
      const key = getPermissionGroupKey(p.codename, p.name);
      if (!map[key]) map[key] = [];
      map[key].push(p);
    }
    return Object.entries(map).sort(([a], [b]) =>
      getPermissionGroupLabel(a).localeCompare(getPermissionGroupLabel(b), "fa")
    );
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
          <p className="mt-1 text-caption">فهرست دسترسی‌های سامانه به زبان ساده</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
          به‌روزرسانی
        </Button>
      </div>

      <ListFilters
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(searchInput);
        }}
      >
        <FilterSearchField
          value={searchInput}
          onChange={setSearchInput}
          placeholder="جستجو در دسترسی‌ها…"
        />
      </ListFilters>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : isError ? (
        <Alert variant="danger" title="خطا">
          دریافت دسترسی‌ها ناموفق بود.
          <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
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
                  <span>{getPermissionGroupLabel(group)}</span>
                  <Badge variant="outline">{items.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-border">
                  {items.map((p) => (
                    <li key={p.id} className="py-2.5">
                      <p className="text-sm font-medium text-text">
                        {getPermissionLabel(p.codename, p.name)}
                      </p>
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
