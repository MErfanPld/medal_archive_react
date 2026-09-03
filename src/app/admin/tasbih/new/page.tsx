"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTasbih } from "@/lib/data/tasbih";
import type { TasbihRequest } from "@/types/tasbih";
import { TasbihForm } from "@/components/admin/tasbih-form";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";
import { ApiError } from "@/lib/api/client";

export default function NewTasbihPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: TasbihRequest) => createTasbih(data),
    onSuccess: (tasbih) => {
      queryClient.invalidateQueries({ queryKey: ["tasbih"] });
      toast.success("تسبیح با موفقیت ثبت شد");
      router.push(`/admin/tasbih/${tasbih.id}`);
    },
    onError: (err) => {
      setError(
        err instanceof ApiError
          ? err.message
          : "خطا در ایجاد تسبیح. لطفاً دوباره تلاش کنید."
      );
    },
  });

  if (!hasPermission(PERMISSIONS.TASBIH_CREATE)) {
    return (
      <Alert variant="danger" title="دسترسی غیرمجاز">
        شما مجوز ایجاد تسبیح ندارید.
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">افزودن تسبیح</h1>
        <p className="mt-1 text-sm text-text-muted">
          اطلاعات تسبیح را وارد کنید. فیلدهای ستاره‌دار الزامی هستند.
        </p>
      </div>

      {error && (
        <Alert variant="danger" title="خطا">
          {error}
        </Alert>
      )}

      <TasbihForm
        onSubmit={async (data) => {
          setError(null);
          await mutation.mutateAsync(data);
        }}
        onCancel={() => router.push("/admin/tasbih")}
        loading={mutation.isPending}
        submitLabel="ایجاد تسبیح"
      />
    </div>
  );
}
