import { MuseumPublicShell } from "@/components/museum/public-shell";

export default function MuseumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MuseumPublicShell>{children}</MuseumPublicShell>;
}
