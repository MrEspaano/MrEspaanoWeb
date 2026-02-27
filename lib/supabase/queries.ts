import { DEFAULT_SITE_SETTINGS } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSignedMediaUrl, createSignedMediaUrls } from "@/lib/supabase/media";
import { DbProjectRow, DbSiteSettingsRow, Project, SiteSettings } from "@/lib/types";

function mapProjectRow(row: DbProjectRow): Project {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.short_description,
    longDescription: row.long_description,
    category: row.category,
    tags: row.tags ?? [],
    status: row.status,
    links: row.links ?? {},
    visuals: {
      coverPath: row.visuals?.coverPath,
      galleryPaths: row.visuals?.galleryPaths ?? []
    },
    techStack: row.tech_stack ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapSettingsRow(row: DbSiteSettingsRow): SiteSettings {
  return {
    id: row.id,
    displayName: row.display_name,
    tagline: row.tagline,
    bio: row.bio,
    heroCtaPrimary: row.hero_cta_primary,
    heroCtaSecondary: row.hero_cta_secondary,
    socialLinks: row.social_links ?? {},
    updatedAt: row.updated_at
  };
}

async function attachSignedVisuals(project: Project) {
  const supabase = await createSupabaseServerClient();

  const [coverUrl, galleryUrls] = await Promise.all([
    createSignedMediaUrl(supabase, project.visuals.coverPath),
    createSignedMediaUrls(supabase, project.visuals.galleryPaths)
  ]);

  return {
    ...project,
    visuals: {
      ...project.visuals,
      coverUrl,
      galleryUrls
    }
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("id, display_name, tagline, bio, hero_cta_primary, hero_cta_secondary, social_links, updated_at")
      .eq("id", true)
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_SITE_SETTINGS;
    }

    return mapSettingsRow(data as DbSiteSettingsRow);
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function getProjects(): Promise<Project[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("projects")
      .select(
        "id, slug, title, short_description, long_description, category, tags, status, links, visuals, tech_stack, created_at, updated_at"
      )
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    const mapped = (data as DbProjectRow[]).map(mapProjectRow);
    return Promise.all(mapped.map(attachSignedVisuals));
  } catch {
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("projects")
      .select(
        "id, slug, title, short_description, long_description, category, tags, status, links, visuals, tech_stack, created_at, updated_at"
      )
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return attachSignedVisuals(mapProjectRow(data as DbProjectRow));
  } catch {
    return null;
  }
}

export async function getAllTags() {
  const projects = await getProjects();
  return [...new Set(projects.flatMap((project) => project.tags))].sort((a, b) => a.localeCompare(b));
}
