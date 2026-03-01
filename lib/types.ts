export type ProjectCategory = "app" | "game" | "site";
export type ProjectCategoryFilter = ProjectCategory | "all";
export type HubModuleKey = "stickyCategoryMorph" | "featured" | "textReveal" | "storyFeed";
export type HubDisplayFont = "syne" | "space-grotesk" | "sora";
export type HubBodyFont = "manrope" | "inter" | "system";
export type HubThemeMode = "dark-editorial" | "dark-neon" | "hybrid";
export type HubMotionPreset = "balanced" | "high-energy" | "minimal";
export type HubViewportPreset = "desktop" | "laptop" | "tablet" | "mobile";
export type HubLogoPlacement = "hero" | "afterModules";

export type ProjectStatus = "live" | "wip" | "archived";

export interface ProjectLinks {
  demoUrl?: string;
  repoUrl?: string;
  caseStudyUrl?: string;
}

export interface ProjectVisuals {
  coverPath?: string;
  galleryPaths?: string[];
  coverUrl?: string | null;
  galleryUrls?: string[];
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  category: ProjectCategory;
  tags: string[];
  status: ProjectStatus;
  links: ProjectLinks;
  visuals: ProjectVisuals;
  techStack: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  id: boolean;
  displayName: string;
  tagline: string;
  bio: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  socialLinks: {
    github?: string;
    linkedin?: string;
    x?: string;
    email?: string;
    [key: string]: string | undefined;
  };
  designConfig: HubDesignConfig;
  updatedAt: string;
}

export interface HubModuleConfig {
  visible: boolean;
  opacity: number;
  scale: number;
  yOffset: number;
}

export interface HubDesignProfile {
  global: {
    contentMaxWidth: number;
    bodyFont: HubBodyFont;
    displayFont: HubDisplayFont;
    mediaSaturation: number;
    mediaContrast: number;
    mediaBrightness: number;
    themeMode: HubThemeMode;
    accentStrength: number;
    panelContrast: number;
    motionPreset: HubMotionPreset;
  };
  hero: {
    maxWidth: number;
    titleScale: number;
    titleMaxWidth: number;
    titleLineHeight: number;
    bodyScale: number;
    bodyMaxWidth: number;
    bodyLineHeight: number;
    ctaScale: number;
    opacity: number;
    logoOffsetX: number;
    logoOffsetY: number;
    logoScale: number;
    logoPlacement: HubLogoPlacement;
    logoSectionTop: number;
  };
  modules: {
    order: HubModuleKey[];
    textRevealCopy: string;
    stickyCategoryMorph: HubModuleConfig;
    featured: HubModuleConfig;
    textReveal: HubModuleConfig;
    storyFeed: HubModuleConfig;
  };
}

export interface HubDesignConfig extends HubDesignProfile {
  breakpoints?: Partial<Record<HubViewportPreset, HubDesignProfile>>;
}

export interface Profile {
  id: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface DbProjectRow {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  long_description: string;
  category: ProjectCategory;
  tags: string[];
  status: ProjectStatus;
  links: ProjectLinks | null;
  visuals: ProjectVisuals | null;
  tech_stack: string[];
  created_at: string;
  updated_at: string;
}

export interface DbSiteSettingsRow {
  id: boolean;
  display_name: string;
  tagline: string;
  bio: string;
  hero_cta_primary: string;
  hero_cta_secondary: string;
  social_links: SiteSettings["socialLinks"] | null;
  design_config: HubDesignConfig | null;
  updated_at: string;
}
