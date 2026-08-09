import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16">
      <div className="max-w-xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-primary-deep sm:text-4xl">
          Medal Archive Pro
        </h1>
        <p className="mt-4 text-lg text-text-muted">
          آرشیو حرفه‌ای مدال و سکه — مدیریت مجموعه و تجربه موزه‌ای دیجیتال
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-white transition hover:bg-primary-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          ورود به سیستم
        </Link>
        <Link
          href="/admin/dashboard"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-surface px-6 text-sm font-medium text-text transition hover:bg-surface-muted"
        >
          پنل مدیریت
        </Link>
      </div>

      <p className="text-sm text-text-subtle">
        در حال راه‌اندازی پایه پروژه…
      </p>
    </main>
  );
}
