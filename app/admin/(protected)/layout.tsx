import { redirect } from "next/navigation";
import { AdminSessionGuard } from "@/components/admin/admin-session-guard";
import { AdminShell } from "@/components/admin/admin-shell";
import { getCurrentAdminContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = await getCurrentAdminContext();

  if (!user) {
    redirect("/admin");
  }

  if (!isAdmin) {
    redirect("/admin?error=unauthorized");
  }

  return (
    <AdminSessionGuard>
      <AdminShell email={user.email ?? ""}>{children}</AdminShell>
    </AdminSessionGuard>
  );
}
