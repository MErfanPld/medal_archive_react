"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowRight, Copy, Check, UserPlus } from "lucide-react";
import { invitesApi } from "@/lib/api/invites";
import { getRoles } from "@/lib/data/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";
import type { InviteLinkCreateResponse } from "@/types/api";

/**
 * Backend InviteLinkCreateSerializer (medal_archive_api):
 * - password min_length=10 + Django validate_password
 * - expires_in_hours: 1 .. 336 (14 days)
 * - username must not already exist
 */
const EXPIRY_OPTIONS = [
  { value: 1, label: "۱ ساعت" },
  { value: 6, label: "۶ ساعت" },
  { value: 12, label: "۱۲ ساعت" },
  { value: 24, label: "۲۴ ساعت" },
  { value: 48, label: "۴۸ ساعت (پیشنهادی)" },
  { value: 72, label: "۷۲ ساعت" },
  { value: 168, label: "۷ روز" },
  { value: 336, label: "۱۴ روز" },
];

const schema = z.object({
  username: z
    .string()
    .min(3, "حداقل ۳ کاراکتر")
    .regex(/^[a-zA-Z0-9._-]+$/, "فقط حروف انگلیسی، عدد، . _ -"),
  password: z
    .string()
    .min(10, "حداقل ۱۰ کاراکتر (طبق Backend)")
    .max(128, "حداکثر ۱۲۸ کاراکتر"),
  email: z.string().email("ایمیل نامعتبر").optional().or(z.literal("")),
  expires_in_hours: z.coerce.number().min(1).max(336),
});

type FormValues = z.infer<typeof schema>;

