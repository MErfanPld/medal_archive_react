"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, User as UserIcon } from "lucide-react";
import { getUsers, setUserActive } from "@/lib/data/users";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { Pagination } from "@/components/ui/pagination";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["users", page, search],
    queryFn: () => getUsers({ page, search: search || undefined }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      setUserActive(id, is_active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const users = data?.results ?? [];
  const total = data?.count ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">کاربران</h1>
        <p className="mt-1 text-sm text-text-muted">مدیریت کاربران سیستم</p>
      </div>

      <Card>
        <CardContent className="flex gap-2 p-4">
          <form
            className="flex flex-1 gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(searchInput);
              setPage(1);
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-subtle" />
              <Input
                placeholder="جستجوی کاربر…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pr-9"
              />
            </div>
            <Button type="submit" variant="secondary">
              جستجو
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <Alert variant="danger" className="flex justify-between">
          <span>خطا در بارگذاری کاربران</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            تلاش مجدد
          </Button>
        </Alert>
      ) : users.length === 0 ? (
        <EmptyState
          title="کاربری یافت نشد"
          description="با فیلترهای فعلی نتیجه‌ای وجود ندارد."
          icon={<UserIcon className="size-10" />}
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
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-border last:border-0 hover:bg-surface-muted/30"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="font-medium text-text hover:text-primary"
                      >
                        {[u.first_name, u.last_name].filter(Boolean).join(" ") ||
                          u.username}
                      </Link>
                      <p className="text-xs text-text-subtle">{u.username}</p>
                    </td>
                    <td className="hidden px-4 py-3 text-text-muted sm:table-cell">
                      {u.roles.map((r) => r.name).join("، ") || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={u.is_active ? "success" : "default"}>
                        {u.is_active ? "فعال" : "غیرفعال"}
                      </Badge>
                    </td>
                    <td className="hidden px-4 py-3 text-text-muted md:table-cell">
                      {formatDate(u.last_login)}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        loading={toggleMutation.isPending}
                        onClick={() =>
                          toggleMutation.mutate({
                            id: u.id,
                            is_active: !u.is_active,
                          })
                        }
                      >
                        {u.is_active ? "غیرفعال‌سازی" : "فعال‌سازی"}
                      </Button>
                    </td>
                  </tr>
                ))}
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
    </div>
  );
}
