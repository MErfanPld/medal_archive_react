"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAntique } from "@/lib/data/antiques";
import type { AntiqueRequest } from "@/types/antiques";
import { AntiqueForm } from "@/components/admin/antique-form";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";
import { ApiError } from "@/lib/api/client";

export default function NewAntiquePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: AntiqueRequest) => createAntique(data),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: ["antiques"] });
      toast.success("آنتیک با موفقیت ثبت شد");
      router.push(`/admin/antiques/${item.id}`);
    },
    onError: (err) => {
      setError(
        err instanceof ApiError
          ? err.message
          : "خطا در ایجاد آنتیک. لطفاً دوباره تلاش کنید."
      );
    },
  });

  if (!hasPermission(PERMISSIONS.ANTIQUES_CREATE)) {
    return (
      <Alert variant="danger" title="دسترسی غیرمجاز">
        شما مجوز ایجاد آنتیک ندارید.
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">افزودن آنتیک</h1>
        <p className="mt-1 text-sm text-text-muted">
          اطلاعات آنتیک را وارد کنید. فیلدهای ستاره‌دار الزامی هستند.
        </p>
      </div>

      {error && (
        <Alert variant="danger" title="خطا">
          {error}
        </Alert>
      )}

      <AntiqueForm
        onSubmit={async (data) => {
          setError(null);
          await mutation.mutateAsync(data);
        }}
        onCancel={() => router.push("/admin/antiques")}
        loading={mutation.isPending}
        submitLabel="ایجاد آنتیک"
      />
    </div>
  );
}
