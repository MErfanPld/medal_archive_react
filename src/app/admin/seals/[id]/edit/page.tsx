"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSealById, updateSeal } from "@/lib/data/seals";
import type { SealRequest } from "@/types/seals";
import { SealForm } from "@/components/admin/seal-form";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";
import { ApiError } from "@/lib/api/client";
import Link from "next/link";

export default function EditSealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const sealId = Number(id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const [error, setError] = useState<string | null>(null);

  const { data: seal, isLoading, isError } = useQuery({
    queryKey: ["seal", sealId],
    queryFn: () => getSealById(sealId),
    enabled: !Number.isNaN(sealId),
  });

  const mutation = useMutation({
    mutationFn: (data: SealRequest) => updateSeal(sealId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seals"] });
      queryClient.invalidateQueries({ queryKey: ["seal", sealId] });
      toast.success("تغییرات ذخیره شد");
      router.push(`/admin/seals/${sealId}`);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "خطا در ذخیره تغییرات");
    },
  });

  if (!hasPermission(PERMISSIONS.SEALS_UPDATE)) {
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

  if (isError || !seal) {
    return (
      <Alert variant="danger">
        مهر یافت نشد.{" "}
        <Link href="/admin/seals" className="underline">بازگشت</Link>
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">ویرایش: {seal.name}</h1>
      </div>
      {error && (
        <Alert variant="danger" title="خطا">{error}</Alert>
      )}
      <SealForm
        seal={seal}
        onSubmit={async (data) => {
          setError(null);
          await mutation.mutateAsync(data);
        }}
        onCancel={() => router.push(`/admin/seals/${sealId}`)}
        loading={mutation.isPending}
        submitLabel="ذخیره تغییرات"
      />
    </div>
  );
}
