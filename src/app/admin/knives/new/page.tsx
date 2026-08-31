"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createKnife } from "@/lib/data/knives";
import type { KnifeRequest } from "@/types/knives";
import { KnifeForm } from "@/components/admin/knife-form";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";
import { ApiError } from "@/lib/api/client";

export default function NewKnifePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: KnifeRequest) => createKnife(data),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: ["knives"] });
      toast.success("چاقو با موفقیت ثبت شد");
      router.push(`/admin/knives/${item.id}`);
    },
    onError: (err) => {
      setError(
        err instanceof ApiError
          ? err.message
          : "خطا در ایجاد چاقو. لطفاً دوباره تلاش کنید."
      );
    },
  });

  if (!hasPermission(PERMISSIONS.KNIVES_CREATE)) {
    return (
      <Alert variant="danger" title="دسترسی غیرمجاز">
        شما مجوز ایجاد چاقو ندارید.
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">افزودن چاقو</h1>
        <p className="mt-1 text-sm text-text-muted">
          اطلاعات چاقو را وارد کنید. فیلدهای ستاره‌دار الزامی هستند.
        </p>
      </div>

      {error && (
        <Alert variant="danger" title="خطا">
          {error}
        </Alert>
      )}

      <KnifeForm
        onSubmit={async (data) => {
          setError(null);
          await mutation.mutateAsync(data);
        }}
        onCancel={() => router.push("/admin/knives")}
        loading={mutation.isPending}
        submitLabel="ایجاد چاقو"
      />
    </div>
  );
}
