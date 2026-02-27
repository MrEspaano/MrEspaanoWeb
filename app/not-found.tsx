import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="glass-panel max-w-lg rounded-3xl p-10 text-center shadow-glass">
        <h1 className="text-3xl font-bold text-white">Sidan hittades inte</h1>
        <p className="mt-4 text-white/70">
          Projektet eller sidan du försöker öppna finns inte längre eller har flyttats.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/20"
        >
          Till startsidan
        </Link>
      </div>
    </main>
  );
}
