"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  User as UserIcon,
  UserPlus,
  RefreshCw,
} from "lucide-react";
import { getUsers, setUserActive } from "@/lib/data/users";
import { formatDate, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";

type StatusFilter = "all" | "active" | "inactive";

export default function UsersPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canManage = hasPermission(PERMISSIONS.USERS_MANAGE);
  const canView = hasPermission(PERMISSIONS.USERS_VIEW) || canManage;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [toggleTarget, setToggleTarget] = useState<{
    id: number;
    is_active: boolean;
    name: string;
  } | null>(null);

  const isActiveParam = status === "all" ? undefined : status === "active";

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["users", page, search, status],
    queryFn: () =>
      getUsers({
        page,
        search: search || undefined,
        is_active: isActiveParam,
      }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      setUserActive(id, is_active),
    onSuccess: (user) => {
      if (!user) {
        toast.error("عملیات ناموفق بود");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setToggleTarget(null);
      toast.success(user.is_active ? "کاربر فعال شد" : "کاربر غیرفعال شد");
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError ? err.message : "خطا در تغییر وضعیت کاربر"
      );
    },
  });

  if (!canView) {
    return (
      <Alert variant="danger" title="دسترسی غیرمجاز">
        شما مجوز مشاهده کاربران را ندارید.
      </Alert>
    );
  }

  const users = data?.results ?? [];
  const total = data?.count ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-page-title">کاربران</h1>
          <p className="mt-1 text-caption">مدیریت حساب‌ها، وضعیت و نقش‌ها</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
            بروزرسانی
          </Button>
          {canManage && (
            <>
              <Button variant="outline" asChild>
                <Link href="/admin/users/invite">
                  <UserPlus className="size-4" />
                  دعوت با لینک
                </Link>
              </Button>
              <Button asChild>
                <Link href="/admin/users/new">
                  <UserPlus className="size-4" />
                  افزودن کاربر
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="panel p-3 sm:p-4">
        <div className="flex flex-wrap items-end gap-3">
          <form
            className="flex min-w-[200px] flex-1 gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(searchInput.trim());
              setPage(1);
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-subtle" />
              <Input
                placeholder="جستجو نام، نام کاربری یا ایمیل…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pr-9"
              />
            </div>
            <Button type="submit" variant="secondary">
              جستجو
            </Button>
          </form>
          <select
            className="h-10 rounded-lg border border-border bg-surface px-3 text-sm"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as StatusFilter);
              setPage(1);
            }}
            aria-label="فیلتر وضعیت"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="active">فعال</option>
            <option value="inactive">غیرفعال</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <Alert variant="danger" className="flex items-center justify-between">
          <span>خطا در دریافت لیست کاربران</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            تلاش مجدد
          </Button>
        </Alert>
      ) : users.length === 0 ? (
        <EmptyState
          title="کاربری یافت نشد"
          description="با فیلتر فعلی نتیجه‌ای وجود ندارد."
          icon={<UserIcon className="size-10" />}
          action={
            canManage ? (
              <Button asChild>
                <Link href="/admin/users/new">افزودن کاربر</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/50 text-right text-text-muted">
                  <th className="px-4 py-3 font-medium">کاربر</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">نقش</th>
                  <th className="px-4 py-3 font-medium">وضعیت</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">آخرین ورود</th>
                  <th className="px-4 py-3 font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const name =
                    [u.first_name, u.last_name].filter(Boolean).join(" ") ||
                    u.username;
                  return (
                    <tr
                      key={u.id}
                      className="border-b border-border last:border-0 hover:bg-surface-muted/30"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="font-medium text-text hover:text-primary"
                        >
                          {name}
                        </Link>
                        <p className="text-xs text-text-subtle" dir="ltr">
                          {u.username}
                        </p>
                      </td>
                      <td className="hidden px-4 py-3 text-text-muted sm:table-cell">
                        {u.roles?.map((r) => r.name).join("، ") || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={u.is_active ? "success" : "danger"}>
                          {u.is_active ? "فعال" : "غیرفعال"}
                        </Badge>
                      </td>
                      <td className="hidden px-4 py-3 text-text-muted md:table-cell">
                        {formatDate(u.last_login)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/users/${u.id}`}>جزئیات</Link>
                          </Button>
                          {canManage && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setToggleTarget({
                                  id: u.id,
                                  is_active: u.is_active,
                                  name,
                                })
                              }
                            >
                              {u.is_active ? "غیرفعال" : "فعال"}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            pageSize={20}
            total={total}
            onPageChange={setPage}
          />
        </>
      )}

      <ConfirmDialog
        open={toggleTarget != null}
        onClose={() => setToggleTarget(null)}
        title={toggleTarget?.is_active ? "غیرفعال‌سازی کاربر" : "فعال‌سازی کاربر"}
        description={
          toggleTarget
            ? `آیا از ${toggleTarget.is_active ? "غیرفعال" : "فعال"} کردن «${toggleTarget.name}» مطمئن هستید؟`
            : ""
        }
        confirmLabel={toggleTarget?.is_active ? "غیرفعال کن" : "فعال کن"}
        variant={toggleTarget?.is_active ? "danger" : "primary"}
        loading={toggleMutation.isPending}
        onConfirm={() => {
          if (!toggleTarget) return;
          toggleMutation.mutate({
            id: toggleTarget.id,
            is_active: !toggleTarget.is_active,
          });
        }}
      />
    </div>
  );
}
