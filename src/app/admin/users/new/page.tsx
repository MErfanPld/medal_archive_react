"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, UserPlus, Link2, Copy, Check, KeyRound } from "lucide-react";
import { createUser, getAllRoles } from "@/lib/data/users";
import { invitesApi } from "@/lib/api/invites";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";
import { getErrorMessage } from "@/lib/api/errors";
import type { InviteLinkCreateResponse, User } from "@/types/api";
import { cn } from "@/lib/utils";
import { resolveInviteUrl } from "@/lib/invite-url";

type Mode = "account" | "invite";

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
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    is_active: z.boolean().optional(),
    expires_in_hours: z.coerce.number().min(1).max(336),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "رمز عبور و تأیید آن یکسان نیستند",
    path: ["password_confirm"],
  });

type FormValues = z.infer<typeof schema>;

export default function NewUserPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canManage = hasPermission(PERMISSIONS.USERS_MANAGE);

  const [mode, setMode] = useState<Mode>("invite");
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [inviteResult, setInviteResult] =
    useState<InviteLinkCreateResponse | null>(null);
  const [createdUser, setCreatedUser] = useState<User | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: allRoles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["roles", "all"],
    queryFn: getAllRoles,
    enabled: canManage,
  });

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
      first_name: "",
      last_name: "",
      is_active: true,
      expires_in_hours: 48,
    },
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setCreatedUser(user);
      toast.success("کاربر ایجاد شد");
    },
    onError: (err) => {
      setFormError(getErrorMessage(err, "خطا در ایجاد کاربر"));
    },
  });

  const inviteMutation = useMutation({
    mutationFn: invitesApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setInviteResult(data);
      toast.success("لینک دعوت ساخته شد");
    },
    onError: (err) => {
      setFormError(getErrorMessage(err, "خطا در ساخت لینک دعوت"));
    },
  });

  const pending = createMutation.isPending || inviteMutation.isPending;

  if (!canManage) {
    return (
      <Alert variant="danger" title="دسترسی غیرمجاز">
        شما مجوز مدیریت کاربران را ندارید.
      </Alert>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setInviteResult(null);
    setCreatedUser(null);

    if (mode === "invite") {
      await inviteMutation.mutateAsync({
        username: values.username.trim(),
        password: values.password,
        password_confirm: values.password_confirm,
        email: values.email?.trim() || undefined,
        role_ids: selectedRoles.length ? selectedRoles : undefined,
        expires_in_hours: values.expires_in_hours,
      });
      return;
    }

    await createMutation.mutateAsync({
      username: values.username.trim(),
      password: values.password,
      password_confirm: values.password_confirm,
      email: values.email?.trim() || undefined,
      first_name: values.first_name?.trim() || undefined,
      last_name: values.last_name?.trim() || undefined,
      is_active: values.is_active ?? true,
      role_ids: selectedRoles.length ? selectedRoles : undefined,
    });
  });

  const displayInviteUrl = inviteResult
    ? resolveInviteUrl({
        invite_url: inviteResult.invite_url,
        token: inviteResult.token,
      })
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
    setInviteResult(null);
    setCreatedUser(null);
    setFormError(null);
    setSelectedRoles([]);
    reset({
      username: "",
      password: "",
      password_confirm: "",
      email: "",
      first_name: "",
      last_name: "",
      is_active: true,
      expires_in_hours: 48,
    });
  };

  if (inviteResult) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Card className="border-emerald-200 bg-emerald-50/40 dark:border-emerald-900 dark:bg-emerald-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <Check className="size-5" />
              لینک ورود یک‌بارمصرف آماده است
            </CardTitle>
            <CardDescription>
              این لینک را برای کاربر بفرستید. پس از باز کردن، دعوت مصرف می‌شود و وارد سامانه می‌شود.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {inviteResult.user && (
              <p className="text-sm text-text-muted">
                کاربر:{" "}
                <span className="font-medium text-text" dir="ltr">
                  {inviteResult.user.username}
                </span>
              </p>
            )}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input readOnly value={displayInviteUrl} dir="ltr" className="font-mono text-xs" />
              <Button type="button" variant="secondary" onClick={copyLink} className="shrink-0">
                {copied ? (<><Check className="size-4" />کپی شد</>) : (<><Copy className="size-4" />کپی لینک</>)}
              </Button>
            </div>
            {inviteResult.expires_at && (
              <p className="text-meta">
                انقضا: {new Date(inviteResult.expires_at).toLocaleString("fa-IR")}
              </p>
            )}
            {inviteResult.warning && (
              <Alert variant="warning" title="هشدار سرور">{inviteResult.warning}</Alert>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={resetAll}>کاربر دیگر</Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/users">لیست کاربران</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (createdUser) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Card className="border-emerald-200 bg-emerald-50/40 dark:border-emerald-900 dark:bg-emerald-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <Check className="size-5" />
              کاربر ایجاد شد
            </CardTitle>
            <CardDescription>
              حساب <span dir="ltr">{createdUser.username}</span> با موفقیت ساخته شد.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href={`/admin/users/${createdUser.id}`}>مشاهده کاربر</Link>
            </Button>
            <Button variant="outline" onClick={resetAll}>کاربر دیگر</Button>
            <Button variant="outline" asChild>
              <Link href="/admin/users">لیست کاربران</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/users"
            className="mb-2 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text"
          >
            <ArrowRight className="size-4" />
            بازگشت به لیست
          </Link>
          <h1 className="text-xl font-semibold text-text">افزودن کاربر</h1>
          <p className="mt-1 text-sm text-text-muted">
            ساخت حساب مستقیم یا لینک دعوت یک‌بارمصرف
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-surface p-1">
        <button
          type="button"
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
            mode === "invite"
              ? "bg-primary text-primary-foreground"
              : "text-text-muted hover:bg-surface-muted"
          )}
          onClick={() => setMode("invite")}
        >
          <Link2 className="size-4" />
          لینک دعوت
        </button>
        <button
          type="button"
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
            mode === "account"
              ? "bg-primary text-primary-foreground"
              : "text-text-muted hover:bg-surface-muted"
          )}
          onClick={() => setMode("account")}
        >
          <UserPlus className="size-4" />
          حساب مستقیم
        </button>
      </div>

      {formError && (
        <Alert variant="danger" title="خطا">
          {formError}
        </Alert>
      )}

      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        <Card>
          <CardHeader>
            <CardTitle>اطلاعات حساب</CardTitle>
            <CardDescription>
              {mode === "invite"
                ? "کاربر با مصرف لینک فعال می‌شود."
                : "کاربر بلافاصله با همین رمز می‌تواند وارد شود."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="username">نام کاربری</Label>
              <Input
                id="username"
                dir="ltr"
                className="mt-1.5"
                autoComplete="off"
                disabled={pending}
                {...register("username")}
                error={errors.username?.message}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="password">
                {mode === "invite" ? "رمز موقت" : "رمز عبور"}
              </Label>
              <Input
                id="password"
                type="password"
                dir="ltr"
                className="mt-1.5"
                autoComplete="new-password"
                disabled={pending}
                {...register("password")}
                error={errors.password?.message}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="password_confirm">تأیید رمز عبور</Label>
              <Input
                id="password_confirm"
                type="password"
                dir="ltr"
                className="mt-1.5"
                autoComplete="new-password"
                disabled={pending}
                {...register("password_confirm")}
                error={errors.password_confirm?.message}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="email">ایمیل (اختیاری)</Label>
              <Input
                id="email"
                type="email"
                dir="ltr"
                className="mt-1.5"
                disabled={pending}
                {...register("email")}
                error={errors.email?.message}
              />
            </div>
            {mode === "account" && (
              <>
                <div>
                  <Label htmlFor="first_name">نام</Label>
                  <Input id="first_name" className="mt-1.5" disabled={pending} {...register("first_name")} />
                </div>
                <div>
                  <Label htmlFor="last_name">نام خانوادگی</Label>
                  <Input id="last_name" className="mt-1.5" disabled={pending} {...register("last_name")} />
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    className="size-4 rounded border-border"
                    defaultChecked
                    disabled={pending}
                    {...register("is_active")}
                  />
                  <Label htmlFor="is_active" className="font-normal">حساب فعال باشد</Label>
                </div>
              </>
            )}
            {mode === "invite" && (
              <div className="sm:col-span-2">
                <Label htmlFor="expires_in_hours">اعتبار لینک</Label>
                <Controller
                  name="expires_in_hours"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="expires_in_hours"
                      className="mt-1.5"
                      disabled={pending}
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
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="size-4" />
              نقش‌ها
            </CardTitle>
            <CardDescription>نقش‌های کاربر را انتخاب کنید (اختیاری)</CardDescription>
          </CardHeader>
          <CardContent>
            {rolesLoading ? (
              <p className="text-sm text-text-muted">در حال بارگذاری نقش‌ها...</p>
            ) : allRoles.length === 0 ? (
              <p className="text-sm text-text-muted">نقشی تعریف نشده است.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {allRoles.map((role) => {
                  const checked = selectedRoles.includes(role.id);
                  return (
                    <li key={role.id}>
                      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-surface-muted">
                        <input
                          type="checkbox"
                          className="size-4 rounded border-border"
                          checked={checked}
                          disabled={pending}
                          onChange={() => {
                            setSelectedRoles((prev) =>
                              checked
                                ? prev.filter((id) => id !== role.id)
                                : [...prev, role.id]
                            );
                          }}
                        />
                        <span>{role.name}</span>
                        <span className="text-meta" dir="ltr">{role.codename}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" asChild disabled={pending}>
            <Link href="/admin/users">انصراف</Link>
          </Button>
          <Button type="submit" loading={pending} disabled={pending}>
            {mode === "invite" ? "ایجاد لینک دعوت" : "ایجاد کاربر"}
          </Button>
        </div>
      </form>
    </div>
  );
}
