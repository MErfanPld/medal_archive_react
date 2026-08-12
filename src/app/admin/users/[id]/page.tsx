"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, User, Shield, Mail, Calendar, CheckCircle, XCircle } from "lucide-react";
import { getUserById } from "@/lib/data/users";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserById(Number(id)),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-16">
        <p className="text-destructive mb-4">کاربر یافت نشد</p>
        <Button asChild variant="outline">
          <Link href="/admin/users">بازگشت</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/users"><ArrowRight className="h-5 w-5" /></Link>
        </Button>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xl font-bold">
            {(user.first_name || user.username || "U")[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {user.first_name || ""} {user.last_name || ""}
            </h1>
            <p className="text-sm text-text-muted">@{user.username}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" /> اطلاعات حساب
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">ایمیل</span>
              <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">وضعیت</span>
              {user.is_active ? (
                <Badge className="bg-emerald-100 text-emerald-800"><CheckCircle className="h-3 w-3 ml-1" />فعال</Badge>
              ) : (
                <Badge variant="secondary"><XCircle className="h-3 w-3 ml-1" />غیرفعال</Badge>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">تاریخ عضویت</span>
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{user.date_joined?.slice(0, 10) || "—"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" /> نقش و دسترسی
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-text-muted">نقش</span>
              <Badge>{user.role?.name || "—"}</Badge>
            </div>
            <div>
              <p className="text-text-muted mb-2">دسترسی‌ها</p>
              <div className="flex flex-wrap gap-1.5">
                {(user.role?.permissions || ["view_medals", "view_categories"]).map((p: string) => (
                  <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button variant="outline">تغییر نقش</Button>
        <Button variant={user.is_active ? "destructive" : "default"}>
          {user.is_active ? "غیرفعال‌سازی" : "فعال‌سازی"}
        </Button>
      </div>
    </div>
  );
}
