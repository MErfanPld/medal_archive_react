"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTasbihById, updateTasbih } from "@/lib/data/tasbih";
import type { TasbihRequest } from "@/types/tasbih";
import { TasbihForm } from "@/components/admin/tasbih-form";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";
import { ApiError } from "@/lib/api/client";
import Link from "next/link";

export default function EditTasbihPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const tasbihId = Number(id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const [error, setError] = useState<string | null>(null);

  const { data: tasbih, isLoading, isError } = useQuery({
    queryKey: ["tasbih", tasbihId],
    queryFn: () => getTasbihById(tasbihId),
    enabled: !Number.isNaN(tasbihId),
  });

  const mutation = useMutation({
    mutationFn: (data: TasbihRequest) => updateTasbih(tasbihId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasbih"] });
      queryClient.invalidateQueries({ queryKey: ["tasbih", tasbihId] });
      toast.success("تغییرات ذخیره شد");
      router.push(`/admin/tasbih/${tasbihId}`);
    },
    onError: (err) => {
      setError(
        err instanceof ApiError ? err.message : "خطا در ذخیره تغییرات"
      );
    },
  });

  if (!hasPermission(PERMISSIONS.TASBIH_UPDATE)) {
    return (
      <Alert variant="danger" title="دسترسی غیرمجاز">
        شما مجوز ویرایش ندارید.
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !tasbih) {
    return (
      <Alert variant="danger">
        تسبیح یافت نشد.{" "}
        <Link href="/admin/tasbih" className="underline">
          بازگشت
        </Link>
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">ویرایش: {tasbih.name}</h1>
        <p className="mt-1 text-sm text-text-muted">
          تغییرات را ذخیره کنید تا در آرشیو به‌روز شود.
        </p>
      </div>

      {error && (
        <Alert variant="danger" title="خطا">
          {error}
        </Alert>
      )}

      <TasbihForm
        tasbih={tasbih}
        onSubmit={async (data) => {
          setError(null);
          await mutation.mutateAsync(data);
        }}
        onCancel={() => router.push(`/admin/tasbih/${tasbihId}`)}
        loading={mutation.isPending}
        submitLabel="ذخیره تغییرات"
      />
    </div>
  );
}
