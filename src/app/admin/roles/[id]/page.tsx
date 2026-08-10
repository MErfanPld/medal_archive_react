"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Pencil, ArrowRight } from "lucide-react";
import { getRoleById } from "@/lib/data/users";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";

export default function RoleDetailPage() {
  const params = useParams();
  const roleId = Number(params.id);
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canManage = hasPermission(PERMISSIONS.ROLES_MANAGE);

  const { data: role, isLoading, isError } = useQuery({
    queryKey: ["role", roleId],
    queryFn: () => getRoleById(roleId),
    enabled: Number.isFinite(roleId),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !role) {
    return (
      <Alert variant="danger" title="نقش یافت نشد">
        نقش مورد نظر وجود ندارد.
      </Alert>
    );
  }

  const grouped = (role.permissions ?? []).reduce<
    Record<string, typeof role.permissions>
  >((acc, p) => {
    const group = p.codename.split(".")[0] || "other";
    if (!acc[group]) acc[group] = [];
    acc[group].push(p);
    return acc;
  }, {});

  const groupLabels: Record<string, string> = {
    categories: "دسته‌بندی‌ها",
    medals: "مدال‌ها",
    reports: "گزارش‌ها",
    users: "کاربران",
    roles: "نقش‌ها",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/admin/roles"
            className="mb-2 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text"
          >
            <ArrowRight className="size-4" />
            بازگشت به لیست نقش‌ها
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-text">{role.name}</h1>
            <Badge variant={role.is_active ? "success" : "default"}>
              {role.is_active ? "فعال" : "غیرفعال"}
            </Badge>
          </div>
          <p className="mt-1 font-mono text-sm text-text-subtle">
            {role.codename}
          </p>
          {role.description && (
            <p className="mt-2 text-sm text-text-muted">{role.description}</p>
          )}
        </div>
        {canManage && (
          <Link href={`/admin/roles/${role.id}/edit`}>
            <Button variant="outline">
              <Pencil className="size-4" />
              ویرایش
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            مجوزهای تخصیص‌یافته ({role.permissions?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.keys(grouped).length === 0 ? (
            <p className="text-sm text-text-muted">مجوزی تخصیص داده نشده است.</p>
          ) : (
            Object.entries(grouped).map(([group, perms]) => (
              <div key={group}>
                <h3 className="mb-2 text-sm font-semibold text-text">
                  {groupLabels[group] || group}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {perms.map((p) => (
                    <Badge key={p.id} variant="primary">
                      {p.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
