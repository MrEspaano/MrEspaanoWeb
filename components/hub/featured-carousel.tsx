"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Project } from "@/lib/types";

interface FeaturedCarouselProps {
  projects: Project[];
}

export function FeaturedCarousel({ projects }: FeaturedCarouselProps) {
  const featured = projects.slice(0, 4);

  return (
    <section className="section-shell py-12 sm:py-14" aria-label="Utvalda projekt">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-slate-800 sm:text-3xl">Utvalda projekt</h2>
        <Link
          href="/projects"
          className="glass-chip px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-white/88"
        >
          Se alla projekt
        </Link>
      </div>

      <div className="glass-elevated rounded-[2rem] p-3 sm:p-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((project, index) => (
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
              className={`glass-panel flex h-full flex-col rounded-3xl p-4 sm:p-5 ${
                index === 0 ? "md:col-span-2 xl:col-span-2" : ""
              }`}
            >
              <div
                className={`relative mb-4 overflow-hidden rounded-2xl border border-white/[0.26] ${
                  index === 0 ? "aspect-[16/8.8]" : "aspect-[4/3]"
                }`}
              >
                {project.visuals.coverUrl ? (
                  <Image
                    src={project.visuals.coverUrl}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 40vw"
                    className="hub-media object-cover transition duration-700 hover:scale-[1.045]"
                  />
                ) : (
                  <div className="h-full w-full bg-[radial-gradient(circle_at_22%_24%,rgba(233,249,255,0.82),rgba(129,176,225,0.42)_42%,rgba(90,125,179,0.5)_78%)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-sky-100/30 to-transparent" />
              </div>

              <div className="flex flex-1 flex-col">
                <h3 className={`font-semibold leading-tight text-slate-800 ${index === 0 ? "text-3xl" : "text-[1.55rem]"}`}>
                  {project.title}
                </h3>
                <p className={`mt-2 leading-relaxed text-slate-600 ${index === 0 ? "line-clamp-3 text-base" : "line-clamp-2 text-sm"}`}>
                  {project.shortDescription}
                </p>

                <div className="mt-4 flex flex-1 items-end justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="glass-chip px-2.5 py-1 text-[11px] font-medium text-slate-600">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/projects?project=${project.slug}`}
                    className="glass-chip whitespace-nowrap px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-white/90"
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
