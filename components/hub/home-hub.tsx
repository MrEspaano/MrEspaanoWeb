"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { CSSProperties, ReactNode, useMemo, useState } from "react";
import { HubModuleKey, Project, ProjectCategoryFilter, SiteSettings } from "@/lib/types";
import { FeaturedCarousel } from "@/components/hub/featured-carousel";
import { ProjectDetailModal } from "@/components/hub/project-detail-modal";
import { ProjectStoryFeed } from "@/components/hub/project-story-feed";
import { StickyCategoryMorph } from "@/components/hub/sticky-category-morph";
import { TextRevealSection } from "@/components/hub/text-reveal-section";
import { normalizeHubDesignConfig } from "@/lib/design-config";
import { cn } from "@/lib/utils";

interface HomeHubProps {
  projects: Project[];
  settings: SiteSettings;
  previewMode?: boolean;
}

function toModuleStyle(visible: boolean, opacity: number, scale: number, yOffset: number): CSSProperties {
  return {
    display: visible ? "block" : "none",
    opacity,
    transform: `translateY(${yOffset}px) scale(${scale})`,
    transformOrigin: "top center"
  };
}

export function HomeHub({ projects, settings, previewMode = false }: HomeHubProps) {
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategoryFilter>("all");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const { scrollY } = useScroll();
  const design = normalizeHubDesignConfig(settings.designConfig);

  const orbY1 = useTransform(scrollY, [0, 1200], [0, -140]);
  const orbY2 = useTransform(scrollY, [0, 1200], [0, -200]);
  const orbScale = useTransform(scrollY, [0, 1000], [1, 1.2]);

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

  const displayFontClass = {
    syne: "font-display-syne",
    "space-grotesk": "font-display-space",
    sora: "font-display-sora"
  }[design.global.displayFont];

  const bodyFontClass = {
    manrope: "font-body-manrope",
    inter: "font-body-inter",
    system: "font-body-system"
  }[design.global.bodyFont];

  const modules: Record<HubModuleKey, ReactNode> = {
    stickyCategoryMorph: (
      <div
        style={toModuleStyle(
          design.modules.stickyCategoryMorph.visible,
          design.modules.stickyCategoryMorph.opacity,
          design.modules.stickyCategoryMorph.scale,
          design.modules.stickyCategoryMorph.yOffset
        )}
      >
        <StickyCategoryMorph selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>
    ),
    featured: (
      <div
        style={toModuleStyle(
          design.modules.featured.visible,
          design.modules.featured.opacity,
          design.modules.featured.scale,
          design.modules.featured.yOffset
        )}
      >
        <FeaturedCarousel projects={filteredProjects} />
      </div>
    ),
    textReveal: (
      <div
        style={toModuleStyle(
          design.modules.textReveal.visible,
          design.modules.textReveal.opacity,
          design.modules.textReveal.scale,
          design.modules.textReveal.yOffset
        )}
      >
        <TextRevealSection text="Varje projekt ska kännas som en story: tydlig riktning, precision i detaljer och rörelse som guidar upplevelsen istället för att distrahera." />
      </div>
    ),
    storyFeed: (
      <div
        style={toModuleStyle(
          design.modules.storyFeed.visible,
          design.modules.storyFeed.opacity,
          design.modules.storyFeed.scale,
          design.modules.storyFeed.yOffset
        )}
      >
        <div id="home-feed" />
        <ProjectStoryFeed
          projects={filteredProjects.slice(0, 8)}
          onOpenProject={setSelectedSlug}
          title="Projekt-feed"
          subtitle="Scrollen styr progressionen: aktivt kort får fokus, media rör sig subtilt och metadata glider in med precision."
        />
      </div>
    )
  };

  return (
    <main
      className={cn("hub-root relative min-h-screen overflow-x-clip pb-24", displayFontClass, bodyFontClass)}
      style={
        {
          "--hub-max-width": `${design.global.contentMaxWidth}px`,
          "--hub-media-saturation": String(design.global.mediaSaturation),
          "--hub-media-contrast": String(design.global.mediaContrast),
          "--hub-media-brightness": String(design.global.mediaBrightness)
        } as CSSProperties
      }
    >
      <motion.div
        style={{ y: orbY1, scale: orbScale }}
        className="pointer-events-none absolute -top-16 left-[6%] h-72 w-72 rounded-full bg-cyan-100/40 blur-[90px]"
      />
      <motion.div
        style={{ y: orbY2, scale: orbScale }}
        className="pointer-events-none absolute -top-10 right-[8%] h-80 w-80 rounded-full bg-violet-100/[0.32] blur-[110px]"
      />

      <header className="section-shell relative z-20 pt-7 sm:pt-9">
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="glass-elevated flex items-center justify-between gap-4 rounded-[1.5rem] px-4 py-3 sm:px-6"
        >
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/[0.72]">Personal Hub</p>
            <p className="text-lg font-semibold text-white/[0.96]">{settings.displayName}</p>
          </div>

          <nav className="flex items-center gap-2">
            <Link href="/projects" className="glass-chip px-4 py-2 text-sm font-semibold transition hover:scale-[1.02]">
              Alla projekt
            </Link>
            {!previewMode ? (
              <Link
                href="/admin"
                className="rounded-full border border-cyan-100/70 bg-cyan-100/[0.32] px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-100/50"
              >
                Admin
              </Link>
            ) : null}
          </nav>
        </motion.div>
      </header>

      <section
        className="section-shell relative z-10 pt-12 sm:pt-16"
        style={{ maxWidth: `${design.hero.maxWidth}px`, opacity: design.hero.opacity }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl"
        >
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-50/[0.78]">Hypermodern showcase</p>
          <h1
            className="mt-4 text-4xl font-bold leading-[1.03] text-white sm:text-5xl lg:text-6xl"
            style={{ transform: `scale(${design.hero.titleScale})`, transformOrigin: "left top" }}
          >
            {settings.tagline}
          </h1>
          <p
            className="mt-5 max-w-3xl text-lg leading-relaxed text-white/[0.84]"
            style={{ transform: `scale(${design.hero.bodyScale})`, transformOrigin: "left top" }}
          >
            {settings.bio}
          </p>

          <div
            className="mt-8 flex flex-wrap items-center gap-3"
            style={{ transform: `scale(${design.hero.ctaScale})`, transformOrigin: "left center" }}
          >
            <Link
              href="#home-feed"
              className="rounded-full border border-cyan-100/70 bg-cyan-100/[0.34] px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-100/[0.55]"
            >
              {settings.heroCtaPrimary}
            </Link>
            <Link href="/projects" className="glass-chip px-6 py-3 text-sm font-semibold transition hover:scale-[1.02]">
              {settings.heroCtaSecondary}
            </Link>
          </div>
        </motion.div>
      </section>

      {design.modules.order.map((moduleKey) => (
        <div key={moduleKey}>{modules[moduleKey]}</div>
      ))}

      <ProjectDetailModal
        project={selectedProject}
        isOpen={Boolean(selectedProject) && !previewMode}
        onClose={() => setSelectedSlug(null)}
      />
    </main>
  );
}
