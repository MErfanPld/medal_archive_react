"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAntiqueById, updateAntique } from "@/lib/data/antiques";
import type { AntiqueRequest } from "@/types/api";
import { AntiqueForm } from "@/components/admin/antique-form";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";
import { ApiError } from "@/lib/api/client";
import Link from "next/link";

export default function EditAntiquePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const antiqueId = Number(id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const [error, setError] = useState<string | null>(null);

  const { data: antique, isLoading, isError } = useQuery({
    queryKey: ["antique", antiqueId],
    queryFn: () => getAntiqueById(antiqueId),
    enabled: !Number.isNaN(antiqueId),
  });

  const mutation = useMutation({
    mutationFn: (data: AntiqueRequest) => updateAntique(antiqueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["antiques"] });
      queryClient.invalidateQueries({ queryKey: ["antique", antiqueId] });
      toast.success("تغییرات ذخیره شد");
      router.push(`/admin/antiques/${antiqueId}`);
    },
    onError: (err) => {
      setError(
        err instanceof ApiError ? err.message : "خطا در ذخیره تغییرات"
      );
    },
  });

  if (!hasPermission(PERMISSIONS.ANTIQUES_UPDATE)) {
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

  if (isError || !antique) {
    return (
      <Alert variant="danger">
        آنتیک یافت نشد.{" "}
        <Link href="/admin/antiques" className="underline">
          بازگشت
        </Link>
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">ویرایش: {antique.name}</h1>
        <p className="mt-1 text-sm text-text-muted">
          تغییرات را ذخیره کنید تا در آرشیو به‌روز شود.
        </p>
      </div>

      {error && (
        <Alert variant="danger" title="خطا">
          {error}
        </Alert>
      )}

      <AntiqueForm
        antique={antique}
        onSubmit={async (data) => {
          setError(null);
          await mutation.mutateAsync(data);
        }}
        onCancel={() => router.push(`/admin/antiques/${antiqueId}`)}
        loading={mutation.isPending}
        submitLabel="ذخیره تغییرات"
      />
    </div>
  );
}
