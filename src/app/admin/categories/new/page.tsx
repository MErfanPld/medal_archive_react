"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategory } from "@/lib/data/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";

const schema = z.object({
  name: z.string().min(2, "نام دسته‌بندی الزامی است"),
  slug: z.string().optional(),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function NewCategoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", slug: "", description: "", is_active: true },
  });

  const mutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (cat) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      router.push(`/admin/categories/${cat.id}`);
    },
    onError: () => setError("خطا در ایجاد دسته‌بندی."),
  });

  if (!hasPermission(PERMISSIONS.CATEGORIES_CREATE)) {
    return (
      <Alert variant="danger" title="دسترسی غیرمجاز">
        شما مجوز ایجاد دسته‌بندی ندارید.
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">دسته‌بندی جدید</h1>
        <p className="mt-1 text-sm text-text-muted">
          یک دسته‌بندی برای سازمان‌دهی مدال‌ها ایجاد کنید.
        </p>
      </div>

      {error && (
        <Alert variant="danger" title="خطا">
          {error}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>اطلاعات دسته‌بندی</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(async (values) => {
              setError(null);
              await mutation.mutateAsync(values);
            })}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="name" required>
                نام
              </Label>
              <Input
                id="name"
                error={errors.name?.message}
                {...register("name")}
                placeholder="نظامی"
              />
            </div>
            <div>
              <Label htmlFor="slug">نامک (slug)</Label>
              <Input
                id="slug"
                {...register("slug")}
                placeholder="military"
                dir="ltr"
                className="font-mono"
              />
            </div>
            <div>
              <Label htmlFor="description">توضیحات</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="توضیح کوتاه درباره این دسته"
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="size-4 rounded border-border"
                {...register("is_active")}
                defaultChecked
              />
              <span className="text-sm">فعال</span>
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/categories")}
              >
                انصراف
              </Button>
              <Button type="submit" loading={mutation.isPending}>
                ایجاد
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
