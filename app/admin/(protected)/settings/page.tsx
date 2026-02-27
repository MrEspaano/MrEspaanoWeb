import { AdminSettingsForm } from "@/components/admin/admin-settings-form";
import { getProjects, getSiteSettings } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [settings, projects] = await Promise.all([getSiteSettings(), getProjects()]);
  return <AdminSettingsForm settings={settings} projects={projects} />;
}
