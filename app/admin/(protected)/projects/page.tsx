import { AdminProjectsClient } from "@/components/admin/admin-projects-client";
import { getProjects } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await getProjects();
  return <AdminProjectsClient projects={projects} />;
}
