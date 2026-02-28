"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { Project } from "@/lib/types";
import { cn } from "@/lib/utils";

const editorSchema = z.object({
  slug: z
    .string()
    .min(2, "Slug måste innehålla minst 2 tecken")
    .regex(/^[a-z0-9-]+$/, "Slug får bara innehålla små bokstäver, siffror och bindestreck"),
  title: z.string().min(2, "Titel krävs"),
  shortDescription: z.string().min(10, "Kort beskrivning måste vara minst 10 tecken"),
  longDescription: z.string().min(30, "Lång beskrivning måste vara minst 30 tecken"),
  category: z.enum(["app", "game", "site"]),
  status: z.enum(["live", "wip", "archived"]),
  tagsInput: z.string().optional(),
  techStackInput: z.string().optional(),
  demoUrl: z.union([z.literal(""), z.string().url("Ogiltig URL")]),
  repoUrl: z.union([z.literal(""), z.string().url("Ogiltig URL")]),
  caseStudyUrl: z.union([z.literal(""), z.string().url("Ogiltig URL")])
});

type EditorValues = z.infer<typeof editorSchema>;

interface AdminProjectsClientProps {
  projects: Project[];
}

const EMPTY_VALUES: EditorValues = {
  slug: "",
  title: "",
  shortDescription: "",
  longDescription: "",
  category: "app",
  status: "wip",
  tagsInput: "",
  techStackInput: "",
  demoUrl: "",
  repoUrl: "",
  caseStudyUrl: ""
};

function projectToEditorValues(project: Project): EditorValues {
  return {
    slug: project.slug,
    title: project.title,
    shortDescription: project.shortDescription,
    longDescription: project.longDescription,
    category: project.category,
    status: project.status,
    tagsInput: project.tags.join(", "),
    techStackInput: project.techStack.join(", "),
    demoUrl: project.links.demoUrl ?? "",
    repoUrl: project.links.repoUrl ?? "",
    caseStudyUrl: project.links.caseStudyUrl ?? ""
  };
}

