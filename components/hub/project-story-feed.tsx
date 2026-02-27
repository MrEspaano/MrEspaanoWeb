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
    offset: ["start 60%", "end 40%"]
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

  return (
    <section ref={sectionRef} className="relative py-14 sm:py-20" aria-label={title ?? "Projektfeed"}>
      <div className="section-shell">
        {(title || subtitle) && (
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              {title ? <h2 className="text-3xl font-bold text-white sm:text-4xl">{title}</h2> : null}
              {subtitle ? <p className="mt-2 max-w-2xl text-sm text-white/70 sm:text-base">{subtitle}</p> : null}
            </div>
            <p className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.16em] text-white/70">
              Scroll-driven
            </p>
          </div>
        )}

        <div className="relative">
          <div className="absolute right-1 top-2 hidden h-[82%] w-px overflow-hidden rounded-full bg-white/15 lg:block">
            <motion.div
              className="w-full origin-top bg-gradient-to-b from-cyan-200 via-white/85 to-emerald-200"
              animate={{ height: `${activeProgress * 100}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>

          <div className="space-y-6 [scroll-snap-type:y_proximity]">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0.45, y: 26 }}
                animate={{
                  opacity: index === activeIndex ? 1 : 0.78,
                  y: index === activeIndex ? 0 : 10
                }}
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
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
        </div>
      </div>
    </section>
  );
}
