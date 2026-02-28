"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { STATUS_LABELS } from "@/lib/constants";
import { Project } from "@/lib/types";
import { cn, mapStatusBadgeClass } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  active: boolean;
  onOpen: (slug: string) => void;
  emphasize?: boolean;
}

function LinkChip({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className="glass-chip inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-slate-200 transition hover:-translate-y-0.5 hover:border-slate-400/90 hover:bg-slate-800/95"
      onClick={(event) => event.stopPropagation()}
    >
      {label}
      <ExternalLink size={12} />
    </Link>
  );
}

export function ProjectCard({ project, active, onOpen, emphasize }: ProjectCardProps) {
  return (
    <motion.article
      layout
      className={cn(
        "glass-panel group relative rounded-3xl p-4 sm:p-5",
        active ? "border-amber-300/50" : "border-slate-700/80"
      )}
      animate={{
        y: active ? -4 : 0,
        scale: active ? 1 : 0.992
      }}
      transition={{ duration: 0.38, ease: [0.2, 0.9, 0.2, 1] }}
      data-project-card={project.slug}
      id={`project-${project.slug}`}
      aria-labelledby={`project-title-${project.slug}`}
      style={{ scrollSnapAlign: "center" }}
    >
      <div className="relative mb-4 overflow-hidden rounded-2xl border border-slate-500/70">
        <button
          type="button"
          onClick={() => onOpen(project.slug)}
          className="absolute inset-0 z-10 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          aria-label={`Öppna projekt: ${project.title}`}
        />

        <motion.div layoutId={`project-cover-${project.slug}`} className="relative aspect-[16/9]">
          {project.visuals.coverUrl ? (
            <Image
              src={project.visuals.coverUrl}
              alt={`Omslag för ${project.title}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 40vw"
              className={cn(
                "hub-media object-cover transition duration-700",
                active ? "scale-[1.05]" : "scale-100 group-hover:scale-[1.03]"
              )}
              priority={emphasize}
            />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_24%_24%,rgba(85,153,255,0.4),rgba(18,35,65,0.9)_55%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/34 to-transparent" />
        </motion.div>
      </div>

      <div className="flex min-h-[248px] flex-col">
        <div className="mb-3 flex items-start justify-between gap-3">
          <motion.h3
            layoutId={`project-title-${project.slug}`}
            id={`project-title-${project.slug}`}
            className="text-2xl font-semibold leading-tight text-slate-100"
          >
            {project.title}
          </motion.h3>
          <span className={mapStatusBadgeClass(project.status)}>{STATUS_LABELS[project.status]}</span>
        </div>

        <p className="max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">{project.shortDescription}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="glass-chip px-2.5 py-1 text-[11px] font-medium text-slate-300">
              #{tag}
            </span>
          ))}
          {project.techStack.slice(0, 3).map((tech) => (
            <span key={tech} className="glass-chip border-blue-300/35 bg-blue-500/14 px-2.5 py-1 text-[11px] text-blue-100">
              {tech}
            </span>
          ))}
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-5">
          <div className="flex flex-wrap items-center gap-2">
            {project.links.demoUrl ? <LinkChip href={project.links.demoUrl} label="Demo" /> : null}
            {project.links.repoUrl ? <LinkChip href={project.links.repoUrl} label="Repo" /> : null}
            {project.links.caseStudyUrl ? <LinkChip href={project.links.caseStudyUrl} label="Case" /> : null}
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onOpen(project.slug)}
              className="btn-secondary-dark px-3 py-1.5 text-xs"
            >
              Öppna
            </button>

            <Link href={`/projects/${project.slug}`} className="btn-primary-amber px-3 py-1.5 text-xs">
              Full vy
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
