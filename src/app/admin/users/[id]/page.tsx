"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  User as UserIcon,
  Shield,
  Link2,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import {
  getUserById,
  setUserActive,
  assignUserRoles,
  getAllRoles,
} from "@/lib/data/users";
import { invitesApi } from "@/lib/api/invites";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";
import { useToast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/api/errors";
import { resolveInviteUrl } from "@/lib/invite-url";
import type { InviteLinkCreateResponse } from "@/types/api";

const EXPIRY_OPTIONS = [
  { value: 24, label: "۲۴ ساعت" },
  { value: 48, label: "۴۸ ساعت" },
  { value: 72, label: "۷۲ ساعت" },
  { value: 168, label: "۷ روز" },
];

export default function UserDetailPage() {
  const params = useParams();
  const userId = Number(params.id);
  const queryClient = useQueryClient();
  const toast = useToast();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canManage = hasPermission(PERMISSIONS.USERS_MANAGE);
  const [selectedRoles, setSelectedRoles] = useState<number[] | null>(null);
  const [invitePassword, setInvitePassword] = useState("");
  const [inviteExpiry, setInviteExpiry] = useState(48);
  const [inviteResult, setInviteResult] =
    useState<InviteLinkCreateResponse | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);

  const { data: user, isLoading, isError, refetch } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId),
    enabled: Number.isFinite(userId),
  });

  const { data: allRoles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["roles", "all"],
    queryFn: getAllRoles,
    enabled: canManage,
  });

  const toggleMutation = useMutation({
    mutationFn: (is_active: boolean) => setUserActive(userId, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("وضعیت کاربر به‌روز شد");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "خطا در تغییر وضعیت"));
    },
  });

  const roleMutation = useMutation({
    mutationFn: (role_ids: number[]) => assignUserRoles(userId, { role_ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setSelectedRoles(null);
      toast.success("نقش‌های کاربر ذخیره شد");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "خطا در ذخیره نقش‌ها"));
    },
  });

  const inviteMutation = useMutation({
    mutationFn: invitesApi.create,
    onSuccess: (data) => {
      setInviteResult(data);
      toast.success("لینک دعوت ساخته شد");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "خطا در ساخت لینک دعوت"));
    },
  });

  const currentRoleIds = useMemo(
    () => user?.roles?.map((r) => r.id) ?? [],
    [user]
  );
  const editingRoles = selectedRoles ?? currentRoleIds;
  const rolesDirty =
    selectedRoles != null &&
    (selectedRoles.length !== currentRoleIds.length ||
      selectedRoles.some((id) => !currentRoleIds.includes(id)));

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <Alert variant="danger" title="کاربر یافت نشد">
        کاربر مورد نظر وجود ندارد.{" "}
        <button type="button" className="underline" onClick={() => refetch()}>
          تلاش مجدد
        </button>
      </Alert>
    );
  }

  const displayName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.username;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/users"
          className="mb-2 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text"
        >
          <ArrowRight className="size-4" />
          بازگشت به کاربران
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary-deep">
            <UserIcon className="size-6" />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-text">{displayName}</h1>
            <p className="text-sm text-text-muted" dir="ltr">
              @{user.username}
            </p>
          </div>
          <Badge variant={user.is_active ? "success" : "danger"}>
            {user.is_active ? "فعال" : "غیرفعال"}
          </Badge>
          {user.is_locked && <Badge variant="warning">قفل‌شده</Badge>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>اطلاعات کاربری</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-text-muted">ایمیل</span>
              <span dir="ltr">{user.email || "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-text-muted">تاریخ عضویت</span>
              <span>{formatDate(user.date_joined)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-text-muted">آخرین ورود</span>
              <span>{formatDate(user.last_login)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-text-muted">IP آخرین ورود</span>
              <span dir="ltr">{user.last_login_ip || "—"}</span>
            </div>
            {canManage && (
              <div className="pt-3">
                <Button
                  variant={user.is_active ? "outline" : "primary"}
                  size="sm"
                  loading={toggleMutation.isPending}
                  onClick={() => toggleMutation.mutate(!user.is_active)}
                >
                  {user.is_active ? "غیرفعال‌سازی" : "فعال‌سازی"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-4 text-primary" />
              نقش‌ها و دسترسی
            </CardTitle>
            <CardDescription>
              {canManage ? "نقش‌های کاربر را انتخاب و ذخیره کنید." : "فقط مشاهده"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!canManage ? (
              <div className="flex flex-wrap gap-1.5">
                {(user.roles?.length ?? 0) > 0 ? (
                  user.roles!.map((r) => (
                    <Badge key={r.id} variant="primary">
                      {r.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-text-muted">بدون نقش</span>
                )}
              </div>
            ) : rolesLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="space-y-3">
                {allRoles.length === 0 ? (
                  <p className="text-sm text-text-muted">
                    نقشی از سرور دریافت نشد. ابتدا در بخش نقش‌ها ایجاد کنید.
                  </p>
                ) : (
                  <div className="max-h-80 space-y-2 overflow-y-auto">
                    {allRoles.map((role) => (
                      <label
                        key={role.id}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 transition-colors hover:bg-surface-muted"
                      >
                        <input
                          type="checkbox"
                          checked={editingRoles.includes(role.id)}
                          disabled={roleMutation.isPending}
                          onChange={() => {
                            const next = editingRoles.includes(role.id)
                              ? editingRoles.filter((id) => id !== role.id)
                              : [...editingRoles, role.id];
                            setSelectedRoles(next);
                          }}
                          className="size-4 rounded border-border"
                        />
                        <span className="text-sm font-medium">{role.name}</span>
                        <span
                          className="mr-auto font-mono text-xs text-text-subtle"
                          dir="ltr"
                        >
                          {role.codename}
                        </span>
                        {role.is_active === false && (
                          <Badge variant="default">غیرفعال</Badge>
                        )}
                      </label>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    loading={roleMutation.isPending}
                    disabled={!rolesDirty || roleMutation.isPending}
                    onClick={() =>
                      roleMutation.mutate(selectedRoles ?? currentRoleIds)
                    }
                  >
                    ذخیره نقش‌ها
                  </Button>
                  {rolesDirty && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={roleMutation.isPending}
                      onClick={() => setSelectedRoles(null)}
                    >
                      انصراف
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="size-4 text-primary" />
              لینک دعوت / ورود
            </CardTitle>
            <CardDescription>
              ساخت لینک یک‌بارمصرف برای این کاربر.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {inviteResult ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-surface-muted/40 p-3">
                  <p
                    className="break-all font-mono text-sm leading-relaxed select-all"
                    dir="ltr"
                  >
                    {resolveInviteUrl({
                      invite_url: inviteResult.invite_url,
                      token: inviteResult.token,
                    })}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={async () => {
                      const url = resolveInviteUrl({
                        invite_url: inviteResult.invite_url,
                        token: inviteResult.token,
                      });
                      try {
                        await navigator.clipboard.writeText(url);
                        setInviteCopied(true);
                        toast.success("آدرس کامل کپی شد");
                        setTimeout(() => setInviteCopied(false), 2000);
                      } catch {
                        toast.error("کپی ناموفق بود");
                      }
                    }}
                  >
                    {inviteCopied ? (
                      <>
                        <Check className="size-4" />
                        کپی شد
                      </>
                    ) : (
                      <>
                        <Copy className="size-4" />
                        کپی لینک
                      </>
                    )}
                  </Button>
                  <Button type="button" size="sm" variant="outline" asChild>
                    <a
                      href={resolveInviteUrl({
                        invite_url: inviteResult.invite_url,
                        token: inviteResult.token,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="size-4" />
                      باز کردن
                    </a>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setInviteResult(null);
                      setInvitePassword("");
                    }}
                  >
                    ساخت لینک دیگر
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>نام کاربری</Label>
                  <Input className="mt-1.5" value={user.username} readOnly dir="ltr" />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="reinvite-password">رمز موقت (حداقل ۱۰ کاراکتر)</Label>
                  <Input
                    id="reinvite-password"
                    type="password"
                    dir="ltr"
                    className="mt-1.5"
                    placeholder="Medal!Archive2026"
                    value={invitePassword}
                    onChange={(e) => setInvitePassword(e.target.value)}
                    disabled={inviteMutation.isPending}
                  />
                </div>
                <div>
                  <Label htmlFor="reinvite-expiry">اعتبار لینک</Label>
                  <Select
                    id="reinvite-expiry"
                    className="mt-1.5"
                    value={String(inviteExpiry)}
                    onChange={(e) => setInviteExpiry(Number(e.target.value))}
                    disabled={inviteMutation.isPending}
                    options={EXPIRY_OPTIONS.map((o) => ({
                      value: o.value,
                      label: o.label,
                    }))}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    loading={inviteMutation.isPending}
                    disabled={inviteMutation.isPending || invitePassword.length < 10}
                    onClick={() => {
                      inviteMutation.mutate({
                        username: user.username,
                        password: invitePassword,
                        email: user.email || undefined,
                        expires_in_hours: inviteExpiry,
                        role_ids:
                          user.roles?.map((r) => r.id).filter(Boolean) || undefined,
                      });
                    }}
                  >
                    <Link2 className="size-4" />
                    ساخت لینک دعوت
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
