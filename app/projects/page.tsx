import { Suspense } from "react";
import { ProjectsExplorer } from "@/components/hub/projects-explorer";
import { MissingConfigNotice } from "@/components/ui/missing-config-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { getProjects, getSiteSettings } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  if (!isSupabaseConfigured()) {
    return <MissingConfigNotice />;
  }

  const [projects, settings] = await Promise.all([getProjects(), getSiteSettings()]);

  return (
    <Suspense fallback={<MissingConfigNotice />}>
      <ProjectsExplorer projects={projects} settings={settings} />
    </Suspense>
  );
}
