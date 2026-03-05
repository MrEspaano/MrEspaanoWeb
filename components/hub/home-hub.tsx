"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Github, Layers3, Linkedin, Mail, Sparkles } from "lucide-react";
import { CSSProperties, Fragment, ReactNode, useEffect, useMemo, useState } from "react";
import { HubModuleKey, HubViewportPreset, Project, ProjectCategoryFilter, SiteSettings } from "@/lib/types";
import { FeaturedCarousel } from "@/components/hub/featured-carousel";
import { ProjectDetailModal } from "@/components/hub/project-detail-modal";
import { ProjectStoryFeed } from "@/components/hub/project-story-feed";
import { StickyCategoryMorph } from "@/components/hub/sticky-category-morph";
import { TextRevealSection } from "@/components/hub/text-reveal-section";
import { normalizeHubDesignConfig, resolveHubDesignForPreset } from "@/lib/design-config";
import { cn } from "@/lib/utils";

interface HomeHubProps {
  projects: Project[];
  settings: SiteSettings;
  previewMode?: boolean;
  forceTouchMode?: boolean;
  forcedViewportPreset?: HubViewportPreset;
}

function toModuleStyle(visible: boolean, opacity: number, scale: number, yOffset: number): CSSProperties {
  return {
    display: visible ? "block" : "none",
    opacity,
    transform: `translateY(${yOffset}px) scale(${scale})`,
    transformOrigin: "top center"
  };
}

const SOCIAL_ICON = {
  github: Github,
  linkedin: Linkedin,
  x: Sparkles,
  email: Mail
} as const;

const SOCIAL_LABEL = {
  github: "Github",
  linkedin: "LinkedIn",
  x: "Updates",
  email: "Kontakt"
} as const;

