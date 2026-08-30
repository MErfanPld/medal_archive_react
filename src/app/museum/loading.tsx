export default function MuseumLoading() {
  return (
    <div className="min-h-screen bg-[#0D0B0C] px-4 py-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="mx-auto h-[40vh] max-w-md animate-pulse rounded-full bg-white/5" />
        <div className="mx-auto h-8 w-64 animate-pulse rounded bg-white/10" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}
