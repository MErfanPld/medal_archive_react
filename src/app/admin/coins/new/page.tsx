"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCoin } from "@/lib/data/coins";
import type { CoinRequest } from "@/types/api";
import { CoinForm } from "@/components/admin/coin-form";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";
import { ApiError } from "@/lib/api/client";

export default function NewCoinPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: CoinRequest) => createCoin(data),
    onSuccess: (coin) => {
      queryClient.invalidateQueries({ queryKey: ["coins"] });
      toast.success("قلم با موفقیت ثبت شد");
      router.push(`/admin/coins/${coin.id}`);
    },
    onError: (err) => {
      setError(
        err instanceof ApiError
          ? err.message
          : "خطا در ایجاد قلم. لطفاً دوباره تلاش کنید."
      );
    },
  });

  if (!hasPermission(PERMISSIONS.COINS_CREATE)) {
    return (
      <Alert variant="danger" title="دسترسی غیرمجاز">
        شما مجوز ایجاد سکه / اسکناس ندارید.
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">افزودن سکه / اسکناس</h1>
        <p className="mt-1 text-sm text-text-muted">
          اطلاعات قلم را وارد کنید. فیلدهای ستاره‌دار الزامی هستند.
        </p>
      </div>

      {error && (
        <Alert variant="danger" title="خطا">
          {error}
        </Alert>
      )}

      <CoinForm
        onSubmit={async (data) => {
          setError(null);
          await mutation.mutateAsync(data);
        }}
        onCancel={() => router.push("/admin/coins")}
        loading={mutation.isPending}
        submitLabel="ایجاد قلم"
      />
    </div>
  );
}
