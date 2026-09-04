import "./museum-experience.css";
import { MuseumPublicShell } from "@/components/museum/public-shell";

/**
 * Public museum site — no login required.
 * Admin panel remains protected via middleware + AuthGuard.
 */
export default function MuseumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MuseumPublicShell>{children}</MuseumPublicShell>;
}
