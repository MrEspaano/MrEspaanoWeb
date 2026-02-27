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
    <section className="section-shell py-10" aria-label="Utvalda projekt">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">Featured</h2>
        <Link
          href="/projects"
          className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/20"
        >
          Se alla projekt
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {projects.slice(0, 3).map((project) => (
          <motion.div
            key={project.id}
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel group relative overflow-hidden rounded-3xl p-4"
          >
            <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-2xl border border-white/10">
              {project.visuals.coverUrl ? (
                <Image
                  src={project.visuals.coverUrl}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.04]"
                />
              ) : (
                <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(118,211,255,0.5),rgba(20,28,48,0.85)_45%),linear-gradient(140deg,rgba(255,130,161,0.32),rgba(16,24,48,0.92))]" />
              )}
            </div>

            <h3 className="text-xl font-semibold text-white">{project.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm text-white/72">{project.shortDescription}</p>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {project.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="rounded-full border border-white/20 bg-white/8 px-2 py-1 text-[11px] text-white/80">
                    #{tag}
                  </span>
                ))}
              </div>

              <Link
                href={`/projects?project=${project.slug}`}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:border-white/35 hover:bg-white/20"
              >
                Öppna
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
