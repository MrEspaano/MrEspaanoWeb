"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { CSSProperties, ReactNode, useMemo, useState } from "react";
import { STATUS_LABELS } from "@/lib/constants";
import { HubModuleKey, Project, ProjectCategoryFilter, SiteSettings } from "@/lib/types";
import { FeaturedCarousel } from "@/components/hub/featured-carousel";
import { ProjectDetailModal } from "@/components/hub/project-detail-modal";
import { ProjectStoryFeed } from "@/components/hub/project-story-feed";
import { StickyCategoryMorph } from "@/components/hub/sticky-category-morph";
import { TextRevealSection } from "@/components/hub/text-reveal-section";
import { normalizeHubDesignConfig } from "@/lib/design-config";
import { cn, mapStatusBadgeClass } from "@/lib/utils";

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
  const [soraHeroMissing, setSoraHeroMissing] = useState(false);
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
  const heroProject = filteredProjects[0] ?? projects[0] ?? null;
  const nextProject = filteredProjects[1] ?? projects[1] ?? null;

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
        <TextRevealSection text={design.modules.textRevealCopy} />
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
      className={cn("hub-root relative min-h-screen overflow-x-clip pb-28", displayFontClass, bodyFontClass)}
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
        className="pointer-events-none absolute -top-24 left-[8%] h-80 w-80 rounded-full bg-sky-200/50 blur-[88px]"
      />
      <motion.div
        style={{ y: orbY2, scale: orbScale }}
        className="pointer-events-none absolute -top-16 right-[8%] h-80 w-80 rounded-full bg-blue-200/40 blur-[102px]"
      />

      <header className="section-shell relative z-20 pt-7 sm:pt-9">
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="glass-elevated flex items-center justify-between gap-4 rounded-[1.6rem] px-4 py-3 sm:px-6"
        >
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-sky-700/75">Personal Hub</p>
            <p className="text-lg font-semibold text-slate-800">{settings.displayName}</p>
          </div>

          <nav className="flex items-center gap-2">
            <Link
              href="/projects"
              className="glass-chip px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-white/85"
            >
              Alla projekt
            </Link>
            {!previewMode ? (
              <Link
                href="/admin"
                className="rounded-full border border-sky-200/80 bg-sky-200/50 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-sky-200/70"
              >
                Admin
              </Link>
            ) : null}
          </nav>
        </motion.div>
      </header>

      <section className="section-shell relative z-10 pt-16 sm:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="grid items-end gap-8 lg:grid-cols-[1.02fr_0.98fr]"
          style={{ maxWidth: `${design.hero.maxWidth}px`, opacity: design.hero.opacity }}
        >
          <div className="max-w-4xl">
            <p className="text-xs uppercase tracking-[0.28em] text-sky-700/75">Hypermodern showcase</p>
            <h1
              className="mt-4 text-4xl font-bold leading-[1.03] text-slate-800 sm:text-5xl lg:text-6xl"
              style={{ transform: `scale(${design.hero.titleScale})`, transformOrigin: "left top" }}
            >
              {settings.tagline}
            </h1>
            <p
              className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-700"
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
                className="rounded-full border border-sky-300/85 bg-sky-300/72 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-sky-300/95"
              >
                {settings.heroCtaPrimary}
              </Link>
              <Link
                href="/projects"
                className="glass-chip px-6 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-white/88"
              >
                {settings.heroCtaSecondary}
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="glass-chip px-3 py-1.5 text-xs font-semibold text-slate-700">{projects.length} projekt</span>
              <span className="glass-chip px-3 py-1.5 text-xs text-slate-600">Sora pipeline redo</span>
              <span className="glass-chip px-3 py-1.5 text-xs text-slate-600">Premium motion-system</span>
            </div>
          </div>

          <aside className="glass-elevated overflow-hidden rounded-[2rem] p-3 sm:p-4">
            <div className="relative overflow-hidden rounded-2xl border border-white/30">
              <div className="relative aspect-[7/8]">
                {!soraHeroMissing ? (
                  <Image
                    src="/sora/hero-glass-atrium.webp"
                    alt="Sora-genererad hero visual"
                    fill
                    sizes="(max-width: 1024px) 100vw, 44vw"
                    className="hub-media object-cover"
                    priority
                    onError={() => setSoraHeroMissing(true)}
                  />
                ) : heroProject?.visuals.coverUrl ? (
                  <Image
                    src={heroProject.visuals.coverUrl}
                    alt={`Highlight för ${heroProject.title}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 44vw"
                    className="hub-media object-cover"
                    priority
                  />
                ) : (
                  <div className="h-full w-full bg-[radial-gradient(circle_at_20%_18%,rgba(227,246,255,0.9),rgba(119,173,223,0.42)_42%,rgba(89,123,176,0.55)_78%)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/38 via-transparent to-transparent" />
              </div>

              {heroProject ? (
                <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/40 bg-white/70 p-3 backdrop-blur-md">
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-1 text-base font-semibold text-slate-900">{heroProject.title}</p>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        mapStatusBadgeClass(heroProject.status)
                      )}
                    >
                      {STATUS_LABELS[heroProject.status]}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-700">{heroProject.shortDescription}</p>
                </div>
              ) : null}
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="glass-panel rounded-2xl px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-sky-700/70">Quality</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">Editorial + glass balance</p>
              </div>
              <div className="glass-panel rounded-2xl px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-sky-700/70">Next Focus</p>
                <p className="mt-1 line-clamp-1 text-sm font-semibold text-slate-800">
                  {nextProject?.title ?? "Lägg till fler projekt"}
                </p>
              </div>
            </div>
          </aside>
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
