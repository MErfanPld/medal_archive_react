"use client";

import { useState } from "react";
import { User, Palette, Bell, Shield, Settings as SettingsIcon, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth-store";

const tabs = [
  { id: "profile", label: "پروفایل", icon: User },
  { id: "appearance", label: "ظاهر", icon: Palette },
  { id: "notifications", label: "اعلان‌ها", icon: Bell },
  { id: "security", label: "امنیت", icon: Shield },
  { id: "application", label: "برنامه", icon: SettingsIcon },
];

export default function SettingsPage() {
  const [active, setActive] = useState("profile");
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <SettingsIcon className="h-7 w-7 text-primary" />
          تنظیمات
        </h1>
        <p className="text-sm text-text-muted mt-1">مدیریت پروفایل، ظاهر و ترجیحات سیستم</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <nav className="lg:w-56 shrink-0 space-y-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active === t.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-text"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </nav>

        <div className="flex-1 space-y-4">
          {active === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>اطلاعات پروفایل</CardTitle>
                <CardDescription>ویرایش اطلاعات حساب کاربری</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">نام کاربری</label>
                    <Input defaultValue={user?.username ?? "admin"} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">ایمیل</label>
                    <Input defaultValue={user?.email ?? "admin@example.com"} type="email" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">نام</label>
                    <Input defaultValue={user?.first_name ?? ""} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">نام خانوادگی</label>
                    <Input defaultValue={user?.last_name ?? ""} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{user?.role?.name ?? "Superuser"}</Badge>
                </div>
                <Button>
                  <Save className="h-4 w-4 ml-2" />
                  ذخیره تغییرات
                </Button>
              </CardContent>
            </Card>
          )}

          {active === "appearance" && (
            <Card>
              <CardHeader>
                <CardTitle>ظاهر</CardTitle>
                <CardDescription>تم و تنظیمات نمایش</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">تم رنگی</label>
                  <div className="flex gap-3">
                    <button className="h-10 w-10 rounded-full bg-[#6E1F2A] ring-2 ring-offset-2 ring-primary" />
                    <button className="h-10 w-10 rounded-full bg-slate-800" />
                    <button className="h-10 w-10 rounded-full bg-emerald-700" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">اندازه فونت</label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option>متوسط</option>
                    <option>کوچک</option>
                    <option>بزرگ</option>
                  </select>
                </div>
                <Button>اعمال</Button>
              </CardContent>
            </Card>
          )}

          {active === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>اعلان‌ها</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {["اعلان‌های سیستمی", "اعلان‌های مدال جدید", "گزارش‌های هفتگی", "هشدارهای امنیتی"].map((label) => (
                  <label key={label} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <span className="text-sm">{label}</span>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </label>
                ))}
                <Button className="mt-2">ذخیره</Button>
              </CardContent>
            </Card>
          )}

          {active === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>امنیت</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">رمز عبور فعلی</label>
                  <Input type="password" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">رمز عبور جدید</label>
                  <Input type="password" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">تکرار رمز عبور</label>
                  <Input type="password" />
                </div>
                <Button>تغییر رمز عبور</Button>
              </CardContent>
            </Card>
          )}

          {active === "application" && (
            <Card>
              <CardHeader>
                <CardTitle>تنظیمات برنامه</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between items-center p-3 rounded-lg border">
                  <span>نسخه</span>
                  <Badge variant="outline">1.0.0-static</Badge>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg border">
                  <span>حالت داده</span>
                  <Badge>Mock / Static</Badge>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg border">
                  <span>زبان</span>
                  <span>فارسی (RTL)</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
