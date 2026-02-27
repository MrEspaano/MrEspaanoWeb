import { AdminSettingsForm } from "@/components/admin/admin-settings-form";
import { getSiteSettings } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  return <AdminSettingsForm settings={settings} />;
}
