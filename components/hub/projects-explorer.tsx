"use client";

import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { CSSProperties, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProjectDetailModal } from "@/components/hub/project-detail-modal";
import { ProjectStoryFeed } from "@/components/hub/project-story-feed";
import { CATEGORY_LABELS, STATUS_SORT_ORDER } from "@/lib/constants";
import { Project, ProjectCategoryFilter, SiteSettings } from "@/lib/types";
import { cn } from "@/lib/utils";
import { normalizeHubDesignConfig } from "@/lib/design-config";

interface ProjectsExplorerProps {
  projects: Project[];
  settings: SiteSettings;
}

type SortValue = "newest" | "oldest" | "status";

function parseCategory(value: string | null): ProjectCategoryFilter {
  if (value === "app" || value === "game" || value === "site") {
    return value;
  }

  return "all";
}

export function ProjectsExplorer({ projects, settings }: ProjectsExplorerProps) {
  const design = normalizeHubDesignConfig(settings.designConfig);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = parseCategory(searchParams.get("category"));
  const query = searchParams.get("q")?.trim() ?? "";
  const sort = (searchParams.get("sort") as SortValue | null) ?? "newest";
  const selectedTags = (searchParams.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const selectedSlug = searchParams.get("project");

  const allTags = useMemo(
    () => [...new Set(projects.flatMap((project) => project.tags))].sort((a, b) => a.localeCompare(b)),
    [projects]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();

    return [...projects]
      .filter((project) => (category === "all" ? true : project.category === category))
      .filter((project) =>
        selectedTags.length ? selectedTags.every((tag) => project.tags.some((projectTag) => projectTag === tag)) : true
      )
      .filter((project) => {
        if (!q) {
          return true;
        }

        const haystack = `${project.title} ${project.shortDescription} ${project.tags.join(" ")}`.toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => {
        if (sort === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }

        if (sort === "status") {
          const statusDiff = STATUS_SORT_ORDER[a.status] - STATUS_SORT_ORDER[b.status];
          if (statusDiff !== 0) {
            return statusDiff;
          }
        }

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [category, projects, query, selectedTags, sort]);

  const selectedProject = useMemo(
    () =>
      filtered.find((project) => project.slug === selectedSlug) ??
      projects.find((project) => project.slug === selectedSlug) ??
      null,
    [filtered, projects, selectedSlug]
  );

  const updateSearchParams = (updates: Record<string, string | null | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  const toggleTag = (tag: string) => {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter((selectedTag) => selectedTag !== tag)
      : [...selectedTags, tag];

    updateSearchParams({ tags: next.length ? next.join(",") : null, project: null });
  };

  return (
    <main
      className="hub-root relative min-h-screen pb-24 pt-8 sm:pt-12"
      style={
        {
          "--hub-max-width": `${design.global.contentMaxWidth}px`,
          "--hub-media-saturation": String(design.global.mediaSaturation),
          "--hub-media-contrast": String(design.global.mediaContrast),
          "--hub-media-brightness": String(design.global.mediaBrightness)
        } as CSSProperties
      }
    >
      <section className="section-shell">
        <div className="glass-elevated overflow-hidden rounded-[2.2rem] p-6 sm:p-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-blue-100/78">Project index</p>
              <h1 className="mt-3 text-[clamp(2.4rem,6vw,5rem)] font-semibold leading-[0.94] text-slate-100">
                {settings.displayName} / Projekt
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
                En mer redaktionell översikt för sök, filtrering och snabb projektgranskning. Samma visuella språk som
                startsidan, men med tydligare arbetsyta för browsing.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href="/" className="btn-secondary-dark gap-2 px-4 py-2 text-sm">
                  <ArrowLeft size={16} />
                  Till startsidan
                </Link>
                <div className="glass-chip px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-slate-300">
                  {filtered.length} matchande projekt
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Sök</span>
                <div className="glass-input flex items-center gap-3 px-4 py-3">
                  <Search size={16} className="text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => updateSearchParams({ q: event.target.value || null, project: null })}
                    placeholder="Titel, beskrivning eller tag..."
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Sortera</span>
                <select
                  value={sort}
                  onChange={(event) => updateSearchParams({ sort: event.target.value, project: null })}
                  className="glass-input w-full px-4 py-3 text-sm focus:outline-none"
                >
                  <option value="newest">Nyast först</option>
                  <option value="oldest">Äldst först</option>
                  <option value="status">Status</option>
                </select>
              </label>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            {(["all", "app", "game", "site"] as ProjectCategoryFilter[]).map((value) => {
              const label = value === "all" ? "Alla" : CATEGORY_LABELS[value];
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateSearchParams({ category: value === "all" ? null : value, project: null })}
                  className={cn(
                    "glass-chip px-4 py-2 text-sm font-semibold transition",
                    value === category
                      ? "border-amber-300/70 bg-amber-400/85 text-slate-900"
                      : "text-slate-200 hover:-translate-y-0.5"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {allTags.map((tag) => {
              const selected = selectedTags.includes(tag);

              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "glass-chip px-3 py-1.5 text-xs font-medium transition",
                    selected
                      ? "border-blue-300/45 bg-blue-500/18 text-blue-100"
                      : "text-slate-300 hover:-translate-y-0.5"
                  )}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <ProjectStoryFeed
        projects={filtered}
        onOpenProject={(slug) => updateSearchParams({ project: slug })}
        title="Projekt-feed"
        subtitle="Aktivt kort får prioritet med mer luft, bättre kontrast och tydligare informationsrytm genom hela flödet."
      />

      <ProjectDetailModal
        project={selectedProject}
        isOpen={Boolean(selectedProject)}
        onClose={() => updateSearchParams({ project: null })}
      />
    </main>
  );
}
