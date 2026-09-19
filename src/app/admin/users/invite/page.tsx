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
  Eye,
  EyeOff,
  Mail,
  Link2,
} from "lucide-react";
import { getRoles } from "@/lib/data/users";
import { invitesApi } from "@/lib/api/invites";
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
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";
import { getErrorMessage } from "@/lib/api/errors";
import { ApiError } from "@/lib/api/client";
import type { InviteLinkCreateResponse } from "@/types/api";
import { resolveInviteUrl } from "@/lib/invite-url";

const EXPIRY_OPTIONS = [
  { value: 1, label: "۱ ساعت" },
  { value: 6, label: "۶ ساعت" },
  { value: 12, label: "۱۲ ساعت" },
  { value: 24, label: "۲۴ ساعت" },
  { value: 48, label: "۴۸ ساعت (پیشنهادی)" },
  { value: 72, label: "۷۲ ساعت" },
  { value: 168, label: "۷ روز" },
];

const schema = z
  .object({
    username: z
      .string()
      .min(3, "حداقل ۳ کاراکتر")
      .regex(/^[a-zA-Z0-9._-]+$/, "فقط حروف انگلیسی، عدد، . _ -"),
    password: z
      .string()
      .min(10, "حداقل ۱۰ کاراکتر (طبق Backend)")
      .max(128, "حداکثر ۱۲۸ کاراکتر"),
    password_confirm: z.string().min(1, "تأیید رمز عبور الزامی است"),
    email: z.string().email("ایمیل نامعتبر").optional().or(z.literal("")),
    expires_in_hours: z.coerce.number().min(1).max(336),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "رمز عبور و تأیید آن یکسان نیستند",
    path: ["password_confirm"],
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

  const roles = useMemo(() => {
    const d = rolesData as { results?: { id: number; name: string; codename: string }[] } | { id: number; name: string; codename: string }[] | undefined;
    if (!d) return [];
    if (Array.isArray(d)) return d;
    return d.results ?? [];
  }, [rolesData]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      password: "",
      password_confirm: "",
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
    },
  });

  if (!canManage) {
    return (
      <Alert variant="danger" title="دسترسی غیرمجاز">
        شما مجوز مدیریت کاربران را ندارید.
      </Alert>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    await mutation.mutateAsync({
      username: values.username.trim(),
      password: values.password,
      password_confirm: values.password_confirm,
      email: values.email?.trim() || undefined,
      role_ids: selectedRoles.length ? selectedRoles : undefined,
      expires_in_hours: values.expires_in_hours,
    });
  });

  const displayInviteUrl = result
    ? resolveInviteUrl({ invite_url: result.invite_url, token: result.token })
    : "";

  const copyLink = async () => {
    if (!displayInviteUrl) return;
    try {
      await navigator.clipboard.writeText(displayInviteUrl);
      setCopied(true);
      toast.success("لینک کپی شد");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("کپی ناموفق بود");
    }
  };

  const resetAll = () => {
    setResult(null);
    setSelectedRoles([]);
    reset({
      username: "",
      password: "",
      password_confirm: "",
      email: "",
      expires_in_hours: 48,
    });
  };

  if (result) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Card className="border-emerald-200 bg-emerald-50/40 dark:border-emerald-900 dark:bg-emerald-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <Check className="size-5" />
              لینک دعوت آماده است
            </CardTitle>
            <CardDescription>
              این لینک را برای کاربر بفرستید. پس از باز کردن، دعوت مصرف می‌شود.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input readOnly value={displayInviteUrl} dir="ltr" className="font-mono text-xs" />
              <Button type="button" variant="secondary" onClick={copyLink} className="shrink-0">
                {copied ? (<><Check className="size-4" />کپی شد</>) : (<><Copy className="size-4" />کپی لینک</>)}
              </Button>
            </div>
            {result.expires_at && (
              <p className="text-meta">
                انقضا: {new Date(result.expires_at).toLocaleString("fa-IR")}
              </p>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={resetAll}>دعوت دیگر</Button>
              <Button variant="outline" size="sm" asChild>
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
          className="mb-2 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text"
        >
          <ArrowRight className="size-4" />
          بازگشت به لیست
        </Link>
        <h1 className="text-xl font-semibold text-text">دعوت کاربر</h1>
        <p className="mt-1 text-sm text-text-muted">
          ساخت لینک ورود یک‌بارمصرف همراه با رمز موقت
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="size-4" />
              اطلاعات دعوت
            </CardTitle>
            <CardDescription>نام کاربری و رمز موقت برای ورود اولیه</CardDescription>
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
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="password_confirm">تأیید رمز عبور</Label>
              <Input
                id="password_confirm"
                type={showPassword ? "text" : "password"}
                dir="ltr"
                className="mt-1.5"
                autoComplete="new-password"
                disabled={mutation.isPending}
                {...register("password_confirm")}
                error={errors.password_confirm?.message}
              />
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
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  >
                    {EXPIRY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </Select>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>نقش‌ها</CardTitle>
            <CardDescription>اختیاری — بعداً هم قابل تغییر است</CardDescription>
          </CardHeader>
          <CardContent>
            {rolesLoading ? (
              <p className="text-sm text-text-muted">در حال بارگذاری...</p>
            ) : roles.length === 0 ? (
              <p className="text-sm text-text-muted">نقشی یافت نشد.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {roles.map((role) => {
                  const checked = selectedRoles.includes(role.id);
                  return (
                    <li key={role.id}>
                      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-surface-muted">
                        <input
                          type="checkbox"
                          className="size-4 rounded border-border"
                          checked={checked}
                          disabled={mutation.isPending}
                          onChange={() => {
                            setSelectedRoles((prev) =>
                              checked
                                ? prev.filter((id) => id !== role.id)
                                : [...prev, role.id]
                            );
                          }}
                        />
                        <span>{role.name}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" asChild disabled={mutation.isPending}>
            <Link href="/admin/users">انصراف</Link>
          </Button>
          <Button type="submit" loading={mutation.isPending} disabled={mutation.isPending}>
            ایجاد لینک دعوت
          </Button>
        </div>
      </form>
    </div>
  );
}
