"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SiteSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

const settingsEditorSchema = z.object({
  displayName: z.string().min(2, "Display name krävs"),
  tagline: z.string().min(10, "Tagline måste vara minst 10 tecken"),
  bio: z.string().min(20, "Bio måste vara minst 20 tecken"),
  heroCtaPrimary: z.string().min(2, "Primär CTA krävs"),
  heroCtaSecondary: z.string().min(2, "Sekundär CTA krävs"),
  github: z.union([z.literal(""), z.string().url("Ogiltig URL")]),
  linkedin: z.union([z.literal(""), z.string().url("Ogiltig URL")]),
  x: z.union([z.literal(""), z.string().url("Ogiltig URL")]),
  email: z.union([z.literal(""), z.string().email("Ogiltig e-post")])
});

type SettingsEditorValues = z.infer<typeof settingsEditorSchema>;

interface AdminSettingsFormProps {
  settings: SiteSettings;
}

export function AdminSettingsForm({ settings }: AdminSettingsFormProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SettingsEditorValues>({
    resolver: zodResolver(settingsEditorSchema),
    defaultValues: {
      displayName: settings.displayName,
      tagline: settings.tagline,
      bio: settings.bio,
      heroCtaPrimary: settings.heroCtaPrimary,
      heroCtaSecondary: settings.heroCtaSecondary,
      github: settings.socialLinks.github ?? "",
      linkedin: settings.socialLinks.linkedin ?? "",
      x: settings.socialLinks.x ?? "",
      email: settings.socialLinks.email?.replace("mailto:", "") ?? ""
    }
  });

  const onSubmit = async (values: SettingsEditorValues) => {
    setIsSubmitting(true);
    setFeedback(null);

    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });

    const payload = await response.json();

    if (!response.ok) {
      setFeedback({ type: "error", message: payload.error ?? "Kunde inte spara inställningar" });
      setIsSubmitting(false);
      return;
    }

    setFeedback({ type: "success", message: "Inställningar sparade" });
    setIsSubmitting(false);
    router.refresh();
  };

  return (
    <section className="section-shell">
      <div className="glass-panel rounded-3xl p-6 shadow-glass sm:p-8">
        <h1 className="text-3xl font-bold text-white">Site settings</h1>
        <p className="mt-2 text-sm text-white/70">Ändringar slår igenom direkt på publika sidor.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/60">Display name</span>
              <input
                {...register("displayName")}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:border-cyan-200/70 focus:outline-none"
              />
              {errors.displayName ? <p className="mt-1 text-xs text-rose-100">{errors.displayName.message}</p> : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/60">Tagline</span>
              <input
                {...register("tagline")}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:border-cyan-200/70 focus:outline-none"
              />
              {errors.tagline ? <p className="mt-1 text-xs text-rose-100">{errors.tagline.message}</p> : null}
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/60">Bio</span>
            <textarea
              rows={5}
              {...register("bio")}
              className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:border-cyan-200/70 focus:outline-none"
            />
            {errors.bio ? <p className="mt-1 text-xs text-rose-100">{errors.bio.message}</p> : null}
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/60">Hero CTA Primary</span>
              <input
                {...register("heroCtaPrimary")}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:border-cyan-200/70 focus:outline-none"
              />
              {errors.heroCtaPrimary ? <p className="mt-1 text-xs text-rose-100">{errors.heroCtaPrimary.message}</p> : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/60">Hero CTA Secondary</span>
              <input
                {...register("heroCtaSecondary")}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:border-cyan-200/70 focus:outline-none"
              />
              {errors.heroCtaSecondary ? <p className="mt-1 text-xs text-rose-100">{errors.heroCtaSecondary.message}</p> : null}
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/60">GitHub URL</span>
              <input
                {...register("github")}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:border-cyan-200/70 focus:outline-none"
              />
              {errors.github ? <p className="mt-1 text-xs text-rose-100">{errors.github.message}</p> : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/60">LinkedIn URL</span>
              <input
                {...register("linkedin")}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:border-cyan-200/70 focus:outline-none"
              />
              {errors.linkedin ? <p className="mt-1 text-xs text-rose-100">{errors.linkedin.message}</p> : null}
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/60">X URL</span>
              <input
                {...register("x")}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:border-cyan-200/70 focus:outline-none"
              />
              {errors.x ? <p className="mt-1 text-xs text-rose-100">{errors.x.message}</p> : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/60">Kontakt e-post</span>
              <input
                {...register("email")}
                placeholder="hej@example.com"
                className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:border-cyan-200/70 focus:outline-none"
              />
              {errors.email ? <p className="mt-1 text-xs text-rose-100">{errors.email.message}</p> : null}
            </label>
          </div>

          {feedback ? (
            <p
              className={cn(
                "rounded-xl border px-3 py-2 text-sm",
                feedback.type === "error"
                  ? "border-rose-300/45 bg-rose-400/10 text-rose-100"
                  : "border-emerald-300/45 bg-emerald-400/10 text-emerald-100"
              )}
            >
              {feedback.message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl border border-cyan-200/60 bg-cyan-200/20 px-5 py-2 text-sm font-semibold text-cyan-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Sparar..." : "Spara inställningar"}
          </button>
        </form>
      </div>
    </section>
  );
}