export default function InviteUserPage() {
  const toast = useToast();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canManage = hasPermission(PERMISSIONS.USERS_MANAGE);
  const [result, setResult] = useState<InviteLinkCreateResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ["roles", "invite"],
    queryFn: () => getRoles(1),
    enabled: canManage,
  });

  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      expires_in_hours: 48,
    },
  });

  const mutation = useMutation({
    mutationFn: invitesApi.create,
    onSuccess: (data) => {
      setResult(data);
      toast.success("لینک دعوت با موفقیت ایجاد شد");
    },
    onError: (err) => {
      const msg = getErrorMessage(err, "خطا در ساخت لینک دعوت");
      toast.error(msg);

      if (err instanceof ApiError && err.body && typeof err.body === "object") {
        const body = err.body as Record<string, unknown>;
        const fieldMap: Record<string, keyof FormValues> = {
          username: "username",
          password: "password",
          email: "email",
          expires_in_hours: "expires_in_hours",
        };
        for (const [key, val] of Object.entries(body)) {
          const field = fieldMap[key];
          if (!field) continue;
          const text = Array.isArray(val)
            ? val.map(String).join(" ")
            : typeof val === "string"
              ? val
              : "";
          if (text) {
            setError(field, { type: "server", message: text });
          }
        }
      }
    },
  });

  if (!canManage) {
    return (
      <Alert variant="danger" title="دسترسی غیرمجاز">
        شما مجوز دعوت کاربر (users.manage) را ندارید.
      </Alert>
    );
  }

  const onSubmit = handleSubmit((values) => {
    if (mutation.isPending) return;
    setResult(null);
    clearErrors();

    const payload: {
      username: string;
      password: string;
      email?: string;
      role_ids?: number[];
      expires_in_hours: number;
    } = {
      username: values.username.trim(),
      password: values.password,
      expires_in_hours: Number(values.expires_in_hours),
    };
    const email = values.email?.trim();
    if (email) payload.email = email;
    if (selectedRoles.length > 0) payload.role_ids = selectedRoles;

    mutation.mutate(payload);
  });

  const copyLink = async () => {
    if (!result?.invite_url) return;
    try {
      await navigator.clipboard.writeText(result.invite_url);
      setCopied(true);
      toast.success("لینک کپی شد");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("کپی ناموفق بود");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/admin/users"
          className="mb-2 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text"
        >
          <ArrowRight className="size-4" />
          بازگشت به کاربران
        </Link>
        <h1 className="text-page-title flex items-center gap-2">
          <UserPlus className="size-5 text-primary" />
          دعوت کاربر
        </h1>
        <p className="mt-1 text-caption">
          ساخت لینک دعوت یک‌بارمصرف از طریق API واقعی Backend
        </p>
      </div>

      {result && (
        <Card className="border-emerald-200 bg-emerald-50/40 dark:border-emerald-900 dark:bg-emerald-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <Check className="size-5" />
              لینک دعوت با موفقیت ایجاد شد
            </CardTitle>
            <CardDescription>
              این لینک از سمت سرور ساخته شده است. آن را برای کاربر جدید بفرستید.
              لینک یک‌بارمصرف است.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.user && (
              <p className="text-sm text-text-muted">
                کاربر:{" "}
                <span className="font-medium text-text" dir="ltr">
                  {result.user.username}
                </span>
                {result.user.email ? (
                  <span className="text-text-subtle" dir="ltr">
                    {" "}
                    ({result.user.email})
                  </span>
                ) : null}
              </p>
            )}
            {result.token && (
              <p className="text-meta">
                توکن:{" "}
                <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-xs" dir="ltr">
                  {result.token}
                </code>
              </p>
            )}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                readOnly
                value={result.invite_url}
                dir="ltr"
                className="font-mono text-xs"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={copyLink}
                className="shrink-0"
              >
                {copied ? (
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
            </div>
            {result.expires_at && (
              <p className="text-meta">
                انقضا:{" "}
                {new Date(result.expires_at).toLocaleString("fa-IR")}
              </p>
            )}
            {result.warning && (
              <Alert variant="warning" title="هشدار سرور">
                {result.warning}
              </Alert>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setResult(null);
                reset({
                  username: "",
                  password: "",
                  email: "",
                  expires_in_hours: 48,
                });
                setSelectedRoles([]);
              }}
            >
              دعوت جدید
            </Button>
          </CardContent>
        </Card>
      )}

      {!result && (
        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          <Card>
            <CardHeader>
              <CardTitle>اطلاعات حساب</CardTitle>
              <CardDescription>
                نام کاربری و رمز موقت مطابق قرارداد API ارسال می‌شوند.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="username">نام کاربری</Label>
                <Input
                  id="username"
                  dir="ltr"
                  autoComplete="off"
                  className="mt-1.5"
                  disabled={mutation.isPending}
                  {...register("username")}
                  error={errors.username?.message}
                />
              </div>
              <div>
                <Label htmlFor="password">رمز موقت</Label>
                <Input
                  id="password"
                  type="password"
                  dir="ltr"
                  autoComplete="new-password"
                  className="mt-1.5"
                  disabled={mutation.isPending}
                  {...register("password")}
                  error={errors.password?.message}
                />
                <p className="mt-1 text-xs text-text-muted">
                  حداقل ۱۰ کاراکتر؛ نباید فقط عدد باشد، شبیه نام کاربری یا خیلی
                  رایج (مثل Password123) باشد — قوانین Django validate_password.
                </p>
              </div>
              <div>
                <Label htmlFor="email">ایمیل (اختیاری)</Label>
                <Input
                  id="email"
                  type="email"
                  dir="ltr"
                  className="mt-1.5"
                  disabled={mutation.isPending}
                  {...register("email")}
                  error={errors.email?.message}
                />
              </div>
              <div>
                <Label htmlFor="expires">اعتبار لینک</Label>
                <Controller
                  name="expires_in_hours"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="expires"
                      className="mt-1.5"
                      disabled={mutation.isPending}
                      value={String(field.value)}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value))
                      }
                      options={EXPIRY_OPTIONS.map((o) => ({
                        value: o.value,
                        label: o.label,
                      }))}
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>نقش‌های اولیه</CardTitle>
              <CardDescription>
                نقش‌ها از API واقعی دریافت می‌شوند و در فیلد{" "}
                <code className="text-xs">role_ids</code> ارسال می‌گردند.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {rolesLoading && (
                <p className="text-sm text-text-muted">در حال دریافت نقش‌ها…</p>
              )}
              {(rolesData?.results ?? []).map((role) => (
                <label
                  key={role.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 transition-colors hover:bg-surface-muted"
                >
                  <input
                    type="checkbox"
                    className="size-4 rounded border-border"
                    disabled={mutation.isPending}
                    checked={selectedRoles.includes(role.id)}
                    onChange={() => {
                      setSelectedRoles((prev) =>
                        prev.includes(role.id)
                          ? prev.filter((id) => id !== role.id)
                          : [...prev, role.id]
                      );
                    }}
                  />
                  <span className="text-sm">{role.name}</span>
                  <span className="mr-auto font-mono text-xs text-text-subtle">
                    {role.codename}
                  </span>
                </label>
              ))}
              {!rolesLoading && !rolesData?.results?.length && (
                <p className="text-sm text-text-muted">
                  نقشی از سرور دریافت نشد.
                </p>
              )}
            </CardContent>
          </Card>

          {mutation.isError && (
            <Alert variant="danger" title="خطا در ایجاد دعوت">
              {getErrorMessage(mutation.error)}
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" asChild disabled={mutation.isPending}>
              <Link href="/admin/users">انصراف</Link>
            </Button>
            <Button
              type="submit"
              loading={mutation.isPending}
              disabled={mutation.isPending}
            >
              ایجاد لینک دعوت
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
