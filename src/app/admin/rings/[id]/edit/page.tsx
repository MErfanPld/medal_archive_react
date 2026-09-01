"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRingById, updateRing } from "@/lib/data/rings";
import type { RingRequest } from "@/types/rings";
import { RingForm } from "@/components/admin/ring-form";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";
import { ApiError } from "@/lib/api/client";
import Link from "next/link";

export default function EditRingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const ringId = Number(id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const [error, setError] = useState<string | null>(null);

  const { data: ring, isLoading, isError } = useQuery({
    queryKey: ["ring", ringId],
    queryFn: () => getRingById(ringId),
    enabled: !Number.isNaN(ringId),
  });

  const mutation = useMutation({
    mutationFn: (data: RingRequest) => updateRing(ringId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rings"] });
      queryClient.invalidateQueries({ queryKey: ["ring", ringId] });
      toast.success("تغییرات ذخیره شد");
      router.push(`/admin/rings/${ringId}`);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "خطا در ذخیره تغییرات");
    },
  });

  if (!hasPermission(PERMISSIONS.RINGS_UPDATE)) {
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

  if (isError || !ring) {
    return (
      <Alert variant="danger">
        انگشتر یافت نشد.{" "}
        <Link href="/admin/rings" className="underline">بازگشت</Link>
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">ویرایش: {ring.name}</h1>
      </div>
      {error && (
        <Alert variant="danger" title="خطا">{error}</Alert>
      )}
      <RingForm
        ring={ring}
        onSubmit={async (data) => {
          setError(null);
          await mutation.mutateAsync(data);
        }}
        onCancel={() => router.push(`/admin/rings/${ringId}`)}
        loading={mutation.isPending}
        submitLabel="ذخیره تغییرات"
      />
    </div>
  );
}
