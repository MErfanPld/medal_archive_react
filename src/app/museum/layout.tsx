"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import "./museum-experience.css";
import { MuseumPublicShell } from "@/components/museum/public-shell";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Museum is login-only. Middleware redirects without cookie;
 * this client guard blocks any flash of content before auth is ready.
 */
export default function MuseumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated()) {
      const next = pathname || "/museum";
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [isHydrated, isAuthenticated, pathname, router]);

  // Never render museum UI until we know the user is logged in
  if (!isHydrated || !isAuthenticated()) {
    return (
      <div className="min-h-screen bg-[#0D0B0C]" aria-hidden="true" />
    );
  }

  return <MuseumPublicShell>{children}</MuseumPublicShell>;
}
