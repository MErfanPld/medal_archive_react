"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowRight, Copy, Check, UserPlus } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { getRoles } from "@/lib/data/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";
import type { InviteLinkCreateResponse } from "@/types/api";

const schema = z.object({
  username: z
    .string()
    .min(3, "حداقل ۳ کاراکتر")
    .regex(/^[a-zA-Z0-9._-]+$/, "فقط حروف انگلیسی، عدد، . _ -"),
  password: z.string().min(8, "حداقل ۸ کاراکتر"),
  email: z.string().email("ایمیل نامعتبر").optional().or(z.literal("")),
  expires_in_hours: z.coerce.number().min(1).max(168).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function InviteUserPage() {
  const toast = useToast();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canManage = hasPermission(PERMISSIONS.USERS_MANAGE);
  const [result, setResult] = useState<InviteLinkCreateResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

  const { data: rolesData } = useQuery({
    queryKey: ["roles"],
    queryFn: () => getRoles(1),
    enabled: canManage,
  });

  const {
    register,
    handleSubmit,
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
    mutationFn: authApi.createInvite,
    onSuccess: (data) => {
      setResult(data);
      toast.success("لینک دعوت ساخته شد");
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError ? err.message : "خطا در ساخت لینک دعوت"
      );
    },
  });

  if (!canManage) {
    return (
      <Alert variant="danger" title="دسترسی غیرمجاز">
        شما مجوز دعوت کاربر را ندارید.
      </Alert>
    );
  }

  const onSubmit = handleSubmit((values) => {
    setResult(null);
    mutation.mutate({
      username: values.username,
      password: values.password,
      email: values.email || undefined,
      role_ids: selectedRoles.length ? selectedRoles : undefined,
      expires_in_hours: values.expires_in_hours,
    });
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
          ساخت لینک دعوت یک‌بارمصرف از طریق API واقعی
        </p>
      </div>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>لینک دعوت آماده است</CardTitle>
            <CardDescription>
              این لینک از سمت سرور ساخته شده است. آن را برای کاربر بفرستید.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.user && (
              <p className="text-sm text-text-muted">
                کاربر:{" "}
                <span className="font-medium text-text" dir="ltr">
                  {result.user.username}
                </span>
              </p>
            )}
            <div className="flex gap-2">
              <Input
                readOnly
                value={result.invite_url}
                dir="ltr"
                className="font-mono text-xs"
              />
              <Button type="button" variant="secondary" onClick={copyLink}>
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                کپی
              </Button>
            </div>
            {result.expires_at && (
              <p className="text-meta">
                انقضا: {new Date(result.expires_at).toLocaleString("fa-IR")}
              </p>
            )}
            {result.warning && (
              <Alert variant="warning" title="هشدار">
                {result.warning}
              </Alert>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setResult(null);
                reset();
                setSelectedRoles([]);
              }}
            >
              دعوت جدید
            </Button>
          </CardContent>
        </Card>
      )}

      {!result && (
        <form onSubmit={onSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>اطلاعات حساب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="username">نام کاربری</Label>
                <Input id="username" dir="ltr" className="mt-1.5" {...register("username")} error={errors.username?.message} />
              </div>
              <div>
                <Label htmlFor="password">رمز موقت</Label>
                <Input id="password" type="password" dir="ltr" className="mt-1.5" {...register("password")} error={errors.password?.message} />
              </div>
              <div>
                <Label htmlFor="email">ایمیل (اختیاری)</Label>
                <Input id="email" type="email" dir="ltr" className="mt-1.5" {...register("email")} error={errors.email?.message} />
              </div>
              <div>
                <Label htmlFor="expires">اعتبار لینک (ساعت)</Label>
                <Input id="expires" type="number" min={1} max={168} className="mt-1.5" {...register("expires_in_hours")} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>نقش‌های اولیه</CardTitle>
              <CardDescription>
                نقش‌های انتخابی هنگام مصرف لینک به کاربر اختصاص داده می‌شوند.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {(rolesData?.results ?? []).map((role) => (
                <label
                  key={role.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 hover:bg-surface-muted"
                >
                  <input
                    type="checkbox"
                    className="size-4 rounded border-border"
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
                  <span className="mr-auto font-mono text-xs text-text-subtle">{role.codename}</span>
                </label>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/users">انصراف</Link>
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              ساخت لینک دعوت
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
