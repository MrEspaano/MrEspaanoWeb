"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { CSSProperties, ReactNode, useMemo, useState } from "react";
import { HubModuleKey, Project, ProjectCategoryFilter, SiteSettings } from "@/lib/types";
import { FeaturedCarousel } from "@/components/hub/featured-carousel";
import { ProjectDetailModal } from "@/components/hub/project-detail-modal";
import { ProjectStoryFeed } from "@/components/hub/project-story-feed";
import { StickyCategoryMorph } from "@/components/hub/sticky-category-morph";
import { TextRevealSection } from "@/components/hub/text-reveal-section";
import { normalizeHubDesignConfig } from "@/lib/design-config";
import { cn, mapStatusBadgeClass } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/constants";

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
  const [logoVisible, setLogoVisible] = useState(true);
  const { scrollY } = useScroll();
  const design = normalizeHubDesignConfig(settings.designConfig);

  const energeticMotion = design.global.motionPreset === "high-energy";

  const orbY1 = useTransform(scrollY, [0, 1200], [0, energeticMotion ? -180 : -120]);
  const orbY2 = useTransform(scrollY, [0, 1200], [0, energeticMotion ? -230 : -150]);
  const orbScale = useTransform(scrollY, [0, 1000], [1, energeticMotion ? 1.32 : 1.2]);

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

  const highlightProject = useMemo(() => filteredProjects[0] ?? projects[0] ?? null, [filteredProjects, projects]);

  const heroStats = useMemo(
    () => [
      { value: `${projects.length}+`, label: "Projekt" },
      { value: `${projects.filter((project) => project.status === "live").length}+`, label: "Live" },
      { value: `${projects.flatMap((project) => project.tags).length}+`, label: "Taggar" },
      { value: "24/7", label: "Iteration" }
    ],
    [projects]
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
          subtitle="Scrollen styr progressionen: aktivt kort lyfts fram med tydligare layout, skarpare metadata och cinematiska rörelser."
        />
      </div>
    )
  };

  return (
    <main
      data-theme-mode={design.global.themeMode}
      className={cn("hub-root relative min-h-screen overflow-x-clip pb-28", displayFontClass, bodyFontClass)}
      style={
        {
          "--hub-max-width": `${design.global.contentMaxWidth}px`,
          "--hub-media-saturation": String(design.global.mediaSaturation),
          "--hub-media-contrast": String(design.global.mediaContrast),
          "--hub-media-brightness": String(design.global.mediaBrightness),
          "--hub-accent-strength": String(design.global.accentStrength),
          "--hub-panel-contrast": String(design.global.panelContrast)
        } as CSSProperties
      }
    >
      <motion.div
        style={{ y: orbY1, scale: orbScale }}
        className="pointer-events-none absolute -top-28 left-[6%] h-[24rem] w-[24rem] rounded-full bg-blue-500/24 blur-[104px]"
      />
      <motion.div
        style={{ y: orbY2, scale: orbScale }}
        className="pointer-events-none absolute -top-24 right-[4%] h-[24rem] w-[24rem] rounded-full bg-amber-500/22 blur-[118px]"
      />

      <header className="section-shell relative z-20 pt-7 sm:pt-10">
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.2, 0.9, 0.2, 1] }}
          className="glass-elevated flex items-center justify-between gap-4 rounded-[1.5rem] px-4 py-3 sm:px-6"
        >
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-blue-200/80">Personal Hub</p>
            <p className="text-lg font-semibold text-slate-100">{settings.displayName}</p>
          </div>

          <nav className="flex items-center gap-2">
            <Link
              href="/projects"
              className="glass-chip px-4 py-2 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-slate-400/90 hover:bg-slate-800/95"
            >
              Alla projekt
            </Link>
            {!previewMode ? (
              <Link
                href="/admin"
                className="btn-secondary-dark px-4 py-2 text-sm"
              >
                Admin
              </Link>
            ) : null}

            <div className="ml-1 hidden sm:block">
              {logoVisible ? (
                <div className="overflow-hidden rounded-2xl border border-slate-500/80 bg-slate-950/80 p-1 shadow-[0_18px_40px_rgba(2,8,24,0.5)]">
                  <Image
                    src="/brand/mrespaano-logo.png"
                    alt="MrEspaano logga"
                    width={124}
                    height={74}
                    className="h-[56px] w-[96px] rounded-xl object-contain object-center"
                    onError={() => setLogoVisible(false)}
                  />
                </div>
              ) : (
                <div className="flex h-[58px] w-[58px] items-center justify-center rounded-full border border-blue-300/45 bg-slate-900/80 text-sm font-extrabold text-blue-100 shadow-[0_18px_40px_rgba(2,8,24,0.5)]">
                  ME
                </div>
              )}
            </div>
          </nav>
        </motion.div>
      </header>

      <section className="section-shell relative z-10 pt-16 sm:pt-20" style={{ opacity: design.hero.opacity }}>
        <div className="grid items-start gap-10 xl:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.2, 0.9, 0.2, 1] }}
            className="max-w-4xl"
            style={{ maxWidth: `${design.hero.maxWidth}px` }}
          >
            <p className="text-xs uppercase tracking-[0.28em] text-blue-200/80">Dark editorial showcase</p>
            <h1
              className="mt-4 text-4xl font-semibold leading-[0.99] text-slate-100 sm:text-5xl lg:text-6xl"
              style={{ transform: `scale(${design.hero.titleScale})`, transformOrigin: "left top" }}
            >
              {settings.tagline}
            </h1>
            <p
              className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300"
              style={{ transform: `scale(${design.hero.bodyScale})`, transformOrigin: "left top" }}
            >
              {settings.bio}
            </p>

            <div
              className="mt-9 flex flex-wrap items-center gap-3"
              style={{ transform: `scale(${design.hero.ctaScale})`, transformOrigin: "left center" }}
            >
              <Link href="#home-feed" className="btn-primary-amber">
                {settings.heroCtaPrimary}
              </Link>
              <Link href="/projects" className="btn-secondary-dark">
                {settings.heroCtaSecondary}
              </Link>
            </div>

            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-4">
              {heroStats.map((item) => (
                <div key={item.label} className="glass-panel rounded-2xl px-4 py-3">
                  <p className="text-xl font-semibold text-slate-100">{item.value}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {highlightProject ? (
            <motion.article
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.58, delay: 0.16, ease: [0.2, 0.9, 0.2, 1] }}
              className="glass-elevated rounded-[1.8rem] p-4 sm:p-5"
            >
              <div className="relative aspect-[5/4] overflow-hidden rounded-2xl border border-slate-500/70">
                {highlightProject.visuals.coverUrl ? (
                  <Image
                    src={highlightProject.visuals.coverUrl}
                    alt={highlightProject.title}
                    fill
                    sizes="(max-width: 1280px) 100vw, 40vw"
                    className="hub-media object-cover"
                    priority
                  />
                ) : (
                  <div className="h-full w-full bg-[radial-gradient(circle_at_16%_18%,rgba(63,142,255,0.4),rgba(14,29,58,0.9)_52%)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
              </div>

              <div className="mt-4 rounded-2xl border border-slate-600/70 bg-slate-950/82 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-100">{highlightProject.title}</h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-300">{highlightProject.shortDescription}</p>
                  </div>
                  <span className={mapStatusBadgeClass(highlightProject.status)}>{STATUS_LABELS[highlightProject.status]}</span>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Quality</p>
                    <p className="mt-1 text-sm font-semibold text-slate-100">Editorial + contrast</p>
                  </div>
                  <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Next focus</p>
                    <p className="mt-1 text-sm font-semibold text-slate-100">{filteredProjects[1]?.title ?? "Bygg vidare"}</p>
                  </div>
                </div>
              </div>
            </motion.article>
          ) : null}
        </div>
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
