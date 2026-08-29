"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBanknoteById, updateBanknote } from "@/lib/data/banknotes";
import type { BanknoteRequest } from "@/types/api";
import { BanknoteForm } from "@/components/admin/banknote-form";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";
import { ApiError } from "@/lib/api/client";
import Link from "next/link";

export default function EditBanknotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const banknoteId = Number(id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const [error, setError] = useState<string | null>(null);

  const { data: banknote, isLoading, isError } = useQuery({
    queryKey: ["banknote", banknoteId],
    queryFn: () => getBanknoteById(banknoteId),
    enabled: !Number.isNaN(banknoteId),
  });

  const mutation = useMutation({
    mutationFn: (data: BanknoteRequest) => updateBanknote(banknoteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banknotes"] });
      queryClient.invalidateQueries({ queryKey: ["banknote", banknoteId] });
      toast.success("تغییرات ذخیره شد");
      router.push(`/admin/banknotes/${banknoteId}`);
    },
    onError: (err) => {
      setError(
        err instanceof ApiError ? err.message : "خطا در ذخیره تغییرات"
      );
    },
  });

  if (!hasPermission(PERMISSIONS.BANKNOTES_UPDATE)) {
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

  if (isError || !banknote) {
    return (
      <Alert variant="danger">
        اسکناس یافت نشد.{" "}
        <Link href="/admin/banknotes" className="underline">
          بازگشت
        </Link>
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">
          ویرایش: {banknote.name}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          تغییرات را ذخیره کنید تا در آرشیو به‌روز شود.
        </p>
      </div>

      {error && (
        <Alert variant="danger" title="خطا">
          {error}
        </Alert>
      )}

      <BanknoteForm
        banknote={banknote}
        onSubmit={async (data) => {
          setError(null);
          await mutation.mutateAsync(data);
        }}
        onCancel={() => router.push(`/admin/banknotes/${banknoteId}`)}
        loading={mutation.isPending}
        submitLabel="ذخیره تغییرات"
      />
    </div>
  );
}