export function AdminProjectsClient({ projects }: AdminProjectsClientProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const coverFileRef = useRef<HTMLInputElement | null>(null);
  const galleryFileRef = useRef<HTMLInputElement | null>(null);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedId) ?? null,
    [projects, selectedId]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<EditorValues>({
    resolver: zodResolver(editorSchema),
    defaultValues: selectedProject ? projectToEditorValues(selectedProject) : EMPTY_VALUES
  });

  const isEditMode = Boolean(selectedProject);

  const setProjectForEditing = (projectId: string | null) => {
    setSelectedId(projectId);
    const project = projectId ? projects.find((item) => item.id === projectId) : null;

    if (!project) {
      reset(EMPTY_VALUES);
      return;
    }

    reset(projectToEditorValues(project));
  };

  const onSubmit = async (values: EditorValues) => {
    setFeedback(null);
    setIsSubmitting(true);

    const formData = new FormData();

    formData.set("slug", values.slug.trim());
    formData.set("title", values.title.trim());
    formData.set("shortDescription", values.shortDescription.trim());
    formData.set("longDescription", values.longDescription.trim());
    formData.set("category", values.category);
    formData.set("status", values.status);
    formData.set("tags", values.tagsInput ?? "");
    formData.set("techStack", values.techStackInput ?? "");
    formData.set("demoUrl", values.demoUrl.trim());
    formData.set("repoUrl", values.repoUrl.trim());
    formData.set("caseStudyUrl", values.caseStudyUrl.trim());

    const coverFile = coverFileRef.current?.files?.[0];
    if (coverFile) {
      formData.append("coverFile", coverFile);
    }

    const galleryFiles = galleryFileRef.current?.files;
    if (galleryFiles?.length) {
      Array.from(galleryFiles).forEach((file) => formData.append("galleryFiles", file));
    }

    let method: "POST" | "PUT" = "POST";

    if (selectedProject) {
      method = "PUT";
      formData.set("id", selectedProject.id);
      formData.set("existingCoverPath", selectedProject.visuals.coverPath ?? "");
      formData.set("existingGalleryPaths", JSON.stringify(selectedProject.visuals.galleryPaths ?? []));
    }

    const response = await fetch("/api/admin/projects", {
      method,
      body: formData
    });

    const payload = await response.json();

    if (!response.ok) {
      setFeedback({ type: "error", message: payload.error ?? "Kunde inte spara projekt" });
      setIsSubmitting(false);
      return;
    }

    setFeedback({ type: "success", message: method === "POST" ? "Projekt skapat" : "Projekt uppdaterat" });

    if (!selectedProject) {
      reset(EMPTY_VALUES);
      if (coverFileRef.current) {
        coverFileRef.current.value = "";
      }
      if (galleryFileRef.current) {
        galleryFileRef.current.value = "";
      }
    }

    router.refresh();
    setIsSubmitting(false);
  };

  const handleDelete = async (projectId: string) => {
    setFeedback(null);

    const confirmed = window.confirm("Vill du radera projektet permanent?");
    if (!confirmed) {
      return;
    }

    const response = await fetch("/api/admin/projects", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id: projectId })
    });

    const payload = await response.json();

    if (!response.ok) {
      setFeedback({ type: "error", message: payload.error ?? "Kunde inte radera projekt" });
      return;
    }

    if (selectedId === projectId) {
      setProjectForEditing(null);
    }

    setFeedback({ type: "success", message: "Projekt raderat" });
    router.refresh();
  };

  return (
    <section className="section-shell">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="admin-surface rounded-3xl p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-slate-100">Projekt</h1>
            <button type="button" onClick={() => setProjectForEditing(null)} className="btn-primary-amber px-3 py-1 text-xs">
              Nytt
            </button>
          </div>

          <div className="space-y-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className={cn(
                  "rounded-2xl border p-3 transition",
                  selectedId === project.id
                    ? "border-amber-300/45 bg-amber-500/14"
                    : "border-slate-700/80 bg-slate-900/66 hover:border-slate-500/85"
                )}
              >
                <button type="button" onClick={() => setProjectForEditing(project.id)} className="w-full text-left">
                  <p className="text-sm font-semibold text-slate-100">{project.title}</p>
                  <p className="mt-1 text-xs text-slate-400">/{project.slug}</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(project.id)}
                  className="mt-2 rounded-full border border-rose-400/45 bg-rose-500/14 px-2.5 py-1 text-[11px] font-semibold text-rose-200"
                >
                  Radera
                </button>
              </div>
            ))}
          </div>
        </aside>

        <div className="admin-surface rounded-3xl p-5 sm:p-7">
          <h2 className="text-2xl font-semibold text-slate-100">{isEditMode ? "Redigera projekt" : "Skapa projekt"}</h2>
          <p className="mt-2 text-sm text-slate-300">
            Media laddas till <code>project-media</code>-bucketen. Tags och tech stack skrivs kommaseparerat.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Titel</span>
                <input {...register("title")} className="glass-input w-full px-3 py-2 text-sm focus:border-amber-300/70 focus:outline-none" />
                {errors.title ? <p className="mt-1 text-xs text-rose-300">{errors.title.message}</p> : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Slug</span>
                <input {...register("slug")} className="glass-input w-full px-3 py-2 text-sm focus:border-amber-300/70 focus:outline-none" />
                {errors.slug ? <p className="mt-1 text-xs text-rose-300">{errors.slug.message}</p> : null}
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Kategori</span>
                <select {...register("category")} className="glass-input w-full px-3 py-2 text-sm focus:border-amber-300/70 focus:outline-none">
                  <option value="app">{CATEGORY_LABELS.app}</option>
                  <option value="game">{CATEGORY_LABELS.game}</option>
                  <option value="site">{CATEGORY_LABELS.site}</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Status</span>
                <select {...register("status")} className="glass-input w-full px-3 py-2 text-sm focus:border-amber-300/70 focus:outline-none">
                  <option value="live">{STATUS_LABELS.live}</option>
                  <option value="wip">{STATUS_LABELS.wip}</option>
                  <option value="archived">{STATUS_LABELS.archived}</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Kort beskrivning</span>
              <textarea
                rows={3}
                {...register("shortDescription")}
                className="glass-input w-full px-3 py-2 text-sm focus:border-amber-300/70 focus:outline-none"
              />
              {errors.shortDescription ? <p className="mt-1 text-xs text-rose-300">{errors.shortDescription.message}</p> : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Lång beskrivning</span>
              <textarea
                rows={6}
                {...register("longDescription")}
                className="glass-input w-full px-3 py-2 text-sm focus:border-amber-300/70 focus:outline-none"
              />
              {errors.longDescription ? <p className="mt-1 text-xs text-rose-300">{errors.longDescription.message}</p> : null}
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Tags</span>
                <input
                  {...register("tagsInput")}
                  placeholder="nextjs, framer-motion, ai"
                  className="glass-input w-full px-3 py-2 text-sm focus:border-amber-300/70 focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Tech stack</span>
                <input
                  {...register("techStackInput")}
                  placeholder="Next.js, TypeScript, Supabase"
                  className="glass-input w-full px-3 py-2 text-sm focus:border-amber-300/70 focus:outline-none"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Demo URL</span>
                <input
                  {...register("demoUrl")}
                  placeholder="https://"
                  className="glass-input w-full px-3 py-2 text-sm focus:border-amber-300/70 focus:outline-none"
                />
                {errors.demoUrl ? <p className="mt-1 text-xs text-rose-300">{errors.demoUrl.message}</p> : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Repo URL</span>
                <input
                  {...register("repoUrl")}
                  placeholder="https://"
                  className="glass-input w-full px-3 py-2 text-sm focus:border-amber-300/70 focus:outline-none"
                />
                {errors.repoUrl ? <p className="mt-1 text-xs text-rose-300">{errors.repoUrl.message}</p> : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Case Study URL</span>
                <input
                  {...register("caseStudyUrl")}
                  placeholder="https://"
                  className="glass-input w-full px-3 py-2 text-sm focus:border-amber-300/70 focus:outline-none"
                />
                {errors.caseStudyUrl ? <p className="mt-1 text-xs text-rose-300">{errors.caseStudyUrl.message}</p> : null}
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Omslagsbild</span>
                <input
                  ref={coverFileRef}
                  type="file"
                  accept="image/*"
                  className="glass-input w-full px-3 py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-slate-700 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-slate-100"
                />
                {selectedProject?.visuals.coverPath ? (
                  <p className="mt-1 text-xs text-slate-400">Nuvarande: {selectedProject.visuals.coverPath}</p>
                ) : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Galleri (flera filer)</span>
                <input
                  ref={galleryFileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="glass-input w-full px-3 py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-slate-700 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-slate-100"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Nuvarande galleri:
                  {selectedProject?.visuals.galleryPaths?.length ? ` ${selectedProject.visuals.galleryPaths.length} filer` : " inga"}
                </p>
              </label>
            </div>

            {feedback ? (
              <p
                className={cn(
                  "rounded-xl border px-3 py-2 text-sm",
                  feedback.type === "error"
                    ? "border-rose-400/40 bg-rose-500/12 text-rose-200"
                    : "border-emerald-400/40 bg-emerald-500/12 text-emerald-200"
                )}
              >
                {feedback.message}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary-amber px-5 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Sparar..." : isEditMode ? "Spara ändringar" : "Skapa projekt"}
              </button>

              {isEditMode ? (
                <button type="button" onClick={() => setProjectForEditing(null)} className="btn-secondary-dark px-5 py-2 text-sm">
                  Avbryt redigering
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
