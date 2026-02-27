export type ProjectCategory = "app" | "game" | "site";
export type ProjectCategoryFilter = ProjectCategory | "all";

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
  updatedAt: string;
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
  updated_at: string;
}
