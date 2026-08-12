"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Pencil, Trash2, Image as ImageIcon, FileText, ShoppingCart, TrendingUp, Award } from "lucide-react";
import { getMedalById, deleteMedal } from "@/lib/data/medals";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MedalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: medal, isLoading, error } = useQuery({
    queryKey: ["medal", id],
    queryFn: () => getMedalById(Number(id)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteMedal(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medals"] });
      router.push("/admin/medals");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 lg:col-span-1" />
          <Skeleton className="h-80 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (error || !medal) {
    return (
      <div className="text-center py-16">
        <p className="text-destructive mb-4">مدال یافت نشد</p>
        <Button asChild variant="outline">
          <Link href="/admin/medals">بازگشت به لیست</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/medals">
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-text">{medal.name}</h1>
            <p className="text-sm text-text-muted">{medal.catalog_number}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/medals/${id}/edit`}>
              <Pencil className="h-4 w-4 ml-2" />
              ویرایش
            </Link>
          </Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4 ml-2" />
            حذف
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="p-0">
            <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center rounded-t-xl">
              <Award className="h-24 w-24 text-primary/40" />
            </div>
            <div className="p-4 space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge>{medal.country}</Badge>
                <Badge variant="secondary">{medal.year}</Badge>
                <Badge variant="outline">{medal.material}</Badge>
              </div>
              <p className="text-sm text-text-muted">{medal.preservation_condition}</p>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                اطلاعات اصلی
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-text-muted">کشور</p>
                <p className="font-medium">{medal.country}</p>
              </div>
              <div>
                <p className="text-text-muted">سال</p>
                <p className="font-medium">{medal.year}</p>
              </div>
              <div>
                <p className="text-text-muted">مناسبت</p>
                <p className="font-medium">{medal.occasion || "—"}</p>
              </div>
              <div>
                <p className="text-text-muted">دوره تاریخی</p>
                <p className="font-medium">{medal.historical_period || "—"}</p>
              </div>
              <div>
                <p className="text-text-muted">سازنده</p>
                <p className="font-medium">{medal.maker || "—"}</p>
              </div>
              <div>
                <p className="text-text-muted">اصالت</p>
                <Badge variant={medal.authenticity === "authentic" ? "default" : "secondary"}>
                  {medal.authenticity === "authentic" ? "اصیل" : medal.authenticity}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-amber-600" />
                ارزش‌گذاری و خرید
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-text-muted">قیمت خرید</p>
                <p className="font-medium">
                  {medal.purchase_price
                    ? Number(medal.purchase_price).toLocaleString("fa-IR") + " " + (medal.purchase_currency || "")
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-text-muted">ارزش فعلی</p>
                <p className="font-medium text-amber-700">
                  {medal.current_value
                    ? Number(medal.current_value).toLocaleString("fa-IR") + " IRR"
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-text-muted">تاریخ خرید</p>
                <p className="font-medium">{medal.purchase_date || "—"}</p>
              </div>
              <div>
                <p className="text-text-muted">فروشنده</p>
                <p className="font-medium">{medal.seller || "—"}</p>
              </div>
            </CardContent>
          </Card>

          {medal.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">یادداشت‌ها</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{medal.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="حذف مدال"
        description={`آیا از حذف «${medal.name}» مطمئن هستید؟`}
        confirmLabel="حذف"
        onConfirm={() => deleteMutation.mutate()}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
