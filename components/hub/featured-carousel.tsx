"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { Project } from "@/lib/types";

interface FeaturedCarouselProps {
  projects: Project[];
}

export function FeaturedCarousel({ projects }: FeaturedCarouselProps) {
  const featured = projects.slice(0, 3);
  const slots = [featured[0] ?? null, featured[1] ?? null, featured[2] ?? null];
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="section-shell py-12 sm:py-14" aria-label="Utvalda projekt">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl font-semibold text-slate-100 sm:text-4xl">Utvalda projekt</h2>
        <Link href="/projects" className="btn-secondary-dark px-4 py-2 text-sm">
          Se alla projekt
        </Link>
      </div>

      <div className="glass-elevated rounded-[2rem] p-3 sm:p-4">
        <div className="grid gap-4 md:grid-cols-3">
          {slots.map((project, index) => {
            const isHovered = hoveredIndex === index;
            const isOther = hoveredIndex !== null && hoveredIndex !== index;

            return (
              <motion.article
                key={project?.id ?? `placeholder-${index}`}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                animate={{
                  scale: isHovered ? 1.05 : isOther ? 0.97 : 1,
                  y: isHovered ? -8 : 0,
                  zIndex: isHovered ? 20 : 1
                }}
                transition={{ duration: 0.32, ease: [0.2, 0.9, 0.2, 1], delay: index * 0.05 }}
                className="glass-panel flex h-full flex-col rounded-3xl p-4 sm:p-5"
              >
                {project ? (
                  <>
                    <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-2xl border border-slate-500/70">
                      {project.visuals.coverUrl ? (
                        <Image
                          src={project.visuals.coverUrl}
                          alt={project.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 40vw"
                          className="hub-media object-cover transition duration-700 hover:scale-[1.04]"
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
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-600/80 bg-slate-900/55 p-6 text-center">
                    <p className="text-base font-semibold text-slate-100">Fler projekt här</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">Lägg till ett projekt i admin för att fylla tredje platsen.</p>
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
