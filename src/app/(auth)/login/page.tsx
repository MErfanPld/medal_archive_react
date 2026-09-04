"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  login,
  useAuthStore,
  isDevMockAuthEnabled,
  getDevMockAccounts,
} from "@/stores/auth-store";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const schema = z.object({
  username: z.string().min(1, "نام کاربری الزامی است"),
  password: z.string().min(1, "رمز عبور الزامی است"),
});

type FormValues = z.infer<typeof schema>;

function setAuthCookie() {
  document.cookie = `medal_auth=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/admin/dashboard";
  const { isAuthenticated, isHydrated } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);
  const mockAccounts = getDevMockAccounts();

  useEffect(() => {
    if (isHydrated && isAuthenticated()) {
      router.replace(nextPath.startsWith("/") ? nextPath : "/admin/dashboard");
    }
  }, [isHydrated, isAuthenticated, nextPath, router]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await login(values.username, values.password);
      setAuthCookie();
      router.replace(nextPath.startsWith("/") ? nextPath : "/admin/dashboard");
    } catch (err) {
      if (err instanceof Error && err.message === "INACTIVE_USER") {
        setServerError("این حساب غیرفعال است.");
        return;
      }
      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 400) {
          setServerError("نام کاربری یا رمز عبور نادرست است.");
        } else {
          setServerError(err.message || "خطا در ورود. دوباره تلاش کنید.");
        }
      } else {
        if (isDevMockAuthEnabled) {
          setServerError("خطا در ورود آزمایشی. نام کاربری را از لیست زیر انتخاب کنید.");
        } else {
          setServerError("خطای غیرمنتظره. دوباره تلاش کنید.");
        }
      }
    }
  };

  const fillMock = (username: string) => {
    setValue("username", username);
    setValue("password", "dev");
  };

  if (!isHydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <span
          className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
          aria-hidden
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
        noValidate
      >
        <div>
          <label
            htmlFor="username"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            نام کاربری
          </label>
          <Input
            id="username"
            autoComplete="username"
            autoFocus
            error={errors.username?.message}
            {...register("username")}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            رمز عبور
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
        </div>

        {serverError && (
          <div
            className="rounded-lg border border-danger/30 bg-danger-bg px-3 py-2 text-sm text-danger"
            role="alert"
          >
            {serverError}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          ورود
        </Button>
      </form>

      {isDevMockAuthEnabled && mockAccounts.length > 0 && (
        <div className="mt-6 rounded-lg border border-dashed border-border bg-surface-muted/50 p-4">
          <p className="mb-2 text-xs font-medium text-text-muted">
            حالت توسعه — ورود آزمایشی (بدون بک‌اند)
          </p>
          <p className="mb-3 text-xs text-text-subtle">
            هر رمزی قبول است. برای تست RBAC یکی از حساب‌ها را انتخاب کنید:
          </p>
          <ul className="space-y-1.5">
            {mockAccounts.map((a) => (
              <li key={a.username}>
                <button
                  type="button"
                  onClick={() => fillMock(a.username)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-right text-xs transition-colors hover:bg-surface"
                >
                  <span className="font-mono text-primary-deep">{a.username}</span>
                  <span className="text-text-muted">{a.role}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-semibold tracking-tight text-primary-deep">
              پنل مدیریت آثار ناصر صلب
            </h1>
          </Link>
          <p className="mt-2 text-sm text-text-muted">
            ورود به پنل مدیریت آثار ناصر صلب
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex min-h-[40vh] items-center justify-center">
              <span
                className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
                aria-hidden
              />
            </div>
          }
        >
          <LoginForm />
        </Suspense>

        <p className="mt-6 text-center text-xs text-text-subtle">
          {isDevMockAuthEnabled
            ? "حالت توسعه فعال است — ورود آزمایشی بدون API"
            : "دسترسی فقط با دعوت‌نامه. ثبت‌نام عمومی وجود ندارد."}
        </p>
      </div>
    </main>
  );
}
