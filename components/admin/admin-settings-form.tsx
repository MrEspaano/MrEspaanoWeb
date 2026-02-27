"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HomeHub } from "@/components/hub/home-hub";
import { DEFAULT_HUB_DESIGN_CONFIG, normalizeHubDesignConfig } from "@/lib/design-config";
import { HubDesignConfig, HubModuleConfig, HubModuleKey, Project, SiteSettings } from "@/lib/types";
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
type PreviewPreset = "desktop" | "laptop" | "tablet" | "mobile";

interface AdminSettingsFormProps {
  settings: SiteSettings;
  projects: Project[];
}

const MODULE_LABELS: Record<HubModuleKey, string> = {
  stickyCategoryMorph: "Filtrera projekt",
  featured: "Featured",
  textReveal: "Text reveal",
  storyFeed: "Projekt-feed"
};

function NumberField({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (next: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/60">{label}</span>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full"
        />
        <span className="w-20 text-right text-xs text-white/80">
          {value}
          {suffix ?? ""}
        </span>
      </div>
    </label>
  );
}

function move<T>(array: T[], from: number, to: number) {
  const copy = [...array];
  const [picked] = copy.splice(from, 1);
  copy.splice(to, 0, picked);
  return copy;
}

export function AdminSettingsForm({ settings, projects }: AdminSettingsFormProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewPreset, setPreviewPreset] = useState<PreviewPreset>("desktop");
  const [designConfig, setDesignConfig] = useState<HubDesignConfig>(
    normalizeHubDesignConfig(settings.designConfig ?? DEFAULT_HUB_DESIGN_CONFIG)
  );

  const {
    register,
    handleSubmit,
    watch,
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

  const values = watch();

  const previewSettings = useMemo<SiteSettings>(
    () => ({
      ...settings,
      displayName: values.displayName || settings.displayName,
      tagline: values.tagline || settings.tagline,
      bio: values.bio || settings.bio,
      heroCtaPrimary: values.heroCtaPrimary || settings.heroCtaPrimary,
      heroCtaSecondary: values.heroCtaSecondary || settings.heroCtaSecondary,
      socialLinks: {
        github: values.github || undefined,
        linkedin: values.linkedin || undefined,
        x: values.x || undefined,
        email: values.email ? `mailto:${values.email}` : undefined
      },
      designConfig
    }),
    [values, settings, designConfig]
  );

  const previewWidth = {
    desktop: 1440,
    laptop: 1280,
    tablet: 1024,
    mobile: 390
  }[previewPreset];

  const updateModule = (moduleKey: HubModuleKey, patch: Partial<HubModuleConfig>) => {
    setDesignConfig((previous) => ({
      ...previous,
      modules: {
        ...previous.modules,
        [moduleKey]: {
          ...previous.modules[moduleKey],
          ...patch
        }
      }
    }));
  };

  const onSubmit = async (formValues: SettingsEditorValues) => {
    setIsSubmitting(true);
    setFeedback(null);

    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...formValues,
        designConfig
      })
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
    <section className="mx-auto w-full max-w-[1900px] px-4 sm:px-6 lg:px-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(430px,560px)_minmax(0,1fr)]">
        <div className="glass-panel rounded-3xl p-6 shadow-glass sm:p-8">
          <h1 className="text-3xl font-bold text-white">Site + Design settings</h1>
          <p className="mt-2 text-sm text-white/70">Allt här uppdateras i live preview direkt.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-6">
            <div className="space-y-5 rounded-2xl border border-white/15 bg-white/5 p-4">
              <h2 className="text-lg font-semibold text-white">Innehåll</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/60">Display name</span>
                  <input {...register("displayName")} className="glass-input w-full px-3 py-2 text-sm focus:outline-none" />
                  {errors.displayName ? <p className="mt-1 text-xs text-rose-100">{errors.displayName.message}</p> : null}
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/60">Tagline</span>
                  <input {...register("tagline")} className="glass-input w-full px-3 py-2 text-sm focus:outline-none" />
                  {errors.tagline ? <p className="mt-1 text-xs text-rose-100">{errors.tagline.message}</p> : null}
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/60">Bio</span>
                <textarea rows={4} {...register("bio")} className="glass-input w-full px-3 py-2 text-sm focus:outline-none" />
                {errors.bio ? <p className="mt-1 text-xs text-rose-100">{errors.bio.message}</p> : null}
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/60">Hero CTA Primary</span>
                  <input {...register("heroCtaPrimary")} className="glass-input w-full px-3 py-2 text-sm focus:outline-none" />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/60">Hero CTA Secondary</span>
                  <input {...register("heroCtaSecondary")} className="glass-input w-full px-3 py-2 text-sm focus:outline-none" />
                </label>
              </div>
            </div>

            <div className="space-y-5 rounded-2xl border border-white/15 bg-white/5 p-4">
              <h2 className="text-lg font-semibold text-white">Global design</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/60">Display-font</span>
                  <select
                    value={designConfig.global.displayFont}
                    onChange={(event) =>
                      setDesignConfig((previous) => ({
                        ...previous,
                        global: {
                          ...previous.global,
                          displayFont: event.target.value as HubDesignConfig["global"]["displayFont"]
                        }
                      }))
                    }
                    className="glass-input w-full px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="syne">Syne</option>
                    <option value="space-grotesk">Space Grotesk</option>
                    <option value="sora">Sora</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/60">Brödtext-font</span>
                  <select
                    value={designConfig.global.bodyFont}
                    onChange={(event) =>
                      setDesignConfig((previous) => ({
                        ...previous,
                        global: {
                          ...previous.global,
                          bodyFont: event.target.value as HubDesignConfig["global"]["bodyFont"]
                        }
                      }))
                    }
                    className="glass-input w-full px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="manrope">Manrope</option>
                    <option value="inter">Inter</option>
                    <option value="system">System</option>
                  </select>
                </label>
              </div>

              <NumberField
                label="Max innehållsbredd"
                value={designConfig.global.contentMaxWidth}
                min={960}
                max={1560}
                step={10}
                suffix="px"
                onChange={(next) =>
                  setDesignConfig((previous) => ({
                    ...previous,
                    global: { ...previous.global, contentMaxWidth: next }
                  }))
                }
              />

              <div className="grid gap-4 md:grid-cols-3">
                <NumberField
                  label="Media saturation"
                  value={designConfig.global.mediaSaturation}
                  min={0.7}
                  max={1.6}
                  step={0.01}
                  onChange={(next) =>
                    setDesignConfig((previous) => ({
                      ...previous,
                      global: { ...previous.global, mediaSaturation: next }
                    }))
                  }
                />
                <NumberField
                  label="Media contrast"
                  value={designConfig.global.mediaContrast}
                  min={0.7}
                  max={1.5}
                  step={0.01}
                  onChange={(next) =>
                    setDesignConfig((previous) => ({
                      ...previous,
                      global: { ...previous.global, mediaContrast: next }
                    }))
                  }
                />
                <NumberField
                  label="Media brightness"
                  value={designConfig.global.mediaBrightness}
                  min={0.7}
                  max={1.35}
                  step={0.01}
                  onChange={(next) =>
                    setDesignConfig((previous) => ({
                      ...previous,
                      global: { ...previous.global, mediaBrightness: next }
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-5 rounded-2xl border border-white/15 bg-white/5 p-4">
              <h2 className="text-lg font-semibold text-white">Hero</h2>
              <NumberField
                label="Hero maxbredd"
                value={designConfig.hero.maxWidth}
                min={620}
                max={1440}
                step={10}
                suffix="px"
                onChange={(next) => setDesignConfig((previous) => ({ ...previous, hero: { ...previous.hero, maxWidth: next } }))}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <NumberField
                  label="Titel skala"
                  value={designConfig.hero.titleScale}
                  min={0.7}
                  max={1.4}
                  step={0.01}
                  onChange={(next) => setDesignConfig((previous) => ({ ...previous, hero: { ...previous.hero, titleScale: next } }))}
                />
                <NumberField
                  label="Brödtext skala"
                  value={designConfig.hero.bodyScale}
                  min={0.7}
                  max={1.3}
                  step={0.01}
                  onChange={(next) => setDesignConfig((previous) => ({ ...previous, hero: { ...previous.hero, bodyScale: next } }))}
                />
                <NumberField
                  label="CTA skala"
                  value={designConfig.hero.ctaScale}
                  min={0.7}
                  max={1.3}
                  step={0.01}
                  onChange={(next) => setDesignConfig((previous) => ({ ...previous, hero: { ...previous.hero, ctaScale: next } }))}
                />
                <NumberField
                  label="Hero opacity"
                  value={designConfig.hero.opacity}
                  min={0.2}
                  max={1}
                  step={0.01}
                  onChange={(next) => setDesignConfig((previous) => ({ ...previous, hero: { ...previous.hero, opacity: next } }))}
                />
              </div>
            </div>

            <div className="space-y-5 rounded-2xl border border-white/15 bg-white/5 p-4">
              <h2 className="text-lg font-semibold text-white">Moduler</h2>
              <div className="space-y-3">
                {designConfig.modules.order.map((moduleKey, index) => {
                  const moduleConfig = designConfig.modules[moduleKey];

                  return (
                    <div key={moduleKey} className="rounded-xl border border-white/15 bg-white/5 p-3">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white">{MODULE_LABELS[moduleKey]}</p>
                          <label className="flex items-center gap-1 text-xs text-white/80">
                            <input
                              type="checkbox"
                              checked={moduleConfig.visible}
                              onChange={(event) => updateModule(moduleKey, { visible: event.target.checked })}
                            />
                            Synlig
                          </label>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (index === 0) {
                                return;
                              }
                              setDesignConfig((previous) => ({
                                ...previous,
                                modules: {
                                  ...previous.modules,
                                  order: move(previous.modules.order, index, index - 1)
                                }
                              }));
                            }}
                            className="glass-chip px-2 py-1 text-xs"
                          >
                            Upp
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (index === designConfig.modules.order.length - 1) {
                                return;
                              }
                              setDesignConfig((previous) => ({
                                ...previous,
                                modules: {
                                  ...previous.modules,
                                  order: move(previous.modules.order, index, index + 1)
                                }
                              }));
                            }}
                            className="glass-chip px-2 py-1 text-xs"
                          >
                            Ner
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-3">
                        <NumberField
                          label="Opacity"
                          value={moduleConfig.opacity}
                          min={0.15}
                          max={1}
                          step={0.01}
                          onChange={(next) => updateModule(moduleKey, { opacity: next })}
                        />
                        <NumberField
                          label="Skala"
                          value={moduleConfig.scale}
                          min={0.75}
                          max={1.25}
                          step={0.01}
                          onChange={(next) => updateModule(moduleKey, { scale: next })}
                        />
                        <NumberField
                          label="Y-förskjutning"
                          value={moduleConfig.yOffset}
                          min={-180}
                          max={180}
                          step={1}
                          suffix="px"
                          onChange={(next) => updateModule(moduleKey, { yOffset: next })}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-white/15 bg-white/5 p-4">
              <h2 className="text-lg font-semibold text-white">Sociala länkar</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <input {...register("github")} placeholder="GitHub URL" className="glass-input w-full px-3 py-2 text-sm focus:outline-none" />
                <input
                  {...register("linkedin")}
                  placeholder="LinkedIn URL"
                  className="glass-input w-full px-3 py-2 text-sm focus:outline-none"
                />
                <input {...register("x")} placeholder="X URL" className="glass-input w-full px-3 py-2 text-sm focus:outline-none" />
                <input {...register("email")} placeholder="Kontakt e-post" className="glass-input w-full px-3 py-2 text-sm focus:outline-none" />
              </div>
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

        <div className="glass-panel sticky top-4 h-[88vh] overflow-hidden rounded-3xl p-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-2">
            <p className="text-xs uppercase tracking-[0.22em] text-white/70">Live preview</p>
            <div className="flex items-center gap-1">
              {(
                [
                  { key: "desktop", label: "Desktop" },
                  { key: "laptop", label: "Laptop" },
                  { key: "tablet", label: "Tablet" },
                  { key: "mobile", label: "Mobil" }
                ] as { key: PreviewPreset; label: string }[]
              ).map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => setPreviewPreset(preset.key)}
                  className={cn(
                    "glass-chip px-2.5 py-1 text-[11px] font-semibold",
                    previewPreset === preset.key ? "border-cyan-50/75 bg-cyan-50/30 text-slate-900" : "text-white/85"
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[calc(100%-2.5rem)] overflow-auto rounded-2xl border border-white/20 bg-slate-950/20 p-2">
            <div style={{ width: `${previewWidth}px` }} className="min-h-full max-w-none">
              <HomeHub settings={previewSettings} projects={projects} previewMode />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
