"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBanknote } from "@/lib/data/banknotes";
import type { BanknoteRequest } from "@/types/api";
import { BanknoteForm } from "@/components/admin/banknote-form";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";
import { ApiError } from "@/lib/api/client";

export default function NewBanknotePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: BanknoteRequest) => createBanknote(data),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: ["banknotes"] });
      toast.success("اسکناس با موفقیت ثبت شد");
      router.push(`/admin/banknotes/${item.id}`);
    },
    onError: (err) => {
      setError(
        err instanceof ApiError
          ? err.message
          : "خطا در ایجاد اسکناس. لطفاً دوباره تلاش کنید."
      );
    },
  });

  if (!hasPermission(PERMISSIONS.BANKNOTES_CREATE)) {
    return (
      <Alert variant="danger" title="دسترسی غیرمجاز">
        شما مجوز ایجاد اسکناس ندارید.
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">افزودن اسکناس</h1>
        <p className="mt-1 text-sm text-text-muted">
          اطلاعات اسکناس را وارد کنید. فیلدهای ستاره‌دار الزامی هستند.
        </p>
      </div>

      {error && (
        <Alert variant="danger" title="خطا">
          {error}
        </Alert>
      )}

      <BanknoteForm
        onSubmit={async (data) => {
          setError(null);
          await mutation.mutateAsync(data);
        }}
        onCancel={() => router.push("/admin/banknotes")}
        loading={mutation.isPending}
        submitLabel="ایجاد اسکناس"
      />
    </div>
  );
}
