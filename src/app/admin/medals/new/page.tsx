"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMedal } from "@/lib/data/medals";
import type { MedalRequest } from "@/types/api";
import { MedalForm } from "@/components/admin/medal-form";
import { Alert } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function NewMedalPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: MedalRequest) => createMedal(data),
    onSuccess: (medal) => {
      queryClient.invalidateQueries({ queryKey: ["medals"] });
      router.push(`/admin/medals/${medal.id}`);
    },
    onError: () => {
      setError("خطا در ایجاد مدال. لطفاً دوباره تلاش کنید.");
    },
  });

  if (!hasPermission(PERMISSIONS.MEDALS_CREATE)) {
    return (
      <AuthGuard>
        <Alert variant="danger" title="دسترسی غیرمجاز">
          شما مجوز ایجاد مدال ندارید.
        </Alert>
      </AuthGuard>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">افزودن مدال جدید</h1>
        <p className="mt-1 text-sm text-text-muted">
          اطلاعات مدال را وارد کنید. فیلدهای ستاره‌دار الزامی هستند.
        </p>
      </div>

      {error && (
        <Alert variant="danger" title="خطا">
          {error}
        </Alert>
      )}

      <MedalForm
        onSubmit={async (data) => {
          setError(null);
          await mutation.mutateAsync(data);
        }}
        onCancel={() => router.push("/admin/medals")}
        loading={mutation.isPending}
        submitLabel="ایجاد مدال"
      />
    </div>
  );
}
