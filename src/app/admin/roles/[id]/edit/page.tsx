"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRoleById,
  updateRole,
  getPermissions,
} from "@/lib/data/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth-store";
import {
  PERMISSIONS,
  getPermissionGroupLabel,
  getPermissionLabel,
  getPermissionGroupKey,
} from "@/lib/permissions";
import { getErrorMessage } from "@/lib/api/errors";
import { useToast } from "@/components/ui/toast";

const schema = z.object({
  name: z.string().min(2, "نام نقش الزامی است"),
  codename: z
    .string()
    .min(2, "کد نقش الزامی است")
    .regex(/^[a-z0-9_-]+$/, "فقط حروف کوچک انگلیسی، عدد، _ و -"),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function EditRolePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const roleId = Number(params.id);
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const [error, setError] = useState<string | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<number[]>([]);

  const { data: role, isLoading } = useQuery({
    queryKey: ["role", roleId],
    queryFn: () => getRoleById(roleId),
    enabled: Number.isFinite(roleId),
  });

  const { data: permissions = [], isLoading: permsLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: getPermissions,
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
    if (role) {
      reset({
        name: role.name,
        codename: role.codename,
        description: role.description ?? "",
        is_active: role.is_active ?? true,
      });
      setSelectedPerms(role.permissions?.map((p) => p.id) ?? []);
    }
  }, [role, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormValues & { permission_ids: number[] }) =>
      updateRole(roleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["role", roleId] });
      toast.success("نقش به‌روز شد");
      router.push(`/admin/roles/${roleId}`);
    },
    onError: (err) => {
      setError(getErrorMessage(err, "خطا در به‌روزرسانی نقش"));
    },
  });

  const grouped = useMemo(() => {
    return permissions.reduce<Record<string, typeof permissions>>((acc, p) => {
      const group = getPermissionGroupKey(p.codename, p.name);
      if (!acc[group]) acc[group] = [];
      acc[group].push(p);
      return acc;
    }, {});
  }, [permissions]);

  if (!hasPermission(PERMISSIONS.ROLES_MANAGE)) {
    return (
      <Alert variant="danger" title="دسترسی غیرمجاز">
        شما مجوز مدیریت نقش‌ها را ندارید.
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!role) {
    return (
      <Alert variant="danger" title="نقش یافت نشد">
        نقش مورد نظر وجود ندارد.
      </Alert>
    );
  }

  const togglePerm = (id: number) => {
    setSelectedPerms((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleGroup = (ids: number[]) => {
    setSelectedPerms((prev) => {
      const allSelected = ids.every((id) => prev.includes(id));
      if (allSelected) return prev.filter((id) => !ids.includes(id));
      return Array.from(new Set([...prev, ...ids]));
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">ویرایش نقش</h1>
        <p className="mt-1 text-sm text-text-muted">{role.name}</p>
      </div>

      {error && (
        <Alert variant="danger" title="خطا">
          {error}
        </Alert>
      )}

      <form
        onSubmit={handleSubmit(async (values) => {
          setError(null);
          await mutation.mutateAsync({
            name: values.name.trim(),
            codename: values.codename.trim(),
            description: values.description?.trim() || undefined,
            is_active: values.is_active,
            permission_ids: selectedPerms,
          });
        })}
        className="space-y-6"
        noValidate
      >
        <Card>
          <CardHeader>
            <CardTitle>اطلاعات نقش</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name" required>
                نام نمایشی
              </Label>
              <Input
                id="name"
                error={errors.name?.message}
                disabled={mutation.isPending}
                {...register("name")}
              />
            </div>
            <div>
              <Label htmlFor="codename" required>
                کد نقش
              </Label>
              <Input
                id="codename"
                error={errors.codename?.message}
                disabled={mutation.isPending}
                {...register("codename")}
                dir="ltr"
                className="font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="description">توضیحات</Label>
              <Textarea
                id="description"
                disabled={mutation.isPending}
                {...register("description")}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                className="size-4 rounded border-border"
                disabled={mutation.isPending}
                {...register("is_active")}
              />
              <Label htmlFor="is_active" className="mb-0">
                نقش فعال باشد
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>دسترسی‌ها</CardTitle>
            <CardDescription>
              انتخاب‌شده: {selectedPerms.length} از {permissions.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {permsLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              Object.entries(grouped).map(([group, perms]) => {
                const ids = perms.map((p) => p.id);
                const allOn = ids.every((id) => selectedPerms.includes(id));
                return (
                  <div key={group}>
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-text">
                        {getPermissionGroupLabel(group)}
                      </h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleGroup(ids)}
                      >
                        {allOn ? "حذف همه" : "انتخاب همه"}
                      </Button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {perms.map((p) => (
                        <label
                          key={p.id}
                          className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 hover:bg-surface-muted"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPerms.includes(p.id)}
                            disabled={mutation.isPending}
                            onChange={() => togglePerm(p.id)}
                            className="size-4 rounded border-border"
                          />
                          <span className="text-sm text-text">
                            {getPermissionLabel(p.codename, p.name)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={mutation.isPending}
            onClick={() => router.push(`/admin/roles/${roleId}`)}
          >
            انصراف
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            ذخیره تغییرات
          </Button>
        </div>
      </form>
    </div>
  );
}
