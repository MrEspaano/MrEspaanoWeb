"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { Project } from "@/lib/types";
import { mapStatusBadgeClass } from "@/lib/utils";

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
      className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-white/35 hover:bg-white/20"
    >
      {label}
    </Link>
  );
}

export function ProjectDetailSurface({ project, mode, onClose }: ProjectDetailSurfaceProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="glass-panel relative overflow-hidden rounded-3xl p-4 shadow-glass sm:p-8"
    >
      {mode === "modal" && onClose ? (
        <button
          type="button"
          aria-label="Stäng projektvy"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-white/10 p-2 text-white/80 transition hover:border-white/35 hover:text-white"
        >
          <X size={16} />
        </button>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <motion.div
            layoutId={mode === "modal" ? `project-cover-${project.slug}` : undefined}
            className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10"
          >
            {project.visuals.coverUrl ? (
              <Image
                src={project.visuals.coverUrl}
                alt={`Omslag för ${project.title}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
              />
            ) : (
              <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(118,211,255,0.5),rgba(20,28,48,0.85)_45%),linear-gradient(140deg,rgba(255,130,161,0.32),rgba(16,24,48,0.92))]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          </motion.div>

          {project.visuals.galleryUrls?.length ? (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {project.visuals.galleryUrls.slice(0, 4).map((src) => (
                <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10">
                  <Image src={src} alt="Projektgalleri" fill sizes="30vw" className="object-cover" />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <motion.h2
            layoutId={mode === "modal" ? `project-title-${project.slug}` : undefined}
            className="text-3xl font-bold text-white sm:text-4xl"
          >
            {project.title}
          </motion.h2>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-300/40 bg-cyan-300/14 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-100">
              {CATEGORY_LABELS[project.category]}
            </span>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${mapStatusBadgeClass(project.status)}`}
            >
              {STATUS_LABELS[project.status]}
            </span>
          </div>

          <p className="mt-5 text-base leading-relaxed text-white/82">{project.longDescription}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs text-white/82">
                #{tag}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-white/15 bg-white/6 px-3 py-1 text-xs font-medium text-white/85"
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
