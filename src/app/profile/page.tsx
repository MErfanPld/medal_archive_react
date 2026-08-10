"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthGuard } from "@/components/auth/auth-guard";
import { User, Mail, Shield, Calendar, Settings } from "lucide-react";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated || !user) {
    return (
      <AuthGuard>
        <div />
      </AuthGuard>
    );
  }

  const displayName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.username;

  return (
    <AuthGuard>
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary-deep">
              <User className="size-8" />
            </span>
            <div>
              <h1 className="text-xl font-semibold text-text">{displayName}</h1>
              <p className="text-sm text-text-muted" dir="ltr">
                @{user.username}
              </p>
            </div>
          </div>
          <Link href="/admin/settings">
            <Button variant="outline" size="sm">
              <Settings className="size-4" />
              تنظیمات
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>اطلاعات حساب</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="size-4 text-text-subtle" />
              <div>
                <p className="text-xs text-text-muted">ایمیل</p>
                <p className="text-sm" dir="ltr">
                  {user.email || "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="size-4 text-text-subtle" />
              <div>
                <p className="text-xs text-text-muted">نقش‌ها</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {user.roles?.length ? (
                    user.roles.map((r) => (
                      <Badge key={r.id} variant="primary">
                        {r.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-text-muted">—</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="size-4 text-text-subtle" />
              <div>
                <p className="text-xs text-text-muted">عضویت از</p>
                <p className="text-sm">{formatDate(user.date_joined)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="size-4 text-text-subtle" />
              <div>
                <p className="text-xs text-text-muted">آخرین ورود</p>
                <p className="text-sm">{formatDate(user.last_login)}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-text-muted">وضعیت</p>
              <Badge
                variant={user.is_active ? "success" : "danger"}
                className="mt-1"
              >
                {user.is_active ? "فعال" : "غیرفعال"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Link href="/admin/dashboard">
            <Button variant="outline">پنل مدیریت</Button>
          </Link>
          <Link href="/museum">
            <Button variant="outline">موزه دیجیتال</Button>
          </Link>
        </div>
      </div>
    </AuthGuard>
  );
}
