"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useMemo, useState } from "react";
import { CATEGORY_LABELS } from "@/lib/constants";
import { Project, ProjectCategoryFilter, SiteSettings } from "@/lib/types";
import { FeaturedCarousel } from "@/components/hub/featured-carousel";
import { ProjectDetailModal } from "@/components/hub/project-detail-modal";
import { ProjectStoryFeed } from "@/components/hub/project-story-feed";
import { StickyCategoryMorph } from "@/components/hub/sticky-category-morph";
import { TextRevealSection } from "@/components/hub/text-reveal-section";

interface HomeHubProps {
  projects: Project[];
  settings: SiteSettings;
}

export function HomeHub({ projects, settings }: HomeHubProps) {
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategoryFilter>("all");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const { scrollY } = useScroll();

  const orbY1 = useTransform(scrollY, [0, 900], [0, -50]);
  const orbY2 = useTransform(scrollY, [0, 900], [0, -90]);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === "all") {
      return projects;
    }

    return projects.filter((project) => project.category === selectedCategory);
  }, [projects, selectedCategory]);

  const selectedProject = useMemo(
    () => filteredProjects.find((project) => project.slug === selectedSlug) ?? null,
    [filteredProjects, selectedSlug]
  );

  return (
    <main className="relative min-h-screen overflow-x-clip pb-20">
      <motion.div
        style={{ y: orbY1 }}
        className="pointer-events-none absolute -top-24 left-[8%] h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl"
      />
      <motion.div
        style={{ y: orbY2 }}
        className="pointer-events-none absolute -top-20 right-[12%] h-64 w-64 rounded-full bg-rose-300/20 blur-3xl"
      />

      <header className="section-shell relative z-20 pt-7">
        <div className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-2xl px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/80">Personal Hub</p>
            <p className="text-lg font-semibold text-white">{settings.displayName}</p>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            <Link
              href="/projects"
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/20"
            >
              Alla projekt
            </Link>
            <Link
              href="/admin"
              className="rounded-full border border-cyan-200/40 bg-cyan-200/20 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:border-cyan-200/70"
            >
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <section className="section-shell relative z-10 pt-16 sm:pt-20">
        <div className="max-w-4xl">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/80">Hypermodern showcase</p>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.04] text-white sm:text-6xl lg:text-7xl">
            {settings.tagline}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/75">{settings.bio}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="#home-feed"
              className="rounded-full border border-cyan-200/60 bg-cyan-200/25 px-6 py-3 text-sm font-semibold text-cyan-50 transition hover:border-cyan-100"
            >
              {settings.heroCtaPrimary}
            </Link>
            <Link
              href="/projects"
              className="rounded-full border border-white/20 bg-white/8 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/14"
            >
              {settings.heroCtaSecondary}
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-3 text-xs text-white/65">
            <span className="rounded-full border border-white/15 bg-white/6 px-3 py-1">{CATEGORY_LABELS.app}</span>
            <span className="rounded-full border border-white/15 bg-white/6 px-3 py-1">{CATEGORY_LABELS.game}</span>
            <span className="rounded-full border border-white/15 bg-white/6 px-3 py-1">{CATEGORY_LABELS.site}</span>
          </div>
        </div>
      </section>

      <StickyCategoryMorph selected={selectedCategory} onSelect={setSelectedCategory} />

      <FeaturedCarousel projects={filteredProjects} />

      <TextRevealSection text="Varje projekt ska kännas som en story: tydlig riktning, precision i detaljer och rörelse som guidar upplevelsen istället för att distrahera." />

      <div id="home-feed" />
      <ProjectStoryFeed
        projects={filteredProjects.slice(0, 8)}
        onOpenProject={setSelectedSlug}
        title="Projekt-feed"
        subtitle="Scrollen styr progressionen: aktivt kort får fokus, media rör sig subtilt och metadata glider in med timing."
      />

      <ProjectDetailModal project={selectedProject} isOpen={Boolean(selectedProject)} onClose={() => setSelectedSlug(null)} />
    </main>
  );
}
