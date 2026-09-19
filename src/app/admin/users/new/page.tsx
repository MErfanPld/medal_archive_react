"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  UserPlus,
  Link2,
  Copy,
  Check,
  KeyRound,
  Eye,
  EyeOff,
  PartyPopper,
  ShieldCheck,
} from "lucide-react";
import { createUser, getAllRoles } from "@/lib/data/users";
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
  const [showPassword, setShowPassword] = useState(false);

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

  const copyText = async (text: string) => {
    if (!text) {
      toast.error("لینکی برای کپی وجود ندارد");
      return false;
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        if (!ok) throw new Error("execCommand failed");
      }
      setCopied(true);
      toast.success("لینک کپی شد");
      setTimeout(() => setCopied(false), 2500);
      return true;
    } catch {
      toast.error("کپی انجام نشد. لینک را دستی انتخاب و کپی کنید.");
      return false;
    }
  };

  const resetAll = () => {
    setInviteResult(null);
    setCreatedUser(null);
    setFormError(null);
    setSelectedRoles([]);
    setCopied(false);
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
    const linkText =
      displayInviteUrl ||
      (inviteResult.token
        ? `${typeof window !== "undefined" ? window.location.origin : ""}/invite/${inviteResult.token}`
        : "");

    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="bg-primary px-6 py-8 text-center text-white">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-white/15 ring-4 ring-white/20">
              <ShieldCheck className="size-8" />
            </div>
            <h2 className="text-xl font-bold">لینک دعوت آماده شد</h2>
            <p className="mt-2 text-sm text-white/85">
              این لینک را برای کاربر بفرستید. با باز کردن آن وارد سامانه می‌شود.
            </p>
          </div>

          <div className="space-y-5 p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              {inviteResult.user?.username && (
                <div className="rounded-xl border border-border bg-surface-muted/50 px-4 py-3">
                  <p className="text-xs text-text-muted">نام کاربری</p>
                  <p className="mt-0.5 font-mono text-base font-semibold text-text" dir="ltr">
                    {inviteResult.user.username}
                  </p>
                </div>
              )}
              {inviteResult.expires_at && (
                <div className="rounded-xl border border-border bg-surface-muted/50 px-4 py-3">
                  <p className="text-xs text-text-muted">انقضای لینک</p>
                  <p className="mt-0.5 text-base font-semibold text-text">
                    {new Date(inviteResult.expires_at).toLocaleString("fa-IR")}
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-text">لینک دعوت یک‌بارمصرف</p>
                {copied && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                    <Check className="size-3.5" />
                    کپی شد
                  </span>
                )}
              </div>
              <div
                className="mb-3 cursor-pointer break-all rounded-lg border border-border bg-surface px-3 py-2.5 font-mono text-xs leading-relaxed text-text"
                dir="ltr"
                onClick={(e) => {
                  const range = document.createRange();
                  range.selectNodeContents(e.currentTarget);
                  const sel = window.getSelection();
                  sel?.removeAllRanges();
                  sel?.addRange(range);
                }}
                title="برای انتخاب کلیک کنید"
              >
                {linkText || "لینک در دسترس نیست"}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => copyText(linkText)}
                  disabled={!linkText}
                  className="gap-2"
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
                {linkText && (
                  <Button type="button" variant="outline" asChild>
                    <a href={linkText} target="_blank" rel="noreferrer">
                      باز کردن لینک
                    </a>
                  </Button>
                )}
              </div>
              <p className="mt-3 text-xs text-text-muted">
                اگر دکمه کپی کار نکرد، روی لینک کلیک کنید و با Ctrl+C / ⌘+C کپی کنید.
              </p>
            </div>

            {inviteResult.warning && (
              <Alert variant="warning" title="هشدار سرور">
                {inviteResult.warning}
              </Alert>
            )}

            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              <Button variant="outline" size="sm" onClick={resetAll}>
                کاربر دیگر
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/users">لیست کاربران</Link>
              </Button>
              {inviteResult.user?.id && (
                <Button size="sm" asChild>
                  <Link href={`/admin/users/${inviteResult.user.id}`}>
                    مشاهده کاربر
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (createdUser) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="bg-primary px-6 py-8 text-center text-white">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-white/15 ring-4 ring-white/20">
              <PartyPopper className="size-8" />
            </div>
            <h2 className="text-xl font-bold">کاربر با موفقیت ساخته شد</h2>
            <p className="mt-2 text-sm text-white/85">
              حساب فعال است و می‌تواند همین حالا وارد پنل شود.
            </p>
          </div>
          <div className="space-y-4 p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-surface-muted/50 px-4 py-3">
                <p className="text-xs text-text-muted">نام کاربری</p>
                <p className="mt-0.5 font-mono text-base font-semibold text-text" dir="ltr">
                  {createdUser.username}
                </p>
              </div>
              {createdUser.email && (
                <div className="rounded-xl border border-border bg-surface-muted/50 px-4 py-3">
                  <p className="text-xs text-text-muted">ایمیل</p>
                  <p className="mt-0.5 text-base font-medium text-text" dir="ltr">
                    {createdUser.email}
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              <Button size="sm" asChild>
                <Link href={`/admin/users/${createdUser.id}`}>مدیریت نقش‌ها</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={resetAll}>
                کاربر دیگر
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/users">لیست کاربران</Link>
              </Button>
            </div>
          </div>
        </div>
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
          بازگشت به کاربران
        </Link>
        <h1 className="text-page-title flex items-center gap-2">
          <UserPlus className="size-5 text-primary" />
          افزودن کاربر
        </h1>
        <p className="mt-1 text-caption">
          ساخت حساب مستقیم یا ارسال لینک دعوت یک‌بارمصرف
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode("invite")}
          className={cn(
            "flex items-start gap-3 rounded-xl border p-4 text-right transition-all",
            mode === "invite"
              ? "border-primary bg-primary text-white shadow-sm"
              : "border-border bg-surface text-text hover:bg-surface-muted"
          )}
        >
          <Link2 className={cn("mt-0.5 size-5 shrink-0", mode === "invite" ? "text-white" : "text-primary")} />
          <div>
            <p className={cn("text-sm font-semibold", mode === "invite" ? "text-white" : "text-text")}>
              لینک دعوت ورود
            </p>
            <p className={cn("mt-0.5 text-xs", mode === "invite" ? "text-white/80" : "text-text-muted")}>
              لینک یک‌بارمصرف برای ورود کاربر
            </p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setMode("account")}
          className={cn(
            "flex items-start gap-3 rounded-xl border p-4 text-right transition-all",
            mode === "account"
              ? "border-primary bg-primary text-white shadow-sm"
              : "border-border bg-surface text-text hover:bg-surface-muted"
          )}
        >
          <KeyRound className={cn("mt-0.5 size-5 shrink-0", mode === "account" ? "text-white" : "text-primary")} />
          <div>
            <p className={cn("text-sm font-semibold", mode === "account" ? "text-white" : "text-text")}>
              حساب با رمز عبور
            </p>
            <p className={cn("mt-0.5 text-xs", mode === "account" ? "text-white/80" : "text-text-muted")}>
              ساخت حساب و ورود مستقیم
            </p>
          </div>
        </button>
      </div>

      {formError && (
        <Alert variant="danger" title="خطا">{formError}</Alert>
      )}

      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        <Card>
          <CardHeader>
            <CardTitle>اطلاعات حساب</CardTitle>
            <CardDescription>
              {mode === "invite"
                ? "کاربر با مصرف لینک فعال می‌شود."
                : "کاربر بلافاصله با همین رمز وارد می‌شود."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="username">نام کاربری</Label>
              <Input id="username" dir="ltr" className="mt-1.5" disabled={pending} {...register("username")} error={errors.username?.message} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="password">{mode === "invite" ? "رمز موقت" : "رمز عبور"}</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  dir="ltr"
                  className="pe-10"
                  disabled={pending}
                  {...register("password")}
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-text-subtle hover:bg-surface-muted"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="password_confirm">تأیید رمز عبور</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password_confirm"
                  type={showPassword ? "text" : "password"}
                  dir="ltr"
                  className="pe-10"
                  disabled={pending}
                  {...register("password_confirm")}
                  error={errors.password_confirm?.message}
                />
                <button
                  type="button"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-text-subtle hover:bg-surface-muted"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="email">ایمیل (اختیاری)</Label>
              <Input id="email" type="email" dir="ltr" className="mt-1.5" disabled={pending} {...register("email")} error={errors.email?.message} />
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
              </>
            )}
            {mode === "invite" && (
              <div className="sm:col-span-2">
                <Label htmlFor="expires">اعتبار لینک دعوت</Label>
                <Controller
                  name="expires_in_hours"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="expires"
                      className="mt-1.5"
                      disabled={pending}
                      value={String(field.value)}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      options={EXPIRY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                    />
                  )}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>نقش‌های اولیه</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {rolesLoading && <p className="text-sm text-text-muted">در حال دریافت نقش‌ها…</p>}
            {allRoles.map((role) => (
              <label key={role.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 hover:bg-surface-muted">
                <input
                  type="checkbox"
                  className="size-4 rounded border-border"
                  disabled={pending}
                  checked={selectedRoles.includes(role.id)}
                  onChange={() => {
                    setSelectedRoles((prev) =>
                      prev.includes(role.id) ? prev.filter((id) => id !== role.id) : [...prev, role.id]
                    );
                  }}
                />
                <span className="text-sm">{role.name}</span>
              </label>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" asChild disabled={pending}>
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
