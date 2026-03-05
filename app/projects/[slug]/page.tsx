import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProjectDetailSurface } from "@/components/hub/project-detail-surface";
import { getProjectBySlug } from "@/lib/supabase/queries";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="relative min-h-screen pb-20 pt-10 sm:pt-16">
      <div className="section-shell mb-8">
        <div className="glass-elevated rounded-[1.8rem] p-4 sm:p-5">
          <Link href="/projects" className="btn-secondary-dark inline-flex gap-2 px-4 py-2 text-sm">
            <ArrowLeft size={16} />
            Tillbaka till projekt
          </Link>
        </div>
      </div>
      <div className="section-shell">
        <ProjectDetailSurface project={project} mode="route" />
      </div>
    </main>
  );
}
