"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowRight,
  Copy,
  Check,
  UserPlus,
  Link2,
  Eye,
  EyeOff,
  ExternalLink,
  Shield,
  Clock,
  Mail,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";
import type { InviteLinkCreateResponse } from "@/types/api";
import { resolveInviteUrl } from "@/lib/invite-url";
import { cn } from "@/lib/utils";

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
  const [showPassword, setShowPassword] = useState(false);
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
          if (text) setError(field, { type: "server", message: text });
        }
      }
    },
  });

  const displayInviteUrl = useMemo(() => {
    if (!result) return "";
    return resolveInviteUrl({
      invite_url: result.invite_url,
      token: result.token,
      origin:
        typeof window !== "undefined" ? window.location.origin : undefined,
    });
  }, [result]);

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
    if (!displayInviteUrl) return;
    try {
      await navigator.clipboard.writeText(displayInviteUrl);
      setCopied(true);
      toast.success("آدرس کامل لینک کپی شد");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("کپی ناموفق بود — لینک را دستی انتخاب کنید");
    }
  };

  const resetForm = () => {
    setResult(null);
    setCopied(false);
    reset({
      username: "",
      password: "",
      email: "",
      expires_in_hours: 48,
    });
    setSelectedRoles([]);
  };

  if (result) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <Link
            href="/admin/users"
            className="mb-2 inline-flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-text"
          >
            <ArrowRight className="size-4" />
            بازگشت به کاربران
          </Link>
          <h1 className="text-page-title">لینک دعوت آماده است</h1>
          <p className="mt-1 text-caption">
            آدرس کامل را کپی کنید و برای کاربر بفرستید
          </p>
        </div>

        <Card className="overflow-hidden border-emerald-200/80 shadow-sm dark:border-emerald-900">
          <div className="bg-gradient-to-l from-emerald-600/90 to-emerald-800 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-white/15">
                <Check className="size-5" />
              </div>
              <div>
                <p className="font-semibold">دعوت با موفقیت ساخته شد</p>
                <p className="text-sm text-emerald-50/90">
                  لینک یک‌بارمصرف است و پس از استفاده منقضی می‌شود
                </p>
              </div>
            </div>
          </div>

          <CardContent className="space-y-5 p-5">
            {result.user && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-text-muted">کاربر:</span>
                <Badge variant="secondary" className="font-mono" dir="ltr">
                  {result.user.username}
                </Badge>
              </div>
            )}

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-text">
                <Link2 className="size-3.5 text-primary" />
                آدرس کامل لینک دعوت
              </Label>
              <div className="rounded-xl border border-border bg-surface-muted/40 p-3">
                <p
                  className="break-all font-mono text-sm leading-relaxed text-text select-all"
                  dir="ltr"
                >
                  {displayInviteUrl || "در حال آماده‌سازی لینک…"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={copyLink} className="gap-2">
                  {copied ? (
                    <>
                      <Check className="size-4" />
                      کپی شد
                    </>
                  ) : (
                    <>
                      <Copy className="size-4" />
                      کپی آدرس کامل
                    </>
                  )}
                </Button>
                {displayInviteUrl && (
                  <Button variant="outline" asChild>
                    <a
                      href={displayInviteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-2"
                    >
                      <ExternalLink className="size-4" />
                      باز کردن لینک
                    </a>
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {result.expires_at && (
                <div className="flex items-start gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm">
                  <Clock className="mt-0.5 size-4 shrink-0 text-text-subtle" />
                  <div>
                    <p className="text-text-muted">انقضا</p>
                    <p className="font-medium text-text">
                      {new Date(result.expires_at).toLocaleString("fa-IR")}
                    </p>
                  </div>
                </div>
              )}
              {result.token && (
                <div className="flex items-start gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm">
                  <Shield className="mt-0.5 size-4 shrink-0 text-text-subtle" />
                  <div className="min-w-0">
                    <p className="text-text-muted">توکن</p>
                    <p
                      className="truncate font-mono text-xs text-text"
                      dir="ltr"
                      title={result.token}
                    >
                      {result.token}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {result.warning && (
              <Alert variant="warning" title="هشدار سرور">
                {result.warning}
              </Alert>
            )}

            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              <Button variant="outline" onClick={resetForm}>
                دعوت کاربر دیگر
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/admin/users">لیست کاربران</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/admin/users"
          className="mb-2 inline-flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-text"
        >
          <ArrowRight className="size-4" />
          بازگشت به کاربران
        </Link>
        <h1 className="text-page-title flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UserPlus className="size-5" />
          </span>
          دعوت کاربر
        </h1>
        <p className="mt-1.5 text-caption">
          ساخت لینک یک‌بارمصرف برای ورود کاربر جدید
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { n: "۱", t: "اطلاعات حساب" },
          { n: "۲", t: "نقش‌ها" },
          { n: "۳", t: "لینک دعوت" },
        ].map((s) => (
          <div
            key={s.n}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {s.n}
            </span>
            <span className="truncate text-xs text-text-muted sm:text-sm">{s.t}</span>
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">اطلاعات حساب</CardTitle>
            <CardDescription>
              نام کاربری یکتا؛ رمز حداقل ۱۰ کاراکتر
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="username">نام کاربری</Label>
              <Input
                id="username"
                dir="ltr"
                autoComplete="off"
                placeholder="curator_01"
                className="mt-1.5"
                disabled={mutation.isPending}
                {...register("username")}
                error={errors.username?.message}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="password">رمز موقت</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  dir="ltr"
                  autoComplete="new-password"
                  placeholder="Medal!Archive2026"
                  className="pe-10"
                  disabled={mutation.isPending}
                  {...register("password")}
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-text-subtle hover:bg-surface-muted hover:text-text"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "مخفی کردن رمز" : "نمایش رمز"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-text-muted">
                مثال: <code className="rounded bg-surface-muted px-1" dir="ltr">Medal!Archive2026</code>
              </p>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="email" className="flex items-center gap-1.5">
                <Mail className="size-3.5 text-text-subtle" />
                ایمیل (اختیاری)
              </Label>
              <Input
                id="email"
                type="email"
                dir="ltr"
                placeholder="user@example.com"
                className="mt-1.5"
                disabled={mutation.isPending}
                {...register("email")}
                error={errors.email?.message}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="expires" className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-text-subtle" />
                اعتبار لینک
              </Label>
              <Controller
                name="expires_in_hours"
                control={control}
                render={({ field }) => (
                  <Select
                    id="expires"
                    className="mt-1.5"
                    disabled={mutation.isPending}
                    value={String(field.value)}
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="size-4 text-primary" />
              نقش‌های اولیه
            </CardTitle>
            <CardDescription>اختیاری — از API واقعی</CardDescription>
          </CardHeader>
          <CardContent>
            {rolesLoading && (
              <p className="text-sm text-text-muted">در حال دریافت نقش‌ها…</p>
            )}
            <div className="grid gap-2 sm:grid-cols-2">
              {(rolesData?.results ?? []).map((role) => {
                const checked = selectedRoles.includes(role.id);
                return (
                  <label
                    key={role.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-colors",
                      checked
                        ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                        : "border-border hover:bg-surface-muted"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="size-4 rounded border-border"
                      disabled={mutation.isPending}
                      checked={checked}
                      onChange={() => {
                        setSelectedRoles((prev) =>
                          prev.includes(role.id)
                            ? prev.filter((id) => id !== role.id)
                            : [...prev, role.id]
                        );
                      }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-text">{role.name}</span>
                      <span className="block truncate font-mono text-[11px] text-text-subtle" dir="ltr">
                        {role.codename}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {mutation.isError && (
          <Alert variant="danger" title="خطا در ایجاد دعوت">
            {getErrorMessage(mutation.error)}
          </Alert>
        )}

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" asChild disabled={mutation.isPending}>
            <Link href="/admin/users">انصراف</Link>
          </Button>
          <Button
            type="submit"
            loading={mutation.isPending}
            disabled={mutation.isPending}
            className="min-w-[140px] gap-2"
          >
            <Link2 className="size-4" />
            ایجاد لینک دعوت
          </Button>
        </div>
      </form>
    </div>
  );
}
