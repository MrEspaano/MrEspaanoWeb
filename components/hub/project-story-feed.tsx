"use client";

import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { Project } from "@/lib/types";
import { ProjectCard } from "@/components/hub/project-card";

interface ProjectStoryFeedProps {
  projects: Project[];
  onOpenProject: (slug: string) => void;
  title?: string;
  subtitle?: string;
}

export function ProjectStoryFeed({ projects, onOpenProject, title, subtitle }: ProjectStoryFeedProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 60%", "end 38%"]
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (!projects.length) {
      return;
    }

    const next = Math.round(value * (projects.length - 1));
    const bounded = Math.max(0, Math.min(projects.length - 1, next));
    setActiveIndex(bounded);
  });

  const activeProgress = useMemo(() => {
    if (!projects.length) {
      return 0;
    }

    return (activeIndex + 1) / projects.length;
  }, [activeIndex, projects.length]);

  const activeProject = projects[activeIndex] ?? null;

  return (
    <section ref={sectionRef} className="relative py-16 sm:py-20" aria-label={title ?? "Projektfeed"}>
      <div className="section-shell">
        <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)] xl:gap-8">
          <div className="xl:sticky xl:top-24 xl:h-fit">
            <div className="glass-elevated rounded-[2rem] p-5 sm:p-6">
              <p className="text-[11px] uppercase tracking-[0.24em] text-blue-100/78">Story feed</p>
              {title ? <h2 className="mt-3 text-3xl font-semibold text-slate-100 sm:text-4xl">{title}</h2> : null}
              {subtitle ? (
                <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">{subtitle}</p>
              ) : null}

              <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-slate-950/42 p-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Aktiv position</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-100">
                      {String(Math.min(activeIndex + 1, Math.max(projects.length, 1))).padStart(2, "0")}
                    </p>
                  </div>
                  <div className="glass-chip px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-slate-200">
                    {projects.length} case
                  </div>
                </div>

                <div className="mt-5 h-1.5 rounded-full bg-slate-800/90">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-amber-300 via-orange-300 to-blue-400"
                    animate={{ width: `${activeProgress * 100}%` }}
                    transition={{ duration: 0.3, ease: [0.2, 0.9, 0.2, 1] }}
                  />
                </div>

                {activeProject ? (
                  <div className="mt-5">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-blue-100/72">Nu i fokus</p>
                    <p className="mt-2 text-lg font-semibold text-slate-100">{activeProject.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">{activeProject.shortDescription}</p>
                  </div>
                ) : null}
              </div>

              <div className="mt-5 space-y-2.5">
                {projects.slice(0, 5).map((project, index) => (
                  <div
                    key={project.id}
                    className={`rounded-[1.2rem] border px-4 py-3 transition ${
                      index === activeIndex
                        ? "border-blue-300/30 bg-blue-500/10 text-slate-100"
                        : "border-white/8 bg-slate-950/28 text-slate-400"
                    }`}
                  >
                    <p className="text-[11px] uppercase tracking-[0.18em]">{String(index + 1).padStart(2, "0")}</p>
                    <p className="mt-1 text-sm font-medium">{project.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-elevated relative rounded-[2rem] p-3 sm:p-4">
            {projects.length ? (
              <div className="space-y-5 [scroll-snap-type:y_proximity]">
                {projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0.42, y: 26 }}
                    animate={{
                      opacity: index === activeIndex ? 1 : 0.84,
                      y: index === activeIndex ? 0 : 10
                    }}
                    transition={{ duration: 0.36, ease: [0.2, 0.9, 0.2, 1] }}
                  >
                    <ProjectCard
                      project={project}
                      active={index === activeIndex}
                      onOpen={onOpenProject}
                      emphasize={index <= 1}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="glass-panel rounded-[1.75rem] px-6 py-12 text-center">
                <p className="text-[11px] uppercase tracking-[0.22em] text-blue-100/78">Empty state</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-100">Ingen träff för nuvarande filter</h3>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                  Justera sökningen eller filtren för att visa projekt i feeden igen.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
