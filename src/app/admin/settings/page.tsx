"use client";

import { useEffect, useState } from "react";
import { User, Palette } from "lucide-react";
import { useAuthStore, refreshCurrentUser } from "@/stores/auth-store";
import {
  usePreferencesStore,
  ACCENT_PRESETS,
  type AccentPresetId,
  type FontScale,
  type ColorMode,
} from "@/stores/preferences-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const isAuthHydrated = useAuthStore((s) => s.isHydrated);

  const accentId = usePreferencesStore((s) => s.accentId);
  const fontScale = usePreferencesStore((s) => s.fontScale);
  const colorMode = usePreferencesStore((s) => s.colorMode);
  const setAccentId = usePreferencesStore((s) => s.setAccentId);
  const setFontScale = usePreferencesStore((s) => s.setFontScale);
  const setColorMode = usePreferencesStore((s) => s.setColorMode);
  const applyToDocument = usePreferencesStore((s) => s.applyToDocument);
  const isHydrated = usePreferencesStore((s) => s.isHydrated);

  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (isHydrated) applyToDocument();
  }, [isHydrated, applyToDocument]);

  // Refresh profile from GET /api/users/me/ (read-only display)
  useEffect(() => {
    if (!isAuthHydrated) return;
    let cancelled = false;

    (async () => {
      setLoadingProfile(true);
      try {
        await refreshCurrentUser();
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthHydrated]);

  const rolesLabel = user?.roles?.map((r) => r.name).join("، ") || "—";

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() ||
    user?.username ||
    "—";

  const initials =
    [user?.first_name?.[0], user?.last_name?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() ||
    user?.username?.[0]?.toUpperCase() ||
    "؟";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-text">تنظیمات</h1>
        <p className="mt-1 text-sm text-text-muted">
          تنظیمات حساب کاربری و ظاهر سامانه را مدیریت کنید.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="size-5 text-primary" aria-hidden />
            <CardTitle>ظاهر و نمایش</CardTitle>
          </div>
          <CardDescription>
            رنگ تم، اندازه متن و حالت روشن/تیره را تنظیم کنید.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <fieldset>
            <legend className="mb-3 text-sm font-medium text-text">رنگ تم</legend>
            <div
              className="flex flex-wrap gap-3"
              role="radiogroup"
              aria-label="رنگ تم"
            >
              {ACCENT_PRESETS.map((p) => {
                const selected = accentId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={p.label}
                    onClick={() => setAccentId(p.id as AccentPresetId)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl border p-3 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                      selected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                        : "border-border hover:bg-surface-muted"
                    )}
                  >
                    <span
                      className="size-9 rounded-full shadow-sm ring-1 ring-black/10"
                      style={{ backgroundColor: p.primary }}
                      aria-hidden
                    />
                    <span className="text-xs text-text-muted">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div>
            <Label id="font-scale-label" className="mb-3 block">
              اندازه فونت
            </Label>
            <div
              className="inline-flex rounded-lg border border-border bg-surface-muted/50 p-1"
              role="group"
              aria-labelledby="font-scale-label"
            >
              {(
                [
                  { id: "sm", label: "کوچک" },
                  { id: "md", label: "متوسط" },
                  { id: "lg", label: "بزرگ" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFontScale(opt.id as FontScale)}
                  className={cn(
                    "rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                    fontScale === opt.id
                      ? "bg-surface text-text shadow-sm"
                      : "text-text-muted hover:text-text"
                  )}
                  aria-pressed={fontScale === opt.id}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label id="color-mode-label" className="mb-3 block">
              حالت نمایش
            </Label>
            <div
              className="inline-flex rounded-lg border border-border bg-surface-muted/50 p-1"
              role="group"
              aria-labelledby="color-mode-label"
            >
              {(
                [
                  { id: "light", label: "روشن" },
                  { id: "dark", label: "تیره" },
                  { id: "system", label: "سیستم" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setColorMode(opt.id as ColorMode)}
                  className={cn(
                    "rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                    colorMode === opt.id
                      ? "bg-surface text-text shadow-sm"
                      : "text-text-muted hover:text-text"
                  )}
                  aria-pressed={colorMode === opt.id}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="size-5 text-primary" aria-hidden />
            <CardTitle>پروفایل</CardTitle>
          </div>
          <CardDescription>
            اطلاعات حساب فقط برای مشاهده است و قابل ویرایش نیست.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!user && loadingProfile ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !user ? (
            <p className="text-sm text-text-muted">
              اطلاعات کاربر در دسترس نیست. لطفاً دوباره وارد شوید.
            </p>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div
                  className="flex size-16 items-center justify-center rounded-full bg-primary/15 text-lg font-semibold text-primary"
                  aria-hidden
                >
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-text">{displayName}</p>
                  <p className="text-xs text-text-muted" dir="ltr">
                    @{user.username}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>نام کاربری</Label>
                  <Input
                    value={user.username ?? ""}
                    disabled
                    readOnly
                    dir="ltr"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>نقش</Label>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {user.roles?.length ? (
                      user.roles.map((r) => (
                        <Badge key={r.id} variant="primary">
                          {r.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-text-muted">{rolesLabel}</span>
                    )}
                  </div>
                </div>
                <div>
                  <Label>نام</Label>
                  <Input
                    value={user.first_name ?? "—"}
                    disabled
                    readOnly
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>نام خانوادگی</Label>
                  <Input
                    value={user.last_name ?? "—"}
                    disabled
                    readOnly
                    className="mt-1.5"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>ایمیل</Label>
                  <Input
                    value={user.email ?? "—"}
                    disabled
                    readOnly
                    dir="ltr"
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
