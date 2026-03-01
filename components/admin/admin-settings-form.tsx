"use client";

import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HomeHub } from "@/components/hub/home-hub";
import { DEFAULT_HUB_DESIGN_CONFIG, normalizeHubDesignConfig, resolveHubDesignForPreset } from "@/lib/design-config";
import { HubDesignConfig, HubDesignProfile, HubModuleConfig, HubModuleKey, HubViewportPreset, Project, SiteSettings } from "@/lib/types";
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
type PreviewPreset = HubViewportPreset;

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
      <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">{label}</span>
      <div className="flex items-center gap-3">
        <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full" />
        <span className="w-20 text-right text-xs text-slate-200">
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

function cloneProfile(profile: HubDesignProfile): HubDesignProfile {
  return {
    global: { ...profile.global },
    hero: { ...profile.hero },
    modules: {
      ...profile.modules,
      order: [...profile.modules.order],
      stickyCategoryMorph: { ...profile.modules.stickyCategoryMorph },
      featured: { ...profile.modules.featured },
      textReveal: { ...profile.modules.textReveal },
      storyFeed: { ...profile.modules.storyFeed }
    }
  };
}

export function AdminSettingsForm({ settings, projects }: AdminSettingsFormProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewPreset, setPreviewPreset] = useState<PreviewPreset>("desktop");
  const [designConfig, setDesignConfig] = useState<HubDesignConfig>(
    normalizeHubDesignConfig(settings.designConfig ?? DEFAULT_HUB_DESIGN_CONFIG)
  );

  const previewViewportRef = useRef<HTMLDivElement>(null);
  const [previewFrameWidth, setPreviewFrameWidth] = useState(900);

  useEffect(() => {
    const target = previewViewportRef.current;
    if (!target) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) {
        setPreviewFrameWidth(width);
      }
    });

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, []);

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
    desktop: 1366,
    laptop: 1200,
    tablet: 1024,
    mobile: 390
  }[previewPreset];

  const previewScale = useMemo(() => {
    const available = Math.max(300, previewFrameWidth - 16);
    return Math.min(1, available / previewWidth);
  }, [previewFrameWidth, previewWidth]);
  const previewIsTouch = previewPreset === "mobile" || previewPreset === "tablet";

  const activeDesign = useMemo(
    () => resolveHubDesignForPreset(designConfig, previewPreset),
    [designConfig, previewPreset]
  );

  const updateActiveDesign = (patcher: (current: HubDesignProfile) => HubDesignProfile) => {
    setDesignConfig((previous) => {
      const current = resolveHubDesignForPreset(previous, previewPreset);
      const next = patcher(cloneProfile(current));
      return {
        ...previous,
        breakpoints: {
          ...(previous.breakpoints ?? {}),
          [previewPreset]: next
        }
      };
    });
  };

  const updateModule = (moduleKey: HubModuleKey, patch: Partial<HubModuleConfig>) => {
    updateActiveDesign((current) => ({
      ...current,
      modules: {
        ...current.modules,
        [moduleKey]: {
          ...current.modules[moduleKey],
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
    <section className="mx-auto w-full max-w-[2200px] px-4 sm:px-6 lg:px-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(380px,500px)_minmax(0,1fr)]">
        <div className="admin-surface rounded-3xl p-6 sm:p-8">
          <h1 className="text-3xl font-semibold text-slate-100">Site + Design settings</h1>
          <p className="mt-2 text-sm text-slate-300">Allt här uppdateras i live preview direkt.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-6">
            <div className="admin-subsurface space-y-5 p-4">
              <h2 className="text-lg font-semibold text-slate-100">Innehåll</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Display name</span>
                  <input
                    {...register("displayName")}
                    className="glass-input w-full px-3 py-2 text-sm focus:border-amber-300/70 focus:outline-none"
                  />
                  {errors.displayName ? <p className="mt-1 text-xs text-rose-300">{errors.displayName.message}</p> : null}
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Tagline</span>
                  <input
                    {...register("tagline")}
                    className="glass-input w-full px-3 py-2 text-sm focus:border-amber-300/70 focus:outline-none"
                  />
                  {errors.tagline ? <p className="mt-1 text-xs text-rose-300">{errors.tagline.message}</p> : null}
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Bio</span>
                <textarea
                  rows={4}
                  {...register("bio")}
                  className="glass-input w-full px-3 py-2 text-sm focus:border-amber-300/70 focus:outline-none"
                />
                {errors.bio ? <p className="mt-1 text-xs text-rose-300">{errors.bio.message}</p> : null}
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Hero CTA Primary</span>
                  <input
                    {...register("heroCtaPrimary")}
                    className="glass-input w-full px-3 py-2 text-sm focus:border-amber-300/70 focus:outline-none"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Hero CTA Secondary</span>
                  <input
                    {...register("heroCtaSecondary")}
                    className="glass-input w-full px-3 py-2 text-sm focus:border-amber-300/70 focus:outline-none"
                  />
                </label>
              </div>
            </div>

            <div className="admin-subsurface space-y-5 p-4">
              <h2 className="text-lg font-semibold text-slate-100">Global design</h2>
              <p className="text-xs text-slate-400">Du redigerar nu: <span className="font-semibold text-slate-200">{previewPreset}</span></p>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Display-font</span>
                  <select
                    value={activeDesign.global.displayFont}
                    onChange={(event) =>
                      updateActiveDesign((current) => ({
                        ...current,
                        global: {
                          ...current.global,
                          displayFont: event.target.value as HubDesignConfig["global"]["displayFont"]
                        }
                      }))
                    }
                    className="glass-input w-full px-3 py-2 text-sm focus:border-amber-300/70 focus:outline-none"
                  >
                    <option value="syne">Syne</option>
                    <option value="space-grotesk">Space Grotesk</option>
                    <option value="sora">Sora</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Brödtext-font</span>
                  <select
                    value={activeDesign.global.bodyFont}
                    onChange={(event) =>
                      updateActiveDesign((current) => ({
                        ...current,
                        global: {
                          ...current.global,
                          bodyFont: event.target.value as HubDesignConfig["global"]["bodyFont"]
                        }
                      }))
                    }
                    className="glass-input w-full px-3 py-2 text-sm focus:border-amber-300/70 focus:outline-none"
                  >
                    <option value="manrope">Manrope</option>
                    <option value="inter">Inter</option>
                    <option value="system">System</option>
                  </select>
                </label>
              </div>

              <NumberField
                label="Max innehållsbredd"
                value={activeDesign.global.contentMaxWidth}
                min={960}
                max={1560}
                step={10}
                suffix="px"
                onChange={(next) => updateActiveDesign((current) => ({ ...current, global: { ...current.global, contentMaxWidth: next } }))}
              />

              <div className="grid gap-4 md:grid-cols-3">
                <NumberField
                  label="Media saturation"
                  value={activeDesign.global.mediaSaturation}
                  min={0.7}
                  max={1.6}
                  step={0.01}
                  onChange={(next) => updateActiveDesign((current) => ({ ...current, global: { ...current.global, mediaSaturation: next } }))}
                />
                <NumberField
                  label="Media contrast"
                  value={activeDesign.global.mediaContrast}
                  min={0.7}
                  max={1.5}
                  step={0.01}
                  onChange={(next) => updateActiveDesign((current) => ({ ...current, global: { ...current.global, mediaContrast: next } }))}
                />
                <NumberField
                  label="Media brightness"
                  value={activeDesign.global.mediaBrightness}
                  min={0.7}
                  max={1.35}
                  step={0.01}
                  onChange={(next) => updateActiveDesign((current) => ({ ...current, global: { ...current.global, mediaBrightness: next } }))}
                />
              </div>
            </div>

            <div className="admin-subsurface space-y-5 p-4">
              <h2 className="text-lg font-semibold text-slate-100">Hero</h2>
              <NumberField
                label="Hero maxbredd"
                value={activeDesign.hero.maxWidth}
                min={620}
                max={1440}
                step={10}
                suffix="px"
                onChange={(next) => updateActiveDesign((current) => ({ ...current, hero: { ...current.hero, maxWidth: next } }))}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <NumberField
                  label="Titel skala"
                  value={activeDesign.hero.titleScale}
                  min={0.7}
                  max={1.4}
                  step={0.01}
                  onChange={(next) => updateActiveDesign((current) => ({ ...current, hero: { ...current.hero, titleScale: next } }))}
                />
                <NumberField
                  label="Titel maxbredd"
                  value={activeDesign.hero.titleMaxWidth}
                  min={360}
                  max={1400}
                  step={10}
                  suffix="px"
                  onChange={(next) => updateActiveDesign((current) => ({ ...current, hero: { ...current.hero, titleMaxWidth: next } }))}
                />
                <NumberField
                  label="Titel radhöjd"
                  value={activeDesign.hero.titleLineHeight}
                  min={0.8}
                  max={1.4}
                  step={0.01}
                  onChange={(next) => updateActiveDesign((current) => ({ ...current, hero: { ...current.hero, titleLineHeight: next } }))}
                />
                <NumberField
                  label="Brödtext skala"
                  value={activeDesign.hero.bodyScale}
                  min={0.7}
                  max={1.3}
                  step={0.01}
                  onChange={(next) => updateActiveDesign((current) => ({ ...current, hero: { ...current.hero, bodyScale: next } }))}
                />
                <NumberField
                  label="Brödtext maxbredd"
                  value={activeDesign.hero.bodyMaxWidth}
                  min={320}
                  max={1280}
                  step={10}
                  suffix="px"
                  onChange={(next) => updateActiveDesign((current) => ({ ...current, hero: { ...current.hero, bodyMaxWidth: next } }))}
                />
                <NumberField
                  label="Brödtext radhöjd"
                  value={activeDesign.hero.bodyLineHeight}
                  min={1.1}
                  max={2.2}
                  step={0.01}
                  onChange={(next) => updateActiveDesign((current) => ({ ...current, hero: { ...current.hero, bodyLineHeight: next } }))}
                />
                <NumberField
                  label="CTA skala"
                  value={activeDesign.hero.ctaScale}
                  min={0.7}
                  max={1.3}
                  step={0.01}
                  onChange={(next) => updateActiveDesign((current) => ({ ...current, hero: { ...current.hero, ctaScale: next } }))}
                />
                <NumberField
                  label="Hero opacity"
                  value={activeDesign.hero.opacity}
                  min={0.2}
                  max={1}
                  step={0.01}
                  onChange={(next) => updateActiveDesign((current) => ({ ...current, hero: { ...current.hero, opacity: next } }))}
                />
              </div>
            </div>

            <div className="admin-subsurface space-y-5 p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-100">Hero-logga</h2>
                <button
                  type="button"
                  className="glass-chip px-3 py-1 text-xs font-semibold text-slate-200"
                  onClick={() => updateActiveDesign((current) => ({ ...current, hero: { ...current.hero, logoOffsetX: 0, logoOffsetY: 0, logoScale: 1 } }))}
                >
                  Återställ
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Flytta loggan manuellt i preview. Mobil/tablet använder en mjukare offset för att loggan alltid ska vara synlig.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <NumberField
                  label="Logo X-offset"
                  value={activeDesign.hero.logoOffsetX}
                  min={-220}
                  max={220}
                  step={1}
                  suffix="px"
                  onChange={(next) => updateActiveDesign((current) => ({ ...current, hero: { ...current.hero, logoOffsetX: next } }))}
                />
                <NumberField
                  label="Logo Y-offset"
                  value={activeDesign.hero.logoOffsetY}
                  min={-220}
                  max={220}
                  step={1}
                  suffix="px"
                  onChange={(next) => updateActiveDesign((current) => ({ ...current, hero: { ...current.hero, logoOffsetY: next } }))}
                />
                <NumberField
                  label="Logo skala"
                  value={activeDesign.hero.logoScale}
                  min={0.5}
                  max={1.6}
                  step={0.01}
                  onChange={(next) => updateActiveDesign((current) => ({ ...current, hero: { ...current.hero, logoScale: next } }))}
                />
              </div>
            </div>

            <div className="admin-subsurface space-y-5 p-4">
              <h2 className="text-lg font-semibold text-slate-100">Moduler</h2>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Text reveal copy</span>
                <textarea
                  rows={4}
                  value={activeDesign.modules.textRevealCopy}
                  onChange={(event) =>
                    updateActiveDesign((current) => ({
                      ...current,
                      modules: {
                        ...current.modules,
                        textRevealCopy: event.target.value
                      }
                    }))
                  }
                  className="glass-input w-full px-3 py-2 text-sm focus:border-amber-300/70 focus:outline-none"
                />
                <p className="mt-1 text-xs text-slate-400">Minst 20 tecken. Visas i “Bonus moment”-sektionen.</p>
              </label>

              <div className="space-y-3">
                {activeDesign.modules.order.map((moduleKey, index) => {
                  const moduleConfig = activeDesign.modules[moduleKey];

                  return (
                    <div key={moduleKey} className="rounded-xl border border-slate-700/85 bg-slate-900/66 p-3">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-100">{MODULE_LABELS[moduleKey]}</p>
                          <label className="flex items-center gap-1 text-xs text-slate-300">
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
                              updateActiveDesign((current) => ({
                                ...current,
                                modules: { ...current.modules, order: move(current.modules.order, index, index - 1) }
                              }));
                            }}
                            className="btn-secondary-dark px-2 py-1 text-xs"
                          >
                            Upp
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (index === activeDesign.modules.order.length - 1) {
                                return;
                              }
                              updateActiveDesign((current) => ({
                                ...current,
                                modules: { ...current.modules, order: move(current.modules.order, index, index + 1) }
                              }));
                            }}
                            className="btn-secondary-dark px-2 py-1 text-xs"
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

            <div className="admin-subsurface space-y-4 p-4">
              <h2 className="text-lg font-semibold text-slate-100">Sociala länkar</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  {...register("github")}
                  placeholder="GitHub URL"
                  className="glass-input w-full px-3 py-2 text-sm focus:border-amber-300/70 focus:outline-none"
                />
                <input
                  {...register("linkedin")}
                  placeholder="LinkedIn URL"
                  className="glass-input w-full px-3 py-2 text-sm focus:border-amber-300/70 focus:outline-none"
                />
                <input
                  {...register("x")}
                  placeholder="X URL"
                  className="glass-input w-full px-3 py-2 text-sm focus:border-amber-300/70 focus:outline-none"
                />
                <input
                  {...register("email")}
                  placeholder="Kontakt e-post"
                  className="glass-input w-full px-3 py-2 text-sm focus:border-amber-300/70 focus:outline-none"
                />
              </div>
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary-amber px-5 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Sparar..." : "Spara inställningar"}
            </button>
          </form>
        </div>

        <div className="admin-surface sticky top-4 h-[90vh] overflow-hidden rounded-3xl p-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-2">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-300">Live preview</p>
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
                    previewPreset === preset.key ? "border-amber-300/70 bg-amber-400/88 text-slate-900" : "text-slate-300"
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <div ref={previewViewportRef} className="h-[calc(100%-2.5rem)] overflow-auto rounded-2xl border border-slate-600/75 bg-slate-950/70 p-2">
            <div
              style={{ width: `${previewWidth}px`, zoom: previewScale } as CSSProperties}
              className="min-h-full max-w-none origin-top-left"
            >
              <HomeHub
                settings={previewSettings}
                projects={projects}
                previewMode
                forceTouchMode={previewIsTouch}
                forcedViewportPreset={previewPreset}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
