import { HomeHub } from "@/components/hub/home-hub";
import { MissingConfigNotice } from "@/components/ui/missing-config-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { getProjects, getSiteSettings } from "@/lib/supabase/queries";

export default async function HomePage() {
  if (!isSupabaseConfigured()) {
    return <MissingConfigNotice />;
  }

  const [projects, settings] = await Promise.all([getProjects(), getSiteSettings()]);
  return <HomeHub projects={projects} settings={settings} />;
}
