"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMedalById, updateMedal } from "@/lib/data/medals";
import type { MedalRequest } from "@/types/api";
import { MedalForm } from "@/components/admin/medal-form";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS } from "@/lib/permissions";

export default function EditMedalPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const medalId = Number(params.id);
  const [error, setError] = useState<string | null>(null);

  const { data: medal, isLoading, isError } = useQuery({
    queryKey: ["medal", medalId],
    queryFn: () => getMedalById(medalId),
    enabled: Number.isFinite(medalId),
  });

  const mutation = useMutation({
    mutationFn: (data: MedalRequest) => updateMedal(medalId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medals"] });
      queryClient.invalidateQueries({ queryKey: ["medal", medalId] });
      router.push(`/admin/medals/${medalId}`);
    },
    onError: () => {
      setError("خطا در به‌روزرسانی مدال. لطفاً دوباره تلاش کنید.");
    },
  });

  if (!hasPermission(PERMISSIONS.MEDALS_UPDATE)) {
    return (
      <Alert variant="danger" title="دسترسی غیرمجاز">
        شما مجوز ویرایش مدال ندارید.
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="space-y-4 p-5">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !medal) {
    return (
      <Alert variant="danger" title="مدال یافت نشد">
        مدال مورد نظر وجود ندارد یا حذف شده است.
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">ویرایش مدال</h1>
        <p className="mt-1 text-sm text-text-muted">{medal.name}</p>
      </div>

      {error && (
        <Alert variant="danger" title="خطا">
          {error}
        </Alert>
      )}

      <MedalForm
        medal={medal}
        onSubmit={async (data) => {
          setError(null);
          await mutation.mutateAsync(data);
        }}
        onCancel={() => router.push(`/admin/medals/${medalId}`)}
        loading={mutation.isPending}
        submitLabel="ذخیره تغییرات"
      />
    </div>
  );
}
