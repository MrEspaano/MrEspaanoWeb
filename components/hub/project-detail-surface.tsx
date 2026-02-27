"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { Project } from "@/lib/types";
import { cn, mapStatusBadgeClass } from "@/lib/utils";

interface ProjectDetailSurfaceProps {
  project: Project;
  mode: "modal" | "route";
  onClose?: () => void;
}

function ExternalProjectLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className="glass-chip inline-flex px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-white/90"
    >
      {label}
    </Link>
  );
}

export function ProjectDetailSurface({ project, mode, onClose }: ProjectDetailSurfaceProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.985 }}
      transition={{
        type: "spring",
        stiffness: 180,
        damping: 24,
        mass: 0.9
      }}
      className="glass-elevated relative overflow-hidden rounded-[1.9rem] p-4 sm:p-8"
    >
      {mode === "modal" && onClose ? (
        <button
          type="button"
          aria-label="Stäng projektvy"
          onClick={onClose}
          className="glass-chip absolute right-4 top-4 z-10 p-2.5 text-slate-700 transition hover:-translate-y-0.5 hover:bg-white/90"
        >
          <X size={16} />
        </button>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[1.16fr_1fr]">
        <div>
          <motion.div
            layoutId={mode === "modal" ? `project-cover-${project.slug}` : undefined}
            className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/30"
          >
            {project.visuals.coverUrl ? (
              <Image
                src={project.visuals.coverUrl}
                alt={`Omslag för ${project.title}`}
                fill
                className="hub-media object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
              />
            ) : (
              <div className="h-full w-full bg-[radial-gradient(circle_at_24%_20%,rgba(224,247,255,0.68),rgba(70,93,151,0.42)_36%,rgba(36,52,92,0.88)_72%)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-sky-100/14 via-transparent to-transparent" />
          </motion.div>

          {project.visuals.galleryUrls?.length ? (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {project.visuals.galleryUrls.slice(0, 4).map((src) => (
                <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/25">
                  <Image src={src} alt="Projektgalleri" fill sizes="30vw" className="hub-media object-cover" />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <motion.h2
            layoutId={mode === "modal" ? `project-title-${project.slug}` : undefined}
            className="text-3xl font-bold leading-tight text-slate-800 sm:text-4xl"
          >
            {project.title}
          </motion.h2>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="glass-chip border-sky-300/75 bg-sky-100/85 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-800">
              {CATEGORY_LABELS[project.category]}
            </span>
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                mapStatusBadgeClass(project.status)
              )}
            >
              {STATUS_LABELS[project.status]}
            </span>
          </div>

          <p className="mt-5 text-base leading-relaxed text-slate-700">{project.longDescription}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span key={tag} className="glass-chip px-3 py-1 text-xs font-medium text-slate-600">
                #{tag}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="glass-chip border-sky-200/70 bg-white/85 px-3 py-1 text-xs font-medium text-slate-700"
              >
                {tech}
              </span>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            {project.links.demoUrl ? <ExternalProjectLink href={project.links.demoUrl} label="Öppna demo" /> : null}
            {project.links.repoUrl ? <ExternalProjectLink href={project.links.repoUrl} label="Se repo" /> : null}
            {project.links.caseStudyUrl ? (
              <ExternalProjectLink href={project.links.caseStudyUrl} label="Läs case" />
            ) : null}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
