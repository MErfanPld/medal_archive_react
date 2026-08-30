"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Shield, Pencil, Trash2, Eye } from "lucide-react";
import {
  ListFilters,
  FilterSearchField,
} from "@/components/admin/list-filters";
import { getRoles, deleteRole } from "@/lib/data/users";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";

export default function RolesPage() {
  const queryClient = useQueryClient();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canManage = hasPermission(PERMISSIONS.ROLES_MANAGE);
  const canView = hasPermission(PERMISSIONS.ROLES_VIEW) || canManage;
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["roles"],
    queryFn: () => getRoles(1),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setDeleteId(null);
    },
    onError: () => {
      // keep dialog open; user can retry
    },
  });

  if (!canView) {
    return (
      <Alert variant="danger" title="دسترسی غیرمجاز">
        شما مجوز مشاهده نقش‌ها را ندارید.
      </Alert>
    );
  }

  const rolesAll = data?.results ?? [];
  const roles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rolesAll;
    return rolesAll.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.codename ?? "").toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q)
    );
  }, [rolesAll, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-text">نقش‌ها و مجوزها</h1>
          <p className="mt-1 text-sm text-text-muted">
            مدیریت نقش‌های کاربری و ماتریس دسترسی
          </p>
        </div>
        {canManage && (
          <Link href="/admin/roles/new">
            <Button>
              <Plus className="size-4" />
              نقش جدید
            </Button>
          </Link>
        )}
      </div>

      <ListFilters>
        <FilterSearchField
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={() => setSearch(searchInput.trim())}
          placeholder="جستجو در نام یا کد نقش…"
        />
      </ListFilters>

      {isError && (
        <Alert variant="danger" title="خطا در بارگذاری">
          <button type="button" onClick={() => refetch()} className="underline">
            تلاش مجدد
          </button>
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : roles.length === 0 ? (
        <EmptyState
          icon={<Shield className="size-10" />}
          title="نقشی تعریف نشده"
          description="هنوز هیچ نقشی در سیستم ثبت نشده است."
          action={
            canManage ? (
              <Link href="/admin/roles/new">
                <Button>ایجاد اولین نقش</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {roles.map((role) => (
            <Card key={role.id} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-text">{role.name}</h2>
                      <Badge variant={role.is_active ? "success" : "default"}>
                        {role.is_active ? "فعال" : "غیرفعال"}
                      </Badge>
                    </div>
                    <p className="mt-1 font-mono text-xs text-text-subtle">
                      {role.codename}
                    </p>
                    {role.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-text-muted">
                        {role.description}
                      </p>
                    )}
                    <p className="mt-3 text-xs text-text-muted">
                      {role.permissions?.length ?? 0} مجوز
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Link href={`/admin/roles/${role.id}`}>
                      <Button variant="ghost" size="sm" aria-label="مشاهده">
                        <Eye className="size-4" />
                      </Button>
                    </Link>
                    {canManage && (
                      <>
                        <Link href={`/admin/roles/${role.id}/edit`}>
                          <Button variant="ghost" size="sm" aria-label="ویرایش">
                            <Pencil className="size-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(role.id)}
                          aria-label="حذف"
                        >
                          <Trash2 className="size-4 text-danger" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteId != null}
        onClose={() => setDeleteId(null)}
        title="حذف نقش"
        description="آیا از حذف این نقش مطمئن هستید؟ این عمل قابل بازگشت نیست."
        confirmLabel="حذف"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteId != null && deleteMutation.mutate(deleteId)}
      />
    </div>
  );
}
