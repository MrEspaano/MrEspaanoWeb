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
      className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 transition hover:border-white/35 hover:bg-white/20"
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
        "group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.12] to-white/[0.04] p-4 shadow-card sm:p-5",
        active ? "ring-2 ring-accent/50" : "ring-1 ring-transparent"
      )}
      animate={{
        y: active ? -2 : 0,
        scale: active ? 1 : 0.985
      }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      data-project-card={project.slug}
      id={`project-${project.slug}`}
      aria-labelledby={`project-title-${project.slug}`}
      style={{ scrollSnapAlign: "center" }}
    >
      <button
        type="button"
        onClick={() => onOpen(project.slug)}
        className="absolute inset-0 z-20 rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label={`Öppna projekt: ${project.title}`}
      />

      <div className="pointer-events-none relative z-10">
        <motion.div
          layoutId={`project-cover-${project.slug}`}
          className="relative mb-4 aspect-[16/9] overflow-hidden rounded-2xl border border-white/10"
        >
          {project.visuals.coverUrl ? (
            <Image
              src={project.visuals.coverUrl}
              alt={`Omslag för ${project.title}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 40vw"
              className={cn(
                "object-cover transition duration-500",
                active ? "scale-[1.04]" : "scale-100 group-hover:scale-[1.03]"
              )}
              priority={emphasize}
            />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(118,211,255,0.5),rgba(20,28,48,0.85)_45%),linear-gradient(140deg,rgba(255,130,161,0.32),rgba(16,24,48,0.92))]" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-white/5" />
        </motion.div>

        <div className="mb-3 flex items-start justify-between gap-3">
          <motion.h3
            layoutId={`project-title-${project.slug}`}
            id={`project-title-${project.slug}`}
            className="text-xl font-semibold text-white sm:text-2xl"
          >
            {project.title}
          </motion.h3>
          <span
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
              mapStatusBadgeClass(project.status)
            )}
          >
            {STATUS_LABELS[project.status]}
          </span>
        </div>

        <p
          className={cn(
            "max-w-3xl text-sm leading-relaxed text-white/78 transition duration-500 sm:text-base",
            active ? "translate-y-0 opacity-100" : "translate-y-2 opacity-80"
          )}
        >
          {project.shortDescription}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs text-white/80">
              #{tag}
            </span>
          ))}
          {project.techStack.slice(0, 3).map((tech) => (
            <span key={tech} className="rounded-full border border-cyan-200/25 bg-cyan-200/12 px-3 py-1 text-xs text-cyan-100">
              {tech}
            </span>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {project.links.demoUrl ? <LinkChip href={project.links.demoUrl} label="Demo" /> : null}
          {project.links.repoUrl ? <LinkChip href={project.links.repoUrl} label="Repo" /> : null}
          {project.links.caseStudyUrl ? <LinkChip href={project.links.caseStudyUrl} label="Case" /> : null}

          <Link
            href={`/projects/${project.slug}`}
            className="pointer-events-auto ml-auto inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:border-white/35 hover:bg-white/20"
          >
            Full vy
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
