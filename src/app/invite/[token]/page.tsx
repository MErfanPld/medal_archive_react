"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, LogIn } from "lucide-react";
import { invitesApi } from "@/lib/api/invites";
import { useAuthStore, refreshCurrentUser } from "@/stores/auth-store";
import { ApiError } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { UserMe } from "@/types/api";

type Phase = "loading" | "success" | "error";

function messageForStatus(status: number, backendMessage?: string): string {
  if (
    backendMessage &&
    backendMessage.trim() &&
    !/^\d+$/.test(backendMessage) &&
    !backendMessage.startsWith("خطای ")
  ) {
    return backendMessage;
  }
  switch (status) {
    case 400:
      return "لینک دعوت نامعتبر است یا اطلاعات ارسالی صحیح نیست.";
    case 401:
      return "برای مصرف این دعوت احراز هویت لازم است.";
    case 403:
      return "دسترسی به این لینک دعوت مجاز نیست.";
    case 404:
      return "لینک دعوت یافت نشد یا منقضی شده است.";
    case 409:
      return "این لینک دعوت قبلاً استفاده شده است.";
    case 410:
      return "لینک دعوت منقضی شده است.";
    case 500:
    case 502:
    case 503:
      return "خطای داخلی سرور. لطفاً بعداً تلاش کنید.";
    default:
      return backendMessage || "مصرف لینک دعوت ناموفق بود.";
  }
}

type CachePayload =
  | {
      status: "success";
      access?: string;
      refresh?: string;
      user?: UserMe | null;
      username?: string | null;
    }
  | { status: "error"; message: string };

function cacheKey(token: string) {
  return `medal_invite_consume:${token}`;
}

function readCache(token: string): CachePayload | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(cacheKey(token));
    if (!raw) return null;
    return JSON.parse(raw) as CachePayload;
  } catch {
    return null;
  }
}

function writeCache(token: string, payload: CachePayload) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(cacheKey(token), JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export default function ConsumeInvitePage() {
  const params = useParams();
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const setUser = useAuthStore((s) => s.setUser);

  const rawToken = params?.token;
  const token =
    typeof rawToken === "string"
      ? decodeURIComponent(rawToken)
      : Array.isArray(rawToken)
        ? decodeURIComponent(rawToken[0] ?? "")
        : "";

  const [phase, setPhase] = useState<Phase>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setPhase("error");
      setErrorMessage("توکن دعوت در آدرس وجود ندارد.");
      return;
    }

    const cached = readCache(token);
    if (cached?.status === "success") {
      if (cached.access) {
        setSession(cached.access, cached.refresh ?? "", cached.user ?? null);
        if (cached.user) setUser(cached.user);
      }
      setUsername(cached.username ?? cached.user?.username ?? null);
      setPhase("success");
      return;
    }
    if (cached?.status === "error") {
      setErrorMessage(cached.message);
      setPhase("error");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const data = await invitesApi.consume(token);

        if (data?.access) {
          setSession(data.access, data.refresh ?? "", data.user ?? null);
          if (data.user) {
            setUser(data.user);
          } else {
            try {
              const me = await refreshCurrentUser();
              if (me) setUsername(me.username);
            } catch {
              // ok
            }
          }
        }

        const name = data?.user?.username ?? null;
        writeCache(token, {
          status: "success",
          access: data?.access,
          refresh: data?.refresh,
          user: data?.user ?? null,
          username: name,
        });

        if (cancelled) return;
        if (name) setUsername(name);
        setPhase("success");
      } catch (err) {
        const status = err instanceof ApiError ? err.status : 0;
        const msg = messageForStatus(status, getErrorMessage(err));
        writeCache(token, { status: "error", message: msg });
        if (cancelled) return;
        setErrorMessage(msg);
        setPhase("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, setSession, setUser]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-semibold tracking-tight text-primary-deep">
              Medal Archive Pro
            </h1>
          </Link>
          <p className="mt-2 text-sm text-text-muted">پذیرش دعوت‌نامه</p>
        </div>

        <Card>
          {phase === "loading" && (
            <CardHeader className="items-center text-center">
              <Loader2 className="mb-2 size-10 animate-spin text-primary" />
              <CardTitle>در حال بررسی دعوت‌نامه…</CardTitle>
              <CardDescription>
                لطفاً صبر کنید تا لینک دعوت تأیید شود.
              </CardDescription>
            </CardHeader>
          )}

          {phase === "success" && (
            <>
              <CardHeader className="items-center text-center">
                <CheckCircle2 className="mb-2 size-12 text-emerald-600" />
                <CardTitle>دعوت با موفقیت پذیرفته شد</CardTitle>
                <CardDescription>
                  {username
                    ? `حساب «${username}» فعال شد و وارد سامانه شدید.`
                    : "حساب شما فعال شد."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Button
                  className="w-full"
                  onClick={() => router.replace("/admin/dashboard")}
                >
                  ورود به پنل مدیریت
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.replace("/museum")}
                >
                  مشاهده موزه
                </Button>
              </CardContent>
            </>
          )}

          {phase === "error" && (
            <>
              <CardHeader className="items-center text-center">
                <XCircle className="mb-2 size-12 text-danger" />
                <CardTitle>پذیرش دعوت ناموفق بود</CardTitle>
                <CardDescription className="text-danger">
                  {errorMessage}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Button
                  className="w-full"
                  onClick={() => router.replace("/login")}
                >
                  <LogIn className="size-4" />
                  رفتن به صفحه ورود
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/">بازگشت به صفحه اصلی</Link>
                </Button>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </main>
  );
}
