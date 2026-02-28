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
        <div className="admin-surface flex flex-wrap items-center justify-between gap-4 rounded-2xl px-4 py-3 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-blue-200/80">Admin</p>
            <p className="text-sm text-slate-300">{email}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/admin/projects" className="btn-secondary-dark px-4 py-2 text-sm">
              Projekt
            </Link>
            <Link href="/admin/settings" className="btn-secondary-dark px-4 py-2 text-sm">
              Inställningar
            </Link>
            <Link href="/" className="btn-primary-amber px-4 py-2 text-sm">
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
