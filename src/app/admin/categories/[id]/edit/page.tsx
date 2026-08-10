"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategoryById, updateCategory } from "@/lib/data/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";

const schema = z.object({
  name: z.string().min(2, "نام الزامی است"),
  slug: z.string().optional(),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const categoryId = Number(params.id);
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const [error, setError] = useState<string | null>(null);

  const { data: category, isLoading } = useQuery({
    queryKey: ["category", categoryId],
    queryFn: () => getCategoryById(categoryId),
    enabled: Number.isFinite(categoryId),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        slug: category.slug ?? "",
        description: category.description ?? "",
        is_active: category.is_active ?? true,
      });
    }
  }, [category, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormValues) => updateCategory(categoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["category", categoryId] });
      router.push(`/admin/categories/${categoryId}`);
    },
    onError: () => setError("خطا در به‌روزرسانی."),
  });

  if (!hasPermission(PERMISSIONS.CATEGORIES_UPDATE)) {
    return (
      <Alert variant="danger" title="دسترسی غیرمجاز">
        شما مجوز ویرایش ندارید.
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!category) {
    return (
      <Alert variant="danger" title="یافت نشد">
        دسته‌بندی وجود ندارد.
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">ویرایش دسته‌بندی</h1>
        <p className="mt-1 text-sm text-text-muted">{category.name}</p>
      </div>

      {error && (
        <Alert variant="danger" title="خطا">
          {error}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>اطلاعات</CardTitle>
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
              />
            </div>
            <div>
              <Label htmlFor="slug">نامک</Label>
              <Input
                id="slug"
                {...register("slug")}
                dir="ltr"
                className="font-mono"
              />
            </div>
            <div>
              <Label htmlFor="description">توضیحات</Label>
              <Textarea id="description" {...register("description")} />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="size-4 rounded border-border"
                {...register("is_active")}
              />
              <span className="text-sm">فعال</span>
            </label>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  router.push(`/admin/categories/${categoryId}`)
                }
              >
                انصراف
              </Button>
              <Button type="submit" loading={mutation.isPending}>
                ذخیره
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
