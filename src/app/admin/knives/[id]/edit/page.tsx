"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getKnifeById, updateKnife } from "@/lib/data/knives";
import type { KnifeRequest } from "@/types/knives";
import { KnifeForm } from "@/components/admin/knife-form";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";
import { ApiError } from "@/lib/api/client";
import Link from "next/link";

export default function EditKnifePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const knifeId = Number(id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const [error, setError] = useState<string | null>(null);

  const { data: knife, isLoading, isError } = useQuery({
    queryKey: ["knife", knifeId],
    queryFn: () => getKnifeById(knifeId),
    enabled: !Number.isNaN(knifeId),
  });

  const mutation = useMutation({
    mutationFn: (data: KnifeRequest) => updateKnife(knifeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knives"] });
      queryClient.invalidateQueries({ queryKey: ["knife", knifeId] });
      toast.success("تغییرات ذخیره شد");
      router.push(`/admin/knives/${knifeId}`);
    },
    onError: (err) => {
      setError(
        err instanceof ApiError ? err.message : "خطا در ذخیره تغییرات"
      );
    },
  });

  if (!hasPermission(PERMISSIONS.KNIVES_UPDATE)) {
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

  if (isError || !knife) {
    return (
      <Alert variant="danger">
        چاقو یافت نشد.{" "}
        <Link href="/admin/knives" className="underline">
          بازگشت
        </Link>
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">ویرایش: {knife.name}</h1>
        <p className="mt-1 text-sm text-text-muted">
          تغییرات را ذخیره کنید تا در آرشیو به‌روز شود.
        </p>
      </div>

      {error && (
        <Alert variant="danger" title="خطا">
          {error}
        </Alert>
      )}

      <KnifeForm
        knife={knife}
        onSubmit={async (data) => {
          setError(null);
          await mutation.mutateAsync(data);
        }}
        onCancel={() => router.push(`/admin/knives/${knifeId}`)}
        loading={mutation.isPending}
        submitLabel="ذخیره تغییرات"
      />
    </div>
  );
}
