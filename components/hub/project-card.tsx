"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/constants";
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
      className="glass-chip inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:-translate-y-0.5"
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
        "glass-panel group relative overflow-hidden rounded-[2rem] p-4 sm:p-5",
        active ? "border-blue-300/32 shadow-[0_32px_92px_rgba(7,14,28,0.58)]" : "border-white/8"
      )}
      animate={{
        y: active ? -6 : 0,
        scale: active ? 1 : 0.992
      }}
      transition={{ duration: 0.38, ease: [0.2, 0.9, 0.2, 1] }}
      data-project-card={project.slug}
      id={`project-${project.slug}`}
      aria-labelledby={`project-title-${project.slug}`}
      style={{ scrollSnapAlign: "center" }}
    >
      <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_72%)]" />

      <div className="grid gap-5 lg:grid-cols-[minmax(300px,0.96fr)_minmax(0,1.04fr)] lg:gap-6">
        <div className="relative overflow-hidden rounded-[1.6rem] border border-white/10">
          <button
            type="button"
            onClick={() => onOpen(project.slug)}
            className="absolute inset-0 z-10 rounded-[1.6rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            aria-label={`Öppna projekt: ${project.title}`}
          />

          <motion.div layoutId={`project-cover-${project.slug}`} className="relative aspect-[16/11]">
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
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,8,22,0.06),rgba(3,8,22,0.16)_46%,rgba(2,6,23,0.84)_100%)]" />
          </motion.div>

          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
            <div className="glass-chip px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-slate-200">
              {CATEGORY_LABELS[project.category]}
            </div>
            <span className={mapStatusBadgeClass(project.status)}>{STATUS_LABELS[project.status]}</span>
          </div>

          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
            <div className="glass-chip px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-slate-200">
              {new Date(project.createdAt).getFullYear()}
            </div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-blue-100/78">
              {project.techStack.slice(0, 2).join(" / ")}
            </div>
          </div>
        </div>

        <div className="flex min-h-[248px] flex-col">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-blue-100/78">Featured narrative</p>
              <motion.h3
                layoutId={`project-title-${project.slug}`}
                id={`project-title-${project.slug}`}
                className="mt-2 text-[1.9rem] font-semibold leading-[1.02] text-slate-100 sm:text-[2.2rem]"
              >
                {project.title}
              </motion.h3>
            </div>
            <div className="hidden rounded-full border border-white/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-slate-300 sm:block">
              {project.tags.length} tags
            </div>
          </div>

          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">{project.shortDescription}</p>

          <div className="mt-5 flex flex-wrap gap-1.5">
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

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.3rem] border border-white/8 bg-slate-950/32 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Positionering</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Byggt för att kännas som ett tydligt case, inte bara ett listobjekt.
              </p>
            </div>
            <div className="rounded-[1.3rem] border border-white/8 bg-slate-950/32 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Output</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Öppna i modal för snabb granskning eller gå till full vy för mer kontext.
              </p>
            </div>
          </div>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-6">
            <div className="flex flex-wrap items-center gap-2">
              {project.links.demoUrl ? <LinkChip href={project.links.demoUrl} label="Demo" /> : null}
              {project.links.repoUrl ? <LinkChip href={project.links.repoUrl} label="Repo" /> : null}
              {project.links.caseStudyUrl ? <LinkChip href={project.links.caseStudyUrl} label="Case" /> : null}
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => onOpen(project.slug)} className="btn-secondary-dark px-3 py-1.5 text-xs">
                Öppna
              </button>

              <Link href={`/projects/${project.slug}`} className="btn-primary-amber gap-1.5 px-3 py-1.5 text-xs">
                Full vy
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
