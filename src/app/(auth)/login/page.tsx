"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "@/stores/auth-store";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const schema = z.object({
  username: z.string().min(1, "نام کاربری الزامی است"),
  password: z.string().min(1, "رمز عبور الزامی است"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await login(values.username, values.password);
      router.replace("/admin/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 400) {
          setServerError("نام کاربری یا رمز عبور نادرست است.");
        } else {
          setServerError(err.message || "خطا در ورود. دوباره تلاش کنید.");
        }
      } else {
        setServerError("خطای غیرمنتظره. دوباره تلاش کنید.");
      }
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-semibold tracking-tight text-primary-deep">
              Medal Archive Pro
            </h1>
          </Link>
          <p className="mt-2 text-sm text-text-muted">
            ورود به پنل مدیریت و آرشیو
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
        </div>

        <p className="mt-6 text-center text-xs text-text-subtle">
          دسترسی فقط با دعوت‌نامه. ثبت‌نام عمومی وجود ندارد.
        </p>
      </div>
    </main>
  );
}
