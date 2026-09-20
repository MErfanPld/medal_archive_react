import "./museum-experience.css";
import { MuseumPublicShell } from "@/components/museum/public-shell";
import { AuthGuard } from "@/components/auth/auth-guard";

/**
 * Museum view — requires login (same session as admin panel).
 * Guests are redirected to /login.
 */
export default function MuseumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <MuseumPublicShell>{children}</MuseumPublicShell>
    </AuthGuard>
  );
}
