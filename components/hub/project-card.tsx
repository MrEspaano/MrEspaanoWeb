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
      className="glass-chip inline-flex items-center gap-1 px-3 py-1 text-xs font-medium transition hover:scale-[1.02]"
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
        active ? "ring-1 ring-cyan-100/75" : "ring-1 ring-transparent"
      )}
      animate={{
        y: active ? -3 : 0,
        scale: active ? 1 : 0.988
      }}
      transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
      data-project-card={project.slug}
      id={`project-${project.slug}`}
      aria-labelledby={`project-title-${project.slug}`}
      style={{ scrollSnapAlign: "center" }}
    >
      <div className="relative mb-4 overflow-hidden rounded-2xl border border-white/[0.28]">
        <button
          type="button"
          onClick={() => onOpen(project.slug)}
          className="absolute inset-0 z-10 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100"
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
                "object-cover transition duration-700",
                active ? "scale-[1.05]" : "scale-100 group-hover:scale-[1.035]"
              )}
              priority={emphasize}
            />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_24%_24%,rgba(221,246,255,0.7),rgba(66,93,147,0.45)_35%,rgba(36,53,95,0.86)_72%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/[0.22] to-transparent" />
        </motion.div>
      </div>

      <div className="flex min-h-[248px] flex-col">
        <div className="mb-3 flex items-start justify-between gap-3">
          <motion.h3
            layoutId={`project-title-${project.slug}`}
            id={`project-title-${project.slug}`}
            className="text-2xl font-semibold leading-tight text-white"
          >
            {project.title}
          </motion.h3>
          <span
            className={cn(
              "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide",
              mapStatusBadgeClass(project.status)
            )}
          >
            {STATUS_LABELS[project.status]}
          </span>
        </div>

        <p className="max-w-3xl text-sm leading-relaxed text-white/[0.84] sm:text-base">{project.shortDescription}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="glass-chip px-2.5 py-1 text-[11px] font-medium text-white/[0.86]">
              #{tag}
            </span>
          ))}
          {project.techStack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="glass-chip border-cyan-50/[0.45] bg-cyan-50/20 px-2.5 py-1 text-[11px] text-cyan-50"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
          {project.links.demoUrl ? <LinkChip href={project.links.demoUrl} label="Demo" /> : null}
          {project.links.repoUrl ? <LinkChip href={project.links.repoUrl} label="Repo" /> : null}
          {project.links.caseStudyUrl ? <LinkChip href={project.links.caseStudyUrl} label="Case" /> : null}

          <button
            type="button"
            onClick={() => onOpen(project.slug)}
            className="glass-chip ml-auto px-3 py-1.5 text-xs font-semibold transition hover:scale-[1.03]"
          >
            Öppna
          </button>

          <Link
            href={`/projects/${project.slug}`}
            className="glass-chip inline-flex px-3 py-1.5 text-xs font-semibold transition hover:scale-[1.03]"
          >
            Full vy
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
