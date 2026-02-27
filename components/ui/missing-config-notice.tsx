import Link from "next/link";

export function MissingConfigNotice() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="glass-panel max-w-2xl rounded-3xl p-8 shadow-glass sm:p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Setup krävs</p>
        <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Supabase saknar miljövariabler</h1>
        <p className="mt-4 text-white/75">
          Sätt <code className="rounded bg-white/10 px-1">NEXT_PUBLIC_SUPABASE_URL</code> och{" "}
          <code className="rounded bg-white/10 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> i <code>.env.local</code>
          innan appen kan hämta data.
        </p>
        <Link
          href="https://supabase.com/docs"
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/20"
        >
          Öppna Supabase-dokumentation
        </Link>
      </div>
    </main>
  );
}
