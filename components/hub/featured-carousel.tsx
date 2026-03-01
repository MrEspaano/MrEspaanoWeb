"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Project } from "@/lib/types";

interface FeaturedCarouselProps {
  projects: Project[];
}

export function FeaturedCarousel({ projects }: FeaturedCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const featured = useMemo(() => projects.slice(0, 10), [projects]);

  function handlePointerMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!featured.length) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const relativeX = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
    const progress = rect.width > 0 ? relativeX / rect.width : 0;
    const nextIndex = Math.min(featured.length - 1, Math.floor(progress * featured.length));

    if (nextIndex !== activeIndex) {
      setActiveIndex(nextIndex);
    }
  }

  return (
    <section className="section-shell py-12 sm:py-14" aria-label="Utvalda projekt">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl font-semibold text-slate-100 sm:text-4xl">Utvalda projekt</h2>
        <Link href="/projects" className="btn-secondary-dark px-4 py-2 text-sm">
          Se alla projekt
        </Link>
      </div>

      <div className="glass-elevated rounded-[2rem] p-3 sm:p-4">
        <div
          className="hidden h-[520px] gap-3 overflow-hidden md:flex"
          onMouseMove={handlePointerMove}
          onMouseLeave={() => setActiveIndex((current) => Math.min(current, Math.max(0, featured.length - 1)))}
        >
          {featured.map((project, index) => {
            const isActive = index === activeIndex;
            return (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                animate={{
                  flex: isActive ? 7 : 1,
                  opacity: isActive ? 1 : 0.18,
                  scale: isActive ? 1 : 0.92,
                  filter: isActive ? "blur(0px)" : "blur(0.7px)"
                }}
                transition={{ duration: 0.32, ease: [0.2, 0.9, 0.2, 1], delay: index * 0.03 }}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                className="glass-panel relative flex min-w-[68px] flex-col overflow-hidden rounded-3xl"
              >
                <div className="relative h-full w-full">
                  {project.visuals.coverUrl ? (
                    <Image
                      src={project.visuals.coverUrl}
                      alt={project.title}
                      fill
                      sizes="(max-width: 1280px) 85vw, 70vw"
                      className="hub-media object-cover transition duration-700"
                    />
                  ) : (
                    <div className="h-full w-full bg-[radial-gradient(circle_at_24%_20%,rgba(67,145,255,0.44),rgba(17,32,62,0.9)_52%)]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent" />
                </div>

                <motion.div
                  className="absolute inset-x-0 bottom-0 p-5"
                  animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
                  transition={{ duration: 0.22 }}
                >
                  <h3 className="text-[1.65rem] font-semibold leading-tight text-slate-100">{project.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-300">{project.shortDescription}</p>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="glass-chip px-2.5 py-1 text-[11px] font-medium text-slate-300">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <Link href={`/projects?project=${project.slug}`} className="btn-secondary-dark px-3 py-1.5 text-xs">
                      Öppna
                    </Link>
                  </div>
                </motion.div>
              </motion.article>
            );
          })}
        </div>

        <div className="grid gap-4 md:hidden">
          {featured.slice(0, 3).map((project) => (
            <article key={project.id} className="glass-panel flex h-full flex-col rounded-3xl p-4 sm:p-5">
              <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-2xl border border-slate-500/70">
                {project.visuals.coverUrl ? (
                  <Image
                    src={project.visuals.coverUrl}
                    alt={project.title}
                    fill
                    sizes="100vw"
                    className="hub-media object-cover transition duration-700"
                  />
                ) : (
                  <div className="h-full w-full bg-[radial-gradient(circle_at_24%_20%,rgba(67,145,255,0.44),rgba(17,32,62,0.9)_52%)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 to-transparent" />
              </div>

              <div className="flex flex-1 flex-col">
                <h3 className="text-[1.65rem] font-semibold leading-tight text-slate-100">{project.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-300">{project.shortDescription}</p>

                <div className="mt-4 flex flex-1 items-end justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="glass-chip px-2.5 py-1 text-[11px] font-medium text-slate-300">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <Link href={`/projects?project=${project.slug}`} className="btn-secondary-dark px-3 py-1.5 text-xs">
                    Öppna
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
