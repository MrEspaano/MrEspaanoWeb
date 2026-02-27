import Link from "next/link";
import { AdminSignOutButton } from "@/components/admin/admin-signout-button";

interface AdminShellProps {
  email: string;
  children: React.ReactNode;
}

export function AdminShell({ email, children }: AdminShellProps) {
  return (
    <main className="min-h-screen pb-14 pt-6">
      <header className="section-shell mb-7">
        <div className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-2xl px-4 py-3 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-100/80">Admin</p>
            <p className="text-sm text-white/75">{email}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/projects"
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/20"
            >
              Projekt
            </Link>
            <Link
              href="/admin/settings"
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/20"
            >
              Inställningar
            </Link>
            <Link
              href="/"
              className="rounded-full border border-cyan-200/40 bg-cyan-200/15 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:border-cyan-200/70"
            >
              Publik vy
            </Link>
            <AdminSignOutButton />
          </div>
        </div>
      </header>

      {children}
    </main>
  );
}
