import { ProjectCategory, ProjectStatus } from "@/lib/types";
import { DEFAULT_HUB_DESIGN_CONFIG } from "@/lib/design-config";

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  app: "Appar",
  game: "Spel",
  site: "Hemsidor"
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  live: "Live",
  wip: "Pågående",
  archived: "Arkiverad"
};

export const STATUS_SORT_ORDER: Record<ProjectStatus, number> = {
  live: 0,
  wip: 1,
  archived: 2
};

export const DEFAULT_SITE_SETTINGS = {
  id: true,
  displayName: "Erik Espaano",
  tagline: "Bygger appar, spel och upplevelser med känsla.",
  bio: "En personlig hubb för mina projekt, experiment och produktidéer.",
  heroCtaPrimary: "Utforska projekt",
  heroCtaSecondary: "Kontakta mig",
  socialLinks: {
    github: "https://github.com/",
    linkedin: "https://linkedin.com/",
    x: "https://x.com/",
    email: "mailto:hej@example.com"
  },
  designConfig: DEFAULT_HUB_DESIGN_CONFIG,
  updatedAt: new Date().toISOString()
};
