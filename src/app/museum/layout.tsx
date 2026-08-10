import Link from "next/link";

export default function MuseumLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/museum" className="text-sm font-semibold tracking-tight text-primary-deep">
            موزه دیجیتال مدال
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/museum" className="text-text-muted hover:text-text">خانه</Link>
            <Link href="/museum/medals" className="text-text-muted hover:text-text">مجموعه</Link>
            <Link href="/admin/dashboard" className="text-text-muted hover:text-text">مدیریت</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">{children}</main>
      <footer className="border-t border-border py-8 text-center text-xs text-text-subtle">
        Medal Archive Pro · تجربه موزه‌ای
      </footer>
    </div>
  );
}
