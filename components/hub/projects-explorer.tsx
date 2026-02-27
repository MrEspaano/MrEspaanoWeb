"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProjectDetailModal } from "@/components/hub/project-detail-modal";
import { ProjectStoryFeed } from "@/components/hub/project-story-feed";
import { CATEGORY_LABELS, STATUS_SORT_ORDER } from "@/lib/constants";
import { Project, ProjectCategoryFilter, SiteSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

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
    <main className="relative min-h-screen pb-24 pt-8 sm:pt-12">
      <section className="section-shell">
        <div className="glass-elevated rounded-[2rem] p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-50/[0.78]">Project Explorer</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-white sm:text-5xl">
            {settings.displayName} / Projekt
          </h1>
          <p className="mt-4 max-w-3xl text-white/[0.84]">
            Filtrera efter kategori och tags, sök i titel och metadata, och öppna projekt i modal eller full route.
          </p>

          <div className="mt-7 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/[0.7]">Sök</span>
              <input
                value={query}
                onChange={(event) => updateSearchParams({ q: event.target.value || null, project: null })}
                placeholder="Sök på titel eller tag..."
                className="glass-input w-full px-4 py-3 text-sm focus:border-cyan-50/75 focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/[0.7]">Sortera</span>
              <select
                value={sort}
                onChange={(event) => updateSearchParams({ sort: event.target.value, project: null })}
                className="glass-input w-full px-4 py-3 text-sm focus:border-cyan-50/75 focus:outline-none"
              >
                <option value="newest">Nyast först</option>
                <option value="oldest">Äldst först</option>
                <option value="status">Status</option>
              </select>
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
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
                      ? "border-cyan-50/70 bg-cyan-50/[0.34] text-slate-900"
                      : "text-white/[0.86] hover:border-white/[0.46] hover:bg-white/[0.22]"
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
                      ? "border-emerald-100/75 bg-emerald-100/[0.34] text-emerald-50"
                      : "text-white/[0.82] hover:border-white/[0.46] hover:bg-white/[0.22]"
                  )}
                >
                  #{tag}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <p className="text-sm text-white/[0.84]">{filtered.length} projekt matchar filtreringen</p>
            <Link href="/" className="glass-chip px-4 py-1.5 text-xs font-semibold transition hover:scale-[1.02]">
              Till startsidan
            </Link>
          </div>
        </div>
      </section>

      <ProjectStoryFeed
        projects={filtered}
        onOpenProject={(slug) => updateSearchParams({ project: slug })}
        title="Story Feed"
        subtitle="Scrollen styr progressionen och aktivt kort får tydlig visuell prioritet i den nya glass-layouten."
      />

      <ProjectDetailModal
        project={selectedProject}
        isOpen={Boolean(selectedProject)}
        onClose={() => updateSearchParams({ project: null })}
      />
    </main>
  );
}
