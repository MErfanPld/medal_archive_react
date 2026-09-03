"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStampById, updateStamp } from "@/lib/data/stamps";
import type { StampRequest } from "@/types/stamps";
import { StampForm } from "@/components/admin/stamp-form";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";
import { ApiError } from "@/lib/api/client";
import Link from "next/link";

export default function EditStampPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const stampId = Number(id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const [error, setError] = useState<string | null>(null);

  const { data: stamp, isLoading, isError } = useQuery({
    queryKey: ["stamp", stampId],
    queryFn: () => getStampById(stampId),
    enabled: !Number.isNaN(stampId),
  });

  const mutation = useMutation({
    mutationFn: (data: StampRequest) => updateStamp(stampId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stamps"] });
      queryClient.invalidateQueries({ queryKey: ["stamp", stampId] });
      toast.success("تغییرات ذخیره شد");
      router.push(`/admin/stamps/${stampId}`);
    },
    onError: (err) => {
      setError(
        err instanceof ApiError ? err.message : "خطا در ذخیره تغییرات"
      );
    },
  });

  if (!hasPermission(PERMISSIONS.STAMPS_UPDATE)) {
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

  if (isError || !stamp) {
    return (
      <Alert variant="danger">
        تمبر یافت نشد.{" "}
        <Link href="/admin/stamps" className="underline">
          بازگشت
        </Link>
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">ویرایش: {stamp.name}</h1>
        <p className="mt-1 text-sm text-text-muted">
          تغییرات را ذخیره کنید تا در آرشیو به‌روز شود.
        </p>
      </div>

      {error && (
        <Alert variant="danger" title="خطا">
          {error}
        </Alert>
      )}

      <StampForm
        stamp={stamp}
        onSubmit={async (data) => {
          setError(null);
          await mutation.mutateAsync(data);
        }}
        onCancel={() => router.push(`/admin/stamps/${stampId}`)}
        loading={mutation.isPending}
        submitLabel="ذخیره تغییرات"
      />
    </div>
  );
}
