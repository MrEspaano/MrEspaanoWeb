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
    () => filtered.find((project) => project.slug === selectedSlug) ?? projects.find((project) => project.slug === selectedSlug) ?? null,
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
    <main className="min-h-screen pb-20 pt-8 sm:pt-12">
      <section className="section-shell">
        <div className="glass-panel rounded-3xl p-6 shadow-glass sm:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/80">Project Explorer</p>
          <h1 className="mt-3 text-4xl font-bold text-white sm:text-5xl">{settings.displayName} / Projekt</h1>
          <p className="mt-4 max-w-3xl text-white/75">
            Filtrera efter kategori och tags, sök i titel och metadata, och öppna projekt i modal eller full route.
          </p>

          <div className="mt-7 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/60">Sök</span>
              <input
                value={query}
                onChange={(event) => updateSearchParams({ q: event.target.value || null, project: null })}
                placeholder="Sök på titel eller tag..."
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/45 focus:border-cyan-200/70 focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/60">Sortera</span>
              <select
                value={sort}
                onChange={(event) => updateSearchParams({ sort: event.target.value, project: null })}
                className="w-full rounded-2xl border border-white/20 bg-slate-900/85 px-4 py-3 text-sm text-white focus:border-cyan-200/70 focus:outline-none"
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
                    "rounded-full border px-4 py-2 text-sm font-semibold transition",
                    value === category
                      ? "border-cyan-200/70 bg-cyan-200/22 text-cyan-50"
                      : "border-white/18 bg-white/8 text-white/75 hover:border-white/35"
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
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    selected
                      ? "border-emerald-200/65 bg-emerald-200/18 text-emerald-50"
                      : "border-white/18 bg-white/6 text-white/70 hover:border-white/35"
                  )}
                >
                  #{tag}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <p className="text-sm text-white/70">
              {filtered.length} projekt matchar filtreringen
            </p>
            <Link
              href="/"
              className="rounded-full border border-white/20 bg-white/8 px-4 py-1.5 text-xs font-semibold text-white transition hover:border-white/35"
            >
              Till startsidan
            </Link>
          </div>
        </div>
      </section>

      <ProjectStoryFeed
        projects={filtered}
        onOpenProject={(slug) => updateSearchParams({ project: slug })}
        title="Story Feed"
        subtitle="Scrollen styr progressionen och aktivt kort får tydlig visuell prioritet."
      />

      <ProjectDetailModal project={selectedProject} isOpen={Boolean(selectedProject)} onClose={() => updateSearchParams({ project: null })} />
    </main>
  );
}
