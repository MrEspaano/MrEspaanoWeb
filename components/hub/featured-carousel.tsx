"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { Project } from "@/lib/types";

interface FeaturedCarouselProps {
  projects: Project[];
  forceTouchMode?: boolean;
}

export function FeaturedCarousel({ projects, forceTouchMode = false }: FeaturedCarouselProps) {
  const [activeProgress, setActiveProgress] = useState(0);
  const [interactiveMode, setInteractiveMode] = useState(false);
  const [lockedIndex, setLockedIndex] = useState<number | null>(null);
  const featured = useMemo(() => projects.slice(0, 10), [projects]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const apply = () => setInteractiveMode(media.matches && !forceTouchMode);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [forceTouchMode]);

  function handlePointerMove(event: React.MouseEvent<HTMLDivElement>) {
    if (lockedIndex !== null || !featured.length) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const relativeX = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
    const progress = rect.width > 0 ? relativeX / rect.width : 0;
    const nextProgress = progress * Math.max(0, featured.length - 1);
    setActiveProgress(nextProgress);
  }

  return (
    <section className="section-shell py-12 sm:py-16" aria-label="Utvalda projekt">
      <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-blue-100/78">Selected projects</p>
          <h2 className="mt-3 text-[clamp(2.2rem,5vw,4rem)] font-semibold text-slate-100">Utvalda case med tydligare scenografi</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
            En mer dramatisk featured-yta där varje case får större närvaro, bättre metadata och en tydligare känsla av kuratering.
          </p>
        </div>
        <Link href="/projects" className="btn-secondary-dark w-fit gap-2 px-4 py-2 text-sm">
          Se alla projekt
          <ArrowUpRight size={16} />
        </Link>
      </div>

      <div className="glass-elevated rounded-[2.25rem] p-3 sm:p-4">
        {!featured.length ? (
          <div className="glass-panel rounded-[2rem] px-6 py-12 text-center">
            <p className="text-[11px] uppercase tracking-[0.22em] text-blue-100/78">No projects</p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-100">Inga projekt i det här filtret ännu</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Välj en annan kategori för att se fler case i den visuella showcase-sektionen.
            </p>
          </div>
        ) : null}

        {interactiveMode ? (
          <div
            aria-hidden={!featured.length}
            className="hidden h-[560px] gap-3 overflow-hidden lg:flex"
            onMouseMove={handlePointerMove}
            onMouseLeave={() => setLockedIndex(null)}
          >
            {featured.map((project, index) => {
              const focusValue = lockedIndex ?? activeProgress;
              const distance = Math.abs(index - focusValue);
              const influence = Math.max(0, 1 - Math.min(1, distance));
              const isActive = influence > 0.7;

              return (
                <motion.article
                  key={project.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  animate={{
                    flex: 1 + influence * 6.4,
                    opacity: 0.18 + influence * 0.82,
                    scale: 0.92 + influence * 0.08,
                    filter: `blur(${(1 - influence) * 0.9}px)`
                  }}
                  transition={{ type: "spring", stiffness: 120, damping: 24, mass: 0.7, delay: index * 0.01 }}
                  onMouseEnter={() => {
                    setLockedIndex(index);
                    setActiveProgress(index);
                  }}
                  onMouseMove={() => setLockedIndex(index)}
                  onMouseLeave={() => setLockedIndex(null)}
                  onFocus={() => setActiveProgress(index)}
                  className="glass-panel group relative flex min-w-[84px] flex-col overflow-hidden rounded-[2rem]"
                >
                  <div className="relative h-full w-full">
                    {project.visuals.coverUrl ? (
                      <Image
                        src={project.visuals.coverUrl}
                        alt={project.title}
                        fill
                        sizes="(max-width: 1536px) 80vw, 70vw"
                        className="hub-media object-cover transition duration-700 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="h-full w-full bg-[radial-gradient(circle_at_24%_20%,rgba(67,145,255,0.44),rgba(17,32,62,0.9)_52%)]" />
                    )}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,8,22,0.18),rgba(3,8,22,0.05)_24%,rgba(3,8,22,0.2)_42%,rgba(2,6,23,0.9)_100%)]" />
                  </div>

                  <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
                    <div className="glass-chip px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-slate-200">
                      {CATEGORY_LABELS[project.category]}
                    </div>
                    <div className="glass-chip px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-slate-200">
                      {STATUS_LABELS[project.status]}
                    </div>
                  </div>

                  <motion.div
                    className="absolute inset-x-0 bottom-0 p-5 sm:p-6"
                    animate={{ opacity: isActive ? 1 : 0.08, y: isActive ? 0 : 18 }}
                    transition={{ duration: 0.28, ease: [0.2, 0.9, 0.2, 1] }}
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-blue-100/78">Case {String(index + 1).padStart(2, "0")}</p>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>
                    <h3 className="max-w-[14ch] text-[1.9rem] font-semibold leading-[1.02] text-slate-100">{project.title}</h3>
                    <p className="mt-3 max-w-[28ch] text-sm leading-relaxed text-slate-300">{project.shortDescription}</p>

                    <div className="mt-5 flex items-end justify-between gap-3">
                      <div className="flex flex-wrap gap-1.5">
                        {project.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="glass-chip px-2.5 py-1 text-[11px] font-medium text-slate-300">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <Link href={`/projects?project=${project.slug}`} className="btn-secondary-dark gap-1.5 px-3 py-1.5 text-xs">
                        Öppna
                        <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </motion.div>
                </motion.article>
              );
            })}
          </div>
        ) : null}

        <div
          className={
            interactiveMode
              ? "grid gap-4 lg:hidden"
              : "flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          }
        >
          {(interactiveMode ? featured.slice(0, 3) : featured).map((project, index) => (
            <article
              key={project.id}
              className={
                interactiveMode
                  ? "glass-panel flex h-full flex-col rounded-[2rem] p-4 sm:p-5"
                  : "glass-panel min-w-[86%] snap-center rounded-[2rem] p-4 sm:min-w-[70%]"
              }
            >
              <div className="relative mb-4 aspect-[5/4] overflow-hidden rounded-[1.5rem] border border-white/10">
                {project.visuals.coverUrl ? (
                  <Image
                    src={project.visuals.coverUrl}
                    alt={project.title}
                    fill
                    sizes={interactiveMode ? "100vw" : "84vw"}
                    className="hub-media object-cover transition duration-700"
                  />
                ) : (
                  <div className="h-full w-full bg-[radial-gradient(circle_at_24%_20%,rgba(67,145,255,0.44),rgba(17,32,62,0.9)_52%)]" />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,8,22,0.04),rgba(3,8,22,0.24)_64%,rgba(2,6,23,0.82)_100%)]" />

                <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
                  <span className="glass-chip px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-slate-200">
                    {CATEGORY_LABELS[project.category]}
                  </span>
                  <span className="glass-chip px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-slate-200">
                    {STATUS_LABELS[project.status]}
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-blue-100/78">Case {String(index + 1).padStart(2, "0")}</p>
                </div>
              </div>

              <div className="flex flex-1 flex-col">
                <h3 className="text-2xl font-semibold leading-tight text-slate-100 sm:text-[1.75rem]">{project.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-300">{project.shortDescription}</p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="glass-chip px-2.5 py-1 text-[11px] font-medium text-slate-300">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex flex-1 items-end justify-between gap-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                    {project.techStack.slice(0, 2).join(" / ")}
                  </div>

                  <Link href={`/projects?project=${project.slug}`} className="btn-secondary-dark gap-1.5 px-3 py-1.5 text-xs">
                    Öppna
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
