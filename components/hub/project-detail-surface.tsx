"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
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
    <Link href={href} target="_blank" rel="noreferrer" className="btn-secondary-dark gap-1.5 px-4 py-2 text-sm">
      {label}
      <ArrowUpRight size={15} />
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
        stiffness: 220,
        damping: 28,
        mass: 0.82
      }}
      className="glass-elevated relative overflow-hidden rounded-[2rem] p-4 sm:p-6 lg:p-8"
    >
      {mode === "modal" && onClose ? (
        <button
          type="button"
          aria-label="Stäng projektvy"
          onClick={onClose}
          className="glass-chip absolute right-4 top-4 z-10 p-2.5 text-slate-100 transition hover:-translate-y-0.5"
        >
          <X size={16} />
        </button>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.14fr)_minmax(360px,0.86fr)]">
        <div>
          <motion.div
            layoutId={mode === "modal" ? `project-cover-${project.slug}` : undefined}
            className="relative aspect-[16/10] overflow-hidden rounded-[1.8rem] border border-white/10"
          >
            {project.visuals.coverUrl ? (
              <Image
                src={project.visuals.coverUrl}
                alt={`Omslag för ${project.title}`}
                fill
                className="hub-media object-cover"
                sizes="(max-width: 1280px) 100vw, 60vw"
                priority
              />
            ) : (
              <div className="h-full w-full bg-[radial-gradient(circle_at_24%_20%,rgba(82,150,255,0.4),rgba(17,32,62,0.9)_52%)]" />
            )}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,8,22,0.04),rgba(3,8,22,0.14)_36%,rgba(2,6,23,0.84)_100%)]" />

            <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
              <span className="glass-chip border-blue-300/40 bg-blue-500/14 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-100">
                {CATEGORY_LABELS[project.category]}
              </span>
              <span className={cn(mapStatusBadgeClass(project.status))}>{STATUS_LABELS[project.status]}</span>
            </div>
          </motion.div>

          {project.visuals.galleryUrls?.length ? (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {project.visuals.galleryUrls.slice(0, 4).map((src) => (
                <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] border border-white/10">
                  <Image src={src} alt="Projektgalleri" fill sizes="30vw" className="hub-media object-cover" />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-blue-100/78">Project detail</p>
          <motion.h2
            layoutId={mode === "modal" ? `project-title-${project.slug}` : undefined}
            className="mt-3 text-[clamp(2.2rem,4.5vw,4rem)] font-semibold leading-[0.96] text-slate-100"
          >
            {project.title}
          </motion.h2>

          <p className="mt-5 text-base leading-relaxed text-slate-300">{project.longDescription}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/36 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Tags</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span key={tag} className="glass-chip px-3 py-1 text-xs font-medium text-slate-300">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/36 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Tech stack</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span key={tech} className="glass-chip border-blue-300/35 bg-blue-500/14 px-3 py-1 text-xs font-medium text-blue-100">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-slate-950/36 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Presentation</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Designad för snabb skimming i modal men också tillräckligt stark för att bära en full route utan att tappa premiumkänslan.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            {project.links.demoUrl ? <ExternalProjectLink href={project.links.demoUrl} label="Öppna demo" /> : null}
            {project.links.repoUrl ? <ExternalProjectLink href={project.links.repoUrl} label="Se repo" /> : null}
            {project.links.caseStudyUrl ? <ExternalProjectLink href={project.links.caseStudyUrl} label="Läs case" /> : null}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