export function HomeHub({
  projects,
  settings,
  previewMode = false,
  forceTouchMode = false,
  forcedViewportPreset
}: HomeHubProps) {
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategoryFilter>("all");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const { scrollY } = useScroll();
  const normalized = useMemo(() => normalizeHubDesignConfig(settings.designConfig), [settings.designConfig]);
  const [viewportPreset, setViewportPreset] = useState<HubViewportPreset>(forcedViewportPreset ?? "desktop");
  const design = useMemo(
    () => resolveHubDesignForPreset(normalized, forcedViewportPreset ?? viewportPreset),
    [normalized, forcedViewportPreset, viewportPreset]
  );

  const energeticMotion = design.global.motionPreset === "high-energy";

  useEffect(() => {
    if (forcedViewportPreset || typeof window === "undefined") {
      return;
    }

    const computePreset = () => {
      const width = window.innerWidth;
      if (width <= 767) {
        setViewportPreset("mobile");
        return;
      }
      if (width <= 1023) {
        setViewportPreset("tablet");
        return;
      }
      if (width <= 1279) {
        setViewportPreset("laptop");
        return;
      }
      setViewportPreset("desktop");
    };

    computePreset();
    window.addEventListener("resize", computePreset);
    return () => window.removeEventListener("resize", computePreset);
  }, [forcedViewportPreset]);

  const orbY1 = useTransform(scrollY, [0, 1200], [0, energeticMotion ? -180 : -120]);
  const orbY2 = useTransform(scrollY, [0, 1200], [0, energeticMotion ? -230 : -150]);
  const orbScale = useTransform(scrollY, [0, 1000], [1, energeticMotion ? 1.32 : 1.2]);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === "all") {
      return projects;
    }

    return projects.filter((project) => project.category === selectedCategory);
  }, [projects, selectedCategory]);

  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [projects]
  );

  const selectedProject = useMemo(
    () => filteredProjects.find((project) => project.slug === selectedSlug) ?? null,
    [filteredProjects, selectedSlug]
  );

  const heroStats = useMemo(
    () => [
      { value: `${projects.length}+`, label: "Utvalda case" },
      { value: `${projects.filter((project) => project.status === "live").length}+`, label: "Live just nu" },
      { value: `${new Set(projects.flatMap((project) => project.category)).size}`, label: "Format" },
      { value: `${new Set(projects.flatMap((project) => project.techStack)).size}+`, label: "Tekniker" }
    ],
    [projects]
  );

  const latestProject = sortedProjects[0] ?? null;
  const topTags = useMemo(() => {
    const counts = new Map<string, number>();
    projects.forEach((project) => {
      project.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
    });
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag);
  }, [projects]);

  const updatedLabel = useMemo(() => {
    const value = new Date(settings.updatedAt);
    if (Number.isNaN(value.getTime())) {
      return null;
    }

    return new Intl.DateTimeFormat("sv-SE", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(value);
  }, [settings.updatedAt]);

  const socialLinks = useMemo(
    () =>
      (Object.entries(settings.socialLinks) as Array<[string, string | undefined]>)
        .filter(([, href]) => Boolean(href))
        .slice(0, 4)
        .map(([key, href]) => {
          const typedKey = key as keyof typeof SOCIAL_ICON;
          const Icon = SOCIAL_ICON[typedKey] ?? Sparkles;
          return {
            key,
            href: href as string,
            label: SOCIAL_LABEL[typedKey] ?? key,
            Icon
          };
        }),
    [settings.socialLinks]
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
          subtitle="En mer redaktionell översikt där aktivt case lyfts fram med tydligare rytm, större visualitet och bättre känsla i övergångarna."
        />
      </div>
    )
  };

  const logoMedia = (
    <Image
      src="/brand/mrespaano-logo.png"
      alt="MrEspaano logga"
      width={760}
      height={760}
      unoptimized
      className="h-auto w-full max-w-[300px] object-contain drop-shadow-[0_32px_82px_rgba(40,132,255,0.34)] sm:max-w-[620px]"
      priority
    />
  );

  const logoShowcase = (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.12, ease: [0.2, 0.9, 0.2, 1] }}
      className="relative"
    >
      <div className="glass-elevated relative overflow-hidden rounded-[2.25rem] p-4 sm:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(91,155,255,0.22),transparent_34%),radial-gradient(circle_at_72%_74%,rgba(255,149,72,0.14),transparent_30%)]" />

        <div className="relative flex items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-blue-100/75">Signature frame</p>
            <p className="mt-1 text-sm font-medium text-slate-300">Identitet, rörelse och utvalda case</p>
          </div>
          <div className="glass-chip flex items-center gap-2 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-slate-200">
            <Layers3 size={12} />
            Premium edit
          </div>
        </div>

        <div className="relative mt-6 overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,17,34,0.8),rgba(6,12,24,0.92))] px-4 py-8 sm:px-8 sm:py-10">
          <div className="absolute left-1/2 top-[18%] h-56 w-56 -translate-x-1/2 rounded-full bg-blue-500/24 blur-[110px]" />
          <div className="absolute left-[14%] top-[64%] h-32 w-32 rounded-full bg-cyan-400/12 blur-[82px]" />
          <div className="absolute right-[12%] top-[22%] h-36 w-36 rounded-full bg-amber-400/16 blur-[84px]" />

          <div
            className="relative mx-auto flex min-h-[300px] max-w-[420px] items-center justify-center"
            style={{
              transform: `translate(${design.hero.logoOffsetX}px, ${design.hero.logoOffsetY}px) scale(${design.hero.logoScale})`,
              transformOrigin: "center center"
            }}
          >
            {logoMedia}
          </div>

          <div className="absolute left-4 top-4 max-w-[190px] rounded-[1.4rem] border border-white/12 bg-slate-950/58 p-3 shadow-[0_24px_44px_rgba(2,8,23,0.32)] backdrop-blur-xl sm:left-6 sm:top-6">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">At a glance</p>
            <p className="mt-2 text-2xl font-semibold text-slate-50">{projects.length}</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-300">Projekt kuraterade för appar, spel och web.</p>
          </div>

          {latestProject ? (
            <div className="absolute bottom-4 left-4 max-w-[220px] rounded-[1.5rem] border border-blue-300/18 bg-blue-500/10 p-3 shadow-[0_24px_44px_rgba(2,8,23,0.32)] backdrop-blur-xl sm:bottom-6 sm:left-6">
              <p className="text-[10px] uppercase tracking-[0.22em] text-blue-100/72">Senaste case</p>
              <p className="mt-2 text-base font-semibold text-slate-50">{latestProject.title}</p>
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-300">{latestProject.shortDescription}</p>
            </div>
          ) : null}

          <div className="absolute bottom-4 right-4 max-w-[180px] rounded-[1.5rem] border border-white/12 bg-slate-950/62 p-3 shadow-[0_24px_44px_rgba(2,8,23,0.32)] backdrop-blur-xl sm:bottom-6 sm:right-6">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Domäner</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {["Apps", "Sites", "Games"].map((item) => (
                <span key={item} className="rounded-full border border-white/12 px-2.5 py-1 text-[11px] text-slate-200">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );

  const logoFlowSection = (
    <section
      className="section-shell relative z-10"
      style={{ marginTop: `${design.hero.logoSectionTop}px` }}
      aria-label="Logga"
    >
      {logoShowcase}
    </section>
  );

  const orderedModules = design.modules.order;
  const flowInsertIndex = (() => {
    switch (design.hero.logoFlowAnchor) {
      case "beforeAll":
        return 0;
      case "afterSticky":
        return orderedModules.indexOf("stickyCategoryMorph") + 1;
      case "afterFeatured":
        return orderedModules.indexOf("featured") + 1;
      case "afterTextReveal":
        return orderedModules.indexOf("textReveal") + 1;
      case "afterStoryFeed":
        return orderedModules.indexOf("storyFeed") + 1;
      default:
        return orderedModules.length;
    }
  })();
  const clampedFlowInsertIndex = Math.max(0, Math.min(orderedModules.length, flowInsertIndex));

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
        className="pointer-events-none absolute -top-24 left-[4%] h-[28rem] w-[28rem] rounded-full bg-blue-500/22 blur-[120px]"
      />
      <motion.div
        style={{ y: orbY2, scale: orbScale }}
        className="pointer-events-none absolute -top-24 right-[2%] h-[26rem] w-[26rem] rounded-full bg-amber-500/20 blur-[120px]"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[760px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_56%)]" />

      <header className="section-shell relative z-20 pt-7 sm:pt-10">
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.2, 0.9, 0.2, 1] }}
          className="glass-elevated flex flex-wrap items-center justify-between gap-3 rounded-[1.7rem] px-4 py-3 sm:flex-nowrap sm:gap-4 sm:px-6"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <Sparkles size={18} className="text-amber-200" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-blue-200/80">Personal hub</p>
              <p className="text-lg font-semibold leading-normal text-slate-100 sm:text-xl">{settings.displayName}</p>
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end">
            <div className="glass-chip hidden px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-slate-300 md:block">
              High fidelity portfolio system
            </div>
            <nav className="flex w-full items-center gap-2 sm:w-auto">
              <Link
                href="/projects"
                className="glass-chip flex-1 px-4 py-2 text-center text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 sm:flex-none"
              >
                Alla projekt
              </Link>
              {!previewMode ? (
                <Link href="/admin" className="btn-secondary-dark flex-1 px-4 py-2 text-sm sm:flex-none">
                  Admin
                </Link>
              ) : null}
            </nav>
          </div>
        </motion.div>
      </header>

      <section className="section-shell relative z-10 pt-12 sm:pt-20" style={{ opacity: design.hero.opacity }}>
        <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.98fr)] xl:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.2, 0.9, 0.2, 1] }}
            className="max-w-4xl"
            style={{ maxWidth: `${design.hero.maxWidth}px` }}
          >
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="glass-chip px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-blue-100/85">
                {design.hero.heroEyebrow}
              </div>
              {updatedLabel ? (
                <div className="glass-chip px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-slate-300">
                  Uppdaterad {updatedLabel}
                </div>
              ) : null}
            </div>

            <h1
              className="mt-5 text-[clamp(3.2rem,10vw,6.8rem)] font-semibold leading-[0.92] text-slate-100"
              style={{
                maxWidth: `${design.hero.titleMaxWidth}px`,
                lineHeight: design.hero.titleLineHeight
              }}
            >
              <span className="bg-[linear-gradient(180deg,#ffffff_0%,#dfe8ff_44%,#9db8ff_100%)] bg-clip-text text-transparent">
                {settings.tagline}
              </span>
            </h1>

            <p
              className="mt-6 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg"
              style={{
                maxWidth: `${design.hero.bodyMaxWidth}px`,
                lineHeight: design.hero.bodyLineHeight
              }}
            >
              {settings.bio}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="#home-feed" className="btn-primary-amber gap-2">
                {settings.heroCtaPrimary}
                <ArrowDownRight size={16} />
              </Link>
              <Link href="/projects" className="btn-secondary-dark gap-2">
                {settings.heroCtaSecondary}
                <ArrowUpRight size={16} />
              </Link>
            </div>

            {socialLinks.length ? (
              <div className="mt-6 flex flex-wrap gap-2.5">
                {socialLinks.map(({ key, href, label, Icon }) => (
                  <Link
                    key={key}
                    href={href}
                    target={href.startsWith("mailto:") ? undefined : "_blank"}
                    rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
                    className="glass-chip inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-200 transition hover:-translate-y-0.5"
                  >
                    <Icon size={15} />
                    {label}
                  </Link>
                ))}
              </div>
            ) : null}

            <div className="mt-9 grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]">
              <div className="glass-panel rounded-[2rem] p-5 sm:p-6">
                <p className="text-[11px] uppercase tracking-[0.24em] text-blue-100/80">Art direction</p>
                <p className="mt-3 max-w-2xl text-xl font-semibold leading-tight text-slate-100 sm:text-2xl">
                  En mer fokuserad showcase med tydlig rytm, tätare typografi och mer självsäker komposition.
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                  Målet är att varje sektion ska kännas kuraterad: mer ljus, bättre hierarki och mer övertygande materialitet i paneler, media och CTA-ytor.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {topTags.map((tag) => (
                    <span key={tag} className="glass-chip px-3 py-1.5 text-xs font-medium text-slate-200">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {heroStats.map((item) => (
                  <div key={item.label} className="glass-panel min-w-0 rounded-[1.6rem] px-4 py-4">
                    <p className="truncate text-[1.9rem] font-semibold leading-none text-slate-100">{item.value}</p>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {design.hero.logoPlacement === "hero" ? logoShowcase : null}
        </div>
      </section>

      {design.hero.logoPlacement === "flow" && clampedFlowInsertIndex === 0 ? logoFlowSection : null}
      {orderedModules.map((moduleKey, index) => (
        <Fragment key={moduleKey}>
          <div>{modules[moduleKey]}</div>
          {design.hero.logoPlacement === "flow" && clampedFlowInsertIndex === index + 1 ? logoFlowSection : null}
        </Fragment>
      ))}

      <ProjectDetailModal
        project={selectedProject}
        isOpen={Boolean(selectedProject) && !previewMode}
        onClose={() => setSelectedSlug(null)}
      />
    </main>
  );
}
