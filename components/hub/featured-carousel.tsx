"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Project } from "@/lib/types";

interface FeaturedCarouselProps {
  projects: Project[];
}

export function FeaturedCarousel({ projects }: FeaturedCarouselProps) {
  return (
    <section className="section-shell py-10 sm:py-12" aria-label="Utvalda projekt">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">Featured</h2>
        <Link href="/projects" className="glass-chip px-4 py-2 text-sm font-semibold transition hover:scale-[1.02]">
          Se alla projekt
        </Link>
      </div>

      <div className="glass-elevated rounded-[2rem] p-3 sm:p-4">
        <div className="grid gap-4 md:grid-cols-3">
          {projects.slice(0, 3).map((project, index) => (
            <motion.article
              key={project.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              whileHover={{ y: -8, scale: 1.012 }}
              transition={{
                duration: 0.45,
                delay: index * 0.06,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="glass-panel flex h-full flex-col rounded-3xl p-4"
            >
              <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-2xl border border-white/[0.26]">
                {project.visuals.coverUrl ? (
                  <Image
                    src={project.visuals.coverUrl}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="hub-media object-cover transition duration-700 hover:scale-[1.045]"
                  />
                ) : (
                  <div className="h-full w-full bg-[radial-gradient(circle_at_25%_24%,rgba(219,245,255,0.68),rgba(61,91,148,0.45)_38%,rgba(35,48,86,0.84)_72%)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/[0.1] to-transparent" />
              </div>

              <div className="flex flex-1 flex-col">
                <h3 className="text-[1.6rem] font-semibold leading-tight text-white">{project.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/[0.84]">{project.shortDescription}</p>

                <div className="mt-4 flex flex-1 items-end justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="glass-chip px-2.5 py-1 text-[11px] font-medium text-white/[0.88]">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/projects?project=${project.slug}`}
                    className="glass-chip whitespace-nowrap px-3 py-1.5 text-xs font-semibold transition hover:scale-[1.03]"
                  >
                    Öppna
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
