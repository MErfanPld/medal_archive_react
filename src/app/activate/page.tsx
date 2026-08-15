"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

function ActivateRedirect() {
  const router = useRouter();
  const search = useSearchParams();
  const token = search.get("token") || search.get("invite_token") || "";

  useEffect(() => {
    if (token) {
      router.replace(`/invite/${encodeURIComponent(token)}`);
    } else {
      router.replace("/login");
    }
  }, [token, router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center p-6">
      <p className="text-sm text-text-muted">در حال انتقال به صفحه فعال‌سازی…</p>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center p-6">
          <Skeleton className="h-8 w-48" />
        </div>
      }
    >
      <ActivateRedirect />
    </Suspense>
  );
}
