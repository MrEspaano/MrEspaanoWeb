"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { CSSProperties, ReactNode, useEffect, useMemo, useState } from "react";
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
  forceTouchMode?: boolean;
}

function toModuleStyle(visible: boolean, opacity: number, scale: number, yOffset: number): CSSProperties {
  return {
    display: visible ? "block" : "none",
    opacity,
    transform: `translateY(${yOffset}px) scale(${scale})`,
    transformOrigin: "top center"
  };
}

export function HomeHub({ projects, settings, previewMode = false, forceTouchMode = false }: HomeHubProps) {
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategoryFilter>("all");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const { scrollY } = useScroll();
  const design = normalizeHubDesignConfig(settings.designConfig);

  const energeticMotion = design.global.motionPreset === "high-energy";
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobileViewport(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  const lockMobileLogo = forceTouchMode || isMobileViewport;

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
        <FeaturedCarousel projects={filteredProjects} forceTouchMode={forceTouchMode} />
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
          className="glass-elevated flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] px-4 py-3 sm:flex-nowrap sm:gap-4 sm:px-6"
        >
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-blue-200/80">Personal Hub</p>
            <p className="text-lg font-semibold leading-normal text-slate-100 sm:text-xl">{settings.displayName}</p>
          </div>

          <nav className="flex w-full items-center gap-2 sm:w-auto">
            <Link
              href="/projects"
              className="glass-chip flex-1 px-4 py-2 text-center text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-slate-400/90 hover:bg-slate-800/95 sm:flex-none"
            >
              Alla projekt
            </Link>
            {!previewMode ? (
              <Link
                href="/admin"
                className="btn-secondary-dark flex-1 px-4 py-2 text-sm sm:flex-none"
              >
                Admin
              </Link>
            ) : null}
          </nav>
        </motion.div>
      </header>

      <section className="section-shell relative z-10 pt-12 sm:pt-20" style={{ opacity: design.hero.opacity }}>
        <div className="grid items-start gap-10 xl:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.2, 0.9, 0.2, 1] }}
            className="order-2 max-w-4xl xl:order-1"
            style={{ maxWidth: `${design.hero.maxWidth}px` }}
          >
            <p className="text-[11px] uppercase tracking-[0.24em] text-blue-200/80 sm:text-xs sm:tracking-[0.28em]">Dark editorial showcase</p>
            <h1
              className="mt-3 text-[clamp(2.5rem,12vw,3.8rem)] font-semibold leading-[0.98] text-slate-100 sm:mt-4 sm:text-5xl lg:text-6xl"
              style={{
                maxWidth: `${design.hero.titleMaxWidth}px`,
                lineHeight: design.hero.titleLineHeight
              }}
            >
              {settings.tagline}
            </h1>
            <p
              className="mt-5 text-base leading-relaxed text-slate-300 sm:mt-6 sm:text-lg"
              style={{
                maxWidth: `${design.hero.bodyMaxWidth}px`,
                lineHeight: design.hero.bodyLineHeight
              }}
            >
              {settings.bio}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3 sm:mt-9">
              <Link href="#home-feed" className="btn-primary-amber">
                {settings.heroCtaPrimary}
              </Link>
              <Link href="/projects" className="btn-secondary-dark">
                {settings.heroCtaSecondary}
              </Link>
            </div>

            <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {heroStats.map((item) => (
                <div key={item.label} className="glass-panel min-w-0 rounded-2xl px-4 py-3">
                  <p className="truncate text-xl font-semibold text-slate-100">{item.value}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.article
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.58, delay: 0.16, ease: [0.2, 0.9, 0.2, 1] }}
            className="order-1 relative flex items-start justify-center p-2 pt-0 sm:p-4 sm:pt-2 xl:order-2"
          >
            <div className="pointer-events-none absolute inset-0 rounded-[2.2rem] bg-[radial-gradient(circle_at_50%_45%,rgba(63,142,255,0.18),transparent_56%)] blur-[2px]" />
            <div
              className="relative flex min-h-[220px] w-full items-start justify-center p-1 pt-0 sm:min-h-[500px] sm:p-2 sm:pt-2"
              style={{
                transform: lockMobileLogo
                  ? "translate(0px, 0px) scale(1)"
                  : `translate(${design.hero.logoOffsetX}px, ${design.hero.logoOffsetY}px) scale(${design.hero.logoScale})`,
                transformOrigin: "center top"
              }}
            >
              <Image
                src="/brand/mrespaano-logo.png"
                alt="MrEspaano logga"
                width={760}
                height={760}
                unoptimized
                className="h-auto w-full max-w-[280px] object-contain drop-shadow-[0_26px_60px_rgba(40,132,255,0.38)] sm:max-w-[620px]"
                priority
              />
            </div>
          </motion.article>
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
