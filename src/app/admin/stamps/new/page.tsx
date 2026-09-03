"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStamp } from "@/lib/data/stamps";
import type { StampRequest } from "@/types/stamps";
import { StampForm } from "@/components/admin/stamp-form";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";
import { ApiError } from "@/lib/api/client";

export default function NewStampPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: StampRequest) => createStamp(data),
    onSuccess: (stamp) => {
      queryClient.invalidateQueries({ queryKey: ["stamps"] });
      toast.success("تمبر با موفقیت ثبت شد");
      router.push(`/admin/stamps/${stamp.id}`);
    },
    onError: (err) => {
      setError(
        err instanceof ApiError
          ? err.message
          : "خطا در ایجاد تمبر. لطفاً دوباره تلاش کنید."
      );
    },
  });

  if (!hasPermission(PERMISSIONS.STAMPS_CREATE)) {
    return (
      <Alert variant="danger" title="دسترسی غیرمجاز">
        شما مجوز ایجاد تمبر ندارید.
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">افزودن تمبر</h1>
        <p className="mt-1 text-sm text-text-muted">
          اطلاعات تمبر را وارد کنید. فیلدهای ستاره‌دار الزامی هستند.
        </p>
      </div>

      {error && (
        <Alert variant="danger" title="خطا">
          {error}
        </Alert>
      )}

      <StampForm
        onSubmit={async (data) => {
          setError(null);
          await mutation.mutateAsync(data);
        }}
        onCancel={() => router.push("/admin/stamps")}
        loading={mutation.isPending}
        submitLabel="ایجاد تمبر"
      />
    </div>
  );
}
